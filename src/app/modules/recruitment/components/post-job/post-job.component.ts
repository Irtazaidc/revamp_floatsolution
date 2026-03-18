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

  selector: 'app-post-job',
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.scss']
})
export class PostJobComponent implements OnInit {
  JobDescription: string = '<p></p>';
  Skills: string = '<p></p>';
  JobRequestForm = this.fb.group({
    JobTitle: ['', Validators.compose([Validators.required])],
    JobCategory: ['', Validators.compose([Validators.required])],
    JobType: [''],
    DegreeLevel: ['', Validators.compose([Validators.required])],
    branchIds: [ ,Validators.compose([Validators.required])],
    departmentIds: [ ,Validators.compose([Validators.required])],
    Designation: [ ,Validators.compose([Validators.required])],
    // AgeLimit: ['', [Validators.compose([Validators.min(1)]), Validators.compose([Validators.required])] ],
    MinAgeInYear: ['', [Validators.compose([Validators.min(1)]), Validators.compose([Validators.required])] ],
    MaxAgeInYear: ['', [Validators.compose([Validators.min(1)]), Validators.compose([Validators.required])] ],
    ExperienceInYear:[1, [Validators.compose([Validators.min(1)]), Validators.compose([Validators.required])] ],
    VaccanciesRequired: [1, [Validators.compose([Validators.min(1)]), Validators.compose([Validators.required])  ] ],
    Gender: ['', Validators.compose([Validators.required])],
    StartDate: ['',],
    ExpiryDate: ['', Validators.compose([Validators.required])],
    JobDescription: ['', Validators.compose([Validators.required])],
    Skills: [''],
    Remarks: ['', Validators.compose([Validators.required])],
    ShortCode: [''],
  });
  

  

  branchesList = [];
  departmentsList = [];
  designaitonsList = [];
  jobStatusList = [];
  jobShiftList = [];
  jobCategoryList = [];
  degreeLevelList = [];
  applicantStatusList = [];
  JobRequestID : any = null;
  ExistingRow = [];
  ExistingRowRemarks = [];
  spinnerRefs = {
    jobRequestFormSection: 'jobRequestFormSection',
    jobSearchSection:'jobSearchSection'
  }
  JobList = [];
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  disabledButtonModal: boolean = false; // Button Enabled / Disables [By default Enabled] for modal
  isSpinnerModal: boolean = true;//Hide Loader for modal

  @ViewChild('pendModal') pendModal;
  @ViewChild('cancelModal') cancelModal;
  @ViewChild('requestModal') requestModal;
  @ViewChild('statusModal') statusModal;
  JobStatusID=null;
  ActionLabel ="Save"
  JobStatusIDParam: any;
  AgeLimitError: boolean=false;
  DateError: boolean=false;
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
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.JobRequestForm.patchValue({
      StartDate: Conversions.getCurrentDateObjectNew(),
      ExpiryDate: Conversions.getEndDateObjectNew()
    });
    
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getDepartment();
    this.getJobStatus();
    this.getJobShift();
    this.getJobCategory();
    this.getDegreeLevel();
    this.getApplicantStatus();
    this.getDesignations();
    this.searchJobRequest();
    
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  //begin :: Open Pop-up Modal//////////////////////
  PopUpTitle = "";
  PopUpPlaceHolder = "";
  RemarksErrorMessage = "";
  PopUpActionButtonText = "";
  PopUpActionButtonColorClasses = "";
  PopUpActionIconClasses = "";


  // Open Modal popups//////////////////////////////
  openStatusModal(statusID){ 
    this.modalService.open(this.statusModal, { size: 'md', scrollable: true })
    this.JobStatusIDParam =statusID;
    switch (this.JobStatusIDParam) {
        case 1:
            {
              this.PopUpTitle = "Do you want to post this job request again ?";
              this.PopUpPlaceHolder = "Enter Request Remarks";
              this.RemarksErrorMessage = "Please Enter Job Request Remarks !";
              this.PopUpActionButtonText = "Re-Post";
              this.PopUpActionButtonColorClasses = "btn btn-sm btn-info"
              this.PopUpActionIconClasses = "fa fa-share-square-o";
            }
            break;
        case 2:
            {
              this.PopUpTitle = "Are you sure want to recommend Job Request?";
              this.PopUpPlaceHolder = "Enter Recommendation Remarks";
              this.RemarksErrorMessage = "Please Enter Job Recommendation Remarks !";
              this.PopUpActionButtonText = "Recommend";
              this.PopUpActionButtonColorClasses = "btn btn-sm btn-success";
              this.PopUpActionIconClasses = "fa fa-check-square-o";
            }
            break;
        case 3:
            {
              this.PopUpTitle = "Are you sure want to Pend Job Request?";
              this.PopUpPlaceHolder = "Enter Pend Remarks";
              this.RemarksErrorMessage = "Please Enter Job Pend Remarks !";
              this.PopUpActionButtonText = "Pend Job";
              this.PopUpActionButtonColorClasses = "btn btn-sm btn-warning";
              this.PopUpActionIconClasses = "fa fa-times";
            }
            break;
          case 4:
            {
              this.PopUpTitle = "Are you sure want to Cancel Job Request?";
              this.PopUpPlaceHolder = "Enter Cancelation Remarks";
              this.RemarksErrorMessage = "Please Enter Job  Cancelation Remarks !";
              this.PopUpActionButtonText = "Cancel Job";
              this.PopUpActionButtonColorClasses = "btn btn-sm btn-warning";
              this.PopUpActionIconClasses = "fa fa-times";
            }
          break;
        case 5:
          {
            this.PopUpTitle = "Are you sure want to Approve Job Request?";
            this.PopUpPlaceHolder = "Enter Approval Remarks";
            this.RemarksErrorMessage = "Please Enter Job Approval Remarks !";
            this.PopUpActionButtonText = "Cancel Job";
            this.PopUpActionButtonColorClasses = "btn btn-sm btn-success";
            this.PopUpActionIconClasses = "fa fa-check";
          }
          break;
        default:
            this.PopUpTitle = "";
            this.PopUpPlaceHolder = "";
            this.RemarksErrorMessage = "";
            this.PopUpActionButtonText = "";
            this.PopUpActionButtonColorClasses = "";
            this.PopUpActionIconClasses = "";
          break;
    }
  
  }
  //end :: Open Pop-up Modal////////////////////////

  // Modals Remarks valiations////////////
  formStatusPopUp = this.fb.group({
    StatusRemarks: ['', Validators.compose([Validators.required])],
  });


  searchJobRequest(){
    this.spinner.show(this.spinnerRefs.jobSearchSection);
    this.JobList =[];
    let formValues = this.formSearchJob.getRawValue();
    let objParm = {
      LocID:  formValues.branchIds,
      DepartmentID:  formValues.departmentIds,
      JobStatusID:  formValues.JobStatus?formValues.JobStatus:null
    }
    this.recruitment.searchJobRequest(objParm).subscribe((res:any)=>{
      let resSearchJob = res.PayLoad || [];
      // if(resSearchJob.length){
      //   resSearchJob = resSearchJob.filter( a=> (a.JobStatusID != 2 && a.JobStatusID != 5));
      // }
      
      if(res.StatusCode==200){
        this.JobList = resSearchJob||[];
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.jobSearchSection);
      this.toastr.error('Connection error');
    })
    this.spinner.hide(this.spinnerRefs.jobSearchSection);
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
      if(!this.departmentsList.length){
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
      // this.jobStatusList = this.jobStatusList.filter( a=> (a.JobStatusID != 2 && a.JobStatusID != 5));
      if(!this.jobStatusList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getJobShift() {
    this.jobShiftList = []
    this.recruitment.getJobShift().subscribe((resp: any) => {
      this.jobShiftList = resp.PayLoad || [];
      if(!this.jobShiftList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }
  formSearchJob = this.fb.group({
    departmentIds: [],
    branchIds: [],
    JobStatus: ['']
  });

  getJobCategory() {
    this.jobCategoryList = []
    this.recruitment.getJobCategory().subscribe((resp: any) => {
      this.jobCategoryList = resp.PayLoad || [];
      if(this.jobCategoryList.length && !this.jobCategoryList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getDegreeLevel() {
    this.degreeLevelList = []
    this.recruitment.getDegreeLevel().subscribe((resp: any) => {
      this.degreeLevelList = resp.PayLoad || [];
      if(!this.degreeLevelList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }
  getApplicantStatus() {
    this.applicantStatusList = []
    this.recruitment.getApplicantStatus().subscribe((resp: any) => {
      this.applicantStatusList = resp.PayLoad || [];
      if(!this.applicantStatusList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getDesignations() {
    this.designaitonsList = []
    this.recruitment.getDesignations().subscribe((resp: any) => {
      this.designaitonsList = resp.PayLoad || [];
      if(!this.designaitonsList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  getJobRequestByID(id, statusID) {
    this.ActionLabel="Update"
    this.JobRequestID = id;
    this.JobStatusID=statusID;
    this.ExistingRow = [];
    this.ExistingRowRemarks =[];
    let paramObj = {
      JobRequestID:this.JobRequestID
    }
    
    this.recruitment.getJobRequestByID(paramObj).subscribe((resp: any) => {
      this.ExistingRow = resp.PayLoadDS.Table[0];
      this.ExistingRowRemarks = resp.PayLoadDS.Table1;
      if(resp.PayLoadDS.Table[0]){ 
        this.JobRequestForm.patchValue( {
          ShortCode: this.ExistingRow["JobRequestCode"],
          JobTitle: this.ExistingRow["JobTitle"],
          JobCategory: this.ExistingRow["JobCategoryID"],
          JobType: this.ExistingRow["JobShiftID"],
          DegreeLevel: this.ExistingRow["DegreeLevelID"],
          branchIds: this.ExistingRow["LocID"],
          departmentIds: this.ExistingRow["DepartmentID"], 
          Designation: this.ExistingRow["DesignationID"], 
          // AgeLimit: this.ExistingRow["AgeLimit"], 
          MinAgeInYear: this.ExistingRow["MinAgeInYear"], 
          MaxAgeInYear: this.ExistingRow["MaxAgeInYear"], 
          ExperienceInYear: this.ExistingRow["ExperienceInYear"], 
          VaccanciesRequired: this.ExistingRow["VaccanciesRequired"], 
          Gender: this.ExistingRow["Gender"], 
          StartDate: Conversions.getDateObjectByGivenDate(this.ExistingRow["JobValidFrom"]),
          ExpiryDate: Conversions.getDateObjectByGivenDate(this.ExistingRow["JobExpiry"]),
          JobDescription: this.ExistingRow["JobDescriptionHTML"],
          Skills: this.ExistingRow["SkillsRequiredHTML"],
          Remarks: this.ExistingRowRemarks[0]["JobRequestRemarks"],
        });
      }
    }, (err) => {
      console.log(err);
    })
  }
  
  addUpdateJobRequest(){
    this.spinner.show(this.spinnerRefs.jobRequestFormSection); 
    this.loadingProcess('show');
    let formValues = this.JobRequestForm.getRawValue();
    this.JobRequestForm.markAllAsTouched();
    if(this.JobRequestForm.invalid) {
      this.spinner.hide(this.spinnerRefs.jobRequestFormSection);
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      let formData = {
        JobRequestID : this.JobRequestID,
        JobTitle : formValues.JobTitle,
        DesignationID : formValues.Designation,
        JobStatusID : 1,
        JobCategoryID : formValues.JobCategory,
        JobShiftID : formValues.JobType,
        DepartmentID : formValues.departmentIds,
        LocID : formValues.branchIds,
        Gender : formValues.Gender,
        // AgeLimit : formValues.AgeLimit,
        MinAgeInYear : formValues.MinAgeInYear,
        MaxAgeInYear : formValues.MaxAgeInYear,
        DegreeLevelID : formValues.DegreeLevel,
        ExperienceInYear : formValues.ExperienceInYear,
        JobDescription : this.JobDescription.replace(/<[^>]*>/gi, ''),
        JobDescriptionHTML : this.JobDescription,
        SkillsRequired : this.Skills.replace(/<[^>]*>/gi, ''),
        SkillsRequiredHTML : this.Skills,
        JobValidFrom : formValues.StartDate ? Conversions.formatDateObject(formValues.StartDate) : '',
        JobExpiry : formValues.ExpiryDate ? Conversions.formatDateObject(formValues.ExpiryDate) : '',
        VaccanciesRequired : formValues.VaccanciesRequired,
        JobRequestedBy : -1, //this.storageService.getLoggedInUserProfile().userid,
        JobAprovedBy : null,
        Remarks : formValues.Remarks,
        CreatedBy : this.loggedInUser.userid || -99,
      };
      if(Conversions.formatDateObject(formValues.StartDate) >  Conversions.formatDateObject(formValues.ExpiryDate)){
        this.JobRequestForm.patchValue({
          ExpiryDate:''
        })
        this.toastr.error('Expiry date should be greater then Start date');
        this.spinner.hide(this.spinnerRefs.jobRequestFormSection); 
        this.loadingProcess('hide');
        return;
      }
      this.recruitment.addUpdateJobRequest(formData).subscribe((data: any) => {
        this.spinner.hide(this.spinnerRefs.jobRequestFormSection);
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            // this.router.navigate(['recruitment/manage-job']);
            this.searchJobRequest();
            this.clearForms();
            this.JobRequestForm.patchValue( {
              StartDate: Conversions.getCurrentDateObject(),
              ExpiryDate: Conversions.getEndDateObject(),
            });
          } else {
            this.toastr.error(data.Message)
            this.spinner.hide(this.spinnerRefs.jobRequestFormSection);
            this.loadingProcess('hide');
          }
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.jobRequestFormSection);
        this.toastr.error('Connection error');
      })
    }
  } //End of addUpdateJobRequest method

  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }
  loadingProcess(Input) {
    if (Input == "show") {
      this.disabledButtonModal = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinnerModal = false; // Show Spinner on submit button click
    }
    else if (Input == "hide") {
      this.disabledButtonModal = false; // Unlock the Button after response
      this.isSpinnerModal = true; // Hide Spinner after response    
    }
  }

  changeJobRequestStatus(){
    this.loadingProcess('show') 
     let formValues = this.formStatusPopUp.getRawValue();
     this.formStatusPopUp.markAllAsTouched();
    if(this.formStatusPopUp.valid) {
      let objParam = {
        CreatedBy: this.loggedInUser.userid || -99,
        tblJobRequestStatus: [{
          "JobRequestID": this.JobRequestID,
          "JobStatusID": this.JobStatusIDParam,
          "Remarks":formValues.StatusRemarks
        }]
      }
      this.recruitment.updateJobStatusWithRemarks(objParam).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success('Job Request has been Re-Posted successfully');
            this.searchJobRequest();
            this.clearForms();
          } else {
            this.toastr.error(data.Message)
            
          }
          this.loadingProcess('hide');
        }
      })
    } else{
      this.loadingProcess('hide')
    }
  }



  clearForms(){
    this.JobRequestForm.reset();
    this.formStatusPopUp.reset();
    this.JobRequestID=null;
    this.JobStatusID = null;
    this.JobStatusIDParam = null;
    this.ActionLabel="Save";
    this.closeLoginModal();
    this.JobRequestForm.patchValue( {
      StartDate: Conversions.getCurrentDateObject(),
      ExpiryDate: Conversions.getEndDateObject(),
    });
    this.PopUpTitle = "";
    this.PopUpPlaceHolder = "";
    this.RemarksErrorMessage = "";
    this.PopUpActionButtonText = "";
    this.PopUpActionButtonColorClasses = "";
    this.PopUpActionIconClasses = "";
    setTimeout(() => {
      this.Skills= '<p></p>';
      this.JobDescription= '<p></p>';
      this.Skills= '';
      this.JobDescription= '';
      }, 100);
   
  }

  validateMinMaxAge(MinAge,MaxAge){
    if(MinAge!='' && MaxAge!='' && MaxAge < MinAge){
      this.AgeLimitError =true;
      this.JobRequestForm.patchValue({
        MaxAgeInYear:''
      })
    }else{
      this.AgeLimitError =false;
    }
  }

  validateApplyDate(StartDate, EndDate){
    if(StartDate  > EndDate){
      this.DateError =true;
      this.JobRequestForm.patchValue({
        ExpiryDate:''
      })
    }else{
      this.DateError =false;
    }
  }
  
  

} //End of class
