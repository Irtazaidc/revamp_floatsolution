// @ts-nocheck
import { Component, OnInit, ViewChild,OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import { NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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

  selector: 'app-approved-jobs',
  templateUrl: './approved-jobs.component.html',
  styleUrls: ['./approved-jobs.component.scss']
})
export class ApprovedJobsComponent implements OnInit {

  @ViewChild('jobRequestDetail') jobRequestDetail;
  @ViewChild('frmRecomendation') frmRecomendation;
  patientVisitsPopupRef: NgbModalRef;
  LineItemRemarks = [];
  JobStatus = [];
  JobRequestIDs = [];

  formSearchJob = this.fb.group({
    departmentIds: [],
    branchIds: [],
    JobStatus: ['']
  });
  JobStatusList = [];
  branchesList = [];
  departmentsList = [];
  JobList = [];
  spinnerText='';
  spinnerRefs = {
    jobSearchSection: 'jobSearchSection'
  }
  JobRequestID: any;
  ActionLabel: string;
  ExistingRow: any[];
  ExistingRowRemarks: any[];
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  SkillsArray: any;
  RemarksErrorMessage: string;
  loggedInUser: UserModel;
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
  searchText='';
  constructor(
    private fb: FormBuilder,
    private recruitmentService: RecruitmentService ,
    private lookupService: LookupService,
    private spinner : NgxSpinnerService,
    private modalService: NgbModal,
    private toastr : ToastrService,
    private appPopupService: AppPopupService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getDepartment();;
    this.searchJobRequest();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
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
    })
  }

  getDepartment() {
    this.departmentsList = []
    this.lookupService.GetDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad||[];
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
    const formValues = this.formSearchJob.getRawValue();
    const objParm = {
      LocID:  formValues.branchIds,
      DepartmentID:  formValues.departmentIds,
      JobStatusID:  5
    }  
    this.recruitmentService.searchJobRequest(objParm).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
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
  }
  
  showRequestDetail(reqID:any){
    this.getJobRequestByID(reqID);
    this.appPopupService.openModal(this.jobRequestDetail);
    
  }
  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }
  
  getJobRequestByID(id) {
    this.ActionLabel="Update"
    this.JobRequestID = id;
    this.ExistingRow = [];
    this.ExistingRowRemarks =[];
    const paramObj = {
      JobRequestID:this.JobRequestID
    }
    
    this.recruitmentService.getJobRequestByID(paramObj).subscribe((resp: any) => {
      this.ExistingRow = resp.PayLoadDS.Table[0];
      this.ExistingRowRemarks = resp.PayLoadDS.Table1;
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
          skillRec = skillRec.replaceAll("\n", "").replaceAll("\r", "").replaceAll("&nbsp;","");
          const string  = skillRec.split(',');
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

 

 

  formUpdateStatus = this.fb.group({
    StatusRemarks: ['', Validators.compose([Validators.required])],
  });

 

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

}
