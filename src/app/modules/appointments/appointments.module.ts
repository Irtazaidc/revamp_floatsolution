// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatAppointmentsComponent } from './components/pat-appointments/pat-appointments.component';
import { AppointmentsRoutingModule } from './appointments-routing.module';

import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [PatAppointmentsComponent],
  imports: [
    CommonModule,
    SharedModule, 
    PatientBookingModule,
    AppointmentsRoutingModule,
   
  ]
})
export class AppointmentsModule { }
