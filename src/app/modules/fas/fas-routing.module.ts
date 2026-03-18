// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { TrialReportComponent } from './components/trial-report/trial-report.component';

const routes: Routes = [


   {
      path: '',
      // component: ,
      data: {
        title: 'Trial Report',
        breadcrumb: 'Trial Report',
        breadcrumb_caption: 'Trial Report',
        icon: 'icofont-home bg-c-blue',
        status: false
      },
      children: [
        {
          path: '',
          redirectTo: 'trial-report'
        },
        {
          path: 'trial-report',
          component: TrialReportComponent,
          canActivate: [AuthGuard],
          data: {
            title: 'Trial Report',
            breadcrumb: 'Trial Report',
            breadcrumb_caption: 'Trial Report',
            icon: 'icofont-home bg-c-blue',
            status: false
          }
        },
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FASRoutingModule { }
