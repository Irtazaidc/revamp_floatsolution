// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseaseConfigComponent } from './disease-config.component';

describe('DiseaseConfigComponent', () => {
  let component: DiseaseConfigComponent;
  let fixture: ComponentFixture<DiseaseConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiseaseConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseaseConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
