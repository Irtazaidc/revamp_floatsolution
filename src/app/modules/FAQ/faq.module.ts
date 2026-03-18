// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FAQRoutingModule } from './faq-routing.module';
// import { SharedModule } from '../../../app/shared/shared.module';
import { SharedModule } from '../shared/shared.module';
import { FAQListComponent } from './components/faq-list/faq-list.component';
import { CKEditorModule } from 'ckeditor4-angular';


@NgModule({
  declarations: [FAQListComponent],
  imports: [
    CommonModule,
    FAQRoutingModule,
    SharedModule,
    CKEditorModule
  ]
})
export class FAQModule { }
