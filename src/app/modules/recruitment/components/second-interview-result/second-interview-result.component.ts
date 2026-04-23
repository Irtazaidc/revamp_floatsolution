// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecruitmentService } from '../../services/recruitment.service';
import { AppPopupService } from '../../../shared/helpers/app-popup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { Conversions } from '../../../shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-second-interview-result',
  templateUrl: './second-interview-result.component.html',
  styleUrls: ['./second-interview-result.component.scss']
})
export class SecondInterviewResultComponent implements OnInit {

  @ViewChild('applicantDetail') applicantDetail;
  OpenJobsList = [];
  ApplicantResult = [];
  fileName: string;
  spinnerRefs = {
    applicantListSection: 'applicantListSection',
    applicantDetailModal: 'applicantDetailModal'
  }


  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> you want to confirm?', // 'Are you sure?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }

  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  isSpinnerShortListed = true;//Hide Loader
  isSpinnerFinalized = true;//Hide Loader
  isSpinnerRejected = true;//Hide Loader
  isSpinnerConfirmed = true;//Hide Loader

  formUpdateStatus = this.fb.group({
    StatusRemarks: ['', Validators.compose([Validators.required])],
    InterviewDate: [null],
  });
  RemarksErrorMessage: string;
  ApplicantStatusList: any[];
  loggedInUser: UserModel;
  InterviewDate:any;

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
  isInterviewDateRequired=true;
  constructor(
    private route : ActivatedRoute,
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private modalService : NgbModal,
    private fb : FormBuilder,
    private recruitment : RecruitmentService,
    private router: Router,
    private appPopupService: AppPopupService,
    private auth: AuthService,
  ) { }
  formSearch = this.fb.group({
    JobRequestID: [],
  });
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getOpenJobRequestByJobStatus();
    this.getJobApplicantResult()
    this.getApplicantStatus();
  }
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

  getJobApplicantResult(){
    this.spinner.show(this.spinnerRefs.applicantListSection);
    this.ApplicantResult =[];
    const objParm = {
      JobRequestID:  null,
    }
    this.recruitment.getJobApplicantResult(objParm).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.ApplicantResult = resSearchJob||[];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      this.toastr.error('Connection error');
    })
    this.spinner.hide(this.spinnerRefs.applicantListSection);
  }

  getJobApplicantResultByJobRequestID(){
    const formValues = this.formSearch.getRawValue();
    this.spinner.show(this.spinnerRefs.applicantListSection);
    this.ApplicantResult =[];
    const objParm = {
      JobRequestID:  formValues.JobRequestID?formValues.JobRequestID:null,
      ApplicantStatusID:  8,
    }
    this.recruitment.getJobApplicantResult(objParm).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.ApplicantResult = resSearchJob||[];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      this.toastr.error('Connection error');
    })
    this.spinner.hide(this.spinnerRefs.applicantListSection);
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  showApplicantDetail(reqID:any){
    this.getApplicantDetailByID(reqID);
    this.appPopupService.openModal(this.applicantDetail);
  }

  
  getApplicantDetailByID(applicantID) {
    this.spinner.show(this.spinnerRefs.applicantDetailModal);
    this.JobApplicantID = applicantID;
    this.ApplicantDetailRow = []
    const paramObj = {
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
          this.CVFile = this.ApplicantDetailRow["CVFile"];
          if(this.InterviewLevel==2){
            this.isInterviewDateRequired=false;
          }else{
            this.isInterviewDateRequired=true;
          }
         
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
    link.href = source;
    link.download = this.FirstName+"."+fileExt;
    this.fileName = this.FirstName+"."+fileExt;
    link.click();

  }

  changeJobApplicantRequestStatus(statusID) {
    let alertMessage = '';
    this.RemarksErrorMessage = 'Please Enter Remarks !';
    if (statusID == 9) {
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
          "InterviewDate": (formValues.InterviewDate)?Conversions.formatDateObject(formValues.InterviewDate):null,
          "JoiningDate":null
        }]
      }
      console.log('Action data is: ', objParam);
      this.recruitment.updateJobApplicantStatusWithRemarks(objParam).subscribe((data: any) => {
        const res = JSON.parse(data.PayLoadStr);
        if (res && res.length) {
          if (data.StatusCode == 200) {
            this.toastr.success(alertMessage);
            this.loadingProcess('hide', statusID);
            this.getJobApplicantResult();
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
      this.toastr.warning('Please provide required information')
      this.loadingProcess('hide', statusID)
    }
  }

  applicantProcess(isFinalize:boolean) {
    const interviewDate  = (this.InterviewDate)?Conversions.formatDateObject(this.InterviewDate):null;
    this.loadingProcess('show', 0);
    this.spinner.show(this.spinnerRefs.applicantListSection);
    const jobListChecked = this.ApplicantResult.filter(a => a.checked);
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
      if (!a.JobStatusIDSelected && !isFinalize) {
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
        const objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          tblJobApplicantStatus: jobListChecked.map(a => {
            return {
              JobApplicantID: a.ApplicantID,
              ApplicantStatusID: isFinalize? 12:a.JobStatusIDSelected,
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
              this.getJobApplicantResult()
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
  }



 
  loadingProcess(Input,btn) { 
    if (Input == "show") {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      // this.isSpinner = false; // Show Spinner on submit button click
      if(btn==9){
        this.isSpinnerShortListed = false
      }else if(btn==3){
        this.isSpinnerRejected = false
      }else if(btn==12){
        this.isSpinnerFinalized = false;
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
      if(btn==9){
        this.isSpinnerShortListed = true
      }else if(btn==12){
        this.isSpinnerFinalized = true
      }else if(btn==3){
        this.isSpinnerRejected = true
      }else if(btn==5){
        this.isSpinnerConfirmed = true
      }else if(btn==0){
        this.isSpinner = true
      }
    }
  }
  getApplicantStatus() {
    this.ApplicantStatusList = [];
    // this.ApplicantStatusDropdown = [];
    this.recruitment.getApplicantStatus().subscribe((res: any) => {
      let resApplicanttStatus = res.PayLoad || [];
      // this.ApplicantStatusDropdown = resApplicanttStatus;
      resApplicanttStatus = resApplicanttStatus.filter(a => (a.ApplicantStatusID == 3 || a.ApplicantStatusID == 9 || a.ApplicantStatusID == 12));
      this.ApplicantStatusList = resApplicanttStatus;
      if (resApplicanttStatus.length) {
        this.ApplicantStatusList = resApplicanttStatus||[];
      }
    }, (err) => {
      console.log("Error loading JobStatuses", err);
    })
  }

  selectAllRequests(e) {
    this.ApplicantResult.forEach(a => {
      a.checked = false;
      if (a.JobRequestID > 0) {
        a.checked = e.target.checked;
      }
    })
  }

}
