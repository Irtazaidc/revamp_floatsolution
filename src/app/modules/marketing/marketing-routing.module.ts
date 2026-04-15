// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { ProductsPromotionComponent } from './components/products-promotion/products-promotion.component';
import { EditProductPromotionComponent } from './components/edit-product-promotion/edit-product-promotion.component';
import { PushNotificationsComponent } from './components/push-notifications/push-notifications.component';
import { AuthGuard } from '../auth/_services/auth.guard';
import { NewsEventsComponent } from '../news-events/components/news-events/news-events.component';
import { AddupdateNewsEventsComponent } from '../news-events/components/addupdate-news-events/addupdate-news-events.component';
import { TpConfigMrkComponent } from './components/tp-config-mrk/tp-config-mrk.component';
import { CampaignConfigurationComponent } from '../marketin/components/campaign-configuration/campaign-configuration.component';
import { AppUserCountReportComponent } from './components/app-user-count-report/app-user-count-report.component';

const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Products Promotion',
      breadcrumb: 'Products Promotion',
      breadcrumb_caption: 'Products Promotion',
      icon: 'icofont-chart-bar-graph bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'products-promotion',
        pathMatch: 'full'
      },
      {
        path: 'products-promotion',
        component: ProductsPromotionComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Products Promotion',
          breadcrumb: 'Products Promotion',
          breadcrumb_caption: 'Products Promotion',
          icon: 'ti-bar-chart-alt bg-c-blue',
          status: true
        }
      },
      {
        path: 'addupdate-product-promotion',
        component: EditProductPromotionComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Products Promotion',
          breadcrumb: 'Products Promotion',
          breadcrumb_caption: 'Products Promotion',
          icon: 'ti-bar-chart-alt bg-c-blue',
          status: true
        }
      },
      {
        path: 'addupdate-product-promotion/:id',
        component: EditProductPromotionComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Products Promotion',
          breadcrumb: 'Products Promotion',
          breadcrumb_caption: 'Products Promotion',
          icon: 'ti-bar-chart-alt bg-c-blue',
          status: true
        }
      },
      {
        path: 'push-notifications',
        component: PushNotificationsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Push Notifications',
          breadcrumb: 'Push Notifications',
          breadcrumb_caption: 'Push Notifications',
          icon: 'icofont-home bg-c-blue',
          status: false
        }
      },
      {
        path: 'tests-mrk-configuration',
        component: TpConfigMrkComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Tests Configuration',
          breadcrumb: 'Tests Configuration',
          breadcrumb_caption: 'Tests Configuration',
          icon: 'icofont-home bg-c-blue',
          status: true
        }
      },
      {
        path: 'campaign-configuration',
        component: CampaignConfigurationComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Campaign Configuration',
          breadcrumb: 'Campaign Configuration',
          breadcrumb_caption: 'Campaign Configuration',
          icon: 'icofont-home bg-c-blue',
          status: true
        }
      },
      {
        path: 'app-user-count-report',
        component: AppUserCountReportComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'MyIDC App User Count',
          breadcrumb: 'MyIDC App User Count',
          breadcrumb_caption: 'MyIDC App User Count',
          icon: 'icofont-home bg-c-blue',
          status: true
        }
      },

      /*
      {
        path: '',
        redirectTo: 'news-events-listing',
        pathMatch: 'full'
      },
      {
        path: 'news-events-listing',
        component: NewsEventsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'News & Events',
          breadcrumb: 'News & Events',
          breadcrumb_caption: 'News & Events',
          icon: 'ti-bar-chart-alt bg-c-blue',
          status: false
        }
      },
      {
        path: 'edit-news-events',
        component: AddupdateNewsEventsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Manage News & Events',
          breadcrumb: 'Manage News & Events',
          breadcrumb_caption: 'Manage News & Events',
          icon: 'ti-bar-chart-alt bg-c-blue',
          status: false
        }
      },
      {
        path: 'edit-news-events/:id',
        component: AddupdateNewsEventsComponent,
        // canActivate: [AuthGuard],
        data: {
          title: 'Manage News & Events',
          breadcrumb: 'Manage News & Events',
          breadcrumb_caption: 'Manage News & Events',
          icon: 'ti-bar-chart-alt bg-c-blue',
          status: false
        }
      }
      */
    
    ]
  }
];



@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketingRoutingModule { }
