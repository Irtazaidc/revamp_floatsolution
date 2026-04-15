// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { CCRequestHandlingComponent } from './components/cc-request-handling/cc-request-handling.component';
import { CcComplaintHandlingComponent } from './components/cc-complaint-handling/cc-complaint-handling.component';
import { CreateComplaintFeedbackComponent } from './components/create-complaint-feedback/create-complaint-feedback.component';
import { CmsAdminDashboardComponent } from './components/cms-admin-dashboard/cms-admin-dashboard.component';
import { CcHcRequestComponent } from './components/cc-hc-request/cc-hc-request.component';
import { MachineStatusLogComponent } from './components/machine-status-log/machine-status-log.component';
import { OutsourceHospitalsComponent } from './components/outsource-hospital/outsource-hospitals/outsource-hospitals.component';
import { OutsourceHospitalDetailsComponent } from './components/outsource-hospital-details/outsource-hospital-details/outsource-hospital-details.component';
import { RequestComparisonComponent } from './components/request-comparison/request-comparison.component';
import { DiseaseConfigComponent } from './components/disease-config/disease-config.component';
import { ServicesLogForKbsComponent } from './components/services-log-for-kbs/services-log-for-kbs.component';
import { BranchServicesLogComponent } from './components/branch-services-log/branch-services-log.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Request Management System',
      breadcrumb: 'Request Management System',
      breadcrumb_caption: 'Request Management System',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'feedback',
        pathMatch: 'full'
      },
      {
        path: 'feedback',
        component: FeedbackComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Patient Feedback',
          breadcrumb: 'Patient Feedback',
          breadcrumb_caption: 'Patient Feedback',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'cms-admin-dashboard',
        component: CmsAdminDashboardComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Admin Dashboard',
          breadcrumb: 'cms admin dashboard',
          breadcrumb_caption: 'cms admin dashboard',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'cc-request-handling',
        component: CCRequestHandlingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Complaint Registration',
          breadcrumb: 'Complaint Registration for CMS',
          breadcrumb_caption: 'Complaint Registration for CMS',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'hc-request-submission',
        component: CcHcRequestComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Home Sampling Request',
          breadcrumb: 'CC Request handling for HC',
          breadcrumb_caption: 'CC Request handling for HC',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'cc-complaint-handling',
        component: CcComplaintHandlingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Complaint & FeedBack ',
          breadcrumb: 'CC Complaint & FeedBack',
          breadcrumb_caption: 'CC Complaint & FeedBack',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'create-complaint-feedback',
        component: CreateComplaintFeedbackComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Complaint & FeedBack ',
          breadcrumb: 'Create Complaint & FeedBack',
          breadcrumb_caption: 'Create Complaint & FeedBack',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'machine-status-log',
        component: MachineStatusLogComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Machine Status Log',
          breadcrumb: 'Machine Status Log',
          breadcrumb_caption: 'Machine Status Log',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      // {
      //   path: 'services-log-for-kbs',
      //   component: ServicesLogForKbsComponent,
      //   canActivate: [AuthGuard],
      //   data: {
      //     title: 'Services Log For KBS',
      //     breadcrumb: 'Services Log For KBS',
      //     breadcrumb_caption: 'Services Log For KBS',
      //     icon: 'icofont-home bg-c-blue',
      //     status: false
      //   }
      // },
      {
        path: 'branch-services-log',
        component: BranchServicesLogComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Branch Services Log',
          breadcrumb: 'Branch Services Log',
          breadcrumb_caption: 'Branch Services Log',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'request-comparison',
        component: RequestComparisonComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'HC Request Comparison',
          breadcrumb: 'HC Request Comparison',
          breadcrumb_caption: 'HC Request Comparison',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'outsource-hospitals',
        component: OutsourceHospitalsComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Outsource Hospitals',
          breadcrumb: 'Outsource Hospitals',
          breadcrumb_caption: 'Outsource Hospitals',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'outsource-hospitals-detail',
        component: OutsourceHospitalDetailsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Outsource Hospitals Detail',
          breadcrumb: 'Outsource Hospitals Dettail',
          breadcrumb_caption: 'Outsource Hospitals Detail',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'disease-config',
        component: DiseaseConfigComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Disease Config',
          breadcrumb: 'Disease Config',
          breadcrumb_caption: 'Disease Config',
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
export class RmsRoutingModule { }
