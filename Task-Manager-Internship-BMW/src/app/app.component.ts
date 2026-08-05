import { Component, Inject, Renderer2, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // Asigură-te că RouterOutlet este importat

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isDarkMode = false;
  private readonly theme = '';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem(this.theme);

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.renderer.addClass(this.document.body, 'dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-theme');
      localStorage.setItem(this.theme, 'dark');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
      localStorage.setItem(this.theme, 'light');
    }
  }
}
