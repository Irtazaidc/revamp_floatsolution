// @ts-nocheck
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { MachineMgtComponent } from './components/machine-mgt/machine-mgt.component';
import { RackMgtComponent } from './components/rack-mgt/rack-mgt.component';
import { TestMachinePriorityComponent } from './components/test-machine-priority/test-machine-priority.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Lab Configs',
      breadcrumb: 'Lab Configs',
      breadcrumb_caption: 'Lab Configs',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'machine-mgt',
        pathMatch: 'full'
      },
      {
        path: 'machine-mgt',
        component: MachineMgtComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Machine Mgt',
          breadcrumb: 'Machine Mgt',
          breadcrumb_caption: 'Machine Mgt',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'rack-mgt',
        component: RackMgtComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Rack Management',
          breadcrumb: 'Machine Mgt',
          breadcrumb_caption: 'Machine Mgt',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'test-machine-priority',
        component: TestMachinePriorityComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Test Machine Priority',
          breadcrumb: 'Test Machine Priority',
          breadcrumb_caption: 'Test Machine Priority',
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
export class LabConfigsRoutingModule { }
