// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { SampleDispatchComponent } from './components/sample-dispatch/sample-dispatch.component';
import { SampleTrackingDashboardComponent } from './components/sample-tracking-dashboard/sample-tracking-dashboard.component';
import { PendingInvoiceCostComponent } from './components/pending-invoice-cost/pending-invoice-cost.component';
import { SampleReceivingComponent } from './components/sample-receiving/sample-receiving.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Sample Dispatach',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'sample-dispatch'
      },
      {
        path: 'sample-dispatch',
        component: SampleDispatchComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Dispatch',
          breadcrumb: 'dispatch',
          breadcrumb_caption: 'dispatch',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'pending-inv-cost',
        component: PendingInvoiceCostComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Pending Invoice Cost',
          breadcrumb: 'pending-invoice-cost',
          breadcrumb_caption: 'pending-invoice-cost',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'sample-receiving',
        component: SampleReceivingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Dispatch',
          breadcrumb: 'dispatch',
          breadcrumb_caption: 'dispatch',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'sample-tracking-dashboard',
        component: SampleTrackingDashboardComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Dispatch',
          breadcrumb: 'dispatch',
          breadcrumb_caption: 'dispatch',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SampleTrackingRoutingModule { }
