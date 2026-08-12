import {
  Directive,
  ElementRef,
  OnChanges,
  inject,
  Input,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[dotColor]',
  standalone: true,
})
export class DotColor implements OnChanges {
  @Input('dotColor') priority!: string;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    const colors: Record<string, string> = {
      'To Do': 'purple',
      'In Progress': 'orange',
      Completed: 'green',
    };

    const color = colors[this.priority] || 'gray';
    this.renderer.setStyle(this.el.nativeElement, 'background-color', `${color}`);
  }
}
