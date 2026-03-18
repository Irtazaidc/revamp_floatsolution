// @ts-nocheck
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { NewsEventsComponent } from './components/news-events/news-events.component';
import { AddupdateNewsEventsComponent } from '../news-events/components/addupdate-news-events/addupdate-news-events.component'
import { AuthGuard } from '../auth/_services/auth.guard';


const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'News & Events',
      breadcrumb: 'News & Events',
      breadcrumb_caption: 'News & Events',
      icon: 'icofont-chart-bar-graph bg-c-blue',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'news-events-listing'
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
    ]
  }
];

@NgModule({
  // declarations: [],
  // imports: [
  //   CommonModule
  // ]
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsEventsRoutingModule { }
