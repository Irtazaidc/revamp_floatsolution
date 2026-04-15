// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyCashTallyComponent } from './components/my-cash-tally/my-cash-tally.component';
import { DailySalesReportComponent } from './components/daily-sales-report/daily-sales-report.component';
import { DueClearanceReportComponent } from './components/due-clearance-report/due-clearance-report.component';
import { CancellationReportComponent } from './components/cancellation-report/cancellation-report.component';
import { PatientTestCountsComponent } from './components/patient-test-counts/patient-test-counts.component';
import { AuthGuard } from '../auth/_services/auth.guard';
import { PatientInsuranceComponent } from './components/patient-insurance/patient-insurance.component';
import { InsuranceSummaryComponent } from './components/insurance-summary/insurance-summary.component';
import { PatientInsuranceDashboardComponent } from './components/patient-insurance-dashboard/patient-insurance-dashboard.component';
import { InsuranceRepostingComponent } from './components/insurance-reposting/insurance-reposting.component';
import { UnregisteredPatientsComponent } from './components/unregistered-patients/unregistered-patients.component';
import { RegisteredPatientsComponent } from './components/registered-patients/registered-patients.component';
import { UserCashReportComponent } from './components/user-cash-report/user-cash-report.component';

const routes: Routes = [
  {
      path: '',
      data: {
          title: 'Sales Reports',
          breadcrumb: 'Sales Reports',
          breadcrumb_caption: 'Sales Reports',
          icon: 'icofont-home bg-c-blue',
          status: false
      },
      children: [
          {
              path: '',
              redirectTo: 'my-cash-tally',
              pathMatch: 'full'
          },
          {
              path: 'my-cash-tally',
              component: MyCashTallyComponent,
              canActivate: [AuthGuard],
              data: {
                  title: 'My Cash Tally Report',
                  breadcrumb: 'My Cash Tally Report',
                  breadcrumb_caption: 'My Cash Tally Report',
                  status: false
              }
          },
          {
              path: 'daily-sales-report',
              component: DailySalesReportComponent,
              canActivate: [AuthGuard],
              data: {
                  title: 'Daily Sales Reports',
                  breadcrumb: 'Daily Sales Reports',
                  breadcrumb_caption: 'Daily Sales Reports',
                  status: false
              }
          },
          {
              path: 'user-cash-report',
              component: UserCashReportComponent,
              canActivate: [AuthGuard],
              data: {
                  title: 'User Cash Reports',
                  breadcrumb: 'User Cash Reports',
                  breadcrumb_caption: 'User Cash Reports',
                  status: false
              }
          },
          {
              path: 'due-clearance-report',
              component: DueClearanceReportComponent,
              canActivate: [AuthGuard],
              data: {
                  title: 'Due Clearance Report',
                  breadcrumb: 'Due Clearance Report',
                  breadcrumb_caption: 'Due Clearance Report',
                  status: false
              }
          },
          {
              path: 'cancellation-report',
              component: CancellationReportComponent,
              canActivate: [AuthGuard],
              data: {
                  title: 'Cancellation Report',
                  breadcrumb: 'Cancellation Report',
                  breadcrumb_caption: 'Cancellation Report',
                  status: false
              }
          },
          {
              path: 'patient-test-count',
              component: PatientTestCountsComponent,
              canActivate: [AuthGuard],
              data: {
                  title: 'Patient and Test Counts Report',
                  breadcrumb: 'Patient and Test Counts Report',
                  breadcrumb_caption: 'Patient and Test Counts Report',
                  status: false
              }
          },
          {
              path: 'patient-insurance',
              component: PatientInsuranceComponent,
              canActivate: [AuthGuard],
            
          },
          {
              path: 'insurance-reposting',
              component: InsuranceRepostingComponent,
            //   canActivate: [AuthGuard],
            
          },
          {
              path: 'patient-insurance-dashboard',
              component: PatientInsuranceDashboardComponent,
              canActivate: [AuthGuard],
            
          },
          {
              path: 'registered-patients',
              component: RegisteredPatientsComponent,
              canActivate: [AuthGuard],
            
          },
          {
              path: 'unregistered-patients',
              component: UnregisteredPatientsComponent,
              canActivate: [AuthGuard],
            
          },
          {
              path: 'insurance-summary',
              component: InsuranceSummaryComponent,
            //   canActivate: [AuthGuard],
          },
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FdoManagementRoutingModule { }
