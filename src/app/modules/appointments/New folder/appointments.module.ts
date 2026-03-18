// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatAppointmentsComponent } from './components/pat-appointments/pat-appointments.component';
import { AppointmentsRoutingModule } from './appointments-routing.module';
import { CalendarModule } from 'angular-calendar';

@NgModule({
  declarations: [PatAppointmentsComponent],
  imports: [
    CommonModule, 
    CalendarModule,
    AppointmentsRoutingModule
  ]
})
export class AppointmentsModule { }
