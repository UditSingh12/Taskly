import mongoose from 'mongoose';
import { ProjectModel } from '../models/project.model.js';
import { TaskModel } from '../models/task.model.js';
import { CreateProjectInput, UpdateProjectInput, Project } from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

export class ProjectService {
  static async getProjects(): Promise<Project[]> {
    const projects = await ProjectModel.find().sort({ createdAt: -1 });

    // Compute task counts for each project
    const projectList = await Promise.all(
      projects.map(async (p) => {
        const total = await TaskModel.countDocuments({
          projectId: p._id,
        });
        const completed = await TaskModel.countDocuments({
          projectId: p._id,
          status: 'completed',
        });

        const json = p.toJSON();
        return {
          _id: json._id.toString(),
          name: json.name,
          description: json.description || '',
          color: json.color || '#4F46E5',
          icon: json.icon || 'folder',
          owner: json.owner.toString(),
          memberIds: json.memberIds || [],
          pendingMemberIds: json.pendingMemberIds || [],
          taskCount: total,
          completedTaskCount: completed,
          createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
          updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
        } as Project;
      })
    );

    return projectList;
  }

  static async createProject(userId: string, input: CreateProjectInput): Promise<Project> {
    const project = await ProjectModel.create({
      ...input,
      owner: new mongoose.Types.ObjectId(userId),
    });

    const json = project.toJSON();
    return {
      _id: json._id.toString(),
      name: json.name,
      description: json.description || '',
      color: json.color || '#4F46E5',
      icon: json.icon || 'folder',
      owner: json.owner.toString(),
      memberIds: json.memberIds || [],
      pendingMemberIds: json.pendingMemberIds || [],
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    };
  }

  static async getProjectById(projectId: string): Promise<Project> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, 'Invalid project ID');
    }

    const project = await ProjectModel.findOne({ _id: projectId });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const total = await TaskModel.countDocuments({ projectId: project._id });
    const completed = await TaskModel.countDocuments({
      projectId: project._id,
      status: 'completed',
    });

    const json = project.toJSON();
    return {
      _id: json._id.toString(),
      name: json.name,
      description: json.description || '',
      color: json.color || '#4F46E5',
      icon: json.icon || 'folder',
      owner: json.owner.toString(),
      memberIds: json.memberIds || [],
      pendingMemberIds: json.pendingMemberIds || [],
      taskCount: total,
      completedTaskCount: completed,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    };
  }

  static async updateProject(
    projectId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, 'Invalid project ID');
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return this.getProjectById(projectId);
  }

  static async deleteProject(projectId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, 'Invalid project ID');
    }

    const project = await ProjectModel.findOneAndDelete({ _id: projectId });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Unset projectId from associated tasks
    await TaskModel.updateMany(
      { projectId: new mongoose.Types.ObjectId(projectId) },
      { $set: { projectId: null } }
    );
  }

  static async requestAccess(userId: string, projectId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new AppError(400, 'Invalid project ID');
    
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const uid = new mongoose.Types.ObjectId(userId);

    // If already a member or pending, do nothing
    if (project.members.includes(uid) || project.pendingMembers.includes(uid)) {
      return;
    }

    project.pendingMembers.push(uid);
    await project.save();

    // Trigger notification to Admins
    try {
      const { NotificationService } = await import('./notification.service.js');
      await NotificationService.notifyProjectAccessRequest(userId, projectId, project.name);
    } catch (err) {
      console.error('Failed to notify admins of project request', err);
    }
  }

  static async denyRequest(adminId: string, projectId: string, targetUserId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new AppError(400, 'Invalid project ID');
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) throw new AppError(400, 'Invalid user ID');

    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const uid = new mongoose.Types.ObjectId(targetUserId);
    
    // Remove from pending
    project.pendingMembers = project.pendingMembers.filter(id => !id.equals(uid));
    await project.save();
  }

  static async addMember(adminId: string, projectId: string, targetUserId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new AppError(400, 'Invalid project ID');
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) throw new AppError(400, 'Invalid user ID');

    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const uid = new mongoose.Types.ObjectId(targetUserId);

    if (project.members.includes(uid)) return;

    project.members.push(uid);
    // Remove from pending if they were there
    project.pendingMembers = project.pendingMembers.filter(id => !id.equals(uid));
    await project.save();
  }

  static async removeMember(adminId: string, projectId: string, targetUserId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new AppError(400, 'Invalid project ID');
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) throw new AppError(400, 'Invalid user ID');

    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, 'Project not found');

    const uid = new mongoose.Types.ObjectId(targetUserId);
    project.members = project.members.filter(id => !id.equals(uid));
    await project.save();
  }
}
