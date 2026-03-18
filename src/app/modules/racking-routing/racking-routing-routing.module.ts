// @ts-nocheck
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { RackingRoutingParentComponent } from './components/racking-routing-parent/racking-routing-parent.component';
import { AccessioningParentComponent } from './components/accessioning-parent/accessioning-parent.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Racking & Routing',
      breadcrumb: 'Racking & Routing',
      breadcrumb_caption: 'Racking & Routing',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'racking-routing'
      },
      {
        path: 'racking-routing',
        component: RackingRoutingParentComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Racking & Routing',
          breadcrumb: 'Racking & Routing',
          breadcrumb_caption: 'Racking & Routing',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'lab-accession',
        component: AccessioningParentComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Accessioning',
          breadcrumb: 'Racking & Routing',
          breadcrumb_caption: 'Racking & Routing',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RackingRoutingRoutingModule { }
