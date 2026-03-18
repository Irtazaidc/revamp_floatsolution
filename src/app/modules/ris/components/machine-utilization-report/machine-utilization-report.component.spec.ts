// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineUtilizationReportComponent } from './machine-utilization-report.component';

describe('MachineUtilizationReportComponent', () => {
  let component: MachineUtilizationReportComponent;
  let fixture: ComponentFixture<MachineUtilizationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineUtilizationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineUtilizationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
