'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Folder, CheckSquare, Plus, LogOut, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/hooks/useAuth';
import { Task, Project } from '@taskly/shared-types';

export function CommandPalette() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch data when open
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        api.getTasks(),
        api.getProjects()
      ]).then(([tasksRes, projectsRes]) => {
        setTasks(tasksRes.tasks);
        setProjects(projectsRes.projects);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [open]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => setOpen(false)}
      />
      
      <Command 
        className="relative z-50 flex h-full w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl sm:h-auto animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            {loading ? 'Loading...' : 'No results found.'}
          </Command.Empty>

          <Command.Group heading="Suggestions" className="px-2 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/dashboard'))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-secondary aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-secondary transition-colors mt-1"
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Go to Dashboard</span>
            </Command.Item>
            {user?.role === 'admin' && (
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/admin'))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-secondary aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-secondary transition-colors"
              >
                <Folder className="mr-2 h-4 w-4" />
                <span>Go to Admin Dashboard</span>
              </Command.Item>
            )}
            <Command.Item 
              onSelect={() => runCommand(() => document.documentElement.classList.toggle('dark'))}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-secondary aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-secondary transition-colors"
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Toggle Theme</span>
            </Command.Item>
          </Command.Group>

          <Command.Separator className="-mx-1 my-1 h-px bg-border" />

          {projects.length > 0 && (
            <Command.Group heading="Projects" className="px-2 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-muted-foreground">
              {projects.map(project => (
                <Command.Item
                  key={project._id}
                  value={project.name}
                  onSelect={() => runCommand(() => router.push(`/dashboard`))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-secondary aria-selected:text-foreground hover:bg-secondary transition-colors mt-1"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span>{project.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {tasks.length > 0 && (
            <Command.Group heading="Tasks" className="px-2 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-muted-foreground">
              {tasks.map(task => (
                <Command.Item
                  key={task._id}
                  value={task.title}
                  onSelect={() => runCommand(() => router.push(`/dashboard`))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-secondary aria-selected:text-foreground hover:bg-secondary transition-colors mt-1"
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>{task.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Separator className="-mx-1 my-1 h-px bg-border" />

          <Command.Group heading="Account" className="px-2 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-muted-foreground">
            <Command.Item 
              onSelect={() => runCommand(() => logout())}
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-destructive/20 text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-destructive/10 transition-colors mt-1"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
