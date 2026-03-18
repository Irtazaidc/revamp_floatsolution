// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeMedicalRecordComponent } from './employee-medical-record.component';

describe('EmployeeMedicalRecordComponent', () => {
  let component: EmployeeMedicalRecordComponent;
  let fixture: ComponentFixture<EmployeeMedicalRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeMedicalRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMedicalRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
