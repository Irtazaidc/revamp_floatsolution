// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchServicesLogComponent } from './branch-services-log.component';

describe('BranchServicesLogComponent', () => {
  let component: BranchServicesLogComponent;
  let fixture: ComponentFixture<BranchServicesLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchServicesLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchServicesLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
