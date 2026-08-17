import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { AppColorDirective } from '../../../shared/directives/app-color.directive';

@Component({
  selector: 'app-task-column',
  standalone: true,
  imports: [TaskCardComponent, CdkDropList, CdkDrag, AppColorDirective],
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

  @Output() deleted = new EventEmitter<string>();

  onTaskDeleted(id: string): void {
    this.deleted.emit(id);
  }
}
