// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import {InformationDeskComponent  } from './components/information-desk/information-desk.component';
import { InquiryReportComponent } from './components/inquiry-report/inquiry-report.component';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Information Desk',
      breadcrumb: 'Information Desk',
      breadcrumb_caption: 'Information Desk',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'info-desk'
      },
      {
        path: 'info-desk',
        component: InformationDeskComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Information Desk',
          breadcrumb: 'Information Desk',
          breadcrumb_caption: 'Information Desk',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'inquiry-report', //information-desk
        component: InquiryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Inquiry Report',
          breadcrumb: 'Inquiry Report',
          breadcrumb_caption: 'Inquiry Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformationDeskRoutingModule { }
