// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RackingRoutingComponent } from './components/racking-routing/racking-routing.component';
import { RackingRoutingRoutingModule } from './racking-routing-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AccessioningComponent } from './components/accessioning/accessioning.component';
import { MatTabsModule } from '@angular/material/tabs';
import { SampleTransferComponent } from './components/sample-transfer/sample-transfer.component';
import { RackingRoutingParentComponent } from './components/racking-routing-parent/racking-routing-parent.component';
import { SampleReceiveComponent } from './components/sample-receive/sample-receive.component';
import { AccessioningParentComponent } from './components/accessioning-parent/accessioning-parent.component';

@NgModule({
  declarations: [RackingRoutingComponent, AccessioningComponent, SampleTransferComponent,RackingRoutingParentComponent, SampleReceiveComponent, AccessioningParentComponent],
  imports: [
    CommonModule,
    RackingRoutingRoutingModule,
    SharedModule,
    MatTabsModule
  ]
})
export class RackingRoutingModule { }
