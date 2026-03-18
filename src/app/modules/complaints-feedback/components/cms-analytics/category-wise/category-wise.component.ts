// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { DengueService } from 'src/app/modules/patient-booking/services/dengue.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { ComplaintDashboardService } from '../../../services/complaint-dashboard.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ChartDataSets, ChartOptions } from 'chart.js';
type Color = any;
type Label = any;

@Component({
  standalone: false,

  selector: 'app-category-wise',
  templateUrl: './category-wise.component.html',
  styleUrls: ['./category-wise.component.scss']
})
export class CategoryWiseComponent implements OnInit {
  
  public Fields = {
    dateFrom: ['',Validators.required],
    dateTo: ['',Validators.required],
  };

  searchText = '';
  maxDate 
  isSubmitted = false;
  loggedInUser: UserModel;
  catWiseList = []

  FilterFrom: FormGroup = this.formBuilder.group(this.Fields)
  
  spinnerRefs = {
    analyticTable: 'analyticTable',
  };

   //Bar Chart
   barChartOptions: ChartOptions = {
    
   };
   barChartLabels: Label[] = ['People Related', 'Test Reports', 'Software', 'Others' ];
   barChartType = 'bar';
   barChartLegend = true;
   barChartPlugins = [];
   barChartColors: Color[] = [
     {
       // borderColor: '',
       backgroundColor: '#dc3545', 
     },
   ];
   ChartColors: Color[] = [
     {
       // borderColor: '',
       backgroundColor: '#007bff',
     },
   ];
   barChartData: ChartDataSets[] ;

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private complaintDashboard: ComplaintDashboardService,
  ) { }

  ngOnInit(): void {

    setTimeout(() => {
      this.FilterFrom.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.displayChart();
    }, 100);
    this.loadLoggedInUserInfo();
  this.maxDate = Conversions.getCurrentDateObject();

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getAnalyticsData(){
    this.catWiseList = []
    let formValues = this.FilterFrom.getRawValue();

    if(this.FilterFrom.invalid){
      this.toasrt.warning('Please Fill The Mandatory fields');
      return;
    } 
    
    let param = {
      dateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      dateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
    }
    this.spinner.show(this.spinnerRefs.analyticTable)
    this.complaintDashboard.getCMSReportingDetails(param).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.analyticTable)
      console.log("reportingDataList ~ res:", res)
      if (res && res.StatusCode == 200 && res.PayLoadStr) {
        let data = res.PayLoadStr;
        this.catWiseList = JSON.parse(data); 
        console.log("catWiseList ~ this.catWiseList:", this.catWiseList)
      }
      else{
        this.toasrt.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toasrt.error('Connection Error')
    });
  }



  displayChart(){

    let newData = [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' },
    ];
    this.barChartData =  newData;
    
    this.barChartOptions = {
      legend: {
        display: false
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function() {
          const chartInstance = this.chart,
            ctx = chartInstance.ctx;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          this.data.datasets.forEach(function(dataset, i) {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function(bar, index) {
              const data = dataset.data[index];
              ctx.fillStyle = "#000";
              ctx.fillText(data, bar._model.x, bar._model.y - 2);
            });
          });
        }
      },
      tooltips: {
        enabled: true
      },
      responsive: true,
      scales: {
        yAxes: [
         {
          display: true,
          scaleLabel: {
           display: true,
          },
          ticks: {
            beginAtZero: true,
            stepSize: 10, 
            callback: function (value) {
              return value + '%'; 
            },
          }
         },
         
        ],
        xAxes: [
         {
          display: true,
          scaleLabel: {
           display: true,
          },
         },
        ],
       },
    };  
  }

  // const counts = this.TotalCOunts.map(item => item.Column1);
  // const categories = this.TotalCOunts.map(item => item.CMSCategory);
  // const backgroundColors = this.generateRandomColors(categories.length); // Generate an array of random colors
  
  // this.ChartLabels = categories;
  // this.ChartData = [
  //   {
  //     data: counts,
  //     label: '', // Leave the label empty for now
  //     backgroundColor: backgroundColors
  //   },
  // ];
  // this.ChartOptions = {
  //   responsive: true,
  //   scales: {
  //     yAxes: [
  //       {
  //         display: true,
  //         scaleLabel: {
  //           display: true,
  //           labelString: 'CMS Counts',
  //         },
  //         ticks: {
  //           beginAtZero: true,
  //           stepSize: 1, 
  //           callback: function (value) {
  //             if (value % 1 === 0) {
  //               return value;
  //             }
  //             return ''; 
  //           }
  //         }
  //       },
  //     ],
  //     xAxes: [
  //       {
  //         scaleLabel: {
  //           display: true,
  //           labelString: "CMS Categories",
  //         },
  //       },
  //     ],
  //   },
  // };

}
