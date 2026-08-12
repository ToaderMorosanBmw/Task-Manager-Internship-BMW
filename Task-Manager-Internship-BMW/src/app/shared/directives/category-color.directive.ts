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
    const textColor = this.color || '#808080';
    const bgColor = textColor.startsWith('#') ? `${textColor}26` : 'rgba(128, 128, 128, 0.15)';

    this.renderer.setStyle(this.el.nativeElement, 'color', textColor);
    this.renderer.setStyle(this.el.nativeElement, 'background-color', bgColor);
    this.renderer.setStyle(this.el.nativeElement, 'padding', '4px 12px');
    this.renderer.setStyle(this.el.nativeElement, 'border-radius', '10px');
    this.renderer.setStyle(this.el.nativeElement, 'display', 'inline-block');
  }
}
