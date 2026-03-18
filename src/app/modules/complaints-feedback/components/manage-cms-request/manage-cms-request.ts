// @ts-nocheck
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { ComplaintDashboardService } from "../../services/complaint-dashboard.service";
import { Observable, Subscription, interval } from "rxjs";
import { AuthService, UserModel } from "src/app/modules/auth";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { CONSTANTS } from "src/app/modules/shared/helpers/constants";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LookupService } from "../../../patient-booking/services/lookup.service";
import { AppPopupService } from "../../../shared/helpers/app-popup.service";
import { Renderer2 } from "@angular/core";
import { ChartDataSets, ChartOptions } from "chart.js";
import { HcDashboardService } from "../../../home-sampling/services/hc-dashboard.service";
import * as Chart from "chart.js";
import { API_ROUTES } from "../../../shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { FeedbackService } from "src/app/modules/rms/service/feedback.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { Router } from "@angular/router";
import Swal, { SweetAlertResult } from 'sweetalert2';
import { NotifyService } from "../../services/notify.service";

type Color = any;
type Label = any;

declare var $: any;
declare var window: any;

@Component({
  standalone: false,

  selector: "app-manage-cms-request",
  templateUrl: "./manage-cms-request.html",
  styleUrls: ["./manage-cms-request.scss"],
})
export class ManageCMSRequestComponent implements OnInit {
  private refreshSubscription: Subscription;
  @ViewChild("showComplaintDataOnclick") showComplaintDataOnclick;
  @ViewChild("createCmsRequestForm") createCmsRequestForm;
  @ViewChild('openEmployeeCard') openEmployeeCard;
  @Input("SectionToShowMyCMS") SectionToShowMyCMS = {
    showGraph: true,
    showAction: true,
  };

  user$: Observable<UserModel>;
  loggedInUser: UserModel;
  filterForm: FormGroup;
  defaultDateFrom: Date;
  defaultDateTo: Date;
  RequestID = null;
  StatusID = null;
  getVisitID: number=null;
  patientId: number=null;
  isSubmitted = false;
  selectedComplaint: any;
  rowIndex: number = 0;
  complaintDetailsList: any;
  getRemarksValue: any;
  getStatusValue: number;
  getCMSrequestID: any;
  complaintInitialListDB: any;
  complaintInitialList: any;
  cmsStatusList: any;
  subSectionList = [];
  labDeptID:any = -1;
  labDeptDisable=false;
  BranchName;
  DepartmentName;
  contactBackFormValues;
  countList: any = {};
  cmsSubCategoryList: any;
  cmsCategoryList = [];
  filteredItems:any;

  
  testCategorization: any;
  testList = [];
  selectedChip: any = null;
  employeesList = [];
  departmentsList = [];
  branchList = [];
  selectedAssignedEmpName: any;
  responsiblePersonLIST: any;
  cmsInquiryList = [];
  employeeID: any;
  contactBackHistory = [];
  MeasuresTakenLIST: any;
  measuresTakenList = [];
  filteredComplaintList: any[];
  filteredFeedBackList = [];
  filteredRequestsList = [];
  advancedSearchEnabled = false;
  changeStatus: any;
  maxDate
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
  paginationforFb = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResultsForFb: [],
    paginatedSearchResultsForFb: [],
  };
  paginationforReq = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  getRemarksStatusForm: FormGroup;
  rmsComplaint: any = [];
  spinnerRefs = {
    recentComplaintRequesTable: "recentComplaintRequesTable",
    TotalRequestCount: "TotalRequestCount",
    recentComplaintRequesDetails: "recentComplaintRequesDetails",
  };
  //chart Data start
  RequestCounts: any = [];
  TotalCOunts: any;
  hcCities: any;
  TotalCancelledRequests: any;
  TotalHCRequests: any;
  TotalInProgressRequests: any;
  TotalUnAssignedRequests: any;
  TotalCompletedRequests: any;
  filtercomp:number = 26;
  screenIdentity='CMS'
  //chart Data end
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  happyImg = CONSTANTS.USER_FEEDBACK_EMOJI.HAPPY;
  veryHappyImg = CONSTANTS.USER_FEEDBACK_EMOJI.VERRYHAPPY;
  SadImg = CONSTANTS.USER_FEEDBACK_EMOJI.SAD;
  verySadImg = CONSTANTS.USER_FEEDBACK_EMOJI.VERYSAD;
  normalImg = CONSTANTS.USER_FEEDBACK_EMOJI.NORMAL;
  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };
  TotalCount: number;
  RegCount: number;
  AssignCount: number;
  ResolvedCount: number;
  CloseCount: number;
  HoldCount: number;
  reOpenedCount: number;
  newRequestGenerated;
  pageRefreshTime = 120000 //300000; //300000 //5 minutes  600000 // 10 minutes, 120000 for two minutes
  private fetchData(): void {
    this.getCMSrequestDeatil();
  }

  constructor(
    private complaintDashboardService: ComplaintDashboardService,
    private auth: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private sharedService: SharedService,
    private getfeedback: FeedbackService,
    private testProfileService: TestProfileService,
    private notify: NotifyService
  ) {
    this.filterForm = this.formBuilder.group({
      dateFrom: [''],
      dateTo: [''],
      byContact: [''],
      byPatientContact: [''],
      byEmail: [''],
      byPIN: ['', [Validators.minLength(12), Validators.maxLength(12)]],
      reqNumber: [''],
      reqId: [''],
      locationid: [null],

    });

    this.getRemarksStatusForm = this.formBuilder.group({
      getRemarks: ["", Validators.required],
      assignedDepartmentId: [""],
      assignedEmpName: [""],
      assignedBranchID: [""],
      measuresTaken: [""],
      responsibleEmpName: [""],
      cmsSectionID: [""],
      cmsCategoryID: ["", Validators.required],
      cmsSubCategoryID: ["", Validators.required],
      TpID: [""],
      PreventiveMeasure: [""],
      RootCause: [""],
      DirectCaseMeasure: [""],
    });
    this.maxDate = Conversions.getCurrentDateObject();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // this.getCMSrequestCountStats();
    this.getCMSstatus();
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      // this.rowIndex=0
      this.getCMSrequestDeatil();
      
      // this.displaychart();
    }, 600);
    // this.changeOccured();
    // this.refreshSubscription = interval(this.pageRefreshTime).subscribe(() => {
    //   this.fetchData();
    // });
    this.getLocationList();
  }
 
  // ngOnChanges(){
  //   this.changeOccured();
  // }

  changeOccured(){
    this.notify.getNotification().subscribe((changeOccurred: boolean) => {
    console.log("🚀ManageCMSRequestComponent ngOnChanges:")
      if (changeOccurred) {
    console.log("changeOccurred true:")
        Swal.fire({
          icon: 'success',
          title: `New Complaint Added`,
          // html: '<span class="custom-title">Your Complaint ID is:</span>'+this.CompaintID,
          showCloseButton: true,
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
          showConfirmButton: true,
        });
      }
    });
  }
  
  selectComplaint(complaint: any) {
    
    this.selectedComplaint = complaint;
    console.log("complaint:", complaint)
    this.getCMSrequestID = complaint.CMSRequestID;
    this.StatusID = complaint.CMSStatusID;
    this.complaintDetailsList = [];
    this.getVisitID = null;
    this.patientId = null;
    this.getCMSrequestInquiry();
    this.getHistoryOfCMSContactBackTracking();
    this.GetCMSActionTakenMeasures();
    this.getCMScategoryData();
    this.getDepartmentList();
    this.getEmployeesData();
    this.getCMSsubCategoryData();
    this.getTestProfileList();
    this.getSubSection();
    this.getLocationList();
    this.getResponsiblePerson();
    this.getMeasuresTakenData();
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.complaintDashboardService.getCMSRequest(objParm).subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.complaintDetailsList = resp.PayLoad[0];
          this.patientId = this.complaintDetailsList.PatientID;
          this.getVisitID = this.complaintDetailsList.VisitId;
          this.BranchName = this.complaintDetailsList.AsignedToBranchID;
          this.DepartmentName = this.complaintDetailsList.DepartmentId;
          if(this.StatusID == 4){
            this.labDeptDisable=true;
            this.filteredItems = this.cmsStatusList.filter(item => item.CMSStatusID == 7);   // 7
            this.getRemarksStatusForm.get('getRemarks').disable();
            this.getRemarksStatusForm.get('assignedDepartmentId').disable();
            this.getRemarksStatusForm.get('assignedEmpName').disable();
            this.getRemarksStatusForm.get('assignedBranchID').disable();
            this.getRemarksStatusForm.get('measuresTaken').disable();
            this.getRemarksStatusForm.get('responsibleEmpName').disable();
            this.getRemarksStatusForm.get('cmsSectionID').disable();
            this.getRemarksStatusForm.get('cmsCategoryID').disable();
            this.getRemarksStatusForm.get('cmsSubCategoryID').disable();
            this.getRemarksStatusForm.get('TpID').disable();
            return;
          }
          else {
            this.labDeptDisable=false;
            this.filteredItems = this.cmsStatusList;
            this.getRemarksStatusForm.get('getRemarks').enable();
            this.getRemarksStatusForm.get('assignedDepartmentId').enable();
            this.getRemarksStatusForm.get('assignedEmpName').enable();
            this.getRemarksStatusForm.get('assignedBranchID').enable();
            this.getRemarksStatusForm.get('measuresTaken').enable();
            this.getRemarksStatusForm.get('responsibleEmpName').enable();
            this.getRemarksStatusForm.get('cmsSectionID').enable();
            this.getRemarksStatusForm.get('cmsCategoryID').enable();
            this.getRemarksStatusForm.get('cmsSubCategoryID').enable();
            this.getRemarksStatusForm.get('TpID').enable();
          }
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong");
      }
    );
    this.labDeptID=this.DepartmentName?this.DepartmentName:this.labDeptID;
    this.getRemarksStatusForm.reset();
    setTimeout(() => {
      this.getRemarksStatusForm.patchValue({
        assignedBranchID: this.complaintDetailsList["AsignedToBranchID"]
          ? this.complaintDetailsList["AsignedToBranchID"]
          : null,
        // assignedEmpName: this.complaintDetailsList.ReqAssignedToName
        //   ? this.complaintDetailsList.ReqAssignedToName
        //   : null,
        assignedDepartmentId: this.complaintDetailsList["DepartmentId"]
          ? this.complaintDetailsList["DepartmentId"]
          : null,
        measuresTaken: this.MeasuresTakenLIST
          ? this.MeasuresTakenLIST.map((a) => a.ActionTakenID) : null,
        responsibleEmpName: this.responsiblePersonLIST
          ? this.responsiblePersonLIST.map((a) => a.ResponsiblePersonUserID) : null,
        cmsSectionID: this.complaintDetailsList["SectionID"]
          ? this.complaintDetailsList["SectionID"]: null,
        cmsCategoryID: this.complaintDetailsList["CMSCategoryID"]
          ? this.complaintDetailsList["CMSCategoryID"]
          : null,
        cmsSubCategoryID: this.complaintDetailsList["CMSSubCategoryID"]
          ? this.complaintDetailsList["CMSSubCategoryID"]
          : null,
        TpID: this.complaintDetailsList["TPID"]
          ? this.complaintDetailsList["TPID"]
          : null,
      });
      // this.getEmployeesData();
      if (this.BranchName) {
        this.disableDepartment(this.BranchName);
      }
      if (this.DepartmentName) {
        this.disableBranch(this.DepartmentName);
      }
    }, 800);
  }
  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }
  setCMSRequestStatus(Status) {
    if (this.contactBackFormValues) {
      this.submitContactBackRequest();
    }
   
    let formValues = this.getRemarksStatusForm.getRawValue();
    if (Status == 2 && !formValues.assignedEmpName) {
      console.log('Missing Field:')
      this.toastr.info("Missing Field: Assigned To Person");
      return
    }
    let multpleUserIdsForAssign = formValues.assignedEmpName;
    let multpleUserIdsForResponiblePerson = formValues.responsibleEmpName;
    let meauresTaken = formValues.measuresTaken;

    if (this.getRemarksStatusForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    this.getStatusValue = Status;
    this.getRemarksValue = this.getRemarksStatusForm.get("getRemarks").value;
    this.labDeptID = this.labDeptID == 2 ? this.labDeptID = 7 : this.labDeptID;
    // this.labDeptID = this.labDeptID == -1 ? this.labDeptID = null : this.labDeptID;
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
      CMSStatusID: this.getStatusValue,

      CMSStatusRemarks: Status==7?this.getRemarksValue="ReOpened":this.getRemarksValue,
      PreventiveMeasure: this.getRemarksStatusForm.get("PreventiveMeasure").value || '',
      RootCause: this.getRemarksStatusForm.get("RootCause").value || '',
      DirectCaseMeasure: this.getRemarksStatusForm.get("DirectCaseMeasure").value || '',

      CreatedBy: this.loggedInUser.userid,
      LabDepID: parseInt(this.labDeptID) || null,
      AsignedToBranchID: formValues.assignedBranchID || null,
      //
      FullName: this.complaintDetailsList["FullName"] || null,
      ComplainantName: this.complaintDetailsList["ComplainantName"] || null,
      PatientCLI: this.complaintDetailsList["PatientCLI"] || null,
      CellNo: this.complaintDetailsList["CellNo"] || null,
      CMSTypeID: this.complaintDetailsList["CMSTypeID"] || null,
      RequestSubject: this.complaintDetailsList["RequestSubject"] || null,
      RequestMessage: this.complaintDetailsList["RequestMessage"] || null,
      ReportedError: this.complaintDetailsList["ReportedError"] || null,
      PatientID: this.complaintDetailsList["PatientID"] || null,
      VisitID: this.complaintDetailsList["VisitId"] || null,
      CMSSourceID: this.complaintDetailsList["CMSRequestSourceID"] || null,
      RequestPriority: this.complaintDetailsList["RequestPriority"] || null,
      VisitedBranchID: this.complaintDetailsList["VisitedBranchID"] || null,
      PatientPortalUserID:this.complaintDetailsList["PatientPortalUserID"] || null,
      Email: this.complaintDetailsList["Email"] || null,
      //
      SubSectionID: null,
      SectionID: formValues.cmsSectionID || null,
      CMSCategoryID: formValues.cmsCategoryID || null,
      CMSSubCategoryID: formValues.cmsSubCategoryID || null,
      TPID: formValues.TpID || null,
      //
      tblCMSRequestAssigned: Array.isArray(multpleUserIdsForAssign)
        ? multpleUserIdsForAssign.map((getID) => ({ AssignedToUserID: getID }))
        : [{ AssignedToUserID: null }],
      tblCMSResponsiblePerson: Array.isArray(multpleUserIdsForResponiblePerson)
        ? multpleUserIdsForResponiblePerson.map((ID) => ({ ResponsiblePersonUserID: ID, })) :
        [{ ResponsiblePersonUserID: null }],
      tblCMSActionTaken: Array.isArray(meauresTaken) ? meauresTaken.map((id) => ({ ActionTakenID: id, })) :
        [{ ActionTakenID: null }],
    };
    console.log("Update CMS Request objParm_________", objParm);
    this.complaintDashboardService.updateCMSRequestStatus(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.getCMSrequestDeatil();
        this.toastr.success("Status Updated successfully");
        this.selectedAssignedEmpName = null;
        this.cmsSubCategoryList = null; 
        this.isSubmitted = false;
        this.closeLoginModal();
      } else {
        this.toastr.error("Something Went Wrong");
      }
    },
      (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong");
      }
    );
  }
  getsubmitContactBackFormValue(event) {
    this.contactBackFormValues = event;
  }
  submitContactBackRequest() {
    let formValues = this.contactBackFormValues;

    formValues.ContactBackDate = formValues.ContactBackDate ? Conversions.formatDateObject(formValues.ContactBackDate) : null;
    const contactBackDateTime = Conversions.mergeDateAndTime(formValues.ContactBackDate, formValues.ContactBackTime);
    let objParm = {
      ContactBackStatusID: formValues.contactBackStatus,
      ContactBackDateTime: contactBackDateTime,
      CMSRequestID: this.getCMSrequestID,
      CMSStatusID: this.StatusID,
      CreatedBy: this.loggedInUser.userid,
      ContactBackFindings: formValues.ContactBackFindings,
      // ContactBackRemarks: formValues.ContactBackRemarks,
    };
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_CMS_CONTACT_BACK_TRACK, objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad[0].RESULT === 1) {
        this.toastr.success("Callback Tracking Updated Successfully");
      } else {
        this.toastr.error("Something Went Wrong");
      }
    },
      (err) => {
        console.log(err);
      }
    );
  }
  getCMSrequestCountStats() {
    this.countList = [];
    let formValues = this.filterForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom
      ? Conversions.formatDateObject(formValues.dateFrom)
      : null;
    formValues.dateTo = formValues.dateTo
      ? Conversions.formatDateObject(formValues.dateTo)
      : null;
    let objParm = {
      // UserID: this.loggedInUser.userid,
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
    };
    this.spinner.show(this.spinnerRefs.TotalRequestCount);
    this.complaintDashboardService.getCMSrequestStats(objParm).subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.spinner.hide(this.spinnerRefs.TotalRequestCount);
          this.countList = resp.PayLoad[0];
        } else {
          this.toastr.warning(resp.Message);
          this.spinner.hide(this.spinnerRefs.TotalRequestCount);
          return;
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.TotalRequestCount);
      }
    );
  }
  getCMSstatus() {
    let param = {
      isShowCMSAdmin: 1,
      isShowMyCMS: null,
    };
    this.complaintDashboardService.getCMSStatus(param).subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.cmsStatusList = resp.PayLoad;
        } else {
          this.toastr.warning(resp.Message);
          return;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getCMSrequestDeatil() {
    this.complaintInitialList = [];
     this.pagination.paginatedSearchResults = [];
     this.paginationforFb.filteredSearchResultsForFb = [];
     this.paginationforReq.filteredSearchResults = [];


    let formValues = this.filterForm.getRawValue();
    // this.getEventData=eventData;
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;
    formValues.byPIN = (formValues.byPIN || '').trim().toString().replace(/\D/g, '');
    let objParm = {
      DateFrom: formValues.dateFrom || null,
      DateTo: formValues.dateTo || null,
      CMSRequestNo: formValues.reqNumber || null,
      CMSRequestID: formValues.reqId || null,
      UserID: this.loggedInUser.userid || null,
      CellNo: formValues.byContact || null,
      PatientCLI: formValues.byPatientContact || null,
      VisitID: formValues.byPIN || null,
      LocIDs:
        Array.isArray(formValues.locationid) && formValues.locationid.length > 0
          ? formValues.locationid.join(",")
          : this.branchList.map((a) => a.LocId).join(",") || null,
    };
    this.spinner.show(this.spinnerRefs.recentComplaintRequesTable);
    this.complaintDashboardService.getCMSRequest(objParm).subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.complaintInitialListDB = resp.PayLoad;
          // this.complaintInitialListDB = this.complaintInitialListDB.reverse();
          this.complaintInitialList = this.complaintInitialListDB;
          this.filteredComplaintList = this.complaintInitialList.filter((complaint) => complaint.CMSTypeID === 1);
          this.filteredFeedBackList = this.complaintInitialList.filter((complaint) => complaint.CMSTypeID === 2);
          this.filteredRequestsList = this.complaintInitialList.filter((complaint) => complaint.CMSTypeID === 3);
          this.getCMSrequestCountStats();
          this.allRequestCount();
          setTimeout(() => {
            this.refreshPagination();
            this.refreshPaginationforFb();
            this.refreshPaginationforReq();
            this.spinner.hide(this.spinnerRefs.recentComplaintRequesTable);
          }, 400);
        } else {
          this.toastr.info(resp.ErrorDetails);
          this.spinner.hide(this.spinnerRefs.recentComplaintRequesTable);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong");
        this.spinner.hide(this.spinnerRefs.recentComplaintRequesTable);
      }
    );
  }

   onSelectAllBranches() {
    this.filterForm.patchValue({
      locationid: this.branchList.map((a) => a.LocId),
    });
  }
  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locationid: [],
    });
  }



allRequestCount(){
  this.TotalCount = this.complaintInitialList.length;
  const statusCounts = {};
  this.complaintInitialList.forEach(complaint => {
    const statusID = complaint.CMSStatusID;
    if (statusCounts[statusID] === undefined) {
      statusCounts[statusID] = 0;
    }
    statusCounts[statusID]++;
  });
  this.RegCount = statusCounts[1] || 0;
  this.AssignCount = statusCounts[2] || 0;
  this.ResolvedCount = statusCounts[3] || 0;
  this.CloseCount = statusCounts[4] || 0;
  this.HoldCount = statusCounts[5] || 0;
  this.reOpenedCount = statusCounts[7] || 0;
}
  refreshPagination() {
    if (this.filteredComplaintList.length) {
      this.pagination.filteredSearchResults = this.filteredComplaintList;
      let dataToPaginate = this.pagination.filteredSearchResults;
      this.pagination.collectionSize = dataToPaginate.length;
      this.pagination.paginatedSearchResults = dataToPaginate
        .map((item, i) => ({ id: i + 1, ...item }))
        .slice(
          (this.pagination.page - 1) * this.pagination.pageSize,
          (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize
        );
    }
    else {
      this.pagination.paginatedSearchResults = [];
    }
  }
  refreshPaginationforFb() {
    if (this.filteredFeedBackList.length) {
      this.paginationforFb.filteredSearchResultsForFb = this.filteredFeedBackList;
      let dataToPaginate = this.paginationforFb.filteredSearchResultsForFb;
      this.paginationforFb.collectionSize = dataToPaginate.length;
      this.paginationforFb.paginatedSearchResultsForFb = dataToPaginate
        .map((item, i) => ({ id: i + 1, ...item }))
        .slice((this.paginationforFb.page - 1) * this.paginationforFb.pageSize,
          (this.paginationforFb.page - 1) * this.paginationforFb.pageSize +
          this.paginationforFb.pageSize
        );
    }
    else {
      this.paginationforFb.paginatedSearchResultsForFb = [];
    }
  }
  refreshPaginationforReq() {
    if (this.filteredRequestsList.length) {
      this.paginationforReq.filteredSearchResults = this.filteredRequestsList;
      let dataToPaginate = this.paginationforReq.filteredSearchResults;
      this.paginationforReq.collectionSize = dataToPaginate.length;
      this.paginationforReq.filteredSearchResults = dataToPaginate
        .map((item, i) => ({ id: i + 1, ...item }))
        .slice((this.paginationforReq.page - 1) * this.paginationforReq.pageSize,
          (this.paginationforReq.page - 1) * this.paginationforReq.pageSize +
          this.paginationforReq.pageSize
        );
    }
    else {
      this.paginationforReq.filteredSearchResults = [];
    }
  }

  getStatusStyles(status: number) {
    let styles = {};

    switch (status) {
      case 1:
        styles = {
          "background-color": "#FF0000",
          color: "white",
        };
        break;
      case 2:
        styles = {
          "background-color":"#FFA800",
          color: "white",
        };
        break;
      case 3:
        styles = {
          "background-color": "#1BC5BD",
          color: "white", //#88C636
        };
        break;
      case 4:
        styles = {
          "background-color": "#009E60",
          color: "white", //#88C636
        };
        break;
      case 5:
        styles = {
          "background-color": "#6993FF",
          color: "white",
        };
        break;
      case 6:
        styles = {
          "background-color": "#FA8072",
          color: "white",
        };
        break;
      case 7:
      styles = {
        "background-color": "#FA8072",
        color: "white",
      };
      break;
      default:
        // Default styles if status doesn't match any cases
        styles = {
          "background-color": "#FFA800",
          color: "white",
        };
        break;
    }
    return styles;
  }
  openPatientSearchPopUp() {
    this.selectedChip = null;
    this.isSubmitted = false;
    this.spinner.show(this.spinnerRefs.recentComplaintRequesDetails);
    setTimeout(() => {
      this.appPopupService.openModal(this.showComplaintDataOnclick, {
        backdrop: "static",
        size: "fss",
      });
      this.spinner.hide(this.spinnerRefs.recentComplaintRequesDetails);
    }, 100);
  }
  openCreateCmsRequestFormPopUp() {
    setTimeout(() => {
      this.appPopupService.openModal(this.createCmsRequestForm, {
        backdrop: "static",
        size: "fss",
      });
    }, 100);
  }
  closeLoginModal() {
    this.modalService.dismissAll();

  }
  reset() {
    this.getRemarksStatusForm.reset();
    this.selectedAssignedEmpName = null;
    this.cmsSubCategoryList = null;
    this.getRemarksStatusForm.get("assignedDepartmentId").enable();
    this.getRemarksStatusForm.get("assignedBranchID").enable();
  }
  getCMScategoryData() {
    this.getfeedback.getCMScategory().subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.cmsCategoryList = resp.PayLoad;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getCMSsubCategoryData() {
    let formValues = this.getRemarksStatusForm.getRawValue();
    let params = {
      CMSCategoryID: formValues.cmsCategoryID,
    };
    this.getfeedback.getCMSsubCategory(params).subscribe(
      (resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.cmsSubCategoryList = resp.PayLoad;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getSubSection() {
      this.getRemarksStatusForm.patchValue({
        cmsSectionID: null,
        TpID:null,
      });
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    };
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        let _response = resp.PayLoad;
        this.subSectionList = _response;
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
      }
    );
  }
  onChangeOfCategorizedTest() {
    let formValues = this.getRemarksStatusForm.getRawValue();
    let categorizedTest = formValues.cmsCategoryID;
    this.testCategorization = categorizedTest;
  }
  getTestProfileList() {
    this.testList = [];
    let _param = {
      branchId: 1, //null
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: "",
    };
    this.testProfileService.getTestsByName(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          this.testList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // displaychart() {
  //   const Utils = {
  //     CHART_COLORS: {
  //       red: "rgb(255, 99, 132)",
  //       orange: "rgb(255, 159, 64)",
  //       yellow: "rgb(255, 205, 86)",
  //       green: "rgb(75, 192, 192)",
  //       blue: "rgb(54, 162, 235)",
  //       purple: "rgb(153, 102, 255)",
  //       grey: "rgb(201, 203, 207)",
  //       // Add more chart colors if needed
  //     },

  //     randomScalingFactor() {
  //       return Math.round(Math.random() * 100);
  //     },

  //     bubbles(config) {
  //       const data = [];
  //       const colorNames = Object.keys(Utils.CHART_COLORS);

  //       for (let i = 0; i < config.count; i++) {
  //         const colorName = colorNames[i % colorNames.length];
  //         const newColor = Utils.CHART_COLORS[colorName];

  //         data.push({
  //           x: Utils.randomScalingFactor(),
  //           y: Utils.randomScalingFactor(),
  //           r: Math.max(config.rmin, Math.random() * config.rmax),
  //           borderColor: newColor,
  //           borderWidth: 1,
  //         });
  //       }

  //       return data;
  //     },
  //   };

  //   const DATA_COUNT = 7;
  //   const NUMBER_CFG = {
  //     count: DATA_COUNT,
  //     rmin: 5,
  //     rmax: 15,
  //     min: 0,
  //     max: 100,
  //   };

  //   const data = {
  //     datasets: [
  //       {
  //         label: "Dataset 1",
  //         data: Utils.bubbles(NUMBER_CFG),
  //         borderColor: Utils.CHART_COLORS.red,
  //         backgroundColor: Utils.CHART_COLORS.orange, //Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
  //       },
  //       {
  //         label: "Dataset 2",
  //         data: Utils.bubbles(NUMBER_CFG),
  //         borderColor: Utils.CHART_COLORS.orange,
  //         backgroundColor: Utils.CHART_COLORS.purple, //Utils.transparentize(Utils.CHART_COLORS.orange, 0.5),
  //       },
  //       {
  //         label: "Dataset 3",
  //         data: Utils.bubbles(NUMBER_CFG),
  //         borderColor: Utils.CHART_COLORS.green,
  //         backgroundColor: Utils.CHART_COLORS.red, //Utils.transparentize(Utils.CHART_COLORS.orange, 0.5),
  //       },
  //       {
  //         label: "Dataset 4",
  //         data: Utils.bubbles(NUMBER_CFG),
  //         borderColor: Utils.CHART_COLORS.yellow,
  //         backgroundColor: Utils.CHART_COLORS.blue, //Utils.transparentize(Utils.CHART_COLORS.orange, 0.5),
  //       },
  //     ],
  //   };

  //   new Chart("myChart", {
  //     type: "bubble",
  //     data: data,
  //     options: {
  //       responsive: true,
  //       plugins: {
  //         legend: {
  //           position: "bottom",
  //         },
  //         title: {
  //           display: false,
  //           text: "Bubble Chart",
  //         },
  //       },
  //     },
  //   });
  // }
  selectChip(chip: any): void {
    console.log("selectChip ~ chip:", chip);
    this.selectedChip = chip;
  }
  getEmployeesData() {
    this.employeesList = [];
    let formValues = this.getRemarksStatusForm.getRawValue();
    let objParam = {
      DepartmentId: formValues.assignedDepartmentId || -1,
      DesignationId: -1,
      locId: formValues.assignedBranchID || -1,
    };
    this.lookupService.getEmployeeListByDepDesLocID(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          let data = res.PayLoadDS.Table;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          this.employeesList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getDepartmentList() {
    this.departmentsList = [];
    this.lookupService.GetDepartments().subscribe(
      (resp: any) => {
        this.departmentsList = resp.PayLoad;
        // console.log('Dep List is: ', this.departmentsList)
        if (!this.departmentsList.length) {
          console.log("No Recored found");
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getLocationList() {
    this.branchList = [];
    let _param = {};

    this.lookupService.GetBranches().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) { }
          this.branchList = data || [];
          this.sortBranchList();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  sortBranchList() {
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
  GetCMSActionTakenMeasures() {
    this.measuresTakenList = [];
    this.lookupService.GetCMSActionTakenMeasures().subscribe(
      (resp: any) => {
        this.measuresTakenList = resp.PayLoad;
        // console.log('Dep List is: ', this.departmentsList)
      },
      (err) => {
        console.log(err);
      }
    );
  }  
  onAssignedEmpNameChange(event: any) {
    if (event && event.length > 0) {
      this.selectedAssignedEmpName = event;
    } else {
      this.selectedAssignedEmpName = null;
    }
    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="assignedEmpName"] .ng-input input'
    ) as HTMLInputElement;
    if(searchInput){searchInput.value = null;}
  }
  disableDepartment(event: any) {
    if (event) {
      this.getRemarksStatusForm.get("assignedDepartmentId").disable();
    } else {
      this.getRemarksStatusForm.get("assignedDepartmentId").enable();
    }
  }
  disableBranch(event: any) {
    if (event) {
      this.getRemarksStatusForm.get("assignedBranchID").disable();
    } else {
      this.getRemarksStatusForm.get("assignedBranchID").enable();
    }
  }
  getResponsiblePerson() {
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.sharedService
      .getData(API_ROUTES.GET_RESPONSIBLE_PERSON_DATA, objParm)
      .subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200 && resp.PayLoad) {
            this.responsiblePersonLIST = resp.PayLoad;
            this.responsiblePersonLIST = this.responsiblePersonLIST.filter(item => item.ResponsiblePersonUserID !== null);
              this.responsiblePersonLIST = this.responsiblePersonLIST.filter((item, index) => {
                if (item.ResponsiblePersonUserID) {
                  const isFirstOccurrence = this.responsiblePersonLIST.findIndex(
                    (prevItem, prevIndex) =>
                      prevItem.ResponsiblePersonUserID === item.ResponsiblePersonUserID && prevIndex < index
                  ) === -1;
                  return isFirstOccurrence;
                }
              });
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getMeasuresTakenData() {
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.sharedService
      .getData(API_ROUTES.GET_MEASURES_TAKEN_DATA, objParm)
      .subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200 && resp.PayLoad) {
            this.MeasuresTakenLIST = resp.PayLoad
            this.MeasuresTakenLIST = this.MeasuresTakenLIST.filter(item => item.ActionTakenID !== null);
            this.MeasuresTakenLIST = this.MeasuresTakenLIST.filter((item, index) => {
              if (item.ActionTakenID) {
                const isFirstOccurrence = this.MeasuresTakenLIST.findIndex(
                  (prevItem, prevIndex) =>
                    prevItem.ActionTakenID === item.ActionTakenID && prevIndex < index
                ) === -1;
                return isFirstOccurrence;
              }
            });
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  navigateToCmsInquiryPage(): void {
    // this.modalService.dismissAll();
    // this.router.navigate(['/cms-request/cms-inquiry'], { queryParams: { ID: btoa(this.getCMSrequestID) } });
    const cmsRequestId = this.getCMSrequestID; // Assuming this.getCMSrequestID() returns the actual CMS request ID
    const encodedRequestId = btoa(cmsRequestId);
    window.open(
      `#/cms/cms-inquiry?CMSrequestID=${encodedRequestId}`,
      "_blank"
    );
    // window.open('#/cms-request/cms-inquiry?' + 'CMSrequestID=' + btoa((this.getCMSrequestID)), '_blank');
  }
  truncate(source, size) {
    return source && source.length > size
      ? source.slice(0, size - 1) + "…"
      : source;
  }
  active=null
  onStatusChange(selectedStatusID) {
    this.active = selectedStatusID;
    if (selectedStatusID) {
      this.complaintInitialList = this.complaintInitialListDB;
      this.filteredComplaintList = this.complaintInitialList.filter((complaint) => complaint.CMSTypeID === 1);
      this.filteredFeedBackList = this.complaintInitialList.filter((complaint) => complaint.CMSTypeID === 2);
      this.filteredRequestsList = this.complaintInitialList.filter((complaint) => complaint.CMSTypeID === 3);
      this.filteredComplaintList = this.filteredComplaintList.filter(item => item.CMSStatusID === selectedStatusID);
      this.filteredFeedBackList = this.filteredFeedBackList.filter(item => item.CMSStatusID === selectedStatusID);
      this.filteredRequestsList = this.filteredRequestsList.filter(item => item.CMSStatusID === selectedStatusID);
      // console.log("this.filteredFeedBackList:", this.filteredFeedBackList)
      setTimeout(() => {
        this.refreshPagination();
        this.refreshPaginationforFb();
        this.refreshPaginationforReq();
      }, 200);
    } else {
      this.getCMSrequestDeatil();
    }
  }
  refreshData() {
    this.getCMSrequestDeatil();
  }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  // getPatientCardValues:any;
  // CardPatientID:any;

  // getCardValues(event){
  //   // console.log("getCardValues ~ event:", event);
  // this.getPatientCardValues= event;
  // console.log("getCardValues ~ this.getPatientCardValues:", this.getPatientCardValues);
  // }
  getCMSrequestInquiry() {
    this.cmsInquiryList = [];

    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.complaintDashboardService.getCMSinquiryDetails(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.cmsInquiryList = resp.PayLoad;

        // this.employeeID = this.cmsInquiryList[0].CreatedBy;
        this.patientId = this.cmsInquiryList[0].PatientID;
        // this.patientId = 65223152;
        setTimeout(() => {
        }, 500);
      } else {
        this.toastr.error('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });

  }
  OpenEmployeeCardPopUP(event) {
    console.log("event:", event)
    this.employeeID = event['CreatedBy'];
    // console.log("🚀this.employeeID:", this.employeeID)
    setTimeout(() => {
      this.appPopupService.openModal(this.openEmployeeCard, { backdrop: 'static', size: 'lg' });
    }, 500);
  }
  getHistoryOfCMSContactBackTracking() {
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.complaintDashboardService.getHistoryOfCMSContactBack(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.contactBackHistory = resp.PayLoad;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
  }
  getLabSectionIDList
  getLabSectionID() {
    let formValues = this.getRemarksStatusForm.getRawValue();
    if (formValues.TpID) {
      let objParm = {
        TPID: formValues.TpID || null,
      }
      console.log("objParm:", objParm)
      this.lookupService.GetTestInfoByTPID(objParm).subscribe((resp: any) => {
        let _response = resp.PayLoad;
        this.getLabSectionIDList = _response;
        setTimeout(() => {
          this.labDeptID = this.getLabSectionIDList[0].LabdepID;
          this.labDeptID=this.labDeptID==7?this.labDeptID=2:this.labDeptID;
          this.getRemarksStatusForm.patchValue({
            cmsSectionID: this.getLabSectionIDList[0].SectionID || null,
          });
        }, 500);
      }, (err) => {
        console.log(err)
        this.toastr.error('Connection error');
      })
    }
    else {
      setTimeout(() => {
        this.labDeptID = -1;
        this.getRemarksStatusForm.patchValue({
          cmsSectionID: null,
        });
      }, 300);
    }
  }
 
  loadedDocuments: any[];
  allowRemove=true

  getLoadedDocs(event) {
    console.log("event:", event);
    this.allowRemove=false;
    this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array
  
    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document
  
    if (latestDoc) {
      const base64String = latestDoc.data; // Your base64 image string
      console.log("CreateComplaintFeedbackComponent ~ getLoadedDocs ~ base64String:", base64String)
      const binaryData = base64String;
      const sizeInBytes = binaryData.length;
      const sizeInKB = sizeInBytes / 1024;
      console.log("🚀imgesize:", sizeInKB);
      if (sizeInKB > 100) {
        this.toastr.warning('Image size should be less than 100KB');
        return;
      }
    }
  }
  getCurrentDate
  patchRequestNo(){
    this.getCurrentDate = Conversions.getCurrentDateObject();
    const YY = this.getCurrentDate.year % 100;
    const MM = this.getCurrentDate.month;
    const combinedNumber = parseInt(`${YY.toString().padStart(2, '0')}${MM.toString().padStart(2, '0')}`);
    const result = `CMS-C-${combinedNumber}-`;
    setTimeout(() => {
      this.filterForm.patchValue({
        reqNumber: result,
      });
    }, 10);
  }
}