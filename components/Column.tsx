'use client';

import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '../lib/types';

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: 'bg-status-todo',
  DOING: 'bg-status-doing',
  DONE: 'bg-status-done',
};

const STATUS_BORDER: Record<TaskStatus, string> = {
  TODO: 'border-status-todo',
  DOING: 'border-status-doing',
  DONE: 'border-status-done',
};

export default function Column({
  id,
  title,
  tasks,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-muted/40 rounded-lg p-3 w-full sm:flex-1 sm:min-w-[260px] border-t-2 ${STATUS_BORDER[id]} transition-colors ${
        isOver ? 'ring-2 ring-primary/40 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-medium text-sm flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[id]}`} />
          {title}
        </h2>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3 min-h-[48px]">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
        {tasks.length === 0 && <p className="text-sm text-muted-foreground">Drop tasks here</p>}
      </div>
    </div>
  );
}
