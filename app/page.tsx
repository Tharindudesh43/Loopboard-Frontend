'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ListChecks, Users2, MoveRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: ListChecks,
    title: 'Create and track',
    description: 'Add tasks with a description, then watch them move across To Do, Doing, and Done.',
    accent: 'bg-status-todo/10 text-status-todo',
  },
  {
    icon: Users2,
    title: 'Pick up work',
    description: "Self-assign anything that's unassigned, or let an admin route work to the right person.",
    accent: 'bg-primary/10 text-primary',
  },
  {
    icon: MoveRight,
    title: 'Drag to update',
    description: 'Move a card between columns and its status updates instantly for everyone.',
    accent: 'bg-status-doing/10 text-status-doing',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, initializing } = useAuth();


  useEffect(() => {
    if (!initializing && user) {
      router.replace('/dashboard');
    }
  }, [user, initializing, router]);

  if (initializing || user) {
    return <p className="text-center text-muted-foreground mt-10">Loading…</p>;
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl animate-blob"
        aria-hidden
      />
      <div
        className="absolute top-20 -right-10 h-64 w-64 rounded-full bg-status-doing/20 blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-status-todo/20 blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto py-20 text-center space-y-6">
        <h1
          className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          Organize work,{' '}
          <span className="bg-gradient-to-r from-primary to-status-doing bg-clip-text text-transparent">
            one card at a time.
          </span>
        </h1>
        <p
          className="text-muted-foreground text-lg animate-fade-in-up"
          style={{ animationDelay: '120ms' }}
        >
          A shared task board — create tasks, pick up what&apos;s unassigned, and move
          work across To Do, Doing, and Done.
        </p>
        <div
          className="flex justify-center gap-3 animate-fade-in-up"
          style={{ animationDelay: '240ms' }}
        >
          <Button size="lg" asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, description, accent }, i) => (
          <Card
            key={title}
            className="animate-fade-in-up transition-transform hover:-translate-y-1"
            style={{ animationDelay: `${360 + i * 120}ms` }}
          >
            <CardContent className="p-5 space-y-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
