import { Subtask } from "./subtask.model";

export interface Task {
    id: string;
    title: string;
    description?: string; 
    categoryId: string;
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: Date;
    estimatedTime?: number;
    status: 'To Do' | 'In Progress' | 'Completed';
    tags: string[];
    assignee?: string;
    subtasks?: Subtask[];
  
}