// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisDelaySummaryReportComponent } from './ris-delay-summary-report.component';

describe('RisDelaySummaryReportComponent', () => {
  let component: RisDelaySummaryReportComponent;
  let fixture: ComponentFixture<RisDelaySummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisDelaySummaryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisDelaySummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
