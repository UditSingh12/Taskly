'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider, useSidebar } from '@/lib/hooks/useSidebar';
import { ProjectProvider, useProjects } from '@/lib/hooks/useProjects';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { useAuth } from '@/lib/hooks/useAuth';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const { isOpen, setIsOpen } = useSidebar();
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    createProject,
  } = useProjects();
  const [projectModalOpen, setProjectModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar with Projects integration */}
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onOpenNewProjectModal={() => setProjectModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={async (data) => {
          await createProject(data);
        }}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <SidebarProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </SidebarProvider>
    </ProjectProvider>
  );
}
