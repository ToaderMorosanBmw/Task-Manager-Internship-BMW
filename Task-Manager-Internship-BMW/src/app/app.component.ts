import { Component, Inject, Renderer2, OnInit, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isDarkMode = false;
  private readonly THEME_KEY = 'theme-preference';

  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.renderer.addClass(this.document.body, 'dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-theme');
      localStorage.setItem(this.THEME_KEY, 'dark');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
      localStorage.setItem(this.THEME_KEY, 'light');
    }
  }
}
