import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterColor } from '../../../shared/directives/filter-color';

@Component({
  selector: 'app-task-filter-row',
  standalone: true,
  imports: [FilterColor],
  templateUrl: './task-filter-row.component.html',
  styleUrl: './task-filter-row.component.css'
})
export class TaskFilterRowComponent {
  @Input()
  filterName: string ='';
  @Input()
  buttons: {title: string, color: string}[] =[];
  @Input()
  selectedValue: string = ''
  @Output()
  selected = new EventEmitter<string>();

  onButtonClick(button: string): void {
    if (this.selectedValue === button) {
      this.selected.emit('');
    } else {
      this.selected.emit(button);
    }
  }
}
