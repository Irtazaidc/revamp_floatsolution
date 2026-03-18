// @ts-nocheck
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { CONSTANTS } from '../../../shared/helpers/constants';
import { Conversions } from '../../../shared/helpers/conversions';
import { RecruitmentService } from '../../services/recruitment.service';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { getLocaleDateTimeFormat } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-applicant-list-all',
  templateUrl: './applicant-list-all.component.html',
  styleUrls: ['./applicant-list-all.component.scss']
})
export class ApplicantListAllComponent implements OnInit {

  @ViewChild('applicantDetail') applicantDetail;
  @ViewChild('applicantDocument') applicantDocument;
  // @ViewChild('frmApplicantProcess') frmApplicantProcess;
  ApplicantList = [];
  InterviewDate:any;
  fileName: string;
  spinnerRefs = {
    applicantListSection: 'applicantListSection',
    applicantDetailModal: 'applicantDetailModal'
  }

  formGetApplicant: FormGroup;

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> you want to proceed?', // 'Are you sure?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  loggedInUser: UserModel;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  isSpinnerShortListed: boolean = true;//Hide Loader
  isSpinnerRejected: boolean = true;//Hide Loader

  formUpdateStatus: FormGroup;
  RemarksErrorMessage: string;
  ApplicantStatusList: any[];
  ApplicantStatusDropdown: any[];
  branchesList = [];
  departmentsList = [];
  jobStatusList = [];
  OpenJobsList: any[];

  JobApplicantID: any;
  ApplicantDetailRow = [];
  JobTitle = "";
  JobRequestCode = "";
  FirstName = "";
  LastName = "";
  CNIC = "";
  Cell = "";
  EMail = "";
  ApplicantStatus = "";
  InterviewLevel = 3;
  ApplicantAddress = "";
  CVFile = "";
  searchText='';
  LocationTitle='';
  ApplicantCityName='';
  JobCityID='';
  ApplicantCityID='';
  IsWillingOutside=0;
  IsShowWilling:boolean=false;
  WillingLableText="";
  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(CookieService) private cookieService: any,
    private modalService: NgbModal,
    private helper: HelperService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private helperSrv: HelperService,
    private recruitment: RecruitmentService,
    // private storageService : StorageService,
    private router: Router,
    private appPopupService: AppPopupService,
    private auth: AuthService
  ) {
    this.formGetApplicant = this.fb.group({
      departmentIds: [],
      branchIds: [],
      JobStatus: [''],
    });

    this.formUpdateStatus = this.fb.group({
      StatusRemarks: ['', Validators.compose([Validators.required])],
    });

    this.formSearchJob = this.fb.group({
      JobRequestID: [],
      ApplicantStatusID: [''],
    });
  }

  formSearchJob: FormGroup;

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getApplicantList();
    this.getApplicantStatus();
    this.getBranches();
    this.getDepartment();
    this.getJobStatus();
    // this.getOpenJobsList();
    this.getOpenJobRequestByJobStatus();
  }
  searchJobRequest() {

  }
  getBranches() {
    this.branchesList = [];
    this.lookupService.GetBranches().subscribe((resp: any) => {
      let _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
    }, (err) => {
      // this.spinner.hide('GetBranches');
    })
  }
  getDepartment() {
    this.departmentsList = []
    this.lookupService.GetDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad || [];
      if (!this.departmentsList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getJobStatus() {
    this.jobStatusList = []
    this.recruitment.getJobStatus().subscribe((resp: any) => {
      this.jobStatusList = resp.PayLoad || [];
      console.log('job status list is: ', this.jobStatusList)
      // this.jobStatusList = this.jobStatusList.filter( a=> (a.JobStatusID == 1 && a.JobStatusID == 3));
      if (!this.jobStatusList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  // getOpenJobsList() {
  //   this.OpenJobsList = [];
  //   let objParm = {
  //     // LocID:  formValues.branchIds,
  //     // DepartmentID:  formValues.departmentIds,
  //     // JobStatusID:  formValues.JobStatus?formValues.JobStatus:null
  //   }
  //   this.recruitment.getOpenJobsList(objParm).subscribe((res: any) => {
  //     let resSearchJob = res.PayLoad;
  //     if (res.StatusCode == 200) {
  //       this.OpenJobsList = resSearchJob.map(a => ({ JobRequestID: a.JobRequestID, JobRequestCode: a.JobRequestCode, FullName: '[' + a.JobRequestCode + '] ' + a.JobTitle })) || [];
  //       console.warn('job are: ', this.OpenJobsList)
  //     }
  //   }, (err) => {
  //     console.log("loading search result error", err);
  //   })
  // }

  getOpenJobRequestByJobStatus(){
    this.OpenJobsList =[];
    let objParm = {
      JobStatusID: 5
    }
  
    this.recruitment.getOpenJobRequestsByJobStatus(objParm).subscribe((res:any)=>{
      let resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.OpenJobsList = [];
      let newArr = [];
      resSearchJob.forEach(a => {
          let _obj = JSON.parse(JSON.stringify(a));
          let alreadyAddedIndex = newArr.findIndex(b => b.JobRequestID == a.JobRequestID);
          if(alreadyAddedIndex > -1) {
              newArr[alreadyAddedIndex].empIds.push(_obj.InterviewerID);
          } else {
              _obj.empIds = [_obj.InterviewerID];
              newArr.push(_obj);
          }
          this.OpenJobsList = newArr;
          this.OpenJobsList =  resSearchJob.map(a => ({JobRequestID:a.JobRequestID, JobRequestCode:a.JobRequestCode, FullName: '['+a.JobRequestCode+'] '+a.JobTitle })) ||[];
          
      })
      }
    },(err) => {
      console.log("loading search result error", err);
    })
  }


  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getApplicantList() {
    this.spinner.show(this.spinnerRefs.applicantListSection);
    this.ApplicantList = [];
    let formValues = this.formSearchJob.getRawValue();
    let objParm = {
      JobRequestID: null,
      ApplicantStatusID: null,
    }
    this.recruitment.getApplicantList(objParm).subscribe((res: any) => {
      let resSearchJob = res.PayLoad;
      if (res.StatusCode == 200) {
        this.ApplicantList = resSearchJob || [];
        // this.ApplicantList = this.ApplicantList.filter( a=> (a.ApplicantStatusID == 1));
        // console.log('Applicant list is: ',this.ApplicantList)
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      this.toastr.error('Connection error');
    })

  }

  searchApplicantList() {
    this.spinner.show(this.spinnerRefs.applicantListSection);
    this.ApplicantList = [];
    let formValues = this.formSearchJob.getRawValue();
    let objParam = {
      JobRequestID: formValues.JobRequestID ? formValues.JobRequestID : null,
      ApplicantStatusID: formValues.ApplicantStatusID ? formValues.ApplicantStatusID : null
    }
    console.log('form object is:', objParam)
    this.recruitment.getApplicantList(objParam).subscribe((res: any) => {
      let resSearchJob = res.PayLoad;
      if (res.StatusCode == 200) {
        this.ApplicantList = resSearchJob || [];
        // this.ApplicantList = this.ApplicantList.filter( a=> (a.ApplicantStatusID == 1));
        // console.log('Applicant list is: ',this.ApplicantList)
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }, (err) => {
      console.log("loading search result error", err);
    })

  }

  showApplicantDetail(reqID: any) {
    this.getApplicantDetailByID(reqID);
    this.appPopupService.openModal(this.applicantDetail);
  }
  showApplicantDocument() {
    this.appPopupService.openModal(this.applicantDocument);
  }

  
  getApplicantDetailByID(applicantID) {
    this.spinner.show(this.spinnerRefs.applicantDetailModal);
    this.JobApplicantID = applicantID;
    this.ApplicantDetailRow = []
    let paramObj = {
      JobApplicantID: this.JobApplicantID
    }

    this.recruitment.getApplicantDetailByID(paramObj).subscribe((resp: any) => {
      this.ApplicantDetailRow = resp.PayLoad[0];
      console.warn('Existing row is: ', this.ApplicantDetailRow);
      if (resp.PayLoad.length) {
        this.JobRequestCode = this.ApplicantDetailRow["JobRequestCode"];
        this.JobTitle = this.ApplicantDetailRow["JobTitle"];
        this.FirstName = this.ApplicantDetailRow["FirstName"];
        this.LastName = this.ApplicantDetailRow["LastName"];
        this.CNIC = this.ApplicantDetailRow["CNIC"];
        this.Cell = this.ApplicantDetailRow["Cell"];
        this.EMail = this.ApplicantDetailRow["EMail"];
        this.ApplicantStatus = this.ApplicantDetailRow["ApplicantStatus"];
        this.InterviewLevel = this.ApplicantDetailRow["InterviewLevel"];
        this.ApplicantAddress = this.ApplicantDetailRow["ApplicantAddress"];
        this.CVFile = this.ApplicantDetailRow["CVFile"];
        this.LocationTitle = this.ApplicantDetailRow["LocationTitle"];
        this.ApplicantCityName = this.ApplicantDetailRow["ApplicantCityName"];
        this.JobCityID = this.ApplicantDetailRow["JobCityID"];
        this.ApplicantCityID = this.ApplicantDetailRow["ApplicantCityID"];
        this.IsWillingOutside = this.ApplicantDetailRow["isWillingOutside"];
        this.WillingLableText  = (this.IsWillingOutside==1)?'Yes':'No';
        if((this.ApplicantCityID&&this.JobCityID ) && this.ApplicantCityID!=this.JobCityID){
          this.IsShowWilling=true;
        }else{
          this.IsShowWilling=false;
        }
        // this.CVFile = this.CVFile.replace('data:application/pdf;base64,','');
        // console.warn('cv after is: ',this.CVFile)
      }
     
      this.spinner.hide(this.spinnerRefs.applicantDetailModal);
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.applicantDetailModal);
    })
  }
  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }
  closeLoginModalDoc() {
    this.modalService.dismissAll();
  }
  getPdf() {
    let fileExt = ""
    fileExt = this.CVFile.substring(this.CVFile.indexOf("/") + 1, this.CVFile.indexOf(";"));
    console.log('file ext: ',)
    const source = this.CVFile;
    const link = document.createElement("a");
    // link.setAttribute('target', '_blank');
    // link.target = "_blank";
    // link.setAttribute('href', '#');
    link.href = source;
    // link.download = this.FirstName+"."+fileExt;
    // this.fileName = this.FirstName+"."+fileExt;

    link.download = this.FirstName
    //  this.fileName = this.FirstName+"."+fileExt;
    link.click();

  }

  changeJobApplicantRequestStatus(statusID) {
    let alertMessage = '';
    this.RemarksErrorMessage = 'Please Enter Remarks !';
    if (statusID == 4) {
      alertMessage = 'Applicant has been Shortlisted successfully';
    } else if (statusID == 3) {
      alertMessage = 'Applicant request has been Rejected';
    } else {
      alertMessage = 'Something went wrong';
    }
    this.loadingProcess('show', statusID);
    let formValues = this.formUpdateStatus.getRawValue();
    this.formUpdateStatus.markAllAsTouched();
    if (this.formUpdateStatus.valid) {
      let objParam = {
        CreatedBy: this.loggedInUser.userid || -99,
        tblJobApplicantStatus: [{
          "JobApplicantID": this.JobApplicantID,
          "ApplicantStatusID": statusID,
          "Remarks": formValues.StatusRemarks,
          "InterviewDate": null,
          "JoiningDate":null
        }]
      }
      console.log('Action data is: ', objParam);
      this.recruitment.updateJobApplicantStatusWithRemarks(objParam).subscribe((data: any) => {
        let res = JSON.parse(data.PayLoadStr);
        if (res && res.length) {
          if (data.StatusCode == 200) {
            this.toastr.success(alertMessage);
            this.loadingProcess('hide', statusID);
            this.getApplicantList();
            this.formUpdateStatus.reset();
            this.closeLoginModal();
            // this.clearForms();
          } else {
            this.toastr.error(data.Message)
            this.loadingProcess('hide', statusID);

          }
          this.loadingProcess('hide', statusID);
        }
      })
    } else {
      this.toastr.warning('Please provide remarks')
      this.loadingProcess('hide', statusID)
    }
  }

  getApplicantStatus() {
    this.ApplicantStatusList = [];
    this.ApplicantStatusDropdown = [];
    this.recruitment.getApplicantStatus().subscribe((res: any) => {
      let resApplicanttStatus = res.PayLoad || [];
      this.ApplicantStatusDropdown = resApplicanttStatus;
      resApplicanttStatus = resApplicanttStatus.filter(a => (a.ApplicantStatusID == 3 || a.ApplicantStatusID == 4));
      if (resApplicanttStatus.length) {
        this.ApplicantStatusList = resApplicanttStatus;
      }
    }, (err) => {
      console.log("Error loading JobStatuses", err);
    })
  }

  selectAllRequests(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.ApplicantList.forEach(a => {
      a.checked = false;
      if (a.JobRequestID > 0) {
        a.checked = e.target.checked;
      }
    })
  }


  applicantProcess() {
    let interviewDate  = (this.InterviewDate)?Conversions.formatDateObject(this.InterviewDate):null;
    this.loadingProcess('show', 0);
    this.spinner.show(this.spinnerRefs.applicantListSection);
    let jobListChecked = this.ApplicantList.filter(a => a.checked);
    // console.warn('applicant fiter list is: ',jobListChecked)
    let isValidStatus = true;
    let isValidRemarks = true;
    jobListChecked.forEach(a => {
      if (!a.JobRemarksSelected) {
        isValidRemarks = false;
      }
    })
    jobListChecked.forEach(a => {
      ;
      if (!a.JobStatusIDSelected) {
        isValidStatus = false;
      }
    })
    if (!isValidStatus || !isValidRemarks) {
      this.toastr.warning('Please fill mandatory fields against selected records');
      this.loadingProcess('hide', 0);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      return;
    } else {
      if (jobListChecked.length) {
        let objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          tblJobApplicantStatus: jobListChecked.map(a => {
            return {
              JobApplicantID: a.JobApplicantID,
              ApplicantStatusID: a.JobStatusIDSelected,
              Remarks: a.JobApplicantRemarks,
              InterviewDate: (a.JobStatusIDSelected==4 && interviewDate!=null)?interviewDate:null,
              JoiningDate:null

            }
          })
        }
        
        // console.warn('obj param is: ',objParam); return;
        this.recruitment.updateJobApplicantStatusWithRemarks(objParam).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.toastr.success('Applicant Request has been processed successfully');
              this.getApplicantList()
            } else {
              this.toastr.error(data.Message)
            }
            this.loadingProcess('hide', 0);
            this.spinner.hide(this.spinnerRefs.applicantListSection);
          }
        })
      } else {
        this.toastr.warning('Please select applicant/s first');
        this.loadingProcess('hide', 0);
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }
  }

  loadingProcess(Input, btn) {
    if (Input == "show") {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      // this.isSpinner = false; // Show Spinner on submit button click
      if (btn == 4) {
        this.isSpinnerShortListed = false
      } else if (btn == 3) {
        this.isSpinnerRejected = false
      } else if (btn == 0) {
        this.isSpinner = false;
      }

    }
    else if (Input == "hide") {
      this.disabledButton = false; // Unlock the Button after response
      // this.isSpinner = true; // Hide Spinner after response    
      if (btn == 4) {
        this.isSpinnerShortListed = true
      } else if (btn == 3) {
        this.isSpinnerRejected = true
      } else if (btn == 0) {
        this.isSpinner = true
      }
    }
  }

}
