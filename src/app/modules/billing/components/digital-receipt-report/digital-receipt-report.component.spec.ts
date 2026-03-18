// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalReceiptReportComponent } from './digital-receipt-report.component';

describe('DigitalReceiptReportComponent', () => {
  let component: DigitalReceiptReportComponent;
  let fixture: ComponentFixture<DigitalReceiptReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DigitalReceiptReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalReceiptReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
