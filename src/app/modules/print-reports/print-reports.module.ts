// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintFinalReportsComponent } from './components/print-final-reports/print-final-reports.component';
import { PrintReportsRoutingModule } from './print-reports-routing.module';
import { PatientSearchComponent } from '../patient-booking/components/patient-search/patient-search.component';
import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { RemarksModule } from '../remarks/remarks.module';
import { SharedModule } from '../shared/shared.module';
import { InformationDeskModule } from '../information-desk/information-desk.module';



@NgModule({
  declarations: [PrintFinalReportsComponent],
  imports: [
    CommonModule, 
    SharedModule,
    PrintReportsRoutingModule, 
    PatientBookingModule,
    InformationDeskModule,
    RemarksModule, 
    
  ]
})
export class PrintReportsModule { }
