// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologistAvailabilityComponent } from './radiologist-availability.component';

describe('RadiologistAvailabilityComponent', () => {
  let component: RadiologistAvailabilityComponent;
  let fixture: ComponentFixture<RadiologistAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologistAvailabilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiologistAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
