// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratorActivationLogsComponent } from './generator-activation-logs.component';

describe('GeneratorActivationLogsComponent', () => {
  let component: GeneratorActivationLogsComponent;
  let fixture: ComponentFixture<GeneratorActivationLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratorActivationLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratorActivationLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
