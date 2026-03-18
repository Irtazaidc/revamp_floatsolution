// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayedCancellationRequestsComponent } from './delayed-cancellation-requests.component';

describe('DelayedCancellationRequestsComponent', () => {
  let component: DelayedCancellationRequestsComponent;
  let fixture: ComponentFixture<DelayedCancellationRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelayedCancellationRequestsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayedCancellationRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
