// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module'
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';


import { FASRoutingModule } from './fas-routing.module';
import { TrialReportComponent } from './components/trial-report/trial-report.component';


@NgModule({
  declarations: [TrialReportComponent],
  imports: [
    CommonModule,
    FASRoutingModule,
    SharedModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatFormFieldModule,
    FormsModule
  ]
})
export class FASModule { }
