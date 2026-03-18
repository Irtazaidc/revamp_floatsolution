// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InlineSvgDirective } from '../../shared/inline-svg/inline-svg.directive';
import { WizardsComponent } from './wizards.component';

import { WizardsRoutingModule } from './wizards-routing.module';

@NgModule({
  declarations: [WizardsComponent],
  imports: [
    CommonModule,
    FormsModule,
    InlineSvgDirective,
    WizardsRoutingModule,
  ]
})
export class WizardsModule { }
