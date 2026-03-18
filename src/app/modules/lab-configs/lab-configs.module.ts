// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachineMgtComponent } from './components/machine-mgt/machine-mgt.component';
import { SharedModule } from '../shared/shared.module';
import { LabConfigsRoutingModule } from './lab-configs-routing.module';
import { RackMgtComponent } from './components/rack-mgt/rack-mgt.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TestMachinePriorityComponent } from './components/test-machine-priority/test-machine-priority.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LabMachineStatusManagementComponent } from './components/lab-machine-status-management/lab-machine-status-management.component';

@NgModule({
  declarations: [MachineMgtComponent, RackMgtComponent, TestMachinePriorityComponent, LabMachineStatusManagementComponent],
  imports: [
    CommonModule,
    LabConfigsRoutingModule,
    SharedModule,
    MatTabsModule,
    DragDropModule
  ]
})
export class LabConfigsModule { }
