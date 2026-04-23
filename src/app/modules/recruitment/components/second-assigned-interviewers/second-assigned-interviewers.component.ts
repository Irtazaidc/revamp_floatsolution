// @ts-nocheck
import { Component, Input, OnChanges, OnInit,ViewChild,ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; 
import { ActivatedRoute, Router} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalConfig, NgbDateStruct, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/shared/services/shared.service';


import { CONSTANTS } from '../../../shared/helpers/constants';
import { Conversions } from '../../../shared/helpers/conversions';
import { RecruitmentService } from '../../services/recruitment.service';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-second-assigned-interviewers',
  templateUrl: './second-assigned-interviewers.component.html',
  styleUrls: ['./second-assigned-interviewers.component.scss']
})
export class SecondAssignedInterviewersComponent implements OnInit {

  @ViewChild('jobRequestDetail') jobRequestDetail;
  @ViewChild('jobRequestDetailIinterviewers') jobRequestDetailIinterviewers;
  // @ViewChild('frmApplicantProcess') frmApplicantProcess;
  OpenJobsList = [];
  OpenJobsListWithInterviewers = [];
  InterviewersList = [];
  fileName: string;
  spinnerRefs = {
    OpenJobsListSection: 'OpenJobsListSection',
    OpenJobsListWithInterviewersSection: 'OpenJobsListWithInterviewersSection',
    JobRequestDetailSectionModal: 'JobRequestDetailSectionModal',
    JobRequestDetailSectionWithRierModal: 'JobRequestDetailSectionWithRierModal'
  }

  formGetApplicant = this.fb.group({
    departmentIds: [],
    branchIds: [],
    JobStatus: ['']
  });

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    // popoverTitle: 'Are you <b>sure</b> you want to submit?', // 'Are you sure?',
    popoverTitle: 'Are you <b>sure</b> want to proceeed?', // 'Are you sure?',
    // popoverMessage: 'Recommedation Confirmation !',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }

  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonModal = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  isSpinnerModal = true;//Hide Loader
  isSpinnerShortListed = true;//Hide Loader
  isSpinnerRejected = true;//Hide Loader
  isSpinnerConfirmed = true;//Hide Loader

  formSetInterviewerSingle = this.fb.group({
    EmpId: ['', Validators.compose([Validators.required])],
    StartDate: ['', Validators.compose([Validators.required])]
  });
  RemarksErrorMessage: string;
  ApplicantStatusList: any[];
  loggedInUser: UserModel;
  StartDate: any ="";
  ExpiryDate: any = "";


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
  JobDescription = "";
  Skills = "";
  Remarks = "";
  JobRequestID;
  ExistingRow:any=[]
  ExistingRowRemarks:any=[]
  SkillsArray: any;
  InterviewLevel = 3;

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
    private sharedService : SharedService,
    private router: Router,
    private appPopupService: AppPopupService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getOpenJobsList();
    this.getOpenJobsListWithInterviewers();
    this.getEmployees();
    // this.StartDate = Conversions.getCurrentDateObject();
    // this.ExpiryDate = Conversions.getEndDateObject();
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getOpenJobsList(){
    this.spinner.show(this.spinnerRefs.OpenJobsListSection);
    this.OpenJobsList =[];
    const objParm = {
      InterviewerStage:  2
      // DepartmentID:  formValues.departmentIds,
      // JobStatusID:  formValues.JobStatus?formValues.JobStatus:null
    }
    this.recruitment.getOpenJobsList(objParm).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.OpenJobsList = resSearchJob||[];
        // this.OpenJobsList = this.OpenJobsList.filter( a=> (a.ApplicantStatusID == 5));
        // console.warn('applicant Filtered List are: ',this.OpenJobsList)
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
      this.toastr.error('Connection error');
    })
    this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
  }


  getOpenJobsListWithInterviewers(){
    this.spinner.show(this.spinnerRefs.OpenJobsListWithInterviewersSection);
    this.OpenJobsListWithInterviewers =[];
    const objParm = {
      InterviewerStage:  2
    }
   
    this.recruitment.getOpenJobsListWithInterviewers(objParm).subscribe((res:any)=>{
      const resSearchJob = res.PayLoad;
      if(res.StatusCode==200){
        this.OpenJobsListWithInterviewers = [];
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
          this.OpenJobsListWithInterviewers = newArr;
          
      })
      this.OpenJobsListWithInterviewers.map(aa => {
        // aa.InterviewTimeFrom = this.getFormattedDate(aa.InterviewTimeFrom);
        aa.StartDate = Conversions.getDateObjectByGivenDate(aa.InterviewTimeFrom);
      })
      this.spinner.hide(this.spinnerRefs.OpenJobsListWithInterviewersSection);
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.OpenJobsListWithInterviewersSection);
      this.toastr.error('Connection error');
    })
    this.spinner.hide(this.spinnerRefs.OpenJobsListWithInterviewersSection);
  }

  getEmployees() {
    this.InterviewersList = [];
    const params = {};
    this.sharedService.getEmployees(params).subscribe( (res: any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200) {
        const empList = JSON.parse(res.PayLoadStr);
        this.InterviewersList = empList.map(a => ({EmpId:a.EmpId, EmpNo:a.EmpNo,EmployeeName:a.EmployeeName,UserId:a.UserId, FullName: '[IDC-'+a.EmpNo.padStart(4, '0')+'] '+a.EmployeeName }));
      }else{
        this.InterviewersList = []
      }
      
    }, (err)=>{
      this.spinner.hide();
    })
  }

  
  showRequestDetail(reqID:any){
    this.getJobRequestByID(reqID);
    this.appPopupService.openModal(this.jobRequestDetail);
  }
  showRequestDetailInterviewers(reqID:any){
    this.getJobRequestByID(reqID);
    this.appPopupService.openModal(this.jobRequestDetailIinterviewers);
  }

  
  getJobRequestByID(id) {
    this.JobRequestID = id;
    this.ExistingRow = [];
    this.ExistingRowRemarks =[];
    const paramObj = {
      JobRequestID:this.JobRequestID
    }
    
    this.recruitment.getJobRequestByID(paramObj).subscribe((resp: any) => {
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
          this.departmentIds= this.ExistingRow["DepartmentID"];
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
          skillRec = skillRec.replaceAll("\n", "").replaceAll("\r", "");
          const string  = skillRec.split(',');
          [...string];
          Array.from(string);
         this.SkillsArray = Object.assign([], string);
         this.SkillsArray = this.SkillsArray.filter(e=>e!='')
          this.Remarks= this.ExistingRowRemarks[0]["JobRequestRemarks"];
          this.InterviewLevel = this.ExistingRowRemarks[0]["InterviewLevel"];
      }
    }, (err) => {
      console.log(err);
    })
  }


  setJobInterviewersBulk(){
    this.loadingProcess('show',1);
    this.spinner.show(this.spinnerRefs.OpenJobsListSection); 
    const jobListChecked = this.OpenJobsList.filter( a=> a.checked);
    let isValidEmp = true;
    let isValidStartDate = true;
    const isValidEndDate = true;
    jobListChecked.forEach(a => {
      if(!a.empIds) {
        isValidEmp = false;
      }
    })
    jobListChecked.forEach(a => {
      if(!a.StartDate) {
        isValidStartDate = false;
      }
    })
    // jobListChecked.forEach(a => {
    //   if(!a.ExpiryDate) {
    //     isValidEndDate = false;
    //   }
    // })
    // return ;
    if(!isValidStartDate || !isValidEmp) {
      this.toastr.warning('Please fill mandatory fields against selected records');
      this.loadingProcess('hide',1);
      this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
      return;
    } else {
      if(jobListChecked.length){
        const objDataTemp = 
          jobListChecked.map( a => (
            {
              JobRequestID : a.JobRequestID, 
              InterviewerIDs: a.empIds.join(','),  
              InterviewTimeFrom: Conversions.formatDateObject(a.StartDate),
              InterviewTimeTo: Conversions.formatDateObject(a.StartDate)
            }
          ));
         
          const objData = {
            CreatedBy : this.loggedInUser.userid || -99,
            InterviewerStage:  2,
            tblJobRequestInterviewers: objDataTemp
           }
          this.recruitment.addUpdateJobInterviewers(objData).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              // this.toastr.success(data.Message);
              this.toastr.success("Interviewer(s) have been asigned successfully.");
              this.getOpenJobsList()
              this.getOpenJobsListWithInterviewers()
            } else {
              this.toastr.error(data.Message)
            }
            this.loadingProcess('hide',1);
            this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
          }
        }, (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
          this.toastr.error('Connection error');
        })
      }else{
        this.toastr.warning('Please select Job/s first');
        this.loadingProcess('hide',1);
        this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
      }
    }
  }

  updateJobInterviewersBulk(){
    this.loadingProcess('show',1);
    this.spinner.show(this.spinnerRefs.OpenJobsListSection); 
    const jobListChecked = this.OpenJobsListWithInterviewers.filter( a=> a.checked);
    let isValidEmp = true;
    let isValidStartDate = true;
    const isValidEndDate = true;
    jobListChecked.forEach(a => {
      if(!a.empIds) {
        isValidEmp = false;
      }
    })
    jobListChecked.forEach(a => {
      if(!a.StartDate) {
        isValidStartDate = false;
      }
    })
    // jobListChecked.forEach(a => {
    //   if(!a.ExpiryDate) {
    //     isValidEndDate = false;
    //   }
    // })
    // return ;
    if(!isValidStartDate || !isValidEmp) {
      this.toastr.warning('Please fill mandatory fields against selected records');
      this.loadingProcess('hide',1);
      this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
      return;
    } else {
      if(jobListChecked.length){
        const objDataTemp = 
          jobListChecked.map( a => (
            {
              JobRequestID : a.JobRequestID, 
              InterviewerIDs: a.empIds.join(','),  
              InterviewTimeFrom: Conversions.formatDateObject(a.StartDate),
              InterviewTimeTo: Conversions.formatDateObject(a.StartDate)
            }
          ));
         
          const objData = {
            CreatedBy : this.loggedInUser.userid || -99,
            InterviewerStage:  2,
            tblJobRequestInterviewers: objDataTemp
           }
          this.recruitment.addUpdateJobInterviewers(objData).subscribe((data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              // this.toastr.success(data.Message);
              this.toastr.success("Interviewer(s) have been updated successfully.");
              this.getOpenJobsList()
              this.getOpenJobsListWithInterviewers()
            } else {
              this.toastr.error(data.Message)
            }
            this.loadingProcess('hide',1);
            this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
          }
        }, (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
          this.toastr.error('Connection error');
        })
      }else{
        this.toastr.warning('Please select Job/s first');
        this.loadingProcess('hide',1);
        this.spinner.hide(this.spinnerRefs.OpenJobsListSection);
      }
    }
  }

  setJobInterviewersSingle(){
    const formValues = this.formSetInterviewerSingle.getRawValue();
    this.loadingProcess('show',2) 
    // this.spinner.show(this.spinnerRefs.JobRequestDetailSectionModal);
    this.formSetInterviewerSingle.markAllAsTouched();
    if(this.formSetInterviewerSingle.valid) {
      const objParam = {
        CreatedBy : this.loggedInUser.userid || -99,
        InterviewerStage:  2,
        tblJobRequestInterviewers: [{
          JobRequestID: this.JobRequestID, 
          InterviewerIDs: formValues.EmpId.join(','), 
          InterviewTimeFrom: Conversions.formatDateObject(formValues.StartDate),
          InterviewTimeTo: Conversions.formatDateObject(formValues.StartDate)
        }]
       }
      this.recruitment.addUpdateJobInterviewers(objParam).subscribe((data: any) => {
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            // this.toastr.success("Interviewers have been set successfully");
            this.toastr.success("Interviewer(s) have been assigned successfully.");
            this.getOpenJobsList();
            this.getOpenJobsListWithInterviewers();
            this.formSetInterviewerSingle.reset();
            this.closeLoginModal();
            // this.clearForms();
          } else {
            this.toastr.error(data.Message)
            
          }
          this.loadingProcess('hide',2);
          // this.spinner.hide(this.spinnerRefs.JobRequestDetailSectionModal);
        }
      })
    } else{
      this.toastr.warning('Please provide required information')
      this.loadingProcess('hide',2)
    }
  }



  
  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }


  selectAllRows(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.OpenJobsList.forEach( a=> {
      a.checked = false;
      if(a.JobRequestID > 0) {
        a.checked = e.target.checked;
      }
    })
  }

  selectAllRowsInterviewers(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.OpenJobsListWithInterviewers.forEach( a=> {
      a.checked = false;
      if(a.JobRequestID > 0) {
        a.checked = e.target.checked;
      }
    })
  }


  loadingProcess(Input,type) { 
    if (Input == "show") {
      if(type==1){
        this.disabledButton = false; 
        this.isSpinner = true; 
      }else{
        this.disabledButtonModal = false; 
        this.isSpinnerModal = true; 
      }
      
    }
    else if (Input == "hide") {
      if(type==2){
        this.disabledButton = false; 
        this.isSpinner = true; 
      }  
    }
  }
  validateApplyDate(a,b){

  }
  dateSelect(a,b){

  }

}
