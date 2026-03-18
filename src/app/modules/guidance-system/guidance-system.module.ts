// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared/shared.module';
import { GuidanceSystemRoutingModule } from './guidance-system-routing.module';
import { InformationDeskModule } from '../information-desk/information-desk.module';
import { KnowledgeBasedDashboardComponent } from './components/knowledge-dashboard/knowledge-based-dashboard.component';
import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { TestProfileConfigurationModule } from '../test-profile-management/test-profile-configurations.module';
import { RemarksModule } from '../remarks/remarks.module';
import { RmsModule } from '../rms/rms.module';
import { ComplaintsFeedbackModule } from '../complaints-feedback/complaints-feedback.module';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MarketingModule } from '../marketing/marketing.module';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InsuranceInquiryReportComponent } from './components/insurance-inquiry-report/insurance-inquiry-report.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ServicesConfigComponent } from './components/services-config/services-config.component';
import { KbsServicesConfigComponent } from './components/kbs-services-config/kbs-services-config.component';
import { KbsBranchesConfigComponent } from './components/kbs-branches-config/kbs-branches-config.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CKEditorModule } from 'ckeditor4-angular';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { KbsTickerConfigComponent } from './components/kbs-ticker-config/kbs-ticker-config.component';
import { KbsDocumentUploadComponent } from './components/kbs-document-upload/kbs-document-upload.component';

@NgModule({
  declarations: [
    KnowledgeBasedDashboardComponent,
    InsuranceInquiryReportComponent,
    ServicesConfigComponent,
    KbsServicesConfigComponent,
    KbsBranchesConfigComponent,
    KbsTickerConfigComponent,
    KbsDocumentUploadComponent,

  ],
  imports: [
    GuidanceSystemRoutingModule,
    RmsModule,
    InformationDeskModule,
    CommonModule,
    MatTabsModule,
    MatCardModule,
    SharedModule,
    PatientBookingModule,
    TestProfileConfigurationModule,
    RemarksModule,
    ComplaintsFeedbackModule,
    CdkAccordionModule,
    MarketingModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    MatDatepickerModule,
    NgxMaskDirective,
    NgxMaskPipe,
    DragDropModule,
    CKEditorModule,
    MatProgressSpinnerModule,
]
})
export class GuidanceSystemModule { }
