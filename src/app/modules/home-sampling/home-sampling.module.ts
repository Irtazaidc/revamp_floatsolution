// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { HCDashboardComponent } from './components/hcdashboard/hcdashboard.component';
import { HomeSamplingRoutingModule } from './home-sampling-routing.module';
import { SharedModule } from '../shared/shared.module';
import { HCRequestsComponent } from './components/hcrequests/hcrequests.component';
import { GMapsComponent } from './components/g-maps/g-maps.component';
import { RiderComponent } from './components/rider/rider.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { UpdateHcRequestComponent } from './components/update-hc-request/update-hc-request.component';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { HCCityAuthComponent } from './components/hccity-auth/hccity-auth.component';
import { HcConfigComponent } from './components/hc-config/hc-config.component';
import { ExpHcbookingRptComponent } from './components/hc-reports/exp-hcbooking-rpt/exp-hcbooking-rpt.component';
import { HcAdminDashboardComponent } from './components/hc-admin-dashboard/hc-admin-dashboard.component';
import { ScrollToBottomDirective } from './components/hcrequests/scroll-to-bottom.directive';
import { GenerateHcShareComponent } from './components/generate-hc-share/generate-hc-share.component';
import { ZoneConfigComponent } from './components/zone-config/zone-config.component';
import { HcShareDetailRptComponent } from './components/hc-reports/hc-share-detail-rpt/hc-share-detail-rpt.component';
import { HcBookingInquiryComponent } from './components/hc-reports/hc-booking-inquiry-rpt/hc-booking-inquiry.component';
import { HcStatusWiseRptComponent } from './components/hc-reports/hc-status-wise-rpt/hc-status-wise-rpt.component';
import { HcRiderDashboardComponent } from './components/hc-rider-dashboard/hc-rider-dashboard.component';
import { BaseChartDirective } from 'ng2-charts';

import { HcRegistrationDetailsComponent } from './components/hc-reports/hc-registration-details/hc-registration-details.component';
import { HcBookingCardComponent } from './components/shared/hc-booking-card/hc-booking-card.component';
import { HcRegCardComponent } from './components/shared/hc-reg-card/hc-reg-card.component'; import { HcRiderCardComponent } from './components/hc-reports/hc-rider-card/hc-rider-card.component';
import { CaterHcRequestComponent } from './components/hc-reports/cater-hc-request/cater-hc-request.component';
import { OnlineHcRequestsComponent } from './components/online-hc-requests/online-hc-requests.component';
import { CcrHcRequestComponent } from './components/ccr-hc-request/ccr-hc-request.component';
import { ComplaintsFeedbackModule } from '../complaints-feedback/complaints-feedback.module';
import { BookingComparisonComponent } from './components/hc-reports/hc-booking-comparison/booking-comparison/booking-comparison.component';
import { HcCollectionReportComponent } from './components/hc-collection-report/hc-collection-report.component';
import { HcRiderChecklistComponent } from './components/hc-reports/hc-rider-checklist/hc-rider-checklist.component';
import { RiderShareReportComponent } from './components/hc-reports/rider-share-report/rider-share-report.component';
import { HcWorklistComponent } from './components/hc-worklist/hc-worklist.component';
import { HcPortableServicesShareReportComponent } from './components/hc-reports/hc-portable-services-share-report/hc-portable-services-share-report.component';
import { HcBookingActivityComponent } from './components/hc-reports/hc-booking-activity/hc-booking-activity.component';
import { RiderMessageboxComponent } from './components/rider-messagebox/rider-messagebox.component';
import { ChatService } from './services/ChatService.service';
import { RiderDeviceInfoComponent } from './components/hc-reports/rider-device-info/rider-device-info.component';




// import * as MarkerClusterer from '@google/markerclusterer';



@NgModule({
  declarations: [HCDashboardComponent, HCRequestsComponent, GMapsComponent, RiderComponent, UpdateHcRequestComponent, HcBookingInquiryComponent, HCCityAuthComponent,
    HcConfigComponent, ExpHcbookingRptComponent, HcAdminDashboardComponent, ScrollToBottomDirective, GenerateHcShareComponent, ZoneConfigComponent, HcShareDetailRptComponent, HcStatusWiseRptComponent, HcRiderDashboardComponent, HcRegistrationDetailsComponent, HcBookingCardComponent, HcRegCardComponent,HcRiderCardComponent, CaterHcRequestComponent, OnlineHcRequestsComponent, CcrHcRequestComponent, BookingComparisonComponent, HcCollectionReportComponent, HcRiderChecklistComponent, RiderShareReportComponent, HcWorklistComponent, HcPortableServicesShareReportComponent, HcBookingActivityComponent, RiderMessageboxComponent, RiderDeviceInfoComponent ],

  imports: [
    CommonModule,
    GoogleMapsModule,
    // MarkerClusterer,
    HomeSamplingRoutingModule,
    SharedModule,
    MatTabsModule,
    MatCardModule,
    NgbTypeaheadModule,
    BaseChartDirective,
    ComplaintsFeedbackModule
  ],
  providers: [
    ChatService   
  ],
  exports: []
})
export class HomeSamplingModule { }
