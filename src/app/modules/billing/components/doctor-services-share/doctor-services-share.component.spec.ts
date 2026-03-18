// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorServicesShareComponent } from './doctor-services-share.component';

describe('DoctorServicesShareComponent', () => {
  let component: DoctorServicesShareComponent;
  let fixture: ComponentFixture<DoctorServicesShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorServicesShareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorServicesShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
