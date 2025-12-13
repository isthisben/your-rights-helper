/**
 * Chat message storage utilities
 * Messages persist across page navigation but are session-based
 */

import { Message } from '@/components/ChatWidget';

const STORAGE_KEY = 'wrn-chat-messages';

export function loadChatMessages(): Message[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (e) {
    // Silently fail - will use default messages
  }
  
  return null;
}

export function saveChatMessages(messages: Message[]): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Convert to JSON-safe format (Date to ISO string)
    const serialized = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    return true;
  } catch (e) {
    // Silently fail - messages just won't persist
    return false;
  }
}

export function clearChatMessages(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

