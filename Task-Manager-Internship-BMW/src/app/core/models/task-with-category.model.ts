import { Task } from './task.model';
import { Category } from './category.model';

export interface TaskWithCategory extends Task {
  category?: Category;
}
