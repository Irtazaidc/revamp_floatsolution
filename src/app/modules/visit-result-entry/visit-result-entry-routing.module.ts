// @ts-nocheck
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { VisitResultEntryComponent } from './components/visit-result-entry/visit-result-entry.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Visit Results Entry',
      breadcrumb: 'Visit Results Entry',
      breadcrumb_caption: 'Patient visit results entry',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'lab-res-entry',
        pathMatch: 'full'
      },
      {
        path: 'lab-res-entry',
        component: VisitResultEntryComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Results Entry',
          breadcrumb: 'Results Entry',
          breadcrumb_caption: 'Results Entry',
          icon: 'icofont-home bg-c-pink',
          status: false
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitResultEntryRoutingModule { }
