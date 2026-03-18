// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceComponent } from './patient-insurance.component';

describe('PatientInsuranceComponent', () => {
  let component: PatientInsuranceComponent;
  let fixture: ComponentFixture<PatientInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientInsuranceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
