import { Component, Directive, NgModule } from '@angular/core';

// Minimal Ivy-compatible stub for `ngx-perfect-scrollbar`.
// The real library is not compatible with Angular 21 in this repo.

@Directive({
  selector: '[perfectScrollbar]',
  standalone: false,
})
export class PerfectScrollbarDirective {}

@Component({
  selector: 'perfect-scrollbar',
  template: '<ng-content></ng-content>',
  standalone: false,
})
export class PerfectScrollbarComponent {}

export interface PerfectScrollbarConfigInterface {
  [key: string]: any;
}

export const PERFECT_SCROLLBAR_CONFIG = 'PERFECT_SCROLLBAR_CONFIG';

@NgModule({
  declarations: [PerfectScrollbarDirective, PerfectScrollbarComponent],
  exports: [PerfectScrollbarDirective, PerfectScrollbarComponent],
})
export class PerfectScrollbarModule {}

