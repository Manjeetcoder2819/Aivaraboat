'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface Source {
  document_id: string;
  filename: string | null;
  title: string | null;
  content: string;
  similarity: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Source[];
  timestamp: string;
  loading?: boolean;
  error?: boolean;
  memory_used?: boolean;
}

export interface Session {
  id: string;
  title: string | null;
  created_at: string;
}

export interface ChatContextType {
  messages: Message[];
  sessionId: string | null;
  isLoading: boolean;
  sessions: Session[];
  activeSessionTitle: string;
  chat: (text: string) => Promise<void>;
  initSession: (title?: string) => Promise<string | undefined>;
  loadSession: (sid: string) => Promise<void>;
  clearChat: () => void;
  deleteSession: (sid: string) => Promise<void>;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat sessions when user state changes
  useEffect(() => {
    async function fetchSessions() {
      try {
        const list = await api.getSessions();
        setSessions(list);
        if (list.length > 0) {
          // Load the latest session
          await loadSession(list[0].id);
        } else {
          // If no sessions, wait for user to start a chat or initialize one
          setMessages([]);
          setActiveSessionId(null);
        }
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }
    fetchSessions();
  }, [user]);

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsLoading(true);
    try {
      const data = await api.getSessionMessages(sessionId);
      const clientMessages: Message[] = data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.rag_sources || [],
        timestamp: m.created_at,
      }));
      setMessages(clientMessages);
    } catch (e) {
      console.error('Failed to load session messages:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (title: string = 'New Conversation') => {
    try {
      const newSess = await api.createSession(title);
      setSessions((prev) => [newSess, ...prev]);
      setActiveSessionId(newSess.id);
      setMessages([]);
      return newSess.id;
    } catch (e) {
      console.error('Failed to create new session:', e);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId);
        if (remaining.length > 0) {
          await loadSession(remaining[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const sid = await createSession();
      if (sid) currentSessionId = sid;
    }

    if (!currentSessionId) return;

    // 1. Add user message locally
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Add empty assistant message with loading state
    const assistantMsgId = Math.random().toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      sources: [],
      memory_used: false,
      timestamp: new Date().toISOString(),
      loading: true,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(true);

    let incomingSources: Source[] = [];
    let incomingMemoryUsed = false;
    let accumulatedContent = '';

    await api.streamChat(
      currentSessionId,
      text,
      user?.token || '',
      (event: any) => {
        if (event.type === 'metadata') {
          incomingSources = event.sources || [];
          incomingMemoryUsed = event.memory_used || false;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, sources: incomingSources, memory_used: incomingMemoryUsed }
                : m
            )
          );
        } else if (event.type === 'content') {
          accumulatedContent += event.content;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: accumulatedContent, loading: false }
                : m
            )
          );
        }
      },
      (error: any) => {
        console.error('Streaming error:', error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: 'Sorry, I encountered an error generating the response.', error: true, loading: false }
              : m
          )
        );
        setIsLoading(false);
      },
      () => {
        // Stream completed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, loading: false } : m
          )
        );
        setIsLoading(false);
        // Refresh sessions list (to update title if needed)
        api.getSessions().then((list) => setSessions(list)).catch(console.error);
      }
    );
  };

  const clearChat = () => {
    setMessages([]);
  };

  const activeSessionTitle =
    sessions.find((s) => s.id === activeSessionId)?.title || 'Aivara AI Assistant';

  return (
    <ChatContext.Provider
      value={{
        messages,
        sessionId: activeSessionId,
        isLoading,
        sessions,
        activeSessionTitle,
        chat: sendMessage,
        initSession: createSession,
        loadSession,
        clearChat,
        deleteSession,
        setSessions,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
