// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; 
import { ActivatedRoute, Router} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';;
import { CONSTANTS } from '../../../shared/helpers/constants';
import { Conversions } from '../../../shared/helpers/conversions';
import { RecruitmentService } from '../../services/recruitment.service';
import { AppPopupService } from '../../../shared/helpers/app-popup.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-second-interview-process',
  templateUrl: './second-interview-process.component.html',
  styleUrls: ['./second-interview-process.component.scss']
})
export class SecondInterviewProcessComponent implements OnInit {

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

  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  formProcessInterview = this.fb.group({
    Remarks: ['', Validators.compose([Validators.required,Validators.minLength(50)])],
    Weightage: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])],
    ExpectedSalary: ['', Validators.compose([Validators.required])],
    RecommendedSalary: ['', Validators.compose([Validators.required])],
  });
  RemarksErrorMessage: string;
  ApplicantStatusList: any[];
  loggedInUser: UserModel;
  OpenJobsList = [];
  constructor(
    private route : ActivatedRoute,
    private toastr : ToastrService,
    private spinner : NgxSpinnerService,
    private cookieService : CookieService,
    private modalService : NgbModal,
    private helper : HelperService,
    private fb : FormBuilder,
    private helperSrv : HelperService,
    private recruitment : RecruitmentService,
    private router: Router,
    private appPopupService: AppPopupService,
    private auth: AuthService,
  ) { }
  formSearchJob = this.fb.group({
    JobRequestID: [],
  });

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getOpenJobRequestByJobStatus();
    // this.getApplicantListForInterview();
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
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

  getApplicantListByInterviewerID(){
    this.spinner.show(this.spinnerRefs.applicantListSection);  
    this.ApplicantList =[];
    const formValues = this.formSearchJob.getRawValue();
    const objParam = {
      JobRequestID:  formValues.JobRequestID,
      InterviewerUserID: this.loggedInUser.userid, //1076 //Hasssan UserID his userid is:688 //
      InterviewerStage:2,
      ApplicantStatus:7,
    }
    
    this.recruitment.getApplicantListByInterviewerID(objParam).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.ApplicantList = resSearchJob||[];
        this.spinner.hide(this.spinnerRefs.applicantListSection);
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.applicantListSection);
      this.toastr.error('Connection error');
    })
    
  }
 

  showApplicantDetail(JobApplicantID:any,JobRequestID:any){
    this.getApplicantDetailByID(JobApplicantID,JobRequestID);
    this.appPopupService.openModal(this.applicantDetail);
  }

  JobApplicantID : any;
  JobRequestID : any;
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
  getApplicantDetailByID(JobApplicantID,JobRequestID) {
    this.spinner.show(this.spinnerRefs.applicantDetailModal);
    this.JobApplicantID = JobApplicantID;
    this.JobRequestID = JobRequestID;
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
  processInterview(){
    this.loadingProcess('show'); 
     const formValues = this.formProcessInterview.getRawValue();
     this.formProcessInterview.markAllAsTouched();
    if(this.formProcessInterview.valid) {
      const formData = {
        JobRequestID : this.JobRequestID,
        InterviewerID : this.loggedInUser.userid,
        ApplicantID : this.JobApplicantID,
        Weightage : formValues.Weightage,
        ExpectedSalary : formValues.ExpectedSalary,
        RecommendedSalary : formValues.RecommendedSalary,
        Remarks : formValues.Remarks,
        ApplicantStatusID : 8,
        CreatedBy : this.loggedInUser.userid || -99,
      };
      this.recruitment.insertUpdateApplicantInterviewersRecomm(formData).subscribe((data: any) => {
        const res =  JSON.parse(data.PayLoadStr);
        if (res && res.length) {
          if (data.StatusCode == 200) {
            // this.toastr.success(data.Message);
            this.toastr.success('Interview has been processed successfully');
            this.getApplicantListByInterviewerID();
            this.loadingProcess('hide');
            // this.getApplicantList();
            this.formProcessInterview.reset();
            this.closeLoginModal();
            // this.clearForms();
          } else {
            this.toastr.error(data.Message)
            this.loadingProcess('hide');
            
          }
          this.loadingProcess('hide');
        }
      })
    } else{
      this.toastr.warning('Please provide remarks')
      this.loadingProcess('hide')
    }
  }



 
  loadingProcess(Input) { 
    if (Input == "show") {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinner = false; // Show Spinner on submit button click
      
      
    }
    else if (Input == "hide") {
      this.disabledButton = false; // Unlock the Button after response
      this.isSpinner = true; // Hide Spinner after response 
    }
  }

  charCount='';
  remarksCharCount(param){
    if(param==''){
      this.charCount=''
    }else{
      this.charCount= param.target.value;
    }
  }

}
