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

@Component({
  standalone: false,

  selector: 'app-ris-due-report',
  templateUrl: './ris-due-report.component.html',
  styleUrls: ['./ris-due-report.component.scss']
})
export class RisDueReportComponent implements OnInit {

  dueReportDataList = []
pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
  spinnerRefs = {
    duereportTable: 'duereportTable',
  }

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    locID: [, Validators.required],
    subSectionID: [],
    depID: [],
    statusID: [],
    panelID: [],

  };

  isSubmitted = false;
  branchList = [];

  searchText = '';
  maxDate: any;

  filterForm: FormGroup = this.formBuilder.group(this.Fields)
  ViistCounts = 0;

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {

    this.getLocationList();
    this.getSubSection();
    this.getTestStatus();
    this.getDepartment();
    this.getPanelList();
    this.loadLoggedInUserInfo();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        locID: [this.loggedInUser.locationid]
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    // console.log("loggedInUser", this.loggedInUser)
  }
  getDueReportData() {
    const formValues = this.filterForm.getRawValue();

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      LocIDs: formValues.locID ? formValues.locID.join(",") : null,
      SubSectionID: formValues.subSectionID || -1,
      // DeptID: this.labDeptID,
      StatusID: formValues.statusID || -1,
      PanelID: formValues.panelID || -1,
    }
    this.spinner.show(this.spinnerRefs.duereportTable);
    this.labTats.getRISDueReportDetails(objParams).subscribe((res: any) => {
      console.log("res:", objParams)
      console.log("res:", res)
      this.spinner.hide(this.spinnerRefs.duereportTable);
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.dueReportDataList = res.PayLoad;
        this.filterResults();
      } else {
        this.toasrt.info('No Record Found');
        this.dueReportDataList = []
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.duereportTable);
      this.toasrt.error('Connection error');
    })
  }
  countTotalVisitIds(data: any[]): number {
    const uniqueVisitIds: Record<number, boolean> = {};
    data.forEach(item => {
      uniqueVisitIds[item.VisitID] = true;
    });
    return Object.keys(uniqueVisitIds).length;
  }
  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
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
  labDeptID = 2
  subSectionList = []
  getSubSection() {

    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    }
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      this.subSectionList = resp.PayLoad;
    }, (err) => {
      console.log("error:", err)
      this.toasrt.error('Connection error');
    })
  }

  testStatusList = [];
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({ testCategory: 1 }).subscribe((resp: any) => {
      const _response = resp.PayLoad || [];
      this.testStatusList = _response;
    }, (err) => {
    })
  }

  departmentsList = []
  getDepartment() {
    this.departmentsList = []
    this.lookupService.GetSubDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad;
      if (!this.departmentsList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }
  panelList = []
  getPanelList() {
    this.panelList = [];
    const _param = {};
    this.lookupService.getPanels(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.panelList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }


  exportAsExcel() {
    const excelData = [];
    if (this.dueReportDataList.length) {
      this.dueReportDataList.forEach((d, index) => {
        const row = {
          'Sr#': index + 1,
          'Patient Name': d.PatientName,
          'Test Name': d.TPCode,
          'VisitDate': d.VisitDate,
          'TestStatus': d.TestStatus,
          'VisitID': d.VisitID,
          'Phelobotomy': d.Phelobotomy,
          'Accessioning': d.Accessioning,
          'Initialization': d.Initialization,
          'Reporting': d.Reporting,
          'Final': d.Final,
          'TAT': d.TAT,
          'Delivery Date': d.DeliveryDate,
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(excelData, 'Due Report Details','DueReportDetails');
    }
    else {
      this.toasrt.error('Cannot export empty table');
    }

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
    'PatientName',
    'TPName',
    'VisitDate',
    'TestStatus',
    'DeliveryDate',
  ];

  let results: any = this.dueReportDataList;

  if (this.searchText && this.searchText.length > 1) {
    const normalizedSearchText = this.searchText
      .replace(/-/g, '')
      .toLowerCase();

    results = this.dueReportDataList.filter((item: any) => {
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
