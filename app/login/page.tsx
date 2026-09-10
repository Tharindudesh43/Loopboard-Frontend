'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative max-w-sm mx-auto mt-16">
      <div
        className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <Card className="relative animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to see your board.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              {loading ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4">
            No account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
