'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';
import axiosClient from '../../../lib/axiosClient';
import { getErrorMessage } from '../../../lib/errors';
import type { Project, User } from '../../../lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
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

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberPick, setMemberPick] = useState<Record<string, string>>({});

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ projects: Project[] }>('/api/projects');
      return data.projects;
    },
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ users: User[] }>('/api/users');
      return data.users;
    },
  });

  const projects = projectsQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: () => axiosClient.post('/api/projects', { name, description }),
    onSuccess: () => {
      setName('');
      setDescription('');
      setCreateOpen(false);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not create project')),
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => axiosClient.delete(`/api/projects/${projectId}`),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not delete project')),
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      axiosClient.post(`/api/projects/${projectId}/members`, { userId }),
    onSuccess: (_data, vars) => {
      setError('');
      setMemberPick((prev) => ({ ...prev, [vars.projectId]: '' }));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not grant access')),
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      axiosClient.delete(`/api/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => setError(getErrorMessage(err, 'Could not revoke access')),
  });

  function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  }

  if (projectsQuery.isLoading) return <p className="text-muted-foreground">Loading projects…</p>;
  if (projectsQuery.isError) return <p className="text-destructive">Failed to load projects.</p>;

  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="font-heading text-2xl font-semibold">Projects</h1>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1.5" /> New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">New project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional"
                />
              </div>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {getErrorMessage(createMutation.error, 'Could not create project')}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating…' : 'Create project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Created by</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Grant access</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const nonMembers = users.filter(
                (u) => !project.members.some((m) => m._id === u._id)
              );
              return (
                <TableRow key={project._id}>
                  <TableCell className="font-medium">
                    {project.name}
                    {project.description && (
                      <p className="text-xs text-muted-foreground font-normal">
                        {project.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.createdBy?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {project.members.map((m) => (
                        <Badge key={m._id} variant="secondary" className="gap-1">
                          {m.name}
                          <button
                            type="button"
                            aria-label={`Remove ${m.name}`}
                            className="hover:text-destructive"
                            onClick={() =>
                              removeMemberMutation.mutate({
                                projectId: project._id,
                                userId: m._id,
                              })
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {project.members.length === 0 && (
                        <span className="text-xs text-muted-foreground">No members</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {nonMembers.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={memberPick[project._id] ?? ''}
                          onValueChange={(v) =>
                            setMemberPick((prev) => ({ ...prev, [project._id]: v }))
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {nonMembers.map((u) => (
                              <SelectItem key={u._id} value={u._id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!memberPick[project._id] || addMemberMutation.isPending}
                          onClick={() =>
                            addMemberMutation.mutate({
                              projectId: project._id,
                              userId: memberPick[project._id],
                            })
                          }
                        >
                          <UserPlus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Everyone has access</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete {project.name}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &quot;{project.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes the project and every task in it, for all
                            members. This can&apos;t be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(project._id)}
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
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No projects yet. Create one with the button above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
