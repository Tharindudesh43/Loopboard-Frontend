'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axiosClient from '../lib/axiosClient';
import type { User } from '../lib/types';

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // True until we've checked localStorage once on mount — prevents a
  // flash-redirect to /login before we know a session actually exists.
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setInitializing(false);
  }, []);

  function persist(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email: string, password: string) {
    const { data } = await axiosClient.post<{ token: string; user: User }>('/api/auth/login', {
      email,
      password,
    });
    persist(data.token, data.user);
    return data.user;
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await axiosClient.post<{ token: string; user: User }>('/api/auth/register', {
      name,
      email,
      password,
    });
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  // Called after a successful PATCH /api/auth/me so the cached user
  // (both in React state and localStorage) reflects the edit immediately,
  // without needing a full re-login.
  function updateUser(updated: User) {
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
