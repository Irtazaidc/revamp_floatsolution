// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SalesComponent } from "./components/sales/sales.component";
import { AuthGuard } from "../auth/_services/auth.guard";
const routes: Routes = [
    {
        path: '',
        // component: ,
        data: {
            title: 'Analytics',
            breadcrumb: 'Analytics',
            breadcrumb_caption: 'Analytics',
            icon: 'icofont-home bg-c-pink',
            status: false
        },
        children: [
            {
                path: '',
                redirectTo: 'sales'
            },
            {
                path: 'sales',
                component: SalesComponent,
                // canActivate: [AuthGuard],
                data: {
                    title: 'Sales Analtics',
                    breadcrumb: 'Sales Analtics',
                    breadcrumb_caption: 'Sales Analtics',
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
export class AnalyticsRoutingModule { }