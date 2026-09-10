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
    accent: 'bg-[#3B82F6]/10 text-[#3B82F6]',
  },
  {
    icon: Users2,
    title: 'Pick up work',
    description: "Self-assign anything that's unassigned, or let an admin route work to the right person.",
    accent: 'bg-[#7C5CFF]/10 text-[#7C5CFF]',
  },
  {
    icon: MoveRight,
    title: 'Drag to update',
    description: 'Move a card between columns and its status updates instantly for everyone.',
    accent: 'bg-[#2DD4BF]/10 text-[#2DD4BF]',
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
        className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full  animate-blob"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-24 -right-20 h-64 w-64 rounded-full  animate-blob"
        style={{ animationDelay: '2s' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-10 left-1/3 h-56 w-56 rounded-full  animate-blob"
        style={{ animationDelay: '4s' }}
        aria-hidden
      />

      <section className="relative mx-auto max-w-2xl px-4 pt-14 pb-16 sm:pt-20 sm:pb-20 text-center">
        <span className="inline-block rounded-full border bg-[#3B82F6]/10 px-3 py-1 text-xs font-medium text-[#60A5FA]">
          Your team's shared task board
        </span>

        <h1 className="mt-4 font-heading text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.15]">
          Organize work,{' '}
          <span className="bg-gradient-to-r from-[#3B82F6] via-[#7C5CFF] to-[#2DD4BF] bg-clip-text text-transparent">
            one card at a time.
          </span>
        </h1>

        <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
          A shared task board — create tasks, pick up what's unassigned, and
          move work across To Do, Doing, and Done.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <Card key={title} className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}