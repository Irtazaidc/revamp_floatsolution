// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PatAppointmentsComponent } from "./components/pat-appointments/pat-appointments.component";


const routes: Routes = [
    {
        path: '',
        // component: ,
        data: {
            title: 'Patient Appointments',
            breadcrumb: 'Patient Appointments',
            breadcrumb_caption: 'Patient Appointments',
            icon: 'icofont-home bg-c-pink',
            status: false
        },
        children: [
            {
                path: '',
                redirectTo: 'Patient Appointments',
                pathMatch: 'full'
            },
            {
                path: 'pat-appointments',
                component: PatAppointmentsComponent,
                //canActivate: [AuthGuard],
                data: {
                    title: 'Patient Appointments',
                    breadcrumb: 'Patient Appointments',
                    breadcrumb_caption: 'Patient Appointments',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppointmentsRoutingModule { }