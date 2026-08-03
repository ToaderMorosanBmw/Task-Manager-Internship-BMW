import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { CategoryColor } from '../../../shared/directives/category-color';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CategoryColor, RouterLink],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input()
  task!: TaskWithCategory;

  showFullTitle = false;

  onEditClick(): void {
    console.log('Edit button clicked for task:', this.task?.title);
  }

  onTitleMouseEnter(): void {
    this.showFullTitle = true;
  }

  onTitleMouseLeave(): void {
    this.showFullTitle = false;
  }
}
