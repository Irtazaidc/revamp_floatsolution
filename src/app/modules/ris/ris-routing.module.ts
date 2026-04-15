// @ts-nocheck
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { QuestionnaireMainComponent } from './components/configuration/questionnaire/questionnaire-main/questionnaire-main.component'
import { RadiologistComponent } from './components/configuration/radiologist/radiologist.component';
import { AssignerComponent } from './components/workflow/ris-shared/assigner/assigner.component';
import { MoComponent } from './components/workflow/mo/mo.component';
import { QueueManagementComponent } from './components/workflow/queue-management/queue-management.component';
import { TechnicianComponent } from './components/workflow/technician/technician.component';
import { RisOneWindowResultDsComponent } from './components/reporting/ris-one-window-result/ris-one-window-result-ds/ris-one-window-result-ds.component';
import { RISDictionaryComponent } from './components/configuration/ris-dictionary/ris-dictionary.component';
import { ReportTemplatesComponent } from './components/configuration/report-templates/report-templates.component';
import { ReportingWorklistComponent } from './components/reporting/reporting-worklist/reporting-worklist.component';
import { RISMachineMgtComponent } from './components/configuration/ris-machine-mgt/ris-machine-mgt.component';
import { RISServicesComponent } from './components/workflow/ris-services/ris-services.component';
import { AddendumSecondOpinionRequestComponent } from './components/workflow/addendum-second-opinion-request/addendum-second-opinion-request.component';
import { ReportResetRequestComponent } from './components/workflow/report-reset-workflow/report-reset-request/report-reset-request.component';
import { RecommendRejectRequestComponent } from './components/workflow/report-reset-workflow/recommend-reject-request/recommend-reject-request.component';
import { ApproveRejectRequestComponent } from './components/workflow/report-reset-workflow/approve-reject-request/approve-reject-request.component';
import { SendForAuditComponent } from './components/report-audit/send-for-audit/send-for-audit.component';
import { AuditReportComponent } from './components/report-audit/audit-report/audit-report.component';
import { AuditSummaryReportComponent } from './components/report-audit/audit-summary-report/audit-summary-report.component';
import { TechAuditComponent } from './components/technician-audit/tech-audit/tech-audit.component';
import { TechAuditSummaryReportComponent } from './components/technician-audit/tech-audit-summary-report/tech-audit-summary-report.component';
import { RisDashboardLinksComponent } from './components/ris-dashboard-links/ris-dashboard-links.component';
import { SecondOpinionReportComponent } from './components/reporting/second-opinion-report/second-opinion-report.component';
import { AssignLevelComponent } from './components/share-configs/assign-level/assign-level.component';
import { ShareAssignComponent } from './components/share-configs/assign-share/assign-share.component';
import { QuickPeerReviwComponent } from './components/reporting/quick-peer-reviw/quick-peer-reviw.component';
import { RefbyMappingComponent } from './components/configuration/refby-mapping/refby-mapping.component';
import { QueueManagerComponent } from './components/workflow/assigner/queue-manager/queue-manager.component';
import { BulkQueueManagerComponent } from './components/workflow/assigner/bulk-queue-manager/bulk-queue-manager.component';
import { PacslinkDashboardComponent } from './components/pacslink-dashboard/pacslink-dashboard/pacslink-dashboard.component';
import { ReportingV2Component } from './components/reporting-v2/reporting-v2/reporting-v2.component';
import { MachineUtilizationReportComponent } from './components/machine-utilization-report/machine-utilization-report.component';
import { RadiologyStatsComponent } from './components/radiology-stats/radiology-stats.component';
import { RisDueDelayReportsComponent } from './components/ris-due-delay-reports/ris-due-delay-reports.component';
import { AiAssistanceFeedbackComponent } from './components/report-audit/ai-assistance-feedback/ai-assistance-feedback.component';
import { AiAssistanceRequestComponent } from './components/report-audit/ai-assistance-request/ai-assistance-request.component';
import { TechAuditSummaryReportBranchMgrComponent } from './components/technician-audit/tech-audit-summary-report-branch-mgr/tech-audit-summary-report-branch-mgr.component';
import { DoctorShareConfigComponent } from './components/share-configs/doctor-share-config/doctor-share-config.component';
import { RisTatReportComponent } from './components/ris-tat-report/ris-tat-report.component';
import { PartnerMachineSharingReportComponent } from './components/partner-machine-sharing-report/partner-machine-sharing-report.component';
import { RisDelaySummaryReportComponent } from './components/ris-delay-summary-report/ris-delay-summary-report.component';
import { MtWorkloadReportComponent } from './components/ris-report/mt-workload-report/mt-workload-report.component';
import { RisDueReportComponent } from './components/ris-due-report/ris-due-report.component';
import { InitialReportResetRequestComponent } from './components/workflow/initial-report-reset-workflow/initial-report-reset-request/initial-report-reset-request.component';
import { InitialRecommendRejectRequestComponent } from './components/workflow/initial-report-reset-workflow/initial-recommend-reject-request/initial-recommend-reject-request.component';
import { InitialApproveRejectRequestComponent } from './components/workflow/initial-report-reset-workflow/initial-approve-reject-request/initial-approve-reject-request.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Questionnaire Management',
      breadcrumb: 'Questionnaire Management',
      breadcrumb_caption: 'Questionnaire Management',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'questionnaire',
        pathMatch: 'full'
      },
      {
        path: 'questionnaire',
        component: QuestionnaireMainComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Questionnaire Management',
          breadcrumb: 'Questionnaire Management',
          breadcrumb_caption: 'Questionnaire Management',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'radiologist',
        component: RadiologistComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Radiologist',
          breadcrumb: 'Radiologist',
          breadcrumb_caption: 'Radiologist',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'mo-worklist',
        component: MoComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'MO Worklist',
          breadcrumb: 'MO Worklist',
          breadcrumb_caption: 'MO Worklist',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'tech-worklist',
        component: TechnicianComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Tech Worklist',
          breadcrumb: 'Tech Worklist',
          breadcrumb_caption: 'Tech Worklist',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'tech-audit',
        component: TechAuditComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Technologist Audit',
          breadcrumb: 'Technologist Audit',
          breadcrumb_caption: 'Technologist Audit',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'ris-services',
        component: RISServicesComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Services',
          breadcrumb: 'RIS Services',
          breadcrumb_caption: 'RIS Services',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'queue-management',
        component: QueueManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Queue Management',
          breadcrumb: 'Queue Management',
          breadcrumb_caption: 'Queue Management',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'assign-bulk-test',
        component: QueueManagementComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Assign Bulk Test',
          breadcrumb: 'Assign Bulk Test',
          breadcrumb_caption: 'Assign Bulk Test',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'reporting-worklist',
        component: ReportingWorklistComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Reporting Worklist',
          breadcrumb: 'Reporting Worklist',
          breadcrumb_caption: 'Reporting Worklist',
          icon: 'icofont-home bg-c-blue',
          status: false
        },
      },
      {
        path: 'reporting-v2',
        component: ReportingV2Component,
        // canActivate: [AuthGuard],
        data: {
          title: 'Reporting Worklist V2.0',
          breadcrumb: 'Reporting Worklist V2.0',
          breadcrumb_caption: 'Reporting Worklist V2.0',
          icon: 'icofont-home bg-c-blue',
          status: false
        },
      },
      {
        path: 'peer-review',
        component: QuickPeerReviwComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Peer Review',
          breadcrumb: 'Peer Review',
          breadcrumb_caption: 'Peer Review',
          icon: 'icofont-home bg-c-blue',
          status: false
        },
      },
      {
        path: 'ris-result-entry',
        component: RisOneWindowResultDsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Queue Management',
          breadcrumb: 'Queue Management',
          breadcrumb_caption: 'Queue Management',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'ris-dictionary',
        component: RISDictionaryComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Dictionary',
          breadcrumb: 'RIS Dictionary',
          breadcrumb_caption: 'RIS Dictionary',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'ris-user-dictionary',
        component: RISDictionaryComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS User Dictionary',
          breadcrumb: 'RIS User Dictionary',
          breadcrumb_caption: 'RIS User Dictionary',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'report-templates',
        component: ReportTemplatesComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Report Templates',
          breadcrumb: 'Report Templates',
          breadcrumb_caption: 'Report Templates',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'user-report-templates',
        component: ReportTemplatesComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'User Report Templates',
          breadcrumb: 'User Report Templates',
          breadcrumb_caption: 'User Report Templates',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'ris-machine-mgt',
        component: RISMachineMgtComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Machine Config.',
          breadcrumb: 'RIS Machine Config.',
          breadcrumb_caption: 'RIS Machine Config.',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'addendum-second-opinion-request',
        component: AddendumSecondOpinionRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Addendum Second Opinion Req.',
          breadcrumb: 'Addendum Second Opinion Req.',
          breadcrumb_caption: 'Addendum Second Opinion Req.',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'second-opinion-report',
        component: SecondOpinionReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Second Opinion Report',
          breadcrumb: 'Second Opinion Report',
          breadcrumb_caption: 'Second Opinion Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },

      //Final report reset workflow
      {
        path: 'report-reset-request',
        component: ReportResetRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Report Request Request',
          breadcrumb: 'Report Request Request',
          breadcrumb_caption: 'Report Request Request',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'recommend-reject-request',
        component: RecommendRejectRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Recommend/Reject Reset Request',
          breadcrumb: 'Recommend/Reject Reset Request',
          breadcrumb_caption: 'Recommend/Reject Reset Request',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'approve-reject-request',
        component: ApproveRejectRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Approve/Reject Reset Request',
          breadcrumb: 'Approve/Reject Reset Request',
          breadcrumb_caption: 'Approve/Reject Reset Request',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      ///////////////////////////////////////

      //initial report reset workflow
      {
        path: 'initial-report-reset-request',
        component: InitialReportResetRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Initial Reset Reques',
          breadcrumb: 'Initial Reset Reques',
          breadcrumb_caption: 'Initial Reset Reques',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'initial-recommend-reject-request',
        component: InitialRecommendRejectRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Recommend/Reject Reset Request',
          breadcrumb: 'Recommend/Reject Reset Request',
          breadcrumb_caption: 'Recommend/Reject Reset Request',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'initial-approve-reject-request',
        component: InitialApproveRejectRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Approve/Reject Reset Request',
          breadcrumb: 'Approve/Reject Reset Request',
          breadcrumb_caption: 'Approve/Reject Reset Request',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      ////////////////////////////////////////

      {
        path: 'send-for-audit',
        component: SendForAuditComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Send Reports for Audit',
          breadcrumb: 'Send Reports for Audit',
          breadcrumb_caption: 'Send Reports for Audit',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'audit-report',
        component: AuditReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Audit Report',
          breadcrumb: 'Audit Report',
          breadcrumb_caption: 'Audit Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        },
        children: [
          {
            path: '',
            redirectTo: 'audit-report',
            pathMatch: 'full'
          },
          {
            path: ':id', // Defined the parameter here
            component: AuditReportComponent, // The component i want to load
            data: {
              title: 'Audit Report Detail',
              breadcrumb: 'Audit Report Detail',
              breadcrumb_caption: 'Audit Report Detail',
              icon: 'fas fa-file-medical bg-c-blue',
              status: false
            }
          }
        ]
      },
      {
        path: 'audit-report/:id',
        component: AuditReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Audit Report',
          breadcrumb: 'Audit Report',
          breadcrumb_caption: 'Audit Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'audit-summary-report',
        component: AuditSummaryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Audit Summary Report(mgr)',
          breadcrumb: 'Audit Summary Report(mgr)',
          breadcrumb_caption: 'Audit Summary Report(mgr)',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'radiologist-audit-findings',
        component: AuditSummaryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Radiologist Audit Findings',
          breadcrumb: 'Radiologist Audit Findings',
          breadcrumb_caption: 'Radiologist Audit Findings',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'audit-findings',
        component: AuditSummaryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Audit Findings(mgr)',
          breadcrumb: 'Audit Findings(mgr)',
          breadcrumb_caption: 'Audit Findings(mgr)',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'tech-audit-summary-report',
        component: TechAuditSummaryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Tech Audit Summary Report',
          breadcrumb: 'Tech Audit Summary Report',
          breadcrumb_caption: 'Tech Audit Summary Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'my-tech-audit-summary-report',
        component: TechAuditSummaryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'My Tech Audit Summary Report',
          breadcrumb: 'My Tech Audit Summary Report',
          breadcrumb_caption: 'My Tech Audit Summary Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'assign-level',
        component: AssignLevelComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Assign radiologist level',
          breadcrumb: 'Assign radiologist level',
          breadcrumb_caption: 'Assign radiologist level',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'assign-share',
        component: ShareAssignComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Assign radiologist share',
          breadcrumb: 'Assign radiologist share',
          breadcrumb_caption: 'Assign radiologist share',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'doctor-share-config',
        component: DoctorShareConfigComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Doctor Share Config',
          breadcrumb: 'Doctor Share Config',
          breadcrumb_caption: 'Doctor Share Config',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'pacslink-dashboard',
        component: PacslinkDashboardComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Pacslink Dashboard',
          breadcrumb: 'Pacslink Dashboard',
          breadcrumb_caption: 'Pacslink Dashboard',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,

        }
      },
      {
        path: 'machine-utilization-report',
        component: MachineUtilizationReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Machine Utilization Report',
          breadcrumb: 'Machine Utilization Report',
          breadcrumb_caption: 'Machine Utilization Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,

        }
      },
      {
        path: 'radiology-stats',
        component: RadiologyStatsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Radiolody Statistics Report',
          breadcrumb: 'Radiolody Statistics Report',
          breadcrumb_caption: 'Radiolody Statistics Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,

        }
      },
      {
        path: 'ris-due-delay-reports',
        component: RisDueDelayReportsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Due-Delay Report',
          breadcrumb: 'RIS Due-Delay Report',
          breadcrumb_caption: 'RIS Due-Delay Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,

        }
      },
      {
        path: 'ris-delay-summary-reports',
        component: RisDelaySummaryReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Delay Summary Report',
          breadcrumb: 'RIS Delay Summary Report',
          breadcrumb_caption: 'RIS Delay Summary Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,

        }
      },
      {
        path: 'ris-due-report',
        component: RisDueReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Due Report',
          breadcrumb: 'RIS Due Report',
          breadcrumb_caption: 'RIS Due Report',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,

        }
      },
      {
        path: 'ris-tat-report',
        component: RisTatReportComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'ris-machine-sharing-report',
        component: PartnerMachineSharingReportComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'queue-manager',
        component: QueueManagerComponent,
        // canActivate: [AuthGuard],
      },
      {
        path: 'bulk-queue-manager',
        component: QueueManagerComponent,
        // canActivate: [AuthGuard],
      },
      {
        path: 'refby-radiologist-mapping',
        component: RefbyMappingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'tech-audit-summary-report-branch-mgr',
        component: TechAuditSummaryReportBranchMgrComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Tech Audit Summary (Branch Mgr)',
          breadcrumb: 'Tech Audit Summary (Branch Mgr)',
          breadcrumb_caption: 'Tech Audit Summary (Branch Mgr)',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'ris-dashboard',
        component: RisDashboardLinksComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'RIS Dashboard',
          breadcrumb: 'RIS Dashboard',
          breadcrumb_caption: 'RIS Dashboard',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false
        }
      },
      {
        path: 'ai-req-feedback',
        component: AiAssistanceRequestComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'AI Request Feedback',
          breadcrumb: 'AI Request Feedback',
          breadcrumb_caption: 'AI Request Feedback',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,
          ignoreAuth: true
        }
      },
      {
        path: 'ai-req-feedback-audit',
        component: AiAssistanceFeedbackComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'AI Req. Feedback Audit',
          breadcrumb: 'AI Req. Feedback Audit',
          breadcrumb_caption: 'AI Req. Feedback Audit',
          icon: 'fas fa-file-medical bg-c-blue',
          status: false,
          ignoreAuth: true
        }
      },
      {
        path: 'mt-workload-report',
        component: MtWorkloadReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'MT Workload Report',
          breadcrumb: 'MT Workload Report',
          breadcrumb_caption: 'MT Workload Report',
          icon: 'fas fa-file-medical bg-c-blue',       
        }
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RisRoutingModule { }
