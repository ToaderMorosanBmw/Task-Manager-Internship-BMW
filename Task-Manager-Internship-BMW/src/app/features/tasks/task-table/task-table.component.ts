import { Component, inject, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, RowClickedEvent } from 'ag-grid-community';
import { TaskWithCategory } from '../../../core/models/task-with-category.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.css',
})
export class TaskTableComponent {
  @Input()
  allTasks: TaskWithCategory[] = [];

  private router = inject(Router);

  defaultColDef: ColDef = {
    resizable: false,
  };

  colDefs: ColDef[] = [
    {
      field: 'title',
      flex: 0.75,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      field: 'status',
      flex: 0.5,
      sort: 'asc',
      comparator: (valueA: string, valueB: string) => {
        const order: Record<string, number> = {
          'To Do': 1,
          'In Progress': 2,
          Completed: 3,
        };
        return (order[valueA] || 4) - (order[valueB] || 4);
      },
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      headerClass: 'center-header',
      cellRenderer: (params: any) => {
        if (!params.value) return '';

        let textColor = '#808080';
        if (params.value === 'To Do') textColor = '#a855f7';
        if (params.value === 'In Progress') textColor = '#eab308';
        if (params.value === 'Completed') textColor = '#22c55e';

        const bgColor = `${textColor}26`;

        return `
          <span style="
            color: ${textColor};
            background-color: ${bgColor};
            padding: 4px 12px;
            border-radius: 10px;
            display: inline-block;
            line-height: normal;
          ">${params.value}</span>
        `;
      },
    },
    {
      field: 'priority',
      flex: 0.5,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      headerClass: 'center-header',
      cellRenderer: (params: any) => {
        if (!params.value) return '';

        let textColor = '#808080';
        if (params.value === 'Low') textColor = '#22c55e';
        if (params.value === 'Medium') textColor = '#f59e0b';
        if (params.value === 'High') textColor = '#ef4444';

        const bgColor = `${textColor}26`;

        return `
          <span style="
            color: ${textColor};
            background-color: ${bgColor};
            padding: 4px 12px;
            border-radius: 10px;
            display: inline-block;
            line-height: normal;
          ">${params.value}</span>
        `;
      },
    },
    {
      field: 'category.title',
      headerName: 'Category',
      flex: 0.5,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      headerClass: 'center-header',
      cellRenderer: (params: any) => {
        if (!params.value) return '';

        const textColor = params.data?.category?.color || '#808080';
        const bgColor = textColor.startsWith('#') ? `${textColor}26` : 'rgba(128, 128, 128, 0.15)';

        return `
          <span style="
            color: ${textColor};
            background-color: ${bgColor};
            padding: 4px 12px;
            border-radius: 10px;
            display: inline-block;
            line-height: normal;
          ">${params.value}</span>
        `;
      },
    },
    {
      field: 'description',
      flex: 2,
      cellStyle: { display: 'block', lineHeight: '56px' },
    },
    {
      field: 'assignee',
      flex: 0.5,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      headerClass: 'center-header',
    },
  ];

  onRowClicked(event: RowClickedEvent) {
    if (event.data && event.data.id) {
      this.router.navigate(['/tasks', event.data.id]);
    }
  }
}
