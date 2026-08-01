import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [TaskColumnComponent],
  templateUrl: './task-dashboard.component.html',
  styleUrl: './task-dashboard.component.css',
})
export class TaskDashboardComponent implements OnInit {
  tasks: TaskWithCategory[] = [];

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);

  get todoTasks() {
    return this.tasks.filter((task) => task.status === 'To Do');
  }

  get inProgressTasks() {
    return this.tasks.filter((task) => task.status === 'In Progress');
  }

  get completedTasks() {
    return this.tasks.filter((task) => task.status === 'Completed');
  }

  ngOnInit(): void {
    this.categoryService
      .getAllCategories()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((categories: Category[]) => {
          return this.taskService.getAllTasks().pipe(
            map((tasks) =>
              tasks.map((task) => {
                const matchedCategory = categories.find((category) => category.id === task.categoryId);
                // id must be string for === to work, json-server convers all fields id to string
                return {
                  ...task,
                  category: matchedCategory
                };
              })
            )
          );
        })
      )
      .subscribe((tasksWithCategory: TaskWithCategory[]) => {
        this.tasks = tasksWithCategory;
      });
  }
}
