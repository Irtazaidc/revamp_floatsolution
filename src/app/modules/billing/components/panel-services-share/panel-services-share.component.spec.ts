// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelServicesShareComponent } from './panel-services-share.component';

describe('PanelServicesShareComponent', () => {
  let component: PanelServicesShareComponent;
  let fixture: ComponentFixture<PanelServicesShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelServicesShareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelServicesShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
