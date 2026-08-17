import { TaskStatus } from './task.model';

export interface Subtask {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus.TODO | TaskStatus.COMPLETED;
  completed: boolean;
}
