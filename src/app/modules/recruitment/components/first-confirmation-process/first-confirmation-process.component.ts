// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; 
import { ActivatedRoute, Router} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { StorageService } from '../../../../shared/helpers/storage.service';

import { CONSTANTS } from '../../../shared/helpers/constants';
import { Conversions } from '../../../shared/helpers/conversions';
import { RecruitmentService } from '../../services/recruitment.service';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';


@Component({
  standalone: false,

  selector: 'app-first-confirmation-process',
  templateUrl: './first-confirmation-process.component.html',
  styleUrls: ['./first-confirmation-process.component.scss']
})
export class FirstConfirmationProcessComponent implements OnInit {

  @ViewChild('applicantDetail') applicantDetail;
  // @ViewChild('frmApplicantProcess') frmApplicantProcess;
  ApplicantList = [];
  fileName: string;
  spinnerRefs = {
    applicantListSection: 'applicantListSection',
    applicantDetailModal: 'applicantDetailModal'
  }

  formGetApplicant = this.fb.group({
    departmentIds: [],
    branchIds: [],
    JobStatus: ['']
  });

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> you want to confirm?', // 'Are you sure?',
    popoverMessage: '',
    // popoverTitle: 'Are you <b>sure</b> you want to submit?', // 'Are you sure?',
    // popoverMessage: 'Recommedation Confirmation !',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }
  InterviewDate:any;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  isSpinnerShortListed: boolean = true;//Hide Loader
  isSpinnerRejected: boolean = true;//Hide Loader
  isSpinnerConfirmed: boolean = true;//Hide Loader

  formUpdateStatus = this.fb.group({
    StatusRemarks: ['', Validators.compose([Validators.required])]
  });
  RemarksErrorMessage: string;
  ApplicantStatusList: any[];
  loggedInUser: UserModel;

  constructor(
    private route : ActivatedRoute,
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private cookieService : CookieService,
    private modalService : NgbModal,
    private helper : HelperService,
    private lookupService : LookupService,
    private fb : FormBuilder,
    private helperSrv : HelperService,
    private recruitment : RecruitmentService,
    // private storageService : StorageService,
    private router: Router,
    private appPopupService: AppPopupService,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getApplicantList();
    this.getApplicantStatus();
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getApplicantList(){
    this.spinner.show(this.spinnerRefs.applicantListSection);
    this.ApplicantList =[];
    let formValues = this.formGetApplicant.getRawValue();
    let objParm = {
      // LocID:  formValues.branchIds,
      // DepartmentID:  formValues.departmentIds,
      // JobStatusID:  formValues.JobStatus?formValues.JobStatus:null
      ApplicantStatusID:  4
    }
    this.recruitment.getApplicantList(objParm).subscribe((res:any)=>{
      let resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.ApplicantList = resSearchJob||[];
        // this.ApplicantList = this.ApplicantList.filter( a=> (a.ApplicantStatusID == 4));
        console.log('Applicants list: ',this.ApplicantList)
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      this.toastr.error('Connection error');
    })
    this.spinner.hide(this.spinnerRefs.applicantListSection);
  }

  showApplicantDetail(reqID:any){
    this.getApplicantDetailByID(reqID);
    this.appPopupService.openModal(this.applicantDetail);
  }

  JobApplicantID : any;
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
  getApplicantDetailByID(applicantID) {
    this.spinner.show(this.spinnerRefs.applicantDetailModal);
    this.JobApplicantID = applicantID;
    this.ApplicantDetailRow = []
    let paramObj = {
      JobApplicantID:this.JobApplicantID
    }
    
    this.recruitment.getApplicantDetailByID(paramObj).subscribe((resp: any) => {
      this.ApplicantDetailRow = resp.PayLoad[0];
      if(resp.PayLoad.length){ 
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
          this.InterviewDate = this.ApplicantDetailRow["InterviewDate"];
          this.CVFile = this.ApplicantDetailRow["CVFile"];
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
  getPdf(){
    let fileExt = ""
    fileExt = this.CVFile.substring( this.CVFile.indexOf("/")+1, this.CVFile.indexOf(";") );
    const source = this.CVFile;
    const link = document.createElement("a");
    // link.setAttribute('target', '_blank');
    // link.target = "_blank";
    // link.setAttribute('href', '#');
    link.href = source;

    link.download = this.FirstName+"."+fileExt;
    this.fileName = this.FirstName+"."+fileExt;
    link.click();

  }


  changeJobApplicantRequestStatus(statusID){
    let alertMessage = '';
    this.RemarksErrorMessage = 'Please Enter Remarks !';
    if(statusID==4){
      alertMessage = 'Applicant has been Shortlisted successfully';
    }else if(statusID==3){
      alertMessage = 'Applicant request has been Rejected';
    }else{
      alertMessage = 'Something went wrong';
    }
    this.loadingProcess('show',statusID);
     let formValues = this.formUpdateStatus.getRawValue();
     this.formUpdateStatus.markAllAsTouched();
    if(this.formUpdateStatus.valid) {
      let objParam = {
        CreatedBy: -1, //this.storageService.getLoggedInUserProfile().userid,
        tblJobApplicantStatus: [{
          "JobApplicantID": this.JobApplicantID,
          "ApplicantStatusID": statusID,
          "Remarks":formValues.StatusRemarks, 
          "InterviewDate":  null,
          "JoiningDate":null

        }]
       }
      this.recruitment.updateJobApplicantStatusWithRemarks(objParam).subscribe((data: any) => {
        let res =  JSON.parse(data.PayLoadStr);
        if (res && res.length) {
          if (data.StatusCode == 200) {
            this.toastr.success(alertMessage);
            this.loadingProcess('hide',statusID);
            this.getApplicantList();
            this.formUpdateStatus.reset();
            this.closeLoginModal();
            // this.clearForms();
          } else {
            this.toastr.error(data.Message)
            this.loadingProcess('hide',statusID);
            
          }
          this.loadingProcess('hide',statusID);
        }
      })
    } else{
      this.toastr.warning('Please provide remarks')
      this.loadingProcess('hide',statusID)
    }
  }

  getApplicantStatus(){
    this.ApplicantStatusList=[];
    this.recruitment.getApplicantStatus().subscribe((res: any) => {
      let resApplicanttStatus = res.PayLoad || [];
      resApplicanttStatus = resApplicanttStatus.filter( a=> (a.ApplicantStatusID == 3 || a.ApplicantStatusID == 5));
      if(resApplicanttStatus.length){
        this.ApplicantStatusList = resApplicanttStatus;
      }
    }, (err) => {
      console.log("Error loading JobStatuses",err);
    })
  }

  selectAllRequests(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.ApplicantList.forEach( a=> {
      a.checked = false;
      if(a.JobRequestID > 0) {
        a.checked = e.target.checked;
      }
    })
  }


  applicantProcess(){
    let interviewDate  = (this.InterviewDate)?Conversions.formatDateObject(this.InterviewDate):null;
    this.loadingProcess('show',0);
    this.spinner.show(this.spinnerRefs.applicantListSection); 
    let jobListChecked = this.ApplicantList.filter( a=> a.checked);
    let isValidStatus = true;
    let isValidRemarks = true;
    jobListChecked.forEach(a => {
      if(!a.JobRemarksSelected) {
        isValidRemarks = false;
      }
    })
    jobListChecked.forEach(a => {;
      if(!a.JobStatusIDSelected) {
        isValidStatus = false;
      }
    })
    if(!isValidStatus || !isValidRemarks) {
      this.toastr.warning('Please fill mandatory fields against selected records');
      this.loadingProcess('hide',0);
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      return;
    } else {
      // console.warn('applicant fiter list is: ',jobListChecked)
      if(jobListChecked.length){
        let objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          tblJobApplicantStatus: jobListChecked.map( a => {
            return {
              JobApplicantID: a.JobApplicantID, 
              ApplicantStatusID: a.ApplicantStatusID, 
              Remarks: a.JobApplicantRemarks, 
              InterviewDate:  null, //(a.ApplicantStatusID==5 && interviewDate!=null)?interviewDate:null
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
            this.loadingProcess('hide',0);
            this.spinner.hide(this.spinnerRefs.applicantListSection);
          }
        }, (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.applicantListSection);
          this.toastr.error('Connection error');
        })
      }else{
        this.toastr.warning('Please select an applicant first');
        this.loadingProcess('hide',0);
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }
  }

  loadingProcess(Input,btn) { 
    if (Input == "show") {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      // this.isSpinner = false; // Show Spinner on submit button click
      if(btn==4){
        this.isSpinnerShortListed = false
      }else if(btn==3){
        this.isSpinnerRejected = false
      }else if(btn==4){
        this.isSpinnerRejected = false
      }else if(btn==5){
        this.isSpinnerConfirmed = false
      }
      else if(btn==0){
        this.isSpinner = false;
      }
      
    }
    else if (Input == "hide") {
      this.disabledButton = false; // Unlock the Button after response
      // this.isSpinner = true; // Hide Spinner after response    
      if(btn==4){
        this.isSpinnerShortListed = true
      }else if(btn==3){
        this.isSpinnerRejected = true
      }else if(btn==5){
        this.isSpinnerConfirmed = true
      }else if(btn==0){
        this.isSpinner = true
      }
    }
  }

}
