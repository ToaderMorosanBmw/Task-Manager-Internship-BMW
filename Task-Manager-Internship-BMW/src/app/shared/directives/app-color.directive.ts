import {
  Directive,
  ElementRef,
  OnChanges,
  inject,
  Input,
  Renderer2,
} from '@angular/core';
import { TaskStatus, TaskPriority } from '../../core/models/task.model';

@Directive({
  selector: '[appColor]',
  standalone: true,
})
export class AppColorDirective implements OnChanges {
  @Input('appColor') value!: string;
  @Input() colorType: 'dot' | 'border-bottom' | 'border-top' = 'dot';

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    const colors: Record<string, string> = {
      [TaskStatus.TODO]: 'purple',
      [TaskStatus.IN_PROGRESS]: 'orange',
      [TaskStatus.COMPLETED]: 'green',
      [TaskPriority.LOW]: 'green',
      [TaskPriority.MEDIUM]: 'orange',
      [TaskPriority.HIGH]: 'red',
    };

    const color = colors[this.value] || 'gray';

    if (this.colorType === 'dot') {
      this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
    } else if (this.colorType === 'border-bottom') {
      this.renderer.setStyle(this.el.nativeElement, 'border-bottom', `3px solid ${color}`);
    } else if (this.colorType === 'border-top') {
      this.renderer.setStyle(this.el.nativeElement, 'border-top', `6px solid ${color}`);
    }
  }
}
