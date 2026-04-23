// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { ChartOptions, ChartDataSets } from "chart.js";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AuthService, UserModel } from "src/app/modules/auth";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FilterByKeyPipe } from "src/app/modules/shared/pipes/filter-by-key.pipe";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { BaseChartDirective } from "ng2-charts";


@Component({
  standalone: false,

  selector: "app-patient-insurance-dashboard",
  templateUrl: "./patient-insurance-dashboard.component.html",
  styleUrls: ["./patient-insurance-dashboard.component.scss"],
})
export class PatientInsuranceDashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  panelsList = [];
  patientTypeList = [];
  reports = [];
  selectedCategory = [];
  selectedDate: string;
  TestProfileDataList;
  dashboardDataList = [];
  loggedInUser: UserModel;
  branchList = [];
  maxDate: any;
  searchText = "";
  showLocColumn = false;
  isActive = -1;
  activeCases = 0;
  inactiveCases = 0;
  isSubmitted = false;


  chartOptionsForBar: ChartDataSets[] = [
    { 
      data: [this.activeCases],  // Active
      backgroundColor: '#2177ff',
      borderColor: '#2177ff',
      hoverBackgroundColor: '#0056d6', // darker blue
      label: "Active",
      borderWidth: 1,
      stack: 'stack1',
      barPercentage: 0.5,
      categoryPercentage: 0.7 
    },
    { 
      data: [this.inactiveCases],  // InActive
      backgroundColor: '#ff0000',
      borderColor: '#ff0000',
      label: "InActive",
      borderWidth: 1,
      stack: 'stack1',
      barPercentage: 0.5,
      categoryPercentage: 0.7 
    }
    
  ];
  
  
  barChartLabels: string[] = ["Status"]; // Single category label

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{ 
        stacked: true, 
        ticks: { beginAtZero: true } 
      }],
      yAxes: [{ 
        stacked: true ,
        ticks: { beginAtZero: true, max: 100 } 
      }]
    }
  };



  pieChartData: ChartDataSets[] = [{ data: [ , ] }];
  pieChartLabels: string[] = ["Active", "InActive"];
  chartOptionsForPie: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public Fields = {
    date: ["", Validators.required],
    locationid: [null],
    TypeId: [],
    PanelId: [],
  };
  dashboardDataForm: FormGroup = this.formBuilder.group(this.Fields);
  spinnerRefs = {
    dataTable: "dataTable",
    panelsDropdown: "panelsDropdown",
  };
  insuranceDataList: any = [];
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
 

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private SharedService: SharedService,
    private excelService: ExcelService,
    private lookupService: LookupService,
    private auth: AuthService,
    private labTats: LabTatsService
  ) {}

  ngOnInit(): void {
    setInterval(() => this.fetchReports(), 3600000);
    this.loadLoggedInUserInfo();
    this.getPatientTypeList();
    this.getLocationList();
    this.maxDate = Conversions.getCurrentDateObject();
    setTimeout(() => {
      this.dashboardDataForm.patchValue({
        date: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
    

    this.dashboardDataForm.get('TypeId')?.valueChanges.subscribe(value => {
      this.updatePanelValidation(value);
    });
  }

  updatePanelValidation(patientTypeValue: any) {
      console.log("patientTypeValue:", patientTypeValue);
      
      const panelControl = this.dashboardDataForm.get('PanelId');
    
      if (!patientTypeValue) {
        panelControl?.clearValidators(); // Correct way to remove validation
      } else if (patientTypeValue === 2 || patientTypeValue === 5) {
        panelControl?.setValidators([Validators.required]); // Make Panel required
      } else {
        panelControl?.clearValidators(); // Remove required validation
      }
    
      panelControl?.updateValueAndValidity(); // Refresh validation state
    }

  fetchReports(): void {
    this.insuranceDataList = [];
    this.pagination.paginatedSearchResults = [];
    this.searchText = "";
    this.activeCases = 0;
    this.inactiveCases = 0;

    const formValues = this.dashboardDataForm.getRawValue();

    if (this.dashboardDataForm.invalid) {
      this.toastr.warning("Please Select Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.date) || null,
      DateTo: Conversions.formatDateObject(formValues.date) || null,
      LocIds: formValues.locationid || null,
      PatientType: formValues.TypeId || null,
      PanelID: formValues.PanelId || null,
      isActive: this.isActive,
    };

    this.spinner.show(this.spinnerRefs.dataTable);
    this.labTats.getPatientInsuranceDataReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            this.insuranceDataList = res.PayLoad;
            this.activeCases = this.insuranceDataList.filter(
              (p) => p.isInsuranceActive
            ).length;
            this.inactiveCases =
              this.insuranceDataList.length - this.activeCases;

              console.log(this.activeCases,this.inactiveCases)
              
              this.filterResults();

            // Update Chart Data
            this.updateCharts();
          } else {
            this.toastr.info("No Record Found");
            this.insuranceDataList = [];
            this.updateCharts();
          }
        } else {
          this.toastr.error("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dataTable);
        this.toastr.error("Connection error");
      }
    );
  }
  updateCharts(): void {
    this.barChartLabels = ['Status'];
  
    this.chartOptionsForBar = [
      {
        data: [this.activeCases],
        backgroundColor: '#2177ff',
        borderColor: '#2177ff',
        label: 'Active',
        borderWidth: 1,
        stack: 'stack1',
        barPercentage: 0.5,
        categoryPercentage: 0.7
      },
      {
        data: [this.inactiveCases],
        backgroundColor: '#81C784',
        borderColor: '#81C784',
        label: 'Inactive',
        borderWidth: 1,
        stack: 'stack1',
        barPercentage: 0.5,
        categoryPercentage: 0.7
      }
    ];
  
    if (this.chart) {
      this.chart.update();
    }
    const inactive = this.inactiveCases;
    const active = this.activeCases;
    this.pieChartData = [{ data:[active, inactive]}];
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getPatientTypeList() {
    this.patientTypeList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          const _response = resp.PayLoadDS || [];
          this.patientTypeList = _response.Table6 || [];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
          this.branchList = this.branchList.sort((a, b) => {
            if (a.Code > b.Code) {
              return 1;
            } else if (a.Code < b.Code) {
              return -1;
            } else {
              return 0;
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  filterReports(): void {
    this.fetchReports();
  }

  refreshReports(): void {
    this.fetchReports();
  }


  onPanelChange(event) {
    if(!event){
      this.dashboardDataForm.get('PanelId')?.setValidators([]);
      this.panelsList = [];
      return
    }
    if (event.TypeId == 2 || event.TypeId == 5) {
      this.getPanels();
    } else {
      this.panelsList = [];
    }
  }

  getPanels() {
    this.panelsList = [];
    const _params = {
      branchId: null,
    };
    this.spinner.show(this.spinnerRefs.panelsDropdown);
    this.lookupService.getPanels(_params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.panelsDropdown);
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.panelsList = data || [];
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.panelsDropdown);
        console.log(err);
        this.toastr.error("Something went wrong. " + err.statusText);
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

  filterResults() {
    this.pagination.page = 1;
    const cols = [
      "PatientMRNo",
      "PatientName",
      "Cell",
      "VisitID",
      "Active Date",
      "Expire Date",
    ];
    let results: any = this.insuranceDataList;
    if (this.searchText && this.searchText.length > 1) {
      const pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(
        this.insuranceDataList,
        this.searchText,
        cols,
        this.insuranceDataList
      );
    }
    this.pagination.filteredSearchResults = results;
    console.log(
      "pagination.filteredSearchResults:",
      this.pagination.filteredSearchResults
    );
    this.refreshPagination();
  }
  exportAsExcel() {
    const excelData = [];
    if (this.insuranceDataList.length) {
      this.insuranceDataList.forEach((d) => {
        excelData.push(d);
      });
      this.excelService.exportAsExcelFile(excelData, "Patient Insurance Report","Patient Insurance Report");
    } else {
      this.toastr.error("Cannot export empty table");
    }
  }
}
