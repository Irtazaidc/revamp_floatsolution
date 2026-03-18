// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingComparisonComponent } from './booking-comparison.component';

describe('BookingComparisonComponent', () => {
  let component: BookingComparisonComponent;
  let fixture: ComponentFixture<BookingComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
