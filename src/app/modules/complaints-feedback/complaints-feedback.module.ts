// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintsFeedbackRoutingModule } from './complaints-feedback-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { RmsRoutingModule } from '../rms/rms-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ManageCMSRequestComponent } from './components/manage-cms-request/manage-cms-request';
import { RmsModule } from '../rms/rms.module';
import { CcComplaintHandlingComponent } from '../rms/components/cc-complaint-handling/cc-complaint-handling.component';
import { CmsInquiryComponent } from './components/cms-inquiry/cms-inquiry.component';
import { ManageMyCmsComponent } from './components/manage-my-cms/manage-my-cms.component';
import { BaseChartDirective } from 'ng2-charts';
import { CmsEmployeeCardComponent } from './components/cms-employee-card/cms-employee-card.component';
import { CmsContactbackTrackingComponent } from './components/cms-contactback-tracking/cms-contactback-tracking.component';
import { CmsRequestDetailsComponent } from './components/cms-request-details/cms-request-details.component';
import { CmsReportingComponent } from './components/cms-reporting/cms-reporting.component';
import { CategoryWiseComponent } from './components/cms-analytics/category-wise/category-wise.component';
import { SubCategoryWiseComponent } from './components/cms-analytics/sub-category-wise/sub-category-wise.component';
import { RadiologistAvailabilityComponent } from './components/radiologist-availability/radiologist-availability.component';
import { WhatsappLogsComponent } from './components/whatsapp-logs/whatsapp-logs.component';
import { RadiologistConfigComponent } from './components/radiologist-config/radiologist-config.component';

@NgModule({
  declarations: [ManageCMSRequestComponent, CmsInquiryComponent, ManageMyCmsComponent, CmsEmployeeCardComponent, CmsContactbackTrackingComponent, CmsRequestDetailsComponent, CmsReportingComponent, CategoryWiseComponent, SubCategoryWiseComponent, RadiologistAvailabilityComponent, WhatsappLogsComponent, RadiologistConfigComponent],
  imports: [
    CommonModule,
    ComplaintsFeedbackRoutingModule,
    RmsRoutingModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    MatDialogModule,
    FormsModule,
    PatientBookingModule,
    RmsModule,
    BaseChartDirective,
  ],
  exports: [CmsEmployeeCardComponent, CmsContactbackTrackingComponent,RadiologistAvailabilityComponent]
})
export class ComplaintsFeedbackModule { }
