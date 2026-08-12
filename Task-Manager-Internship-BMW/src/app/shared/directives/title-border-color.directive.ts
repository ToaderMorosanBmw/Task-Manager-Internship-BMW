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
  selector: '[titleColor]',
  standalone: true,
})
export class TitleColor implements OnChanges {
  @Input('titleColor') priority!: string;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    const colors: Record<string, string> = {
      'To Do': 'purple',
      'In Progress': 'orange',
      Completed: 'green',
    };

    const color = colors[this.priority] || 'gray';
    this.renderer.setStyle(this.el.nativeElement, 'border-bottom', `3px solid ${color}`);
  }
}
