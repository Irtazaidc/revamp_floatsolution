// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LabRoutingModule } from './lab-routing.module';
import { SampleTransportComponent } from './Reports/sample-trnsprt/sample-trnsprt.component';
import { LabTestingComponent } from './Reports/lab-testing/lab-testing.component';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared/shared.module';
import { LabTestingTabComponent } from './Reports/lab-testing/lab-testing-tab/lab-testing-tab.component';
import { LabTestingDateComponent } from './Reports/lab-testing/lab-testing-date/lab-testing-date.component';
import { LabTestingLocComponent } from './Reports/lab-testing/lab-testing-loc/lab-testing-loc.component';
import { SampleTrnsprtTabComponent } from './Reports/sample-trnsprt/sample-trnsprt-tab/sample-trnsprt-tab.component';
import { SampleTrnsprtDateComponent } from './Reports/sample-trnsprt/sample-trnsprt-date/sample-trnsprt-date.component';
import { SampleTrnsprtLocComponent } from './Reports/sample-trnsprt/sample-trnsprt-loc/sample-trnsprt-loc.component';
import { DueReportDetailsComponent } from './Reports/due-reports/due-report-details/due-report-details.component';
import { DueReportComponent } from './Reports/due-reports/due-report/due-report.component';
import { DueReportTabComponent } from './Reports/due-reports/due-report-tab/due-report-tab.component';
import { DelayReportSummaryComponent } from './Reports/delay-reports/delay-report-summary/delay-report-summary.component';
import { DelayReportDetailsComponent } from './Reports/delay-reports/delay-report-details/delay-report-details.component';
import { DelayReportComponent } from './Reports/delay-reports/delay-report/delay-report.component';
import { DelayReportTabComponent } from './Reports/delay-reports/delay-report-tab/delay-report-tab.component';
import { SearchFiltersComponent } from './Reports/search-filters/search-filters.component';
import { DocCompareComponent } from './Reports/doc-compare/doc-compare.component';


@NgModule({
  declarations: [SampleTransportComponent, LabTestingComponent, LabTestingTabComponent, LabTestingDateComponent, LabTestingLocComponent, SampleTrnsprtTabComponent, SampleTrnsprtDateComponent, SampleTrnsprtLocComponent, DueReportDetailsComponent, DueReportComponent, DueReportTabComponent, DelayReportSummaryComponent, DelayReportDetailsComponent, DelayReportComponent, DelayReportTabComponent, SearchFiltersComponent, DocCompareComponent],
  imports: [
    CommonModule,
    LabRoutingModule,
    MatTabsModule,
    MatCardModule,
    SharedModule,
    MatCheckboxModule
  ]
})
export class LabModule { }
