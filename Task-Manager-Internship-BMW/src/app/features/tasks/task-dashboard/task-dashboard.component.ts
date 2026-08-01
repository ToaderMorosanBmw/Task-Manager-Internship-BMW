import { Component, inject, DestroyRef } from '@angular/core';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [TaskColumnComponent],
  templateUrl: './task-dashboard.component.html',
  styleUrl: './task-dashboard.component.css',
})
export class TaskDashboardComponent implements OnInit {
  tasks: Task[] = [];

  private taskService = inject(TaskService);
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
    this.taskService
      .getAllTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: Task[]) => {
        this.tasks = data;
      });
  }
}
