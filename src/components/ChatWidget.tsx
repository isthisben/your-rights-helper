import React, { useState, useRef, useEffect, useCallback } from 'react';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { ContactHumanButton } from '@/components/ContactHumanButton';
import { logger } from '@/lib/logger';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Get chat URL - uses Vercel API route
function getChatUrl(): string {
  // In production, use the Vercel deployment URL
  // In development, Vite proxy will handle it
  const apiUrl = import.meta.env.VITE_API_URL || '/api/chat';
  return apiUrl;
}

// Language code to BCP 47 mapping for speech recognition
const LANG_TO_BCP47: Record<string, string> = {
  'en-A2': 'en-GB',
  'cy': 'cy-GB',
  'pl': 'pl-PL',
  'ur': 'ur-PK',
  'pa': 'pa-IN',
  'bn': 'bn-BD',
  'ro': 'ro-RO',
  'ar': 'ar-SA',
};

// Stream chat with GreenPT API
async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const chatUrl = getChatUrl();
    logger.debug('Making request to:', chatUrl);
    logger.debug('Messages count:', messages.length);
    
    const resp = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    }).catch((fetchError) => {
      // Network errors (CORS, connection refused, etc.)
      logger.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}. Please check if the API endpoint is accessible.`);
    });
    
    logger.debug('Response received. Status:', resp.status, 'OK:', resp.ok);
    logger.debug('Content-Type:', resp.headers.get('content-type'));

    if (!resp.ok) {
      let errorText = 'Unknown error';
      let errorMessage = '';
      try {
        const errorData = await resp.json();
        errorText = errorData.error || errorData.message || errorData.details || JSON.stringify(errorData);
        errorMessage = errorData.message || errorData.error || '';
      } catch {
        try {
          errorText = await resp.text();
        } catch {
          errorText = `HTTP ${resp.status}`;
        }
      }
      
      // Provide specific error messages for common issues
      if (resp.status === 401 || resp.status === 403) {
        throw new Error(errorMessage || 'Invalid API key. Please check your Vercel environment variables.');
      }
      
      throw new Error(errorMessage || errorText);
    }

    if (!resp.body) {
      throw new Error('No response body from chat service');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let receivedAnyContent = false;
    let totalBytes = 0;
    let lineCount = 0;

    logger.debug('Starting to read stream, content-type:', resp.headers.get('content-type'));

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        logger.debug('Stream reading completed. Total bytes:', totalBytes, 'Buffer length:', textBuffer.length, 'Lines processed:', lineCount);
        break;
      }
      
      if (!value) {
        continue;
      }
      
      totalBytes += value.length;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        textBuffer += chunk;
        // Log first chunk to see what we're receiving
        if (totalBytes === value.length) {
          logger.debug('First chunk from API (first 500 chars):', chunk.substring(0, 500));
        }
      }

      // Process complete lines
      const lines = textBuffer.split('\n');
      textBuffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Skip SSE comments
        if (trimmedLine.startsWith(':')) {
          logger.debug('Skipping SSE comment:', trimmedLine.substring(0, 50));
          continue;
        }

        // Handle SSE data format
        if (trimmedLine.startsWith('data: ')) {
          const jsonStr = trimmedLine.slice(6).trim();
          
          if (jsonStr === '[DONE]') {
            logger.debug('Received [DONE] marker');
            continue;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Try different response formats
            let content: string | undefined;
            
            // OpenAI streaming format: choices[0].delta.content
            content = parsed.choices?.[0]?.delta?.content;
            
            // OpenAI non-streaming format: choices[0].message.content
            if (!content) {
              content = parsed.choices?.[0]?.message?.content;
            }
            
            // Direct content field
            if (!content && typeof parsed.content === 'string') {
              content = parsed.content;
            }
            
            // Text field
            if (!content && typeof parsed.text === 'string') {
              content = parsed.text;
            }
            
            // Also check for finish_reason to see if stream is ending
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              logger.debug('Stream finished with reason:', finishReason);
            }

            if (content) {
              receivedAnyContent = true;
              logger.debug('✓ Received content chunk (' + content.length + ' chars):', content.substring(0, 100));
              onDelta(content);
            } else {
              // Log when we get a data line but no content
              logger.debug('⚠ Data line parsed but no content found. Structure:', {
                hasChoices: !!parsed.choices,
                choicesLength: parsed.choices?.length,
                hasDelta: !!parsed.choices?.[0]?.delta,
                hasMessage: !!parsed.choices?.[0]?.message,
                keys: Object.keys(parsed)
              });
            }
          } catch (parseError) {
            // Log parse errors to help debug
            logger.warn('❌ Failed to parse JSON. Line:', jsonStr.substring(0, 200), 'Error:', parseError);
          }
        } else {
          // Try parsing line directly as JSON (non-SSE format)
          try {
            const parsed = JSON.parse(trimmedLine);
            
            const content = parsed.choices?.[0]?.delta?.content || 
                           parsed.choices?.[0]?.message?.content ||
                           parsed.content ||
                           parsed.text;
            
            if (content) {
              receivedAnyContent = true;
              logger.debug('✓ Received content (non-SSE format):', content.substring(0, 100));
              onDelta(content);
            }
          } catch {
            // Not JSON, might be plain text - log it
            if (trimmedLine.length > 0) {
              logger.debug('⚠ Non-JSON line received:', trimmedLine.substring(0, 100));
            }
          }
        }
      }
    }

    // Process any remaining buffer
    if (textBuffer.trim()) {
      const trimmedLine = textBuffer.trim();
      
      if (trimmedLine.startsWith('data: ')) {
        const jsonStr = trimmedLine.slice(6).trim();
        if (jsonStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content || 
                           parsed.choices?.[0]?.message?.content ||
                           parsed.content ||
                           parsed.text;
            if (content) {
              receivedAnyContent = true;
              onDelta(content);
            }
          } catch { /* ignore */ }
        }
      }
    }

    if (!receivedAnyContent) {
      // Try to get more info about what went wrong
      logger.error('No content received from chat stream');
      onError('No content received from chat service. Please check:\n1. The API is deployed correctly\n2. GREENPT_API_KEY is set in Vercel\n3. The API key is valid\n\nCheck browser console for more details.');
      return;
    }

    onDone();
  } catch (error) {
    // Provide more helpful error messages
    let errorMessage = 'Failed to connect to chat service';
    if (error instanceof Error) {
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        errorMessage = `Network error: ${error.message}. Please check:\n1. The Vercel API is deployed\n2. The GREENPT_API_KEY is set in Vercel environment variables\n3. There's no CORS issue`;
      } else if (error.message.includes('Chat service not configured')) {
        errorMessage = 'The chat API is deployed but GREENPT_API_KEY is missing. Please add it in Vercel project settings.';
      } else {
        errorMessage = error.message;
      }
    }
    onError(errorMessage);
  }
}

// ElevenLabs TTS hook
function useElevenLabsTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { caseState } = useApp();

  const speak = useCallback(async (text: string) => {
    if (isSpeaking || isLoading) return;
    
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/text-to-speech';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          language: caseState.language,
          speed: caseState.accessibility.speechRate 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Get audio blob from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      setIsSpeaking(true);
      setIsLoading(false);
      await audio.play();
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to allow fallback
    }
  }, [isSpeaking, isLoading, caseState.language, caseState.accessibility.speechRate]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, isLoading };
}

// Web Speech API TTS fallback
function useWebSpeechTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { caseState } = useApp();

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = caseState.accessibility.speechRate;
      utterance.lang = LANG_TO_BCP47[caseState.language] || 'en-GB';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [caseState.accessibility.speechRate, caseState.language]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking };
}

// Combined TTS hook with ElevenLabs primary and Web Speech fallback
function useSpeechSynthesis() {
  const { caseState } = useApp();
  const elevenLabs = useElevenLabsTTS();
  const webSpeech = useWebSpeechTTS();
  const [activeTTS, setActiveTTS] = useState<'elevenlabs' | 'webspeech' | null>(null);

  const speak = useCallback(async (text: string) => {
    if (caseState.accessibility.useElevenLabs) {
      try {
        setActiveTTS('elevenlabs');
        await elevenLabs.speak(text);
      } catch {
        // Fallback to Web Speech API
        setActiveTTS('webspeech');
        webSpeech.speak(text);
      }
    } else {
      setActiveTTS('webspeech');
      webSpeech.speak(text);
    }
  }, [caseState.accessibility.useElevenLabs, elevenLabs, webSpeech]);

  const stop = useCallback(() => {
    elevenLabs.stop();
    webSpeech.stop();
    setActiveTTS(null);
  }, [elevenLabs, webSpeech]);

  const isSpeaking = elevenLabs.isSpeaking || webSpeech.isSpeaking;
  const isLoading = elevenLabs.isLoading;

  return { speak, stop, isSpeaking, isLoading };
}

// Speech recognition hook with language awareness
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const { caseState } = useApp();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = LANG_TO_BCP47[caseState.language] || 'en-GB';
      
      recognition.onresult = (event: { results: { length: number; [key: number]: { [key: number]: { transcript: string } } } }) => {
        const current = event.results[event.results.length - 1];
        setTranscript(current[0].transcript);
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [caseState.language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      // Update language before starting
      recognitionRef.current.lang = LANG_TO_BCP47[caseState.language] || 'en-GB';
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [caseState.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in (window as any);

  return { startListening, stopListening, isListening, transcript, supported };
}

// Generate check-in prompts based on journey progress
function getCheckInPrompts(caseState: ReturnType<typeof useApp>['caseState']): string[] {
  const prompts: string[] = [];
  const progress = caseState.journeyProgress || {};
  
  // If ACAS started but not completed, check in about certificate
  if (caseState.acasStatus === 'started' && !progress.acas?.completed) {
    prompts.push(t('journey.checkIn.acasComplete'));
  }
  
  // If ACAS completed but ET1 not submitted
  if (progress.acas?.completed && !progress.et1?.completed) {
    prompts.push(t('journey.checkIn.et1Submitted'));
  }
  
  // If preparing witness statements
  if (progress.caseManagement?.completed && !progress.witness?.completed) {
    prompts.push(t('journey.checkIn.witnessStatement'));
    prompts.push(t('journey.checkIn.scheduleOfLoss'));
  }
  
  // If hearing is coming up
  if (progress.witness?.completed && !progress.hearing?.completed) {
    prompts.push(t('journey.checkIn.hearingPrep'));
  }
  
  return prompts;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { caseState } = useApp();
  
  // Generate initial message with check-in prompts
  const getInitialMessages = (): Message[] => {
    const checkInPrompts = getCheckInPrompts(caseState);
    let greeting = t('chat.greeting') + '\n\n' + t('chat.disclaimer');
    
    if (checkInPrompts.length > 0) {
      greeting += '\n\n' + checkInPrompts.join('\n');
    }
    
    return [{
      id: '1',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }];
  };
  
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { speak, stop, isSpeaking, isLoading: ttsLoading } = useSpeechSynthesis();
  const { startListening, stopListening, isListening, transcript, supported: sttSupported } = useSpeechRecognition();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-read new assistant messages
  const lastMessageRef = useRef<string | null>(null);
  useEffect(() => {
    if (caseState.accessibility.autoReadMessages) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage && 
        lastMessage.role === 'assistant' && 
        lastMessage.id !== lastMessageRef.current &&
        !lastMessage.id.startsWith('streaming-')
      ) {
        lastMessageRef.current = lastMessage.id;
        speak(lastMessage.content);
      }
    }
  }, [messages, caseState.accessibility.autoReadMessages, speak]);

  // Refs for managing streaming state (outside handleSend to persist across renders)
  const assistantContentRef = useRef('');
  const streamingMessageIdRef = useRef<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset refs for new message
    assistantContentRef.current = '';
    streamingMessageIdRef.current = null;
    
    const updateAssistantMessage = (chunk: string) => {
      assistantContentRef.current += chunk;
      setMessages(prev => {
        // Find existing streaming message
        const streamingIndex = prev.findIndex(m => m.id === streamingMessageIdRef.current);
        
        if (streamingIndex !== -1) {
          // Update existing streaming message
          return prev.map((m, i) => 
            i === streamingIndex 
              ? { ...m, content: assistantContentRef.current }
              : m
          );
        } else {
          // Create new streaming message
          const newId = 'streaming-' + Date.now();
          streamingMessageIdRef.current = newId;
          return [...prev, {
            id: newId,
            role: 'assistant' as const,
            content: assistantContentRef.current,
            timestamp: new Date(),
          }];
        }
      });
    };

    const chatMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    await streamChat({
      messages: chatMessages,
      onDelta: updateAssistantMessage,
      onDone: () => {
        setIsLoading(false);
        // Update the streaming message to have a permanent ID
        const finalId = Date.now().toString();
        setMessages(prev => prev.map(m => 
          m.id === streamingMessageIdRef.current 
            ? { ...m, id: finalId } 
            : m
        ));
        // Reset refs
        assistantContentRef.current = '';
        streamingMessageIdRef.current = null;
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: t('errors.somethingWrong'),
          description: error,
        });
        // Add error message if no content was streamed
        if (!assistantContentRef.current) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: t('errors.somethingWrong'),
            timestamp: new Date(),
          }]);
        }
        // Reset refs
        assistantContentRef.current = '';
        streamingMessageIdRef.current = null;
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg',
          isOpen && 'hidden'
        )}
        aria-label={t('chat.title')}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div 
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[600px] bg-card border border-border rounded-xl shadow-xl flex flex-col animate-slide-in"
          role="dialog"
          aria-label={t('chat.title')}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t('chat.title')}</h2>
            </div>
            <div className="flex items-center gap-1">
              <ContactHumanButton variant="ghost" size="icon" showLabel={false} />
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label={t('common.close')}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-status-warning-bg border-b border-status-warning-border">
            <p className="text-xs text-status-warning flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {t('chat.disclaimer')}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 text-xs"
                      onClick={() => handleSpeak(message.content)}
                      disabled={ttsLoading}
                      aria-label={isSpeaking ? t('chat.stop') : t('chat.readAloud')}
                    >
                      {ttsLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          {t('common.loading')}
                        </>
                      ) : isSpeaking ? (
                        <>
                          <VolumeX className="h-3 w-3 mr-1" />
                          {t('chat.stop')}
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 mr-1" />
                          {t('chat.readAloud')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">{t('chat.thinking')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                className="flex-1 min-h-[44px] max-h-24 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t('chat.placeholder')}
                rows={1}
              />
              {sttSupported && (
                <Button
                  variant={isListening ? 'destructive' : 'outline'}
                  size="icon"
                  onClick={isListening ? stopListening : startListening}
                  aria-label={isListening ? t('chat.stop') : t('chat.listen')}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              )}
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label={t('chat.send')}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
