import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { TaskColumnComponent } from '../task-column/task-column.component';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  switchMap,
  map,
  filter,
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { FilterService } from '../../../core/services/filter.service';
import { TaskFilterRowComponent } from '../task-filter-row/task-filter-row.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { TaskTableComponent } from '../task-table/task-table.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TaskCalendarComponent } from '../task-calendar/task-calendar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [
    TaskColumnComponent,
    TaskFilterRowComponent,
    CdkDropListGroup,
    MatProgressSpinnerModule,
    FormsModule,
    MatButtonToggleModule,
    TaskTableComponent,
    TaskCalendarComponent,
    MatIconModule,
    MatTooltipModule,

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
  view: 'table' | 'board' = 'board';
  private readonly VIEW_KEY = 'view-preference';
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
  private searchSubject = new Subject<string>();
  private snackBar = inject(MatSnackBar);

  get todoTasks() {
    return this.getFilteredTasks(TaskStatus.TODO);
  }
  get inProgressTasks() {
    return this.getFilteredTasks(TaskStatus.IN_PROGRESS);
  }
  get completedTasks() {
    return this.getFilteredTasks(TaskStatus.COMPLETED);
  }

  get completedPercentage(): number {
    if (this.allTasks.length === 0) {
      return 0;
    }

    const completedTasks = this.allTasks.filter((task) => task.status === TaskStatus.COMPLETED);

    return Math.round((completedTasks.length / this.allTasks.length) * 100);
  }

  get overdueCount(): number {
    return this.allTasks.filter((task) => new Date(task.dueDate || '') < new Date()).length;
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
    const savedView = localStorage.getItem(this.VIEW_KEY);
    if (savedView === 'table' || savedView === 'board') {
      this.view = savedView;
    }

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue) => {
        this.searchText = searchValue;
        this.applyFilters();
      });
  }
  applyFilters(): void {
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
    this.applyFilters();
  }
  onPrioritySelected(priority: string): void {
    this.selectedPriority = priority;
    this.applyFilters();
  }
  onCreateTaskClick(): void {
    const defaultCategoryId = this.allTasks[0]?.category?.id ?? '';
    const taskToEdit: TaskWithCategory = {
      id: '',
      title: '',
      description: '',
      categoryId: defaultCategoryId,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      tags: [],
      subtasks: [],
    };
    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '520px',
      data: { task: taskToEdit },
    });
    dialogRef
      .afterClosed()
      .pipe(
        filter((result): result is TaskWithCategory => Boolean(result)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        const taskToSave: Task = {
          ...result,
          title: result.title.trim() || 'New task',
          categoryId: result.categoryId || defaultCategoryId,
          status: result.status || TaskStatus.TODO,
          priority: result.priority || TaskPriority.LOW,
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
              this.applyFilters();
            },
            error: (err) => console.error('Failed to create task', err),
          });
      });
  }
  onTaskDeleted(id: string): void {
    this.allTasks = this.allTasks.filter((t) => t.id !== id);
    this.applyFilters();
  }
  onTaskStatusChange(event: { task: TaskWithCategory; newStatus: string }) {
    const newTask = {
      ...event.task,
      status: event.newStatus as TaskStatus,
    };
    const taskIndex = this.allTasks.findIndex((task) => task.id === newTask.id);
    if (taskIndex !== -1) {
      this.allTasks[taskIndex] = newTask;
      this.applyFilters();
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
    this.applyFilters();
  }

  exportToCSV(): void {
    if (!this.allTasks || this.allTasks.length === 0) {
      this.snackBar.open('No tasks for export.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const headers = [
      'ID',
      'Title',
      'Description',
      'Category Title',
      'Priority',
      'Due Date',
      'Estimated Time',
      'Status',
      'Tags',
      'Assignee',
      'Subtasks - Completed',
      'Subtasks - In Progress',
    ];

    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const task of this.allTasks) {
      const id = task.id;
      const title = task.title;
      const description = task.description || '';
      const categoryTitle = task.category?.title;
      const priority = task.priority;

      const rawDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-CA') : '';
      const dueDate = rawDate ? `="${rawDate}"` : '';
      const estimatedTime = task.estimatedTime;
      const status = task.status;

      const tags = task.tags && task.tags.length > 0 ? task.tags.join(';') : '';
      const assignee = task.assignee;

      let completed = '';
      let inProgress = '';
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((task) => {
          if (task.completed) {
            completed += task.title + ', ';
          } else {
            inProgress += task.title + ', ';
          }
        });
      }

      const rowValues = [
        id,
        title,
        description,
        categoryTitle,
        priority,
        dueDate,
        estimatedTime,
        status,
        tags,
        assignee,
        completed,
        inProgress,
      ];

      const formattedRow = rowValues.map((value) => {
        const stringValue = value !== null && value !== undefined ? String(value) : '';
        const escapedValue = stringValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
      });

      csvRows.push(formattedRow.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'exported_tasks.csv');

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('CSV sucessfuly generated!', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }
}
