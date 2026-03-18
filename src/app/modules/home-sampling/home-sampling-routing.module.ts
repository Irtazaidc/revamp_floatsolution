// @ts-nocheck
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HcPrivacyPolicyComponent } from "../auth/hc-privacy-policy/hc-privacy-policy.component";
import { AuthGuard } from "../auth/_services/auth.guard";
import { PatientRegistrationComponent } from "../patient-booking/components/patient-registration/patient-registration.component";
import { GenerateHcShareComponent } from "./components/generate-hc-share/generate-hc-share.component";
import { HcAdminDashboardComponent } from "./components/hc-admin-dashboard/hc-admin-dashboard.component";
import { HcConfigComponent } from "./components/hc-config/hc-config.component";
import { ExpHcbookingRptComponent } from "./components/hc-reports/exp-hcbooking-rpt/exp-hcbooking-rpt.component";
import { HcBookingInquiryComponent } from "./components/hc-reports/hc-booking-inquiry-rpt/hc-booking-inquiry.component";
import { HcShareDetailRptComponent } from "./components/hc-reports/hc-share-detail-rpt/hc-share-detail-rpt.component";
import { HcStatusWiseRptComponent } from "./components/hc-reports/hc-status-wise-rpt/hc-status-wise-rpt.component";
import { HcRiderDashboardComponent } from "./components/hc-rider-dashboard/hc-rider-dashboard.component";
import { HCCityAuthComponent } from "./components/hccity-auth/hccity-auth.component";
import { HCDashboardComponent } from "./components/hcdashboard/hcdashboard.component";
import { HCRequestsComponent } from "./components/hcrequests/hcrequests.component";
import { RiderComponent } from "./components/rider/rider.component";
import { UpdateHcRequestComponent } from "./components/update-hc-request/update-hc-request.component";
import { ZoneConfigComponent } from "./components/zone-config/zone-config.component";
import { CaterHcRequestComponent } from "./components/hc-reports/cater-hc-request/cater-hc-request.component";
import { BookingComparisonComponent } from "./components/hc-reports/hc-booking-comparison/booking-comparison/booking-comparison.component";
import { HcCollectionReportComponent } from "./components/hc-collection-report/hc-collection-report.component";
import { HcRiderChecklistComponent } from "./components/hc-reports/hc-rider-checklist/hc-rider-checklist.component";
import { RiderShareReportComponent } from "./components/hc-reports/rider-share-report/rider-share-report.component";
import { HcWorklistComponent } from "./components/hc-worklist/hc-worklist.component";
import { HcPortableServicesShareReportComponent } from "./components/hc-reports/hc-portable-services-share-report/hc-portable-services-share-report.component";
import { RiderMessageboxComponent } from "./components/rider-messagebox/rider-messagebox.component";
import { RiderDeviceInfoComponent } from "./components/hc-reports/rider-device-info/rider-device-info.component";

const routes: Routes = [
    {
        path: '',
        // component: PatientRegistrationComponent,
        data: {
            title: 'Home Collection',
            breadcrumb: 'Booking',
            breadcrumb_caption: 'Register Patient and book Vaccination',
            icon: 'icofont-home bg-c-blue',
            status: false
        },
        children: [
            {
                path: '',
                redirectTo: 'hc-requests'
            },
            {
                path: 'hc-requests',
                component: HCRequestsComponent,
                data: {
                    title: 'HC Request(s)',
                    breadcrumb: 'hc-requests',
                    breadcrumb_caption: 'hc-requests',
                    status: false
                }
            },
            {
                path: 'hc-dashboard',
                component: HCDashboardComponent,
                data: {
                    title: 'Dashboard',
                    breadcrumb: 'Dashboard',
                    breadcrumb_caption: 'Dashboard',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            },
            {
                path: 'cater-hc-request',
                component: CaterHcRequestComponent,
                data: {
                    title: 'Cater HC Request ',
                    breadcrumb: 'Cater HC Request via CC',
                    breadcrumb_caption: 'Cater HC Request via CC',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hc-admin-dashboard',
                component: HcAdminDashboardComponent,
                data: {
                    title: 'Admin Dashboard',
                    breadcrumb: 'Dashboard',
                    breadcrumb_caption: 'Dashboard',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            },
            {
                path: 'rider',
                component: RiderComponent,
                data: {
                    title: 'Riders',
                    breadcrumb: 'Riders',
                    breadcrumb_caption: 'Riders',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            },
            {
                path: 'update-hcbooking',
                component: UpdateHcRequestComponent,
                data: {
                    title: 'Update HC Booking',
                    breadcrumb: 'Riders',
                    breadcrumb_caption: 'Riders',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            },
            {
                path: 'hc-worklist',
                component: HcWorklistComponent,
                data: {
                    title: 'HC Worklist',
                    breadcrumb: 'Home Sample',
                    breadcrumb_caption: 'Home Sample',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            }
            ,
            {
                path: 'booking-inquiry',
                component: HcBookingInquiryComponent,
                data: {
                    title: 'HC Booking Inquiry',
                    breadcrumb: 'Riders',
                    breadcrumb_caption: 'Riders',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            }
            ,
            {
                path: 'hc-city-auth',
                component: HCCityAuthComponent,
                data: {
                    title: 'HC City Authorization',
                    breadcrumb: 'Riders',
                    breadcrumb_caption: 'Riders',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            },
            {
                path: 'hccity-config',
                component: HcConfigComponent,
                data: {
                    title: 'HC City Configs',
                    breadcrumb: 'Riders',
                    breadcrumb_caption: 'HC Configs',
                    icon: 'icofont-home bg-c-pink',
                    status: false
                },
            },
            {
                path: 'regForHS',
                component: PatientRegistrationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'hc-booking',
                component: PatientRegistrationComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Booking For Home Collection',
                    breadcrumb: 'Booking For Home Collection',
                    breadcrumb_caption: 'Booking For Home Collection',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'exp-hcbooking-rpt',
                component: ExpHcbookingRptComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'HC Booking Report',
                    breadcrumb: 'Booking For Home Collection',
                    breadcrumb_caption: 'Booking For Home Collection',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hc-status-rpt',
                component: HcStatusWiseRptComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'HC Status Wise Report',
                    breadcrumb: 'HC Status Wise Report',
                    breadcrumb_caption: 'HC Status Wise Report',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'gen-hc-share',
                component: GenerateHcShareComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Generate Hc Share',
                    breadcrumb: 'Booking For Home Collection',
                    breadcrumb_caption: 'Booking For Home Collection',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hc-booking-comparison',
                component: BookingComparisonComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'HC Booking Comparison',
                    breadcrumb: 'Comparison For HC Booking',
                    breadcrumb_caption: 'Comparison For HC Booking',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hc-collection-report',
                component: HcCollectionReportComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Sample Collection Report',
                    breadcrumb: 'Sample Collection Report',
                    breadcrumb_caption: 'Sample Collection Report',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'rider-share-report',
                component: RiderShareReportComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Rider Share Report',
                    breadcrumb: 'Rider Share Report',
                    breadcrumb_caption: 'Rider Share Report',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hc-portable-services-share-report',
                component: HcPortableServicesShareReportComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Portable Services Share Report',
                    breadcrumb: 'Portable Services Share Report',
                    breadcrumb_caption: 'Portable Services Share Report',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hcshare-det-rpt',
                component: HcShareDetailRptComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'HC Share Reports',
                    breadcrumb: 'HC Share Reports',
                    breadcrumb_caption: 'HC Share Reports',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'zone-config',
                component: ZoneConfigComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Zone Configuration',
                    breadcrumb: 'Booking For Home Collection',
                    breadcrumb_caption: 'Booking For Home Collection',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'rider-dashboard',
                component: HcRiderDashboardComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'HC Staff Dashboard',
                    breadcrumb: 'HC Staff Dashboard',
                    breadcrumb_caption: 'HC Staff Dashboard',
                    icon: 'icofont-home bg-c-blue',
                    status: false,
                },
            },
            {
                path: 'hc-rider-checklist',
                component: HcRiderChecklistComponent,
                canActivate: [AuthGuard],
            },
            {
                path: 'rider-messagebox',
                component: RiderMessageboxComponent,
                canActivate: [AuthGuard],
            },
            {
                path: 'rider-device-info',
                component: RiderDeviceInfoComponent,
                canActivate: [AuthGuard],
            },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class HomeSamplingRoutingModule { }
