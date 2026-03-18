// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcPortableServicesShareReportComponent } from './hc-portable-services-share-report.component';

describe('HcPortableServicesShareReportComponent', () => {
  let component: HcPortableServicesShareReportComponent;
  let fixture: ComponentFixture<HcPortableServicesShareReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcPortableServicesShareReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HcPortableServicesShareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
