// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncDcrptStringComponent } from './components/enc-dcrpt-string/enc-dcrpt-string.component';
import { MiscRoutingModule } from './miscRoutingModule';
import { SharedModule } from '../shared/shared.module';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { TelephoneExtensionComponent } from './components/telephone-extension/telephone-extension.component';



@NgModule({
  declarations: [EncDcrptStringComponent, ComingSoonComponent, TelephoneExtensionComponent],
  imports: [
    CommonModule,
    MiscRoutingModule, 
    SharedModule
  ]
})
export class MiscModule { }
