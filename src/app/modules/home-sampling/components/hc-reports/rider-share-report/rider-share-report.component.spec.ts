// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiderShareReportComponent } from './rider-share-report.component';

describe('RiderShareReportComponent', () => {
  let component: RiderShareReportComponent;
  let fixture: ComponentFixture<RiderShareReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiderShareReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiderShareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
