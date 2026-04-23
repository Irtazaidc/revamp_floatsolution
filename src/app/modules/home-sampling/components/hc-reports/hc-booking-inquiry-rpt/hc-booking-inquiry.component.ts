// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { environment } from 'src/environments/environment';
import { HcBookingInquiryService } from '../../../services/hc-booking-inquiry.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-hc-booking-inquiry',
  templateUrl: './hc-booking-inquiry.component.html',
  styleUrls: ['./hc-booking-inquiry.component.scss']
})
export class HcBookingInquiryComponent implements OnInit {
  @ViewChild('showImage') showImage;
  visitID = 0;
  riderId = null;
  VisitsList: any = [];
  VisitsDetailList: any = [];
  paginatedSearchResults: any = [];
  PatientInfo: any = [];
  RiderInfo: any = [];
  masterSelected = false;
  collectionSize = 0;
  page = 1;
  pageSize = 8;
  checklist: any = [];
  SelectedTPs: any = [];
  checkedList: any = [];
  commaseparatedTPIds: any = [];
  disableViewTestRow = false;
  visitDetailsList: any = [];
  selVisit: any = "";
  searchInVisitList: any = "";
  searchInTestDetail: any = "";
  isDueBalance = false;
  DueBalanceAmount: any = 0;
  IsMasterDisable = false;
  patientReportUrl: any = "";
  isScreen = 0;
  isTPDetailScreen = false;
  isDeliverButtonAllowed = false;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  hcBookingInqList: any = [];
  hcBookingDocument: any = [];
  bookingInqForm = this.fb.group({
    bookingid: ['', Validators.compose([Validators.required])],
  });
  ImageUrl: any;
  deliverRptTitle = "Deliver Reports";
  SelRow: any;
  HighlightRow: any;
  spinnerRefs = {
    deliverReportsSpinnerRef: 'deliverReportsSpinnerRef',
    updatePicture:'updatePicture'
  }
  loggedInUser: UserModel;
  invoiceCopyType = 1;
  BookingPatientID: any;
  HCDateTime: any;
  CommaSepTPs: any;
  selBookingID = null;
  VisitNo: any = "";

  constructor(private toastr: ToastrService,
    private printRptService: PrintReportService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private hcbookingInqServ: HcBookingInquiryService,
    private appPopupService: AppPopupService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // this.getHCBookingInquiryData();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  patientId = null;
  getHCBookingInquiryData() {
    this.spinner.show();
    // let hcBookingId = "98983474";
    this.hcBookingInqList = [];
    this.riderId = null;
    const formValues = this.bookingInqForm.getRawValue();
    if (!formValues.bookingid) {
      this.toastr.warning("Please Enter Booking ID")
      return;
    }
    else {
      const params = {
        "BookingID": formValues.bookingid
      }
      this.selBookingID = formValues.bookingid || null;
      this.hcbookingInqServ.getHCBookingInquiry(params).subscribe((resp: any) => {
        // console.log("Data", resp);
        this.spinner.hide();
        if (resp.StatusCode == 200) {
          if (!resp.PayLoad.length) {
            this.toastr.warning("No record found")
            return;
          }
          this.hcBookingInqList = resp.PayLoad;
          this.GetBookingPatientDocument();
          this.riderId = this.hcBookingInqList
          .filter(a => a.RiderID !== null) 
          .sort((a, b) => new Date(b.ActionDateTime).getTime() - new Date(a.ActionDateTime).getTime()) 
          .map(a => a.RiderID)[0] || null;
          // this.VisitNo = resp.PayLoadDS.Table[0].VisitNo;
         
          this.patientId = this.hcBookingInqList.find(f => f.PatientId).PatientId || null;
          //resp.PayLoad[0].BookingPatientID;
          const selVisit = resp.PayLoad[0].PIN;
          this.selVisit = selVisit.replace(/-/g, "");
        }
      }, (err) => {
        this.spinner.hide();
        console.log(err)
      });
    }
  }
  ImageTitle = null;
  GetBookingPatientDocument() {
    this.hcBookingDocument = [];
    this.ImageTitle = '';
    this.ImageUrl = null;
    const formValues = this.bookingInqForm.getRawValue();
      const params = {
        BookingID: formValues.bookingid,
      }
      this.spinner.show(this.spinnerRefs.updatePicture);
      this.hcbookingInqServ.GetBookingPatientDocument(params).subscribe((resp: any) => {
        console.log("Data", resp);
        this.spinner.hide(this.spinnerRefs.updatePicture);
        if (resp.StatusCode == 200) {
          if (!resp.PayLoad.length) {
            this.toastr.warning("No record found")
            return;
          }
          this.hcBookingDocument = resp.PayLoad;
          this.ImageUrl = this.hcBookingDocument[0].DocumentPic || null; 
          this.ImageTitle = this.hcBookingDocument[0].BookingPatientDocumentTitle || ''; 
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.updatePicture);
        console.log(err)
      });
  }

  showSpinner(name = '') {
    if (name) {
      this.spinner.show(name);
    } else {
      this.spinner.show();
    }
  }
  hideSpinner(name = '') {
    if (name) {
      this.spinner.hide(name);
    } else {
      this.spinner.hide();
    }
  }

  viewFullImage(){
    console.log("🚀 ~ HcBookingInquiryComponent ~ viewFullImage ~ viewFullImage:")
    this.appPopupService.openModal(this.showImage, {
      backdrop: "static",
      size: "lg",
    });
  }
  

}
