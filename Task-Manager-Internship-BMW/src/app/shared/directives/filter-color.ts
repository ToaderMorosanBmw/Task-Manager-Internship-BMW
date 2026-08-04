import { Directive, ElementRef, Input, Renderer2, inject, OnChanges } from '@angular/core';

@Directive({
  selector: '[filterColor]',
  standalone: true
})
export class FilterColor implements OnChanges {
  @Input('filterColor') color!: string;
  @Input() active = false;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnChanges(): void {
    if (!this.active) {
      this.renderer.removeStyle(this.el.nativeElement, 'border');
      this.renderer.removeStyle(this.el.nativeElement, 'background-color');
      this.renderer.removeStyle(this.el.nativeElement, 'box-shadow');
      return;
    }


    this.renderer.setStyle(this.el.nativeElement, 'border', `1px solid ${this.color}90`);
    this.renderer.setStyle(this.el.nativeElement, 'background-color', `${this.color}10`);

  }
}