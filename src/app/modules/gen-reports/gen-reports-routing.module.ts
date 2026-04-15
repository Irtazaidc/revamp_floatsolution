// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/_services/auth.guard";
import { TestProfileRptComponent } from "./components/test-profile-rpt/test-profile-rpt.component";
import { OladocRptComponent } from "./components/oladoc-rpt/oladoc-rpt.component";
import { AnnualMedRptComponent } from "./components/annual-med-rpt/annual-med-rpt.component";
import { DoctorPresConfigComponent } from "./components/doctor-pres-config/doctor-pres-config.component";
const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Test Profile Data',
            breadcrumb: 'Test Profile Data',
            breadcrumb_caption: 'Test Profile Data',
            icon: 'icofont-home bg-c-pink',
            status: false
        },
        children: [
            {
                path: '',
                redirectTo: 'oladoc-rpt',
                pathMatch: 'full',
              },
                {
                path: 'oladoc-rpt',
                component: OladocRptComponent,
                canActivate: [AuthGuard],
                data: {
                  title: 'Oladoc Report',
                  breadcrumb: 'Oladoc Report',
                  breadcrumb_caption: 'Oladoc Report',
                  icon: 'icofont-home bg-c-pink',
                  status: false
                }
              },
              {
                path: 'tpdata-reports',
                component: TestProfileRptComponent,
                canActivate: [AuthGuard],
                data: {
                  title: 'Test Profile Data',
                  breadcrumb: 'Test Profile Data',
                  breadcrumb_caption: 'Test Profile Data',
                  icon: 'icofont-home bg-c-pink',
                  status: false
                }
              },
              {
                path: 'annualmed-reports',
                component: AnnualMedRptComponent,
                canActivate: [AuthGuard],
                data: {
                  title: 'Annual Medicals',
                  breadcrumb: 'Annual Medicals',
                  breadcrumb_caption: 'Annual Medicals',
                  icon: 'icofont-home bg-c-pink',
                  status: false
                }
              },
              {
                path: 'dr-prescription-config',
                component: DoctorPresConfigComponent,
                // canActivate: [AuthGuard],
                data: {
                  title: 'Doctor Prescription Configuration',
                  breadcrumb: 'Doctor Prescription Configuration',
                  breadcrumb_caption: 'Doctor Prescription Configuration',
                  icon: 'icofont-home bg-c-pink',
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
export class GenReportsRoutingModule { }