'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
    accent: 'bg-brand-blue/10 text-brand-blue',
  },
  {
    icon: MoveRight,
    title: 'Drag to update',
    description: 'Move a card between columns and its status updates instantly for everyone.',
    accent: 'bg-brand-teal/10 text-brand-teal',
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl animate-blob"
        aria-hidden
      />
      <div
        className="absolute top-32 -right-24 h-72 w-72 rounded-full bg-brand-violet/20 blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-brand-teal/15 blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
        aria-hidden
      />

      <header className="relative sticky top-0 z-10 backdrop-blur-md bg-background/70 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="LoopBoard"
              width={500}
              height={452}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
          </nav>
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-brand-blue to-brand-violet hover:opacity-90 text-white"
          >
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-24 space-y-6">
        <span className="inline-block rounded-full border bg-brand-blue/5 px-4 py-1 text-xs font-medium text-brand-blue animate-fade-in-up">
          Your team's shared task board
        </span>
        <h1
          className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight animate-fade-in-up"
          style={{ animationDelay: '120ms' }}
        >
          Organize work,{' '}
          <span className="bg-gradient-to-r from-brand-blue via-brand-violet to-brand-teal bg-clip-text text-transparent">
            one card at a time.
          </span>
        </h1>
        <p
          className="text-muted-foreground text-base sm:text-lg animate-fade-in-up"
          style={{ animationDelay: '240ms' }}
        >
          A shared task board — create tasks, pick up what's unassigned, and move
          work across To Do, Doing, and Done.
        </p>
        <div
          className="flex flex-col sm:flex-row justify-center gap-3 animate-fade-in-up"
          style={{ animationDelay: '360ms' }}
        >
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-brand-blue to-brand-violet hover:opacity-90 text-white"
          >
            <Link href="/register">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </section>

      <section
        id="features"
        className="relative mx-auto max-w-5xl px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {FEATURES.map(({ icon: Icon, title, description, accent }, i) => (
          <Card
            key={title}
            className="animate-fade-in-up transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${480 + i * 120}ms` }}
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
      </section>

      <footer className="relative border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <Image
            src="/logo.png"
            alt="LoopBoard"
            width={500}
            height={452}
            className="h-7 w-auto"
          />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LoopBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}