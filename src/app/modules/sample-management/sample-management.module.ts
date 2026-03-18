// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleManagementRoutingModule } from './sample-management-routing.module';
import { PhlebotoyComponent } from './components/phlebotoy/phlebotoy.component';
import { RemarksModule } from '../remarks/remarks.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [PhlebotoyComponent],
  imports: [
    CommonModule,
    SharedModule,
    SampleManagementRoutingModule,
    RemarksModule
  ]
})
export class SampleManagementModule { }
