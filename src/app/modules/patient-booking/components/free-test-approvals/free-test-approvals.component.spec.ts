// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeTestApprovalsComponent } from './free-test-approvals.component';

describe('FreeTestApprovalsComponent', () => {
  let component: FreeTestApprovalsComponent;
  let fixture: ComponentFixture<FreeTestApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreeTestApprovalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeTestApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
