'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import axiosClient from '../../../lib/axiosClient';
import { getErrorMessage } from '../../../lib/errors';
import type { Task, User } from '../../../lib/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function AdminTasksPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ users: User[] }>('/api/users');
      return data.users;
    },
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ tasks: Task[] }>('/api/tasks');
      return data.tasks;
    },
  });

  const reassignMutation = useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string | null }) =>
      axiosClient.patch(`/api/tasks/${taskId}/assign`, { userId }),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not reassign task')),
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => axiosClient.delete(`/api/tasks/${taskId}`),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not delete task')),
  });

  const users = usersQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  return (
    <section>
      <h1 className="font-heading text-2xl font-semibold mb-4">All tasks</h1>
      {tasksQuery.isLoading && <p className="text-muted-foreground">Loading tasks…</p>}
      {tasksQuery.isError && <p className="text-destructive">Failed to load tasks.</p>}
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created by</TableHead>
            <TableHead>Assigned to</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task._id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{task.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{task.creator.name}</TableCell>
              <TableCell>
                <Select
                  value={task.assignedUser?._id ?? 'unassigned'}
                  onValueChange={(value) =>
                    reassignMutation.mutate({
                      taskId: task._id,
                      userId: value === 'unassigned' ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete task</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &quot;{task.title}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(task._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && !tasksQuery.isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No tasks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </section>
  );
}
