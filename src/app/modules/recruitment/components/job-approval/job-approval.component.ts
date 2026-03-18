// @ts-nocheck
import { Component, OnInit, ViewChild,OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import { NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
// import { StorageService } from '../../../../shared/helpers/storage.service';;

import { CONSTANTS } from '../../../shared/helpers/constants';
import { Conversions } from '../../../shared/helpers/conversions';
import { RecruitmentService } from '../../services/recruitment.service';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
@Component({
  standalone: false,

  selector: 'app-job-approval',
  templateUrl: './job-approval.component.html',
  styleUrls: ['./job-approval.component.scss']
})
export class JobApprovalComponent  implements OnInit {
  @ViewChild('jobRequestDetail') jobRequestDetail;
  @ViewChild('frmRecomendation') frmRecomendation;
  patientVisitsPopupRef: NgbModalRef;
  LineItemRemarks = [];
  JobStatus = [];
  JobRequestIDs = [];

  JobStatusList = [];
  branchesList = [];
  departmentsList = [];
  JobList = [];
  spinnerText='';
  spinnerRefs = {
    jobSearchSection: 'jobSearchSection'
  }
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> you want to submit?', // 'Are you sure?',
    popoverMessage: 'Approval Confirmation !',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }
  JobRequestID: any;
  ActionLabel: string;
  ExistingRow: any[];
  ExistingRowRemarks: any[];
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  isSpinnerApprove: boolean = true;//Hide Loader
  isSpinnerPend: boolean = true;//Hide Loader
  isSpinnerCancel: boolean = true;//Hide Loader
  SkillsArray: any;
  RemarksErrorMessage: string;
  VaccancyError: boolean =false;
  loggedInUser: UserModel;
  searchText='';
  constructor(
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService ,
    private lookupService: LookupService,
    private spinner : NgxSpinnerService,
    private modalService: NgbModal,
    private toastr : ToastrService,
    // private storageService : StorageService,
    private appPopupService: AppPopupService,
    private auth: AuthService
  ) { }

  formSearchJob = this.fb.group({
    departmentIds: [],
    branchIds: [],
    JobStatus: ['']
  });
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getJobStatus();
    this.getBranches();
    this.getDepartment();;
    this.searchJobRequest();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getJobStatus(){
    this.JobStatusList=[];
    this.recruitmentService.getJobStatus().subscribe((res: any) => {
      let resJobStatus = res.PayLoad;
      if(resJobStatus){
        this.JobStatusList = res.PayLoad;
        this.JobStatusList = this.JobStatusList.filter( a=> (a.JobStatusID != 2 && a.JobStatusID != 1));
        // console.warn('Job Status List is: ',this.JobStatusList)
      }
    }, (err) => {
      console.log("Error loading JobStatuses",err);
    })
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
    })
  }

  getDepartment() {
    this.departmentsList = []
    this.lookupService.GetDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad;
      if(!this.departmentsList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

  searchJobRequest(){
    this.spinnerText = 'Loading...';
    this.spinner.show(this.spinnerRefs.jobSearchSection);
    this.JobList =[];
    let formValues = this.formSearchJob.getRawValue();
    let objParm = {
      LocID:  formValues.branchIds,
      DepartmentID:  formValues.departmentIds,
      JobStatusID:  2
    }  
    this.recruitmentService.searchJobRequest(objParm).subscribe((res:any)=>{
      let resSearchJob = res.PayLoad;
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
  convertDate(date) {
    let dateToReturn = '';
    if(!date) {
      return dateToReturn;
    }
    if(typeof(date) === 'string') {
      dateToReturn = moment(date).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
    } else if(typeof(date) === 'object') {
      dateToReturn = moment(Conversions.formatDateObjectToString(date)).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
    }
    if(dateToReturn == 'Invalid date') {
      dateToReturn = date;
    }
    return dateToReturn;
    // console.log('dateeeeeee ', moment(date).format(CONSTANTS.DATE_TIME_FORMAT.DATE));
    // console.log('dateeeeeee ', moment(Conversions.formatDateObjectToString(date)).format(CONSTANTS.DATE_TIME_FORMAT.DATE));
    // return date.day + '-' + date.month + '-' + date.year;
  }


  selectAllRequests(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.JobList.forEach( a=> {
      a.checked = false;
      if(a.JobRequestID > 0) {
        a.checked = e.target.checked;
      }
    })
  }
  showRequestDetail(reqID:any){
    this.getJobRequestByID(reqID);
    this.appPopupService.openModal(this.jobRequestDetail);
    
  }
  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }
  JobRequestCode = "";
  JobTitle = "";
  JobCategory = "";
  JobType = "";
  JobShift = "";
  DegreeLevel = "";
  branchIds = "";
  departmentIds = "";
  Designation = "";
  DesignationID = "";
  Department = "";
  Location = "";
  AgeLimit = "";
  ExperienceInYear = "";
  VaccanciesRequired = ""; 
  Gender = "";
  StartDate:any = "";
  ExpiryDate :any = "";
  JobDescription = "";
  Skills = "";
  Remarks = "";
  getJobRequestByID(id) {
    this.ActionLabel="Update"
    this.JobRequestID = id;
    this.ExistingRow = [];
    this.ExistingRowRemarks =[];
    let paramObj = {
      JobRequestID:this.JobRequestID
    }
    
    this.recruitmentService.getJobRequestByID(paramObj).subscribe((resp: any) => {
      this.ExistingRow = resp.PayLoadDS.Table[0];
      this.ExistingRowRemarks = resp.PayLoadDS.Table1;
      // console.warn('Existing row is: ',this.ExistingRow)
      // console.warn('Existing row Remarks is: ',this.ExistingRowRemarks[0])
      if(resp.PayLoadDS.Table[0]){ 
        this.JobRequestCode= this.ExistingRow["JobRequestCode"];
        this.JobTitle= this.ExistingRow["JobTitle"];
        this.JobCategory= this.ExistingRow["JobCategory"];
        this.JobType= this.ExistingRow["JobShiftID"];
        this.JobShift= this.ExistingRow["JobShift"];
        this.DegreeLevel= this.ExistingRow["DegreeLevel"];
        this.branchIds= this.ExistingRow["LocID"];
        this.Location= this.ExistingRow["Location"];
        this.departmentIds= this.ExistingRow["DepartmentID"];
        this.Department= this.ExistingRow["Department"];
        this.DesignationID= this.ExistingRow["DesignationID"];
        this.Designation= this.ExistingRow["Designation"];
        this.AgeLimit= this.ExistingRow["AgeLimit"];
        this.ExperienceInYear= this.ExistingRow["ExperienceInYear"];
        this.VaccanciesRequired= this.ExistingRow["VaccanciesRequired"];
        this.Gender= (this.ExistingRow["Gender"].toLowerCase()=='m')?'Male':(this.ExistingRow["Gender"].toLowerCase()=='f')?'Femal':'Both';
        this.StartDate= this.ExistingRow["JobValidFrom"];
        this.ExpiryDate= this.ExistingRow["JobExpiry"];
        this.JobDescription= this.ExistingRow["JobDescriptionHTML"];
        this.Skills= this.ExistingRow["SkillsRequiredHTML"];
        let skillRec = this.ExistingRow["SkillsRequired"];
        skillRec = skillRec.replaceAll("\n", "").replaceAll("\r", "").replaceAll("&nbsp;","");;
        let string  = skillRec.split(',');
        [...string];
        Array.from(string);
        this.SkillsArray = Object.assign([], string);
        this.SkillsArray = this.SkillsArray.filter(e=>e!='')
        this.Remarks= this.ExistingRowRemarks[0]["JobRequestRemarks"];
      }
    }, (err) => {
      console.log(err);
    })
  }
  apporvalProcess(){
    // This function will process all the checked jobs in bulk...
    this.spinnerText = 'Processing...';
    this.loadingProcess('show',0);
    this.spinner.show(this.spinnerRefs.jobSearchSection); 
    let jobListChecked = this.JobList.filter( a=> a.checked);

    let isValidStatus = true;
    let isValidRemarks = true;
    let isValidVaccancy = true;
    let isValidNumberVaccancy = true;
    
    jobListChecked.forEach(a => {;
      if(!a.JobStatusIDSelected) {
        isValidStatus = false;
      }
    })

    jobListChecked.forEach(a => {
      if(!a.JobRemarksSelected) {
        isValidRemarks = false;
      }
    })

    jobListChecked.forEach(a => {
      if(!a.VaccancySelected) {
        isValidVaccancy = false;
      }
    })
    jobListChecked.forEach(a => {
      if(a.VaccancySelected > a.VaccanciesRequired) {
        isValidNumberVaccancy = false;
      }
    })
    if(!isValidStatus || !isValidRemarks || !isValidVaccancy) {
      this.toastr.warning('Please fill mandatory fields with valid data');
      this.loadingProcess('hide',0);
      this.spinner.hide(this.spinnerRefs.jobSearchSection);
      return;
    }else if (!isValidNumberVaccancy) {
      this.toastr.warning('Approved vaccancies should be less then or equal to Required vaccencies');
      this.loadingProcess('hide',0);
      this.spinner.hide(this.spinnerRefs.jobSearchSection);
      return;
    } else {
      if(jobListChecked.length){
        let objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          tblJobRequestStatus: jobListChecked.map( a => {
            return {
              JobRequestID: a.JobRequestID, 
              JobStatusID: a.JobStatusID, 
              Remarks: a.Remarks,
              VaccanciesApproved: a.VaccanciesApproved,
              InterviewLevel: a.InterviewLevel
              }
            })
          }     
          this.recruitmentService.updateJobStatusWithRemarks(objParam).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.toastr.success('Job Request has been processed successfully');
              this.searchJobRequest()
            } else {
              this.toastr.error(data.Message)
            }
            this.loadingProcess('hide',0);
            this.spinner.hide(this.spinnerRefs.jobSearchSection);
          }
        }, (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.jobSearchSection);
          this.toastr.error('Connection error');
        })
      }else{
        this.toastr.warning('Please select a job first');
        this.loadingProcess('hide',0);
        this.spinner.hide(this.spinnerRefs.jobSearchSection);
      }
    }
    
  }

  changeJobStatus(statusID){
    this.changeJobRequestStatus(statusID);
  }

  formUpdateStatus = this.fb.group({
    StatusRemarks: ['', Validators.compose([Validators.required])],
    VacancyApproved: ['', Validators.compose([Validators.required])],
    InterviewLevel: [1, Validators.compose([Validators.required])],
  });

  changeJobRequestStatus(statusID){
    let alertMessage = '';
    this.RemarksErrorMessage = '';
    if(statusID==2){
      alertMessage = 'Job Request has been Recommende successfully';
      this.RemarksErrorMessage = "Please Enter Recommendation Remarks !";
    }else if(statusID==3){
      alertMessage = 'Job Request has been Pended successfully';
      this.RemarksErrorMessage = "Please Enter Pend Remarks !";
    }else if(statusID==4){
      alertMessage = 'Job Request has been Cancelled successfully';
      this.RemarksErrorMessage = "Please Enter Cancelation Remarks !";
    }else if(statusID==5){
      alertMessage = 'Job Request has been Approved successfully';
      this.RemarksErrorMessage = "Please Enter Approval Remarks !";
    }else{
      alertMessage = 'Something went wrong';
    }
    this.loadingProcess('show',statusID) ;
     let formValues = this.formUpdateStatus.getRawValue();
     this.formUpdateStatus.markAllAsTouched();
    if(this.formUpdateStatus.valid) {
      if(formValues.VacancyApproved > this.VaccanciesRequired){
        this.toastr.error('Approved Vaccancies should be less then or equal to Required Vaccancies');
        this.VaccancyError = true;
        this.loadingProcess('hide',statusID);return;
      } else{
        this.VaccancyError = false;
        let objParam = {
          CreatedBy: this.loggedInUser.userid || -99,
          tblJobRequestStatus: [{
            "JobRequestID": this.JobRequestID,
            "JobStatusID": statusID,
            "Remarks":formValues.StatusRemarks,
            "VaccanciesApproved": formValues.VacancyApproved,
            "InterviewLevel": formValues.InterviewLevel
          }]
         }
        this.recruitmentService.updateJobStatusWithRemarks(objParam).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.toastr.success(alertMessage);
              this.searchJobRequest();
              this.formUpdateStatus.reset();
              this.closeLoginModal();
              // this.clearForms();
            } else {
              this.toastr.error(data.Message)
              
            }
            this.loadingProcess('hide',statusID);
          }
        })
      }
      
    } else{
      this.toastr.warning('Please provide the required information')
      this.loadingProcess('hide',statusID)
    }
  }

  loadingProcess(Input,statusID) {
    if (Input == "show") {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      if(statusID==5){
        this.isSpinnerApprove = false;
      }else if(statusID==4){
        this.isSpinnerCancel = false;
        
      }else if(statusID==3){
        this.isSpinnerPend = false;
      }else{
        this.isSpinner = false; // Show Spinner on submit button click
      }
    }
    else if (Input == "hide") {
      this.disabledButton = false; // Unlock the Button after response
      if(statusID==5){
        this.isSpinnerApprove = true;
      }else if(statusID==4){
        this.isSpinnerCancel = true;
        
      }else if(statusID==3){
        this.isSpinnerPend = true;
      }else{
        this.isSpinner = true; // Show Spinner on submit button click
      }
    }
  }

}