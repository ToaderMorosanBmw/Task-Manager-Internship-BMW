import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dueDateStatus',
  standalone: true,
})
export class DueDateStatusPipe implements PipeTransform {
  transform(
    dueDateVal: string | Date | undefined | null
  ): { text: string; status: 'overdue' | 'today' | 'normal' } | null {
    if (!dueDateVal) return null;

    const dueDate = new Date(dueDateVal);
    const today = new Date();

    if (Number.isNaN(dueDate.getTime())) {
      return null;
    }

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', status: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Today', status: 'today' };
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      return { text: dueDate.toLocaleDateString('en-US', options), status: 'normal' };
    }
  }
}
