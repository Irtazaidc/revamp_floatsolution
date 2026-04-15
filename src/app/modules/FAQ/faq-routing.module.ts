// @ts-nocheck
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FAQListComponent } from './components/faq-list/faq-list.component';
import { AuthGuard } from '../auth/_services/auth.guard';

const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'FAQs',
      breadcrumb: 'FAQs',
      breadcrumb_caption: 'FAQs',
      icon: 'icofont-home bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'faqs-list',
        pathMatch: 'full'
      },
      {
        path: 'faqs-list',
        component: FAQListComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'FAQs Management',
          breadcrumb: 'FAQs Management',
          breadcrumb_caption: 'FAQs Management',
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
export class FAQRoutingModule { }
