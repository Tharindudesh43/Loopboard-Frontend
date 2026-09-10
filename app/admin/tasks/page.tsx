'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Loader2, ClipboardList, AlertCircle } from 'lucide-react';
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

function getStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'DONE':
    case 'COMPLETED':
      return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">{status}</Badge>;
    case 'IN_PROGRESS':
    case 'PROGRESS':
      return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">{status}</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>;
  }
}

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
      console.log('Fetched tasks:', data.tasks); // Debugging line
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
  const isLoading = tasksQuery.isLoading || usersQuery.isLoading;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">All Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage, reassign, and review task assignments.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tasksQuery.isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load tasks. Please try again.</span>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[30%]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-48 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="h-9 w-[160px] rounded bg-muted animate-pulse" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 ml-auto rounded bg-muted animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-muted p-3">
                      <ClipboardList className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No tasks found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        There are currently no tasks created across the workspace.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              tasks.map((task) => {
                const isDeleting = deleteMutation.isPending && deleteMutation.variables === task._id;
                const isReassigning = reassignMutation.isPending && reassignMutation.variables?.taskId === task._id;

                return (
                  <TableRow key={task._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {task.creator?.name ?? 'System'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          disabled={isReassigning}
                          value={task.assignedUser?._id ?? 'unassigned'}
                          onValueChange={(value) =>
                            reassignMutation.mutate({
                              taskId: task._id,
                              userId: value === 'unassigned' ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="w-[160px] h-9">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              <span className="text-muted-foreground">Unassigned</span>
                            </SelectItem>
                            {users.map((u) => (
                              <SelectItem key={u._id} value={u._id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isReassigning && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete task</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &quot;{task.title}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove the task.
                            </AlertDialogDescription>
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
                );
              })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}