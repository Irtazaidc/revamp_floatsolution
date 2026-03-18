// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockingRoutingModule } from './blocking-routing.module';
import { BlockedProcessComponent } from './components/blocked-process/blocked-process.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { BaseChartDirective } from 'ng2-charts';
import { PatientBookingModule } from '../patient-booking/patient-booking.module';
import { RmsModule } from '../rms/rms.module';
import { SharedModule } from '../shared/shared.module';
import { GeneratorLogsComponent } from './components/generator-logs/generator-logs.component';
import { GeneratorActivationLogsComponent } from './components/generator-activation-logs/generator-activation-logs.component';


@NgModule({
  declarations: [BlockedProcessComponent, GeneratorLogsComponent, GeneratorActivationLogsComponent],
  imports: [
    CommonModule,
    BlockingRoutingModule,
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
    PatientBookingModule,
    RmsModule,
    BaseChartDirective,
  ]
})
export class BlockingModule { }
