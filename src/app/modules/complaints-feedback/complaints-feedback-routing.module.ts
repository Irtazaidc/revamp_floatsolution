// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { ManageCMSRequestComponent } from './components/manage-cms-request/manage-cms-request';
import { ManageMyCmsComponent } from './components/manage-my-cms/manage-my-cms.component';
import { CmsInquiryComponent } from './components/cms-inquiry/cms-inquiry.component';
import { CmsReportingComponent } from './components/cms-reporting/cms-reporting.component';
import { CategoryWiseComponent } from './components/cms-analytics/category-wise/category-wise.component';
import { RadiologistAvailabilityComponent } from './components/radiologist-availability/radiologist-availability.component';
import { WhatsappLogsComponent } from './components/whatsapp-logs/whatsapp-logs.component';
import { RadiologistConfigComponent } from './components/radiologist-config/radiologist-config.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Complaint and Feedback',
      breadcrumb: 'Complaint and Feedback Dashboard',
      breadcrumb_caption: 'Complaint and Feedback Dashboard',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'complaint-feedback-dashboard'
      },
      {
        path: 'manage-cms-request', 
        component: ManageCMSRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Manage CMS Request', 
          breadcrumb: 'Manage CMS Request',
          breadcrumb_caption: 'Manage CMS Request',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'manage-my-cms',
        component: ManageMyCmsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Manage My CMS',
          breadcrumb: 'Manage My CMS',
          breadcrumb_caption: 'Manage My CMS',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'cms-inquiry',
        component: CmsInquiryComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'CMS Inquiry', 
          breadcrumb: 'CMS Inquiry record',
          breadcrumb_caption: 'CMS Inquiry record',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'radiologist-availability',
        component: RadiologistAvailabilityComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Radiologist Availability', 
          breadcrumb: 'Radiologist Availability',
          breadcrumb_caption: 'Radiologist Availability',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'cms-reporting',
        component: CmsReportingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'CMS Reporting', 
          breadcrumb: 'CMSReporting Detail',
          breadcrumb_caption: 'CMSReporting Detail',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'cms-analytics',
        component: CategoryWiseComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'CMS analytics', 
          breadcrumb: 'CMS analytics Detail',
          breadcrumb_caption: 'CMS analytics Detail',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'whatsapp-logs',
        component: WhatsappLogsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Whatsapp logs', 
          breadcrumb: 'Whatsapp status and details logs',
          breadcrumb_caption: 'Whatsapp status and details logs',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'radiologist-availability-config',
        component: RadiologistConfigComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Radiologist Config', 
          breadcrumb: 'Radiologist Config',
          breadcrumb_caption: 'Radiologist Config',
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
export class ComplaintsFeedbackRoutingModule { }
