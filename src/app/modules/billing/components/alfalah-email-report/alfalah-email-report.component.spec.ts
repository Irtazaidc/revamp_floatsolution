// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlfalahEmailReportComponent } from './alfalah-email-report.component';

describe('AlfalahEmailReportComponent', () => {
  let component: AlfalahEmailReportComponent;
  let fixture: ComponentFixture<AlfalahEmailReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlfalahEmailReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlfalahEmailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
