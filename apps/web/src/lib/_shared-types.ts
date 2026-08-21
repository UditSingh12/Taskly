import { z } from 'zod';

// ==========================================
// User Schemas & Types
// ==========================================

export const ThemeEnum = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof ThemeEnum>;

export const RoleEnum = z.enum(['admin', 'member']);
export type Role = z.infer<typeof RoleEnum>;

export const StatusEnum = z.enum(['invited', 'active', 'deactivated']);
export type Status = z.infer<typeof StatusEnum>;

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().min(1).max(50),
  email: z.string().email(),
  role: RoleEnum.default('member'),
  status: StatusEnum.default('active'),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  avatarUrl: z.string().optional(),
  theme: ThemeEnum.default('dark'),
  lastActiveAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  jobTitle: z.string().max(100).optional(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginUserInput = z.infer<typeof LoginUserSchema>;

export const AdminInviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required'),
  jobTitle: z.string().max(100).optional(),
});
export type AdminInviteInput = z.infer<typeof AdminInviteSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

export const UpdateThemeSchema = z.object({
  theme: ThemeEnum,
});
export type UpdateThemeInput = z.infer<typeof UpdateThemeSchema>;

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

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
  memberIds: z.array(z.string()).default([]),
  pendingMemberIds: z.array(z.string()).default([]),
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

export const TaskActivitySchema = z.object({
  type: z.enum(['status_change', 'priority_change', 'assignee_change', 'created']),
  actorId: z.string(),
  fromValue: z.string().optional(),
  toValue: z.string().optional(),
  timestamp: z.coerce.date(),
});
export type TaskActivity = z.infer<typeof TaskActivitySchema>;

export const TaskSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: TaskStatusEnum.default('todo'),
  assignmentStatus: z.enum(['unassigned', 'assigned', 'pending_request']).default('unassigned'),
  priority: TaskPriorityEnum.default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  tags: z.array(z.string().max(30)).default([]),
  assignee: UserSchema.pick({ _id: true, name: true, avatarColor: true, avatarUrl: true }).optional().nullable(),
  subtasks: z.array(SubtaskSchema).default([]),
  projectId: z.string().optional().nullable(),
  owner: z.string(),
  order: z.number().int().default(0),
  activity: z.array(TaskActivitySchema).default([]),
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
  assigneeId: z.string().optional().nullable(),
  subtasks: z.array(SubtaskSchema).optional(),
  projectId: z.string().optional().nullable(),
  order: z.number().int().optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// ==========================================
// Assignment Request Schemas & Types
// ==========================================

export const AssignmentRequestStatusEnum = z.enum(['pending', 'approved', 'rejected']);
export type AssignmentRequestStatus = z.infer<typeof AssignmentRequestStatusEnum>;

export const AssignmentRequestSchema = z.object({
  _id: z.string(),
  taskId: z.string(),
  requesterId: z.string(),
  requester: UserSchema.pick({ _id: true, name: true, avatarColor: true, avatarUrl: true }).optional(),
  status: AssignmentRequestStatusEnum.default('pending'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});
export type AssignmentRequest = z.infer<typeof AssignmentRequestSchema>;

export const CreateAssignmentRequestSchema = z.object({
  taskId: z.string(),
});
export type CreateAssignmentRequestInput = z.infer<typeof CreateAssignmentRequestSchema>;

// ==========================================
// Notification Schemas & Types
// ==========================================

export const NotificationTypeEnum = z.enum([
  'assigned',
  'assignment_requested',
  'assignment_approved',
  'assignment_rejected',
  'status_changed',
  'mentioned',
  'invite_accepted',
  'project_request',
  'task_created',
  'comment_added',
  'tags_changed',
  'description_changed',
  'assignee_changed'
]);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const NotificationSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: NotificationTypeEnum,
  taskId: z.string().optional().nullable(),
  actorId: z.string().optional(),
  message: z.string(),
  read: z.boolean().default(false),
  createdAt: z.coerce.date(),
});
export type Notification = z.infer<typeof NotificationSchema>;

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
  assigneeId: z.string().optional(),
});
export type TaskQueryFilter = z.infer<typeof TaskQueryFilterSchema>;

// ==========================================
// Comment & Audit Log Types
// ==========================================

export const CommentSchema = z.object({
  _id: z.string(),
  taskId: z.string(),
  author: UserSchema.pick({ _id: true, name: true, avatarColor: true, avatarUrl: true }),
  body: z.string().min(1).max(2000),
  createdAt: z.coerce.date(),
});
export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const AdminAuditLogSchema = z.object({
  _id: z.string(),
  adminId: z.string(),
  adminName: z.string(),
  action: z.enum(['invite_sent', 'invite_revoked', 'member_deactivated', 'member_promoted', 'task_force_edited']),
  targetType: z.enum(['user', 'task']),
  targetId: z.string(),
  timestamp: z.coerce.date(),
  details: z.any().optional(),
});
export type AdminAuditLog = z.infer<typeof AdminAuditLogSchema>;

// ==========================================
// Active User / Real-time Presence Types
// ==========================================

export interface ActiveUser {
  id: string;
  name: string;
  avatarColor: string;
  role: string;
  jobTitle?: string;
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
