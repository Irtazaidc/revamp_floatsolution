// @ts-nocheck
import { EmpEduInfoComponent } from './component/emp-edu-info/emp-edu-info.component';
import { PersonalInformationComponent } from './../user-profile/personal-information/personal-information.component';
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EmpPersonalInfoComponent } from './component/emp-personal-info/emp-personal-info.component';
import { EmpProfileComponent } from './component/emp-profile/emp-profile.component';
import { EmpDependentInfoComponent } from './component/emp-dependent-info/emp-dependent-info.component';
import { ChangeUserPasswordComponent } from './component/change-user-password/change-user-password.component';
import { AuthGuard } from '../auth/_services/auth.guard';
import { SecurityKeyGeneratorComponent } from './component/security-key-generator/security-key-generator.component';


const routes: Routes = [
  {
    path: '',
    component: EmpProfileComponent ,
    data: {
      title: 'Employee Profile',
      breadcrumb: 'Employee Profile',
      breadcrumb_caption: 'Employee Profile',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
     
      {
        path: 'personal-info',
        component:EmpPersonalInfoComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Employee Personal Information',
          breadcrumb: 'Employee  Personal Information',
          breadcrumb_caption: 'Employee  Personal Information',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'emp-edu-info',
        component:EmpEduInfoComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Employee Educational Information',
          breadcrumb: 'Employee  Educational Information',
          breadcrumb_caption: 'Employee  Educational Information',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'emp-dependent-info',
        component:EmpDependentInfoComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Employee Dependent Information',
          breadcrumb: 'Employee  Dependent Information',
          breadcrumb_caption: 'Employee  Dependent Information',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'emp-change-password',
        component:ChangeUserPasswordComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Change Password',
          breadcrumb: 'Employee Change Password',
          breadcrumb_caption: 'Employee Change Password',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'security-key-generator',
        component:SecurityKeyGeneratorComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Security Key Generator',
          breadcrumb: 'Security Key Generator',
          breadcrumb_caption: 'Security Key Generator',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpProfilleRoutingModule { }
