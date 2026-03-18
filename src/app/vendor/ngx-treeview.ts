// @ts-nocheck
import { NgModule } from '@angular/core';

// Minimal stub for legacy `ngx-treeview` (older Angular peer deps).
@NgModule({})
export class TreeviewModule {}

// Some files import these as runtime values (non-type-only imports).
export class TreeviewConfig {}
export class TreeviewItem {
  constructor(public value?: any) {}
}

