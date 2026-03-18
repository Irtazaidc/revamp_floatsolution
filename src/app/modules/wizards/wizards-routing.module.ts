// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WizardsComponent } from './wizards.component';

const routes: Routes = [
  {
    path: '',
    component: WizardsComponent,
    children: [
    
      { path: '', redirectTo: 'wizard-1', pathMatch: 'full' },
      { path: '**', redirectTo: 'wizard-1', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WizardsRoutingModule { }
