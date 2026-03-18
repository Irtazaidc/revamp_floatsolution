// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUserCountReportComponent } from './app-user-count-report.component';

describe('AppUserCountReportComponent', () => {
  let component: AppUserCountReportComponent;
  let fixture: ComponentFixture<AppUserCountReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUserCountReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppUserCountReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
