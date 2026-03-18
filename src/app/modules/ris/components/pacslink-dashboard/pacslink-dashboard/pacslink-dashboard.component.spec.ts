// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacslinkDashboardComponent } from './pacslink-dashboard.component';

describe('PacslinkDashboardComponent', () => {
  let component: PacslinkDashboardComponent;
  let fixture: ComponentFixture<PacslinkDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PacslinkDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PacslinkDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
