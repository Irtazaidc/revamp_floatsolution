// @ts-nocheck
import { Directive, HostListener } from '@angular/core';

import * as screenfull from 'screenfull';

@Directive({
  standalone: false,

  selector: '[appToggleFullScreen]'
})
export class ToggleFullScreenDirective {

  @HostListener('click') onClick() {
    if (screenfull.enabled) {
      screenfull.toggle();
    }
  }
}
