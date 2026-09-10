'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The old single-file admin dashboard has been split into /admin/users,
// /admin/tasks, and /admin/board (see app/admin/layout.tsx for the sidebar
// and the shared route guard). This keeps the bare /admin link — used by
// the navbar's account dropdown — pointing somewhere useful.
export default function AdminIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return null;
}
