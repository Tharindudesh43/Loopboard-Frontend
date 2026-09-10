'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  TouchSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import axiosClient from '../lib/axiosClient';
import { getErrorMessage } from '../lib/errors';
import Column from './Column';
import AddTaskDialog from './AddTaskDialog';
import type { Project, Task, TaskStatus } from '../lib/types';


const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'To Do' },
  { key: 'DOING', label: 'Doing' },
  { key: 'DONE', label: 'Done' },
];

export default function Board() {
  const queryClient = useQueryClient();
  const [dragError, setDragError] = useState('');
  const [projectId, setProjectId] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
    activationConstraint: { delay: 50, tolerance: 8 },
  })
  );

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ projects: Project[] }>('/api/projects');
      return data.projects;
    },
  });

  const projects = projectsQuery.data ?? [];

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0]._id);
    }
  }, [projects, projectId]);

  const {
    data,
    isLoading,
    isError,
    error: tasksError,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ tasks: Task[] }>('/api/tasks', {
        params: { projectId },
      });
      return data.tasks;
    },
    enabled: !!projectId,
  });

  const tasks = data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      axiosClient.patch(`/api/tasks/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = queryClient.getQueryData<Task[]>(['tasks', projectId]);
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t._id === id ? { ...t, status } : t))
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks', projectId], context.previous);
      }
      setDragError(getErrorMessage(err, 'Could not move task'));
    },
    onSuccess: () => setDragError(''),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Track which task is being dragged so it can be rendered in the
  // DragOverlay below — this is what makes the drag feel smooth on
  // mobile, since the overlay card floats in its own layer instead of
  // being transformed while still sitting inside the scrolling column.
  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t._id === String(event.active.id));
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t._id === taskId);

    if (!task || task.status === newStatus) return;

    statusMutation.mutate({ id: taskId, status: newStatus });
  }

  if (projectsQuery.isLoading) {
    return <p className="text-muted-foreground">Loading projects…</p>;
  }
  if (projectsQuery.isError) {
    return (
      <p className="text-destructive">
        Failed to load projects. {getErrorMessage(projectsQuery.error, 'Please try again.')}
      </p>
    );
  }
  if (projects.length === 0) {
    return (
      <p className="text-muted-foreground">
        No projects yet. Ask an admin to create a project and add you as a member.
      </p>
    );
  }
  if (isLoading) return <p className="text-muted-foreground">Loading board…</p>;
  if (isError) {
    return (
      <p className="text-destructive">
        Failed to load tasks. {getErrorMessage(tasksError, 'Please try again.')}
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
          aria-label="Select project"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <AddTaskDialog projectId={projectId} />
      </div>

      {dragError && <p className="text-sm text-destructive mb-2">{dragError}</p>}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:overflow-x-auto">
          {COLUMNS.map(({ key, label }) => (
            <Column
              key={key}
              id={key}
              title={label}
              tasks={tasks.filter((t) => t.status === key)}
              projectId={projectId}
            />
          ))}
        </div>

        {/* Deliberately a plain div, not <TaskCard>, so we don't register
            a second useDraggable with the same task id. */}
        <DragOverlay>
          {activeTask && (
            <div className="rounded-lg border bg-card shadow-lg p-3 w-[260px] rotate-2 opacity-95">
              <p className="font-medium text-sm leading-snug">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}