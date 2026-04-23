// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { RisWorklistService } from '../../../services/ris-worklist.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/modules/shared/helpers/storage.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import moment from 'moment';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { VitalsService } from '../../../services/vitals.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-quick-peer-reviw',
  templateUrl: './quick-peer-reviw.component.html',
  styleUrls: ['./quick-peer-reviw.component.scss']
})
export class QuickPeerReviwComponent implements OnInit {
  @ViewChild('questionnaireModal') questionnaireModal;
  @ViewChild('moHistoryModal') moHistoryModal;
  @ViewChild('emrModal') emrModal;
  @ViewChild('vitalsModal') vitals;
  @ViewChild('reportingModal') reportingModal;
  constructor(
    private formBuilder: FormBuilder,
    private lookupSrv: LookupService,
    private worklistSrv: RisWorklistService,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private helper: HelperService,
    private appPopupService: AppPopupService,
    private vitalsSrv: VitalsService,
    private printRptService: PrintReportService

  ) { }
  loggedInUser: UserModel;
  spinnerRefs = {
    listSection: 'listSection',
    editorSection: 'editorSection'
  }
  screenIdentity = 'peer-review'
  public RISParams = {
    branch: [null, ''],
    dateFrom: [null, ''],
    dateTo: [null, ''],
    visitID: [null, ''],
    subSectionIDs: [null, '']
  };
  risParamsForm: FormGroup = this.formBuilder.group(this.RISParams)
  isValidDateRange = true;
  subSectionList: any = [];
  branchList: any = [];
  branchIDs: any = [];
  risWorkist = [];
  params: { VisitID: any; BranchIDs: any; DateFrom: any; DateTo: any; };
  subSectionIDs = null;
  searchText = '';
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    const risFilterParams = this.storageService.getObject('risFilterParams');
    if (risFilterParams) {
      this.branchIDs = risFilterParams.branch;
      this.subSectionIDs = risFilterParams.subSectionIDs
    }

    this.risParamsForm.patchValue({
      dateFrom: risFilterParams ? Conversions.getDateObjectByGivenDate(risFilterParams.dateFrom) : Conversions.getCurrentDateObject(),
      dateTo: risFilterParams ? Conversions.getDateObjectByGivenDate(risFilterParams.dateTo) : Conversions.getCurrentDateObject(),
      visitID: risFilterParams ? risFilterParams.visitID : null,
      branch: risFilterParams ? risFilterParams.branch : null,
      subSectionIDs: risFilterParams ? risFilterParams.subSectionIDs : null,
      TechnicianID: risFilterParams ? risFilterParams.TechnicianID : null,

    });

    this.getBranches();
    // this.getAllLocationByUserID();
    this.getSubSection();

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  validateDateDifference(index) { }
  onSelectAllSections() {
    this.risParamsForm.patchValue({
      subSectionIDs: this.subSectionList.map(a => a.SubSectionId)
    });
    this.validateBranch = false;
  }

  onUnselectAllSections() {
    this.risParamsForm.patchValue({
      subSectionIDs: []
    });
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

  getBranches() {
    this.lookupSrv.GetBranches().subscribe((resp: any) => {
      // console.log(resp);
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }
  onSelectAllBranches() {
    this.risParamsForm.patchValue({
      branch: this.branchList.map(a => a.LocId)
    });
    this.validateBranch = false;
  }
  onUnselectAllBranches() {
    this.risParamsForm.patchValue({
      branch: []
    });
    this.validateBranch = true;
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

  validateBranch = false;
  searchByVisit() {
    const visitID = this.risParamsForm.getRawValue().visitID;
    const branch = this.risParamsForm.getRawValue().branch;
    // let branchField = this.risParamsForm.get('branch');
    if (visitID) {
      this.risParamsForm.patchValue({
        dateFrom: "",
        dateTo: ""
      })

    } else {
      this.risParamsForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject()
      });
    }
  }
  checkBranch(e) {
    const visitID = this.risParamsForm.getRawValue().visitID;
    if (!e.length && visitID)
      this.validateBranch = true;
    else
      this.validateBranch = false;

    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="branch"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
  }
  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="subSectionIDs"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }

  }
  orignaRisList = [];
  _object = Object;
  getPeerReviewData() {
    // this.searchByVisit();
    const formValues = this.risParamsForm.getRawValue();
    const visitID = formValues.visitID;
    const branch = formValues.branch;
    if ((!formValues.dateFrom || !formValues.dateTo) && !visitID) {
      this.toastr.error('Please Select Date Range');
      this.isValidDateRange = false;
      return;
    } else {
      this.isValidDateRange = true;
    }
    //date validateion
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isValidDateRange = false;
      return;
    } else {
      this.isValidDateRange = true;
    }
    const daysDifference = (toDate - fromDate) / (1000 * 3600 * 24);
    const revertDays = (fromDate - toDate) / (1000 * 3600 * 24);
    if (daysDifference > 30 || revertDays > 30) {
      this.toastr.error('The difference between dates should be 1 month');
      this.isValidDateRange = false;
      return;
    } else {
      this.isValidDateRange = true;
    }
    if (visitID) {
      formValues.branch = this.branchList.map(item => parseInt(item.LocId, 10));
    } else {
      formValues.branch = formValues.branch;
    }
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;
    this.cd.detectChanges();


    const storagePrms = this.storageService.getObject('risFilterParams') ? this.storageService.getObject('risFilterParams') : formValues;
    this.storageService.setObject('risFilterParams', formValues);

    // if (formValues.visitID) {
    //   this.toastr.warning('You have selected "PIN" pleas click on "All" tab to show data');
    //   return;
    // }
    if ((formValues.dateFrom && formValues.dateTo) || formValues.visitID) {
      this.searchText = '';
      // this.filterResults();
      this.risWorkist = [];
      this.spinner.show(this.spinnerRefs.listSection);
      const params = {
        VisitID: formValues.visitID ? formValues.visitID.replaceAll("-", '') : null,
        BranchIDs: formValues.branch ? formValues.branch.join(",") : null,
        DateFrom: formValues.visitID ? null : formValues.dateFrom,
        DateTo: formValues.visitID ? null : formValues.dateTo,
        SubSectionIDs: formValues.subSectionIDs ? formValues.subSectionIDs.join(",") : null,
      }
      this.worklistSrv.getRISWorklistForPeerReview(params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.orignaRisList = resp.PayLoad
          const dataset = resp.PayLoad;
          // console.log("dataset: ", dataset)
          this.risWorkist = dataset.map(a => ({
            BranchCode: a.BranchCode,
            MOBy: a.MOBy,
            PatientId: a.PatientId,
            PatientName: a.PatientName,
            PhoneNumber: a.PhoneNumber,
            ProcessId: a.ProcessId,
            RISStatusID: a.RISStatusID,
            RISWorkListID: a.RISWorkListID,
            StatusId: a.StatusId,
            TPCode: a.TPCode,
            TPId: a.TPId,
            TPName: a.TPName,
            TestStatus: this.getTestStatus(a.StatusId, a.RISStatusID, a.TestStatus, a.WorkflowStatus),//a.TestStatus,
            VisitNo: a.VisitNo,
            "Workflow Status": a.WorkflowStatus,
            StatusBadgeClass: this.getStatusClass(a.RISStatusID),
            isMedicalOfficerIntervention: a.isMedicalOfficerIntervention,
            EmpId: a.EmpId,
            RegistrationDate: a.RegistrationDate,
            DeliveryDate: a.DeliveryDate,
            "RemainingTime (hh:mm)": this.getRemainingTime(a.DeliveryDate),
            isConsentRead: a.isConsentRead,
            InitializedBy: a.InitializedBy,
            InitializedOn: a.InitializedOn,
            isTechHistoryRequred: a.isTechHistoryRequred,
            SubSectionId: a.SubSectionId,
            TranscribedBy: a.TranscribedBy
          }));
          // this.risWorkist = resp.PayLoad;
          // ['VisitNo', 'PatientName', 'TPCode', 'TestStatus']
          const newris = [];
          this.risWorkist = this.risWorkist.map((a, i) => {
            const _obj = {};
            this.colNamesForMOScreen.forEach(b => { _obj[b] = a[b] }); return _obj
          })
          this.filterResults();
          // console.log("newris", this.risWorkist)
        }
        this.params = params

      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log("Err", err)
      })
    }
    else {
      this.toastr.error("Please select date range")
    }
  }
  colNamesForMOScreen = ['StatusBadgeClass', 'VisitNo', 'PatientName', 'TPCode', 'TPName', 'TestStatus', 'BranchCode', 'PatientId', 'TPId', 'StatusId', 'RISWorkListID', 'RISStatusID', 'PhoneNumber', 'ProcessId', 'MOBy', 'isMedicalOfficerIntervention', 'RegistrationDate', 'DeliveryDate', 'isConsentRead', 'InitializedBy', 'InitializedOn', 'TranscribedBy'];
  getStatusClass(risStatusID) {
    let statusClass = 'badge badge-primary';
    switch (risStatusID) {
      case null:
      case 1: {
        statusClass = 'badge badge-primary';
        break;
      }
      case 2: {
        statusClass = 'badge badge-info';
        break;
      }
      case 3: {
        statusClass = 'badge badge-tomato';
        break;
      }
      case 4: {
        statusClass = 'badge badge-blue';
        break;
      }
      case 5: {
        statusClass = 'badge badge-checkout-with-initial';
        break;
      }
      case 6: {
        statusClass = 'badge badge-initial';
        break;
      }
      case 7: {
        statusClass = 'badge bg-salmon';
        break;
      }
      case 8: {
        statusClass = 'badge bg-primary';
        break;
      }
      case 9: {
        statusClass = 'badge bg-tomato';
        break;
      }
      default: {
        statusClass = 'badge badge-primary';
        break;
      }
    }
    return statusClass;
  }

  getRemainingTime(deliveryDate: string): string {
    // Get the current date and time
    const currentMoment = moment();

    // Parse the delivery date using Moment.js
    const deliveryMoment = moment(deliveryDate);

    // Calculate the difference in minutes between the current time and delivery time
    const diffMinutes = deliveryMoment.diff(currentMoment, 'minutes');

    // Calculate the absolute difference in hours and minutes
    const absDiffHours = Math.floor(Math.abs(diffMinutes) / 60);
    const absDiffMinutes = Math.abs(diffMinutes) % 60;

    // Format the result as "hh:mm" with a minus sign if necessary
    const formattedHours = String(absDiffHours).padStart(2, '0');
    const formattedMinutes = String(absDiffMinutes).padStart(2, '0');
    const sign = diffMinutes < 0 ? '-' : ''; // Add minus sign if the difference is negative

    return `${sign}${formattedHours}:${formattedMinutes}`;
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  filterResults() {
    // this.clearVariables(0);
    this.pagination.page = 1;
    const cols = ['VisitNo', 'PatientName', 'TPCode', 'BranchCode', 'PhoneNumber', 'TestStatus', 'Workflow Status'];
    let results: any = this.risWorkist;
    if (this.searchText && this.searchText.length > 2) {
      const pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.risWorkist, this.searchText, cols, this.risWorkist);
    }
    this.pagination.filteredSearchResults = results;
    // console.log("this.pagination.filteredSearchResults____________", this.pagination.filteredSearchResults)
    this.refreshPagination();
    this.cd.detectChanges();

  }
  refreshPagination_() {
    // this.clearVariables(0);
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;;
  }
  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);

  }

  getTestStatus(StatusId, RISStatusID, TestStatus, WorkflowStatus) {
    let testStatus = WorkflowStatus;
    if ((StatusId == 6 && !RISStatusID) || (StatusId == 7 && (RISStatusID == 8 || RISStatusID == 10))) {
      testStatus = WorkflowStatus;
    } else {
      testStatus = TestStatus
    }
    return testStatus;

  }
  rowIndex = null;
  rowIndexCpy = null;
  isCoppied = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    const pin = text.VisitNo
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
  }
  getRemainingTimeBadgeColor(remainingTime: string): string {
    const [hours, minutes] = remainingTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 180) {
      return 'badge badge-primary'; // Greater than or equal to 3 hours
    } else if (totalMinutes >= 0) {
      return 'badge badge-warning'; // Greater than or equal to 0 minutes
    } else {
      return 'badge badge-danger'; // Negative remaining time
    }
  }
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

  showVisitDetail(p1, p2) {

  }
  openReportDetail(row, index) {
    console.log("row is _____________", row)
    this.WorkflowStatus = row["Workflow Status"]
    this.isTechDisclaimer = false;
    // console.log("mo-row", row);
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    if (this.screenIdentity == 'peer-review') {
      this.VerifiedUserID = null;
      this.rowIndex = index;
      this.TPId = row.TPId;
      this.VisitIDWithDashes = row.VisitNo;
      this.VisitID = row.VisitNo.replaceAll("-", "");
      this.TPCode = row.TPCode;
      this.TPName = row.TPName;
      this.PatientName = row.PatientName;
      this.PatientId = row.PatientId;
      this.RISStatusID = row.RISStatusID;
      this.StatusId = row.StatusId;
      this.PatientPhoneNumber = row.PhoneNumber;
      this.RISWorkListID = row.RISWorkListID;
      this.MOBy = row.MOBy;
      this.ProcessIDParent = row.ProcessId;
      this.TestStatus = row.TestStatus;
      this.StatusId = row.StatusId;
      this.isConsentRead = row.isConsentRead;
      this.WorkflowStatus = row["Workflow Status"];
      this.TranscribedBy = row.TranscribedBy;
      this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
      this.getVitals();
      setTimeout(() => {
        this.appPopupService.openModal(this.reportingModal, { backdrop: 'static', size: 'fss' });
      }, 200);
    }
  }
  vitalRefresh = 0;
  isVistalSaved(isSaved) {
    // console.log("isVistalSaved:emit_____", isSaved)
    this.vitalRefresh = 1;
    if (isSaved) {
      this.getVitals()
    }
  }

  dblClick = false;
  cmdchk = false;
  WorkflowStatus = null;
  TranscribedBy = null;
  TPId = null;
  VisitID = null;
  VisitIDWithDashes = null;
  PatientName = null;
  TPCode = null;
  TPName = null;
  PatientId = null;
  RISWorkListID = null;
  RISStatusID = null;
  StatusId = null;
  MOBy = null;
  ProcessIDParent = 1;
  TestStatus = null;
  RegistrationDate = null;
  DeliveryDate = null;
  isTechDisclaimer = false;
  isConsentRead = false;
  isMedicalOfficerIntervention = null;
  isTechHistoryRequred = null;
  visitInfo: any = {};
  PatientPhoneNumber: any = "";
  isShowVitalsCard = false;
  VerifiedUserID = null;
  RegLocId = null;
  VerifiedUserName = null;
  IsAuthenticated = false;
  isSpinnerAccept = true;
  openQuestionnaireModal(row) {
    this.isTechDisclaimer = false;
    if (!row.isMedicalOfficerIntervention) {
      this.toastr.warning("MO Intervention is not set for the test " + row.TPName + "", "MO Intervention");
      return;
    }
    // console.log("mo-row", row);
    this.WorkflowStatus = row["Workflow Status"]
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.TestStatus = row.TestStatus;
    this.StatusId = row.StatusId;
    if (this.screenIdentity == 'mo-worklist')
      this.appPopupService.openModal(this.questionnaireModal, { backdrop: 'static', size: 'fss' });
    else
      this.openMOHistory(row);
  }
  openMOHistory(row) {
    this.isTechDisclaimer = false;
    // console.log("mo-row", row);
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.getVitals();
    setTimeout(() => {
      this.appPopupService.openModal(this.moHistoryModal);
    }, 200);

  }
  getVitals() {
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      const params = {
        VisitID: this.VisitID,
        TPID: this.TPId
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        if (resp.PayLoad.length) {
          this.isShowVitalsCard = true;
        } else {
          this.isShowVitalsCard = false;
        }
      }, (err) => { console.log("err", err) })
    }
  }
  PACSServers = [];
  SysInfo: any = {};
  isVPN = false;
  getPACSServers(visitID, TPID, rowIndex) {
    this.rowIndex = rowIndex;
    // this.toastr.info("Working in progress", "Success");
    const VisitID = visitID.replaceAll("-", "");
    this.SysInfo = this.auth.getSystemInfoFromStorage();
    // 240301044020,@TPId INT=926--2123
    // let objParams = {
    //   VisitId: VisitID,//'240301134040',//'240301044020',//VisitID,
    //   TPId: TPID,//926//926//TPID
    //   LocID: this.loggedInUser.locationid //Number(this.SysInfo.loginLocId)
    // }
    // console.log("objParam: ", objParams)
    this.isVPN = localStorage.getItem('isVPN') === 'true'; //  get from local storage
    const tblVisitTestDetail = [{
      VisitID: VisitID,
      TPID: TPID
    }];
    const objParams = {
      IsVPN: this.isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail
    };
    // this.disabledButtonSearch = true;
    // this.isSpinnerSearch = false;
    // this.spinner.show(this.spinnerRefs.comparativeSection);
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_LOC_AND_VISITS_V2, objParams).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        // Dynamic handling for any number of servers
        if (this.PACSServers.length > 0) {
          // Create the URL dynamically for any number of servers
          let url = 'radiant://?n=f';

          // Add each server path to the URL
          this.PACSServers.forEach((server, index) => {
            let sanitizedPath = server.BackupServer;

            // Remove trailing slash if present
            if (sanitizedPath.endsWith('\\')) {
              sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
            }

            // Replace backslashes with URL encoding
            sanitizedPath = sanitizedPath.replace(/\\/g, '%5C');

            // Add to URL with proper parameter name
            url += `&v=%22${sanitizedPath}%22`;
          });

          // Open the URL
          window.open(url, '_blank');
        } else {
          // this.disabledButtonDICOM = false;
          // this.isSpinnerDICOM = true;
          this.toastr.warning("No PACS Servers Available");
        }
      } else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.toastr.warning("No Record Found");
        // this.disabledButtonDICOM = false;
        // this.isSpinnerDICOM = true;
      }
    }, (err) => {
      console.log(err);
      // this.disabledButtonDICOM = false;
      // this.isSpinnerDICOM = true;
      this.toastr.error("Error fetching PACS servers");
    });


  }

  printReport(row, index) {
    this.isTechDisclaimer = false;
    this.VerifiedUserID = null;
    this.rowIndex = index;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.StatusId = row.StatusId;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.TestStatus = row.TestStatus;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    if (this.StatusId > 7) {
      setTimeout(() => {
        this.ViewReport('');
      }, 200);
    } else {
      this.toastr.warning("This report is not finalized yet so, you can't print it.")
    }

  }


  // Print report /////////////////////////////////////////////////////////
  ViewReport(itemType, reportType = 'normal') {
    let radioTestIds = '';
    let radioTP: any = [];
    //   radioTP =[{
    //     "ACCOUNTNO": this.VisitId,
    //     "TESTRESULT_ID": "",
    //     "TestID": "",
    //     "hasEmailSend": "n",
    //     "TESTRESULTID": "n",
    //     "BRANCH_ID": 0,
    //     "PROFILETESTS": this.TPCode,
    //     "PROFILETESTSDESC": this.TPName,
    //     "SECTION": "",
    //     "STATUS": "Final",
    //     "ABBRIVATION": "n",
    //     "REPORTINGTIME": "2023-07-05T20:00:00",
    //     "PROFILETESTID": this.TPID,
    //     "SECTIONID": 7,
    //     "ISPANEL": 0,
    //     "IsCash": "",
    //     "PANELNAME": "n",
    //     "CREATEDON": "n",
    //     "SectionType": "Radiology",
    //     "ReportTemplateType": 2,
    //     "DSBy": "n",
    //     "isReportable": 1,
    //     "WR_ALLOWED": 1,
    //     "EnableEmail": "n",
    //     "ENABLESMS": "n",
    //     "InOut": "N",
    //     "DueBalance": "",
    //     "PanelMailToPatient": "n",
    //     "PanelMailToPanel": "n",
    //     "PanelSMSAlert": "n",
    //     "PanelShowReport": "n",
    //     "PanelShouldReportMails": "n",
    //     "PanelIsByPassDueAmount": "n",
    //     "PanelPOCEmail": "n",
    //     "ProfileIsEmailEnable": "n",
    //     "ProfileIsSMSEnable": "n",
    //     "ProfileIsShowOnline": null,
    //     "isPackage": 1,
    //     "TypeId": 1,
    //     "PROFILEID": "",
    //     "SUBSECTIONID": 18,
    //     "EncAccountNo": null,
    //     "PanelID": null,
    //     "permission_ViewGraphicalReportIcon": false,
    //     "permission_ViewReportIcon": true,
    //     "permission_PRViewReportIcon": true,
    //     "permission_ViewPreReportIcon": false,
    //     "permission_ViewDeliverReportIcon": true,
    //     "permission_InPrgresIcon": false,
    //     "permission_PACSImages": true,
    //     "permission_IsReportableIcon": true,
    //     "permission_PanelIsTestAllowOnlineIcon": false,
    //     "permission_IsTestAllowOnlineIcon": false,
    //     "permission_IsdueblnceIcon": false,
    //     "permission_IsTestCancelled": false,

    // }]
    radioTP = [{
      "ACCOUNTNO": this.VisitID,
      "PROFILETESTS": this.TPCode,
      "PROFILETESTSDESC": this.TPName,
      "PROFILETESTID": this.TPId,

    }]
    // console.log("radioTP: ",radioTP);return;

    if (!this.TPId) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {


      radioTestIds = this.TPId;
      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe((res: any) => {
          // console.log("ressssssssssssssssss: ", res)
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }
    }
  }
  confirmationPopoverConfigCloseModal = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: '<span class="text-danger">Are you <strong>sure</strong> want to close? <span>', // 'Are you sure?',
    popoverMessage: 'All <strong>Unsaved data</strong> will be <strong>Discarded</strong>',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  isActive = null;
  openReportWindow() {
    const patientVisitInvoiceWinRef = window.open('', '_blank');
    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split('?');
    if (reportSegments.length > 1) {
      reportUrl = reportSegments[0] + '?' + btoa(atob(reportSegments[1]) + '&SessionExpiryTime=' + (+new Date() + (CONSTANTS.REPORT_EXPIRY_TIME * 1000))); // &pdf=1
    }
    return reportUrl;
  }
  readTechAgreement() { }

  printMOHistoryReport(visitID, TPId) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(visitID), TPID: TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }
  docsLength = null;
  getLoadedDocs(e) {
    this.docsLength = e.length;
  }

  openEMR(selVisitInfo) {
    this.VisitID = selVisitInfo.VisitNo.replaceAll("-", "");
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.emrModal, { size: 'fss' });
  }
  openVitals(selVisitInfo) {
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.vitals, { size: 'lg' });
  }
  openMOHistoryReport(row) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(row.VisitNo.replaceAll("-", "")), TPID: row.TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }
  isSpinnerAssign = true;//Hide Loader
  isSpinnerUnAssign = true;//Hide Loader
  disabledButtonAssign = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonUnAssign = false; // Button Enabled / Disables [By default Enabled]
  VisitId = null;
  assigneeName = null;
  rowGlobal: any = null;
  SubSectionIdFilter = null
  InitializedBy = null;
  InitializedOn = null;
  loggedInUserLocCode = 'F8';
  printRadioLable(row, i) {
    this.loggedInUserLocCode = this.loggedInUser.currentLocation;
    this.rowIndex = i;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitId = this.VisitID;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    if (this.TPId && this.VisitId) {
      const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: this.TPId, UserLoc: this.loggedInUserLocCode, appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
      window.open(url.toString(), '_blank');
    }
  }
  isSpinnerExport = true;
  disabledButtonExport = false;
  openPopupModal(row, index) {
    // this.clearVariables(0);
    this.rowIndex = null;
    // console.log("mo-row", row);
    this.rowIndex = index;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.isConsentRead = row.isConsentRead;
    this.isMedicalOfficerIntervention = row.isMedicalOfficerIntervention;
    this.isTechHistoryRequred = row.isTechHistoryRequred;
    this.TestStatus = row.TestStatus;
    this.StatusId = row.StatusId;
    this.WorkflowStatus = row["Workflow Status"];
    // console.log("and ProcessIDParent", this.ProcessIDParent);
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.getVitals()
    if (this.screenIdentity == 'mo-worklist') {
      this.isTechDisclaimer = false;
      if (!row.isMedicalOfficerIntervention) {
        this.toastr.warning("MO Intervention is not set for the test " + row.TPName + "", "MO Intervention");
        return;
      }
      this.rowIndex = null;
      this.rowIndex = index;
      this.appPopupService.openModal(this.questionnaireModal, { backdrop: 'static', size: 'fss' });

    }

  }

}
