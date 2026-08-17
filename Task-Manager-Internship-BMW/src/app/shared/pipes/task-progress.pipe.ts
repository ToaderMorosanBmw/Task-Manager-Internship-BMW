import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'taskProgress',
  standalone: true,
})
export class TaskProgressPipe implements PipeTransform {
  transform(subtasks: { completed: boolean }[] | undefined | null): {
    completed: number;
    total: number;
    percentage: number;
  } {
    if (!subtasks || subtasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const total = subtasks.length;
    const completed = subtasks.filter((s) => s.completed).length;
    const percentage = (completed / total) * 100;
    return { completed, total, percentage };
  }
}
