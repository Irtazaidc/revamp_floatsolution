// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPopupService } from '../../../../shared/helpers/app-popup.service';
import { environment } from '../../../../../../environments/environment'
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { VitalsService } from 'src/app/modules/ris/services/vitals.service';
import {Subscription, interval } from 'rxjs';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import moment from 'moment';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from '../../../../shared/helpers/api-routes';
import { StorageService } from 'src/app/modules/shared/helpers/storage.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,

  selector: 'app-tech-audit-worklist',
  templateUrl: './tech-audit-worklist.component.html',
  styleUrls: ['./tech-audit-worklist.component.scss']
})
export class TechAuditWorklistComponent implements OnInit {

  private refreshSubscription: Subscription;
  @Input('paramsValuesForWorkList') paramsValuesForWorkList: any;
  @Input('colNamesForMOScreen') colNamesForMOScreen = [];
  @Input('actionsPermission') actionsPermission: any = [];
  @Input('isStatusChanged') isStatusChanged: any = [];
  @Input('isSaved') isSaved: any = [];
  @Output() paramFormHeaderInfo = new EventEmitter<any>();
  @Output() selectedValueChange = new EventEmitter<any>();
  @Output() selectedDoctorFeedback = new EventEmitter<any>();
  @ViewChild('moHistoryModal') moHistoryModal;
  @ViewChild('vitalsModal') vitals;
  @ViewChild('emrModal') emrModal;
  @ViewChild('techAuditModal') techAuditModal;
  @ViewChild('detailArea') detailArea: ElementRef;
  buttonControlsPermissions = {

  }

  risWorkist: any = [];
  // employeesList = [];
  TechnicianID = null;
  params: { VisitID: any; BranchIDs: any; FilterBy: any; DateFrom: any; DateTo: any; };
  orignaRisList: any = [];
  visitInfo: any = {};
  PatientPhoneNumber: any = "";
  screenIdentity = null;


  loggedInUser: UserModel;

  sub: Subscription;
  count: number = 0;
  currow: any;
  constructor(
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private vitalsSrv: VitalsService,
    private helper: HelperService,
    private auth: AuthService,
    private storageService: StorageService,
  ) { }
  EmpID = null;
  isSavedVitals = null;
  pageRefreshTime = 600000 //300000; //300000 //5 minutes  600000 // 10 minutes, 120000 for two minutes

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
  
  private fetchData(): void {
    this.getRISWorkList(this.paramsValuesForWorkList);
    this.getRISWorkListCount(this.paramsValuesForWorkList);
  }
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // this.getEmployees();
    this.screenIdentity = this.route.routeConfig.path;
    this.isSavedVitals = this.isSaved;
    this.searchFormInfoObj = {
      formHeaderBGClass: 'bg-primary',
      formHeaderText: "MO Pending List"
    }
    this.paramFormHeaderInfo.emit(this.searchFormInfoObj);
    // this.getRISWorkList(this.paramsValuesForWorkList);
    this.getRISWorkListCount(this.paramsValuesForWorkList);
    if (true) {
      this.refreshSubscription = interval(this.pageRefreshTime).subscribe(() => {
        this.fetchData();
      });
    }

    this.noticeBoardStyle = "bg-salmon"
    this.testSummaryInfoHeader =
      this.paramsValuesForWorkList.visitID
        ? "All Tests"
        : "Audit Worklist";

    this.getSubSection();
  }


  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  screenIdentityngOnchages = null;
  ngOnChanges(changes: SimpleChanges) {
    this.loadLoggedInUserInfo();
    this.screenIdentityngOnchages = this.route.routeConfig.path;
    if (true) {
      // setTimeout(() => {
      this.getRISWorkList(this.paramsValuesForWorkList);
      // this.getRISWorkListCount(this.paramsValuesForWorkList);
      // }, 200);
    let DoctorFeedback = this.storageService.getObject('DoctorFeedback');
    DoctorFeedback ? this.isDrCheckboxChecked = true: this.isDrCheckboxChecked = false;
    }

  }

  ngAfterViewInit() { }



  WorkflowStatus = null;
  TranscribedBy = null;
  spinnerRefs = {
    listSection: 'listSection'
  }
  _object = Object;
  showAllTab = false;
  SubSectionId = null;
  clearVariables(refreshCounter = 0) {
    this.TPId = null;
    this.VisitID = null;
    this.PatientName = null;
    this.TPCode = null;
    this.TPName = null;
    this.PatientId = null;
    this.RISWorkListID = null;
    this.RISStatusID = null;
    this.MOBy = null;
    this.VisitIDWithDashes = null;
    this.SubSectionId = null;
    this.rowIndex = -1//null;
    if (refreshCounter == 1)
      this.count = 0;
  }

  getRISWorkList(val) {
    this.storageService.setObject('risFilterParams', val);
    if (val.visitID) {
      this.isTodo = false;
      this.isAudited = false;
      this.isAll = true;
    }
    if (val.visitID && val.isActive != 7) {
      this.toastr.warning('You have selected "PIN" please click on "All" tab to show data');
      return;
    }
    if ((val.dateFrom && val.dateTo) || val.visitID) {
      this.searchText = '';
      this.risWorkist = [];
      this.spinner.show(this.spinnerRefs.listSection);
      let params = {
        VisitID: val.visitID ? Number(val.visitID.replaceAll("-", '')) : null,
        BranchIDs: val.branch ? val.branch.join(",") : null,
        FilterBy: val.filterBy,
        TechnicianID: val.TechnicianID,
        DateFrom: val.visitID ? null : val.dateFrom,
        DateTo: val.visitID ? null : val.dateTo,
        SubSectionIDs: val.subSectionIDs, //? val.subSectionIDs.join(",") : null,
        UserID: this.loggedInUser.userid || -99 // -99 incase of null
      }
      this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_FOR_TECH_AUDIT, params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.orignaRisList = resp.PayLoad
          let dataset = resp.PayLoad;
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
            TestStatus: a.TestStatus,
            VisitNo: a.VisitNo,
            //"Workflow Status": a.WorkflowStatus, // when we fully shift then will un comment and will comment the below line
            "Workflow Status": (a.StatusId > 7) ? a.TestStatus : a.WorkflowStatus,
            StatusBadgeClass: this.getStatusClass(a.RISStatusID),
            isMedicalOfficerIntervention: a.isMedicalOfficerIntervention,
            EmpId: a.EmpId,
            RegistrationDate: a.RegistrationDate,
            DeliveryDate: a.DeliveryDate,
            isConsentRead: a.isConsentRead,
            InitializedBy: a.InitializedBy,
            InitializedOn: a.InitializedOn,
            isTechHistoryRequred: a.isTechHistoryRequred,
            SubSectionId: a.SubSectionId,
            TranscribedBy: a.TranscribedBy,
            InitBy: a.InitBy,
            TechnologistVisitTPAuditID: a.TechnologistVisitTPAuditID,
            AuditStatusID: a.AuditStatusID,
            TechRemarks: a.TechRemarks,
            FeedBackBy: a.FeedBackBy,
            FeedBackOn: a.FeedBackOn,
            FeedBackRemarks: a.FeedBackRemarks,
            FeedBackDetailRemarks: a.FeedBackDetailRemarks ? a.FeedBackDetailRemarks.replace(/,$/, '').split(',') : null,
            FBHLocCode: a.FBHLocCode || null,
            isMetal: a.isMetal,
            isPreMedical: a.isPreMedical
          }));
          let newris = [];
          this.risWorkist = this.risWorkist.map((a, i) => {
            let _obj = {};
            this.colNamesForMOScreen.forEach(b => { _obj[b] = a[b] }); return _obj
          })
          this.filterResults();
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
  todoCount = 0;
  auditedCount = 0;
  allCount = 0;
  getRISWorkListCount(val) {
    // let params = {
    //   VisitID: val.visitID ? val.visitID.replaceAll("-", '') : null,
    //   BranchIDs: val.branch ? val.branch.join(",") : null,
    //   FilterBy: 3,
    //   TechnicianID: val.TechnicianID,
    //   DateFrom: val.visitID ? null : val.dateFrom,
    //   DateTo: val.visitID ? null : val.dateTo,
    //   SubSectionIDs: val.subSectionIDs ? val.subSectionIDs.join(",") : null,
    //   UserID: this.loggedInUser.userid || -99 // -99 incase of null
    // }
    // this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_FOR_TECH_AUDIT,params).subscribe((resp: any) => {
    //   this.spinner.hide(this.spinnerRefs.listSection);
    //   if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
    //     let respData = resp.PayLoad;
    //     // this.todoCount = respData.filter(a=>a.TechnologistVisitTPAuditID==null).length;
    //     // this.auditedCount = respData.filter(a=>a.TechnologistVisitTPAuditID).length;
    //     this.todoCount = respData.filter(a => a.TechnologistVisitTPAuditID === null).length;
    //     this.auditedCount = respData.filter(a => a.TechnologistVisitTPAuditID !== null).length;
    //     this.allCount = respData.length
    //   }
    // }, (err) => {
    //   this.spinner.hide(this.spinnerRefs.listSection);
    //   console.log("Err", err)
    // })

  }



  workListFilter
  searchFormInfoObj = {
    formHeaderBGClass: 'text-primary',
    formHeaderText: "MO Pending List"
  }
  testSummaryInfoHeader = "Registered Tests";
  noticeBoardStyle = "bg-primary";



  isStatusChangedRec(statusValue) {
    if(this.isAudited){
      this.getData(2);
    }else{
      this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
      this.risWorkist.splice((this.pagination.page - 1) * this.pagination.pageSize + this.rowIndex, 1); // Adjust index based on pagination
      this.rowIndex = null;
      this.getVitals();
      this.refreshPagination();
    }
    // if(!this.isTodo){
    //   this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
    //   this.risWorkist.splice((this.pagination.page - 1) * this.pagination.pageSize + this.rowIndex, 1); // Adjust index based on pagination
    //   this.rowIndex = null;
    // }
    
    // if (true)
      // window.location.reload();
      // this.rowIndex = null;
    // setTimeout(() => {
    // this.getRISWorkList(this.paramsValuesForWorkList);
    // this.getVitals();
    // }, 5000);
    // this.refreshPagination();

  }


  TPId = null;
  VisitID = null;
  VisitId = null;
  VisitIDWithDashes = null;
  PatientName = null;
  TPCode = null;
  TPName = null;
  PatientId = null;
  RISWorkListID = null;
  RISStatusID = null;
  StatusId = null;
  MOBy = null;
  rowIndex = null;
  ProcessIDParent = 1;
  TestStatus = null;
  RegistrationDate = null;
  DeliveryDate = null;
  isTechDisclaimer = false;
  isConsentRead = false;
  isMedicalOfficerIntervention = null;
  isTechHistoryRequred = null;
  isMetal = false;


  openMOHistory(row) {
    this.isTechDisclaimer = false;
    console.log("mo-row", row);
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
    this.isMetal = row.isMetal;

    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.getVitals();
    setTimeout(() => {
      this.appPopupService.openModal(this.moHistoryModal);
    }, 200);

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
    let winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }

  openEMR(selVisitInfo) {
    this.VisitID = selVisitInfo.VisitNo.replaceAll("-", "");
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.emrModal, { size: 'fss' });
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  searchText = '';
  refreshPagination() {
    // this.clearVariables(0);
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      // .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  filterResults() {
    // this.clearVariables(0);
    this.pagination.page = 1;
    let cols = ['VisitNo', 'PatientName', 'TPCode', 'BranchCode', 'PhoneNumber', 'TestStatus', 'Workflow Status'];
    let results: any = this.risWorkist;
    if (this.searchText && this.searchText.length > 2) {
      let pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.risWorkist, this.searchText, cols, this.risWorkist);
    }
    this.pagination.filteredSearchResults = results;
    // console.log("this.pagination.filteredSearchResults____________", this.pagination.filteredSearchResults)
    this.refreshPagination();
    this.cd.detectChanges();

  }


  VerifiedUserID = null;
  RegLocId = null;
  VerifiedUserName = null;
  IsAuthenticated = false;
  isSpinnerAccept = true;
  openMOHistoryForTechAgreement() {
    this.appPopupService.openModal(this.moHistoryModal);
  }



  vitalRefresh = 0;
  isVistalSaved(isSaved) {
    // console.log("isVistalSaved:emit_____", isSaved)
    this.vitalRefresh = 1;
    if (isSaved) {
      this.getVitals()
    }
  }
  isShowVitalsCard = false;
  getVitals() {
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      let params = {
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

  printMOHistoryReport(visitID, TPId) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(visitID), TPID: TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    let winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }

  SubSectionIdFilter = null
  InitializedBy = null;
  InitializedOn = null;


  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to assign ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }



  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    let pin = text.VisitNo
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
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


  copyVisitNo(visitno: any) {
    this.helper.copyMessage(visitno);
  }


  subSectionList = []
  getSubSection() {
    this.subSectionList = [];
    let objParam = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_SUBSECTION_SECTIONID, objParam).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }


  loggedInUserLocCode = "F8";
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
      const url = environment.patientReportsPortalUrl + 'print-radio-labels?p=' + btoa(JSON.stringify({ VisitNo: this.VisitId, TPID: this.TPId, UserLoc: this.loggedInUserLocCode,appName: 'WebMedicubes:radiolabels', timeStemp: +new Date() }));
      window.open(url.toString(), '_blank');
    }
  }
  docsLength = null;
  getLoadedDocs(e) {
    this.docsLength = e.length;
  }
  getRowActive(i) {
    this.rowIndex = i;
  }
  visitDetailBtnClicked = false;
  showVisitDetail(row, i) {
    this.visitDetailBtnClicked = true;
    // console.log("mo-row - visitdetail", row);
    this.rowIndex = i;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
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
    this.isConsentRead = row.isConsentRead;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.InitializedBy = row.InitializedBy;
    this.InitializedOn = row.InitializedOn;
    this.isMetal = row.isMetal;
    this.scrollToDetail();
    // this.getVitals();
  }
  scrollToDetail() {
    setTimeout(() => {
      // if(this.screenIdentity=='tech-worklist'){
      if (this.detailArea.nativeElement) {
        this.detailArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
      // }
    }, 200);
  }

  RISWorklistRow = []
  getRISWorklistRow(visitID, TPID) {
    let params = {
      VisitID: this.VisitID,
      TPID: this.TPId
    }
    this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_ROW_FOR_TECH_AUDIT, params).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        let respData = resp.PayLoad;
        console.log("response data is : ",respData)
        this.RISWorklistRow = respData;
        let row = this.RISWorklistRow[0];
        console.log("row is in getRISWorklistRow: ", row)
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
        this.InitializedBy = row.InitializedBy;
        this.InitializedOn = row.InitializedOn;
        // this.TechnologistVisitTPAuditID = row.TechnologistVisitTPAuditID;
        this.InitBy = row.InitBy;
        this.AuditStatusID = row.AuditStatusID || null;
        this.TechRemarks = row.TechRemarks || null;
        this.isMetal = row.isMetal;
        this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
        this.getVitals();
        setTimeout(() => {
          if ((!this.AuditStatusID && !this.AuditStatusIDChk) || (this.AuditStatusID && this.AuditStatusIDChk)) {
            this.appPopupService.openModal(this.techAuditModal, { backdrop: 'static', size: 'fss' });
          } else {
            ////////////////////////////begin:: already audited item removed with alert message//////////////////////////////////////////////////////////////
            let alertTitle = "Already Audited";
            let aletMsg = 'This study <strong class="text-primary"> ' + row.VisitNo + ' : ' + this.TPName + '</strong> has already been audited.';
            Swal.fire({
              title: alertTitle,
              html: aletMsg,
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: '<i class="fas fa-check"></i> OK',
              cancelButtonText: '<i class="fas fa-times"></i> Close',
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                this.pagination.paginatedSearchResults.splice(this.rowIndex, 1);
                this.risWorkist.splice((this.pagination.page - 1) * this.pagination.pageSize + this.rowIndex, 1); // Adjust index based on pagination
                this.rowIndex = null;
                Swal.close();
              }
            });
            ////////////////////////////end:: already audited item removed with alert message//////////////////////////////////////////////////////////////
          }

        }, 200);
      }
    }, (err) => {
      console.log("Err", err)
    })
  }

  TechnologistVisitTPAuditID = null;
  InitBy = null;
  AuditStatusID = null;
  TechRemarks = null;
  AuditStatusIDChk = null;
  FeedbackObj: any = {
    FeedBackBy: null,
    FeedBackOn: null,
    FBHLocCode: null,
    FeedBackRemarks: null,
    FeedBackDetailRemarks: null
  }
  openTechAuditModal(row, index) {
    this.FeedbackObj = {
      FeedBackBy: row.FeedBackBy || null,
      FeedBackOn: row.FeedBackOn || null,
      FBHLocCode: row.FBHLocCode || null,
      FeedBackRemarks: row.FeedBackRemarks || null,
      FeedBackDetailRemarks: row.FeedBackDetailRemarks || null,
    }
    this.TechnologistVisitTPAuditID = row.TechnologistVisitTPAuditID;
    this.rowIndex = index;
    this.AuditStatusIDChk = row.AuditStatusID;
    this.TPId = row.TPId
    this.VisitID = row.VisitNo.replaceAll("-", "");
    this.isMetal = row.isMetal;
    this.getRISWorklistRow(this.VisitID, this.TPId);

  }

  isAll = false;
  isTodo = true;
  isAudited = false;
  getData(filterBy) {
    this.isCheckboxChecked = false;
    this.isDrCheckboxChecked = false;
    this.paramsValuesForWorkList.filterBy = filterBy;
    if (filterBy == 1) {
      this.isTodo = true;
      this.isAudited = false;
      this.isAll = false;
    } else if (filterBy == 2) {
      this.isTodo = false;
      this.isAudited = true;
      this.isAll = false;
    } else if (filterBy == 3) {
      this.isTodo = false;
      this.isAudited = false;
      this.isAll = true;
    }
    this.getRISWorkList(this.paramsValuesForWorkList);
    this.getRISWorkListCount(this.paramsValuesForWorkList);
  }

  isCheckboxChecked = false;
  isDrCheckboxChecked = false;
  filterTechRemarks(isChecked: boolean): void {
    if (isChecked) {
      this.isCheckboxChecked = true;
      // let filteredData = (filterType==1)? this.orignaRisList.filter(d => d.FeedBackBy):this.orignaRisList.filter(d => d.TechRemarks);
      // this.fitlterMyData(filteredData);
    } else {
      this.isCheckboxChecked = false;
      // this.fitlterMyData(this.orignaRisList)
    }
    this.filteringData();
  }

  filterDrFeedback(isChecked: boolean): void {
    if (isChecked) {
      this.isDrCheckboxChecked = true;
      // let filteredData = (filterType==1)? this.orignaRisList.filter(d => d.FeedBackBy):this.orignaRisList.filter(d => d.TechRemarks);
      // this.fitlterMyData(filteredData);
    } else {
      this.isDrCheckboxChecked=false;
      // this.fitlterMyData(this.orignaRisList)
    }
    this.filteringData();
    this.selectedDoctorFeedback.emit(isChecked); 

  }
  filteringData(){
    let filteredData = [];
    if(this.isDrCheckboxChecked && this.isCheckboxChecked){
      filteredData = this.orignaRisList.filter(d => d.FeedBackBy && d.TechRemarks);
      this.fitlterMyData(filteredData);
    }else if(this.isDrCheckboxChecked){
      filteredData = this.orignaRisList.filter(d => d.FeedBackBy);
      this.fitlterMyData(filteredData);
    }else if(this.isCheckboxChecked){
      filteredData = this.orignaRisList.filter(d => d.TechRemarks);
      this.fitlterMyData(filteredData);
    }else{
      this.fitlterMyData(this.orignaRisList);
    }
  }

  fitlterMyData(myData) {
    let dataset = myData;
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
      TestStatus: a.TestStatus,
      VisitNo: a.VisitNo,
      //"Workflow Status": a.WorkflowStatus, // when we fully shift then will un comment and will comment the below line
      "Workflow Status": (a.StatusId > 7) ? a.TestStatus : a.WorkflowStatus,
      StatusBadgeClass: this.getStatusClass(a.RISStatusID),
      isMedicalOfficerIntervention: a.isMedicalOfficerIntervention,
      EmpId: a.EmpId,
      RegistrationDate: a.RegistrationDate,
      DeliveryDate: a.DeliveryDate,
      isConsentRead: a.isConsentRead,
      InitializedBy: a.InitializedBy,
      InitializedOn: a.InitializedOn,
      isTechHistoryRequred: a.isTechHistoryRequred,
      SubSectionId: a.SubSectionId,
      TranscribedBy: a.TranscribedBy,
      InitBy: a.InitBy,
      TechnologistVisitTPAuditID: a.TechnologistVisitTPAuditID,
      AuditStatusID: a.AuditStatusID,
      TechRemarks: a.TechRemarks,
      FeedBackBy: a.FeedBackBy,
      FeedBackOn: a.FeedBackOn,
      FeedBackRemarks: a.FeedBackRemarks,
      FeedBackDetailRemarks: a.FeedBackDetailRemarks ? a.FeedBackDetailRemarks.replace(/,$/, '').split(',') : null,
      FBHLocCode: a.FBHLocCode || null,
      isMetal: a.isMetal
    }));
    let newris = [];
    this.risWorkist = this.risWorkist.map((a, i) => {
      let _obj = {};
      this.colNamesForMOScreen.forEach(b => { _obj[b] = a[b] }); return _obj
    })
    this.filterResults();
  }

}
