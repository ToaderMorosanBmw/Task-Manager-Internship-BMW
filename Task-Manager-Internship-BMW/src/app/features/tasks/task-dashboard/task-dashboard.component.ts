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
import { TaskFilterComponent } from "../task-filter/task-filter.component";
import { TaskFilterRowComponent } from "../task-filter-row/task-filter-row.component";

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [TaskColumnComponent, TaskFilterComponent, TaskFilterRowComponent],
  templateUrl: './task-dashboard.component.html',
  styleUrl: './task-dashboard.component.css',
})
export class TaskDashboardComponent implements OnInit {
  allTasks: TaskWithCategory[] = [];
  visibleTasks: TaskWithCategory[] = [];
  selectedCategory: string = '';
  selectedPriority: string = '';
  priorities: { title: string, color: string }[] = [
  { title: 'Low', color: '#2e7d32' },
  { title: 'Medium', color: '#f57c00' },
  { title: 'High', color: '#d32f2f' }
];
  categories: {title: string, color: string}[] = [];

  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);
  private filterService = inject(FilterService)

  get todoTasks() {
    return this.visibleTasks.filter((task) => task.status === 'To Do');
  }

  get inProgressTasks() {
    return this.visibleTasks.filter((task) => task.status === 'In Progress');
  }

  get completedTasks() {
    return this.visibleTasks.filter((task) => task.status === 'Completed');
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
                const matchedCategory = categories.find((category) => category.id === task.categoryId);
                // id must be string for === to work, json-server convers all fields id to string
                return {
                  ...task,
                  category: matchedCategory
                };
              })
            )
          );
        })
      )
      .subscribe((tasksWithCategory: TaskWithCategory[]) => {
        this.allTasks = tasksWithCategory;
        this.visibleTasks = tasksWithCategory;

        const categoryColor: Record<string, {title: string, color: string}> = {}

        tasksWithCategory.forEach(task => {
          categoryColor[task.category!.title] = { title: task.category!.title, color: task.category!.color};
        })

        this.categories = Object.values(categoryColor);
      });
  }

  applyFiters(): void {
    let filtered = this.allTasks;

    if(this.selectedCategory){
      filtered = this.filterService.filterByCategory(filtered, this.selectedCategory);
    }
    if(this.selectedPriority){
      filtered = this.filterService.filterByPriority(filtered, this.selectedPriority);
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
}
