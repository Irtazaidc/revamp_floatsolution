// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitRemarksComponent } from './components/visit-remarks/visit-remarks.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [VisitRemarksComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  exports: [VisitRemarksComponent]
})
export class RemarksModule { }
