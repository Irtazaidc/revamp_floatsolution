// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecruitmentRoutingModule } from './recruitment-routing.module';
// import { SharedModule } from '../../../app/shared/shared.module';
import { SharedModule } from '../shared/shared.module';
import { PostJobComponent } from './components/post-job/post-job.component';
import { CKEditorModule } from 'ckeditor4-angular';
import { ManageJobsComponent } from './components/manage-jobs/manage-jobs.component';
import { JobApprovalComponent } from './components/job-approval/job-approval.component';
import { ApplicantListComponent } from './components/applicant-list/applicant-list.component';
import { ShortlistedApplicantsComponent } from './components/shortlisted-applicants/shortlisted-applicants.component';
import { ConfirmedApplicantsComponent } from './components/confirmed-applicants/confirmed-applicants.component';
import { InterviewersComponent } from './components/interviewers/interviewers.component';
import { MatTabsModule } from '@angular/material/tabs';
import { InterviewProcessComponent } from './components/interview-process/interview-process.component';
import { MatCardModule } from '@angular/material/card';
import { InterviewResultComponent } from './components/interview-result/interview-result.component';
import { SecondShortlistedApplicantsComponent } from './components/second-shortlisted-applicants/second-shortlisted-applicants.component';
import { SecondConfirmedApplicantsComponent } from './components/second-confirmed-applicants/second-confirmed-applicants.component';
import { SecondInterviewersComponent } from './components/second-interviewers/second-interviewers.component';
import { SecondInterviewProcessComponent } from './components/second-interview-process/second-interview-process.component';
import { SecondInterviewResultComponent } from './components/second-interview-result/second-interview-result.component';
import { ThirdShortlistedApplicantsComponent } from './components/third-shortlisted-applicants/third-shortlisted-applicants.component';
import { ThirdConfirmedApplicantsComponent } from './components/third-confirmed-applicants/third-confirmed-applicants.component';
import { ThirdInterviewersComponent } from './components/third-interviewers/third-interviewers.component';
import { ThirdInterviewProcessComponent } from './components/third-interview-process/third-interview-process.component';
import { ThirdInterviewResultComponent } from './components/third-interview-result/third-interview-result.component';
import { JobManagementComponent } from './components/job-management/job-management.component';
import { ApplicantManagementComponent } from './components/applicant-management/applicant-management.component';
import { FirstInterviewComponent } from './components/first-interview/first-interview.component';
import { SecondInterviewComponent } from './components/second-interview/second-interview.component';
import { ThirdInterviewComponent } from './components/third-interview/third-interview.component';
import { ApprovedJobsComponent } from './components/approved-jobs/approved-jobs.component';
import { ApplicantsConfirmationComponent } from './components/applicants-confirmation/applicants-confirmation.component';
import { FirstConfirmationProcessComponent } from './components/first-confirmation-process/first-confirmation-process.component';
import { ApplicantListAllComponent } from './components/applicant-list-all/applicant-list-all.component';
import { ApplicantsParentComponent } from './components/applicants-parent/applicants-parent.component';
import { SecondConfirmationProcessComponent } from './components/second-confirmation-process/second-confirmation-process.component';
import { FinalizedConfirmationProcessComponent } from './components/finalized-confirmation-process/finalized-confirmation-process.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { InterviewersManagementComponent } from './components/interviewers-management/interviewers-management.component';
import { FirstAssignedInterviewersComponent } from './components/first-assigned-interviewers/first-assigned-interviewers.component';
import { SecondAssignedInterviewersComponent } from './components/second-assigned-interviewers/second-assigned-interviewers.component';
import { ThirdAssignedInterviewersComponent } from './components/third-assigned-interviewers/third-assigned-interviewers.component';
import { EmployeeMedicalRecordComponent } from './components/employee-medical-record/employee-medical-record.component';
import { RemarksModule } from '../remarks/remarks.module';
// import { NgxDocViewerModule} from 'ngx-doc-viewer';  



@NgModule({
  declarations: [PostJobComponent, ManageJobsComponent, JobApprovalComponent, ApplicantListComponent, ShortlistedApplicantsComponent, ConfirmedApplicantsComponent, InterviewersComponent, InterviewProcessComponent, InterviewResultComponent, SecondShortlistedApplicantsComponent, SecondConfirmedApplicantsComponent, SecondInterviewersComponent, SecondInterviewProcessComponent, SecondInterviewResultComponent, ThirdShortlistedApplicantsComponent, ThirdConfirmedApplicantsComponent, ThirdInterviewersComponent, ThirdInterviewProcessComponent, ThirdInterviewResultComponent, JobManagementComponent, ApplicantManagementComponent, FirstInterviewComponent, SecondInterviewComponent, ThirdInterviewComponent, ApprovedJobsComponent, ApplicantsConfirmationComponent, FirstConfirmationProcessComponent, ApplicantListAllComponent, ApplicantsParentComponent, SecondConfirmationProcessComponent, FinalizedConfirmationProcessComponent, OnboardingComponent, InterviewersManagementComponent, FirstAssignedInterviewersComponent, SecondAssignedInterviewersComponent, ThirdAssignedInterviewersComponent,EmployeeMedicalRecordComponent],
  imports: [
    CommonModule,
    SharedModule,
    RecruitmentRoutingModule,
    CKEditorModule,
    MatTabsModule,
    MatCardModule,
    RemarksModule,
    // NgxDocViewerModule
  ] 
})
export class RecruitmentModule { }
