import { Component, DestroyRef, Input, inject, Output, EventEmitter } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map, switchMap } from 'rxjs';
import { Task } from '../../../core/models/task.model';
import { RouterLink } from '@angular/router';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { TaskService } from '../../../core/services/task.service';
import { CategoryColor } from '../../../shared/directives/category-color.directive';
import { TaskModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CategoryColor, MatButtonModule, MatTooltipModule, MatDialogModule, RouterLink],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  @Input()
  task!: TaskWithCategory;

  @Output() deleted = new EventEmitter<string>();

  showFullTitle = false;
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);

  onEditClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '500px',
      data: { task: this.task },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      if ((result as any).deleted) {
        const id = (result as any).id as string;
        this.taskService.deleteTask(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.deleted.emit(id),
            error: (err) => console.error('Failed to delete task', err)
          });

        return;
      }

      const updatedTask = result as TaskWithCategory;

      const taskToSave: Task = {
        ...this.task,
        ...updatedTask,
        categoryId: updatedTask.categoryId ?? this.task.categoryId,
        status: updatedTask.status ?? this.task.status,
        priority: updatedTask.priority ?? this.task.priority,
        dueDate: this.normalizeDueDate(updatedTask.dueDate ?? this.task.dueDate) as Date | undefined
      };

      this.taskService.updateTask(this.task.id as string, taskToSave)
        .pipe(takeUntilDestroyed(this.destroyRef))
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
      day: 'numeric',
    });
  }

  private normalizeDueDate(value: Date | string | undefined): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  get totalSubtasks(): number {
    return this.task.subtasks?.length || 0;
  }

  get completedSubtasks(): number {
    return this.task.subtasks?.filter((s) => s.completed).length || 0;
  }

  get progressPercentage(): number {
    if (this.totalSubtasks === 0) return 0;
    return (this.completedSubtasks / this.totalSubtasks) * 100;
  }

  get assigneeInitials(): string {
    if (!this.task.assignee) return '';
    const names = this.task.assignee.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getDateStatus(
    dueDateVal: string | Date | undefined
  ): { text: string; status: 'overdue' | 'today' | 'normal' } | null {
    if (!dueDateVal) return null;

    const dueDate = new Date(dueDateVal);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', status: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Today', status: 'today' };
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      return { text: dueDate.toLocaleDateString('en-US', options), status: 'normal' };
    }
  }
}
