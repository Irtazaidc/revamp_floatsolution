// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SampleTrackingRoutingModule } from './sample-tracking-routing.module';

import { SharedModule } from '../shared/shared.module';
import { RemarksModule } from '../remarks/remarks.module';
import { SampleDispatchComponent } from './components/sample-dispatch/sample-dispatch.component';
import { SampleTrackingDashboardComponent } from './components/sample-tracking-dashboard/sample-tracking-dashboard.component';
import { SampleReceivingComponent } from './components/sample-receiving/sample-receiving.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PendingInvoiceCostComponent } from './components/pending-invoice-cost/pending-invoice-cost.component';
import { BaseChartDirective } from 'ng2-charts';


@NgModule({
  declarations: [SampleDispatchComponent, SampleTrackingDashboardComponent,SampleReceivingComponent, PendingInvoiceCostComponent],
  imports: [
    CommonModule,
    SharedModule,
    RemarksModule,
    SampleTrackingRoutingModule,
    MatCheckboxModule,
    BaseChartDirective,
    ScrollingModule
  ]
})
export class SampleTrackingModule { }
