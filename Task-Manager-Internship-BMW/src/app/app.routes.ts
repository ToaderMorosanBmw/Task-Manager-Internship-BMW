import { Routes } from '@angular/router';
import { TaskDashboardComponent } from './features/tasks/task-dashboard/task-dashboard.component';
import { TaskPageComponent } from './features/tasks/task-page/task-page.component';
import { TaskModalComponent } from './features/tasks/task-modal/task-modal.component';

export const routes: Routes = [{
    path: '',
    component: TaskDashboardComponent
},{
    path: 'tasks/:id',
    component: TaskPageComponent
},
{
    path: '**',
    redirectTo: ''
}];
