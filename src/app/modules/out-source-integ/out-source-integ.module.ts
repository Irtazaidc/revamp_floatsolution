// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OladocRegDataComponent } from './ola-doc/components/oladoc-reg-data/oladoc-reg-data.component';
import { GenReportsModule } from '../gen-reports/gen-reports.module';
import { OladocRptComponent } from '../gen-reports/components/oladoc-rpt/oladoc-rpt.component';



@NgModule({
  declarations: [OladocRegDataComponent],
  imports: [
    CommonModule
  ],
  exports: [
    OladocRegDataComponent
  ]
})
export class OutSourceIntegModule { }
