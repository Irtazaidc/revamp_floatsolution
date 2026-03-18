// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { AddUpdateNotificationComponent} from './components/add-update-notification/add-update-notification.component';
const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Notifications',
      breadcrumb: 'Notifications',
      breadcrumb_caption: 'Notifications',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: 'notice-board',
        redirectTo: 'nb-config'
      },
      {
        path: 'nb-config',
        component: AddUpdateNotificationComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Configure Notification',
          breadcrumb: 'Configure Notification',
          breadcrumb_caption: 'Configure Notification',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      }
    ]
  }
];


@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoticeBoardRoutingModule { }


