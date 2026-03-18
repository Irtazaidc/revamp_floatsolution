// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsPromotionComponent } from './components/products-promotion/products-promotion.component';
import { MarketingRoutingModule } from './marketing-routing.module';
import { EditProductPromotionComponent } from './components/edit-product-promotion/edit-product-promotion.component';
import { PushNotificationsComponent } from './components/push-notifications/push-notifications.component';
import { SharedModule } from '../shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { TpConfigMrkComponent } from './components/tp-config-mrk/tp-config-mrk.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CampaignConfigurationComponent } from '../marketin/components/campaign-configuration/campaign-configuration.component';
import { AppUserCountReportComponent } from './components/app-user-count-report/app-user-count-report.component';


@NgModule({
  declarations: [ProductsPromotionComponent, EditProductPromotionComponent, PushNotificationsComponent, TpConfigMrkComponent,CampaignConfigurationComponent, AppUserCountReportComponent ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    SharedModule,
    MarketingRoutingModule,
    MatCheckboxModule
  ],
  exports: [ProductsPromotionComponent]
})
export class MarketingModule { }