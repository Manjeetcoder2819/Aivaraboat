'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    user_id: "00000000-0000-0000-0000-000000000001",
    email: "doctor.admin@aivara.ai",
    full_name: "Aivara Demo User",
    token: "mock-token"
  });
  const [loading, setLoading] = useState(false);

  // Initialize auth state (Bypassed)
  useEffect(() => {
    // Auth check bypassed for testing
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login response
      const mockToken = "mock-token";
      localStorage.setItem('aivara_token', mockToken);
      setUser({
        user_id: "00000000-0000-0000-0000-000000000001",
        email: email || "doctor.admin@aivara.ai",
        full_name: "Aivara Demo User",
        token: mockToken
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // Mock signup response
      const mockToken = "mock-token";
      localStorage.setItem('aivara_token', mockToken);
      const mockData = {
        user_id: "00000000-0000-0000-0000-000000000001",
        email: email || "doctor.admin@aivara.ai",
        full_name: fullName || "Aivara Demo User",
        access_token: mockToken
      };
      setUser({
        user_id: mockData.user_id,
        email: mockData.email,
        full_name: mockData.full_name,
        token: mockData.access_token
      });
      return mockData;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('aivara_token');
  };

  const getToken = () => {
    return user?.token || localStorage.getItem('aivara_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
