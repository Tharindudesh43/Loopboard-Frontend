'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Users, ListTodo, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';

const ADMIN_LINKS = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tasks', label: 'All tasks', icon: ListTodo },
  { href: '/admin/board', label: 'Board', icon: LayoutDashboard },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Single route guard for every /admin/* page — enforced server-side too
  // (requireAdmin on the users/tasks endpoints), this just avoids a page
  // flash before the redirect happens.
  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [initializing, user, router]);

  if (initializing || !user || user.role !== 'ADMIN') {
    return <p className="text-center text-muted-foreground mt-10">Loading…</p>;
  }

  return (
    <div>
      {/* Mobile: horizontal tabs instead of a sidebar */}
      <nav className="flex sm:hidden gap-2 overflow-x-auto pb-3 mb-4 border-b">
        {ADMIN_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors',
              pathname === href
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex gap-8">
        <aside className="w-48 shrink-0 hidden sm:block">
          <nav className="space-y-1 sticky top-20">
            {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  pathname === href
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
