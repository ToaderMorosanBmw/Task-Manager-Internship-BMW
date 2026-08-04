import { Component, DestroyRef, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map, switchMap } from 'rxjs';
import { Task } from '../../../core/models/task.model';
import { RouterLink } from '@angular/router';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { TaskService } from '../../../core/services/task.service';
import { CategoryColor } from '../../../shared/directives/category-color';
import { TaskModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CategoryColor, MatButtonModule, MatTooltipModule, MatDialogModule, RouterLink],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input()
  task!: TaskWithCategory;

  showFullTitle = false;
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);

  onEditClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '500px',
      data: { task: this.task }
    });

    dialogRef.afterClosed()
      .pipe(
        filter((updatedTask): updatedTask is TaskWithCategory => Boolean(updatedTask)),
        map((updatedTask) => {
          const taskToSave: Task = {
            ...this.task,
            ...updatedTask,
            categoryId: updatedTask.categoryId ?? this.task.categoryId,
            status: updatedTask.status ?? this.task.status,
            priority: updatedTask.priority ?? this.task.priority,
            dueDate: this.normalizeDueDate(updatedTask.dueDate ?? this.task.dueDate) as Date | undefined
          };

          return taskToSave;
        }),
        switchMap((taskToSave) => this.taskService.updateTask(this.task.id as string, taskToSave)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (savedTask) => {
          const normalizedTask = {
            ...savedTask,
            dueDate: this.normalizeDueDate(savedTask.dueDate)
          };

          this.task = { ...this.task, ...normalizedTask } as TaskWithCategory;
        },
        error: (err) => console.error('Failed to update task', err)
      });
  }

  toggleTitlePreview(show: boolean): void {
    this.showFullTitle = show;
  }

  getDueDateLabel(value: Date | string | undefined): string {
    const normalizedDate = this.normalizeDueDate(value);

    if (!normalizedDate) {
      return 'No due date';
    }

    return normalizedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private normalizeDueDate(value: Date | string | undefined): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }
}
