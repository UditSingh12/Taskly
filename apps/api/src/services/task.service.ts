import mongoose from 'mongoose';
import { TaskModel } from '../models/task.model.js';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ReorderTasksInput,
  TaskQueryFilter,
  Task,
} from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

const toTask = (doc: any): Task => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    title: json.title,
    description: json.description || '',
    status: json.status,
    priority: json.priority,
    dueDate: json.dueDate ? new Date(json.dueDate) : null,
    tags: json.tags || [],
    assigneeName: json.assigneeName || 'Admin',
    assigneeAvatar: json.assigneeAvatar || '',
    subtasks: json.subtasks || [],
    projectId: json.projectId ? json.projectId.toString() : null,
    owner: json.owner.toString(),
    order: json.order || 0,
    createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
    updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
  };
};

export class TaskService {
  static async getTasks(userId: string, filter?: TaskQueryFilter): Promise<Task[]> {
    const query: mongoose.FilterQuery<any> = { owner: new mongoose.Types.ObjectId(userId) };

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.priority) {
      query.priority = filter.priority;
    }

    if (filter?.tag) {
      query.tags = { $in: [filter.tag] };
    }

    if (filter?.projectId) {
      query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    }

    if (filter?.search) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const tasks = await TaskModel.find(query).sort({ status: 1, order: 1, createdAt: -1 });
    return tasks.map(toTask);
  }

  static async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const highestOrderTask = await TaskModel.findOne({
      owner: new mongoose.Types.ObjectId(userId),
      status: input.status || 'todo',
    }).sort({ order: -1 });

    const nextOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;

    const task = await TaskModel.create({
      ...input,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : null,
      owner: new mongoose.Types.ObjectId(userId),
      order: input.order !== undefined ? input.order : nextOrder,
    });

    return toTask(task);
  }

  static async getTaskById(userId: string, taskId: string): Promise<Task> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findOne({
      _id: taskId,
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    return toTask(task);
  }

  static async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const updatePayload: any = { ...input };
    if (input.projectId !== undefined) {
      updatePayload.projectId = input.projectId
        ? new mongoose.Types.ObjectId(input.projectId)
        : null;
    }

    const task = await TaskModel.findOneAndUpdate(
      { _id: taskId, owner: new mongoose.Types.ObjectId(userId) },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    return toTask(task);
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findOneAndDelete({
      _id: taskId,
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }
  }

  static async reorderTasks(userId: string, input: ReorderTasksInput): Promise<Task[]> {
    const bulkOps = input.tasks.map((item) => {
      return {
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(item.id),
            owner: new mongoose.Types.ObjectId(userId),
          },
          update: {
            $set: {
              status: item.status,
              order: item.order,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await TaskModel.bulkWrite(bulkOps);
    }

    const updatedTasks = await TaskModel.find({
      owner: new mongoose.Types.ObjectId(userId),
    }).sort({ status: 1, order: 1 });

    return updatedTasks.map(toTask);
  }
}
