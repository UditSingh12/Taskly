import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../src/models/user.model.js';
import { env } from '../src/config/env.js';
import { ProjectModel } from '../src/models/project.model.js';
import { TaskModel } from '../src/models/task.model.js';
import { CommentModel } from '../src/models/comment.model.js';
import { AdminAuditLogModel } from '../src/models/audit-log.model.js';
import 'dotenv/config'; // Make sure to load env vars

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

    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Udit@123', 10);
    const admin = await UserModel.create({
      name: 'Udit Singh',
      email: 'uditbhadouriya@gmail.com', // lowercase
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      avatarColor: '#4F46E5', // Indigo
      theme: 'dark',
      lastActiveAt: new Date(),
    });
    console.log('Admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    console.log('Creating initial project and tasks...');
    const project = await ProjectModel.create({
      name: 'Taskly Refactor',
      description: 'Implement org auth and admin dashboard.',
      owner: admin._id.toString(),
      color: '#059669', // Emerald
    });

    await TaskModel.create({
      title: 'Welcome to Taskly',
      description: 'This is your first task. Feel free to explore the admin dashboard.',
      status: 'todo',
      priority: 'high',
      owner: admin._id.toString(),
      projectId: project._id,
      assignee: admin._id,
      activity: [
        {
          type: 'created',
          actorId: admin._id.toString(),
          timestamp: new Date(),
        }
      ]
    });

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
