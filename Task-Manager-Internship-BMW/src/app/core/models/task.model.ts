import { Subtask } from './subtask.model';

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority?: TaskPriority;
  dueDate?: Date;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedTime?: number;
  status: TaskStatus;
  tags: string[];
  assignee?: string;
  subtasks?: Subtask[];
}
