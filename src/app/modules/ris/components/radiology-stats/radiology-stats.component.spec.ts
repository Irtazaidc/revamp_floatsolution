// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyStatsComponent } from './radiology-stats.component';

describe('RadiologyStatsComponent', () => {
  let component: RadiologyStatsComponent;
  let fixture: ComponentFixture<RadiologyStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyStatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiologyStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
