// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
type Color = any;
type Label = any;
@Component({
  standalone: false,

  selector: 'app-hc-admin-dashboard',
  templateUrl: './hc-admin-dashboard.component.html',
  styleUrls: ['./hc-admin-dashboard.component.scss']
})
export class HcAdminDashboardComponent implements OnInit {
  RequestCounts: any = [];
  loggedInUser: UserModel;
  TotalCOunts: any;
  hcCities: any;
  TotalCancelledRequests: any;
  TotalHCRequests: any;
  TotalInProgressRequests: any;
  TotalUnAssignedRequests: any;
  TotalCompletedRequests: any;
  constructor(private HCService: HcDashboardService,
    private auth: AuthService
  ) {

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getAdminDashboardcounts();
    setTimeout(() => {
      this.displaychart();
    }, 1000);
  }

  getAdminDashboardcounts() {
    const params = {
      "UserId": this.loggedInUser.userid
    }
    this.HCService.getHCAdminDashboardCounts(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp.StatusCode == 200 && resp.PayLoadDS) {
        this.TotalCOunts = resp.PayLoadDS.Table;
        if (this.TotalCOunts) {
          this.hcCities = this.TotalCOunts.map(item => item.HCCityName);
          this.TotalCancelledRequests = this.TotalCOunts.map(item => item.TotalCancelledRequests);
          this.TotalHCRequests = this.TotalCOunts.map(item => item.TotalHCRequests);
          this.TotalInProgressRequests = this.TotalCOunts.map(item => item.TotalInProgressRequests);
          this.TotalUnAssignedRequests = this.TotalCOunts.map(item => item.TotalUnAssignedRequests);
          this.TotalCompletedRequests = this.TotalCOunts.map(item => item.TotalCompletedRequests);
          console.log("Hc Cities", this.hcCities);
        } else {
          console.log('TotalCOunts is undefined');
        }
        console.log("total count", this.TotalCOunts);
        this.RequestCounts = resp.PayLoadDS.Table[0];
        console.log("🚀 getHCAdminDashboardCounts", this.RequestCounts);
      }
    }, (err) => { console.log(err) })
  }

  //Admin DashBoard Chart Start
  ChartData: ChartDataSets[];
  ChartLabels: Label[];
  ChartOptions = {};
  ChartColors: Color[] = [
    {
      borderColor: 'black',
      // backgroundColor: '#ffa800',

    },
  ];
  ChartLegend = true;
  ChartPlugins = [];
  ChartType = 'bar';

  displaychart() {
    this.ChartLabels = this.hcCities
    // console.log("🚀 ~ this.ChartLabels:", this.ChartLabels)
    this.ChartData = [
      {
        data: this.TotalCompletedRequests,
        label: 'Total Request',
        backgroundColor: this.TotalCompletedRequests.map(() => '#152ad6'),
      },
      {
        data: this.TotalUnAssignedRequests,
        label: 'Unassigned',
        backgroundColor: this.TotalUnAssignedRequests.map(() => '#ffa800'),
      },
      {
        data: this.TotalInProgressRequests,
        label: 'InProgress',
        backgroundColor: this.TotalInProgressRequests.map(() => '#1bc5bd'),
      },
      {
        data: this.TotalCompletedRequests,
        label: 'Completed',
        backgroundColor: this.TotalCompletedRequests.map(() => '#0c8a2e'),
      },
      {
        data: this.TotalCancelledRequests,
        label: 'Cancelled',
        backgroundColor: this.TotalCancelledRequests.map(() => '#d61528'),
      },
    ];

    this.ChartOptions = {
      responsive: true,
      scales: {
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Number of Requests",
            },
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Home Sampling Cities",
            },
          },
        ],
      },
    };
  }

}

