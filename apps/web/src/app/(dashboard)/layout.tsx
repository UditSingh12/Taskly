'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider, useSidebar } from '@/lib/hooks/useSidebar';
import { ProjectProvider, useProjects } from '@/lib/hooks/useProjects';
import { ProjectModal } from '@/components/projects/ProjectModal';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = useSidebar();
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    createProject,
  } = useProjects();
  const [projectModalOpen, setProjectModalOpen] = React.useState(false);

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
