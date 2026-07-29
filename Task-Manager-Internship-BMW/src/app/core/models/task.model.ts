import { Subtask } from "./subtask.model";

export interface Task {
    id: number;
    title: string;
    description?: string; 
    category: 'Work' | 'Personal' | 'Urgent' | 'Meeting';
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    dueDate?: Date;
    estimatedTime?: number;
    status: 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
    tags: string[];//sau enum(trebuie determinate tagurile) 
    assignee?: string;//sau enum
    subtaks: Subtask[];
  
}