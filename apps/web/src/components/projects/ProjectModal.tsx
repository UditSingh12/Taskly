'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Layers, Rocket, Sparkles, Code2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project, CreateProjectInput } from '@taskly/shared-types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (data: CreateProjectInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const PROJECT_COLORS = [
  '#4F46E5', // Indigo
  '#0284C7', // Sky Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Rose
  '#7C3AED', // Violet
  '#0D9488', // Teal
  '#475569', // Slate
];

const ICONS = [
  { id: 'folder', label: 'Folder', icon: Folder },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'check', label: 'Check', icon: CheckCircle2 },
];

export function ProjectModal({
  isOpen,
  onClose,
  project,
  onSave,
  onDelete,
}: ProjectModalProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = React.useState('folder');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || PROJECT_COLORS[0]);
      setIcon(project.icon || 'folder');
    } else {
      setName('');
      setDescription('');
      setColor(PROJECT_COLORS[0]);
      setIcon('folder');
    }
    setError(null);
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a project name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        icon,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !onDelete) return;
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      setIsLoading(true);
      try {
        await onDelete(project._id);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to delete project');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: color }}
              >
                <Folder className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {project ? 'Edit Project' : 'Create New Project'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Organize tasks and track progress within a dedicated space.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Name"
              placeholder="e.g. Q3 Mobile App Launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what this project encompasses..."
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Color Theme Picker */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                Project Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                Project Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ id, icon: IconComp }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIcon(id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      icon === id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              {project && onDelete ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete Project
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isLoading}>
                  {project ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
