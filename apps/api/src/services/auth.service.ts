import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { TaskModel } from '../models/task.model.js';
import { ProjectModel } from '../models/project.model.js';
import {
  CreateGuestUserInput,
  RegisterUserInput,
  LoginUserInput,
  GoogleAuthInput,
  UpdateThemeInput,
  User,
  ActiveUser,
} from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

const AVATAR_COLORS = [
  '#4F46E5', // Indigo
  '#0284C7', // Sky Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Rose / Red
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0D9488', // Teal
];

const toUser = (doc: any): User => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    name: json.name,
    email: json.email || undefined,
    isGuest: json.isGuest ?? true,
    avatarColor: json.avatarColor || '#4F46E5',
    avatarUrl: json.avatarUrl || undefined,
    theme: json.theme || 'dark',
    createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
  };
};

export class AuthService {
  static createToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '30d' });
  }

  static async createGuestUser(input: CreateGuestUserInput): Promise<{ user: User; token: string }> {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const name = input.name?.trim() || `Guest ${randomNum}`;
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await UserModel.create({
      name,
      isGuest: true,
      avatarColor,
      theme: 'dark',
    });

    const token = this.createToken(user._id.toString());
    await this.seedInitialTasks(user._id.toString());

    return {
      user: toUser(user),
      token,
    };
  }

  static async register(input: RegisterUserInput): Promise<{ user: User; token: string }> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'An account with this email already exists. Please login instead.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await UserModel.create({
      name: input.name.trim(),
      email,
      password: hashedPassword,
      isGuest: false,
      avatarColor,
      theme: 'dark',
    });

    const token = this.createToken(user._id.toString());
    await this.seedInitialTasks(user._id.toString());

    return {
      user: toUser(user),
      token,
    };
  }

  static async login(input: LoginUserInput): Promise<{ user: User; token: string }> {
    const email = input.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !user.password) {
      throw new AppError(401, 'Invalid email or password. Please check your credentials.');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password. Please check your credentials.');
    }

    const token = this.createToken(user._id.toString());

    return {
      user: toUser(user),
      token,
    };
  }

  static async googleAuth(input: GoogleAuthInput): Promise<{ user: User; token: string }> {
    const email = input.email.trim().toLowerCase();
    let user = await UserModel.findOne({ email });

    if (!user) {
      const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      user = await UserModel.create({
        name: input.name.trim(),
        email,
        googleId: input.googleId,
        avatarUrl: input.picture,
        avatarColor,
        isGuest: false,
        theme: 'dark',
      });
      await this.seedInitialTasks(user._id.toString());
    } else {
      if (input.picture && !user.avatarUrl) {
        user.avatarUrl = input.picture;
        await user.save();
      }
    }

    const token = this.createToken(user._id.toString());

    return {
      user: toUser(user),
      token,
    };
  }

  static async seedInitialTasks(userId: string): Promise<void> {
    // Create initial sample Project
    const project = await ProjectModel.create({
      name: 'Taskly Core Release',
      description: 'Core product development, release pipelines, and UI polish.',
      color: '#4F46E5',
      icon: 'layers',
      owner: userId,
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);

    const initialTasks = [
      {
        title: 'Write API Documentation',
        description: 'Document all REST endpoints, request schemas, authentication flow, and response examples.',
        status: 'todo',
        priority: 'high',
        dueDate: today,
        tags: ['Deployment', 'Backend'],
        assigneeName: 'Admin',
        projectId: project._id,
        order: 0,
        owner: userId,
        subtasks: [
          { id: 'st-1', title: 'Auth endpoints spec', completed: true },
          { id: 'st-2', title: 'Task CRUD spec', completed: true },
          { id: 'st-3', title: 'Error handling matrix', completed: false },
        ],
      },
      {
        title: 'Implement Search Function',
        description: 'Add fuzzy title and tag filtering with keyboard shortcut support (Cmd+F / Cmd+K).',
        status: 'todo',
        priority: 'medium',
        dueDate: tomorrow,
        tags: ['Deployment', 'Frontend'],
        assigneeName: 'Admin',
        projectId: project._id,
        order: 1,
        owner: userId,
      },
      {
        title: 'Deploy to Production',
        description: 'Configure Vercel Dockerfile Function and Next.js production pipelines.',
        status: 'todo',
        priority: 'high',
        dueDate: in3Days,
        tags: ['Deployment', 'DevOps'],
        assigneeName: 'Admin',
        projectId: project._id,
        order: 2,
        owner: userId,
      },
      {
        title: 'Code Review Completed',
        description: 'Review shared Zod schemas, validation middlewares, and drag-and-drop state reconciliation.',
        status: 'doing',
        priority: 'medium',
        dueDate: today,
        tags: ['Deployment', 'Review'],
        assigneeName: 'Admin',
        projectId: project._id,
        order: 0,
        owner: userId,
      },
      {
        title: 'Design Mockups Finalized',
        description: 'Align color palette, typography hierarchy, and mobile responsive layout with Stitch specs.',
        status: 'doing',
        priority: 'high',
        dueDate: tomorrow,
        tags: ['Deployment', 'Design'],
        assigneeName: 'Admin',
        projectId: project._id,
        order: 1,
        owner: userId,
      },
      {
        title: 'Feature Testing Passed',
        description: 'Verify guest cookie persistence, theme switching, and optimistic updates.',
        status: 'completed',
        priority: 'low',
        dueDate: new Date(Date.now() - 86400000),
        tags: ['Testing', 'Passed'],
        assigneeName: 'QA Team',
        projectId: project._id,
        order: 0,
        owner: userId,
      },
      {
        title: 'UI Design Updated',
        description: 'Incorporate Linear & Notion style minimalist table and Kanban views with dark mode support.',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 43200000),
        tags: ['Design', 'Updated'],
        assigneeName: 'Designer',
        projectId: project._id,
        order: 1,
        owner: userId,
      },
      {
        title: 'Security Audit Scheduled',
        description: 'Verify CORS origin isolation and httpOnly cookie flags.',
        status: 'completed',
        priority: 'low',
        dueDate: today,
        tags: ['Audit', 'Scheduled'],
        assigneeName: 'Security',
        projectId: project._id,
        order: 2,
        owner: userId,
      },
      {
        title: 'UI Review Process',
        description: 'Collect stakeholder feedback on animation pacing and micro-interactions.',
        status: 'on_hold',
        priority: 'low',
        dueDate: null,
        tags: ['Design', 'Review'],
        assigneeName: 'Designer',
        projectId: project._id,
        order: 0,
        owner: userId,
      },
      {
        title: 'Backend Infrastructure Migration',
        description: 'Evaluate multi-region MongoDB Atlas sharding and caching layers.',
        status: 'on_hold',
        priority: 'medium',
        dueDate: null,
        tags: ['DevOps'],
        assigneeName: 'Admin',
        order: 1,
        owner: userId,
      },
    ];

    await TaskModel.insertMany(initialTasks);
  }

  static async getActiveUsers(currentUserId?: string): Promise<ActiveUser[]> {
    const defaultCollaborators: ActiveUser[] = [
      {
        id: 'user-admin',
        name: 'Dexter (Admin)',
        avatarColor: '#4F46E5',
        role: 'Tech Lead',
        statusText: 'Reviewing tasks',
      },
      {
        id: 'user-sarah',
        name: 'Sarah Chen',
        avatarColor: '#0284C7',
        role: 'Product Designer',
        statusText: 'Updating board',
      },
      {
        id: 'user-alex',
        name: 'Alex Rivera',
        avatarColor: '#059669',
        role: 'QA Engineer',
        statusText: 'Testing endpoints',
      },
      {
        id: 'user-priya',
        name: 'Priya Sharma',
        avatarColor: '#D97706',
        role: 'Full-stack Dev',
        statusText: 'Editing subtasks',
      },
    ];

    if (currentUserId) {
      const user = await UserModel.findById(currentUserId);
      if (user) {
        return [
          {
            id: user._id.toString(),
            name: `${user.name} (You)`,
            avatarColor: user.avatarColor,
            role: user.isGuest ? 'Guest' : 'Member',
            statusText: 'Active now',
            isCurrentUser: true,
          },
          ...defaultCollaborators,
        ];
      }
    }

    return defaultCollaborators;
  }

  static async getCurrentUser(userId: string): Promise<User | null> {
    const user = await UserModel.findById(userId);
    return user ? toUser(user) : null;
  }

  static async updateTheme(userId: string, input: UpdateThemeInput): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { theme: input.theme },
      { new: true }
    );
    return user ? toUser(user) : null;
  }
}
