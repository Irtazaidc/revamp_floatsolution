// @ts-nocheck
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastRef, ToastrService } from 'ngx-toastr';
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
  selector: 'app-applicant-list',
  templateUrl: './applicant-list.component.html',
  styleUrls: ['./applicant-list.component.scss']
})
export class ApplicantListComponent implements OnInit {
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
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  isSpinnerShortListed = true;//Hide Loader
  isSpinnerRejected = true;//Hide Loader

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
  ApplicantAddress = "";
  CVFile = "";
  searchText='';
  constructor(
    private route: ActivatedRoute,
    @Inject(ToastrService) private toastr: any,
    @Inject(NgxSpinnerService) private spinner: any,
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
      InterviewDate: ['', Validators.compose([Validators.required])],
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
      const _response = resp.PayLoad;
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
    const objParm = {
      JobStatusID: 5
    }
  
    this.recruitment.getOpenJobRequestsByJobStatus(objParm).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.OpenJobsList = [];
      const newArr = [];
      resSearchJob.forEach(a => {
          const _obj = JSON.parse(JSON.stringify(a));
          const alreadyAddedIndex = newArr.findIndex(b => b.JobRequestID == a.JobRequestID);
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
    const formValues = this.formSearchJob.getRawValue();
    const objParm = {
      JobRequestID: null,
      ApplicantStatusID: null,
    }
    this.recruitment.getApplicantList(objParm).subscribe((res: any) => {
      const resSearchJob = res.PayLoad;
      if (res.StatusCode == 200) {
        this.ApplicantList = resSearchJob || [];
        this.ApplicantList = this.ApplicantList.filter( a=> (a.ApplicantStatusID == 1));
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
    const formValues = this.formSearchJob.getRawValue();
    const objParam = {
      JobRequestID: formValues.JobRequestID ? formValues.JobRequestID : null,
      ApplicantStatusID: formValues.ApplicantStatusID ? formValues.ApplicantStatusID : null
    }
    console.log('form object is:', objParam)
    this.recruitment.getApplicantList(objParam).subscribe((res: any) => {
      const resSearchJob = res.PayLoad;
      if (res.StatusCode == 200) {
        this.ApplicantList = resSearchJob || [];
        this.ApplicantList = this.ApplicantList.filter( a=> (a.ApplicantStatusID == 1));
        // console.log('Applicant list is: ',this.ApplicantList)
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      this.toastr.error('Connection error');
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
    const paramObj = {
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
        this.ApplicantAddress = this.ApplicantDetailRow["ApplicantAddress"];
        this.CVFile = this.ApplicantDetailRow["CVFile"];
        // this.CVFile = this.CVFile.replace('data:application/pdf;base64,','');
        // console.warn('cv after is: ',this.CVFile)
      }
      this.spinner.hide(this.spinnerRefs.applicantDetailModal);
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.applicantDetailModal);
      this.toastr.error('Connection error');
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
    }else if (statusID == 12) {
      alertMessage = 'Applicant request has Finalized for confirmation';
    } else {
      alertMessage = 'Something went wrong';
    }
    this.loadingProcess('show', statusID);
    const formValues = this.formUpdateStatus.getRawValue();
    this.formUpdateStatus.markAllAsTouched();
    if (this.formUpdateStatus.valid) {
      const objParam = {
        CreatedBy: this.loggedInUser.userid || -99,
        tblJobApplicantStatus: [{
          "JobApplicantID": this.JobApplicantID,
          "ApplicantStatusID": statusID,
          "Remarks": formValues.StatusRemarks,
          "InterviewDate":  (formValues.InterviewDate)?Conversions.formatDateObject(formValues.InterviewDate):null,
          "JoiningDate":null
        }]
      }
      this.recruitment.updateJobApplicantStatusWithRemarks(objParam).subscribe((data: any) => {
        const res = JSON.parse(data.PayLoadStr);
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
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.applicantListSection);
        this.toastr.error('Connection error');
      })
    } else {
      this.toastr.warning('Please provide required information')
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


  applicantProcess(isFinalize:boolean) {
    const interviewDate  = (this.InterviewDate)?Conversions.formatDateObject(this.InterviewDate):null;

    if(interviewDate !=null){
      this.loadingProcess('show', 0);
    this.spinner.show(this.spinnerRefs.applicantListSection);
    const jobListChecked = this.ApplicantList.filter(a => a.checked);
    // console.warn('applicant fiter list is: ',jobListChecked)
    let isValidStatus = true;
    let isValidRemarks = true;
    jobListChecked.forEach(a => {
      if (!a.JobRemarksSelected  && !isFinalize) {
        isValidRemarks = false;
      }
    })
    jobListChecked.forEach(a => {
      if (!a.JobStatusIDSelected) {
        isValidStatus = false;
      }
    })
    if (!isValidStatus || !isValidRemarks || interviewDate==null) {
      this.toastr.warning('Please fill mandatory fields against selected records');
      this.loadingProcess('hide', 0);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      return;
    } else {
      if (jobListChecked.length) {
        const objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          tblJobApplicantStatus: jobListChecked.map(a => {
            return {
              JobApplicantID: a.JobApplicantID,
              ApplicantStatusID: isFinalize?12:a.JobStatusIDSelected,
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
        }, (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.applicantListSection);
          this.toastr.error('Connection error');
        })
      } else {
        this.toastr.warning('Please select applicant/s first');
        this.loadingProcess('hide', 0);
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }
    }else{
      this.toastr.error('Please select Interview Date');
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
