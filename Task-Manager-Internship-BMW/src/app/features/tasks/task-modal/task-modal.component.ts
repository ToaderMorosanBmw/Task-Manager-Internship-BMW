import { CommonModule } from '@angular/common';
import { Component, Inject, AfterViewInit, OnInit, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css'
})
export class TaskModalComponent implements OnInit, AfterViewInit {
  task: TaskWithCategory;
  taskForm!: FormGroup;
  newTag = '';
  newSubtaskTitle = '';
  isCreateMode = false;
  priorities: string[] = ['Low', 'Medium', 'High'];
  statuses: string[] = ['To Do', 'In Progress', 'Completed'];

  constructor(
    public dialogRef: MatDialogRef<TaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: TaskWithCategory },
    private fb: FormBuilder
  ) {
    this.task = { ...data.task };
    this.task.tags = this.task.tags ?? [];
    this.task.subtasks = this.task.subtasks ?? [];
    this.isCreateMode = !Boolean(this.task.id);
  }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: [this.task.title, Validators.required],
      description: [this.task.description],
      assignee: [this.task.assignee],
      dueDate: [this.formatDueDateForInput(this.task.dueDate), this.dueDateNotPastValidator()],
      priority: [this.task.priority || 'Low', Validators.required],
      status: [this.task.status || 'To Do', Validators.required]
    });
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
      status: 'To Do'
    };

    this.task.subtasks = this.task.subtasks ?? [];
    this.task.subtasks.push(subtask);
    this.newSubtaskTitle = '';
    this.renderSubtasks();
  }

  removeSubtask(subtask: Subtask): void {
    this.task.subtasks = (this.task.subtasks ?? []).filter((item: Subtask) => item.id !== subtask.id);
    this.renderSubtasks();
  }

  save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    this.task = {
      ...this.task,
      ...formValue,
      dueDate: this.normalizeDueDate(formValue.dueDate)
    };

    this.dialogRef.close(this.task);
  }

  trackByValue(_index: number, value: string): string {
    return value;
  }

  @ViewChild('subtaskContainer', { read: ViewContainerRef })
  private subtaskContainer!: ViewContainerRef;

  @ViewChild('subtaskTpl')
  private subtaskTpl!: TemplateRef<any>;

  ngAfterViewInit(): void {
    this.renderSubtasks();
  }

  private renderSubtasks(): void {
    if (!this.subtaskContainer || !this.subtaskTpl) {
      return;
    }

    this.subtaskContainer.clear();
    const items = this.task.subtasks ?? [];
    for (const subtask of items) {
      this.subtaskContainer.createEmbeddedView(this.subtaskTpl, { subtask });
    }
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

  private dueDateNotPastValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return { invalidDate: true };
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      return date < now ? { pastDate: true } : null;
    };
  }
}
