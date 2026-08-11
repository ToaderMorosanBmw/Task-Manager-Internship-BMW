import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subtask } from '../../../core/models/subtask.model';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css',
})
export class TaskModalComponent {
  task: TaskWithCategory;
  dueDateInput: string;
  newTag = '';
  newSubtaskTitle = '';
  isCreateMode = false;

  constructor(
    public dialogRef: MatDialogRef<TaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: TaskWithCategory }
  ) {
    this.task = { ...data.task };
    this.task.tags = this.task.tags ?? [];
    this.task.subtasks = this.task.subtasks ?? [];
    this.dueDateInput = this.formatDueDateForInput(this.task.dueDate);
    this.isCreateMode = !Boolean(this.task.id);
  }

  addTag(): void {
    const tag = this.newTag.trim();
    if (!tag) {
      return;
    }

    if (!this.task.tags.includes(tag)) {
      this.task.tags.push(tag);
    }

    this.newTag = '';
  }

  removeTag(tag: string): void {
    this.task.tags = this.task.tags.filter((item) => item !== tag);
  }

  addSubtask(): void {
    const title = this.newSubtaskTitle.trim();
    if (!title) {
      return;
    }

    const subtask: Subtask = {
      id: Date.now(),
      title,
      completed: false,
      status: 'To Do',
    };

    this.task.subtasks = this.task.subtasks ?? [];
    this.task.subtasks.push(subtask);
    this.newSubtaskTitle = '';
  }

  removeSubtask(subtask: Subtask): void {
    this.task.subtasks = (this.task.subtasks ?? []).filter(
      (item: Subtask) => item.id !== subtask.id
    );
  }

  save(): void {
    if (this.dueDateInput) {
      const parsedDate = this.normalizeDueDate(this.dueDateInput);
      if (parsedDate) {
        this.task.dueDate = parsedDate;
      }
    } else if (this.task.dueDate) {
      this.task.dueDate = this.normalizeDueDate(this.task.dueDate);
    } else {
      this.task.dueDate = undefined;
    }

    this.dialogRef.close(this.task);
  }

  private normalizeDueDate(value: Date | string | undefined): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  private formatDueDateForInput(value: Date | string | undefined): string {
    const normalizedDate = this.normalizeDueDate(value);
    return normalizedDate ? normalizedDate.toISOString().split('T')[0] : '';
  }

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    if (!this.task.id) {
      this.dialogRef.close();
      return;
    }

    this.dialogRef.close({ deleted: true, id: this.task.id });
  }
}
