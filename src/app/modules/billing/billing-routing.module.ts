// @ts-nocheck
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { ManageBillingComponent } from './components/manage-billing/manage-billing.component';
import { MyServicesShareComponent } from './components/my-services-share/my-services-share.component';
import { ManageSalesDepositSlipsComponent } from './components/manage-sales-deposit-slips/manage-sales-deposit-slips.component';
import { ManagePanelComponent } from './components/manage-panel/manage-panel.component';
import { ManagePanelUsersComponent } from './components/manage-panel-users/manage-panel-users.component';
import { MyServicesShareV2Component } from './components/my-services-share-v2/my-services-share-v2.component';
import { DoctorServicesShareComponent } from './components/doctor-services-share/doctor-services-share.component';
import { ConsolidatedReportComponent } from './components/consolidated-report/consolidated-report.component';
import { GizSaleReportComponent } from './components/giz-sale-report/giz-sale-report.component';
import { BranchSalesReportComponent } from './components/branch-sales-report/branch-sales-report.component';
import { ManagePartnerConfigComponent } from './components/manage-partner-config/manage-partner-config.component';
import { PanelServicesShareComponent } from './components/panel-services-share/panel-services-share.component';
import { AlfalahEmailReportComponent } from './components/alfalah-email-report/alfalah-email-report.component';
import { DigitalReceiptReportComponent } from './components/digital-receipt-report/digital-receipt-report.component';

const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Manage Billing',
      breadcrumb: 'Manage Billing',
      breadcrumb_caption: 'Manage Billing',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'manage-billing',
        pathMatch: 'full'
      },
      {
        path: 'manage-billing',
        component: ManageBillingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Manage Billing',
          breadcrumb: 'Manage Billing',
          breadcrumb_caption: 'Manage Billing',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'consolidated-report',
        component: ConsolidatedReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Consolidated Report',
          breadcrumb: 'Consolidated Report',
          breadcrumb_caption: 'Consolidated Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'giz-bill-sales-report',
        component: GizSaleReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'GIZ Billing Sales Report',
          breadcrumb: 'GIZ Billing Sales Report',
          breadcrumb_caption: 'GIZ Billing Sales Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'panel-services-share',
        component: PanelServicesShareComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Panel Services Share',
          breadcrumb: 'Panel Services Share',
          breadcrumb_caption: 'Panel Services Share',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'alfalah-email-report',
        component: AlfalahEmailReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Alfalah Email Report',
          breadcrumb: 'Alfalah Email Report',
          breadcrumb_caption: 'Alfalah Email Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'digital-receipt-report',
        component: DigitalReceiptReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Digital Receipt Report',
          breadcrumb: 'Digital Receipt Report',
          breadcrumb_caption: 'Digital Receipt Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'my-services-share',
        component: MyServicesShareComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'My Services Share Report',
          breadcrumb: 'My Services Share Report',
          breadcrumb_caption: 'My Services Share Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'doctor-services-share',
        component: DoctorServicesShareComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Doctor Services Share Report',
          breadcrumb: 'Doctor Services Share Report',
          breadcrumb_caption: 'Doctor Services Share Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'my-share-report',
        component: MyServicesShareV2Component,
        canActivate: [AuthGuard],
        data: {
          title: 'My Share Report',
          breadcrumb: 'My Share Report',
          breadcrumb_caption: 'My Share Report',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'manage-sales-deposit-slips',
        component: ManageSalesDepositSlipsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Manage Sales Deposit Slips',
          breadcrumb: 'Manage Sales Deposit Slips',
          breadcrumb_caption: 'Manage Sales Deposit Slips',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'manage-panel',
        component: ManagePanelComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'branch-sales-report',
        component: BranchSalesReportComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'manage-panel-users',
        component: ManagePanelUsersComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'manage-partner-config',
        component: ManagePartnerConfigComponent,
        canActivate: [AuthGuard],
      },
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
