// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestComparisonComponent } from './request-comparison.component';

describe('RequestComparisonComponent', () => {
  let component: RequestComparisonComponent;
  let fixture: ComponentFixture<RequestComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
