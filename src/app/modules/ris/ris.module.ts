// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { RisRoutingModule } from './ris-routing.module'
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QuestionnaireMainComponent } from './components/configuration/questionnaire/questionnaire-main/questionnaire-main.component';
import { QuestionComponent } from './components/configuration/questionnaire/question/question.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { QuestionClassificationComponent } from './components/configuration/questionnaire/question-classification/question-classification.component';
import { QuestionsGroupComponent } from './components/configuration/questionnaire/questions-group/questions-group.component';
import { RadiologistComponent } from './components/configuration/radiologist/radiologist.component';
import { MoComponent } from './components/workflow/mo/mo.component';
import { RisWorklistComponent } from './components/workflow/ris-shared/ris-worklist/ris-worklist.component';
import { TechnicianComponent } from './components/workflow/technician/technician.component';
import { AssignerComponent } from './components/workflow/ris-shared/assigner/assigner.component';
import { MoQuestionnaireComponent } from './components/workflow/ris-shared/mo-questionnaire/mo-questionnaire.component';
import { RisWorklistParamsComponent } from './components/workflow/ris-shared/ris-worklist-params/ris-worklist-params.component';
import { EmrComponent } from './components/workflow/ris-shared/emr/emr.component';
import { MoHistoryComponent } from './components/workflow/ris-shared/mo-history/mo-history.component';
import { VitalsComponent } from './components/workflow/ris-shared/vitals/vitals.component';
import { PacsComponent } from './components/workflow/ris-shared/pacs/pacs.component';
import { VisitListComponent } from './components/workflow/ris-shared/visit-list/visit-list.component';
import { VisitDetailComponent } from './components/workflow/ris-shared/visit-detail/visit-detail.component';
import { ActionButtonsLargeComponent } from './components/workflow/ris-shared/includes/action-buttons-large/action-buttons-large.component';
import { RemarksModule } from '../remarks/remarks.module';
import { CheckinCheckOutComponent } from './components/workflow/checkin-checkout/checkin-checkout.component';
import { ActionButtonsSmaLLComponent } from './components/workflow/ris-shared/includes/action-buttons-small/action-buttons-small.component';
import { QueueManagementComponent } from './components/workflow/queue-management/queue-management.component';
import { RisOneWindowResultDsComponent } from './components/reporting/ris-one-window-result/ris-one-window-result-ds/ris-one-window-result-ds.component';
import { RadiologistInfoComponent } from './components/workflow/ris-shared/radiologist-info/radiologist-info.component';
import { RISDictionaryComponent } from './components/configuration/ris-dictionary/ris-dictionary.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReportTemplatesComponent } from './components/configuration/report-templates/report-templates.component';
import { CKEditorModule } from 'ckeditor4-angular';
// import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ReportingWorklistComponent } from './components/reporting/reporting-worklist/reporting-worklist.component';
import { ReportingComponent } from './components/workflow/reporting/reporting.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { RISMachineMgtComponent } from './components/configuration/ris-machine-mgt/ris-machine-mgt.component';
import { RISServicesComponent } from './components/workflow/ris-services/ris-services.component';
import { RisWorklistServiceComponent } from './components/workflow/ris-shared/ris-worklist-service/ris-worklist-service.component';
import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { ReportResetRequestComponent } from './components/workflow/report-reset-workflow/report-reset-request/report-reset-request.component';
import { RecommendRejectRequestComponent } from './components/workflow/report-reset-workflow/recommend-reject-request/recommend-reject-request.component';
import { ApproveRejectRequestComponent } from './components/workflow/report-reset-workflow/approve-reject-request/approve-reject-request.component';
import { SendForAuditComponent } from './components/report-audit/send-for-audit/send-for-audit.component';
import { AuditReportComponent } from './components/report-audit/audit-report/audit-report.component';
import { AuditSummaryReportComponent } from './components/report-audit/audit-summary-report/audit-summary-report.component';
import { RisTpServicesComponent } from './components/workflow/ris-shared/ris-tp-services/ris-tp-services.component';
import { RatingModule } from 'ng-starrating';
import { TechAuditComponent } from './components/technician-audit/tech-audit/tech-audit.component';
import { TechAuditFormComponent } from './components/technician-audit/tech-audit-form/tech-audit-form.component';
import { TechAuditWorklistComponent } from './components/technician-audit/tech-audit-worklist/tech-audit-worklist.component';
import { TechAuditSummaryReportComponent } from './components/technician-audit/tech-audit-summary-report/tech-audit-summary-report.component';
import { BaseChartDirective } from 'ng2-charts';
import { RisDashboardLinksComponent } from './components/ris-dashboard-links/ris-dashboard-links.component';
import { ContrastServiceComponent } from './components/workflow/ris-shared/includes/contrast-service/contrast-service.component';
import { AddendumSecondOpinionRequestComponent } from './components/workflow/addendum-second-opinion-request/addendum-second-opinion-request.component';
import { VisitTpInventoryComponent } from './components/workflow/ris-shared/visit-tp-inventory/visit-tp-inventory.component';
import { DICOMButtonComponent } from './components/workflow/ris-shared/dicom-button/dicom-button.component';
import { DICOMDropdownButtonComponent } from './components/workflow/ris-shared/dicom-dropdown-button/dicom-dropdown-button.component';
import { SecondOpinionReportComponent } from './components/reporting/second-opinion-report/second-opinion-report.component';
import { MachineStatusManagementComponent } from './components/configuration/machine-status-management/machine-status-management.component';
import { AssignLevelComponent } from './components/share-configs/assign-level/assign-level.component';
import { ShareAssignComponent } from './components/share-configs/assign-share/assign-share.component';
import { QuickPeerReviwComponent } from './components/reporting/quick-peer-reviw/quick-peer-reviw.component';
import { RefbyMappingComponent } from './components/configuration/refby-mapping/refby-mapping.component';
import { QueueManagerComponent } from './components/workflow/assigner/queue-manager/queue-manager.component';
import { QueueManagerWorklistComponent } from './components/workflow/assigner/queue-manager-worklist/queue-manager-worklist.component';
import { BulkQueueManagerComponent } from './components/workflow/assigner/bulk-queue-manager/bulk-queue-manager.component';
import { PacslinkDashboardComponent } from './components/pacslink-dashboard/pacslink-dashboard/pacslink-dashboard.component';
import { WorklistQueueComponent } from './components/reporting-v2/worklist-queue/worklist-queue.component';
import { ReportingV2Component } from './components/reporting-v2/reporting-v2/reporting-v2.component';
import { ReportingWindowComponent } from './components/reporting-v2/reporting-window/reporting-window.component';
import { MachineUtilizationReportComponent } from './components/machine-utilization-report/machine-utilization-report.component';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { RadiologyStatsComponent } from './components/radiology-stats/radiology-stats.component';
import { RisDueDelayReportsComponent } from './components/ris-due-delay-reports/ris-due-delay-reports.component';
import { AiAssistanceFeedbackComponent } from './components/report-audit/ai-assistance-feedback/ai-assistance-feedback.component';
import { AiAssistanceRequestComponent } from './components/report-audit/ai-assistance-request/ai-assistance-request.component';
import { TechAuditSummaryReportBranchMgrComponent } from './components/technician-audit/tech-audit-summary-report-branch-mgr/tech-audit-summary-report-branch-mgr.component';
import { TechAuditManagerFormComponent } from './components/technician-audit/tech-audit-manager-form/tech-audit-manager-form.component';
import { DoctorShareConfigComponent } from './components/share-configs/doctor-share-config/doctor-share-config.component';
import { RisTatReportComponent } from './components/ris-tat-report/ris-tat-report.component';
import { PartnerMachineSharingReportComponent } from './components/partner-machine-sharing-report/partner-machine-sharing-report.component';
import { EmergencyAssignerComponent } from './components/workflow/ris-shared/emergency-assigner/emergency-assigner.component';
import { RisDelaySummaryReportComponent } from './components/ris-delay-summary-report/ris-delay-summary-report.component';
import { RisDueReportComponent } from './components/ris-due-report/ris-due-report.component';
import { MtWorkloadReportComponent } from './components/ris-report/mt-workload-report/mt-workload-report.component';
import { RadiologistInfov2Component } from './components/workflow/ris-shared/radiologist-infov2/radiologist-infov2.component';
import { InitialReportResetRequestComponent } from './components/workflow/initial-report-reset-workflow/initial-report-reset-request/initial-report-reset-request.component';
import { InitialRecommendRejectRequestComponent } from './components/workflow/initial-report-reset-workflow/initial-recommend-reject-request/initial-recommend-reject-request.component';
import { InitialApproveRejectRequestComponent } from './components/workflow/initial-report-reset-workflow/initial-approve-reject-request/initial-approve-reject-request.component';

@NgModule({
  declarations: 
  [QuestionnaireMainComponent, 
    QuestionComponent, 
    QuestionClassificationComponent, 
    QuestionsGroupComponent, 
    RadiologistComponent, 
    MoComponent, 
    RisWorklistComponent, 
    TechnicianComponent, 
    AssignerComponent, 
    MoQuestionnaireComponent, 
    RisWorklistParamsComponent, 
    EmrComponent, 
    MoHistoryComponent, 
    VitalsComponent, 
    PacsComponent, 
    VisitListComponent, 
    VisitDetailComponent, 
    ActionButtonsLargeComponent, 
    CheckinCheckOutComponent,
    ActionButtonsSmaLLComponent, 
    QueueManagementComponent, 
    RisOneWindowResultDsComponent, 
    RadiologistInfoComponent, 
    RISDictionaryComponent, 
    ReportTemplatesComponent, 
    ReportingWorklistComponent, 
    ReportingComponent,
    RISMachineMgtComponent,
    RISServicesComponent,
    RisWorklistServiceComponent,
    AddendumSecondOpinionRequestComponent,
    ReportResetRequestComponent,
    RecommendRejectRequestComponent,
    ApproveRejectRequestComponent,
    SendForAuditComponent,
    AuditReportComponent,
    AuditSummaryReportComponent,
    RisTpServicesComponent,
    TechAuditComponent,
    TechAuditFormComponent,
    TechAuditWorklistComponent,
    TechAuditSummaryReportComponent,
    RisDashboardLinksComponent,
    ContrastServiceComponent,
    VisitTpInventoryComponent,
    DICOMButtonComponent,
    DICOMDropdownButtonComponent,
    SecondOpinionReportComponent,
    MachineStatusManagementComponent,
    AssignLevelComponent,
    ShareAssignComponent,
    QuickPeerReviwComponent,
    RefbyMappingComponent,
    QueueManagerComponent,
    QueueManagerWorklistComponent,
    BulkQueueManagerComponent,
    PacslinkDashboardComponent,
    WorklistQueueComponent,
    ReportingV2Component,
    ReportingWindowComponent,
    MachineUtilizationReportComponent,
    RadiologyStatsComponent,
    RisDueDelayReportsComponent,
    AiAssistanceFeedbackComponent,
    AiAssistanceRequestComponent,
    TechAuditSummaryReportBranchMgrComponent,
    TechAuditManagerFormComponent,
    DoctorShareConfigComponent,
    RisTatReportComponent,
    PartnerMachineSharingReportComponent,
    EmergencyAssignerComponent,
    RisDelaySummaryReportComponent,
    RisDueReportComponent,
    RisDelaySummaryReportComponent,
    MtWorkloadReportComponent,
    RadiologistInfov2Component,
    InitialReportResetRequestComponent,
    InitialRecommendRejectRequestComponent,
    InitialApproveRejectRequestComponent
  ],
  imports: [
    CommonModule,
    RisRoutingModule,
    SharedModule,
    MatTabsModule,
    DragDropModule, 
    MatFormFieldModule,
    MatListModule,
    MatSlideToggleModule,
    RemarksModule,
    CKEditorModule,
    MatCheckboxModule,
    MatRadioModule,
    PatientBookingModule,
    RatingModule,
    BaseChartDirective,
    NgbTimepickerModule,
  ]
})
export class RisModule { }
