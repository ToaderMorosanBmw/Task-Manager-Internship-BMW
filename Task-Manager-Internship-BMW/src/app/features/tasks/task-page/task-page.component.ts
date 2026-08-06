import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TaskService } from '../../../core/services/task.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CategoryColor } from '../../../shared/directives/category-color.directive';
import { PriorityColor } from '../../../shared/directives/priority-color.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [
    CategoryColor,
    PriorityColor,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './task-page.component.html',
  styleUrl: './task-page.component.css',
})
export class TaskPageComponent implements OnInit {
  statusOptions = ['To Do', 'In Progress', 'Completed'];
  isCompleted = false;
  isLoading = true;

  task: TaskWithCategory = {
    id: '',
    title: '',
    categoryId: '',
    status: 'To Do',
    tags: [],
    subtasks: [],
  };

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  updateStatus(): void {
    if (!this.task.id) {
      return;
    }

    this.task.status = this.isCompleted ? 'Completed' : 'To Do';

    this.taskService
      .updateTask(this.task.id, this.task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => console.log('Task updated'),
        error: (err) => console.error('Failed to update task status', err),
      });
  }

  updateSubtask(subtask: any, completed: boolean): void {
    if (!this.task.id) {
      return;
    }

    const targetSubtask = this.task.subtasks?.find((item) => item.id === subtask.id);
    if (!targetSubtask) {
      return;
    }

    targetSubtask.completed = completed;
    targetSubtask.status = completed ? 'Completed' : 'To Do';

    this.taskService
      .updateTask(this.task.id, this.task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.error('Failed to update subtask', err),
      });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => params.get('id')),
        switchMap((id) => this.taskService.getTaskById(id || '')),
        switchMap((task) =>
          this.categoryService.getCategoryById(task.categoryId).pipe(
            map((category) => ({
              ...task,
              category,
            }))
          )
        )
      )
      .subscribe({
        next: (taskWithCategory: TaskWithCategory) => {
          this.task = taskWithCategory;
          this.isCompleted = this.task.status === 'Completed';

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading task', err);
          this.isLoading = false;
        },
      });
  }
}
