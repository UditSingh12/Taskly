'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckSquare,
  Folder,
  Plus,
  LogOut,
  ChevronDown,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Project } from '@taskly/shared-types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  projects?: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string | null) => void;
  onOpenNewProjectModal?: () => void;
}

export function Sidebar({
  isOpen = false,
  onClose,
  projects = [],
  selectedProjectId = null,
  onSelectProject,
  onOpenNewProjectModal,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Switcher Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground tracking-tight">Taskly</span>
              <span className="text-[10px] text-muted-foreground">Dexter Workspace</span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Overview
            </p>
            <button
              onClick={() => onSelectProject && onSelectProject(null)}
              className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                selectedProjectId === null
                  ? 'bg-secondary text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span>All Tasks</span>
              </div>
            </button>
          </div>

          {/* User Projects Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Projects ({projects.length})
              </p>
              {onOpenNewProjectModal && (
                <button
                  onClick={onOpenNewProjectModal}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                  title="Create Project"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="px-2 py-3 text-center rounded-xl bg-secondary/30 border border-dashed border-border">
                <p className="text-[11px] text-muted-foreground">No projects yet</p>
                {onOpenNewProjectModal && (
                  <button
                    onClick={onOpenNewProjectModal}
                    className="mt-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    + Create one
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                {projects.map((p) => {
                  const isSelected = selectedProjectId === p._id;
                  return (
                    <button
                      key={p._id}
                      onClick={() => onSelectProject && onSelectProject(p._id)}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors text-left ${
                        isSelected
                          ? 'bg-secondary text-foreground font-semibold shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.color || '#4F46E5' }}
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-background border border-border/50">
                        {p.taskCount || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User Account / Footer */}
        <div className="border-t border-border p-3 space-y-2 bg-secondary/10">
          <div className="flex items-center justify-between p-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0"
                style={{ backgroundColor: user?.avatarColor || '#4F46E5' }}
              >
                {user?.name?.charAt(0) || 'G'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.isGuest ? 'Guest Access' : user?.email || 'Logged In'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
