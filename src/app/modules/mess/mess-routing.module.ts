// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { ActivationReportComponent } from './activation-report/activation-report.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Activation Report',
    },
    children: [
      {
        path: '',
        redirectTo: 'Activation Report',
        pathMatch: 'full'  
      },
      {
        path: 'activation-report',
        component: ActivationReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Activation Report',
          breadcrumb: 'Activation Report',
          breadcrumb_caption: 'Activation Report',
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
export class MessRoutingModule { }
