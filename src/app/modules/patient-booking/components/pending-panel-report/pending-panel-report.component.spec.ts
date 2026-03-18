// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPanelReportComponent } from './pending-panel-report.component';

describe('PendingPanelReportComponent', () => {
  let component: PendingPanelReportComponent;
  let fixture: ComponentFixture<PendingPanelReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingPanelReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingPanelReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
