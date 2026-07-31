import { Component, Input } from '@angular/core';
import { Task } from '../../../core/models/task.model';
import { CategoryColor } from '../../../shared/directives/category-color';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CategoryColor],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input()
  task!: Task;
}
