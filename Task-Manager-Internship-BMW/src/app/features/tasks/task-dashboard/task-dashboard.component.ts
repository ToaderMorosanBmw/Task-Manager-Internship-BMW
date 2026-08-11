import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map, filter } from 'rxjs';
import { FilterService } from '../../../core/services/filter.service';
import { TaskFilterRowComponent } from '../task-filter-row/task-filter-row.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [
    TaskColumnComponent,
    TaskFilterRowComponent,
    CdkDropListGroup,
    MatProgressSpinnerModule,
    MatDialogModule,
    FormsModule,
    TaskModalComponent,
  ],
  templateUrl: './task-dashboard.component.html',
  styleUrl: './task-dashboard.component.css',
})
export class TaskDashboardComponent implements OnInit {
  isLoading: boolean = true;
  allTasks: TaskWithCategory[] = [];
  visibleTasks: TaskWithCategory[] = [];
  selectedCategory: string = '';
  selectedPriority: string = '';
  searchText: string = '';
  priorities: { title: string; color: string }[] = [
    { title: 'Low', color: '#2e7d32' },
    { title: 'Medium', color: '#f57c00' },
    { title: 'High', color: '#d32f2f' },
  ];
  categories: { title: string; color: string }[] = [];

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);
  private filterService = inject(FilterService);
  private dialog = inject(MatDialog);
  private priorityOrder: Record<string, number> = {
    High: 1,
    Medium: 2,
    Low: 3,
  };
  private getFilteredTasks(status: string): TaskWithCategory[] {
    return this.visibleTasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        return this.priorityOrder[a.priority as string] - this.priorityOrder[b.priority as string];
      });
  }

  get todoTasks() {
    return this.getFilteredTasks('To Do');
  }

  get inProgressTasks() {
    return this.getFilteredTasks('In Progress');
  }

  get completedTasks() {
    return this.getFilteredTasks('Completed');
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
                const matchedCategory = categories.find(
                  (category) => category.id === task.categoryId
                );
                return {
                  ...task,
                  category: matchedCategory,
                };
              })
            )
          );
        })
      )
      .subscribe({
        next: (tasksWithCategory: TaskWithCategory[]) => {
          this.allTasks = tasksWithCategory;
          this.visibleTasks = tasksWithCategory;

          const categoryColor: Record<string, { title: string; color: string }> = {};

          tasksWithCategory.forEach((task) => {
            categoryColor[task.category!.title] = {
              title: task.category!.title,
              color: task.category!.color,
            };
          });

          this.categories = Object.values(categoryColor);

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load dashboard data:', err);

          this.isLoading = false;
        },
      });
  }

  applyFiters(): void {
    let filtered = this.allTasks;

    if (this.selectedCategory) {
      filtered = this.filterService.filterByCategory(filtered, this.selectedCategory);
    }
    if (this.selectedPriority) {
      filtered = this.filterService.filterByPriority(filtered, this.selectedPriority);
    }
    if (this.searchText.trim()) {
      const words = this.searchText.toLowerCase().trim().split(/\s+/);

      const searchTags = words
        .filter((word) => word.startsWith('#'))
        .map((word) => word.substring(1));

      const searchWords = words.filter((token) => !token.startsWith('#'));

      filtered = filtered.filter((task) => {
        const title = task.title.toLowerCase();
        const desc = (task.description || '').toLowerCase();
        const taskTags = (task.tags || []).map((tag) => tag.toLowerCase());

        const matchesWords = searchWords.every(
          (word) => title.includes(word) || desc.includes(word)
        );

        const matchesTags = searchTags.every((searchTag) =>
          taskTags.some((taskTag) => taskTag.includes(searchTag))
        );

        return matchesWords && matchesTags;
      });
    }

    this.visibleTasks = filtered;
  }

  onCategorySelected(category: string): void {
    this.selectedCategory = category;
    this.applyFiters();
  }

  onPrioritySelected(priority: string): void {
    this.selectedPriority = priority;
    this.applyFiters();
  }

  onCreateTaskClick(): void {
    const defaultCategoryId = this.allTasks[0]?.category?.id ?? '';

    const taskToEdit: TaskWithCategory = {
      id: '',
      title: '',
      description: '',
      categoryId: defaultCategoryId,
      status: 'To Do',
      priority: 'Low',
      tags: [],
      subtasks: [],
    };

    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '520px',
      data: { task: taskToEdit },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result): result is TaskWithCategory => Boolean(result)))
      .subscribe((result) => {
        const taskToSave: Task = {
          ...result,
          title: result.title.trim() || 'New task',
          categoryId: result.categoryId || defaultCategoryId,
          status: result.status || 'To Do',
          priority: result.priority || 'Low',
          tags: result.tags ?? [],
          subtasks: result.subtasks ?? [],
          id: '',
        };

        this.taskService
          .createTask(taskToSave)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (savedTask) => {
              const savedWithCategory: TaskWithCategory = {
                ...savedTask,
                category: this.allTasks.find((task) => task.category?.id === savedTask.categoryId)
                  ?.category,
              };

              this.allTasks = [...this.allTasks, savedWithCategory];
              this.applyFiters();
            },
            error: (err) => console.error('Failed to create task', err),
          });
      });
  }

  onTaskDeleted(id: string): void {
    this.allTasks = this.allTasks.filter((t) => t.id !== id);
    this.applyFiters();
  }

  onTaskStatusChange(event: { task: TaskWithCategory; newStatus: string }) {
    const newTask = {
      ...event.task,
      status: event.newStatus as 'To Do' | 'In Progress' | 'Completed',
    };

    const taskIndex = this.allTasks.findIndex((task) => task.id === newTask.id);
    if (taskIndex !== -1) {
      this.allTasks[taskIndex] = newTask;
      this.applyFiters();
    }

    this.taskService
      .updateTask(newTask.id, newTask)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log(`ok: ${newTask.status}`);
        },
        error: (err) => {
          console.log('error', err);
        },
      });
  }

  onSearchChange(): void {
    this.applyFiters();
  }
}
