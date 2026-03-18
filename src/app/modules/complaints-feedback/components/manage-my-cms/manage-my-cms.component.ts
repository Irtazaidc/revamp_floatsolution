// @ts-nocheck
import { Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ComplaintDashboardService } from '../../services/complaint-dashboard.service';
import { FeedbackService } from 'src/app/modules/rms/service/feedback.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from '../../../shared/helpers/api-routes';
import {MatDialog, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';


@Component({
  standalone: false,

  selector: 'app-manage-my-cms',
  templateUrl: './manage-my-cms.component.html',
  styleUrls: ['./manage-my-cms.component.scss']
})
export class ManageMyCmsComponent implements OnInit {
  
  @ViewChild('showComplaintDataOnclick') showComplaintDataOnclick;
  @ViewChild('createCmsRequestForm') createCmsRequestForm;
  @Input('SectionToShowMyCMS') SectionToShowMyCMS = { showGraph: true, showAction: true };

  user$: Observable<UserModel>;
  loggedInUser: UserModel;
  filterForm: FormGroup;
  defaultDateFrom: Date;
  defaultDateTo: Date;
  RequestID=null;
  StatusID=null;
  getVisitID:number;
  patientId:number;
  isSubmitted = false;
  selectedComplaint: any;
  rowIndex: number = 0;
  complaintDetailsList: any;
  getRemarksValue: any;
  getStatusValue: number;
  getCMSrequestID: any;
  complaintInitialList: any;
  cmsStatusList: any;
  filteredItems: any;
  filteredComplaintList: any[];
  advancedSearchEnabled=false;
  filtercomp:number = 26;
  screenIdentity='CMS'
  maxDate;
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  paginationforFb = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResultsForFb: [],
    paginatedSearchResultsForFb: []
  }

  getRemarksStatusForm: FormGroup;
  rmsComplaint: any = [];

  spinnerRefs = {
    recentComplaintRequesTable: 'recentComplaintRequesTable',
    TotalRequestCount: 'TotalRequestCount',
    recentComplaintRequesDetails: 'recentComplaintRequesDetails',
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
  //chart Data end

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  happyImg = CONSTANTS.USER_FEEDBACK_EMOJI.HAPPY;
  veryHappyImg = CONSTANTS.USER_FEEDBACK_EMOJI.VERRYHAPPY;
  SadImg = CONSTANTS.USER_FEEDBACK_EMOJI.SAD;
  verySadImg = CONSTANTS.USER_FEEDBACK_EMOJI.VERYSAD;
  normalImg = CONSTANTS.USER_FEEDBACK_EMOJI.NORMAL;

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  };

  constructor(
    private complaintDashboardService: ComplaintDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private getfeedback: FeedbackService,
    private sharedService: SharedService,
  ) {
    this.filterForm = this.formBuilder.group({
      dateFrom: [''],
      dateTo: [''],
      byContact: [''],
      byEmail: [''],
      byPIN: [''],
      reqNumber: [''],
    });

    this.getRemarksStatusForm = this.formBuilder.group({
      getRemarks: ['', Validators.required],
      PreventiveMeasure: ["", Validators.required],
      RootCause: ["", Validators.required],
      DirectCaseMeasure: ["", Validators.required],
      // assignedDepartmentId: [''],
      // assignedEmpName: [''],
      responsibleEmpName: [''],
      measuresTaken: [''],

      // cmsCategoryID: [''],
      // cmsSubCategory: [''],
    });

    this.maxDate=Conversions.getCurrentDateObject();
   
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // this.getDepartmentList();
    this.getEmployeesData();
    // this.getLocationList();
    this.GetCMSActionTakenMeasures();
    // this.getCMSrequestCountStats();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject()
      });
      // this.rowIndex=0
      this.getCMSrequestDeatil();
    }, 600);
    
  }
  labDeptDisable=false;
  selectComplaint(complaint: any) {
    this.selectedComplaint = complaint;
    this.getCMSrequestID = complaint.CMSRequestID;
    this.StatusID = complaint.CMSStatusID;
    this.complaintDetailsList = [];
    this.getVisitID = null;
    this.patientId = null;
    this.getCMSstatus();
    this.GetCMSActionTakenMeasures();
    this.getEmployeesData();
    this.getCMSrequestInquiry();
    this.getHistoryOfCMSContactBackTracking();
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.complaintDashboardService.getCMSRequest(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.complaintDetailsList = resp.PayLoad[0];
        this.patientId=this.complaintDetailsList.PatientID;
        this.getVisitID=this.complaintDetailsList.VisitId;
        if(this.StatusID==4){
          this.getRemarksStatusForm.get('getRemarks').disable();
          this.getRemarksStatusForm.get('measuresTaken').disable();
          this.getRemarksStatusForm.get('responsibleEmpName').disable();
          this.filteredItems = false;
          return;
        }
        else {
          this.getRemarksStatusForm.get('getRemarks').enable();
          this.getRemarksStatusForm.get('measuresTaken').enable();
          this.getRemarksStatusForm.get('responsibleEmpName').enable();
          this.filteredItems = this.cmsStatusList;
        }
      } else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
    this.getRemarksStatusForm.reset(); 
    setTimeout(() => {
      this.getResponsiblePerson();
      this.getMeasuresTakenData();
      // this.getRemarksStatusForm.patchValue({
      //   measuresTaken: this.MeasuresTakenLIST ? this.MeasuresTakenLIST.map(a => a.ActionTakenID):null,
      //   responsibleEmpName: this.responsiblePersonLIST ? this.responsiblePersonLIST.map(a => a.ResponsiblePersonUserID):null,
      // });
    }, 800);
  }

  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }

  setCMSRequestStatus(Status) {
    let formValues= this.getRemarksStatusForm.getRawValue();
    // let multpleUserIdsForAssign=formValues.assignedEmpName || null
    let multpleUserIdsForResponiblePerson=formValues.responsibleEmpName || null
    let meauresTaken=formValues.measuresTaken || null

    if(formValues.assignedEmpName){
      formValues.assignedEmpName = parseInt(formValues.assignedEmpName.substring(4));
    }
    if (this.getRemarksStatusForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted=true;
      return;
    }
    this.getStatusValue = Status;
    this.getRemarksValue = this.getRemarksStatusForm.get('getRemarks').value;
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
      CMSStatusID: this.getStatusValue,
      CMSStatusRemarks: this.getRemarksValue,
      CreatedBy: this.loggedInUser.userid,
      DepartmentID:  this.complaintDetailsList['DepartmentId'] || null,
      AsignedToBranchID: this.complaintDetailsList['AsignedToBranchID'] || null,
      FullName:this.complaintDetailsList['FullName'] || null,
      ComplainantName: this.complaintDetailsList["ComplainantName"] || null,
      PatientCLI:this.complaintDetailsList['PatientCLI'] || null,
      CellNo:this.complaintDetailsList['CellNo'] || null,
      CMSTypeID:this.complaintDetailsList['CMSTypeID'] || null,
      RequestSubject:this.complaintDetailsList['RequestSubject'] || null,
      RequestMessage:this.complaintDetailsList['RequestMessage'] || null,
      ReportedError:this.complaintDetailsList['ReportedError'] || null,
      PatientID:this.complaintDetailsList['PatientID'] || null,
      VisitID:this.complaintDetailsList['VisitId'] || null,
      CMSSourceID:this.complaintDetailsList['CMSRequestSourceID'] || null,
      RequestPriority:this.complaintDetailsList['RequestPriority'] || null,
      VisitedBranchID:this.complaintDetailsList['VisitedBranchID'] || null,
      PatientPortalUserID:this.complaintDetailsList['PatientPortalUserID'] || null,
      Email:this.complaintDetailsList['Email'] || null,
      LabDepID:this.complaintDetailsList['LabDepID'] || null,
      SubSectionID:null,
      SectionID: this.complaintDetailsList['SectionID'] || null,
      CMSCategoryID: this.complaintDetailsList['CMSCategoryID'] || null,
      CMSSubCategoryID: this.complaintDetailsList['CMSSubCategoryID'] || null,
      TPID: this.complaintDetailsList['TPID'] || null,
      tblCMSRequestAssigned: [{AssignedToUserID: null}],
      tblCMSResponsiblePerson: Array.isArray(multpleUserIdsForResponiblePerson)
        ? multpleUserIdsForResponiblePerson.map((ID) => ({ResponsiblePersonUserID: ID,})): 
        [{ ResponsiblePersonUserID: null }],
      tblCMSActionTaken: Array.isArray(meauresTaken)? meauresTaken.map((id) => ({ActionTakenID: id,})): 
      [{ ActionTakenID: null }],
      PreventiveMeasure: formValues.PreventiveMeasure|| '',
      RootCause: formValues.RootCause || '',
      DirectCaseMeasure:formValues.DirectCaseMeasure || '',      
    };
    console.log("Update CMS Request objParm_________",objParm);
    this.complaintDashboardService.updateCMSRequestStatus(objParm).subscribe((resp: any) => {
      console.log("🚀this.complaintDashboardService.updateCMSRequestStatus ~ resp:", resp)
      if (resp.StatusCode == 200) {
        this.toastr.success("Status Updated");
        this.getCMSrequestDeatil();
        this.isSubmitted=false;
        this.closeLoginModal();
      } else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
  }

  countList:any={};

   getCMSrequestCountStats() {
    this.countList=[];
    let formValues = this.filterForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;

    let objParm = {
      UserID: this.loggedInUser.userid,
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
    };
    console.log("🚀 ~ objParm:", objParm)
    this.spinner.show(this.spinnerRefs.TotalRequestCount);
    this.complaintDashboardService.getCMSrequestStats(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad) {
       this.spinner.hide(this.spinnerRefs.TotalRequestCount);
        this.countList = resp.PayLoad[0];
      } else {
        this.toastr.warning(resp.Message);
       this.spinner.hide(this.spinnerRefs.TotalRequestCount);
        return;
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.TotalRequestCount);
    });
  }
  getCMSstatus() {
    let param={
      isShowCMSAdmin: null, 
      isShowMyCMS:1,
    }
    this.complaintDashboardService.getCMSStatus(param).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.cmsStatusList = resp.PayLoad;
      } else {
        this.toastr.warning(resp.Message);
        return;
      }
    }, (err) => {
      console.log(err);
    });
  }    
filteredFeedBackList=[];

  getCMSrequestDeatil() {
    this.complaintInitialList=[];    
    let formValues = this.filterForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null;
    formValues.dateTo = formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null;
    let objParm = {
      DateFrom: formValues.dateFrom || null,
      DateTo: formValues.dateTo || null,
      CMSRequestID: formValues.reqNumber || null,
      UserID: this.loggedInUser.userid || null,
      CellNo:formValues.byContact || null,
      PatientCLI:formValues.byContact || null,
      VisitID:formValues.byPIN || null,
    };
    this.spinner.show(this.spinnerRefs.recentComplaintRequesTable);
    this.complaintDashboardService.getAssignedCMSrequest(objParm).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.recentComplaintRequesTable);
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.complaintInitialList = resp.PayLoad;
        // this.complaintInitialList=this.complaintInitialList.reverse();
        this.filteredComplaintList = this.complaintInitialList;
        this.getCMSrequestCountStats();
        setTimeout(() => {
          this.refreshPagination();
        }, 400);
      } else {
        this.toastr.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
      this.spinner.hide(this.spinnerRefs.recentComplaintRequesTable);
    });
  }

  refreshPagination() {

    if(this.complaintInitialList.length){
      this.pagination.filteredSearchResults = this.complaintInitialList;
      let dataToPaginate = this.pagination.filteredSearchResults;
      this.pagination.collectionSize = dataToPaginate.length;
      this.pagination.paginatedSearchResults = dataToPaginate
        .map((item, i) => ({ id: i + 1, ...item }))
        .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
    }
    } 

    cmsCategoryList=[];
    getCMScategoryData() {
      this.getfeedback.getCMScategory().subscribe((resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.cmsCategoryList = resp.PayLoad;
        }
        else {
          this.toastr.warning(resp.Message);
          return;
        }
      }, (err) => {
        console.log(err)
      });
    }
  
    cmsSubCategoryList:any;
    getCMSsubCategoryData() {
      let formValues=this.getRemarksStatusForm.getRawValue();
      let params={
        CMSCategoryID: formValues.cmsCategoryID,
      }
      this.getfeedback.getCMSsubCategory(params).subscribe((resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.cmsSubCategoryList = resp.PayLoad;
        }
      }, (err) => {
        console.log(err)
      });
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
    this.isSubmitted=false;
    this.spinner.show(this.spinnerRefs.recentComplaintRequesDetails);
    setTimeout(() => {
      this.appPopupService.openModal(this.showComplaintDataOnclick, {
        backdrop: "static",
        size: "fss",
      });
      this.spinner.hide(this.spinnerRefs.recentComplaintRequesDetails);

    }, 100);
    
  }
  openCreateCmsRequestFormPopUp(){
    setTimeout(() => {
      this.appPopupService.openModal(this.createCmsRequestForm, { backdrop: 'static', size: 'fss' });
    }, 100);
  }
  
  closeLoginModal() {
    this.modalService.dismissAll();
  }


  selectedChip: any = null; 
  selectChip(chip: any): void {
    this.selectedChip = chip;
  }
  employeesList = [];
  getEmployeesData() {
    this.employeesList = [];
    let formValues= this.getRemarksStatusForm.getRawValue();

    let objParam = {
      DepartmentId: formValues.DepartmentId || -1, 
      DesignationId: -1,
      locId: formValues.BranchID || -1,
    };
    this.lookupService.getEmployeeListByDepDesLocID(objParam).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoadDS) {
        let data = res.PayLoadDS.Table;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.employeesList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  departmentsList = [];
  getDepartmentList() {
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
  measuresTakenList = [];
  GetCMSActionTakenMeasures() {
    this.measuresTakenList = []
    this.lookupService.GetCMSActionTakenMeasures().subscribe((resp: any) => {
      this.measuresTakenList = resp.PayLoad;
    }, (err) => {
      console.log(err);
    })
  }
  branchList = [];
  getLocationList() {
    this.branchList = [];
    let _param = {};
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
        this.branchList=this.branchList.sort((a, b) => {
          if (a.Code  > b.Code ) {
            return 1;
          } else if (a.Code  < b.Code ) {
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

  getsubmitContactBackFormValue(event){
    // console.log("🚀 getsubmitContactBackFormValue ~ event:", event)
    this.contactBackFormValues= event;
  }
  contactBackFormValues
  submitContactBackRequest(){
    let formValues= this.contactBackFormValues;
     
    formValues.ContactBackDate = formValues.ContactBackDate ? Conversions.formatDateObject(formValues.ContactBackDate) : null;
    const contactBackDateTime = Conversions.mergeDateAndTime(formValues.ContactBackDate,formValues.ContactBackTime);

    let objParm = {
      ContactBackStatusID: formValues.contactBackStatus,
      ContactBackDateTime: contactBackDateTime,
      CMSRequestID: this.getCMSrequestID,
      CMSStatusID: this.StatusID,
      CreatedBy: this.loggedInUser.userid,
      ContactBackFindings: formValues.ContactBackFindings,
    // "ContactBackRemarks": formValues.ContactBackRemarks, 
    };
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_CMS_CONTACT_BACK_TRACK, objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad[0].RESULT===1) {
        this.toastr.success("Callback Tracking Successfully Updated");
      } else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
    })
  }
  responsiblePersonLIST: any;
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
            // console.log("🚀  this.responsiblePersonLIST:", this.responsiblePersonLIST
            // );
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  MeasuresTakenLIST: any;
  getMeasuresTakenData() {
    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.sharedService
      .getData(API_ROUTES.GET_MEASURES_TAKEN_DATA, objParm)
      .subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200 && resp.PayLoad) {
            this.MeasuresTakenLIST=resp.PayLoad
            this.MeasuresTakenLIST=this.MeasuresTakenLIST.filter(item => item.ActionTakenID !== null);
            this.MeasuresTakenLIST = this.MeasuresTakenLIST.filter((item, index) => {
              if (item.ActionTakenID) {
                const isFirstOccurrence = this.MeasuresTakenLIST.findIndex(
                  (prevItem, prevIndex) =>
                    prevItem.ActionTakenID === item.ActionTakenID && prevIndex < index
                ) === -1;
                return isFirstOccurrence;
              } 
            });
            // console.log("🚀 this.MeasuresTakenLIST:", this.MeasuresTakenLIST);
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
  refreshData(){
    this.getCMSrequestDeatil();
  }
  cmsInquiryList=[];
  getCMSrequestInquiry() {
    this.cmsInquiryList = [];

    let objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.complaintDashboardService.getCMSinquiryDetails(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.cmsInquiryList = resp.PayLoad;
        console.log("🚀this.complaintDashboardService.getCMSinquiryDetails ~ this.cmsInquiryList:", this.cmsInquiryList)
        // this.employeeID = this.cmsInquiryList[0].CreatedBy;
        this.patientId = this.cmsInquiryList[0].PatientID;
        // this.patientId = 65223152;
        setTimeout(() => {
        }, 500);
      } else {
        this.toastr.info('No Record Found');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');

    });

  }
  truncate(source, size) {
    return source && source.length > size
      ? source.slice(0, size - 1) + "…"
      : source;
  }
  contactBackHistory = [];
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
  
}
