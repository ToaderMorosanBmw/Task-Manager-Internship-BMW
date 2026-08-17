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
  columnTitle!: string;

  @Input()
  cardItems!: TaskWithCategory[];

  @Input() selectionMode = false;
  @Input() selectedTaskIds = new Set<string>();

  @Output()
  taskStausChanged = new EventEmitter<{ task: TaskWithCategory; newStatus: string }>();

  @Output() deleted = new EventEmitter<string>();
  @Output() selected = new EventEmitter<{ id: string; selected: boolean }>();

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

  onTaskDeleted(id: string): void {
    this.deleted.emit(id);
  }

  onTaskSelected(event: { id: string; selected: boolean }): void {
    this.selected.emit(event);
  }
}
