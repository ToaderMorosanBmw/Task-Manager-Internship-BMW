import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'assigneeInitials',
  standalone: true
})
export class AssigneeInitialsPipe implements PipeTransform {
  transform(assignee: string | undefined | null): string {
    if (!assignee) return '';
    const names = assignee.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}
