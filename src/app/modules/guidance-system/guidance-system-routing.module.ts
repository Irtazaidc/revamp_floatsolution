// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { KnowledgeBasedDashboardComponent } from './components/knowledge-dashboard/knowledge-based-dashboard.component';
import { InsuranceInquiryReportComponent } from './components/insurance-inquiry-report/insurance-inquiry-report.component';
import { ServicesConfigComponent } from './components/services-config/services-config.component';
import { KbsBranchesConfigComponent } from './components/kbs-branches-config/kbs-branches-config.component';
import { KbsServicesConfigComponent } from './components/kbs-services-config/kbs-services-config.component';
import { KbsTickerConfigComponent } from './components/kbs-ticker-config/kbs-ticker-config.component';
import { KbsDocumentUploadComponent } from './components/kbs-document-upload/kbs-document-upload.component';
// import { InsuranceInquiryReportComponent } from './components/insurance-inquiry-report/insurance-inquiry-report.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Knowledge Based System',
    },
    children: [
      {
        path: '',
        redirectTo: 'knowledge-based-dashboard',
        pathMatch: 'full'  
      },
      {
        path: 'knowledge-based-dashboard',
        component: KnowledgeBasedDashboardComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Knowledge Based Dashboard',
          breadcrumb: 'Knowledge Based Dashboard',
          breadcrumb_caption: 'Knowledge Based Dashboard',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'insurance-inquiry-report',
        component: InsuranceInquiryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'insurance inquiry report',
          breadcrumb: 'insurance inquiry report',
          breadcrumb_caption: 'insurance inquiry report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      // {
      //   path: 'services-config',
      //   component: ServicesConfigComponent,
      //   canActivate: [AuthGuard],
      //   data: {
      //     title: 'Services Config',
      //     breadcrumb: 'Services Config',
      //     breadcrumb_caption: 'Services Config',
      //     icon: 'icofont-home bg-c-blue',
      //     status: false
      //   }
      // },
      {
        path: 'kbs-services-config',
        component: KbsServicesConfigComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'KBS Services Config',
          breadcrumb: 'KBS Services Config',
          breadcrumb_caption: 'KBS Services Config',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'kbs-branches-config',
        component: KbsBranchesConfigComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'KBS Branches Config',
          breadcrumb: 'KBS Branches Config',
          breadcrumb_caption: 'KBS Branches Config',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'kbs-ticker-config',
        component: KbsTickerConfigComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'KBS Ticker Config',
          breadcrumb: 'KBS Ticker Config',
          breadcrumb_caption: 'KBS Ticker Config',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'kbs-document-upload',
        component: KbsDocumentUploadComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'KBS Document Upload',
          breadcrumb: 'KBS Document Upload',
          breadcrumb_caption: 'KBS Document Upload',
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
export class GuidanceSystemRoutingModule { }
