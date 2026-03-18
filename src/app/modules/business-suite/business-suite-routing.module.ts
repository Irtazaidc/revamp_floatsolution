// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationStatComponent } from './components/registration-stat/registration-stat.component';
import { AuthGuard } from '../auth/_services/auth.guard';
import { RegSectionStatComponent } from './components/reg-section-stat/reg-section-stat.component';

const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Business Suite',
      breadcrumb: 'Business Suite',
      breadcrumb_caption: 'Business Suite',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        // redirectTo: 'registration-stat'
      },
      {
        path: 'registration-stat',
        component: RegistrationStatComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Registration Statistics',
          breadcrumb: 'Registration Statistics',
          breadcrumb_caption: 'Registration Statistics',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'reg-section-stat',
        component: RegSectionStatComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Reg Section Statistics',
          breadcrumb: 'Reg Section Statistics',
          breadcrumb_caption: 'Reg Section Statistics',
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
export class BusinessSuiteRoutingModule { }
