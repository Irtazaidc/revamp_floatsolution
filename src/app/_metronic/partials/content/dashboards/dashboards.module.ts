// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dashboard4Component } from './dashboard4/dashboard4.component';
import { RouterModule } from '@angular/router'
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';

@NgModule({
  declarations: [
    Dashboard4Component,
    DashboardWrapperComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    DashboardWrapperComponent,
    
  ]
})
export class DashboardsModule { }