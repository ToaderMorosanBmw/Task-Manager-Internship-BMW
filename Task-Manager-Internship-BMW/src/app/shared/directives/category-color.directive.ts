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
  selector: '[categoryColor]',
  standalone: true,
})
export class CategoryColor implements OnChanges {
  @Input('categoryColor') color!: string;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    const value = this.color || 'grey';
    this.renderer.setStyle(this.el.nativeElement, 'background-color', value);
  }
}
