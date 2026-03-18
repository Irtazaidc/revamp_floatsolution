// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorsRoutingModule } from './doctors-routing.module';
import { B2bDoctorsComponent } from './components/b2b-doctors/b2b-doctors.component';
import { RefByDoctorsComponent } from './components/ref-by-doctors/ref-by-doctors.component';
import { SharedModule } from '../shared/shared.module';
import { RefByB2bDoctorsMappingComponent } from './components/ref-by-b2b-doctors-mapping/ref-by-b2b-doctors-mapping.component';
import { DoctorsAndMappingsComponent } from './components/doctors-and-mappings/doctors-and-mappings.component';
import { MatTabsModule } from '@angular/material/tabs';
import { B2bPanelMappingComponent } from './components/b2b-panel-mapping/b2b-panel-mapping.component';
import { B2bShareReportComponent } from './components/b2b-share-report/b2b-share-report.component';
import { RefbyShiftComponent } from './components/refby-shift/refby-shift.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QRCodeComponent } from 'angularx-qrcode';

@NgModule({
  declarations: [
    B2bDoctorsComponent, RefByDoctorsComponent, RefByB2bDoctorsMappingComponent, 
    DoctorsAndMappingsComponent, B2bPanelMappingComponent, B2bShareReportComponent, RefbyShiftComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DoctorsRoutingModule,
    MatTabsModule,
    MatCheckboxModule,
    QRCodeComponent
    //,
    // NgxQRCodeModule
  ],
  exports: [
    // B2bDoctorsComponent, RefByDoctorsComponent, RefByB2bDoctorsMappingComponent, 
    // DoctorsAndMappingsComponent
  ]
})
export class DoctorsModule { }
