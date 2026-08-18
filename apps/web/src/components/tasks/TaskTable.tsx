'use client';

import * as React from 'react';
import { ChevronDown, MoreHorizontal, Signal, Plus, Calendar } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@taskly/shared-types';
import { Avatar } from '../ui/Avatar';
import { formatFullDate, cn } from '@/lib/utils';

export interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDeleteTask?: (id: string) => void;
}

const GROUPS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'todo', label: 'To Do' },
  { status: 'doing', label: 'Doing' },
  { status: 'completed', label: 'Completed' },
  { status: 'on_hold', label: 'On Hold' },
];

export function TaskTable({
  tasks,
  onEditTask,
  onAddTask,
  onDeleteTask,
}: TaskTableProps) {
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({
    doing: false,
    completed: false,
    on_hold: false,
  });

  const toggleGroup = (status: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const getPriorityDisplay = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-red-500 text-xs">
            <Signal className="h-3.5 w-3.5" />
            <span>High</span>
          </div>
        );
      case 'medium':
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-amber-500 text-xs">
            <Signal className="h-3.5 w-3.5" />
            <span>Medium</span>
          </div>
        );
      case 'low':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 font-medium text-slate-400 text-xs">
            <Signal className="h-3.5 w-3.5" />
            <span>Low</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {GROUPS.map((group) => {
        const groupTasks = tasks.filter((t) => t.status === group.status);
        const isCollapsed = collapsedGroups[group.status];

        return (
          <div key={group.status} className="space-y-2">
            {/* Collapsible Section Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleGroup(group.status)}
                className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isCollapsed && '-rotate-90 text-muted-foreground'
                  )}
                />
                <span>{group.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({groupTasks.length})
                </span>
              </button>

              <button
                onClick={() => onAddTask(group.status)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Table Content */}
            {!isCollapsed && (
              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-[45%]">Task</th>
                      <th className="py-2.5 px-4 w-[18%]">Priority</th>
                      <th className="py-2.5 px-4 w-[18%]">Members</th>
                      <th className="py-2.5 px-4 w-[14%]">Due Date</th>
                      <th className="py-2.5 px-3 w-[5%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {groupTasks.map((task) => (
                      <tr
                        key={task._id}
                        onClick={() => onEditTask(task)}
                        className="group hover:bg-secondary/40 transition-colors cursor-pointer"
                      >
                        {/* Task Title */}
                        <td className="py-3 px-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{task.title}</span>
                            {task.tags && task.tags.length > 0 && (
                              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded hidden sm:inline">
                                #{task.tags[0]}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4">
                          {getPriorityDisplay(task.priority)}
                        </td>

                        {/* Members */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={task.assignee?.name || 'Unassigned'}
                              size="sm"
                              color={task.assignee?.avatarColor || '#94a3b8'}
                              url={task.assignee?.avatarUrl}
                            />
                            <span className="text-xs text-muted-foreground truncate">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatFullDate(task.dueDate)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className="p-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {groupTasks.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 px-4 text-center text-xs text-muted-foreground"
                        >
                          No tasks in {group.label}. Click "+ Add Task" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
