// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbAlert, NgbAlertModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccordionAnchorDirective, AccordionDirective, AccordionLinkDirective } from './accordion';
import { ToggleFullScreenDirective } from './fullscreen/toggle-fullscreen.directive';
import { CardRefreshDirective } from './card/card-refresh.directive';
import { CardToggleDirective } from './card/card-toggle.directive';
import { SpinnerComponent } from './spinner/spinner.component';
import { CardComponent } from './card/card.component';
import { ModalAnimationComponent } from './modal-animation/modal-animation.component';
import { ModalBasicComponent } from './modal-basic/modal-basic.component';
import { DataFilterPipe } from './element/data-filter.pipe';
import { MenuItems } from './menu-items/menu-items';
import { ParentRemoveDirective } from './element/parent-remove.directive';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import {ClickOutsideModule} from 'ng-click-outside';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule } from "ngx-spinner";
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
// import { MomentModule } from 'angular2-moment';
// import { FilterByKeyPipe } from '../pipes/filter-by-key.pipe';
// import { GetValueFromArrayPipe } from '../pipes/get-value-from-array.pipe';
// import { DateFormatPipe } from '../pipes/date-format.pipe';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgSelectModule } from '@ng-select/ng-select';
import { PatientBasicInfoComponent } from './components/patient/patient-basic-info/patient-basic-info.component';
import { FloatingMenuComponent } from './components/floating-menu/floating-menu.component';
import { VisitDocsComponent } from './components/visit-docs/components/visit-docs.component';
import { FilterByKeyPipe } from './pipes/filter-by-key.pipe';
import { GetValueFromArrayPipe } from './pipes/get-value-from-array.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { GoogleMapsComponent } from './components/maps/google-maps/google-maps.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipRemove, MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { PatientPortalUserCardComponent } from './components/patient-portal-user-card/patient-portal-user-card.component';
import { NoRecordFoundComponent } from './components/no-record-found/no-record-found.component';
import { FilterGroupsPipe } from './pipes/filter-groups.pipe';
import { SortByKeyPipe } from './pipes/sort-by-key.pipe';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    // ClickOutsideModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    ArchwizardModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }), // ToastrModule added
    NgxSpinnerModule,
    NgxMaskDirective,
    NgxMaskPipe,
    // MomentModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'success', // set defaults here
    }),
    NgSelectModule,
    MatTableModule,
    NgbAlertModule,
    MatFormFieldModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule, 
    MatToolbarModule, 
    BaseChartDirective,
    
  ],
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    ToggleFullScreenDirective,
    CardRefreshDirective,
    CardToggleDirective,
    SpinnerComponent,
    CardComponent,
    ModalAnimationComponent,
    ModalBasicComponent,
    DataFilterPipe,
    ParentRemoveDirective,
    // FilterByKeyPipe,
    // GetValueFromArrayPipe,
    // DateFormatPipe,
    PatientBasicInfoComponent,
    FloatingMenuComponent,
    VisitDocsComponent,
    FilterByKeyPipe,
    GetValueFromArrayPipe,
    DateFormatPipe,
    GoogleMapsComponent,
    PatientPortalUserCardComponent,
    NoRecordFoundComponent,
    FilterGroupsPipe,
    SortByKeyPipe

    // MatToolbarModule
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    ToggleFullScreenDirective,
    CardRefreshDirective,
    CardToggleDirective,
    SpinnerComponent,
    CardComponent,
    ModalAnimationComponent,
    ModalBasicComponent,
    DataFilterPipe,
    ParentRemoveDirective,
    NgbModule,
    PerfectScrollbarModule,
    NoRecordFoundComponent,
    // ClickOutsideModule,
    FormsModule,
    ReactiveFormsModule,
    ArchwizardModule,
    ToastrModule, // ToastrModule added
    NgxSpinnerModule,
    NgxMaskDirective,
    NgxMaskPipe,
    PatientPortalUserCardComponent,
    // MomentModule,
    // FilterByKeyPipe,
    // GetValueFromArrayPipe,
    ConfirmationPopoverModule,
    NgSelectModule,
    PatientBasicInfoComponent,
    FloatingMenuComponent,
    VisitDocsComponent,
    FilterByKeyPipe,
    GetValueFromArrayPipe,
    DateFormatPipe,
    GoogleMapsComponent,
    MatFormFieldModule,
    MatTableModule,
    NgbAlertModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule, 
    MatToolbarModule,    
    MatFormFieldModule,
    MatChipRemove,
    BaseChartDirective,
    FilterGroupsPipe,
    SortByKeyPipe
    // MatToolbarModule, 

  ],
  providers: [
    ToastrService,
    MenuItems,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
