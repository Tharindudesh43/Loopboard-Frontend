'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../lib/axiosClient';
import { getErrorMessage } from '../lib/errors';
import { formatRelativeDate } from '../lib/format';
import type { Task } from '../lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TaskEditDialog from './TaskEditDialog';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });



  const assignMutation = useMutation({
    mutationFn: () => axiosClient.patch(`/api/tasks/${task._id}/assign`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });


  const canSelfAssign = user?.role === 'USER' && !task.assignedUser;


  const canDrag =
    user?.role === 'ADMIN' ||
    task.creator._id === user?._id ||
    task.assignedUser?._id === user?._id;


  const style: React.CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
    touchAction: canDrag ? 'none' : undefined,
  };

  const canEdit = user?.role === 'ADMIN' || task.creator._id === user?._id;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...(canDrag ? listeners : {})}
        {...(canDrag ? attributes : {})}
        className={`shadow-none transition-all duration-200 ${canDrag ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : ''
          } ${isDragging ? 'opacity-50 shadow-md' : ''}`}
      >
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-snug">{task.title}</p>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 -mt-1 -mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit task</span>
              </Button>
            )}
          </div>

          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}

          <div className="flex justify-between items-center pt-1">
            {task.assignedUser ? (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">{initials(task.assignedUser.name)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{task.assignedUser.name}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
            {canSelfAssign && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  assignMutation.mutate();
                }}
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending ? 'Assigning…' : 'Assign to me'}
              </Button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground/70">
            Created {formatRelativeDate(task.createdAt)}
            {task.updatedAt !== task.createdAt && ` · Updated ${formatRelativeDate(task.updatedAt)}`}
          </p>

          {assignMutation.isError && (
            <p className="text-xs text-destructive">
              {getErrorMessage(assignMutation.error, 'Could not assign task')}
            </p>
          )}
        </CardContent>
      </Card>

      {canEdit && (
        <TaskEditDialog task={task} projectId={projectId} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </>
  );
}
