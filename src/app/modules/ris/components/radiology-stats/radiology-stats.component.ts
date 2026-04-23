// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { RISCommonService } from "../../services/ris-common.service";
import { ChartOptions, ChartDataSets } from "chart.js";
import { BaseChartDirective } from "ng2-charts";

@Component({
  standalone: false,

  selector: "app-radiology-stats",
  templateUrl: "./radiology-stats.component.html",
  styleUrls: ["./radiology-stats.component.scss"],
})
export class RadiologyStatsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  loggedInUser: UserModel;
  isSubmitted = false;
  searchText = "";
  maxDate: any;
  branchList = [];
  radiologyStatsList: any = [];
  isSpinner = true;
  isDisable = false;
  

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  spinnerRefs = {
    dataTable: "dataTable",
    statsData: "statsData",
  };

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    locID: [ , Validators.required],
  };

  statsForm: FormGroup = this.formBuilder.group(this.Fields);

  totalReported = 0;
  totalAssigned = 0;
  totalUnassigned = 0;
  totalPending = 0;

  chartOptionsForBar: ChartDataSets[] = [
    { 
      data: [this.totalReported], 
      backgroundColor: '#2177ff',
      borderColor: '#2177ff',
      hoverBackgroundColor: '#0056d6',
      label: "Active",
      borderWidth: 1,
      stack: 'stack1',
      barPercentage: 0.5,
      categoryPercentage: 0.7 
    },
    { 
      data: [ this.totalAssigned],
      backgroundColor: '#FFA800',
      borderColor: '#ff0000',
      label: "InActive",
      borderWidth: 1,
      stack: 'stack1',
      barPercentage: 0.5,
      categoryPercentage: 0.7 
    },
    { 
      data: [this.totalUnassigned], 
      backgroundColor: '#00ffe5',
      borderColor: '#ff0000',
      label: "InActive",
      borderWidth: 1,
      stack: 'stack1',
      barPercentage: 0.5,
      categoryPercentage: 0.7 
    },
    { 
      data: [this.totalPending],  // InActive
      backgroundColor: '#00ceff',
      borderColor: '#ff0000',
      label: "InActive",
      borderWidth: 1,
      stack: 'stack1',
      barPercentage: 0.5,
      categoryPercentage: 0.7 
    }
    
  ];
  
  
  barChartLabels: string[] = ["Stats"];

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{ 
        stacked: true, 
        ticks: { beginAtZero: true, autoSkip: true, maxRotation: 45, minRotation: 45 } 
      }],
      yAxes: [{ 
        stacked: true ,
        ticks: { beginAtZero: true, max: 100 } 
      }]
    },
    elements: {
      line: {
        tension: 0.3 // smooth curves
      }
    }
  };

  pieChartData: ChartDataSets[] = [{ data: [ , ] }];
  pieChartLabels: string[] = ["Reported", "Assigned", "Unassigned", "Pending"];
  chartOptionsForPie: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private risCommonService: RISCommonService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.calculateTotals();

    setTimeout(() => {
      this.statsForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }
  calculateTotals() {
    this.totalReported = this.radiologyStatsList.reduce(
      (sum, item) => sum + (Number(item.Reported) || 0),
      0
    );
    this.totalAssigned = this.radiologyStatsList.reduce(
      (sum, item) => sum + (Number(item.Assigned) || 0),
      0
    );
    this.totalUnassigned = this.radiologyStatsList.reduce(
      (sum, item) => sum + (Number(item.Unassigned) || 0),
      0
    );
    this.totalPending = this.radiologyStatsList.reduce(
      (sum, item) => sum + (Number(item["Checkin Pending"]) || 0),
      0
    );
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getRadiologyStatsData() {
    const formValues = this.statsForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference =  30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period =  '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }


    this.radiologyStatsList = null;
    this.isSubmitted = true;
    if(this.statsForm.invalid){ 
      this.toastr.warning('Please Fill The Mandatory fields');
      return;
    } 

    const objParm = {
      DateFrom:Conversions.formatDateObject(formValues.dateFrom),
      DateTo: Conversions.formatDateObject(formValues.dateTo),
      LocID: formValues.locID,
    };
    this.isSpinner = true;
    this.spinner.show();

    this.risCommonService.getRadiologyStatsReport(objParm).subscribe(
      (resp: any) => {
        this.isDisable = false;
        this.spinner.hide(this.spinnerRefs.statsData);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.radiologyStatsList = resp.PayLoad;
          this.calculateTotals();
          this.updateChartData();
          this.isSpinner = false;
          this.spinner.hide();
        } else {
          this.toastr.warning("No Record Found");
          this.radiologyStatsList = [];
          this.isSpinner = false;
          this.spinner.hide();
        }
      },
      (err) => {
        this.isSpinner = false;
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize
      );
  }

  getLocationList() {
    this.branchList = [];
    const param = {
      UserID: this.loggedInUser.userid || -99,
    };
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onSelectAllBranches() {
    this.statsForm.patchValue({
      locationid: this.branchList.map((a) => a.LocId),
    });
  }
  onUnselectAllBranches() {
    this.statsForm.patchValue({
      locationid: [],
    });
  }


  updateChartData(): void {
    // Update the bar chart datasets
    this.chartOptionsForBar = [
      { 
        data: [this.totalReported || 0],  // Active
        backgroundColor: '#2177ff',
        borderColor: '#2177ff',
        hoverBackgroundColor: '#0056d6',
        label: "Reported",
        borderWidth: 1,
        stack: 'stack1',
        barPercentage: 0.5,
        categoryPercentage: 0.7 
      },
      { 
        data: [this.totalAssigned || 0],
        backgroundColor: '#1BC5BD',
        borderColor: '#ff0000',
        label: "Assigned",
        borderWidth: 1,
        stack: 'stack1',
        barPercentage: 0.5,
        categoryPercentage: 0.7 
      },
      { 
        data: [this.totalUnassigned || 0], 
        backgroundColor: '#1617c1',
        borderColor: '#ff0000',
        label: "Unassigned",
        borderWidth: 1,
        stack: 'stack1',
        barPercentage: 0.5,
        categoryPercentage: 0.7 
      },
      { 
        data: [this.totalPending || 0],
        backgroundColor: '#89cc1f',
        borderColor: '#ff0000',
        label: "Pending",
        borderWidth: 1,
        stack: 'stack1',
        barPercentage: 0.5,
        categoryPercentage: 0.7 
      }
    ];
  
    // Update the pie chart data
    const totalReported = this.totalReported || 0;
    const totalAssigned = this.totalAssigned || 0 ;
    const totalUnassigned = this.totalUnassigned || 0;
    const totalPending =  this.totalPending || 0;
  
    this.pieChartData = [
      {
        data: [totalReported, totalAssigned, totalUnassigned, totalPending],
        backgroundColor: ['#2177ff', '#1BC5BD', '1617c1', '#89cc1f'],
        hoverBackgroundColor: ['#2177ff', '##1BC5BD', '#1617c1', '#89cc1f']
      }
    ];
  
    // Optional: manually trigger chart update (if you have `@ViewChild(BaseChartDirective) chart`)
    if (this.chart) {
      this.chart.update();
    }
  }
}