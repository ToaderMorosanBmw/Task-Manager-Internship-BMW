import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  format,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarView,
  CalendarModule,
} from 'angular-calendar';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { CategoryService } from '../../../core/services/category.service';
import { Task } from '../../../core/models/task.model';
import { Category } from '../../../core/models/category.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, map } from 'rxjs';
const colors: Record<string, any> = {
  High: {
    primary: '#ef4444',
    secondary: '#fee2e2',
  },
  Medium: {
    primary: '#f59e0b',
    secondary: '#fef3c7',
  },
  Low: {
    primary: '#2e7d32',
    secondary: '#e8f5e9',
  },
};
@Component({
  selector: 'app-task-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
  ],
  templateUrl: './task-calendar.component.html',
  styleUrl: './task-calendar.component.css',
})
export class TaskCalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh = new Subject<void>();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.loadTasksAsEvents();
  }
  private loadTasksAsEvents(): void {
    this.categoryService
      .getAllCategories()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((categories: Category[]) => {
          return this.taskService.getAllTasks().pipe(
            map((tasks: Task[]) => {
              return tasks.map((task) => {
                const category = categories.find(
                  (c) => c.id === task.categoryId
                );
                const dueDate = task.dueDate
                  ? new Date(task.dueDate)
                  : startOfDay(new Date());
                const start = task.scheduledStart
                  ? new Date(task.scheduledStart)
                  : startOfDay(dueDate);
                const end = task.scheduledEnd
                  ? new Date(task.scheduledEnd)
                  : task.scheduledStart
                  ? new Date(new Date(task.scheduledStart).getTime() + 60 * 60 * 1000)
                  : endOfDay(dueDate);
                const allDay = !task.scheduledStart;
                return {
                  title: task.title,
                  start,
                  end,
                  allDay,
                  color: colors[task.priority ?? 'Low'] ?? colors['Low'],
                  draggable: false,
                  resizable: { beforeStart: false, afterEnd: false },
                  meta: { task, category },
                } as CalendarEvent;
              });
            })
          );
        })
      )
      .subscribe({
        next: (events: CalendarEvent[]) => {
          this.events = events;
        },
        error: (err) => {
          console.error('Failed to load calendar events:', err);
        },
      });
  }
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (
      (new Date(this.viewDate).toDateString() === date.toDateString() &&
        this.activeDayIsOpen === true) ||
      events.length === 0
    ) {
      this.activeDayIsOpen = false;
    } else {
      this.activeDayIsOpen = true;
    }
    this.viewDate = date;
  }
  setView(view: CalendarView) {
    this.view = view;
  }
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
    this.closeOpenMonthViewDay();
  }
  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.closeOpenMonthViewDay();
  }
  goToToday(): void {
    this.viewDate = new Date();
    this.closeOpenMonthViewDay();
  }
  getMonthYear(): string {
    return format(this.viewDate, 'MMMM yyyy');
  }
}