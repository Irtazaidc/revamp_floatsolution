// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { PostJobComponent } from './components/post-job/post-job.component';
import { ManageJobsComponent } from './components/manage-jobs/manage-jobs.component';
import { JobApprovalComponent } from './components/job-approval/job-approval.component';
import { ApplicantListComponent } from './components/applicant-list/applicant-list.component';
import { ShortlistedApplicantsComponent } from './components/shortlisted-applicants/shortlisted-applicants.component';
import { ConfirmedApplicantsComponent } from './components/confirmed-applicants/confirmed-applicants.component';
import { InterviewersComponent } from './components/interviewers/interviewers.component';
import { InterviewProcessComponent } from './components/interview-process/interview-process.component';
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
import { ApplicantsConfirmationComponent } from './components/applicants-confirmation/applicants-confirmation.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { InterviewersManagementComponent } from './components/interviewers-management/interviewers-management.component';
import { EmployeeMedicalRecordComponent } from './components/employee-medical-record/employee-medical-record.component';


const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Recruitment',
      breadcrumb: 'Recruitment',
      breadcrumb_caption: 'Recruitment',
      icon: 'icofont-chart-bar-graph bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'recruitment',
        pathMatch: 'full'
      },
      {
        path: 'post-job',
        component: PostJobComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'post-job/:id',
        component: PostJobComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'manage-job',
        component: ManageJobsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'job-approval',
        component: JobApprovalComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }, 
      {
        path: 'applicant-list',
        component: ApplicantListComponent,
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }, 
      {
        path: 'shortlisted-applicants',
        component: ShortlistedApplicantsComponent,
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }, 
      {
        path: 'interviewers',
        component: InterviewersComponent,
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }, 
      {
        path: 'confirmed-applicants',
        component: ConfirmedApplicantsComponent,
        data: {
          title: 'Recruitment',
          breadcrumb: 'Recruitment',
          breadcrumb_caption: 'Recruitment',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }, 
      {
        path: 'interview-process',
        component: InterviewProcessComponent,
        data: {
          title: 'Interveiw Process',
          breadcrumb: 'Interveiw Process',
          breadcrumb_caption: 'Interveiw Process',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }, 
      {
        path: 'interview-result',
        component: InterviewResultComponent,
        data: {
          title: 'Interveiw Result',
          breadcrumb: 'Interveiw Result',
          breadcrumb_caption: 'Interveiw Result',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'second-shortlisted-applicants',
        component: SecondShortlistedApplicantsComponent,
        data: {
          title: 'Second Shortlisted Applicants',
          breadcrumb: 'Second Shortlisted Applicants',
          breadcrumb_caption: 'Second Shortlisted Applicants',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'second-confirmed-applicants',
        component: SecondConfirmedApplicantsComponent,
        data: {
          title: 'Second Confirmed Applicants',
          breadcrumb: 'Second Confirmed Applicants',
          breadcrumb_caption: 'Second Confirmed Applicants',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'second-interviewers',
        component: SecondInterviewersComponent,
        data: {
          title: 'Interviewers Management(2nd)',
          breadcrumb: 'Interviewers Management(2nd)',
          breadcrumb_caption: 'Interviewers Management(2nd)',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'second-interview-process',
        component: SecondInterviewProcessComponent,
        data: {
          title: 'Second Interview Process',
          breadcrumb: 'Second Interview Process',
          breadcrumb_caption: 'Second Interview Process',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'second-interview-result',
        component: SecondInterviewResultComponent,
        data: {
          title: 'Second Interveiw Result',
          breadcrumb: 'Second Interveiw Result',
          breadcrumb_caption: 'Second Interveiw Result',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'third-shortlisted-applicants',
        component: ThirdShortlistedApplicantsComponent,
        data: {
          title: '3rd Shortlisted Applicants',
          breadcrumb: '3rd Shortlisted Applicants',
          breadcrumb_caption: '3rd Shortlisted Applicants',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'third-confirmed-applicants',
        component: ThirdConfirmedApplicantsComponent,
        data: {
          title: 'Third Confirmed Applicants',
          breadcrumb: 'Third Confirmed Applicants',
          breadcrumb_caption: 'Third Confirmed Applicants',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'third-interviewers',
        component: ThirdInterviewersComponent,
        data: {
          title: 'Interviewers Management(3rd)',
          breadcrumb: 'Interviewers Management(3rd)',
          breadcrumb_caption: 'Interviewers Management(3rd)',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'third-interview-process',
        component: ThirdInterviewProcessComponent,
        data: {
          title: 'Third Interview Process',
          breadcrumb: 'Third Interview Process',
          breadcrumb_caption: 'Third Interview Process',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'third-interview-result',
        component: ThirdInterviewResultComponent,
        data: {
          title: 'Third Interveiw Result',
          breadcrumb: 'Third Interveiw Result',
          breadcrumb_caption: 'Third Interveiw Result',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'job-mgt',
        component: JobManagementComponent,
        data: {
          title: 'Jobs Management',
          breadcrumb: 'Jobs Management',
          breadcrumb_caption: 'Jobs Management',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'applicant-mgt',
        component: ApplicantManagementComponent,
        data: {
          title: 'Applicants Management',
          breadcrumb: 'Applicant Management',
          breadcrumb_caption: 'Applicant Management',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'interviewers-mgt',
        component: InterviewersManagementComponent,
        data: {
          title: 'Interviewers Management',
          breadcrumb: 'Interviewers Management',
          breadcrumb_caption: 'Interviewers Management',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'first-interview',
        component: FirstInterviewComponent,
        data: {
          title: 'First Interview',
          breadcrumb: 'First Interview',
          breadcrumb_caption: 'First Interview',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'second-interview',
        component: SecondInterviewComponent,
        data: {
          title: 'Second Interview',
          breadcrumb: 'Second Interview',
          breadcrumb_caption: 'Second Interview',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'third-interview',
        component: ThirdInterviewComponent,
        data: {
          title: 'Third Interview',
          breadcrumb: 'Third Interview',
          breadcrumb_caption: 'Third Interview',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'applicants-confirmation',
        component: ApplicantsConfirmationComponent,
        data: {
          title: 'Applicant Confirmation',
          breadcrumb: 'Applicant Confirmation',
          breadcrumb_caption: 'Applicant Confirmation',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'onboarding',
        component: OnboardingComponent,
        data: {
          title: 'Onboarding',
          breadcrumb: 'Onboarding',
          breadcrumb_caption: 'Onboarding',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      }
      

    ]
  },
  {
    path: '',
    data: {
      title: 'EMR',
      breadcrumb: 'EMR',
      breadcrumb_caption: 'EMR',
      icon: 'icofont-chart-bar-graph bg-c-blue',
      status: false
    },
    children: [
      {
        path: 'employee-medical-record',
        component: EmployeeMedicalRecordComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Employee Medical Record',
          breadcrumb: 'Employee Medical Record',
          breadcrumb_caption: 'Employee Medical Record',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecruitmentRoutingModule { }
