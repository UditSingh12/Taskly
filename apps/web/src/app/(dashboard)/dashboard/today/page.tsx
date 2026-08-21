'use client';

import * as React from 'react';
import { api } from '@/lib/api-client';
import { Task, TaskStatus } from '@taskly/shared-types';
import { Header } from '@/components/layout/Header';
import { AiTaskCreator } from '@/components/tasks/AiTaskCreator';
import { PremiumGreeting } from '@/components/dashboard/PremiumGreeting';
import { useAuth } from '@/lib/hooks/useAuth';

export default function TodayPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [view, setView] = React.useState<'board' | 'table'>('board');

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await api.getTasks({ assigneeId: user._id }); 
      setTasks(res.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTasks();
  }, [user]);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed');
  const dueTodayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === now.getTime() && t.status !== 'completed';
  });
  const inProgressTasks = tasks.filter(t => t.status === 'doing' && !overdueTasks.includes(t) && !dueTodayTasks.includes(t));

  return (
    <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-hidden">
      <Header
        currentView={view}
        onViewChange={setView}
        searchQuery=""
        onSearchChange={() => {}}
        onPriorityChange={() => {}}
        onStatusChange={() => {}}
      />
      <div className="flex-1 overflow-x-hidden p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
        <PremiumGreeting />
        
        <div className="text-center mt-2 mb-6 sm:mb-8 px-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 sm:mb-2">My Day Tasks</h1>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">Focus on what matters today. Create tasks instantly using AI.</p>
          <AiTaskCreator onTaskCreated={fetchTasks} />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12 text-muted-foreground animate-pulse">Loading tasks...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Overdue
                </h3>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
              </div>
              <div className="space-y-3">
                {overdueTasks.map(t => (
                  <div key={t._id} className="bg-card border border-border p-3 rounded-xl shadow-sm">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-red-500/80 mt-1">{new Date(t.dueDate!).toLocaleDateString()}</p>
                  </div>
                ))}
                {overdueTasks.length === 0 && <p className="text-xs text-muted-foreground text-center p-4">No overdue tasks.</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-amber-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Due Today
                </h3>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{dueTodayTasks.length}</span>
              </div>
              <div className="space-y-3">
                {dueTodayTasks.map(t => (
                  <div key={t._id} className="bg-card border border-border p-3 rounded-xl shadow-sm">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-amber-500/80 mt-1">Today</p>
                  </div>
                ))}
                {dueTodayTasks.length === 0 && <p className="text-xs text-muted-foreground text-center p-4">No tasks due today.</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-indigo-500">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> In Progress
                </h3>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map(t => (
                  <div key={t._id} className="bg-card border border-border p-3 rounded-xl shadow-sm">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-indigo-500/80 mt-1">Doing</p>
                  </div>
                ))}
                {inProgressTasks.length === 0 && <p className="text-xs text-muted-foreground text-center p-4">No active tasks.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
