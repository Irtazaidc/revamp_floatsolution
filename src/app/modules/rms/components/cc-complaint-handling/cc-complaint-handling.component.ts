// @ts-nocheck
import { Component,  OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { FeedbackService } from '../../service/feedback.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-cc-complaint-handling',
  templateUrl: './cc-complaint-handling.component.html',
  styleUrls: ['./cc-complaint-handling.component.scss']
})
export class CcComplaintHandlingComponent implements OnInit {

  // @Output() SelectedPatientEvent = new EventEmitter<any>();
  @ViewChild('showPatientSearch') showPatientSearch;
  @ViewChild('showPatientPortalUserDetails') showPatientPortalUserDetails;
  ModalPopupRef: NgbModalRef;
  user$: Observable<UserModel>;
  loggedInUser: UserModel;
  remarksControl = new FormControl();
  ComplaintDetailsForm: FormGroup;
  GetPatientPortalUserDetailByFilters: FormGroup;
  remainingCharacters = 2000;
  isSubmitted = false;
  selectedLocId = 1;
  testCategorization: number;
  getTableValues: any;
  patientName: string;
  remarks: any;
  PPuserID=null;
  patientID: any;
  contactNumber: number;
  email: any;
  departmentsList: any;
  citiesList: any;
  branchList: any;
  cmsCategoryList: any;
  cmsRequestTypeList: any;
  cityAreasList: any;
  selectedTPID = 0;
  testList = [];
  selectedTPIDs = [];
  rdSearchBy = 'byCode';
  employeesList: any;
  getObjectData: any;
  showCityAreaSelector = false;
  CompaintID=null
  remainingCharactersforFindings=2000;
  priorityList = [];
  subSectionList = [];
  labDeptID=-1;
  cmsSubCategoryList:any;
  patientId:number;
  getVisitID:number;
  VisitID:number;
  getEventCardValues:any;
  branchID

  spinnerRefs = {
    hcComplaintRequesTable: 'hcComplaintRequesTable',
    hcRequesDetail: 'hcRequesDetail',
    hcComplaintRequestContainer: 'hcComplaintRequestContainer',
  }

  constructor(
    private fb: FormBuilder,
    private lookupService: LookupService,
    private getfeedback: FeedbackService,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private testProfileService: TestProfileService,
    private appPopupService: AppPopupService,
    private route: ActivatedRoute,
    private helperService: HelperService,

  ) {
    this.ComplaintDetailsForm = this.fb.group({
      requestTypeID: [, Validators.required],
      requestPriorityID: [ ,Validators.required],
      requestSubject: [, Validators.required],
      SectionId: [],
      cmsCategoryID: [, Validators.required],
      cmsSubCategory: [, Validators.required],
      TPId: [],
      assignedBranchName: [],
      assignedDepartmentId: [],
      DepartmentId: [-1],
      empID: [],
      fullName: ['', Validators.required],
      complainantName: [''],
      patientContact: [''],
      CellNumber: ['', Validators.required],
      smsCheck: [''],
      callBackCheck: [''],
      email: ['', Validators.email],
      visitID: [''],
      reportedError: [''],
      BranchID: [, Validators.required],
      cmsSourceId: [, Validators.required],
      initialFindings: [''],
      PortalUserID: [''],
      PortalUserName: [''],
      cmsMessage: new FormControl('', [Validators.required]),
    });

    this.ComplaintDetailsForm.get('fullName')?.valueChanges.subscribe((value) => {
      this.ComplaintDetailsForm.patchValue({
        complainantName: value, // Set complainantName to the entered value
      });
    });
   
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnInit(): void {
    this.getCitiesList();
    this.getLocationList();
    this.getSubDepartment();
    this.getEmployeesData();
    this.getCMScategoryData();
    this.getCMSrequestType();
    this.getCMSrequestSourceList();
    this.loadLoggedInUserInfo();
    this.getSubSection();
    this.getCMSPriorityList();
    this.getCMSSubmittedRequestCountStats();

    this.route.queryParams.subscribe(params => {
      const item = params['item'];
      if (item) {
        const safeEncodedItem = item.replace(/-/g, '+').replace(/_/g, '/');
        const decodedItem = JSON.parse(decodeURIComponent(atob(safeEncodedItem)));
        this.getObjectData=decodedItem;
        const FBNumber =this.getObjectData['FBNumber']
        setTimeout(() => {
          this.ComplaintDetailsForm.patchValue({
            fullName: this.getObjectData['PatientName']?this.getObjectData['PatientName']:null,
            patientContact: this.getObjectData['Cell']?this.getObjectData['Cell']:null, 
            CellNumber: this.getObjectData['Cell1']?this.getObjectData['Cell1']:null, 
            email: this.getObjectData['Email']?this.getObjectData['Email']:null, 
            cmsMessage: this.getObjectData['Feedback']?this.getObjectData['Feedback']:null,
            requestSubject: this.getObjectData['Subject']? this.getObjectData['Subject']:null,
          });
        }, 500);
        // if( this.getObjectData['Subject']){
        //   this.ComplaintDetailsForm.get('requestSubject').disable();
        // }
        if( this.getObjectData['PatientName']){
          this.ComplaintDetailsForm.get('fullName').disable();
        }
        if( this.getObjectData['Cell']){
          this.ComplaintDetailsForm.get('patientContact').disable();
        }
        if( this.getObjectData['Cell1']){
          this.ComplaintDetailsForm.get('CellNumber').disable();
        }
        if( this.getObjectData['Email']){
          this.ComplaintDetailsForm.get('email').disable();
        }
        // if( this.getObjectData['Feedback']){
        //   this.ComplaintDetailsForm.get('cmsMessage').disable();
        // }
      }
    });
    setTimeout(() => {
      this.ComplaintDetailsForm.patchValue({
        requestTypeID: 1,
        requestPriorityID: 1,
      });
    }, 500);
  }
  onChangeOfCategorizedTest() {
    this.getTestProfileList();
    const formValues = this.ComplaintDetailsForm.getRawValue()
    const categorizedTest = formValues.cmsCategoryID;
    this.testCategorization = categorizedTest;
  }
  saveComplaintRrequest() {
    this.isSubmitted = true;
    if (this.ComplaintDetailsForm.invalid) {
      this.toastr.warning('Please Fill The Mandatory Fields');
      return;
    }
    const docsToSave = this.formatUploadedDocsData().filter(a => !a.docId) || [];
    const formValues = this.ComplaintDetailsForm.getRawValue();
    formValues.callBackCheck=formValues.callBackCheck==true?1:0;
    formValues.smsCheck=formValues.smsCheck==true?1:0;
    formValues.visitID = (formValues.visitID || '').trim().toString().replace(/\D/g, '');
    formValues.DepartmentId=formValues.DepartmentId==7?formValues.DepartmentId=2:formValues.DepartmentId;
    // formValues.DepartmentId=formValues.DepartmentId==-1?formValues.DepartmentId=null:formValues.DepartmentId;
    const objParam = {
      CMSTypeID: formValues.requestTypeID,
      CMSCategoryID: formValues.cmsCategoryID,
      CMSSubCategoryID: formValues.cmsSubCategory,
      DepartmentID: formValues.DepartmentId || null,
      LabDepID:formValues.DepartmentId || null,
      TPID: formValues.TPId|| null, //?formValues.TPId.join(","): null 
      FullName: formValues.fullName,
      ComplainantName:formValues.complainantName || null,
      CellNo: formValues.CellNumber || null,
      PatientCLI: formValues.patientContact || null,
      Email: formValues.email || null,
      RequestSubject: formValues.requestSubject,
      RequestMessage: formValues.cmsMessage,
      ReportedError: formValues.reportedError || null,
      CMSStatusID: 1,
      CMSSourceID: formValues.cmsSourceId,
      AssignedByUserID: this.loggedInUser.userid || null,
      CreatedByUserID: this.loggedInUser.userid || null,
      AssignedToUserID:formValues.empID || null, //formValues.empID?formValues.empID.join(","): null || -1,
      AssignedToDeptID: formValues.assignedDepartmentId || null,
      AsignedToBranchID: formValues.assignedBranchName || null,
      VisitID: formValues.visitID || null,
      PatientID: this.patientId || null,
      CMSStatusRemarks: formValues.initialFindings || "NA",
      SubSectionID: null,
      SectionID: formValues.SectionId || null, 
      VisitedBranchID: formValues.BranchID || null,
      RequestPriority: formValues.requestPriorityID || null,
      PatientPortalUserID: formValues.PortalUserID || null,
      SourceID:1,
      IsCallBackRequired:formValues.callBackCheck ,
      IsRegSendSMS:formValues.smsCheck,
      Docs: docsToSave,
    };
    console.log("Save objParam", objParam);
    this.spinner.show(this.spinnerRefs.hcComplaintRequestContainer);
    this.getfeedback.saveCMSrequest(objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.hcComplaintRequestContainer);
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.CompaintID=resp.PayLoad[0].CMSRequestNo;
        Swal.fire({
          icon: 'success',
          title: `Request Sent Successfully`,
          html: '<span class="custom-title">Your Complaint ID is:</span>'+this.CompaintID,
          showCloseButton: true,
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          // cancelButtonColor: '#d33',
          confirmButtonText: 'OK',
          showConfirmButton: true,
        });
        this.ComplaintDetailsForm.get('fullName').enable();
        this.ComplaintDetailsForm.get('PortalUserName').enable();
        this.ComplaintDetailsForm.get('patientContact').enable();
        this.ComplaintDetailsForm.get('visitID').enable();
        this.ComplaintDetailsForm.get('BranchID').enable();
        this.ComplaintDetailsForm.get('email').enable();
        this.ComplaintDetailsForm.controls.patientContact.setValidators([Validators.required]);
        this.ComplaintDetailsForm.reset();
        this.patientId=null;
        this.getVisitID=null;
        this.PPuserID=null;
        this.isSubmitted = false;
        this.clearLoadedDocs()
      }
      else {
        this.toastr.warning('Something Went Wrong');
      }
    }, (err) => {
      this.toastr.error('Something Went Wrong');
      console.log(err);
      this.spinner.hide(this.spinnerRefs.hcComplaintRequestContainer);
    });
  }
  openPatientSearchPopUp() {
    setTimeout(() => {
    this.ModalPopupRef = this.appPopupService.openModal(this.showPatientSearch); 
    }, 500);
  }
  openPatientPortalUserDetails() {
    setTimeout(() => {
    this.ModalPopupRef = this.appPopupService.openModal(this.showPatientPortalUserDetails); 
    }, 500);
  }
  
  closeSearchModal() {
    this.ModalPopupRef.close();
  }
  
  validateCallingCLI() {
    if (this.ComplaintDetailsForm.controls.CellNumber.value) {
      this.ComplaintDetailsForm.controls.patientContact.clearValidators();
    } else {
      this.ComplaintDetailsForm.controls.patientContact.setValidators([Validators.required]);
    }
    this.ComplaintDetailsForm.controls.patientContact.updateValueAndValidity();
  }
  // getCellNumberMask() {
  //   const cellNumber = this.ComplaintDetailsForm.get('CellNumber').value || '';
  //  return cellNumber.length == 10 ? '000-000000?' : '0000-0000000';
  // }
  updateCharacterCountforFindings(event: Event){
    const element = event.target as HTMLTextAreaElement;
    this.remarksControl.setValue(element.value, { emitEvent: false });
    this.remainingCharactersforFindings = 2000 - element.value.length;

  }
  updateCharacterCount(event: Event) {
    const element = event.target as HTMLTextAreaElement;
    this.remarksControl.setValue(element.value, { emitEvent: false });
    this.remainingCharacters = 2000 - element.value.length;
  }

  getSubDepartment() {
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

  getCitiesList() {
    this.spinner.show(this.spinnerRefs.hcComplaintRequestContainer)
    this.lookupService.getCities({ CountryId: 168 }).subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.citiesList = res.PayLoad;
        setTimeout(() => {
    this.spinner.hide(this.spinnerRefs.hcComplaintRequestContainer) 
        }, 200);
      }
    }, (err) => {
      console.log(err);
    });
  }
  getLocationList() {
    this.branchList = [];
    const _param = {};
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
  getCMSPriorityList() {
    this.priorityList = [];
    const _param = {};
    this.lookupService.GetCMSPriorityList().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.priorityList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
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
  getCMSsubCategoryData() {
    const formValues=this.ComplaintDetailsForm.getRawValue();
    const params={
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
  clearTestSection(){
    this.ComplaintDetailsForm.patchValue({
      SectionId:null,
      TPId:null,
    });
  }
  getSubSection() {
    this.subSectionList = [];
    const formValues = this.ComplaintDetailsForm.getRawValue();
    const objParm = {
      SectionID: -1,
      LabDeptID: formValues.DepartmentId,
    }    
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      console.log(err)
      this.toastr.error('Connection error');
    })
  }
  getCMSrequestType() {
    this.getfeedback.getCMSreqType().subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.cmsRequestTypeList = resp.PayLoad;
        
        this.cmsRequestTypeList = this.cmsRequestTypeList.filter(a=> {return a.IsShowInDropDown == true})
        console.log("  this.cmsRequestTypeList",   this.cmsRequestTypeList)
      }
      else {
        this.toastr.warning(resp.Message);
        return;
      }
    }, (err) => {
      console.log(err)
    });
  }

  getCityAreas(CityID) {
    this.cityAreasList = []
    const objParam = {
      CityID: CityID
    }
    this.lookupService.getHCCityAreas(objParam).subscribe((resp: any) => {
      this.cityAreasList = resp.PayLoad || [];
      if (!this.cityAreasList.length) {
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }
  getTestProfileList() {
    this.testList = [];
    const _param = {
      branchId: 1, //null
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: ''
    };
    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.testList = data || [];
      }
    }, (err) => {
      console.log(err);
    })

  }
  getEmployeesData() {
    this.employeesList = [];
    const formValues= this.ComplaintDetailsForm.getRawValue();

    const objParam = {
      DepartmentId: formValues.assignedDepartmentId || -1, 
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
  cmsRequestSourceList:any;
  getCMSrequestSourceList() {
    this.cmsRequestSourceList = [];
    // let params ={
    //   CMSCategoryID: 1,
    // }
    this.getfeedback.getCMSrequestsource().subscribe((res: any) => {
      if (res && res.StatusCode == 200 ) {
        this.cmsRequestSourceList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  getEventValues
  getUserDetails(event){
  this.PPuserID=null;
  this.patientId=null;
  this.getVisitID=null;
  console.log("getUserDetails ~ event:", event)
  this.getEventValues=event;
  // this.cd.detectChanges();
  setTimeout(() => {
  this.PPuserID=this.getEventValues['PatientPortalUserID'];
  }, 500);
  this.ComplaintDetailsForm.reset();
  this.ComplaintDetailsForm.get('fullName').enable();
  this.ComplaintDetailsForm.get('patientContact').enable();
  this.ComplaintDetailsForm.get('visitID').enable();
  this.ComplaintDetailsForm.get('BranchID').enable();
  this.ComplaintDetailsForm.get('PortalUserName').enable();
  this.ComplaintDetailsForm.get('email').enable();
  this.spinner.show(this.spinnerRefs.hcComplaintRequesTable);
  
  this.email=this.getEventValues['Email'];
  setTimeout(() => {
    this.ComplaintDetailsForm.patchValue({
      requestTypeID: 1,
      requestPriorityID: 1,
      fullName: this.getEventValues['Name'],
      patientContact: this.getEventValues['CellNumber'],
      PortalUserID: this.getEventValues['PatientPortalUserID'],
      PortalUserName:this.getEventValues['LoginName'],
      email: this.getEventValues['Email'],
    });
  }, 500);
  this.ComplaintDetailsForm.get('fullName').disable();
  this.ComplaintDetailsForm.get('patientContact').disable();
  this.ComplaintDetailsForm.get('PortalUserName').disable();
  
  if (this.email) {
    this.ComplaintDetailsForm.get('email').disable();
  }
  this.closeSearchModal(); 
    this.spinner.hide(this.spinnerRefs.hcComplaintRequesTable);
  }
  
  disableDepartment(event: any) {
    if (event) {
      this.ComplaintDetailsForm.get("assignedDepartmentId").disable();
    } else {
      this.ComplaintDetailsForm.get("assignedDepartmentId").enable();
    }
  }
  disableBranch(event: any) {
    if (event) {
      this.ComplaintDetailsForm.get("assignedBranchName").disable();
    } else {
      this.ComplaintDetailsForm.get("assignedBranchName").enable();
    }
  }
  
  
  getVisitData(data){
    this.PPuserID=null;
    this.getVisitID = null;
    this.patientId = null;
    console.log("🚀 getVisitData ~ data:", data);
    // this.ComplaintDetailsForm.reset();
    // this.ComplaintDetailsForm.get('fullName').enable();
    // this.ComplaintDetailsForm.get('PortalUserName').enable();
    // this.ComplaintDetailsForm.get('patientContact').enable();
    // this.ComplaintDetailsForm.get('visitID').enable();
    this.spinner.show(this.spinnerRefs.hcComplaintRequesTable);
    this.getTableValues = data;
    // this.VisitID = this.getTableValues['VisitNo'];
    this.getVisitID = this.getTableValues['VisitID'];
    this.patientId = this.getTableValues['PatientID'];
    // setTimeout(() => {
    //   this.ComplaintDetailsForm.patchValue({
    //     requestTypeID: 1,
    //     requestPriorityID: 1,
    //     visitID: this.getVisitID || '',
    //   });
    // }, 500);
    // if (this.getVisitID) {
    //   this.ComplaintDetailsForm.get('visitID').disable();
    // }
    this.closeSearchModal();
    this.spinner.hide(this.spinnerRefs.hcComplaintRequesTable);
  }


  getSearchPatientData(event) {
    this.PPuserID=null;
    this.getVisitID = null;
    this.patientId = null;
    console.log("🚀getSearchPatientData Search ~ event:", event);
    // this.ComplaintDetailsForm.reset();
    // this.ComplaintDetailsForm.get('fullName').enable();
    // this.ComplaintDetailsForm.get('PortalUserName').enable();
    // this.ComplaintDetailsForm.get('patientContact').enable();
    // this.ComplaintDetailsForm.get('visitID').enable();
    this.spinner.show(this.spinnerRefs.hcComplaintRequesTable);
    this.getTableValues = event;
    // this.patientName = `${this.getTableValues['SalutationTitle']} ${this.getTableValues['FirstName']} ${this.getTableValues['LastName'] || ''}`;
    // this.remarks = `${this.getTableValues['HomeAddress'] || ''} ${this.getTableValues['OrbitMRNo'] || ''} ${this.getTableValues['PhoneNO'] || ''}`;
    // this.VisitID = this.getTableValues['VisitID'];
    this.getVisitID = this.getTableValues['VisitID'];
    this.patientId = this.getTableValues['OrbitPatientID'];
    // this.contactNumber = this.getTableValues['MobileNO'];

    // setTimeout(() => {
    //   this.ComplaintDetailsForm.patchValue({
    //     requestTypeID: 1,
    //     requestPriorityID: 1,
    //     fullName: this.patientName,
    //     patientContact: this.contactNumber,
    //     visitID: this.getVisitID || '',
    //     CityID: this.getTableValues['CityID'],
    //     cmsMessage: this.remarks,
    //   });
    // }, 500);
    // this.ComplaintDetailsForm.get('fullName').disable();
    // this.ComplaintDetailsForm.get('patientContact').disable();
    // if (this.VisitID) {
    //   this.ComplaintDetailsForm.get('visitID').disable();
    // }
    this.closeSearchModal(); 
      this.spinner.hide(this.spinnerRefs.hcComplaintRequesTable);
  }
  
  getCardValues(event){
  console.log("getCardValues ~ event:", event);
  this.getEventCardValues=event;
  this.branchID=this.getEventCardValues['RegistrationLocationID']
  this.patientName = `${this.getEventCardValues['SalutationTitle']} ${this.getEventCardValues['FirstName']} ${this.getEventCardValues['LastName'] || ''}`;
  // this.getVisitID = this.getEventCardValues['VisitID'];
  this.ComplaintDetailsForm.reset();
  this.ComplaintDetailsForm.get('fullName').enable();
  this.ComplaintDetailsForm.get('patientContact').enable();
  this.ComplaintDetailsForm.get('visitID').enable();
  this.ComplaintDetailsForm.get('PortalUserName').enable();
  this.ComplaintDetailsForm.get('BranchID').enable();
  this.ComplaintDetailsForm.get('email').enable();
  this.spinner.show(this.spinnerRefs.hcComplaintRequesTable);
  
  setTimeout(() => {
    this.ComplaintDetailsForm.patchValue({
      requestTypeID: 1,
      requestPriorityID: 1,
      fullName: this.patientName,
      patientContact: this.getEventCardValues['MobileNO'],
      visitID: this.getEventCardValues['VisitID'] || '',
      BranchID: this.branchID || '',
    });
  }, 500);
  this.ComplaintDetailsForm.get('fullName').disable();
  this.ComplaintDetailsForm.get('patientContact').disable();
  if(this.getVisitID){
    this.ComplaintDetailsForm.get('visitID').disable();
  }
  if(this.branchID ){
    this.ComplaintDetailsForm.get('BranchID').disable();
  }
  this.closeSearchModal(); 
      this.spinner.hide(this.spinnerRefs.hcComplaintRequesTable);
  }
  getLabSectionIDList
  getLabSectionID() {
    const formValues = this.ComplaintDetailsForm.getRawValue();
    if (formValues.TPId) {
      const objParm = {
        TPID:formValues.TPId || null,
      }    
      this.lookupService.GetTestInfoByTPID(objParm).subscribe((resp: any) => {
        const _response = resp.PayLoad;
        this.getLabSectionIDList = _response;
        console.log(" this.getLabSectionIDList :", this.getLabSectionIDList )
        setTimeout(() => {
          this.ComplaintDetailsForm.patchValue({
            DepartmentId:this.getLabSectionIDList[0].LabdepID==7?this.getLabSectionIDList[0].LabdepID=2:this.getLabSectionIDList[0].LabdepID,
            SectionId:this.getLabSectionIDList[0].SectionID,
          });
        }, 300);
      }, (err) => {
        console.log(err)
        this.toastr.error('Connection error');
      })
    }
    else {
      setTimeout(() => {
        this.ComplaintDetailsForm.patchValue({
          SectionId:null,
          DepartmentId:-1,
        });
      }, 300);
    }
  }
  copyText(text: string) {
    this.helperService.copyMessage(text);
  }
  countList:any;
  getCMSSubmittedRequestCountStats() {
    this.countList = [];
    // let formValues = this.filterForm.getRawValue();
    // formValues.dateFrom = formValues.dateFrom
    //   ? Conversions.formatDateObject(formValues.dateFrom)
    //   : null;
    // formValues.dateTo = formValues.dateTo
    //   ? Conversions.formatDateObject(formValues.dateTo)
    //   : null;
    const objParm = {
      CreatedByUserID:this.loggedInUser.userid,
      // DateFrom: formValues.dateFrom,
      // DateTo: formValues.dateTo,
    };
    this.getfeedback.getCMSCountByCreatedByUserID(objParm).subscribe((resp: any) => {
        console.log("🚀this.getfeedback.getCMSCountByCreatedByUserID ~ resp:", resp)
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.countList = resp.PayLoad[0];
          console.log("getCMSSubmittedRequestCountStats ~ this.countList:", this.countList)
        } else {
          this.toastr.warning('Something went wrong');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  docDefault = true;
  clearLoadedDocs() {
    this.loadedDocuments = []; 
    this.getLoadedDocs(null);
    this.docDefault = false;
  }

  loadedDocuments: any[];

  getLoadedDocs(event) {
    console.log("event:", event);
    this.docDefault = true;
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

  formatUploadedDocsData() {
    const docs = [];
    this.loadedDocuments.filter(a => !a.docId).forEach(a => {
      const d = {
        DocId: null,
        Title: a.fileName,
        Remarks: '',
        Doc: null,
        CreatedBy: this.loggedInUser.userid,
        RefId: null,
        DocTypeId: 26,
        GDocBase64: a.data,
        GDocBase64Thumbnail: '', 
        GDocFileType: a.fileType,
        DirPath: null
      };
      docs.push(d);
    })

    return docs;
  }
}
