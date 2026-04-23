// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LabTatsService } from 'src/app/modules/lab/services/lab-tats.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-patient-test-counts',
  templateUrl: './patient-test-counts.component.html',
  styleUrls: ['./patient-test-counts.component.scss']
})
export class PatientTestCountsComponent implements OnInit {

  testCountList:any;
  patientTypeList = [];
  labDeptID = -1;
  subSectionList = []
  testList = []
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  spinnerRefs = {
    delayreportTable: 'delayreportTable',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: ['', Validators.required],
    TypeId: [],
    SectionId: [],
    TPId: [],
  };
  filterForm: FormGroup = this.formBuilder.group(this.Fields)


  isSubmitted = false;
  branchList = [];
  searchText = '';
  maxDate: any;


  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService,
    private testProfileService: TestProfileService,
  ) { }

  ngOnInit(): void {

    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
    this.getSubSection();
    this.getTestProfileList();
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        locID: [this.loggedInUser.locationid]
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 800);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getTestReportData() {
    const formValues = this.filterForm.getRawValue();
    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      LocIds: formValues.locID.join(",") || -1,
      DeptId: this.labDeptID || -1,
      SubSectionId: formValues.SectionId || -1,
      PatientType: formValues.TypeId || -1,
      TPId: formValues.TPId || -1,
    };
    this.spinner.show(this.spinnerRefs.delayreportTable);
    this.labTats.getTestCountReport(objParams).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.delayreportTable);
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.testCountList = res.PayLoad
          this.filterResults();
        }
        else {
          this.toasrt.info('No Record Found');
          this.testCountList = []
        }
      } else {
        this.toasrt.error('Something went wrong');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.delayreportTable);
      this.toasrt.error('Connection error');
    })
  }
  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode === 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) {
          console.log(ex);
        }
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
    }, (err) => {
      console.log(err);
    });
  }

  onSelectAllBranches() {
    this.filterForm.patchValue({
      locID: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locID: []
    });
  }


  getLookupsForRegistration() {
    this.patientTypeList = [];
    this.lookupService.getLookupsForRegistration({ branchId: this.loggedInUser.locationid }).subscribe((resp: any) => {
      const _response = resp.PayLoadDS || [];
      // this.paymentModesList = _response.Table5 || [];
      this.patientTypeList = _response.Table6 || [];
    }, (err) => {
      console.log(err);
    })
  }
  getTestProfileList() {
    this.testList = [];
    const _param = {
      branchId: 1, //null
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: "",
    };
    this.testProfileService.getTestsByName(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {
            console.log(ex);
          }
          this.testList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // exportAsExcel() {
  //   const excelData = [];
  //   if (this.testCountList.length) {
  //     this.testCountList.forEach((d, index) => {
  //       const row = {
  //         'Sr#': index + 1,
  //         'Patient Name': d.PatientName,
  //         'Test Name': d.TPCode,
  //         'VisitDate': d.VisitDate,
  //         'TestStatus': d.TestStatus,
  //         'Delivery Date': d.DeliveryDate,
  //       };
  //       excelData.push(row);
  //     });
  //    this.excelService.exportAsExcelFile(excelData, 'DailySalesReport');  
  //   }
  //   else {
  //     this.toasrt.error('Cannot export empty table');
  //   }
  // }

  getSubSection() {

    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    };
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.subSectionList = _response;
      },
      (err) => {
        console.log(err);
        this.toasrt.error("Connection error");
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
    'SubSectionTitle',
    'TestName',
    'TestCount',
    'Revenue',
    'RegPrice',
  ];

  let results: any = this.testCountList;

  if (this.searchText && this.searchText.length > 1) {
    const normalizedSearchText = this.searchText
      .replace(/-/g, '')
      .toLowerCase();

    results = this.testCountList.filter((item: any) => {
      return cols.some((col) => {
        if (!item[col]) return false;

        const value = item[col]
          .toString()
          .replace(/-/g, '')   // 🔥 FIX HERE
          .toLowerCase();

        return value.includes(normalizedSearchText);
      });
    });
  }

  this.pagination.filteredSearchResults = results;
  this.refreshPagination();
}
}
