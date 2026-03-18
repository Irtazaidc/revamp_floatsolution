// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientBookingRoutingModule } from './patient-booking-routing.module';
import { PatientRegistrationComponent } from './components/patient-registration/patient-registration.component';
import { PatientSearchComponent } from './components/patient-search/patient-search.component';
import { VisitManagementComponent } from './components/visit-management/visit-management.component';
import { SharedModule } from '../shared/shared.module';
import { FdoSalesComponent } from './components/fdo-sales/fdo-sales.component';
import { MatTabsModule } from '@angular/material/tabs';
import { RemarksModule } from '../remarks/remarks.module';
import { TPCancellationRequestsComponent } from './components/tp-cancellation-requests/tp-cancellation-requests.component';
import { FormsModule } from '@angular/forms';
import { FbrInvoiceRepostingComponent } from './components/fbr-invoice-reposting/fbr-invoice-reposting.component';
import { DiscountCardSaleComponent } from './components/discount-card-sale/discount-card-sale.component';
import { PanelConversionComponent } from './components/panel-conversion/panel-conversion.component';
import { OutsourcePendingPatientsComponent } from './components/outsource-pending-patients/outsource-pending-patients.component';
import { AddFamilyComponent } from './components/add-family/add-family.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DiscountCardComponent } from './components/discount-card/discount-card.component';
import { PostDengueDataComponent } from './post-dengue-data/post-dengue-data.component';
import { DispMobDeviceInfoComponent } from './components/disp-mob-device-info/disp-mob-device-info.component';
import { UpdPostDengueDataComponent } from './upd-post-dengue-data/upd-post-dengue-data.component';
import { DenguePostedDataComponent } from './dengue-posted-data/dengue-posted-data.component';
import { RepostDengueDataComponent } from './repost-dengue-data/repost-dengue-data.component';
import { UpdateVisitInfoComponent } from './components/update-visit-info/update-visit-info.component';
import { TestSearchComponent } from './components/test-search/test-search.component';
import { BranchClosingComponent } from './components/branch-closing/branch-closing.component';
import { UpdateRefByComponent } from './components/update-ref-by/update-ref-by.component';
import { DocumentAuditComponent } from './components/document-audit/document-audit.component';
import { ManageReportsOndeskComponent } from './components/manage-reports-ondesk/manage-reports-ondesk.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FdoClosedSalesComponent } from './components/fdo-closed-sales/fdo-closed-sales.component';
import { VisitCancellationManagerComponent } from './components/visit-cancellation-manager/visit-cancellation-manager.component';
import { PendingPanelReportComponent } from './components/pending-panel-report/pending-panel-report.component';
import { EmployeeTestRequestComponent } from './components/employee-test-request/employee-test-request.component';
import { PanelConversionReportComponent } from './components/panel-conversion-report/panel-conversion-report.component';
import { DelayedCancellationRequestsComponent } from './components/delayed-cancellation-requests/delayed-cancellation-requests.component';
import { DelayedApprovalsComponent } from './components/delayed-approvals/delayed-approvals.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { FreeTestApprovalsComponent } from './components/free-test-approvals/free-test-approvals.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    PatientSearchComponent,
    PatientRegistrationComponent,
    FdoSalesComponent,
    VisitManagementComponent,
    TPCancellationRequestsComponent,
    FbrInvoiceRepostingComponent,
    DiscountCardSaleComponent,
    PanelConversionComponent,
    OutsourcePendingPatientsComponent,
    AddFamilyComponent,
    DiscountCardComponent,
    PostDengueDataComponent,
    DispMobDeviceInfoComponent,
    UpdPostDengueDataComponent,
    DenguePostedDataComponent,
    RepostDengueDataComponent,
    UpdateVisitInfoComponent,
    TestSearchComponent,
    BranchClosingComponent,
    UpdateRefByComponent,
    DocumentAuditComponent,
    ManageReportsOndeskComponent,
    FdoClosedSalesComponent,
    VisitCancellationManagerComponent,
    PendingPanelReportComponent,
    EmployeeTestRequestComponent,
    PanelConversionReportComponent,
    DelayedCancellationRequestsComponent,
    DelayedApprovalsComponent,
    FreeTestApprovalsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PatientBookingRoutingModule,
    MatTabsModule,
    RemarksModule,
    FormsModule,
    NgSelectModule,
    MatDialogModule,
    MatProgressBarModule,
    MatRadioModule,
    NgxMaskDirective,
    NgxMaskPipe,
    QRCodeComponent,
    // InformationDeskModule
  ],
  exports: [PatientSearchComponent, OutsourcePendingPatientsComponent, DispMobDeviceInfoComponent, DiscountCardComponent]
})
export class PatientBookingModule { }
