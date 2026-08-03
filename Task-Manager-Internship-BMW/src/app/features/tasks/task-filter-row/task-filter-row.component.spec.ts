import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskFilterRowComponent } from './task-filter-row.component';

describe('TaskFilterRowComponent', () => {
  let component: TaskFilterRowComponent;
  let fixture: ComponentFixture<TaskFilterRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFilterRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskFilterRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
