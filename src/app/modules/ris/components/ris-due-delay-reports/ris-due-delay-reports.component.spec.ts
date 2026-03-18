// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisDueDelayReportsComponent } from './ris-due-delay-reports.component';

describe('RisDueDelayReportsComponent', () => {
  let component: RisDueDelayReportsComponent;
  let fixture: ComponentFixture<RisDueDelayReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisDueDelayReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisDueDelayReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
