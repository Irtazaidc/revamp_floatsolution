// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { HcDashboardService } from 'src/app/modules/home-sampling/services/hc-dashboard.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { FeedbackService } from '../../service/feedback.service';
import { ComplaintDashboardService } from 'src/app/modules/complaints-feedback/services/complaint-dashboard.service';

type Color = any;
type Label = any;

@Component({
  standalone: false,

  selector: 'app-cms-admin-dashboard',
  templateUrl: './cms-admin-dashboard.component.html',
  styleUrls: ['./cms-admin-dashboard.component.scss']
})
export class CmsAdminDashboardComponent implements OnInit {

  loggedInUser: UserModel;

  TotalCOunts: any;
  CMSCategory: any;

  CategoryCounts: any;
  ChartDate='';
  dateFrom:any;
  dateTo:any;
  StatsDate='';

    //Admin DashBoard Chart Start
    ChartData: ChartDataSets[];
    ChartLabels: Label[];
    ChartOptions = {};
    ChartColors: Color[] = [
      {
        borderColor: 'black',
  
      },
    ];
    ChartLegend = true;
    ChartPlugins = [];
    ChartType = 'bar';

  // filterForm = this.formBuilder.group({
  //   dateFrom: [''],
  //   dateTo: [''],
  // });

  spinnerRefs = {
    TotalRequestCount: 'TotalRequestCount',
    chartGraphStats: 'chartGraphStats',
  };

  constructor(
    private HCService: HcDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private getfeedback: FeedbackService,
    private sharedService: SharedService,
    private complaintDashboardService: ComplaintDashboardService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    
    this.dateFrom = Conversions.getPreviousDateObject();
    this.dateTo= Conversions.getCurrentDateObject();

    this.getAdminDashboardcounts();
    this.getCMSrequestCountStats();
    // setTimeout(() => {
    //   this.filterForm.patchValue({
    //     dateFrom: Conversions.getPreviousDateObject(),
    //     dateTo: Conversions.getCurrentDateObject()
    //   });
    // }, 600);
   
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getAdminDashboardcounts(): void {
    const params = {
      DateFrom: Conversions.formatDateObject(this.dateFrom) || null,
      DateTo: Conversions.formatDateObject(this.dateTo) || null,
    };
    this.spinner.show(this.spinnerRefs.chartGraphStats)
    this.getfeedback.getCMScategoryCounts(params).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.TotalCOunts = resp.PayLoad;
        this.CMSCategory = this.TotalCOunts.map(item => item.CMSCategory);
        console.log(" this.CMSCategory:", this.CMSCategory)
        this.CategoryCounts = this.TotalCOunts.map(item => item.Column1);
        console.log("🚀 this.CategoryCounts:", this.CategoryCounts)
        setTimeout(() => {
          this.displaychart();
          this.spinner.hide(this.spinnerRefs.chartGraphStats) 
        }, 500);
      }
    }, (err) => { 
     this.spinner.hide(this.spinnerRefs.chartGraphStats) 
      console.log(err) });
  }
  
  generateRandomColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Generate a random hex color
      colors.push(color);
    }
    return colors;
  }

  displaychart() {
    const counts = this.TotalCOunts.map(item => item.Column1);
    const categories = this.TotalCOunts.map(item => item.CMSCategory);
    const backgroundColors = this.generateRandomColors(categories.length); // Generate an array of random colors
    
    this.ChartLabels = categories;
    this.ChartData = [
      {
        data: counts,
        label: '', // Leave the label empty for now
        backgroundColor: backgroundColors
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
              labelString: 'CMS Counts',
            },
            ticks: {
              beginAtZero: true,
              stepSize: 1, 
              callback: function (value) {
                if (value % 1 === 0) {
                  return value;
                }
                return ''; 
              }
            }
          },
        ],
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "CMS Categories",
            },
          },
        ],
      },
    };
  }

  countList:any={};

  getCMSrequestCountStats() {
   this.countList=[];
   const objParm = {
    DateFrom: Conversions.formatDateObject(this.dateFrom) || null,
    DateTo: Conversions.formatDateObject(this.dateTo) || null,
   };
   this.spinner.show(this.spinnerRefs.TotalRequestCount);
   this.complaintDashboardService.getCMSrequestStats(objParm).subscribe((resp: any) => {
     if (resp.StatusCode == 200 && resp.PayLoad) {
      this.spinner.hide(this.spinnerRefs.TotalRequestCount);
       this.countList = resp.PayLoad[0];
     } else {
       this.toastr.warning(resp.Message);
      this.spinner.hide(this.spinnerRefs.TotalRequestCount);
       return;
     }
   }, (err) => {
     console.log(err);
     this.spinner.hide(this.spinnerRefs.TotalRequestCount);
   });
 }



 onDateChangeofChart(event){

  if(event === '1'){  //Today
    this.dateFrom=Conversions.getCurrentDateObject();
    this.dateTo=Conversions.getCurrentDateObject();
    this.getAdminDashboardcounts();
    return;
  }
  if(event === '2'){ //WEEK
    this.dateFrom=Conversions.getPreviousWeekDateObject();
    this.dateTo=Conversions.getCurrentDateObject();
    this.getAdminDashboardcounts();
    return;
  }
  if(event === '3'){ //Month
    this.dateFrom=Conversions.getPreviousMonthDateObject();
    this.dateTo=Conversions.getCurrentDateObject();
    this.getAdminDashboardcounts();
    return;
  }
  if(event === '4'){ //Year
    this.dateFrom=Conversions.getPreviousYearDateObject();
    this.dateTo=Conversions.getCurrentDateObject();
    this.getAdminDashboardcounts();
    return;
  }

 }
 
 onDateChangeofStats(event){
 if(event === '1'){  //Today
  this.dateFrom=Conversions.getCurrentDateObject();
  this.dateTo=Conversions.getCurrentDateObject();
  this.getCMSrequestCountStats();
  return;
}
if(event === '2'){ //WEEK
  this.dateFrom=Conversions.getPreviousWeekDateObject();
  this.dateTo=Conversions.getCurrentDateObject();
  this.getCMSrequestCountStats();
  return;
}
if(event === '3'){ //Month
  this.dateFrom=Conversions.getPreviousMonthDateObject();
  this.dateTo=Conversions.getCurrentDateObject();
  this.getCMSrequestCountStats();
  return;
}
if(event === '4'){ //Year
  this.dateFrom=Conversions.getPreviousYearDateObject();
  this.dateTo=Conversions.getCurrentDateObject();
  this.getCMSrequestCountStats();
  return;
}
 }
}
