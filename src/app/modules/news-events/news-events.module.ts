// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsEventsComponent } from './components/news-events/news-events.component';
import { NewsEventsRoutingModule } from './news-events-routing.module';
import { AddupdateNewsEventsComponent } from './components/addupdate-news-events/addupdate-news-events.component'
import { SharedModule } from '../shared/shared.module';




@NgModule({
  declarations: [NewsEventsComponent, AddupdateNewsEventsComponent],
  imports: [
    CommonModule,
    SharedModule,
    NewsEventsRoutingModule
  ]
})
export class NewsEventsModule { }
