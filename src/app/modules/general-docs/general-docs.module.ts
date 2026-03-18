// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralDocsRoutingModule } from './general-docs-routing.module';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../shared/shared.module';
import { GeneralDocsComponent } from './components/general-docs/general-docs.component';


@NgModule({
  declarations: [GeneralDocsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    SharedModule,
    GeneralDocsRoutingModule
  ]
})
export class GeneralDocsModule { }
