import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CategoryColor } from '../../../shared/directives/category-color.directive';
import { AppColorDirective } from '../../../shared/directives/app-color.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CategoryColor,
    AppColorDirective,
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
  statusOptions = Object.values(TaskStatus);
  isCompleted = false;
  taskForm!: FormGroup;
  isLoading = true;

  task: TaskWithCategory = {
    id: '',
    title: '',
    categoryId: '',
    status: TaskStatus.TODO,
    tags: [],
    subtasks: [],
  };

  private taskService = inject(TaskService)
  private categoryService = inject(CategoryService)
  private route = inject(ActivatedRoute)
  private destroyRef = inject(DestroyRef)
  private fb = inject(FormBuilder)

  constructor() {}

  ngOnInit(): void {

    this.taskForm = this.fb.group({
      status: ['To Do', Validators.required]
    });

    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(params => params.get('id')),
        switchMap(id => this.taskService.getTaskById(id || '')),
        switchMap(task =>
          this.categoryService.getCategoryById(task.categoryId)
            .pipe(
              map(category => ({
                ...task,
                category
              }))
            )
        ),
      )
      .subscribe({
        next: (taskWithCategory: TaskWithCategory) => {
          this.task = taskWithCategory;
          this.isCompleted = this.task.status === TaskStatus.COMPLETED;
          this.taskForm.patchValue({ status: this.task.status });
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load task', err);
          this.isLoading = false;
        }
      })
    }

  updateStatus(): void {
    if (!this.task.id || this.taskForm.invalid) {
      return;
    }

    const newStatus = this.taskForm.get('status')?.value as TaskWithCategory['status'];
    if (!newStatus) {
      return;
    }

    this.task.status = newStatus;
    this.isCompleted = newStatus === TaskStatus.COMPLETED;

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
    targetSubtask.status = completed ? TaskStatus.COMPLETED : TaskStatus.TODO;

    this.taskService
      .updateTask(this.task.id, this.task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.error('Failed to update subtask', err),
      });
  }
}
