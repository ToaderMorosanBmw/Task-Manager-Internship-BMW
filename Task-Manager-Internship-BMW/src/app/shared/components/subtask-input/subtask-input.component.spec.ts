import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtaskInputComponent } from './subtask-input.component';

describe('SubtaskInputComponent', () => {
  let component: SubtaskInputComponent;
  let fixture: ComponentFixture<SubtaskInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtaskInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtaskInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
