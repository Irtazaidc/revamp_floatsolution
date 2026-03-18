// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ComingSoonComponent } from "./components/coming-soon/coming-soon.component";
import { EncDcrptStringComponent } from "./components/enc-dcrpt-string/enc-dcrpt-string.component";
import { TelephoneExtensionComponent } from "./components/telephone-extension/telephone-extension.component";
import { AuthGuard } from '../auth/_services/auth.guard';


const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Miscellaneous',
      breadcrumb: '',
      breadcrumb_caption: '',
      icon: 'icofont-home bg-c-pink',
      status: false
    },
    children: [
      {
        path: 'enc-decrypt',
        component: EncDcrptStringComponent,
        //canActivate: [AuthGuard],
        data: {
          title: 'Encrypt Decrypt',
          breadcrumb: 'Configurations',
          breadcrumb_caption: 'Encrypt Decrypt',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'coming-soon',
        component: ComingSoonComponent,
        //canActivate: [AuthGuard],
        data: {
          title: 'Coming Soon',
          breadcrumb: 'Configurations',
          breadcrumb_caption: 'Comming Soon',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'telephone-extensions',
        component: TelephoneExtensionComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Telephone Extensions',
          breadcrumb: 'Telephone Extensions',
          breadcrumb_caption: 'Telephone Extensions',
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
export class MiscRoutingModule { }