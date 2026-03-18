// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessRoutingModule } from './mess-routing.module';
import { ActivationReportComponent } from './activation-report/activation-report.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared/shared.module';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [ActivationReportComponent,],
  imports: [
    CommonModule,
    MessRoutingModule,
    SharedModule,
    NgbDatepickerModule
  ]
})
export class MessModule { }
