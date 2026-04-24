// @ts-nocheck
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { InformationDeskComponent } from "./components/information-desk/information-desk.component";
import { InformationDeskRoutingModule } from "./information-desk-routing.module";
import { MatTabsModule } from "@angular/material/tabs";
import { MatCardModule } from "@angular/material/card";
import { TestProfileConfigurationModule } from "../test-profile-management/test-profile-configurations.module";
import { PatientBookingModule } from "../patient-booking/patient-booking.module";
import { VisitTrackingComponent } from "./components/visit-tracking/visit-tracking.component";
import { RemarksModule } from "../remarks/remarks.module";
import { TestProfilePackageComponent } from "./components/test-profile-package/test-profile-package.component";
import { TestParameterComponent } from "./components/test-parameter/test-parameter.component";
import { TelephoneDirectoryComponent } from "./components/telephone-directory/telephone-directory.component";
import { OnlinePatientInfoComponent } from "./components/online-patient-info/online-patient-info.component";
import { PanelInfoComponent } from "./components/panel-info/panel-info.component";
import { DiscountCardDetailsComponent } from "./components/discount-card-details/discount-card-details.component";
import { InquiryReportComponent } from "./components/inquiry-report/inquiry-report.component";
import { InquiryReportInnerComponent } from "./components/inquiry-report-inner/inquiry-report-inner.component";
import { VisitTestInquiryComponent } from './components/shared/visit-test-inquiry/visit-test-inquiry.component';
import { DatePipe } from '@angular/common';
@NgModule({
  declarations: [
    InformationDeskComponent,
    VisitTrackingComponent,
    TestProfilePackageComponent,
    TestParameterComponent,
    TelephoneDirectoryComponent,
    OnlinePatientInfoComponent,
    PanelInfoComponent,
    DiscountCardDetailsComponent,
    InquiryReportComponent,
    InquiryReportInnerComponent,
    VisitTestInquiryComponent,
  ],
  exports: [
    VisitTrackingComponent,
    InquiryReportInnerComponent,
    TestProfilePackageComponent,
    TestParameterComponent,
    TelephoneDirectoryComponent,
    OnlinePatientInfoComponent,
    PanelInfoComponent,
    DiscountCardDetailsComponent,
    InquiryReportComponent,
    InquiryReportInnerComponent,
    VisitTestInquiryComponent
  ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    SharedModule,
    InformationDeskRoutingModule,
    PatientBookingModule,
    TestProfileConfigurationModule,
    RemarksModule,
  ],
  providers: [DatePipe],
})
export class InformationDeskModule {}
