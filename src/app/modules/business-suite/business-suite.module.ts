// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessSuiteRoutingModule } from './business-suite-routing.module';
import { SharedModule } from '../shared/shared.module';
import { RegistrationStatComponent } from './components/registration-stat/registration-stat.component';
import { BaseChartDirective } from 'ng2-charts';
import { RegSectionStatComponent } from './components/reg-section-stat/reg-section-stat.component';

@NgModule({
  declarations: [RegistrationStatComponent, RegSectionStatComponent],
  imports: [
    CommonModule,
    SharedModule,
    BaseChartDirective,
    BusinessSuiteRoutingModule
  ]
})
export class BusinessSuiteModule { }
