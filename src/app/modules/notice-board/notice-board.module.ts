// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUpdateNotificationComponent } from '../notice-board/components/add-update-notification/add-update-notification.component';
import { NoticeBoardRoutingModule } from '../notice-board/notice-board-routing.module'
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [AddUpdateNotificationComponent],
  imports: [
    CommonModule,
    SharedModule,
    NoticeBoardRoutingModule
  ]
})
export class NoticeBoardModule { }
