'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Board from '../../components/Board';

export default function DashboardPage() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.replace('/login');
    }
  }, [initializing, user, router]);

  if (initializing || !user) {
    return <p className="text-center text-gray-500 mt-10">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Task Board</h1>
      <Board />
    </div>
  );
}
