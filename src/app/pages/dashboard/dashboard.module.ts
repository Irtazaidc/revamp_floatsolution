// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardWrapperComponent } from 'src/app/_metronic/partials/content/dashboards/dashboard-wrapper/dashboard-wrapper.component';
import { DashboardsModule } from '../../_metronic/partials/content/dashboards/dashboards.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    DashboardsModule
  ],
})
export class DashboardModule {}
