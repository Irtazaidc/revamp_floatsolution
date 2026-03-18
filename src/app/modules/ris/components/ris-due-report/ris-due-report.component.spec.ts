// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisDueReportComponent } from './ris-due-report.component';

describe('RisDueReportComponent', () => {
  let component: RisDueReportComponent;
  let fixture: ComponentFixture<RisDueReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisDueReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisDueReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
