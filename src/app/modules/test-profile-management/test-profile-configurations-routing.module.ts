// @ts-nocheck
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { TestCommentsComponent } from './components/test-comments/test-comments.component';
import { TestProfileConfigurationsComponent } from './components/test-profile-configurations/test-profile-configurations.component';
import { TestProfileRatesComponent } from './components/test-profile-rates/test-profile-rates.component';
import { TpChargeMasterComponent } from './components/tp-charge-master/tp-charge-master.component';
import { ReportDisclaimerComponent } from './components/report-disclaimer/report-disclaimer.component';
import { ManageTestProfileComponent } from './components/manage-tp/manage-test-profile/manage-test-profile.component';

const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Test Profile Management',
      breadcrumb: 'Test Profile Management',
      breadcrumb_caption: 'Test Profile Management',
      icon: 'icofont-home bg-c-pink',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'test-profile-configurations'
      },
      {
        path: 'test-profile-configurations',
        component: TestProfileConfigurationsComponent,
        //canActivate: [AuthGuard],
        data: {
          title: 'Test Profile Configurations',
          breadcrumb: 'Configurations',
          breadcrumb_caption: 'Test Profile Configurations',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'report-disclaimer',
        component: ReportDisclaimerComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Report Disclaimer',
          breadcrumb: 'Report Disclaimer',
          breadcrumb_caption: 'Report Disclaimer',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'test-rates',
        component: TestProfileRatesComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Test Profile Rates',
          breadcrumb: 'Configurations',
          breadcrumb_caption: 'Test Profile Rates',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'test-comments',
        component: TestCommentsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Test Comments',
          breadcrumb: 'Test Comments',
          breadcrumb_caption: 'Test Comments',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'tp-charge-master',
        component: TpChargeMasterComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Charge Master',
          breadcrumb: 'Charge Master',
          breadcrumb_caption: 'Charge Master',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'manage-tp',
        component: ManageTestProfileComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Manage Test Profile',
          breadcrumb: 'Manage Test Profile',
          breadcrumb_caption: 'Manage Test Profile',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      }   
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestProfileConfigurationsRoutingModule { }