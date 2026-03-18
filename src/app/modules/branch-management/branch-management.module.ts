// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BranchManagementRoutingModule } from './branch-management-routing.module';
import { BranchConfigComponent } from './components/branch-config/branch-config.component';



@NgModule({
  declarations: [BranchConfigComponent],
  imports: [
    CommonModule, 
    SharedModule,
    BranchManagementRoutingModule,
  ]
})
export class BranchManagementModule { }
