'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import ThemeProvider from '../components/ThemeProvider';

export default function Providers({ children }: { children: ReactNode }) {
  // useState (not a plain module-level constant) so the QueryClient
  // survives re-renders but isn't shared across separate users' requests.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
