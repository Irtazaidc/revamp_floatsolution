// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitResultEntryComponent } from './components/visit-result-entry/visit-result-entry.component';
import { VisitResultEntryRoutingModule } from './visit-result-entry-routing.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    VisitResultEntryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    VisitResultEntryRoutingModule
  ]
})
export class VisitResultEntryModule { }
