import { z } from 'zod';

// ==========================================
// User Schemas & Types
// ==========================================

export const ThemeEnum = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof ThemeEnum>;

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().min(1).max(50),
  email: z.string().email().optional(),
  isGuest: z.boolean().default(true),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  avatarUrl: z.string().optional(),
  theme: ThemeEnum.default('dark'),
  createdAt: z.coerce.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateGuestUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});
export type CreateGuestUserInput = z.infer<typeof CreateGuestUserSchema>;

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Username must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export const GoogleAuthSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  picture: z.string().optional(),
  googleId: z.string().optional(),
});
export type GoogleAuthInput = z.infer<typeof GoogleAuthSchema>;

export const UpdateThemeSchema = z.object({
  theme: ThemeEnum,
});
export type UpdateThemeInput = z.infer<typeof UpdateThemeSchema>;

// ==========================================
// Project Schemas & Types
// ==========================================

export const ProjectSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#4F46E5'),
  icon: z.string().default('folder'),
  owner: z.string(),
  taskCount: z.number().int().default(0),
  completedTaskCount: z.number().int().default(0),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  icon: z.string().optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = CreateProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ==========================================
// Task Schemas & Types
// ==========================================

export const TaskStatusEnum = z.enum(['todo', 'doing', 'completed', 'on_hold']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskPriorityEnum = z.enum(['low', 'medium', 'high']);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

export const SubtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean().default(false),
});
export type Subtask = z.infer<typeof SubtaskSchema>;

export const TaskSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: TaskStatusEnum.default('todo'),
  priority: TaskPriorityEnum.default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  tags: z.array(z.string().max(30)).default([]),
  assigneeName: z.string().max(50).optional(),
  assigneeAvatar: z.string().optional(),
  subtasks: z.array(SubtaskSchema).default([]),
  projectId: z.string().optional().nullable(),
  owner: z.string(),
  order: z.number().int().default(0),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: TaskStatusEnum.default('todo'),
  priority: TaskPriorityEnum.default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  tags: z.array(z.string().max(30)).optional(),
  assigneeName: z.string().max(50).optional(),
  assigneeAvatar: z.string().optional(),
  subtasks: z.array(SubtaskSchema).optional(),
  projectId: z.string().optional().nullable(),
  order: z.number().int().optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = CreateTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export const ReorderItemSchema = z.object({
  id: z.string(),
  status: TaskStatusEnum,
  order: z.number().int(),
});
export type ReorderItem = z.infer<typeof ReorderItemSchema>;

export const ReorderTasksSchema = z.object({
  tasks: z.array(ReorderItemSchema).min(1),
});
export type ReorderTasksInput = z.infer<typeof ReorderTasksSchema>;

export const TaskQueryFilterSchema = z.object({
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  projectId: z.string().optional(),
});
export type TaskQueryFilter = z.infer<typeof TaskQueryFilterSchema>;

// ==========================================
// Active User / Real-time Presence Types
// ==========================================

export interface ActiveUser {
  id: string;
  name: string;
  avatarColor: string;
  role: string;
  statusText: string;
  isCurrentUser?: boolean;
}

// ==========================================
// Auth & API Response Types
// ==========================================

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
}
