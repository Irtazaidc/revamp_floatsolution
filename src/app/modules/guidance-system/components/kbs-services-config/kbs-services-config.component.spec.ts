// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbsServicesConfigComponent } from './kbs-services-config.component';

describe('KbsServicesConfigComponent', () => {
  let component: KbsServicesConfigComponent;
  let fixture: ComponentFixture<KbsServicesConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbsServicesConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbsServicesConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
