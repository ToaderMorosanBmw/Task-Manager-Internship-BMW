import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskDashboardComponent } from './features/tasks/task-dashboard/task-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TaskDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Task-Manager-Internship-BMW';
}
