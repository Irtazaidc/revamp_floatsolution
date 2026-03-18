// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceInquiryReportComponent } from './insurance-inquiry-report.component';

describe('InsuranceInquiryReportComponent', () => {
  let component: InsuranceInquiryReportComponent;
  let fixture: ComponentFixture<InsuranceInquiryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsuranceInquiryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceInquiryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
