import mongoose from 'mongoose';
import { ProjectModel } from '../models/project.model.js';
import { TaskModel } from '../models/task.model.js';
import { CreateProjectInput, UpdateProjectInput, Project } from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

export class ProjectService {
  static async getProjects(userId: string): Promise<Project[]> {
    const projects = await ProjectModel.find({
      owner: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    // Compute task counts for each project
    const projectList = await Promise.all(
      projects.map(async (p) => {
        const total = await TaskModel.countDocuments({
          owner: new mongoose.Types.ObjectId(userId),
          projectId: p._id,
        });
        const completed = await TaskModel.countDocuments({
          owner: new mongoose.Types.ObjectId(userId),
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
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    };
  }

  static async getProjectById(userId: string, projectId: string): Promise<Project> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, 'Invalid project ID');
    }

    const project = await ProjectModel.findOne({
      _id: projectId,
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const total = await TaskModel.countDocuments({
      owner: new mongoose.Types.ObjectId(userId),
      projectId: project._id,
    });
    const completed = await TaskModel.countDocuments({
      owner: new mongoose.Types.ObjectId(userId),
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
      taskCount: total,
      completedTaskCount: completed,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
    };
  }

  static async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, 'Invalid project ID');
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId, owner: new mongoose.Types.ObjectId(userId) },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return this.getProjectById(userId, projectId);
  }

  static async deleteProject(userId: string, projectId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, 'Invalid project ID');
    }

    const project = await ProjectModel.findOneAndDelete({
      _id: projectId,
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Unset projectId from associated tasks
    await TaskModel.updateMany(
      { owner: new mongoose.Types.ObjectId(userId), projectId: new mongoose.Types.ObjectId(projectId) },
      { $set: { projectId: null } }
    );
  }
}
