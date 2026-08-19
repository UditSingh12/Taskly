'use client';

import * as React from 'react';
import {
  Menu,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { TaskPriority, TaskStatus } from '@taskly/shared-types';
import { ProfileModal } from '@/components/profile/ProfileModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onAddTask?: () => void;
  currentView: 'board' | 'table';
  onViewChange: (view: 'board' | 'table') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority?: TaskPriority;
  onPriorityChange: (p?: TaskPriority) => void;
  selectedStatus?: TaskStatus;
  onStatusChange: (s?: TaskStatus) => void;
}

export function Header({
  onToggleSidebar,
  onAddTask,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
}: HeaderProps) {
  const { user, activeUsers, logout } = useAuth();
  const [showActiveUsersDropdown, setShowActiveUsersDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpenProfile = () => setIsProfileModalOpen(true);
    document.addEventListener('open-profile-modal', handleOpenProfile);
    return () => document.removeEventListener('open-profile-modal', handleOpenProfile);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col border-b border-border bg-background/80 backdrop-blur-md">
      {/* Top Navbar */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              suppressHydrationWarning
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground tracking-tight">
              Tasks
            </h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Active Users Presence Avatars */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowActiveUsersDropdown(!showActiveUsersDropdown)}
              className="flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 hover:bg-secondary py-1 px-2.5 transition-all text-xs font-medium text-muted-foreground hover:text-foreground"
              title="Real-time Collaborators"
            >
              <div className="flex -space-x-2 overflow-hidden">
                {activeUsers.slice(0, 3).map((u) => (
                  <div key={u.id} className="ring-2 ring-background rounded-full">
                    <Avatar name={u.name} color={u.avatarColor} size="sm" />
                  </div>
                ))}
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeUsers.length} Online
              </span>
            </button>

            {/* Active Users Dropdown Popover */}
            {showActiveUsersDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActiveUsersDropdown(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-border bg-card p-3 shadow-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      Active Collaborators ({activeUsers.length})
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold">● Real-time</span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {activeUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-secondary/60 transition-colors"
                      >
                        <Avatar name={u.name} color={u.avatarColor} size="md" />
                        <div className="flex-1 min-w-0 ml-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground truncate">{u.name}</p>
                            <span className="text-[10px] text-muted-foreground capitalize">{u.jobTitle || u.role}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{u.statusText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle with Smooth Radial Blur */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile & Sign Out Dropdown */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-secondary transition-colors"
            >
              <Avatar name={user?.name || 'G'} color={user?.avatarColor} url={user?.avatarUrl} size="md" />
            </button>

            {showUserDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.jobTitle || 'Member'}
                    </p>
                  </div>

                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setShowUserDropdown(false);
                      // Trigger profile open here (we will implement this in the page level or context, but for now we'll emit an event or call a prop)
                      document.dispatchEvent(new CustomEvent('open-profile-modal'));
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary rounded-xl transition-colors mb-1"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Profile
                  </button>

                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* New Task Button */}
          {onAddTask && (
            <Button size="sm" onClick={onAddTask} className="h-8 shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2 border-t border-border/50 bg-secondary/20">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Search tasks, tags, assignees (⌘F)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            suppressHydrationWarning
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange((e.target.value as TaskStatus) || undefined)}
            className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* Priority Filter */}
          <select
            suppressHydrationWarning
            value={selectedPriority || ''}
            onChange={(e) => onPriorityChange((e.target.value as TaskPriority) || undefined)}
            className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* View Switcher: Board vs Table */}
          <div className="flex rounded-xl bg-secondary/80 p-0.5 border border-border">
            <button
              suppressHydrationWarning
              onClick={() => onViewChange('board')}
              className={`p-1.5 rounded-lg transition-all ${
                currentView === 'board'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Board View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              suppressHydrationWarning
              onClick={() => onViewChange('table')}
              className={`p-1.5 rounded-lg transition-all ${
                currentView === 'table'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
            </button>
          </div>
        </div>
      </div>
      </header>
      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
    </>
  );
}
