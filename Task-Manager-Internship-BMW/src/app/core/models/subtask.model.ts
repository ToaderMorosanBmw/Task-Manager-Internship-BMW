export interface Subtask {
    id: number;
    title: string;
    description?: string; 
    status: 'To Do' | 'In Progress' | 'Completed';
    completed: boolean;

}