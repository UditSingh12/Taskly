import {
  User,
  CreateGuestUserInput,
  RegisterUserInput,
  LoginUserInput,
  GoogleAuthInput,
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

  async createGuest(input?: CreateGuestUserInput): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/guest', {
      method: 'POST',
      body: JSON.stringify(input || {}),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('taskly_token', res.token);
    }
    return res;
  }

  async register(input: RegisterUserInput): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('taskly_token', res.token);
    }
    return res;
  }

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

  async googleAuth(input: GoogleAuthInput): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/google', {
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
}

export const api = new ApiClient();
