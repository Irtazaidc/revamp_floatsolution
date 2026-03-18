// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSvgDirective } from '../../../../shared/inline-svg/inline-svg.directive';
import { SearchOffcanvasComponent } from './offcanvas/search-offcanvas/search-offcanvas.component';
import { NotificationsOffcanvasComponent } from './offcanvas/notifications-offcanvas/notifications-offcanvas.component';
import { QuickActionsOffcanvasComponent } from './offcanvas/quick-actions-offcanvas/quick-actions-offcanvas.component';
import { CartOffcanvasComponent } from './offcanvas/cart-offcanvas/cart-offcanvas.component';
import { QuickPanelOffcanvasComponent } from './offcanvas/quick-panel-offcanvas/quick-panel-offcanvas.component';
import { UserOffcanvasComponent } from './offcanvas/user-offcanvas/user-offcanvas.component';
import { CoreModule } from '../../../core';
import { ScrollTopComponent } from './scroll-top/scroll-top.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartDropdownInnerComponent } from './dropdown-inner/cart-dropdown-inner/cart-dropdown-inner.component';
import { NotificationsDropdownInnerComponent } from './dropdown-inner/notifications-dropdown-inner/notifications-dropdown-inner.component';
import { QuickActionsDropdownInnerComponent } from './dropdown-inner/quick-actions-dropdown-inner/quick-actions-dropdown-inner.component';
import { SearchDropdownInnerComponent } from './dropdown-inner/search-dropdown-inner/search-dropdown-inner.component';
import { SearchResultComponent } from './dropdown-inner/search-dropdown-inner/search-result/search-result.component';
import { UserDropdownInnerComponent } from './dropdown-inner/user-dropdown-inner/user-dropdown-inner.component';

@NgModule({
  declarations: [
    SearchOffcanvasComponent,
    NotificationsOffcanvasComponent,
    QuickActionsOffcanvasComponent,
    CartOffcanvasComponent,
    QuickPanelOffcanvasComponent,
    UserOffcanvasComponent,
    ScrollTopComponent,
    ToolbarComponent,
    CartDropdownInnerComponent,
    NotificationsDropdownInnerComponent,
    QuickActionsDropdownInnerComponent,
    SearchDropdownInnerComponent,
    SearchResultComponent,
    UserDropdownInnerComponent,
  ],
  imports: [CommonModule, InlineSvgDirective, CoreModule, RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationPopoverModule,
  ],
  exports: [
    SearchOffcanvasComponent,
    NotificationsOffcanvasComponent,
    QuickActionsOffcanvasComponent,
    CartOffcanvasComponent,
    QuickPanelOffcanvasComponent,
    UserOffcanvasComponent,
    ToolbarComponent,
    ScrollTopComponent,
    CartDropdownInnerComponent,
    NotificationsDropdownInnerComponent,
    QuickActionsDropdownInnerComponent,
    SearchDropdownInnerComponent,
    SearchResultComponent,
    UserDropdownInnerComponent,
  ],
})
export class ExtrasModule { }
