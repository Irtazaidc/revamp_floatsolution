// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesComponent } from './components/sales/sales.component';
import { AnalyticsRoutingModule } from './analytics-routing.module';



@NgModule({
  declarations: [SalesComponent],
  imports: [
    CommonModule,
    AnalyticsRoutingModule]
})
export class AnalyticsModule { }
