// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbsTickerConfigComponent } from './kbs-ticker-config.component';

describe('KbsTickerConfigComponent', () => {
  let component: KbsTickerConfigComponent;
  let fixture: ComponentFixture<KbsTickerConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbsTickerConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbsTickerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
