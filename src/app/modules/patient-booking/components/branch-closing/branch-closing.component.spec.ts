// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchClosingComponent } from './branch-closing.component';

describe('BranchClosingComponent', () => {
  let component: BranchClosingComponent;
  let fixture: ComponentFixture<BranchClosingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchClosingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchClosingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
