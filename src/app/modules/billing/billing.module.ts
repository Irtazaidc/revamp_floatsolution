// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module'
import { ManageBillingComponent } from './components/manage-billing/manage-billing.component';
import { BillingRoutingModule } from './billing-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MyServicesShareComponent } from './components/my-services-share/my-services-share.component';
import { ManageSalesDepositSlipsComponent } from './components/manage-sales-deposit-slips/manage-sales-deposit-slips.component';
import { ViewSalesDepositSlipsComponent } from './components/view-sales-deposit-slips/view-sales-deposit-slips.component';
import { ManagePanelComponent } from './components/manage-panel/manage-panel.component';
import { ManagePanelUsersComponent } from './components/manage-panel-users/manage-panel-users.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MyServicesShareV2Component } from './components/my-services-share-v2/my-services-share-v2.component';
import { DoctorServicesShareComponent } from './components/doctor-services-share/doctor-services-share.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ConsolidatedReportComponent } from './components/consolidated-report/consolidated-report.component';
import { GizSaleReportComponent } from './components/giz-sale-report/giz-sale-report.component';
import { BranchSalesReportComponent } from './components/branch-sales-report/branch-sales-report.component';
import { ManagePartnerConfigComponent } from './components/manage-partner-config/manage-partner-config.component';
import { PanelServicesShareComponent } from './components/panel-services-share/panel-services-share.component';
import { AlfalahEmailReportComponent } from './components/alfalah-email-report/alfalah-email-report.component';
import { DigitalReceiptReportComponent } from './components/digital-receipt-report/digital-receipt-report.component';


@NgModule({
  declarations: [ManageBillingComponent, MyServicesShareComponent, ManageSalesDepositSlipsComponent, ViewSalesDepositSlipsComponent, ManagePanelComponent, ManagePanelUsersComponent, MyServicesShareV2Component, DoctorServicesShareComponent, ConsolidatedReportComponent, GizSaleReportComponent, BranchSalesReportComponent, ManagePartnerConfigComponent, PanelServicesShareComponent, AlfalahEmailReportComponent, DigitalReceiptReportComponent, ],
  imports: [
    CommonModule,
    BillingRoutingModule,
    SharedModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ]
})
export class BillingModule { }
