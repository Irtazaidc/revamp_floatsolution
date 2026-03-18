// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { SampleTrnsprtTabComponent } from './Reports/sample-trnsprt/sample-trnsprt-tab/sample-trnsprt-tab.component';
import { LabTestingTabComponent } from './Reports/lab-testing/lab-testing-tab/lab-testing-tab.component';
import { DelayReportComponent } from './Reports/delay-reports/delay-report/delay-report.component';
import { DelayReportTabComponent } from './Reports/delay-reports/delay-report-tab/delay-report-tab.component';
import { DueReportTabComponent } from './Reports/due-reports/due-report-tab/due-report-tab.component';

const routes: Routes = [

  {
    path: '',
    data: {
        title: 'Test Profile Data',
        breadcrumb: 'Test Profile Data',
        breadcrumb_caption: 'Test Profile Data',
        icon: 'icofont-home bg-c-pink',
        status: false
    },
    children: [
        {
            path: '',
            redirectTo: 'oladoc-rpt',
          },
            {
            path: 'sample-trnsprt-TAT',
            component: SampleTrnsprtTabComponent,
            canActivate: [AuthGuard],
            data: {
              title: 'Sample Transportation TAT',
              breadcrumb: 'Sample Transportation TAT',
              breadcrumb_caption: 'Sample Transportation TAT',
              icon: 'icofont-home bg-c-pink',
              status: false
            }
          },
          {
            path: 'lab-testing-TAT',
            component: LabTestingTabComponent,
            canActivate: [AuthGuard],
            data: {
              title: 'Lab Testing TAT',
              breadcrumb: 'Lab Testing TAT',
              breadcrumb_caption: 'Lab Testing TAT',
              icon: 'icofont-home bg-c-pink',
              status: false
            }
          },
          {
            path: 'delay-report',
            component: DelayReportTabComponent,
            canActivate: [AuthGuard],
            data: {
              title: 'delay-report',
              breadcrumb: 'delay-report',
              breadcrumb_caption: 'delay-report',
              icon: 'icofont-home bg-c-pink',
              status: false
            }
          },
          {
            path: 'due-report',
            component: DueReportTabComponent,
            canActivate: [AuthGuard],
            data: {
              title: 'due-report',
              breadcrumb: 'due-report',
              breadcrumb_caption: 'due-report',
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
export class LabRoutingModule { }
