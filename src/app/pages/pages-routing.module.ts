// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../modules/auth/_services/auth.guard';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },

      {
        path: 'pat-reg',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/patient-booking/patient-booking.module').then(m => m.PatientBookingModule)
      },
      {
        path: 'hc',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/home-sampling/home-sampling.module').then(m => m.HomeSamplingModule)
      },
      {
        path: 'sample-mgmt',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/sample-management/sample-management.module').then(m => m.SampleManagementModule)
      },
      {
        path: 'sample-tracking',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/sample-tracking/sample-tracking.module').then(m => m.SampleTrackingModule)
      },
      {
        path: 'visit-res-entry',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/visit-result-entry/visit-result-entry.module').then(m => m.VisitResultEntryModule)
      },
      {
        path: 'roles-and-permissions',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/roles-permissions/roles-permissions.module').then(m => m.RolesPermissionsModule)
      },
      {
        path: 'doctors',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/doctors/doctors.module').then(m => m.DoctorsModule)
      },
      {
        path: 'blocking',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/blocking/blocking.module').then(m => m.BlockingModule)
      },
      {
        path: 'lab',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/lab/lab.module').then(m => m.LabModule)
      },
      {
        path: 'marketing',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/marketing/marketing.module').then(m => m.MarketingModule)
      },
      {
        path: 'marketing',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/news-events/news-events.module').then(m => m.NewsEventsModule)
      },
      {
        path: 'notice-board',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/notice-board/notice-board.module').then(m => m.NoticeBoardModule)
      },
      {
        path: 'tp-configs',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/test-profile-management/test-profile-configurations.module').then(m => m.TestProfileConfigurationModule)
      },
      {
        path: 'rms',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/rms/rms.module').then(m => m.RmsModule)
      },
      {
        path: 'guidance-system',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/guidance-system/guidance-system.module').then(m => m.GuidanceSystemModule)
      },
      {
        path: 'sms',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/sms/sms.module').then(m => m.SmsModule)
      },
      {
        path: 'cms',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/complaints-feedback/complaints-feedback.module').then(m => m.ComplaintsFeedbackModule)
      },
      {
        path: 'branch',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/branch-management/branch-management.module').then(m => m.BranchManagementModule)
      },
      {
        path: 'faqs',
        loadChildren: () => import('../modules/FAQ/faq.module').then(m => m.FAQModule)
      },
      {
        path: 'print',
        loadChildren: () => import('../modules/print-reports/print-reports.module').then(m => m.PrintReportsModule)
      },
      {
        path: 'outsource',
        loadChildren: () => import('../modules/out-source-integ/out-source-integ.module').then(m => m.OutSourceIntegModule)
      },
      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/gen-reports/gen-reports.module').then(m => m.GenReportsModule)
      },
      {
        path: 'recruitment',
        loadChildren: () => import('../modules/recruitment/recruitment.module').then(m => m.RecruitmentModule)
      },
      {
        path: 'mess',
        loadChildren: () => import('../modules/mess/mess.module').then(m => m.MessModule)
      },
      {
        path: 'bussiness-suite',
        loadChildren: () => import('../modules/business-suite/business-suite.module').then(m => m.BusinessSuiteModule)
      },
      {
        path: 'misc',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/misc/misc.module').then(m => m.MiscModule)
      },
    
      {
        path: 'lab-configs',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/lab-configs/lab-configs.module').then(m => m.LabConfigsModule)
      },
      {
        path: 'racking-routing',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/racking-routing/racking-routing.module').then(m => m.RackingRoutingModule)
      },
      {
        path: 'information-desk',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/information-desk/information-desk.module').then(m => m.InformationDeskModule)
      },
      {
        path: 'docs',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/general-docs/general-docs.module').then(m => m.GeneralDocsModule)
      },
      {
        path: 'appointments',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/appointments/appointments.module').then(m => m.AppointmentsModule)
      },
      {
        path: 'analytics',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/analytics/analytics-routing.module').then(m => m.AnalyticsRoutingModule)
      },
      // {
      //   path: 'faqs-management',
      //   loadChildren: () => import('../modules/FAQ/faq.module').then(m => m.FAQModule)
      // },
      {
        path: 'ris',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/ris/ris.module').then(m => m.RisModule)
      },
      {
        path: 'fdo-management',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/fdo-management/fdo-management.module').then(m => m.FdoManagementModule)
      },
      {
        path: 'emp-profile',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/emp-profile/emp-profile.module').then(m => m.EmpProfileModule)
      },
      {
        path: 'billing',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'fas',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/fas/fas.module').then(m => m.FASModule)
      },
      /* Theme */
      {
        path: 'builder',
        loadChildren: () =>
          import('./builder/builder.module').then((m) => m.BuilderModule),
      },
      // {
      //   path: 'ecommerce',
      //   loadChildren: () =>
      //     import('../modules/e-commerce/e-commerce.module').then(
      //       (m) => m.ECommerceModule
      //     ),
      // },
      {
        path: 'user-management',
        loadChildren: () =>
          import('../modules/user-management/user-management.module').then(
            (m) => m.UserManagementModule
          ),
      },
      {
        path: 'user-profile',
        loadChildren: () =>
          import('../modules/user-profile/user-profile.module').then(
            (m) => m.UserProfileModule
          ),
      },

      {
        path: 'reports',
        canActivate: [AuthGuard],
        loadChildren: () => import('../modules/gen-reports/gen-reports-routing.module').then(m => m.GenReportsRoutingModule)
      },
      // NOTE: demo module removed from routing during migration (Angular 21 compat)
      // {
      //   path: 'ngbootstrap',
      //   loadChildren: () =>
      //     import('../modules/ngbootstrap/ngbootstrap.module').then(
      //       (m) => m.NgbootstrapModule
      //     ),
      // },
      {
        path: 'wizards',
        loadChildren: () =>
          import('../modules/wizards/wizards.module').then(
            (m) => m.WizardsModule
          ),
      },
      // NOTE: demo module removed from routing during migration (Angular 21 compat)
      // {
      //   path: 'material',
      //   loadChildren: () =>
      //     import('../modules/material/material.module').then(
      //       (m) => m.MaterialModule
      //     ),
      // },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
