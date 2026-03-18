// @ts-nocheck
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { DiscountCardSaleComponent } from './components/discount-card-sale/discount-card-sale.component';
import { FbrInvoiceRepostingComponent } from './components/fbr-invoice-reposting/fbr-invoice-reposting.component';
import { FdoSalesComponent } from './components/fdo-sales/fdo-sales.component';
import { PatientRegistrationComponent } from './components/patient-registration/patient-registration.component';
import { PatientSearchComponent } from './components/patient-search/patient-search.component';
import { TPCancellationRequestsComponent } from './components/tp-cancellation-requests/tp-cancellation-requests.component';
import { VisitManagementComponent } from './components/visit-management/visit-management.component';
import { DelayedCancellationRequestsComponent } from './components/delayed-cancellation-requests/delayed-cancellation-requests.component';
import { PanelConversionComponent } from './components/panel-conversion/panel-conversion.component';
import { OutsourcePendingPatientsComponent } from './components/outsource-pending-patients/outsource-pending-patients.component';
import { AddFamilyComponent } from './components/add-family/add-family.component';
import { PostDengueDataComponent } from './post-dengue-data/post-dengue-data.component';
import { DenguePostedDataComponent } from './dengue-posted-data/dengue-posted-data.component';
import { UpdateVisitInfoComponent } from './components/update-visit-info/update-visit-info.component';
import { BranchClosingComponent } from './components/branch-closing/branch-closing.component';
import { UpdateRefByComponent } from './components/update-ref-by/update-ref-by.component';
import { DocumentAuditComponent } from './components/document-audit/document-audit.component';
import { ManageReportsOndeskComponent } from './components/manage-reports-ondesk/manage-reports-ondesk.component';
import { FdoClosedSalesComponent } from './components/fdo-closed-sales/fdo-closed-sales.component';
import { VisitCancellationManagerComponent } from './components/visit-cancellation-manager/visit-cancellation-manager.component';
import { PendingPanelReportComponent } from './components/pending-panel-report/pending-panel-report.component';
import { EmployeeTestRequestComponent } from './components/employee-test-request/employee-test-request.component';
import { PanelConversionReportComponent } from './components/panel-conversion-report/panel-conversion-report.component';
import { DelayedApprovalsComponent } from './components/delayed-approvals/delayed-approvals.component';
import { FreeTestApprovalsComponent } from './components/free-test-approvals/free-test-approvals.component';


const routes: Routes = [
  {
    path: '',
    // component: PatientRegistrationComponent
    children: [
      {
        path: '',
        redirectTo: 'search'
      },
      {
        path: 'search',
        component: PatientSearchComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'reg',
        component: PatientRegistrationComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'regForHS',
        component: PatientRegistrationComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'hc-booking',
        component: PatientRegistrationComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Booking For Home Collection',
          breadcrumb: 'Booking For Home Collection',
          breadcrumb_caption: 'Booking For Home Collection',
          icon: 'icofont-home bg-c-blue',
          status: false,
        },
      },
      // {
      //   path: 'visit',
      //   component: PatientVisitComponent,
      //   canActivate: [AuthGuard]
      // },
      {
        path: 'fdo-sales',
        component: FdoSalesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'fdo-closed-sales',
        component: FdoClosedSalesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'branch-sales-closing',
        component: BranchClosingComponent,
        // canActivate: [AuthGuard]
      },
      {
        path: 'visit-management',
        component: VisitManagementComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'visit-cancellation-manager',
        component: VisitCancellationManagerComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'tp-cancellation-req',
        component: TPCancellationRequestsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'fbr-inv-repost',
        component: FbrInvoiceRepostingComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'dis-card-sale',
        component: DiscountCardSaleComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'add-family',
        component: AddFamilyComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'panel-conversion',
        component: PanelConversionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'outsource-patients',
        component: OutsourcePendingPatientsComponent,
        // canActivate: [AuthGuard]
      },
      {
        path: 'post-dengue-data',
        component: PostDengueDataComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'posted-dengue-data',
        component: DenguePostedDataComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'update-visit-info',
        component: UpdateVisitInfoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'pending-panel-report',
        component: PendingPanelReportComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'panel-conversion-report',
        component: PanelConversionReportComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'employee-test-request',
        component: EmployeeTestRequestComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'free-test-approvals',
        component: FreeTestApprovalsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'update-refby',
        component: UpdateRefByComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'document-audit',
        component: DocumentAuditComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'manage-reports-on-desk',
        component: ManageReportsOndeskComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'delayed-cancellation-requests',
        component: DelayedCancellationRequestsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'delayed-approvals',
        component: DelayedApprovalsComponent,
        canActivate: [AuthGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientBookingRoutingModule { }
