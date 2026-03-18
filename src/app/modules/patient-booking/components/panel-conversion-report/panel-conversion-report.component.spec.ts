// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelConversionReportComponent } from './panel-conversion-report.component';

describe('PanelConversionReportComponent', () => {
  let component: PanelConversionReportComponent;
  let fixture: ComponentFixture<PanelConversionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelConversionReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelConversionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
