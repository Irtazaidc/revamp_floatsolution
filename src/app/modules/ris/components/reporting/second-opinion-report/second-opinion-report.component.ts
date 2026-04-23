// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-second-opinion-report',
  templateUrl: './second-opinion-report.component.html',
  styleUrls: ['./second-opinion-report.component.scss']
})
export class SecondOpinionReportComponent implements OnInit {
  _form = this.fb.group({
    VisitID: ['',],
    dateFrom: ['',],
    dateTo: ['',],
    branchIDs: ['',],
    subSectionIDs: ['',],
    RISAssesmentCategoryIDs: ['',],
    RadiologistID: [],
  });
  testList = [];
  branchList: any = [];
  subSectionList: any = [];
  noDataMessage = 'Please search to get data';
  spinnerRefs = {
    listSection: 'listSection'
  }
  disabledButtonSearch = false;
  isSpinnerSearch = true;
  loggedInUser: UserModel;

  ReportTypeID = 1;  
  isReviewerName = false;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private helper: HelperService,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private lookupSrv: LookupService,
    private auth: AuthService

  ) { }

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessageReject: 'Are you <b>sure</b> you want to print?',
    popoverMessageRecommend: 'Are you <b>sure</b> you want to Recommend?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getSubSection();
    this.getRISAssesmentCategory();
    this.getRadiologistInfo();
    this._form.patchValue({
      dateFrom: Conversions.getCurrentDateObject(),
      dateTo: Conversions.getCurrentDateObject()

    });
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  radoiologistList = [];
  getRadiologistInfo() {
    const params = {
      EmpID: null
    };
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_INFO, params).subscribe((res: any) => {
      this.radoiologistList = res.PayLoadDS['Table'] || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }
  getBranches() {
    this.lookupSrv.GetBranches().subscribe((resp: any) => {
      // console.log(resp);
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }
  checkBranch(e) {
    const visitID = this._form.getRawValue().VisitID;
    if (!e.length && visitID)
      this.validateBranch = true;
    else
      this.validateBranch = false;

    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="branch"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
  }
  getAllLocationByUserID() {
    const param = {
      UserID: this.loggedInUser.userid
    }
    this.lookupSrv.getAllLocationByUserID(param).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.lookupSrv.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }
  validateBranch = false;
  onSelectAllBranches() {
    this._form.patchValue({
      branchIDs: this.branchList.map(a => a.LocId)
    });
    this.validateBranch = false;
  }
  onUnselectAllBranches() {
    this._form.patchValue({
      branchIDs: []
    });
    this.validateBranch = true;
  }

  onSelectAllSections() {
    this._form.patchValue({
      subSectionIDs: this.subSectionList.map(a => a.SubSectionId)
    });
    this.validateBranch = false;
  }

  onUnselectAllSections() {
    this._form.patchValue({
      subSectionIDs: []
    });
  }

  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="subSectionIDs"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
  }

  assesmentCategories = [];
  getRISAssesmentCategory() {
    const params = {};
    this.sharedService.getData(API_ROUTES.GET_RIS_ASSESMENT_CATEGORY, params).subscribe((res: any) => {
      this.assesmentCategories = res.PayLoad || [];
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  clearAllOtherFields(visitID) {
    visitID = visitID.trim();
    // this._form.patchValue(
    //     VisitID: ['',],
    //     dateFrom: ['',],
    //     dateTo: ['',],
    //     branchIDs: ['',],
    //     subSectionIDs: ['',],
    //     RISAssesmentCategoryIDs: ['',],
    //     RadiologistID: []
    // )
    // this._form.patchValue(
    //   dateFrom: Conversions.getCurrentDateObject(),
    //   dateTo: Conversions.getCurrentDateObject()
    // )
    if (visitID) {
      this._form.patchValue({
        dateFrom: ['',],
        dateTo: ['',],
        branchIDs: [],
        subSectionIDs: [],
        RISAssesmentCategoryIDs: [],
        RadiologistID: null
      });
    } else {
      this._form.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject()

      });
    }

  }

  inValidDateRange
  getSecondOpinionSumaryReport() {
    const formValues = this._form.getRawValue();
    this._form.markAllAsTouched();
    if ((!formValues.VisitID || formValues.VisitID == '') && formValues.dateFrom === 'Invalid date' && formValues.dateTo === 'Invalid date') {
      this.toastr.warning("Please provide date range!", "Date Range Required");
      return;
    }

    const objParams = {
      DateFrom: (!formValues.VisitID && formValues.dateFrom) ? Conversions.formatDateObject(formValues.dateFrom) : null,
      DateTo: (!formValues.VisitID && formValues.dateTo) ? Conversions.formatDateObject(formValues.dateTo) : null,
      VisitID: formValues.VisitID ? formValues.VisitID.replaceAll("-", "") : null,
      SubSectionIDs: (!formValues.VisitID && formValues.subSectionIDs) ? formValues.subSectionIDs.join(",") : null,
      RISAssesmentCategoryIDs: (!formValues.VisitID && formValues.RISAssesmentCategoryIDs) ? formValues.RISAssesmentCategoryIDs.join(",") : null,
      LocIDs: (!formValues.VisitID && formValues.branchIDs) ? formValues.branchIDs.join(",") : null,
      RadiologistID: (!formValues.VisitID && formValues.RadiologistID) ? formValues.RadiologistID : null,
      RISAddendumTypeID: this.ReportTypeID,
    };

    this.disabledButtonSearch = true;
    this.isSpinnerSearch = false;
    this.spinner.show(this.spinnerRefs.listSection);
    this.sharedService.getData(API_ROUTES.GET_SECOND_OPINION_SUMMARY_REPORT, objParams).subscribe((resp: any) => {
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      this.spinner.hide(this.spinnerRefs.listSection);
      if (resp.StatusCode == 200) {
        this.testList = resp.PayLoad || [];
        if (!this.testList.length)
          this.noDataMessage = 'No record found.'
        // console.log("tests list is __________",this.testList)
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log(err);
      this.toastr.error('Connection error');
    })

  }
  searchText = '';
  rowIndex = null;
  isCoppied = null;
  rowIndexCpy = null;
  returnCopyClasses(i) {
    let styleClass = 'ti-files'
    if (this.rowIndex == i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle text-white';
    } else if (this.rowIndex == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files text-white';
    } else if (this.rowIndex == !i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else {
      styleClass = 'ti-files';
    }
    return styleClass;
  }

  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    const pin = text.VisitNo;
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
  }

  printSecondOpinionReport(row, i) {
    this.rowIndex = i;
    // const url = environment.patientReportsPortalUrl + 'second-opinion-report?p=' + encodeURIComponent(btoa(JSON.stringify(row)));
    const url = environment.patientReportsPortalUrl + 'second-opinion-report?p=' + encodeURIComponent(btoa(JSON.stringify(
      {
        VisitID: row.VisitId,
        TPID: row.TPId,
        RISAddendumTypeID: this.ReportTypeID,
        isReviewerName: this.isReviewerName
      }
    )));
    const winRef = window.open(url.toString(), '_blank');
  }

  disabledButtonPrintSummary = false;
  isSpinnerPrintSummary = true;
  printSecondOpinionSummaryReport() {
    this.disabledButtonPrintSummary = true;
    this.isSpinnerPrintSummary = false;
    const formValues = this._form.getRawValue();
    const url = environment.patientReportsPortalUrl + 'second-opinion-summary-report?p=' + btoa(JSON.stringify({
      DateFrom: (!formValues.VisitID && formValues.dateFrom) ? Conversions.formatDateObject(formValues.dateFrom) : null,
      DateTo: (!formValues.VisitID && formValues.dateTo) ? Conversions.formatDateObject(formValues.dateTo) : null,
      VisitID: formValues.VisitID ? formValues.VisitID.replaceAll("-", "") : null,
      SubSectionIDs: (!formValues.VisitID && formValues.subSectionIDs) ? formValues.subSectionIDs.join(",") : null,
      RISAssesmentCategoryIDs: (!formValues.VisitID && formValues.RISAssesmentCategoryIDs) ? formValues.RISAssesmentCategoryIDs.join(",") : null,
      LocIDs: (!formValues.VisitID && formValues.branchIDs) ? formValues.branchIDs.join(",") : null,
      RadiologistID: (!formValues.VisitID && formValues.RadiologistID) ? formValues.RadiologistID : null,
      RISAddendumTypeID: this.ReportTypeID,
      isReviewerName: this.isReviewerName
    }));
    setTimeout(() => {
      this.disabledButtonPrintSummary = false;
      this.isSpinnerPrintSummary = true;
      const winRef = window.open(url.toString(), '_blank');
    }, 500);

  }

  disabledButtonExportSummary = false;
  isSpinnerExportSummary = true;
  exportToExcel() {
    this.disabledButtonExportSummary = true;
    this.isSpinnerExportSummary = false;
    setTimeout(() => {
      this.disabledButtonExportSummary = false;
      this.isSpinnerExportSummary = true;
    }, 1000);
    const excelData = [];
    this.testList.forEach((dataItem, index) => {
      const row = {
        'Sr#': index + 1,
        'PIN Number': dataItem.VisitNo || 'NA',
        'Patient Name': dataItem.PatientName || 'NA',
        'Modality': dataItem.SubSection || 'NA',
        'Test': dataItem.TPCodeName || 'NA',
        'DateOfScan': dataItem.FinalDateTime + "/5",
        'DateOfReview': dataItem.AddendumOn || 'NA',
        'ReportedBy': dataItem.FinalBy || 'NA',
        'ReviewedBy': this.isReviewerName? dataItem.AddendumBy:'Panel of Consultants',
        'RequestCreater': dataItem.AddendumCreatedBy || 'NA',
        'ReviewRequestBy': dataItem.AddendumReviewSource || 'NA',
        'Requester Query/Objection/Reason': dataItem.QueryObjection|| 'NA',
        'Radiologist Query/Objection/Reason': dataItem.DrQueryRemarks || 'NA',
        'Findings': dataItem.Addendum || 'NA',
        'FinalAssessmentCategory': dataItem.CategoryName || 'NA'
      };
      excelData.push(row);
    });
    this.excelService.exportAsExcelFile(excelData, 'Secon Opinion Summary Report', 'SeconOpinionSummaryReport');
  }

}
