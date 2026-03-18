// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OladocRptComponent } from './components/oladoc-rpt/oladoc-rpt.component';
import { OutSourceIntegModule } from '../out-source-integ/out-source-integ.module';
import { OladocRegDataComponent } from '../out-source-integ/ola-doc/components/oladoc-reg-data/oladoc-reg-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestProfileRptComponent } from './components/test-profile-rpt/test-profile-rpt.component';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared/shared.module';
import { AnnualMedRptComponent } from './components/annual-med-rpt/annual-med-rpt.component';
import { DoctorPresConfigComponent } from './components/doctor-pres-config/doctor-pres-config.component';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  declarations: [OladocRptComponent, TestProfileRptComponent, AnnualMedRptComponent, DoctorPresConfigComponent],
  imports: [
    CommonModule,
    SharedModule,
    OutSourceIntegModule,
    MatTabsModule,
    MatCardModule,
    SharedModule,
    MatCheckboxModule
  ]
})
export class GenReportsModule { }
