'use client';

import * as React from 'react';
import { Project, CreateProjectInput, UpdateProjectInput } from '@taskly/shared-types';
import { api } from '../api-client';

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  setSelectedProjectId: (id: string | null) => void;
  isLoading: boolean;
  error: string | null;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, input: UpdateProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  requestAccess: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = React.createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProjects = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getProjects();
      setProjects(res.projects);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (input: CreateProjectInput): Promise<Project> => {
    const res = await api.createProject(input);
    setProjects((prev) => [res.project, ...prev]);
    setSelectedProjectId(res.project._id);
    return res.project;
  };

  const updateProject = async (id: string, input: UpdateProjectInput): Promise<Project> => {
    const res = await api.updateProject(id, input);
    setProjects((prev) => prev.map((p) => (p._id === id ? res.project : p)));
    return res.project;
  };

  const deleteProject = async (id: string): Promise<void> => {
    await api.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  };

  const requestAccess = async (id: string): Promise<void> => {
    await api.requestProjectAccess(id);
    await fetchProjects();
  };

  const selectedProject = React.useMemo(() => {
    return projects.find((p) => p._id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        selectedProject,
        setSelectedProjectId,
        isLoading,
        error,
        createProject,
        updateProject,
        deleteProject,
        requestAccess,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = React.useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
