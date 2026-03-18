// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceDashboardComponent } from './patient-insurance-dashboard.component';

describe('PatientInsuranceDashboardComponent', () => {
  let component: PatientInsuranceDashboardComponent;
  let fixture: ComponentFixture<PatientInsuranceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientInsuranceDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
