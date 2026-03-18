// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredPatientsComponent } from './registered-patients.component';

describe('RegisteredPatientsComponent', () => {
  let component: RegisteredPatientsComponent;
  let fixture: ComponentFixture<RegisteredPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisteredPatientsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteredPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
