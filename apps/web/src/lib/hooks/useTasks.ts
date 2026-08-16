'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskQueryFilter,
} from '@taskly/shared-types';
import { api } from '../api-client';

export function useTasks(initialFilter?: TaskQueryFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskQueryFilter>(initialFilter || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getTasks(filter);
      setTasks(res.tasks);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: CreateTaskInput): Promise<Task> => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      _id: tempId,
      title: input.title,
      description: input.description || '',
      status: input.status || 'todo',
      priority: input.priority || 'medium',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      tags: input.tags || [],
      assigneeName: input.assigneeName || 'Admin',
      assigneeAvatar: input.assigneeAvatar || '',
      subtasks: input.subtasks || [],
      owner: 'temp',
      order: input.order !== undefined ? input.order : tasks.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic UI update
    setTasks((prev) => [...prev, optimisticTask]);

    try {
      const res = await api.createTask(input);
      setTasks((prev) => prev.map((t) => (t._id === tempId ? res.task : t)));
      return res.task;
    } catch (err: any) {
      // Revert optimistic task
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      throw err;
    }
  };

  const updateTask = async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, ...input, updatedAt: new Date() } : t))
    );

    try {
      const res = await api.updateTask(id, input);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.task : t)));
      return res.task;
    } catch (err: any) {
      setTasks(previousTasks); // Revert on failure
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    const previousTasks = [...tasks];

    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await api.deleteTask(id);
    } catch (err: any) {
      setTasks(previousTasks); // Revert on failure
      throw err;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus, newIndex: number) => {
    const previousTasks = [...tasks];

    const currentTask = tasks.find((t) => t._id === taskId);
    if (!currentTask) return;

    // Filter tasks in destination column
    const otherTasksInDest = tasks
      .filter((t) => t.status === newStatus && t._id !== taskId)
      .sort((a, b) => a.order - b.order);

    // Insert moving task at newIndex
    otherTasksInDest.splice(newIndex, 0, { ...currentTask, status: newStatus });

    // Recalculate order indices for destination column
    const updatedDestTasks = otherTasksInDest.map((t, idx) => ({
      ...t,
      status: newStatus,
      order: idx,
    }));

    // Update state optimistically
    setTasks((prev) => {
      const nonAffected = prev.filter((t) => t.status !== newStatus && t._id !== taskId);
      return [...nonAffected, ...updatedDestTasks];
    });

    try {
      await api.reorderTasks({
        tasks: updatedDestTasks.map((t) => ({
          id: t._id,
          status: t.status,
          order: t.order,
        })),
      });
    } catch (err: any) {
      setTasks(previousTasks); // Revert on error
      console.error('Failed to persist task reorder:', err);
    }
  };

  return {
    tasks,
    isLoading,
    error,
    filter,
    setFilter,
    refreshTasks: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
