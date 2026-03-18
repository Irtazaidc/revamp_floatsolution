// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { GeneralDocsComponent } from './components/general-docs/general-docs.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'g-docs'
      },
      {
        path: 'g-docs',
        component: GeneralDocsComponent,
        // canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralDocsRoutingModule { }