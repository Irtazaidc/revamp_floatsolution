// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BranchConfigComponent } from "./components/branch-config/branch-config.component";

const routes: Routes = [
    {
        path: '',
        // component: ,
        data: {
            title: 'Branch Management',
            breadcrumb: 'Branch Management',
            breadcrumb_caption: 'Branch Management',
            icon: 'icofont-home bg-c-pink',
            status: false
        },
        children: [
            {
                path: '',
                redirectTo: 'branch-config'
            },
            {
                path: 'branch-config',
                component: BranchConfigComponent,
                //canActivate: [AuthGuard],
                data: {
                    title: 'Branch Management',
                    breadcrumb: 'Branch Management',
                    breadcrumb_caption: 'Branch Management',
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
export class BranchManagementRoutingModule { }