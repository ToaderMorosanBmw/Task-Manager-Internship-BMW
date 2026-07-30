import { Subtask } from "./subtask.model";
import { Category } from "./category.model";

export interface Task {
    id: number;
    title: string;
    description?: string; 
    category: Category;
    priority?: 'Low' | 'Medium' | 'High';
    dueDate?: Date;
    estimatedTime?: number;
    status: 'To Do' | 'In Progress' | 'Completed';
    tags: string[];//sau enum(trebuie determinate tagurile) 
    assignee?: string;//sau enum
    subtaks?: Subtask[];
  
}