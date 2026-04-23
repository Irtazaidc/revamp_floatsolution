// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LabTatsService } from 'src/app/modules/lab/services/lab-tats.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';

@Component({
  standalone: false,

  selector: 'app-insurance-summary',
  templateUrl: './insurance-summary.component.html',
  styleUrls: ['./insurance-summary.component.scss']
})
export class InsuranceSummaryComponent implements OnInit {

  insuranceSummaryDataList: any = [];
  insuranceSummaryDataListMain: any = [];

  spinnerRefs = {
    dataTable: "dataTable",
    panelsDropdown: "panelsDropdown",
  };

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    locationid: [null],
    // TypeId: [],
    // PanelId: [],
  };

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  isSubmitted = false;
  showLocColumn = false;
  branchList = [];

  searchText = "";
  maxDate: any;
  isActive = 1;
  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
    // this.getPanels();
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);

    this.filterForm.get('TypeId')?.valueChanges.subscribe(value => {
      this.updatePanelValidation(value);
    });
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  
  activeCases = 0;
  inactiveCases = 0;
  getPatientInsuranceData() {
    this.insuranceSummaryDataList = [];
    this.pagination.paginatedSearchResults = [];
    this.searchText = "";
    this.active = null;
    // this.activeCases = 0;
    // this.inactiveCases = 0;
    const formValues = this.filterForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toasrt.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 31;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = "1 Month";
      this.toasrt.error(
        `The difference between dates should not exceed ${period}`
      );
      this.isSubmitted = false;
      return;
    }
    const locationid = formValues.locationid
    !locationid ? this.showLocColumn = true : this.showLocColumn = false;
    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      LocIds: Array.isArray(formValues.locationid) && formValues.locationid.length > 0
      ? formValues.locationid.join(",")
      : this.branchList.map(a => a.LocId).join(","),
    };
    this.spinner.show(this.spinnerRefs.dataTable);
    this.labTats.GetPatientInsuranceActivication(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        // this.isActive = -1;
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            const dataSet = res.PayLoad.map(item => ({
              ...item,
              ActiveInsurancePercentage: item.VisitCount > 0 ? ((item.ActiveInsuranceCount / item.VisitCount) * 100).toFixed(2) : "0.00",
              InActiveInsurancePercentage: item.VisitCount > 0 ? ((item.InActiveInsuranceCount / item.VisitCount) * 100).toFixed(2) : "0.00",
          }));
         const sortedData = [...dataSet].sort((a, b) => b.ActiveInsuranceCount - a.ActiveInsuranceCount);
            this.insuranceSummaryDataList = dataSet;
            this.insuranceSummaryDataListMain = dataSet;
          //   this.insuranceDataList.forEach(patient => {
          //     if (patient.isInsuranceActive) {
          //         this.activeCases++;
          //     } else {
          //         this.inactiveCases++;
          //     }
          // });
            this.filterResults()
          } else {
            this.toasrt.info("No Record Found");
            this.insuranceSummaryDataList = [];
            
          }
        } else {
          this.toasrt.error("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dataTable);
        this.toasrt.error("Connection error");
      }
    );
  }

  onSelectAllBranches() {
    this.filterForm.patchValue({
      locationid: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locationid: []
    });
  }

  getLocationList() {
    this.branchList = [];
    const param = {
      UserID: this.loggedInUser.userid || -99
    }
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
          // this.branchList = this.branchList.sort((a, b) => {
          //   if (a.Code > b.Code) {
          //     return 1;
          //   } else if (a.Code < b.Code) {
          //     return -1;
          //   } else {
          //     return 0;
          //   }
          // });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  
  exportAsExcel() {
    const excelData = [];
    if (this.insuranceSummaryDataList.length) {
      this.insuranceSummaryDataList.forEach((d) => {
        const row = {
          'Branch Location': d.LocCode,
          'Total Visits': d.TotalVisitCount,
          'Eligible Patients': d.TotalInsuranceCount,
          'Not Eligible': d['N/A Count'] || '-',
          'Willing': d.WillingCount || '-',
          'Not Willing': d.NotWillingCount || '-',
          'Active': d.ActiveInsuranceCount || '-',
          'Not Active': d.NotActiveCount || '-',
          'FIT Activated %': d.TotalInsuranceCount ? ((d.ActiveInsuranceCount || 0) / d.TotalInsuranceCount * 100).toFixed(2) + '%' : '-',
        };
        excelData.push(row);
      });
     this.excelService.exportAsExcelFile(excelData, 'Insurance Summary','Insurance-Summary');  
    }
    else {
      this.toasrt.error('Cannot export empty table');
    }

  }

  patientTypeList = [];
  getLookupsForRegistration() {
    this.patientTypeList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          const _response = resp.PayLoadDS || [];
          // this.paymentModesList = _response.Table5 || [];
          this.patientTypeList = _response.Table6 || [];
        },
        (err) => {
          console.log(err);
        }
      );
  }
  panelsList = [];
  getPanels() {
    this.panelsList = [];
    const _params = {
      branchId: null,
    };
    // if (!this.loggedInUser.locationid) {
    //   this.toasrt.warning('Branch ID not found');
    //   return;
    // }
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
          // console.log("Panels list is__________",this.panelsList)
          // if (this.panelIdFromBookingId || this.panelIdFromVisitInfo) { //here
          //   this.convertSelectedTestProfiles({ PanelId: this.panelIdFromBookingId || this.panelIdFromVisitInfo });
          // }

          // setTimeout(() => {
          // let panelID = this.panelsList.find(panel => panel.PanelId === 1714);
          // if (panelID) {
          //   this._form.get('PanelId').setValue(1714);
          //   this._form.get('PanelId').disable();
          // } else {
          //   this._form.get('PanelId').setValue(null);
          //   this._form.get('PanelId').enable();
          // }
          // }, 200);
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.panelsDropdown);
        console.log(err);
        this.toasrt.error("Something went wrong. " + err.statusText);
      }
    );
  }

  onChange(event: any) {
    this.isActive = event;
  }

  onPanelChange(event) {
    if(!event){
      this.filterForm.get('PanelId')?.setValidators([]);
      this.panelsList = [];
      return
    }
    if (event.TypeId == 2 || event.TypeId == 5) {
      this.getPanels();
    } else {
      this.panelsList = [];
    }
  }

  updatePanelValidation(patientTypeValue: any) {
    console.log("patientTypeValue:", patientTypeValue);
    
    const panelControl = this.filterForm.get('PanelId');
  
    if (!patientTypeValue) {
      panelControl?.clearValidators(); // Correct way to remove validation
    } else if (patientTypeValue === 2 || patientTypeValue === 5) {
      panelControl?.setValidators([Validators.required]); // Make Panel required
    } else {
      panelControl?.clearValidators(); // Remove required validation
    }
  
    panelControl?.updateValueAndValidity(); // Refresh validation state
  }
  

  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  active=null;
  onStatusChange(Id) {
    console.log("🚀 ~ InsuranceSummaryComponent ~ onStatusChange ~ Id:", Id)
    this.active = Id;
    // Sort data in ascending order based on ActiveInsuranceCount
    const sortedData = [...this.insuranceSummaryDataListMain].sort((a, b) => a.ActiveInsuranceCount - b.ActiveInsuranceCount);
    
    if (Id === 1) {
        // Get the top 5 (highest ActiveInsuranceCount) and sort them in descending order
        const top5 = sortedData.slice(-5).sort((a, b) => b.ActiveInsuranceCount - a.ActiveInsuranceCount);
        this.insuranceSummaryDataList = top5;
    } else if (Id === 2) {
        // Get the bottom 5 (lowest ActiveInsuranceCount) and sort them in descending order
        const bottom5 = sortedData.filter(item => item.ActiveInsuranceCount > 0) // Remove null/zero values
        .slice(0, 5).sort((a, b) => b.ActiveInsuranceCount - a.ActiveInsuranceCount);
        this.insuranceSummaryDataList = bottom5;
    } else {
        this.insuranceSummaryDataList = this.insuranceSummaryDataListMain;
    }
    this.filterResults()
 }

  filterResults() {
     this.pagination.page = 1;
     const cols = ['LocCode'];
     let results: any = this.insuranceSummaryDataList;
     if (this.searchText && this.searchText.length > 1) {
       const pipe_filterByKey = new FilterByKeyPipe();
       results = pipe_filterByKey.transform(this.insuranceSummaryDataList, this.searchText, cols, this.insuranceSummaryDataList);
     }
     this.pagination.filteredSearchResults = results;
     this.refreshPagination();
   }

}
