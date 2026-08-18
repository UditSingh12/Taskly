import {
  User,
  LoginUserInput,
  UpdateThemeInput,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ReorderTasksInput,
  TaskQueryFilter,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ActiveUser,
} from '@taskly/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}/api${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (typeof window !== 'undefined') {
      const fallbackToken = localStorage.getItem('taskly_token');
      if (fallbackToken && !headers['Authorization' as keyof typeof headers]) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${fallbackToken}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error?.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  }

  // ==================== Auth Endpoints ====================

  async login(input: LoginUserInput): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('taskly_token', res.token);
    }
    return res;
  }

  async acceptInvite(input: { token: string; password?: string }): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/accept-invite', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('taskly_token', res.token);
    }
    return res;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async getActiveUsers(): Promise<{ activeUsers: ActiveUser[] }> {
    return this.request<{ activeUsers: ActiveUser[] }>('/auth/active-users');
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('taskly_token');
    }
    await this.request<{ message: string }>('/auth/logout', { method: 'POST' }).catch(() => {});
  }

  async updateTheme(input: UpdateThemeInput): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me/theme', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  // ==================== Project Endpoints ====================

  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/projects');
  }

  async createProject(input: CreateProjectInput): Promise<{ project: Project }> {
    return this.request<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getProject(id: string): Promise<{ project: Project }> {
    return this.request<{ project: Project }>(`/projects/${id}`);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<{ project: Project }> {
    return this.request<{ project: Project }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async requestProjectAccess(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}/request-access`, {
      method: 'POST',
    });
  }

  async addProjectMember(id: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeProjectMember(id: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Task Endpoints ====================

  async getTasks(filter?: TaskQueryFilter): Promise<{ tasks: Task[] }> {
    const query = new URLSearchParams();
    if (filter?.status) query.append('status', filter.status);
    if (filter?.priority) query.append('priority', filter.priority);
    if (filter?.search) query.append('search', filter.search);
    if (filter?.tag) query.append('tag', filter.tag);
    if (filter?.projectId) query.append('projectId', filter.projectId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ tasks: Task[] }>(`/tasks${queryString}`);
  }

  async createTask(input: CreateTaskInput): Promise<{ task: Task }> {
    return this.request<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getTask(id: string): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/tasks/${id}`);
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderTasks(input: ReorderTasksInput): Promise<{ tasks: Task[] }> {
    return this.request<{ tasks: Task[] }>('/tasks/reorder', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  // ==================== Comment Endpoints ====================

  async getComments(taskId: string): Promise<{ comments: import('@taskly/shared-types').Comment[] }> {
    return this.request<{ comments: import('@taskly/shared-types').Comment[] }>(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId: string, input: import('@taskly/shared-types').CreateCommentInput): Promise<{ comment: import('@taskly/shared-types').Comment }> {
    return this.request<{ comment: import('@taskly/shared-types').Comment }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ==================== Admin Endpoints ====================

  async getAdminTeam(): Promise<{ team: User[] }> {
    return this.request<{ team: User[] }>('/admin/team');
  }

  async generateAdminInvite(input: import('@taskly/shared-types').AdminInviteInput): Promise<{ token: string }> {
    return this.request<{ token: string }>('/admin/invite', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async revokeAdminInvite(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/invite/${userId}`, {
      method: 'DELETE',
    });
  }

  async deactivateMember(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/deactivate/${userId}`, {
      method: 'POST',
    });
  }

  async getAdminAuditLog(): Promise<{ logs: import('@taskly/shared-types').AdminAuditLog[] }> {
    return this.request<{ logs: import('@taskly/shared-types').AdminAuditLog[] }>('/admin/audit-log');
  }
}

export const api = new ApiClient();
