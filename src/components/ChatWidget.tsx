import React, { useState, useRef, useEffect } from 'react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

// Stub chat API - will be replaced with real API later
async function sendChatMessage(messages: Message[]): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Placeholder response
  const responses = [
    "I understand. Let me help you think through this step by step. Remember, I can't give legal advice, but I can explain the process.",
    "That's a good question. The employment tribunal process has several steps. The most important thing right now is to check your time limits.",
    "I hear you. Many people find this stressful. Let's break it down into smaller steps. First, have you contacted ACAS yet?",
    "Thank you for sharing. To help you best, I need to understand: when did this situation first happen?",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Web Speech API helpers
function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return { speak, stop, isSpeaking };
}

function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';
      
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
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

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
  
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
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

    try {
      const response = await sendChatMessage([...messages, userMessage]);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('errors.somethingWrong'),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
                      onClick={() => isSpeaking ? stop() : speak(message.content)}
                      aria-label={isSpeaking ? t('chat.stop') : t('chat.readAloud')}
                    >
                      {isSpeaking ? (
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

// Web Speech API types are handled via 'any' casting above
