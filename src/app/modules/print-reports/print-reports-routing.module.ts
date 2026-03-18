// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PrintFinalReportsComponent } from "./components/print-final-reports/print-final-reports.component";


const routes: Routes = [
  {
    path: '',
    // component: PatientRegistrationComponent,
    data: {
      title: 'Print Reports',
      breadcrumb: 'Print Reports',
      breadcrumb_caption: 'Print Reports',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'pat-rpts'
      },
     
      {
        path: 'pat-rpts',
        component: PrintFinalReportsComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Print Reports',
          breadcrumb: 'Print Reports',
          breadcrumb_caption: 'Print Reports',
          icon: 'icofont-home bg-c-green',
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
export class PrintReportsRoutingModule  { }
