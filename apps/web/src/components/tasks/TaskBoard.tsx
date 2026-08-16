'use client';

import * as React from 'react';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';
import { Task, TaskStatus } from '@taskly/shared-types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

export interface TaskBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
  onDeleteTask?: (id: string) => void;
}

const COLUMNS: Array<{ status: TaskStatus; label: string; countColor: string }> = [
  { status: 'todo', label: 'To Do', countColor: 'text-slate-500 bg-slate-500/10' },
  { status: 'doing', label: 'Doing', countColor: 'text-sky-500 bg-sky-500/10' },
  { status: 'completed', label: 'Completed', countColor: 'text-emerald-500 bg-emerald-500/10' },
  { status: 'on_hold', label: 'On Hold', countColor: 'text-purple-500 bg-purple-500/10' },
];

export function TaskBoard({
  tasks,
  onEditTask,
  onAddTask,
  onMoveTask,
  onDeleteTask,
}: TaskBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<TaskStatus | null>(null);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus, targetIndex?: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      const columnTasks = getTasksByStatus(status);
      const index = targetIndex !== undefined ? targetIndex : columnTasks.length;
      onMoveTask(taskId, status, index);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start pb-8">
      {COLUMNS.map((col) => {
        const columnTasks = getTasksByStatus(col.status);
        const isColumnDragOver = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={cn(
              'flex flex-col rounded-2xl border border-border/80 bg-secondary/30 p-3 transition-colors min-h-[500px]',
              isColumnDragOver && 'border-accent/60 bg-accent/5'
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 py-1.5 mb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/60" />
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {col.label}
                </h3>
                <span className={cn('px-1.5 py-0.5 rounded-full text-xs font-semibold', col.countColor)}>
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onAddTask(col.status)}
                  className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title={`Add task to ${col.label}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2.5">
              {columnTasks.map((task, idx) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  isDragging={draggedTaskId === task._id}
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, col.status, idx);
                  }}
                />
              ))}

              {columnTasks.length === 0 && (
                <div
                  onClick={() => onAddTask(col.status)}
                  className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground hover:border-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <Plus className="h-5 w-5 mb-1 text-muted-foreground/60" />
                  <span>No tasks yet. Click to add</span>
                </div>
              )}
            </div>

            {/* Quick Add Button at bottom of column */}
            <button
              onClick={() => onAddTask(col.status)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:border-border/80 hover:bg-secondary hover:text-foreground transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
