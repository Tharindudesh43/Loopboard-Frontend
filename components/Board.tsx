'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import axiosClient from '../lib/axiosClient';
import { getErrorMessage } from '../lib/errors';
import Column from './Column';
import AddTaskDialog from './AddTaskDialog';
import type { Task, TaskStatus } from '../lib/types';

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'To Do' },
  { key: 'DOING', label: 'Doing' },
  { key: 'DONE', label: 'Done' },
];

export default function Board() {
  const queryClient = useQueryClient();
  const [dragError, setDragError] = useState('');

  // Require an 8px pointer move before a drag starts, so clicking
  // "Assign to me" (or just clicking a card) isn't misread as a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ tasks: Task[] }>('/api/tasks');
      return data.tasks;
    },
  });

  const tasks = data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      axiosClient.patch(`/api/tasks/${id}/status`, { status }),
    // Optimistic update: move the card immediately so the drag feels
    // instant, then roll back if the server rejects it.
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t._id === id ? { ...t, status } : t))
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous);
      }
      setDragError(getErrorMessage(err, 'Could not move task'));
    },
    onSuccess: () => setDragError(''),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t._id === taskId);

    if (!task || task.status === newStatus) return;

    statusMutation.mutate({ id: taskId, status: newStatus });
  }

  if (isLoading) return <p className="text-muted-foreground">Loading board…</p>;
  if (isError) return <p className="text-destructive">Failed to load tasks. Is the backend running?</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddTaskDialog />
      </div>

      {dragError && <p className="text-sm text-destructive mb-2">{dragError}</p>}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col sm:flex-row gap-4 sm:overflow-x-auto">
          {COLUMNS.map(({ key, label }) => (
            <Column
              key={key}
              id={key}
              title={label}
              tasks={tasks.filter((t) => t.status === key)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
