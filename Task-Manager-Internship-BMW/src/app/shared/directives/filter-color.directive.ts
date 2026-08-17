import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  inject,
  OnChanges,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[filterColor]',
  standalone: true,
})
export class FilterColor implements OnChanges {
  @Input('filterColor') color!: string;
  @Input() active = false;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  private isHovered = false;

  ngOnChanges(): void {
    this.applyStyles();
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    this.isHovered = true;
    this.applyStyles();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isHovered = false;
    this.applyStyles();
  }

  private applyStyles(): void {
    // this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.2s ease-in-out');

    if (this.active) {
      this.renderer.setStyle(this.el.nativeElement, 'border', `2px solid ${this.color}90`);
      this.renderer.setStyle(this.el.nativeElement, 'background-color', `${this.color}20`);
      this.renderer.setStyle(this.el.nativeElement, 'color', `${this.color}90`);
    } else if (this.isHovered) {
      this.renderer.setStyle(this.el.nativeElement, 'border', `2px solid ${this.color}60`);
      this.renderer.setStyle(this.el.nativeElement, 'background-color', `${this.color}30`);
      this.renderer.setStyle(this.el.nativeElement, 'color', `${this.color}90`);
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'border');
      this.renderer.removeStyle(this.el.nativeElement, 'background-color');
      this.renderer.removeStyle(this.el.nativeElement, 'color');
    }
  }
}
