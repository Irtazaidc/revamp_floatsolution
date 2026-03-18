// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTestRequestComponent } from './employee-test-request.component';

describe('EmployeeTestRequestComponent', () => {
  let component: EmployeeTestRequestComponent;
  let fixture: ComponentFixture<EmployeeTestRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeTestRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTestRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
