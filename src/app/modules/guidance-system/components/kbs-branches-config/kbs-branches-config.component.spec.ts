// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbsBranchesConfigComponent } from './kbs-branches-config.component';

describe('KbsBranchesConfigComponent', () => {
  let component: KbsBranchesConfigComponent;
  let fixture: ComponentFixture<KbsBranchesConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbsBranchesConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbsBranchesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
