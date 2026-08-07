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
  selector: '[priorityColor]',
  standalone: true,
})
export class PriorityColor implements OnChanges {
  @Input('priorityColor') priority!: string;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    const colors: Record<string, string> = {
      Low: 'green',
      Medium: 'orange',
      High: 'red',
    };

    const color = colors[this.priority] || 'gray';
    this.renderer.setStyle(this.el.nativeElement, 'border-top', `6px solid ${color}`);
  }
}
