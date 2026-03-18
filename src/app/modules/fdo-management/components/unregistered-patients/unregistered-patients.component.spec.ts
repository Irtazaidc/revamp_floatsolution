// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnregisteredPatientsComponent } from './unregistered-patients.component';

describe('UnregisteredPatientsComponent', () => {
  let component: UnregisteredPatientsComponent;
  let fixture: ComponentFixture<UnregisteredPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnregisteredPatientsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnregisteredPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
