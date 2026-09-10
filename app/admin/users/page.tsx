'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import axiosClient from '../../../lib/axiosClient';
import { getErrorMessage } from '../../../lib/errors';
import type { User } from '../../../lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ users: User[] }>('/api/users');
      return data.users;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => axiosClient.delete(`/api/users/${userId}`),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Deleting a user can unassign or remove tasks server-side, so the
      // task list needs refetching too.
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not delete user')),
  });

  const users = usersQuery.data ?? [];

  return (
    <section>
      <h1 className="font-heading text-2xl font-semibold mb-4">Users</h1>
      {usersQuery.isLoading && <p className="text-muted-foreground">Loading users…</p>}
      {usersQuery.isError && <p className="text-destructive">Failed to load users.</p>}
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {/* Admin accounts can't be deleted — the backend blocks it
                    too, but there's no point showing a button that will
                    always 403. */}
                {u.role === 'USER' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {u.name}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {u.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This also deletes any tasks they created and unassigns them from
                          anything they&apos;re currently assigned to. This can&apos;t be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(u._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && !usersQuery.isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No users yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </section>
  );
}
