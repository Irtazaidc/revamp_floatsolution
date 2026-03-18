// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcCollectionReportComponent } from './hc-collection-report.component';

describe('HcCollectionReportComponent', () => {
  let component: HcCollectionReportComponent;
  let fixture: ComponentFixture<HcCollectionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcCollectionReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HcCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
