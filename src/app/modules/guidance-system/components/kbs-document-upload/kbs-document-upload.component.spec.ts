// @ts-nocheck
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbsDocumentUploadComponent } from './kbs-document-upload.component';

describe('KbsDocumentUploadComponent', () => {
  let component: KbsDocumentUploadComponent;
  let fixture: ComponentFixture<KbsDocumentUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbsDocumentUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbsDocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
