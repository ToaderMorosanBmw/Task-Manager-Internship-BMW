import {
  Component,
  DestroyRef,
  Input,
  inject,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
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
import { DueDateStatusPipe } from '../../../shared/pipes/due-date-status.pipe';
import { TaskProgressPipe } from '../../../shared/pipes/task-progress.pipe';
import { AssigneeInitialsPipe } from '../../../shared/pipes/assignee-initials.pipe';
import { AppColorDirective } from '../../../shared/directives/app-color.directive';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CategoryColor,
    AppColorDirective,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    RouterLink,
    DueDateStatusPipe,
    TaskProgressPipe,
    AssigneeInitialsPipe,
  ],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  @Input()
  task!: TaskWithCategory;

  @Input() selectionMode = false;
  @Input() isSelected = false;
  @HostBinding('class.selected-card') get hostSelected() {
    return this.isSelected;
  }
  @Output() deleted = new EventEmitter<string>();
  @Output() selected = new EventEmitter<{ id: string; selected: boolean }>();

  showFullTitle = false;
  hoveredEditTaskId: string | null = null;
  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);

  onCheckboxChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selected.emit({ id: this.task.id, selected: !this.isSelected });
  }

  onEditClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '500px',
      data: { task: this.task },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result) {
          return;
        }

        if ((result as any).deleted) {
          const id = (result as any).id as string;
          this.taskService
            .deleteTask(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => this.deleted.emit(id),
              error: (err) => console.error('Failed to delete task', err),
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
          dueDate: this.normalizeDueDate(updatedTask.dueDate ?? this.task.dueDate) as
            Date | undefined,
        };

        this.taskService
          .updateTask(this.task.id as string, taskToSave)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (savedTask) => {
              const normalizedTask = {
                ...savedTask,
                dueDate: this.normalizeDueDate(savedTask.dueDate),
              };

              this.task = { ...this.task, ...normalizedTask } as TaskWithCategory;
            },
            error: (err) => console.error('Failed to update task', err),
          });
      });
  }

  toggleTitlePreview(show: boolean): void {
    this.showFullTitle = show;
  }

  private normalizeDueDate(value: Date | string | undefined): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }
}
