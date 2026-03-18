// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { FeedbackService } from '../../service/feedback.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { HcSharedService } from 'src/app/modules/home-sampling/services/hc-shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { HcDashboardService } from 'src/app/modules/home-sampling/services/hc-dashboard.service';

@Component({
  standalone: false,

  selector: 'app-cc-hc-request',
  templateUrl: './cc-hc-request.component.html',
  styleUrls: ['./cc-hc-request.component.scss']
})
export class CcHcRequestComponent implements OnInit {
  @ViewChild('showPatientSearch') showPatientSearch;



  PatientDetails: FormGroup  = this.fb.group({
    patientName: ['', Validators.required],
    CellNumber: ['', Validators.required],
    phone: [''],
    CityID: [, Validators.required],
    HCServiceID: [, Validators.required],
    cmsSourceId: [, Validators.required],
    remarks: ['', Validators.required]
  });
  isSubmitted = false;
  loggedInUser: UserModel;
  hcHomeVisitRequest: any = [];
  citiesList: any = [];
  HCServiceList = [];
  remainingCharacters = 0;
  remarksControl = new FormControl();
  getTableValues: any;
  spinnerRefs = {
    hcRequesTable: 'hcRequesTable',
    hcRequesDetail: 'hcRequesDetail',
    hcRequesContainer: 'hcRequesContainer',
  }
  patientName = "";
  remarks = "";
  patientID = "";
  contactNumber = "";

  constructor(private fb: FormBuilder,
    private lookupService: LookupService,
    private getfeedback: FeedbackService,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private HcReqSharedService: HcSharedService,
    private modalService: NgbModal,
    private appPopupService: AppPopupService,
    private HCService: HcDashboardService,
  ) { }

  ngOnInit(): void {
   
    this.PatientDetails 
    // this.getHCBookingDeatil();
    this.loadLoggedInUserInfo();
    this.getCMSrequestSourceList();
    this.getCitiesList();
    this.getServicesList();
    this.getCMSSubmittedRequestCountStats();
    
  }

  saveCCHCRrequest() {

    this.isSubmitted = true;
    let formValues = this.PatientDetails.getRawValue();

    // let objParam = {
    //   CMSTypeID: 3, //3 for Type Req  request
    //   FullName: formValues.patientName,
    //   ComplainantName: formValues.patientName || null,
    //   CellNo: formValues.CellNumber,
    //   PatientCLI: formValues.patientContact || null,

    //   RequestSubject:  formValues.phone,
    //   RequestMessage:formValues.remarks,
    //   HCCityID: formValues.CityID,
    //   CMSStatusID: 1,
    //   CreatedByUserID: this.loggedInUser.userid || null,
    //   PatientID: this.patientID || null,
    //   SourceID: 1,
    //   CMSRequestTypeDetailID: 1 // for CMSRequestType Home Collection
    // };
    let objParm = {
      CreatedByUserID: this.loggedInUser.userid,
      CityID: formValues.CityID,
      PatientName: formValues.patientName,
      HCServiceID:formValues.HCServiceID,
      Cell: formValues.CellNumber,
      Subject: formValues.phone,
      Message: formValues.remarks,
      VisitNo: null,
      PatientFeedbackRating: null,
      PatientPortalUserID: null,
      FeedBackType: 5, /// FeedBackType => 1 is Feedback /// FeedBackType -> 2 is complaint  /// FeedBackType -> 3 is Request  
      FeedBackPlatform: 1, ///// ---1=Web, 2=Android, /// 3=IOS,  /// 4=Feedback MACHINE,  /// 5=Home Collection Admin, /// 6=Home Collection Patient, /// 7= Home Collection Booking Request
    };
    // console.log("ObJParm", objParm);
    if (this.PatientDetails.valid) {
      this.getfeedback.saveCCRFeedback(objParm).subscribe((resp: any) => {
        this.spinner.show(this.spinnerRefs.hcRequesDetail);
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.toastr.success('HC Request Submitted');
          setTimeout(() => {
            this.spinner.hide(this.spinnerRefs.hcRequesDetail);
          }, 1000);
          this.PatientDetails.reset();
          this.getHCBookingDeatil();
          this.isSubmitted = false;
        }
        else {
          this.toastr.warning('Something Went Wrong');
          this.spinner.hide(this.spinnerRefs.hcRequesDetail);
        }
      }, (err) => {
        console.log(err)
        this.spinner.hide(this.spinnerRefs.hcRequesDetail);
      });
    }
    else {
      this.toastr.warning('Please Fill The Mandatory fields');
    }
    this.PatientDetails.get('patientName').enable();
    this.PatientDetails.get('CellNumber').enable();
  }


  getHCBookingDeatil() {
    // let params = {
    //   DateFrom: 'F',
    //   DateTo: 'T',
    // }
    this.spinner.show(this.spinnerRefs.hcRequesContainer)

    this.HcReqSharedService.getHCBookingRequestsByCCR().subscribe((resp: any) => {
      // console.log(resp);
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.hcHomeVisitRequest = resp.PayLoad;
        setTimeout(() => {
          this.spinner.hide(this.spinnerRefs.hcRequesContainer)
        }, 200);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.hcRequesContainer)
      console.log(err)
    })
  }

  getCitiesList() {
    // this.citiesList = [];
    this.HCService.getHCCities().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.citiesList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }

  getServicesList() {
    // this.HCServiceList = [];
    this.HCService.getHCServices().subscribe((res: any) => {
      if (res.StatusCode === 200) {
        this.HCServiceList = JSON.parse(res.PayLoadStr);
        console.log("this.HCServiceList:", this.HCServiceList)
      }
    }, (err) => {
      console.log(err);
    });
  }
  
  saveComplaintRrequest() {
    
    this.loadLoggedInUserInfo();
    let formValues = this.PatientDetails.getRawValue();
    let docsToSave = this.formatUploadedDocsData().filter(a => !a.docId) || [];
    if(this.PatientDetails.invalid){
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    let objParam = {
      CMSTypeID: 5, //5 for Type HC   request
      FullName: formValues.patientName,
      ComplainantName: formValues.patientName || null,
      CellNo: formValues.CellNumber,
      PatientCLI: formValues.phone || null,
      HCServiceID:formValues.HCServiceID,
      // RequestSubject: formValues.phone,
      RequestMessage: formValues.remarks,
      HCCityID: formValues.CityID,
      CMSStatusID: 1,
      CreatedByUserID: this.loggedInUser.userid || null,
      PatientID: this.patientID || null,
      CMSSourceID: formValues.cmsSourceId || 10, // 5 My IDC Web Application
      Docs: docsToSave,
      // CMSRequestTypeDetailID: 1, // for CMSRequestType Home Collection
      
    };
    this.spinner.show(this.spinnerRefs.hcRequesTable);
    this.getfeedback.saveCMSrequest(objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.hcRequesTable);
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.toastr.success('HC Request Submitted');
        this.PatientDetails.reset();
        this.clearLoadedDocs();
        this.PatientDetails.get('patientName').enable();
        this.PatientDetails.get('CellNumber').enable();
        this.isSubmitted = false;
        this.patientID = null;
      }
      else {
        this.toastr.warning('Something Went Wrong');
        this.spinner.hide(this.spinnerRefs.hcRequesTable);
      }
    }, (err) => {
      this.toastr.error('Connection Error');
      this.spinner.hide(this.spinnerRefs.hcRequesTable);
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

  loadedDocuments: any[];
  docDefault = true;
  clearLoadedDocs() {
    this.loadedDocuments = []; 
    this.getLoadedDocs(null);
    this.docDefault = false;
  
  }

  getLoadedDocs(event) {
    
    this.docDefault = true;
    this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array
  
    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document
  
    if (latestDoc) {
      const base64String = latestDoc.data; // Your base64 image string
      const binaryData = base64String;
      const sizeInBytes = binaryData.length;
      const sizeInKB = sizeInBytes / 1024;
      if (sizeInKB > 100) {
        this.toastr.warning('Image size should be less than 100KB');
        return;
      }
    }
  }
  formatUploadedDocsData() {
    let docs = [];
    this.loadedDocuments.filter(a => !a.docId).forEach(a => {
      let d = {
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

  getValueFromTable(event) {
    console.log("🚀 getValueFromTable ~ event:", event)
    this.spinner.show(this.spinnerRefs.hcRequesTable);
    this.getTableValues = event;
    this.patientName = `${this.getTableValues['SalutationTitle']} ${this.getTableValues['FirstName']} ${this.getTableValues['LastName'] || ''}`;
    this.remarks = `${this.getTableValues['HomeAddress'] || ''}`;
    this.patientID = this.getTableValues['OrbitPatientID'];
    this.contactNumber = this.getTableValues['MobileNO'];

    setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.hcRequesTable);
    }, 1000);

    this.PatientDetails.patchValue({
      patientName: this.patientName,
      CellNumber: this.contactNumber,
      phone: this.getTableValues['PhoneNO'] || '',
      // CityID: this.getTableValues['CityID'],
      remarks: this.remarks,
    });

    this.PatientDetails.get('patientName').disable();
    this.PatientDetails.get('CellNumber').disable();
    this.closeLoginModal();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  updateCharacterCount(event: Event) {
    const element = event.target as HTMLTextAreaElement;
    this.remarksControl.setValue(element.value, { emitEvent: false });
    this.remainingCharacters = 0 + element.value.length;
  }
  closeLoginModal() {
    this.modalService.dismissAll();
  }

  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  openPatientSearchPopUp() {
    setTimeout(() => {
      this.appPopupService.openModal(this.showPatientSearch);
    }, 100);
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
    let objParm = {
      CreatedByUserID:this.loggedInUser.userid,
      // DateFrom: formValues.dateFrom,
      // DateTo: formValues.dateTo,
    };
    this.getfeedback.getCMSCountByCreatedByUserID(objParm).subscribe((resp: any) => {
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.countList = resp.PayLoad[0];
        } else {
          this.toastr.warning('Something went wrong');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
