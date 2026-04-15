// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SendingSmsStatusComponent } from './components/sending-sms-status/sending-sms-status.component';
import { EmailStatusComponent } from './components/email-status/email-status.component';
import { SendSmsComponent } from './components/send-sms/send-sms.component';
import { AuthGuard } from '../auth/_services/auth.guard';
import { SmsCancellationStatusComponent } from './components/sms-cancellation-status/sms-cancellation-status.component';

const routes: Routes = [
  {
    path: '',
    // component: PatientRegistrationComponent
    children: [
      {
        path: '',
        redirectTo: 'sending-sms-status',
        pathMatch: 'full'
      },
      {
        path: 'sending-sms-status',
        component: SendingSmsStatusComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'cancellation-sms-status',
        component: SmsCancellationStatusComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'email-report',
        component: EmailStatusComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'send-sms',
        component: SendSmsComponent,
        canActivate: [AuthGuard]
      },
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SmsRoutingModule { }
