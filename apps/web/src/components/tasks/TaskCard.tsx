'use client';

import * as React from 'react';
import { MoreHorizontal, Calendar, CheckSquare, GripVertical } from 'lucide-react';
import { Task } from '@taskly/shared-types';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { formatDate, cn } from '@/lib/utils';

export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete?: (id: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => onEdit(task)}
      className={cn(
        'group relative flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all duration-150 hover:border-border/80 hover:shadow-md cursor-pointer select-none',
        isDragging && 'opacity-40 border-dashed border-accent scale-95'
      )}
    >
      {/* Card Header & Title */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
          <h4 className="text-sm font-semibold tracking-tight text-foreground line-clamp-2 leading-snug">
            {task.title}
          </h4>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-all shrink-0"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Description preview if present */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-5">
          {task.description}
        </p>
      )}

      {/* Footer Metadata */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 mt-0.5">
        {/* Assignee & Tags */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <Avatar 
                name={task.assignee?.name || 'Unassigned'} 
                size="sm" 
                color={task.assignee?.avatarColor || '#94a3b8'} 
                url={task.assignee?.avatarUrl} 
            />
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              {task.assignee?.name || 'Unassigned'}
            </span>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 overflow-hidden">
              {task.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="tag">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Due Date & Subtasks */}
        <div className="flex items-center gap-2 shrink-0">
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground" title="Subtasks">
              <CheckSquare className="h-3 w-3" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
              <Calendar className="h-3 w-3 text-red-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
