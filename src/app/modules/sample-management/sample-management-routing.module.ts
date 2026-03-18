// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PhlebotoyComponent } from './components/phlebotoy/phlebotoy.component';
import { AuthGuard } from '../auth/_services/auth.guard';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Sample Management',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'phlebotomy'
      },
      {
        path: 'phlebotomy',
        component: PhlebotoyComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Phlebotomy',
          breadcrumb: 'Phlebotomy',
          breadcrumb_caption: 'Phlebotomy',
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
export class SampleManagementRoutingModule { }
