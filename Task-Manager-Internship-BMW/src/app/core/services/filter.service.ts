import { Injectable } from '@angular/core';
import { TaskWithCategory } from '../models/task-with-category.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  filterByCategory(tasks: TaskWithCategory[], categoryId?: string): TaskWithCategory[] {
    if (!categoryId) {
      return tasks;
    }

    return tasks.filter(task => task.categoryId === categoryId);
  }

  filterByPriority(tasks: TaskWithCategory[], priority?: string): TaskWithCategory[] {
    if (!priority) {
      return tasks;
    }

    return tasks.filter(task => task.priority === priority);
  }
}
