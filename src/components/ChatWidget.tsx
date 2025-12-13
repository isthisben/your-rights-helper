import React, { useState, useRef, useEffect, useCallback } from 'react';
import { t, getLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

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
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) {
      throw new Error('No response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Incomplete JSON, put it back
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Failed to connect to chat service');
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
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          language: caseState.language,
          speed: caseState.accessibility.speechRate 
        },
      });

      if (error) throw error;

      // Create audio from the response
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
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
      console.error('ElevenLabs TTS error:', error);
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
        console.log('Falling back to Web Speech API');
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

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('chat.greeting') + '\n\n' + t('chat.disclaimer'),
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { caseState } = useApp();
  
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

    let assistantContent = '';
    
    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: 'streaming-' + Date.now(),
          role: 'assistant' as const,
          content: assistantContent,
          timestamp: new Date(),
        }];
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
        setMessages(prev => prev.map(m => 
          m.id.startsWith('streaming-') ? { ...m, id: Date.now().toString() } : m
        ));
      },
      onError: (error) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: t('errors.somethingWrong'),
          description: error,
        });
        // Add error message if no content was streamed
        if (!assistantContent) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: t('errors.somethingWrong'),
            timestamp: new Date(),
          }]);
        }
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
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label={t('common.close')}>
              <X className="h-5 w-5" />
            </Button>
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
