'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../lib/axiosClient';
import { getErrorMessage } from '../../lib/errors';
import type { User } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, initializing, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    setName(user.name);
    setPhone(user.phone);
    setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
    setGithub(user.socialLinks.github);
    setLinkedin(user.socialLinks.linkedin);
  }, [initializing, user, router]);

  const updateMutation = useMutation({
    mutationFn: () =>
      axiosClient.patch<{ user: User }>('/api/auth/me', {
        name,
        phone,
        dateOfBirth: dateOfBirth || null,
        socialLinks: { github, linkedin },
      }),
    onSuccess: ({ data }) => {
      updateUser(data.user);
      setSuccess(true);
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    if (!name.trim()) return;
    updateMutation.mutate();
  }

  if (initializing || !user) {
    return <p className="text-center text-muted-foreground mt-10">Loading…</p>;
  }

  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Your profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Mobile number</Label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-dob">Date of birth</Label>
            <Input
              id="profile-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-github">GitHub</Label>
            <Input
              id="profile-github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-linkedin">LinkedIn</Label>
            <Input
              id="profile-linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          {updateMutation.isError && (
            <p className="text-sm text-destructive">
              {getErrorMessage(updateMutation.error, 'Could not save profile')}
            </p>
          )}
          {success && <p className="text-sm text-primary">Profile updated.</p>}
          <Button type="submit" disabled={updateMutation.isPending} className="w-full">
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
