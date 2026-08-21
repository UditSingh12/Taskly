import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../src/models/user.model.js';
import { env } from '../src/config/env.js';
import { ProjectModel } from '../src/models/project.model.js';
import { TaskModel } from '../src/models/task.model.js';
import { CommentModel } from '../src/models/comment.model.js';
import { AdminAuditLogModel } from '../src/models/audit-log.model.js';
import 'dotenv/config';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected.');

    console.log('Dropping existing data...');
    await UserModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await TaskModel.deleteMany({});
    await CommentModel.deleteMany({});
    await AdminAuditLogModel.deleteMany({});
    console.log('Data dropped.');

    console.log('Creating demo users...');
    
    // 1. Primary Demo Admin (admin@taskly.in / Admin@123)
    const demoAdminPassword = await bcrypt.hash('Admin@123', 10);
    const demoAdmin = await UserModel.create({
      name: 'Taskly Admin',
      email: 'admin@taskly.in',
      password: demoAdminPassword,
      role: 'admin',
      jobTitle: 'Product Lead',
      status: 'active',
      avatarColor: '#6366F1', // Indigo
      theme: 'dark',
      lastActiveAt: new Date(),
    });

    // 2. Secondary Admin (uditbhadouriya@gmail.com / Udit@123)
    const uditPassword = await bcrypt.hash('Udit@123', 10);
    const uditAdmin = await UserModel.create({
      name: 'Udit Singh',
      email: 'uditbhadouriya@gmail.com',
      password: uditPassword,
      role: 'admin',
      jobTitle: 'Engineering Lead',
      status: 'active',
      avatarColor: '#0EA5E9', // Sky Blue
      theme: 'dark',
      lastActiveAt: new Date(),
    });

    // 3. Demo Team Member (member@taskly.in / Member@123)
    const memberPassword = await bcrypt.hash('Member@123', 10);
    const demoMember = await UserModel.create({
      name: 'Alex Rivera',
      email: 'member@taskly.in',
      password: memberPassword,
      role: 'member',
      jobTitle: 'Full-Stack Developer',
      status: 'active',
      avatarColor: '#10B981', // Emerald
      theme: 'dark',
      lastActiveAt: new Date(),
    });

    console.log('Created accounts:');
    console.log(' - Admin: admin@taskly.in (Admin@123)');
    console.log(' - Admin: uditbhadouriya@gmail.com (Udit@123)');
    console.log(' - Member: member@taskly.in (Member@123)');

    console.log('Creating sample projects...');
    const project1 = await ProjectModel.create({
      name: 'Taskly Refactor',
      description: 'Full-stack monorepo refactoring, AI integration, and RBAC.',
      owner: demoAdmin._id.toString(),
      members: [demoAdmin._id, uditAdmin._id, demoMember._id],
      color: '#6366F1', // Indigo
    });

    const project2 = await ProjectModel.create({
      name: 'Mobile App Launch',
      description: 'React Native iOS & Android companion applications.',
      owner: demoAdmin._id.toString(),
      members: [demoAdmin._id, demoMember._id],
      color: '#EC4899', // Pink
    });

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    console.log('Creating rich tasks across projects...');
    await TaskModel.create([
      {
        title: 'Review System Architecture & AI Endpoints',
        description: 'Verify OpenRouter models, local heuristics, and intent classification.',
        status: 'doing',
        priority: 'high',
        owner: demoAdmin._id,
        projectId: project1._id,
        assignee: demoAdmin._id,
        dueDate: now,
        tags: ['AI', 'Architecture', 'Backend'],
        subtasks: [
          { id: 'sub-1', title: 'Check Intent Routing', completed: true },
          { id: 'sub-2', title: 'Test Fallbacks', completed: true },
          { id: 'sub-3', title: 'Monitor Response Latency', completed: false },
        ],
        activity: [
          { type: 'created', actorId: demoAdmin._id.toString(), timestamp: yesterday },
          { type: 'status_change', fromValue: 'todo', toValue: 'doing', actorId: demoAdmin._id.toString(), timestamp: now }
        ]
      },
      {
        title: 'Prepare Product Walkthrough Demo',
        description: 'Record 2-minute overview showcasing natural language AI tasks and Kanban board.',
        status: 'todo',
        priority: 'high',
        owner: demoAdmin._id,
        projectId: project1._id,
        assignee: demoAdmin._id,
        dueDate: tomorrow,
        tags: ['Demo', 'Video', 'Submission'],
        activity: [{ type: 'created', actorId: demoAdmin._id.toString(), timestamp: now }]
      },
      {
        title: 'Configure Mobile Push Notifications',
        description: 'Implement FCM / APNs integration for assignment updates.',
        status: 'todo',
        priority: 'medium',
        owner: demoAdmin._id,
        projectId: project2._id,
        assignee: demoMember._id,
        dueDate: nextWeek,
        tags: ['Mobile', 'Notifications'],
        activity: [{ type: 'created', actorId: demoAdmin._id.toString(), timestamp: now }]
      },
      {
        title: 'Deploy to Vercel Serverless',
        description: 'Set up fluid compute routing in vercel.json and connect MongoDB Atlas.',
        status: 'completed',
        priority: 'high',
        owner: demoAdmin._id,
        projectId: project1._id,
        assignee: uditAdmin._id,
        dueDate: yesterday,
        tags: ['DevOps', 'Deployment'],
        activity: [
          { type: 'created', actorId: uditAdmin._id.toString(), timestamp: yesterday },
          { type: 'status_change', fromValue: 'doing', toValue: 'completed', actorId: uditAdmin._id.toString(), timestamp: now }
        ]
      }
    ]);

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
