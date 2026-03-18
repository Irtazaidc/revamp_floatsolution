// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { OutSourceIntegModule } from './out-source-integ.module';
import { OladocRegDataComponent } from './ola-doc/components/oladoc-reg-data/oladoc-reg-data.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: ''
      },
      {
        // path: 'oladoc-rpt',
        component: OladocRegDataComponent,
        // canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule ]
})
export class OutSourceIntegRoutingModule { }