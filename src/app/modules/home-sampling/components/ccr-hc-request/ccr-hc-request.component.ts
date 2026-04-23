// @ts-nocheck
import { Component, OnInit, Output,EventEmitter, ViewChild } from '@angular/core';
import { HcBookingInquiryService } from '../../services/hc-booking-inquiry.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { FeedbackService } from 'src/app/modules/rms/service/feedback.service';
import { Router } from '@angular/router';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ComplaintDashboardService } from 'src/app/modules/complaints-feedback/services/complaint-dashboard.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { FormBuilder, Validators } from '@angular/forms';



@Component({
  standalone: false,

  selector: 'app-cc-hc-request',
  templateUrl: './ccr-hc-request.component.html',
  styleUrls: ['./ccr-hc-request.component.scss']
})



export class CcrHcRequestComponent implements OnInit {

  @Output() hcHomeCollectionRequestLength = new EventEmitter<number>();
   

  @ViewChild('showCMSDocuments') showCMSDocuments;
  @ViewChild('saveCallBackDetail') saveCallBackDetail;
  docsPopupRef: NgbModalRef;
  callbackPopupRef: NgbModalRef;

  paginatedSearchResults = [];
  paginatedSearchSummaryResults = [];
  // page = 1;
  // pageSize = 20;
  // collectionSize = 0;

  loadedDocuments: any[];
  filter = 26;
  screenIdentity = 'CMS';
  allowRemove = false;
  getCMSRequestID = null;
  hcHomeCollectionRequest = []
  searchText = ''


  paginationForHCRequest = {
    page: 1,
    pageSummary : 1,
    pageSummarySize : 20,
    pageSize: 20,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  spinnerRefs = {
    hcRequesTable: 'hcRequesTable',
    hcRequesDetail: 'hcRequesDetail',
    hcRequesContainer: 'hcRequesContainer',
  };
  contactBackHistory: any = [];
  
  formForDate = this.formBuilder.group({ 
    dateFrom: ['',Validators.required], 
    dateTo: ['',Validators.required], 
  });
  isSubmitted: any;

  constructor(
    private hcRequest: HcBookingInquiryService,
    private lookupService: LookupService,
    private getfeedback: FeedbackService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private appPopupService: AppPopupService,
    private complaintDashboardService: ComplaintDashboardService,
  ) { }

  ngOnInit(): void {
   
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.formForDate.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.getHCBookingDeatil();
    }, 600);
  }


  getHCBookingDeatil() {
    this.hcHomeCollectionRequest = []
    this.paginationForHCRequest.paginatedSearchResults = []

    const formValues = this.formForDate.getRawValue();

    if (this.formForDate.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom),
      DateTo: Conversions.formatDateObject(formValues.dateTo),
    };
    this.spinner.show(this.spinnerRefs.hcRequesContainer)
    this.hcRequest.getHCBookingRequestsByCCR(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.hcRequesContainer)
      if (resp.StatusCode == 200) {
        if (resp.PayLoadDS.Table.length) {
          this.hcHomeCollectionRequest = resp.PayLoadDS.Table || [];
          // this.hcHomeCollectionRequest = this.hcHomeCollectionRequest.filter(item => item.CMSStatusID !== 8);
          this.refreshPaginationForHCRequest();
          this.hcHomeCollectionRequestLength.emit(this.hcHomeCollectionRequest.length);
        }
        else {
          // this.toastr.info('No Record Found');
          this.hcHomeCollectionRequest = [];
          this.paginationForHCRequest.paginatedSearchResults = []
        }
      }
      else {
        this.toastr.info('Error!')
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.hcRequesContainer)
      this.toastr.error('Connection Error')
      console.log(err)
    })
  }
  bookingDetail: any
  loggedInUser
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  navigateToHcBooking(event) {
    console.log("selectedRequest ~ event:", event)
    this.bookingDetail = event;
    window.open('#/pat-reg/hc-booking?' + 'ccrBooking=' + btoa(JSON.stringify(this.bookingDetail)), '_blank');

  }

  refreshPaginationForHCRequest() {
    // Apply search filter to the full dataset
    const filteredResults = this.hcHomeCollectionRequest.filter(patient => {
      const name = patient.Name?.toLowerCase() || '';
      const mobileNo = patient.MobileNO?.toLowerCase() || '';
      const cmsRequestNo = patient.CMSRequestNo?.toLowerCase() || '';
      const search = this.searchText?.toLowerCase() || '';
  
      return (
        !search ||
        name.includes(search) ||
        mobileNo.includes(search) ||
        cmsRequestNo.includes(search)
      );
    });
  
    // Update filtered results
    this.paginationForHCRequest.filteredSearchResults = filteredResults;
    this.paginationForHCRequest.collectionSize = filteredResults.length;

    // Reset page number to 1 if the current page exceeds the available pages after filtering
  const totalPages = Math.ceil(filteredResults.length / this.paginationForHCRequest.pageSize);
  if (this.paginationForHCRequest.page > totalPages) {
    this.paginationForHCRequest.page = totalPages || 1;
  }
  
    // Paginate the filtered results
    this.paginationForHCRequest.paginatedSearchResults = filteredResults.slice(
      (this.paginationForHCRequest.page - 1) * this.paginationForHCRequest.pageSize,
      this.paginationForHCRequest.page * this.paginationForHCRequest.pageSize
    );
  }

  // refreshPagination() {
  //   this.collectionSize = this.hcHomeCollectionRequest.length;
  //   this.paginatedSearchResults = this.hcHomeCollectionRequest
  //     .map((item, i) => ({ id: i + 1, ...item }))
  //     .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  // }



  cancelCMSRequest(event){
  console.log("🚀 ~ CcrHcRequestComponent ~ CancelRequest ~ event:", event);
  const objParm = {
    CMSRequestID: event.CMSRequestID,
    CMSStatusID:  8, //Cancelled
    CreatedBy: this.loggedInUser.userid,
    FullName:  event.FullName || null,
    PatientCLI: event.PhoneNO || null,
    CellNo:  event.MobileNO || null,
    CMSTypeID:  event.CMSTypeID || null,
    RequestMessage:  event.RequestMessage || null,
    CMSStatusRemarks: "Cancelled",
    CMSSourceID: event.CMSSourceID || null,

    ComplainantName:  null,
    LabDepID:  null,
    AsignedToBranchID:  null,
    RequestSubject:  null,
    ReportedError:  null,
    PatientID:  null,
    VisitID:  null,
    RequestPriority:  null,
    VisitedBranchID:  null,
    PatientPortalUserID: null,
    Email: null,
    SubSectionID: null,
    SectionID:  null,
    CMSCategoryID:  null,
    CMSSubCategoryID:  null,
    TPID:  null,
    //
    tblCMSRequestAssigned:  [{ AssignedToUserID: null }],
    tblCMSResponsiblePerson: [{ ResponsiblePersonUserID: null }],
    tblCMSActionTaken:  [{ ActionTakenID: null }],
  };
  this.spinner.show(this.spinnerRefs.hcRequesContainer)
  this.complaintDashboardService.updateCMSRequestStatus(objParm).subscribe((resp: any) => {
    this.spinner.hide(this.spinnerRefs.hcRequesContainer)
    if (resp.StatusCode == 200) {
      this.toastr.success("Request has been cancelled!");
      this.getHCBookingDeatil();
    } else {
      this.toastr.error("Error!");
    }
  },
    (err) => {
      console.log(err);
      this.toastr.error("Something Went Wrong");
      this.spinner.hide(this.spinnerRefs.hcRequesContainer)
    }
  );
  }

  getLoadedDocs(event) {
    this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array
    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document
    if (latestDoc) {
      const base64String = latestDoc.data; // Your base64 image string
      const binaryData = base64String;
      const sizeInBytes = binaryData.length;
      const sizeInKB = sizeInBytes / 1024;
    }
  }
  getHistoryOfCMSContactBackTracking(event) {
    const objParm = {
      CMSRequestID: event.CMSRequestID,
    };
    this.complaintDashboardService.getHistoryOfCMSContactBack(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.contactBackHistory = resp.PayLoad;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Something Went Wrong');
    });
  }
  showDocument(event) {
    this.getCMSRequestID = event.CMSRequestID

    setTimeout(() => {
      this.docsPopupRef = this.appPopupService.openModal(this.showCMSDocuments, {
        backdrop: "static",
        size: "lg",
      });
    }, 200);
  }


  OpenCallBackDetail(event) {
    this.getCMSRequestID = event.CMSRequestID

    setTimeout(() => {
      this.callbackPopupRef = this.appPopupService.openModal(this.saveCallBackDetail, {
        backdrop: "static",
        size: "lg",
      });
    }, 200);
    this.getHistoryOfCMSContactBackTracking(event);
  }
  rowIndex = 0
  getIndex(index){
    this.rowIndex = index;
  }
 
  saveAndRefresh() {
    this.callbackPopupRef.close();
    this.getHCBookingDeatil();

  }
}