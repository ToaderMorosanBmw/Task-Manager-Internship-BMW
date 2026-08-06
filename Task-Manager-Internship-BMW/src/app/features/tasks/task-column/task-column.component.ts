import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { PriorityColor } from '../../../shared/directives/priority-color.directive';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TitleColor } from '../../../shared/directives/title-border-color.directive';
import { DotColor } from '../../../shared/directives/dot-color.directive';

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [TaskCardComponent, PriorityColor, CdkDropList, CdkDrag, TitleColor, DotColor],
  templateUrl: './task-column.component.html',
  styleUrl: './task-column.component.css',
})
export class TaskColumnComponent {
  @Input()
  title!: string;

  @Input()
  cardItems!: TaskWithCategory[];

  @Output()
  taskStausChanged = new EventEmitter<{ task: TaskWithCategory; newStatus: string }>();

  onCardDropped(event: CdkDragDrop<string>) {
    if (event.previousContainer !== event.container) {
      const oldTask = event.item.data as TaskWithCategory;
      const newStatus = event.container.data;

      this.taskStausChanged.emit({
        task: oldTask,
        newStatus: newStatus,
      });
    }
  }
}
