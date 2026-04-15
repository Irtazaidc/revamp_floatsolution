// @ts-nocheck
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { BlockedProcessComponent } from './components/blocked-process/blocked-process.component';
import { GeneratorLogsComponent } from './components/generator-logs/generator-logs.component';
import { GeneratorActivationLogsComponent } from './components/generator-activation-logs/generator-activation-logs.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Blocked Process',
      breadcrumb: 'Blocked Process of DB',
      breadcrumb_caption: 'Blocked Process of DB',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'blocked-process',
        pathMatch: 'full'
      },
      {
        path: 'blocked-process', 
        component: BlockedProcessComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Blocked Process', 
          breadcrumb: 'Blocked Process of DB',
          breadcrumb_caption: 'Blocked Process of DB',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'generator-logs', 
        component: GeneratorLogsComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Generator Logs', 
          breadcrumb: 'generator Logs',
          breadcrumb_caption: 'generator Logs',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'generator-activation-logs', 
        component: GeneratorActivationLogsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Generator Activation Logs', 
          breadcrumb: 'Generator Activation Logs',
          breadcrumb_caption: 'Generator Activation Logs',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlockingRoutingModule { }