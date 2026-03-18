// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RmsRoutingModule } from './rms-routing.module';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CCRequestHandlingComponent } from './components/cc-request-handling/cc-request-handling.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { CcComplaintHandlingComponent } from './components/cc-complaint-handling/cc-complaint-handling.component';
import { CcFeedbackHandlingComponent } from './components/cc-feedback-handling/cc-feedback-handling.component';
import { CcHcRequestComponent } from './components/cc-hc-request/cc-hc-request.component';
import { CreateComplaintFeedbackComponent } from './components/create-complaint-feedback/create-complaint-feedback.component';
import { SearchUserDetailComponent } from './components/search-user-detail/search-user-detail.component';
import { CmsAdminDashboardComponent } from './components/cms-admin-dashboard/cms-admin-dashboard.component';
import { MachineStatusLogComponent } from './components/machine-status-log/machine-status-log.component';


import { BlockingModule } from '../blocking/blocking.module';
import { SmsModule } from '../sms/sms.module';
import { ComplaintsFeedbackModule } from '../complaints-feedback/complaints-feedback.module';
import { OutsourceHospitalsComponent } from './components/outsource-hospital/outsource-hospitals/outsource-hospitals.component';
import { OutsourceHospitalDetailsComponent } from './components/outsource-hospital-details/outsource-hospital-details/outsource-hospital-details.component';
import { RequestComparisonComponent } from './components/request-comparison/request-comparison.component';
import { DiseaseConfigComponent } from './components/disease-config/disease-config.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { ServicesLogForKbsComponent } from './components/services-log-for-kbs/services-log-for-kbs.component';
import { BranchServicesLogComponent } from './components/branch-services-log/branch-services-log.component';
import { BaseChartDirective } from 'ng2-charts';


@NgModule({

  declarations: [FeedbackComponent, CCRequestHandlingComponent, CcComplaintHandlingComponent, CcFeedbackHandlingComponent, CcHcRequestComponent, CreateComplaintFeedbackComponent, SearchUserDetailComponent, CmsAdminDashboardComponent, MachineStatusLogComponent, OutsourceHospitalsComponent, OutsourceHospitalDetailsComponent, RequestComparisonComponent, DiseaseConfigComponent, ServicesLogForKbsComponent, BranchServicesLogComponent, 


// chnages made
  ],
  imports: [
    CommonModule,
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
    BaseChartDirective,
    NgbAccordionModule

  ],
  exports: [CcComplaintHandlingComponent,SearchUserDetailComponent,MachineStatusLogComponent,DiseaseConfigComponent,
    CreateComplaintFeedbackComponent,ServicesLogForKbsComponent,BranchServicesLogComponent]
    
})
export class RmsModule { }
