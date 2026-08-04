import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { PriorityColor } from '../../../shared/directives/priority-color.directive';

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [TaskCardComponent, PriorityColor],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.css'
})
export class TaskColumnComponent {
  @Input()
  title!: string;

  @Input()
  cardItems!: TaskWithCategory[]

  @Output() deleted = new EventEmitter<string>();

  onTaskDeleted(id: string): void {
    this.deleted.emit(id);
  }
}
