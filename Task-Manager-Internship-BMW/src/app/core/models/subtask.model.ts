export interface Subtask {
    id: number;
    title: string;
    description?: string; 
    status: 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
    completed: boolean;

}