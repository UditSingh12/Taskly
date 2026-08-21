'use client';

import * as React from 'react';
import { Header } from '@/components/layout/Header';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/lib/hooks/useTasks';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSidebar } from '@/lib/hooks/useSidebar';
import { useProjects } from '@/lib/hooks/useProjects';
import { Task, TaskPriority, TaskStatus } from '@taskly/shared-types';
import { Folder, Plus, CheckCircle2, Layers, Lock, Clock, Users } from 'lucide-react';
import { ManageMembersModal } from '@/components/projects/ManageMembersModal';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toggle: toggleSidebar } = useSidebar();
  const { projects, selectedProjectId, selectedProject, requestAccess } = useProjects();

  const [currentView, setCurrentView] = React.useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState<TaskPriority | undefined>();
  const [selectedStatus, setSelectedStatus] = React.useState<TaskStatus | undefined>();
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [requestSuccess, setRequestSuccess] = React.useState(false);

  // Ensure user session exists
  React.useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/';
    }
  }, [authLoading, user]);

  const {
    tasks,
    isLoading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks();

  // Task Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [membersModalOpen, setMembersModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = React.useState<TaskStatus>('todo');

  const handleOpenCreateModal = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setDefaultStatusForNew(status);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
    } else {
      await createTask({
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        status: taskData.status || defaultStatusForNew,
        priority: taskData.priority || 'medium',
        projectId: taskData.projectId !== undefined ? taskData.projectId : selectedProjectId,
        assigneeId: taskData.assignee?._id,
        dueDate: taskData.dueDate,
        tags: taskData.tags,
        subtasks: taskData.subtasks,
      });
    }
  };

  // Filter tasks locally by project, search and active filters
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Filter by selected project
      if (selectedProjectId && task.projectId !== selectedProjectId) {
        return false;
      }
      if (selectedStatus && task.status !== selectedStatus) return false;
      if (selectedPriority && task.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesAssignee = task.assignee?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesAssignee) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedProjectId, selectedStatus, selectedPriority, searchQuery]);

  // Compute progress for active project
  const projectStats = React.useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [filteredTasks]);

  const hasAccess = React.useMemo(() => {
    if (!selectedProject || !user) return true; // Show all if no project selected
    if (user.role === 'admin') return true;
    return selectedProject.memberIds?.includes(user._id);
  }, [selectedProject, user]);

  const isPendingAccess = React.useMemo(() => {
    if (!selectedProject || !user) return false;
    return selectedProject.pendingMemberIds?.includes(user._id);
  }, [selectedProject, user]);

  const handleRequestAccess = async () => {
    if (!selectedProjectId) return;
    try {
      setIsRequesting(true);
      await requestAccess(selectedProjectId);
      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 5000);
    } catch (e) {
      console.error('Failed to request access:', e);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        onAddTask={() => handleOpenCreateModal('todo')}
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Project Banner when a specific project is selected */}
      {selectedProject && (
        <div className="border-b border-border bg-card/60 px-3 sm:px-8 py-3 sm:py-4 w-full">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                style={{ backgroundColor: selectedProject.color || '#4F46E5' }}
              >
                <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
                  {selectedProject.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedProject.description || 'Project Workspace'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-36 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${projectStats.percent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground">
                  {projectStats.percent}%
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                  ({projectStats.completed}/{projectStats.total})
                </span>
              </div>

              {user?.role === 'admin' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMembersModalOpen(true)}
                  className="h-8 shadow-sm text-xs relative"
                >
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden xs:inline">Manage </span>Members
                  {selectedProject.pendingMemberIds && selectedProject.pendingMemberIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => handleOpenCreateModal('todo')}
                className="h-8 shadow-sm text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col min-w-0">
        {!hasAccess ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-secondary/50 text-muted-foreground rounded-2xl flex items-center justify-center mb-6">
              {isPendingAccess ? (
                <Clock className="w-8 h-8 text-amber-500" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              {isPendingAccess ? 'Access Request Pending' : 'Project is Locked'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {isPendingAccess
                ? 'Your request to join this project is pending approval from an administrator.'
                : 'You need to be a member of this project to view and manage its tasks. Request access to join.'}
            </p>
            {requestSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium">
                Request has been sent to admin (Udit Singh)
              </div>
            )}
            {!isPendingAccess && !requestSuccess && (
              <Button onClick={handleRequestAccess} disabled={isRequesting} size="lg">
                <Lock className="w-4 h-4 mr-2" />
                {isRequesting ? 'Requesting...' : 'Request Access'}
              </Button>
            )}
          </div>
        ) : tasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : currentView === 'board' ? (
          <TaskBoard
            tasks={filteredTasks}
            onEditTask={handleOpenEditModal}
            onAddTask={handleOpenCreateModal}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
          />
        ) : (
          <TaskTable
            tasks={filteredTasks}
            onEditTask={handleOpenEditModal}
            onAddTask={handleOpenCreateModal}
            onDeleteTask={deleteTask}
          />
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
        defaultStatus={defaultStatusForNew}
        projects={projects}
        defaultProjectId={selectedProjectId}
        onSave={handleSaveTask}
        onDelete={deleteTask}
      />

      <ManageMembersModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        project={selectedProject}
        onUpdate={async () => {
          // This will re-fetch projects and implicitly update selectedProject
          await requestAccess(selectedProjectId!); 
        }}
      />
    </div>
  );
}
