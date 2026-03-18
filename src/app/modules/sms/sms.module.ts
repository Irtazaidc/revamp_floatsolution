// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmsRoutingModule } from './sms-routing.module';
import { SendingSmsStatusComponent } from './components/sending-sms-status/sending-sms-status.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { EmailStatusComponent } from './components/email-status/email-status.component';
import { SendSmsComponent } from './components/send-sms/send-sms.component';
import { RmsModule } from '../rms/rms.module';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { SmsCancellationStatusComponent } from './components/sms-cancellation-status/sms-cancellation-status.component';

@NgModule({
  declarations: [SendingSmsStatusComponent, EmailStatusComponent, SendSmsComponent, SmsCancellationStatusComponent],
  imports: [
    CommonModule,
    SmsRoutingModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    MatDialogModule,
    FormsModule,
    RmsModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ]
})
export class SmsModule { }
