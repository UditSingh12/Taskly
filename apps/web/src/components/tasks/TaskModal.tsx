'use client';

import * as React from 'react';
import {
  Calendar,
  Tag,
  User as UserIcon,
  CheckCircle2,
  Trash2,
  Plus,
  X,
  Signal,
  Folder,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Subtask, Project } from '@taskly/shared-types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { formatFullDate, cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  projects?: Project[];
  defaultProjectId?: string | null;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  defaultStatus = 'todo',
  projects = [],
  defaultProjectId = null,
  onSave,
  onDelete,
}: TaskModalProps) {
  const { activeUsers } = useAuth();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<TaskStatus>('todo');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [projectId, setProjectId] = React.useState<string>('');
  const [dueDate, setDueDate] = React.useState('');
  const [assigneeId, setAssigneeId] = React.useState<string>('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = React.useState('');
  const [comments, setComments] = React.useState<import('@taskly/shared-types').Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setProjectId(task.projectId || '');
      setAssigneeId(task.assignee?._id || '');
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      );
      import('@/lib/api-client').then(({ api }) => {
        api.getComments(task._id).then(res => setComments(res.comments)).catch(() => {});
      });
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setProjectId(defaultProjectId || (projects[0]?._id || ''));
      setAssigneeId('');
      setDueDate('');
      setTags(['Deployment']);
      setSubtasks([]);
    }
  }, [task, defaultStatus, defaultProjectId, projects, isOpen]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        { id: `st-${Date.now()}`, title: subtaskInput.trim(), completed: false },
      ]);
      setSubtaskInput('');
    }
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setIsSubmittingComment(true);
    try {
      const { api } = await import('@/lib/api-client');
      const res = await api.createComment(task._id, { body: newComment.trim() });
      setComments([...comments, res.comment]);
      setNewComment('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        projectId: projectId ? projectId : undefined,
        assignee: assigneeId ? { _id: assigneeId, name: '', avatarColor: '' } as any : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags,
        subtasks,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task?._id || !onDelete) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await onDelete(task._id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>Tasks</span>
          <span>/</span>
          <span className="text-foreground">{task ? 'Edit Task' : 'New Task'}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            autoFocus
            required
          />
        </div>

        {/* Notion-Style Properties Grid */}
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/80 bg-secondary/30 p-4 text-xs">
          {/* Status Property */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-28 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Status</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['todo', 'doing', 'completed', 'on_hold'] as TaskStatus[]).map((s) => {
                const labels: Record<TaskStatus, string> = {
                  todo: 'To Do',
                  doing: 'Doing',
                  completed: 'Completed',
                  on_hold: 'On Hold',
                };
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-colors border',
                      status === s
                        ? 'bg-foreground text-background border-foreground font-semibold shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Property */}
          {projects.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-28 text-muted-foreground">
                <Folder className="h-3.5 w-3.5" />
                <span>Project</span>
              </div>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="bg-card border border-border rounded-md px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">General (No Project)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority Property */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-28 text-muted-foreground">
              <Signal className="h-3.5 w-3.5" />
              <span>Priority</span>
            </div>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                const colors: Record<TaskPriority, string> = {
                  high: 'text-red-500 border-red-500/30 bg-red-500/10',
                  medium: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
                  low: 'text-slate-500 border-slate-500/30 bg-slate-500/10',
                };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium capitalize border transition-all',
                      priority === p
                        ? cn(colors[p], 'font-semibold ring-1 ring-offset-1')
                        : 'bg-card text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee Property */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-28 text-muted-foreground">
              <UserIcon className="h-3.5 w-3.5" />
              <span>Assignee</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar 
                name={activeUsers.find(u => u.id === assigneeId)?.name || 'Unassigned'} 
                color={activeUsers.find(u => u.id === assigneeId)?.avatarColor}
                size="sm" 
              />
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="bg-card border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Unassigned</option>
                {activeUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} {u.jobTitle ? `— ${u.jobTitle}` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date Property */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-28 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due Date</span>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-card border border-border rounded-md px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Tags Property */}
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 w-28 text-muted-foreground pt-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-xs border border-border"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-20 py-0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Markdown Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Description
          </label>
          <textarea
            placeholder="Add details, notes, or implementation specifics..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed resize-none"
          />
        </div>

        {/* Subtasks / Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground">
              Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
          </div>

          <div className="space-y-1.5">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-xs"
              >
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span
                    className={cn(
                      'text-foreground',
                      st.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {st.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Add checklist item..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="h-8 text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSubtask}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        {task && task.activity && task.activity.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              Activity Timeline
            </label>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pl-8 pt-2">
              {task.activity.slice().reverse().map((act, i) => {
                let text = '';
                switch (act.type) {
                  case 'created': text = 'created this task'; break;
                  case 'status_change': text = `changed status to ${act.toValue?.replace('_', ' ')}`; break;
                  case 'priority_change': text = `changed priority to ${act.toValue}`; break;
                  case 'assignee_change': text = act.toValue ? `assigned to ${act.toValue}` : 'removed assignee'; break;
                }
                return (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-secondary text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-4 -translate-x-1/2 md:static md:translate-x-0">
                      <div className="h-2 w-2 rounded-full bg-accent"></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-3 rounded border border-border/50 shadow-sm text-xs text-foreground">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{act.actorId}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">{text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments Section */}
        {task && (
          <div className="space-y-4 pt-4 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              Comments ({comments.length})
            </label>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar name={comment.author.name} url={comment.author.avatarUrl} color={comment.author.avatarColor} size="sm" />
                  <div className="flex-1 bg-secondary/30 rounded-lg p-3 text-sm text-foreground border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{comment.author.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-start pt-2">
              <Avatar name={activeUsers.find(u => u.isCurrentUser)?.name || 'Me'} size="sm" />
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(e as any);
                    }
                  }}
                  className="w-full text-sm p-2 rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none min-h-[60px]"
                />
                <div className="self-end">
                  <Button type="button" onClick={handleCommentSubmit} size="sm" isLoading={isSubmittingComment} disabled={!newComment.trim()}>
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            {task && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-600 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Task</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
