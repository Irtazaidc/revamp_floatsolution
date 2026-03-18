// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FdoManagementRoutingModule } from './fdo-management-routing.module';
import { MyCashTallyComponent } from './components/my-cash-tally/my-cash-tally.component';
import { DailySalesReportComponent } from './components/daily-sales-report/daily-sales-report.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { DueClearanceReportComponent } from './components/due-clearance-report/due-clearance-report.component';
import { CancellationReportComponent } from './components/cancellation-report/cancellation-report.component';
import { PatientTestCountsComponent } from './components/patient-test-counts/patient-test-counts.component';
import { PatientInsuranceComponent } from './components/patient-insurance/patient-insurance.component';
import { MatRadioModule } from '@angular/material/radio';
import { InsuranceSummaryComponent } from './components/insurance-summary/insurance-summary.component';
import { PatientInsuranceDashboardComponent } from './components/patient-insurance-dashboard/patient-insurance-dashboard.component';
import { BaseChartDirective } from 'ng2-charts';
import { InsuranceRepostingComponent } from './components/insurance-reposting/insurance-reposting.component';
import { UnregisteredPatientsComponent } from './components/unregistered-patients/unregistered-patients.component';
import { RegisteredPatientsComponent } from './components/registered-patients/registered-patients.component';
import { UserCashReportComponent } from './components/user-cash-report/user-cash-report.component';


@NgModule({
  declarations: [MyCashTallyComponent, DailySalesReportComponent, DueClearanceReportComponent, CancellationReportComponent, PatientTestCountsComponent, PatientInsuranceComponent, InsuranceSummaryComponent, PatientInsuranceDashboardComponent, InsuranceRepostingComponent, UnregisteredPatientsComponent, RegisteredPatientsComponent, UserCashReportComponent,],
  imports: [
    CommonModule,
    FdoManagementRoutingModule,
    SharedModule,
    MatTabsModule,
     MatRadioModule,
    MatCardModule,
    NgbTypeaheadModule,
    BaseChartDirective,
  ]
})
export class FdoManagementModule { }
