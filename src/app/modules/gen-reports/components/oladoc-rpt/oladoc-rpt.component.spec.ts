// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OladocRptComponent } from './oladoc-rpt.component';

describe('OladocRptComponent', () => {
  let component: OladocRptComponent;
  let fixture: ComponentFixture<OladocRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OladocRptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OladocRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
