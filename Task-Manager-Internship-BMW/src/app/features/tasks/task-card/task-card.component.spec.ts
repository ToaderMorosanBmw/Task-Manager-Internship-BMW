import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { TaskService } from '../../../core/services/task.service';
import { TaskCardComponent } from './task-card.component';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['deleteTask', 'updateTask']);

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = {
      id: 'task-1',
      title: 'Test task',
      categoryId: 'cat-1',
      status: 'todo',
      priority: 'medium'
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete the task when the modal confirms deletion', () => {
    dialogSpy.open.and.returnValue({
      afterClosed: () => of({ deleted: true, id: 'task-1' })
    } as any);
    taskServiceSpy.deleteTask.and.returnValue(of(undefined));

    const deletedSpy = jasmine.createSpy('deleted');
    component.deleted.subscribe(deletedSpy);

    component.onEditClick(new MouseEvent('click'));

    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith('task-1');
    expect(deletedSpy).toHaveBeenCalledWith('task-1');
  });
});
