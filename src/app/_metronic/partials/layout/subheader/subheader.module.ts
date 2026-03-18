// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSvgDirective } from '../../../../shared/inline-svg/inline-svg.directive';
import { Subheader1Component } from './subheader1/subheader1.component';
import { Subheader2Component } from './subheader2/subheader2.component';
import { Subheader3Component } from './subheader3/subheader3.component';
import { Subheader4Component } from './subheader4/subheader4.component';
import { Subheader5Component } from './subheader5/subheader5.component';
import { Subheader6Component } from './subheader6/subheader6.component';
import { Subheader7Component } from './subheader7/subheader7.component';
import { SubheaderWrapperComponent } from './subheader-wrapper/subheader-wrapper.component';
import { NgbDropdownModule, NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownMenusModule } from '../../content/dropdown-menus/dropdown-menus.module';
import { ExtrasModule } from '../extras/extras.module';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    Subheader1Component,
    Subheader2Component,
    Subheader3Component,
    Subheader4Component,
    Subheader5Component,
    Subheader6Component,
    Subheader7Component,
    SubheaderWrapperComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    InlineSvgDirective,
    NgbDropdownModule,
    DropdownMenusModule,
    ExtrasModule,
    FormsModule,
    MatCheckboxModule,
    NgbModule
  ],
  exports: [SubheaderWrapperComponent],
})
export class SubheaderModule { }
