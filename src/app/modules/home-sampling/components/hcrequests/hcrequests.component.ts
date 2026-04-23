// @ts-nocheck
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, UserModel } from 'src/app/modules/auth';
// import { SignalrService } from 'src/app/modules/lab-configs/services/signalr.service';
import { HcBookingService } from 'src/app/modules/patient-booking/services/hc-booking.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { environment } from 'src/environments/environment';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { SignalRService } from '../../services/signal-r.service';
import { ScrollToBottomDirective } from './scroll-to-bottom.directive';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { ChatService } from '../../services/ChatService.service';


@Component({
  standalone: false,

  selector: 'app-hcrequests',
  templateUrl: './hcrequests.component.html',
  styleUrls: ['./hcrequests.component.scss']
})
export class HCRequestsComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy = new Subject<'T'>();
  destroy$ = new Subject<void>();
  private searchEventSubscription: Subscription;
  advancedSearchEnabled = false;
  public isCollapsed = false;
  HCRequestList: any = [];
  mapName: any = "";
  RidersDetailList: any = [];
  isLoading$: Observable<boolean>;
  CitiesList: any = [];
  HomeCollectionCites: any = [];
  SearchVisitNo: any = "";
  isAllowFullScreen = false;
  RiderStatusList: any = [];
  HCBranchesList: any;
  selBranchid: any;
  selBranchidF: any;
  RiderAdminFeedBack: any = "";
  SelTechIDToAssign: any = null;
  SelhelpingStaffIDToAssign: any = null;
  SelDoctorIDToAssign: any = null;
  enableRadioServicesActions: any = false;

  @ViewChild('MapView') MapView;
  @ViewChild('ViewInquiry') ViewInquiry;
  @ViewChild('RequestDetailModal') RequestDetailModal;
  @ViewChild('EditOnlineReqModal') EditOnlineReqModal;
  @ViewChild('AssignRiderWithScheduleModal') AssignRiderWithScheduleModal;
  @ViewChild('InProgReqMoreInfoModal') InProgReqMoreInfoModal;
  @ViewChild('RegDetailInfoModal') RegDetailInfoModal;
  @ViewChild('CancelledMoreInfoModal') CancelledMoreInfoModal;
  @ViewChild('CompleteReqModal') CompleteReqModal;
  @ViewChild('CancelReqModal') CancelReqModal;
  @ViewChild('RevertReqModal') RevertReqModal;
  @ViewChild('ZoneRiders') ZoneRiders;
  @ViewChild('hcBookingChat') HCBookingChat;
  @ViewChild('confirmation1') confirmation1;
  @ViewChild('InquiryReport') InquiryReport;
  @ViewChild('BookingReport') BookingReport;
  @ViewChild(ScrollToBottomDirective)

  scroll: ScrollToBottomDirective;
  // @ViewChild('chatmsjscontainer') chatMsjsContainer: ElementRef;
  gMapInfoToDisplay: { lat?: any; lng?: any; riderlat: any, riderlng: any };
  BookingStatusList: any = [];
  IsMasterDisable = false;
  masterSelected = false;
  selRiderToAssign: any = "";
  SelBookkings: any = [];
  SelOnlineBookkings: any = [];
  commaseparatedBookingIds: any;
  CancelRequestRemarks: any = "";
  enabaleAssignRiderBtn = false;
  loggedInUser: UserModel;
  meridian = true;
  // checklist: any = [];
  spinnerRep = {
    fileterspinner: '',
    RequestDetailSpinner: '',
    chatBoxSpiiner: '',
    MyIDCTable: 'MyIDCTable',
  }
  HCInProgressRequests: any = [];
  gMultipleMarlers: any = [];
  HCBranchesZones: any = [];
  HCAdminCloseRequestRemarks = "";
  InProgressReqcollectionSize: any = [];
  InProgressRequests: any = [];
  HCUrgentRequestList: any = [];
  PendingReqcollectionSize: any = [];
  PendingHCRequests: any = [];
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  paginationMyIDC = {
    paginatedSearchResults: [],
    paginatedSearchSummaryResults: [],
    page: 1,
    pageSummary: 1,
    pageSize: 10,
    pageSummarySize: 20,
    collectionSize: 0,
  };


  UrgentReqcollectionSize: any;
  HSUrgentRequests: any = [];
  HCCompletedRquestsList: any = [];
  CompletedReqcollectionSize: any;
  FilteredCompletedHCRequests: any = [];
  HCCancelledRequestList: any = [];
  HCCancellationRequestList: any = [];
  HSCStaffRequestList: any = [];
  CancelledReqcollectionSize: any = [];
  CancellationReqcollectionSize: any = [];
  FilteredCancelledHCRequests: any = [];
  FilteredCancellationHCRequests: any = [];
  tempData: any;
  SelPatientPhoneNumber: any = "";
  PatientMobileOperatorID: any;
  SelPatientFullName: any = "";
  SelPatientEmailAddress: any = "";
  PatientFullName: any;
  SelBookingData: any = [];
  zonesRidersList: any = [];
  visibleTab = 9;
  selDataForUpdateReq: any;
  selInProgReq: any = [];
  showRiderSchedule = false;
  isHCMsgUrgent: any = null;
  SelRider: any = {
    "selRiderID": '',
    "selRiderName": '',
    "selRiderContactNumber": '',
  };
  RiderScheduleData: any[];
  HCDateTime: any;
  HCtime: any;
  InvalidHCTime: boolean;
  ChangedRiderID: any;
  RiderScheduleDisplayedColumns = ['PatientName', 'HCDateTime', 'HCBookingStatus', 'PatientAddress']; //HCBookingStatusID
  minDate_hcdatetime_bs = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };
  page = 1;
  pageSize = 10;
  InProgpage = 1;
  InProgpageSize = 10;
  compPage = 1;
  compPageSize = 10;
  urgentPage = 1;
  urgentPageSize = 10;
  cancelledPage = 1;
  cancellationPage = 1;
  cancelledPageSize = 10;
  cancellationPageSize = 10;
  selcancelledReq: any = [];
  HCCancelledRequests: any = [];
  HCDelayedRequests: any = [];
  DelayedReqcollectionSize: any;
  FilteredDelyedHCRequests: any = [];
  delayedPage = 1;
  delayedPageSize = 10;
  HCMissedRequests: any = [];
  PendingBookingVisits: any = [];
  MissedReqcollectionSize: any;
  FilteredMissedHCRequests: any = [];
  missedPage = 1;
  missedPageSize = 10;
  CanRemarksClass = "";
  reqComRemarksClass = "";
  hcBookingTxtMsg = "";
  HCBookingMessages: any = [];
  IsSendChatBtnDisabled = false;
  registredTestInfoByBookingID: any = [];
  chatNoticount = 0;
  SelDataForHCBookingChat: any = {};
  appName = "";

  selectedEmoji = {
    value: '',
    rating: 0
  };

  feedbackRating = {
    VHappy: {
      value: 'VHappy',
      rating: 1
    },
    Happy: {
      value: 'Happy',
      rating: 2
    },
    Normal: {
      value: 'Normal',
      rating: 3
    },
    Sad: {
      value: 'Sad',
      rating: 4
    },
    VSad: {
      value: 'VSad',
      rating: 5
    }
  }
  isShareGenerated: any = false;
  VisitTPDetail: any = [];
  VisitPatDetail: any = [];
  selVisit = "";
  ZonesList: any = [];
  isShowMessageDetail = false;
  visitCreatedByName: any = "";
  JSON: JSON;
  hcPerformedby: any = "";
  HCOnlineRequestList: any = [];
  enabaleEditOnlineRequestBtn = false;
  BookingIDToEdit: any = "";
  VisitHomeSamplingTest: any;
  isShareGenerationDecision = true;
  branchList: any = [];
  RidersDetailListInParam: any = [];
  techList: any = [];
  HelpingStaffList: any = [];
  DocList: any = [];
  RadioSrvRequestList: any = [];
  HCRadioSrvList: any = [];
  selCommaSepBookingIds: any = "";
  RiderIDtoSeeDetail: any = null;
  CommaSepBIdsToSeeDetail: any = "";
  getCMSVisitID = null;
  docsPopupRef: NgbModalRef;
  hscReqCount = 0;
  maxDate: any;


  constructor(private auth: AuthService,
    private chatSrv: ChatService,
    private toastr: ToastrService,
    private appPopupService: AppPopupService,
    private spinner: NgxSpinnerService,
    modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private HCService: HcDashboardService,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService,
    // private signalrService: SignalrService,
    private hcBService: HcBookingService,
    private SignalR: SignalRService
  ) {
    this.isLoading$ = this.authService.isLoading$;
    this.JSON = JSON;
  }
  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    email: [''],
    mobileno: ['', ''],
    bookingid: ['', ''],
    hcCity: ['', ''],
    HCStatus: [null, ''],
    HCrequestid: ['', ''],
    firstName: ['', ''],
    lastName: ['', ''],
    rider: [null, ''],
    branchid: [null, ''],
    techID: [null, ''],
    helpingStaffID: [null, ''],
    doctorID: [null, '']
  };
  HCForm: FormGroup = this.formBuilder.group(this.Fields)
  private sub!: Subscription;
  notifications: NotificationModel[] = [];

  ngOnInit(): void {
    this.sub = this.SignalR.notifications.subscribe(data => {
      this.notifications = data;
    });
    setTimeout(() => {
      this.RidersDetail();
    }, 500);
    this.branches();
    this.appName = environment.deployedAppName + "/";
    this.getPendingVisistsForHCBooking();
    // this.HCService.startConnection();
    this.chatSrv.startConnection();
    this.chatSrv.addReceiveMessageListner((bookingid:string, sender:string, message:string) => {
      console.log("message received from signalr", bookingid,sender,message)
    });
      // this.HCService.askServerListener();
    this.loadLoggedInUserInfo();
    this.setDefualtDates();
    this.mapName = "map"
    this.Cities();
    this.RiderStatuses();
    this.RidersDetailF();
    this.HomeCollectionBranches();
    if (this.route.snapshot.routeConfig.path == 'hc-dashboard') {
      this.isAllowFullScreen = true;
    }
    this.HCBookingStatuses();
    // this.HomeCollectionZones();
    // this.getRidersByZoneID('');
    // this.HCService.askServerListener();

    this.searchEventSubscription = this.HCService.hcBookingChatResp.subscribe((resp: any) => {
      // console.log("finnaly here i am", resp);
      if (resp && resp.hubPayLoadStr) {

        // this.chatNoticount += 1;
        // this.PendingHCRequests = this.PendingHCRequests.filter(a => { return (a.BookingPatientID == resp.hubPayLoadStr.BookingID) }).map(a => ({ ...a, "chatNoticount": this.chatNoticount, }));
        // this.PendingHCRequests = this.PendingHCRequests.map(a => {
        // //  if (a.BookingPatientID == resp.hubPayLoadStr.BookingID) {
        //     return ({ ...a, "chatNoticount": this.chatNoticount })
        //   //}
        // });
        console.log("resp.hubPayLoadStr", resp);
        if (resp.hubPayLoadStr.UserType == 1) //If User type is rider then update notification count
          this.PendingHCRequests.find(item => item.BookingPatientID == resp.hubPayLoadStr.BookingID).chatNoticount = this.PendingHCRequests.find(item => item.BookingPatientID == resp.hubPayLoadStr.BookingID).chatNoticount + 1

        console.log(" this.PendingHCRequests ", this.PendingHCRequests);

        this.HCBookingMessages.push(resp.hubPayLoadStr);
        console.log(" this.PendingHCRequests ", this.HCBookingMessages);

        this.hcBookingTxtMsg = "";
        // this.chatMsjsContainer.nativeElement.scrollTop = this.chatMsjsContainer.nativeElement.scrollheight;
        // this.scroll
        // console.log("HCBookingMessages", this.HCBookingMessages);


      }

    }, (err) => { console.log() });
    this.OnlineHCRequests();
    this.maxDate = Conversions.getCurrentDateObject();
    // Listen for new messages
    // this.chatSrv.onMessage((bookingId, sender, msg) => {
    //   console.log("bookingId received from group", bookingId,sender, msg)
    //   alert("bookingId received from group" + bookingId + "Message______" + msg)
    // });
    // this.chatSrv.onMessageAll((sender, msg) => {
    //   alert("msg to all " + msg)
    // });
  }


  sendToAll() {
    this.chatSrv.sendToAll('User', "Hello Everyone!");
  }
  ngOnDestroy() {
    // this.signalrService.hubConnection?.off("askServerResponse");
    // this.searchEventSubscription.unsubscribe();
    this.DiconnectSignalR();
    this.chatSrv.onMessageOff();
    this.chatSrv.onMessageAllOff();
    this.destroy$.complete();
    this.sub?.unsubscribe();

  }

  ngAfterViewInit() {
    this.setDefualtDates();
  }
  // ngAfterViewChecked() {
  //   this.chatMsjsContainer.nativeElement.scrollTop = this.chatMsjsContainer.nativeElement.scrollheight;
  //   // nativeElement.scrollTop = this.chatMsjsContainer.nativeElement.scrollheight;
  // }

  setDefualtDates() {
    setTimeout(() => {
      this.HCForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(), //getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject()
      });
      this.HCRequests();
    }, 300);

    // let today = Date();
    // let Ftoday = { day: moment(today).get('date'), month: (moment(today).get('month') + 1), year: moment(today).get('year') };
    // this.HCForm.patchValue({
    //   dateFrom: Ftoday,
    //   dateTo: Ftoday
    // });
    // this.HCForm.updateValueAndValidity();
    // this.HCForm.setValue["dateFrom"] = moment(Date());
    // this.HCForm.setValue["dateTo"] =  moment(Date());
  }

  UpdateRequestStatus(reqData, event, screenName) {
    console.log("reqData, event, screenName", reqData, event, screenName);
    let RequestStatus = null;
    switch (event) {
      case 'CloseReq': {
        RequestStatus = 14
        break;
      }
      case 'ChangeRider': {
        reqData = this.selDataForUpdateReq;
        RequestStatus = 15;
        break;
      }
      case 'CancelReq': {
        this.HCAdminCloseRequestRemarks = this.CancelRequestRemarks;
        reqData = this.selDataForUpdateReq;
        RequestStatus = 16
        break;
      }
      case 'revertReq': {
        reqData.RiderID = null
        RequestStatus = 1
        break;
      }
      case 'RejectReq': {
        this.HCAdminCloseRequestRemarks = this.CancelRequestRemarks;
        reqData = this.selDataForUpdateReq;
        RequestStatus = 4
        break;
      }
      case 'AcceptReq': {
        this.HCAdminCloseRequestRemarks = reqData.HCRemarks;
        // reqData = this.selDataForUpdateReq;
        RequestStatus = 3
        break;
      }
      default: {
        RequestStatus = null
        break;
      }
    }

    const params = {
      BookingID: reqData.BookingPatientID,
      RiderStatusID: 2,
      ModifiedBy: this.loggedInUser.userid,
      HCRequestID: reqData.HCRequestID,
      HCBookingStatusID: RequestStatus,
      RiderID: reqData.RiderID,
      RiderRemarks: this.HCAdminCloseRequestRemarks,
      ScreenName: screenName,
      SourceLogin: 1,
      RiderCell: reqData.RiderCell ? reqData.RiderCell.replaceAll('-', '') : reqData.RiderCell,
      RiderEMail: reqData.RiderEmail,
      PatientMobileNumber: reqData.PatientMobileNumber,
      PatientMobileOperatorID: reqData.PatientMobileOperatorID,
      PatientEmailAddress: reqData.PatientEmailAddress,
      PatientFullName: reqData.PatientFullName,
      RiderDeviceToken: reqData.RiderDeviceToken,
      RiderFullName: reqData.RiderName,
      FeedBackRatingID: this.selectedEmoji.rating,
      isShareGenerated: this.isShareGenerationDecision ? true : false
    }
    this.HCService.UpdateRiderStatus(params).subscribe((resp: any) => {

      this.toastr.success("Status Updated Successfully ");
      if (event == 'ChangeRider') {

        //setTimeout(() => {
        this.HCRequests();
        //}, 4000);
        // this.spinner.show(); 
        setTimeout(() => {
          const updatedData = this.HCRequestList.filter(a => { return a.HCRequestID == reqData.HCRequestID });
          this.commaseparatedBookingIds = updatedData.length ? updatedData.map(a => a.BookingPatientID).join(',') : '';
          this.SelPatientPhoneNumber = updatedData.length ? updatedData[0].PatientMobileNumber : null
          this.PatientMobileOperatorID = updatedData.length ? updatedData[0].PatientMobileOperatorID : null;
          this.SelPatientFullName = updatedData.length ? updatedData[0].PatientFullName : null;
          const changedRider = this.RidersDetailList.filter(a => { return a.RiderID == this.ChangedRiderID });
          this.AssignRider(changedRider, 'rider')
        }, 5000);
        // this.spinner.hide(); 

      }
      this.SelBookkings = [];
      if (event == 'ChangeRider' || event == 'CancelReq') {
        this.appPopupService.closeModal();
        this.selDataForUpdateReq = "";
      }

      if (RequestStatus == 16 && this.PendingHCRequests.length == 1) {
        this.enabaleAssignRiderBtn = false;
      }

      this.HCRequests();
    }, (err) => { console.log(err) })

  }
  isSubmitted = false;
  HCRequests() {
    this.SelOnlineBookkings = [];
    this.SelBookingData = [];
    this.enabaleAssignRiderBtn = false;
    const formValues = this.HCForm.getRawValue();
    if (this.HCForm.invalid) {
      this.toastr.warning("Please fill the mandatory field")
      this.isSubmitted = true;
      return
    }
    // let formattedFlightDate = `${_flightDetails.FlightDate.year}-${_flightDetails.FlightDate.month}-${_flightDetails.FlightDate.day}`;
    // let F = `${this.HCForm.controls["dateFrom"].value.year}-${this.HCForm.controls["dateFrom"].value.month}-${this.HCForm.controls["dateFrom"].value.day}`;
    // let T = `${this.HCForm.controls["dateTo"].value.year}-${this.HCForm.controls["dateTo"].value.month}-${this.HCForm.controls["dateTo"].value.day}`;
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom),
      DateTo: Conversions.formatDateObject(formValues.dateTo),
      BookingID: this.HCForm.controls["bookingid"].value,
      PatientMobileNumber: this.HCForm.controls["mobileno"].value,
      PatientEmailAddress: this.HCForm.controls["email"].value,
      HomeCollectionCities: String(this.HCForm.controls["hcCity"].value),
      HCBookingStatusID: Number(this.HCForm.controls["HCStatus"].value),
      HCRequestID: this.HCForm.controls["HCrequestid"].value,
      PatientFirstName: this.HCForm.controls["firstName"].value,
      PatientLastName: this.HCForm.controls["lastName"].value,
      RiderID: this.HCForm.controls["rider"].value,
      UserId: this.loggedInUser.userid,
    }
    this.spinner.show(this.spinnerRep.fileterspinner);
    this.HCService.GetHCRequests(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRep.fileterspinner);
      this.masterSelected = false;
      this.page = 1;
      if (!resp.PayLoad.length) {

        this.HCRequestList = [];
        this.HCInProgressRequests = [];
        this.HCCompletedRquestsList = [];
        this.HCCancelledRequestList = [];
        this.PendingHCRequests = [];
        return
      }
      if (resp.StatusCode && resp.PayLoad.length) {
        resp.PayLoad.map(a => a.isSelected = false);
        // resp.PayLoad.map(a => a.commaseptpIds = a.TPIDS).join(',');
        this.FormatHCRequestsData(resp);


      }
    }, (err) => {
      this.toastr.error("Connection error")
      this.spinner.hide(this.spinnerRep.fileterspinner);
      console.log(" while getting Requests", err)
    });


  }
  FormatHCRequestsData(resp) {
    const result = resp.PayLoad.reduce((acc, d) => {
      const found = acc.find(a => a.BookingPatientID === d.BookingPatientID);
      const value = {
        TPName: d.TPName,
        TPCode: d.TPCode,
        TestTubeColor: d.TestTubeColor,
        SampleQuantity: d.SampleQuantity,
        Protocol: d.Protocol,
        VisitNo: d.PIN,
        BookingSourceID: d.BookingSourceID,
        BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A'
      };
      if (!found) {
        acc.push({
          HCCityName: d.HCCityName,
          HCCityCode: d.HCCityCode,
          ModeOfPayment: d.ModeOfPayment,
          BookingSourceID: d.BookingSourceID,
          RiderDeviceToken: d.RiderDeviceToken,
          BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedBy: d.BookingCompletedBy,
          BookingCompletedRemarks: d.BookingCompletedRemarks,
          SampleSubBranchTitle: d.SampleSubBranchTitle,
          SampleSubEmpName: d.SampleSubEmpName,
          NetAmount: d.NetAmount,
          GrossAmount: d.GrossAmount,
          DiscountPerc: d.DiscountPerc,
          RiderID: d.RiderID,
          BookingCanceledBy: d.BookingCanceledBy,
          BookingCanceledAt: d.BookingCanceledAt,
          PatientFullName: d.PatientFullName,
          RiderEmail: d.RiderEMail,
          PatientMobileNumber: d.PatientMobileNO,
          PhoneNo: d.PhoneNo,
          AlternateContact: d.AlternateContact,
          PatientMobileOperatorID: d.PatientMobileOperatorID,
          BookingAssignedByEmpName: d.BookingAssignedByEmpName,
          BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          isUrgentBooking: d.isUrgentBooking,
          BookedByEmpName: d.BookedByEmpName,
          RiderName: d.RiderName,
          RiderLatitude: d.RiderLatitude,
          RiderLongitude: d.RiderLongitude,
          RiderCell: d.RiderCell ? d.RiderCell.replaceAll('-', '') : d.RiderCell,
          HCDateTime: d.HCDateTime ? moment(d.HCDateTime).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          HCBookingStatusID: d.HCBookingStatusID,
          HCBookingStatus: d.HCBookingStatus,
          BookingPatientID: d.BookingPatientID,
          PatientEmailAddress: d.PatientEmailAddress,
          FirstName: d.FirstName,
          Gender: d.Gender,
          GoogleAddressName: d.GoogleAddressName,
          HCRequestID: d.HCRequestID,
          Latitude: d.Latitude,
          Longitude: d.Longitude,
          MobileNO: d.MobileNO,
          PatientAddress: d.PatientAddress,
          BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
          BookingCanceledRemarks: d.BookingCanceledRemarks,
          VisitNo: d.PIN,
          TPDetail: [value],
          HCCityID: d.HCCityID,
          IsHCRadioSrv: d.IsHCRadioSrv,
          BookingSlot: d.BookingSlot,
          HCRemarks: d.HCRemarks
        });
      }
      else {
        found.TPDetail.push(value);
      };
      return acc;
    }, []);
    result.forEach((a, i) => {
      const _obj = JSON.parse(JSON.stringify(a));
      _obj.CSTP = _obj.TPDetail.map(a => { return a.TPName }).join(',');
      result[i].CM = _obj.TPDetail.map(a => { return a.TPName }).join(',');
      result[i].tpCodes = _obj.TPDetail.map(a => { return a.TPCode }).join(',');

    });

    // this.HCOnlineRequestList = result.filter(a => {
    //   return ((a.HCBookingStatusID == 15 ||
    //     a.HCBookingStatusID == 1 ||
    //     a.HCBookingStatusID == 2 ||
    //     a.HCBookingStatusID == 3 ||
    //     a.HCBookingStatusID == 8)
    //     && a.BookingSourceID == 7)
    // }
    // ).map(a => ({ ...a, "SelRiderName": "" }));

    this.HCRequestList = result.filter(a => {
      return (a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID != 7
    }).map(a => ({ ...a, "SelRiderName": "" }));; //resp.PayLoad.filter(a => { return a.HCBookingStatusID == 1 || a.HCBookingStatusID == 2 }).map(a => ({ ...a, "SelRiderName": "" }));
    this.HCRequestList = this.HCRequestList.map(a => ({ ...a, "chatNoticount": 0 }));
    console.log("this.HCRequestList", this.HCRequestList);
    this.HCRequestList.map(a => { a.TPDetail.map(b => { }) })
    this.HCUrgentRequestList = this.HCRequestList.filter(a => { return a.isUrgentBooking == 1 });

    // this.HCCancelledRequestList = result.filter(a => { return a.HCBookingStatusID == 16 });

    this.HCRadioSrvList = result.filter(a => {
      return (a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID != 7 && a.IsHCRadioSrv == 1
    }).map(a => ({ ...a, "SelRiderName": "" }));

    const InProgressPreFormatedData = resp.PayLoad.reduce((acc, d) => {
      const found = acc.find(a => a.HCRequestID === d.HCRequestID);

      const value = {
        HCCityName: d.HCCityName,
        HCCityCode: d.HCCityCode,
        RiderDeviceToken: d.RiderDeviceToken,
        BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
        PatientEmailAddress: d.PatientEmailAddress,
        RiderID: d.RiderID,
        PatientAddress: d.PatientAddress,
        PatientMobileNumber: d.PatientMobileNO,
        PhoneNo: d.PhoneNo,
        AlternateContact: d.AlternateContact,
        PatientMobileOperatorID: d.PatientMobileOperatorID,
        PatientFullName: d.PatientFullName,
        BookedByEmpName: d.BookedByEmpName,
        BookingPatientID: d.BookingPatientID,
        TPName: d.TPName,
        PatientName: d.FirstName + " " + d.LastName,
        SampleType: d.SampleType,
        Latitude: d.Latitude,
        Longitude: d.Longitude,
        BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
        BookingCompletedBy: d.BookingCompletedBy,
        BookingCompletedRemarks: d.BookingCompletedRemarks,
        BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
        SampleSubBranchTitle: d.SampleSubBranchTitle,
        SampleSubEmpName: d.SampleSubEmpName,
        NetAmount: d.NetAmount,
        GrossAmount: d.GrossAmount,
        DiscountPerc: d.DiscountPerc,
        BookingAssignedByEmpName: d.BookingAssignedByEmpName,
        BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
        BookingCanceledBy: d.BookingCanceledBy,
        BookingCanceledAt: d.BookingCanceledAt,
        BookingCanceledRemarks: d.BookingCanceledRemarks,
        ModeOfPayment: d.ModeOfPayment,
        VisitNo: d.PIN,
        IsHCRadioSrv: d.IsHCRadioSrv,
        HCRemarks: d.HCRemarks
      };
      if (!found) {
        acc.push({
          HCCityID: d.HCCityID,
          HCCityName: d.HCCityName,
          HCCityCode: d.HCCityCode,
          RiderDeviceToken: d.RiderDeviceToken,
          BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          RiderID: d.RiderID,
          BookingPatientID: d.BookingPatientID,
          BookedByEmpName: d.BookedByEmpName,
          PatientEmailAddress: d.PatientEmailAddress,
          PatientMobileNumber: d.PatientMobileNO,
          PhoneNo: d.PhoneNo,
          AlternateContact: d.AlternateContact,
          PatientMobileOperatorID: d.PatientMobileOperatorID,
          PatientFullName: d.PatientFullName,
          PatientName: d.FirstName + " " + d.LastName,
          RiderName: d.RiderName,
          RiderCell: d.RiderCell ? d.RiderCell.replaceAll('-', '') : d.RiderCell,
          HCDateTime: d.HCDateTime ? moment(d.HCDateTime).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          HCRequestID: d.HCRequestID,
          HCBookingStatusID: d.HCBookingStatusID,
          Latitude: d.Latitude,
          Longitude: d.Longitude,
          HCBookingStatus: d.HCBookingStatus,
          RiderLatitude: d.RiderLatitude,
          RiderLongitude: d.RiderLongitude,
          bookingDetail: [value],
          BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedBy: d.BookingCompletedBy,
          BookingCompletedRemarks: d.BookingCompletedRemarks,
          SampleSubBranchTitle: d.SampleSubBranchTitle,
          SampleSubEmpName: d.SampleSubEmpName,
          NetAmount: d.NetAmount,
          GrossAmount: d.GrossAmount,
          DiscountPerc: d.DiscountPerc,
          BookingAssignedByEmpName: d.BookingAssignedByEmpName,
          BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          BookingCanceledBy: d.BookingCanceledBy,
          BookingCanceledAt: d.BookingCanceledAt,
          PatientAddress: d.PatientAddress,
          BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
          BookingCanceledRemarks: d.BookingCanceledRemarks,
          ModeOfPayment: d.ModeOfPayment,
          VisitNo: d.PIN,
          IsHCRadioSrv: d.IsHCRadioSrv,
          HCRemarks: d.HCRemarks
        })
      }
      else {

        found.bookingDetail.push(value)
      }
      return acc;
    }, []);


    InProgressPreFormatedData.forEach((a, i) => {

      const finalResult = [];
      a.bookingDetail.forEach((b, ti) => {
        const _obj = JSON.parse(JSON.stringify(b));
        const tpObj = { TPName: b.TPName, SampleType: b.SampleType }
        const idx = finalResult.findIndex((c, ii) => { return c.BookingPatientID == b.BookingPatientID });
        a.CommSepTP = Array.prototype.map.call(InProgressPreFormatedData[i].bookingDetail, function (item) { return item.TPName; }).join(",");
        a.commSepBIDs = Array.prototype.map.call(InProgressPreFormatedData[i].bookingDetail, function (item) { return item.BookingPatientID; }).join(",");
        a.commSepBIDs = a.commSepBIDs.split(',')
        if (idx > -1) {
          finalResult[idx].TP.push(tpObj);

        } else {
          _obj.TP = [tpObj]; a.CommSepTP = _obj.TPName; a.commSepBIDs = _obj.BookingPatientID
          finalResult.push(_obj);
        }
        _obj.cotp = Array.prototype.map.call(InProgressPreFormatedData[i].bookingDetail, function (item) { return item.TPName; }).join(",")
      });
      a.bookingDetail = finalResult;
      a.BC = a.bookingDetail.length;
    });
    this.HCInProgressRequests = InProgressPreFormatedData.filter(a => { return (a.HCBookingStatusID > 3 && a.HCBookingStatusID <= 13) || a.HCBookingStatusID == 17 }).map(a => ({ ...a, "AdminCloseTaskBtnDisabled": true, "AfterRegDisbaled": true }));
    // this.HCInProgressRequests = InProgressPreFormatedData.filter(a => { return a.HCBookingStatusID < 7 }).map(a => ({ ...a, "BrforeReg": true, }));
    this.HCCompletedRquestsList = InProgressPreFormatedData.filter(a => { return a.HCBookingStatusID === 14 }).map(a => ({ ...a, "SelRiderName": "" }));; //resp.PayLoad.filter(a => { return a.HCBookingStatusID == 1 || a.HCBookingStatusID == 2 }).map(a => ({ ...a, "SelRiderName": "" }));
    this.HCCancelledRequestList = InProgressPreFormatedData.filter(a => { return (a.HCBookingStatusID === 16 || a.HCBookingStatusID === 18 || a.HCBookingStatusID === 20) })
    this.HCCancellationRequestList = InProgressPreFormatedData.filter(a => { return (a.HCBookingStatusID === 19) })
    this.HSCStaffRequestList = InProgressPreFormatedData.filter(a => { return (a.HCBookingStatusID === 21) })
    // console.log("this.HCInProgressRequests", moment(this.HCInProgressRequests[0].BookingAssignedAt).format('yyyy-mm-dd h:mm:ss'));
    // let datetimenow = moment(new Date());
    // let b = moment(this.HCInProgressRequests[0].BookingAssignedAt);
    // console.log(datetimenow.diff(b, 'minutes'))

    // moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a')     
    // this.HCDelayedRequests = InProgressPreFormatedData.filter(a => { return a.HCBookingStatusID < 5 && datetimenow.diff(moment(a.HCDateTime), 'minutes') > 40 && datetimenow.diff(moment(a.HCDateTime), 'minutes') > 1440 });   //HC time sy 40 min phly status accpt sy move lazmi ho jana chye
    // this.HCMissedRequests = InProgressPreFormatedData.filter(a => { return a.HCBookingStatusID >= 3 && a.HCBookingStatusID < 13 && datetimenow.diff(moment(a.BookingAssignedAt), 'hours') > 24 });




    // this.HCInProgressRequests = InProgressPreFormatedData.filter(a => { return a.HCBookingStatusID > 10 }).map(a => ({ ...a, "ChangeRiderByAdminDisabled": true, }));
    // this.HCInProgressRequests = InProgressPreFormatedData.find(a => { return a.HCBookingStatusID == 12  }).map(a => ({ ...a, "AdminCloseTaskBtnDisabled": false, }));
    for (const i in this.HCInProgressRequests) {
      if (this.HCInProgressRequests[i].HCBookingStatusID == 12) {
        this.HCInProgressRequests[i].AdminCloseTaskBtnDisabled = false;
        // break; //Stop this loop, we found it!
      }
      if (this.HCInProgressRequests[i].HCBookingStatusID < 7) {
        this.HCInProgressRequests[i].AfterRegDisbaled = false;
        // break; //Stop this loop, we found it!
      }
    }

    this.refreshPendingRequestsPagination();
    this.refreshInProgressPagination();
    this.refreshUrgentRequestsPagination();
    this.refreshCompletedRequetsPagination();
    this.refreshCancelledRequetsPagination();
    this.refreshCancellationRequetsPagination();
    this.refreshDelayedRequestsPagination();
    this.refreshMissedRequetsPagination();
  }

  OnlineHCRequests() {
    console.log('OnlineHCRequests')
    this.SelOnlineBookkings = [];
    this.SelBookingData = [];
    // let params = {

    // }
    this.spinner.show(this.spinnerRep.MyIDCTable);
    this.HCService.GetHCRequestsOnline({}).subscribe((resp: any) => {
      resp.PayLoad.map(a => a.isSelected = false);
      this.spinner.hide(this.spinnerRep.MyIDCTable);
      // resp.PayLoad.map(a => a.commaseptpIds = a.TPIDS).join(',');
      this.OnlineFormatHCRequestsData(resp);
    }, (err) => {
      this.spinner.hide(this.spinnerRep.MyIDCTable);
      console.log(" while getting Requests", err)
    });


  }
  refreshEditBooking() {
    this.HCRequests();
  }
  OnlineFormatHCRequestsData(resp) {
    const result = resp.PayLoad.reduce((acc, d) => {
      const found = acc.find(a => a.BookingPatientID === d.BookingPatientID);
      const value = {
        TPName: d.TPName,
        TPCode: d.TPCode,
        TestTubeColor: d.TestTubeColor,
        SampleQuantity: d.SampleQuantity,
        Protocol: d.Protocol,
        VisitNo: d.PIN,
        BookingSourceID: d.BookingSourceID,
        BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A'
      };
      if (!found) {
        acc.push({
          HCCityName: d.HCCityName,
          HCCityCode: d.HCCityCode,
          BookingSourceID: d.BookingSourceID,
          RiderDeviceToken: d.RiderDeviceToken,
          BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedBy: d.BookingCompletedBy,
          BookingCompletedRemarks: d.BookingCompletedRemarks,
          SampleSubBranchTitle: d.SampleSubBranchTitle,
          SampleSubEmpName: d.SampleSubEmpName,
          NetAmount: d.NetAmount,
          GrossAmount: d.GrossAmount,
          DiscountPerc: d.DiscountPerc,
          RiderID: d.RiderID,
          BookingCanceledBy: d.BookingCanceledBy,
          BookingCanceledAt: d.BookingCanceledAt,
          PatientFullName: d.PatientFullName,
          RiderEmail: d.RiderEMail,
          PatientMobileNumber: d.PatientMobileNO,
          PhoneNo: d.PhoneNo,
          AlternateContact: d.AlternateContact,
          PatientMobileOperatorID: d.PatientMobileOperatorID,
          BookingAssignedByEmpName: d.BookingAssignedByEmpName,
          BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          isUrgentBooking: d.isUrgentBooking,
          BookedByEmpName: d.BookedByEmpName,
          RiderName: d.RiderName,
          RiderLatitude: d.RiderLatitude,
          RiderLongitude: d.RiderLongitude,
          RiderCell: d.RiderCell ? d.RiderCell.replaceAll('-', '') : d.RiderCell,
          HCDateTime: d.HCDateTime ? moment(d.HCDateTime).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          HCBookingStatusID: d.HCBookingStatusID,
          HCBookingStatus: d.HCBookingStatus,
          BookingPatientID: d.BookingPatientID,
          PatientEmailAddress: d.PatientEmailAddress,
          FirstName: d.FirstName,
          Gender: d.Gender,
          GoogleAddressName: d.GoogleAddressName,
          HCRequestID: d.HCRequestID,
          Latitude: d.Latitude,
          Longitude: d.Longitude,
          MobileNO: d.MobileNO,
          PatientAddress: d.PatientAddress,
          BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
          BookingCanceledRemarks: d.BookingCanceledRemarks,
          ModeOfPayment: d.ModeOfPayment,
          VisitNo: d.PIN,
          TPDetail: [value],
          HCCityID: d.HCCityID,
          IsHCRadioSrv: d.IsHCRadioSrv,
          BookingSlot: d.BookingSlot,
          HCRemarks: d.HCRemarks
        });
      }
      else {
        found.TPDetail.push(value);
      };
      return acc;
    }, []);
    result.forEach((a, i) => {
      const _obj = JSON.parse(JSON.stringify(a));
      _obj.CSTP = _obj.TPDetail.map(a => { return a.TPName }).join(',');
      result[i].CM = _obj.TPDetail.map(a => { return a.TPName }).join(',');
      result[i].tpCodes = _obj.TPDetail.map(a => { return a.TPCode }).join(',');

    });
    this.HCOnlineRequestList = result.filter(a => {
      return ((a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID == 7)
    }
    ).map(a => ({ ...a, "SelRiderName": "" }));
    this.refreshPagination()

  }

  Cities() {
    this.HCService.getHCCities().subscribe((resp: any) => {
      this.CitiesList = resp.PayLoad;
      // this.HomeCollectionCites = resp.PayLoad.filter(a => {
      //   return a.isHomeSamplingCity == true;
      // })
      this.HomeCollectionCites = resp.PayLoad;
    }, (err) => {
      console.log(err);
    })
  }

  CloseHCRequest(Reqdata) {
    const params = {
      // BookingID: null,
      HCBookingStatusID: 14,
      HCRequestID: Reqdata.HCRequestID,
      ModifiedBy: this.loggedInUser.userid,
      RiderRemarks: this.HCAdminCloseRequestRemarks,
      // RiderID: null
    }
    this.HCService.CloseHCReq(params).subscribe((resp: any) => { }, (err) => { console.log("Err", err) })
  }
  OpenHCReqInFullScreen() {
    // this.appName = environment.deployedAppName;
    // this.router.navigate([`hc/hc-dashboard`]);
    this.router.navigate([]).then(result => { window.open('hc/hc-requests', '_blank'); });
    // window.open(url, '_blank');
  }
  RidersDetail() {
    const formValues = this.HCForm.getRawValue();
    const params = {
      RiderID: 0,
      LocID: this.selBranchid
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailList = resp.PayLoad;
      if (!this.selBranchid) {
        this.techList = this.RidersDetailList.filter(a => { return a.HCUserTypeID == 2 });
        this.HelpingStaffList = this.RidersDetailList.filter(a => { return a.HCUserTypeID == 3 });
        this.DocList = this.RidersDetailList.filter(a => { return a.HCUserTypeID == 4 });
      }
      console.table("HelpingStaffList", this.HelpingStaffList);
      console.log("this.RidersDetailList", this.RidersDetailList);
    }, (err) => { console.log(err) })
  }
  RidersDetailF() {
    const formValues = this.HCForm.getRawValue();
    const params = {
      RiderID: 0,
      LocID: formValues.branchid
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailListInParam = resp.PayLoad;

    }, (err) => { console.log(err) })
  }

  // branches() {
  //   this.HCService.Branches().subscribe((resp: any) => {
  //     this.branchList = resp.PayLoad;
  //   }, (err) => { console.log(err) })
  // }

  branches() {
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  HomeCollectionBranches() {

    this.HCService.HomeCollectionBranches().subscribe((resp: any) => {


      this.HCBranchesList = resp.PayLoad;
    }, (err) => {

      console.log(err)
    });

  }
  HomeCollectionZones() {

    this.HCService.HomeCollectionZones().subscribe((resp: any) => {

      this.HCBranchesZones = resp.PayLoad;
    }, (err) => {
      console.log(err)
    });

  }
  // callback(item, indx, arr) {
  //   console.log(item, indx, arr, this.VisitHomeSamplingTest)
  //     // if(arr.filter)
  //     // item.TPCode === +
  //     .
  // //  arr.VisitHomeSamplingTest(item.TPCode ==  )
  // }
  AssignRider(rider, event) {
    this.spinner.show();
    // let bookings = this.commaseparatedBookingIds.split(',');
    // console.log("this.commaseparatedBookingIds", this.commaseparatedBookingIds, this.SelBookkings, bookings);
    // let temp = [];
    // this.SelBookkings.map(a => {
    //   // temp = Array.prototype.push.apply(temp,);  
    //   temp = [...temp, a.TPDetail.map(b => { return b.TPCode })]
    // })

    // console.log(temp);
    // for (let i = 0; i < temp.length; i++) {
    //   for (let j = i + 1; j < temp.length; j++) {

    //     // quick elimination by comparing sub-array lengths
    //     if (temp[i].length !== temp[j].length) {
    //       continue;
    //     }
    //     // look for dupes
    //     var dupe = true;
    //     for (var k = 0; k < temp[i].length; k++) {
    //       if (temp[i][k] !== temp[j][k]) {
    //         dupe = false;
    //         break;
    //       }
    //     }
    //     // if a dupe then print
    //     if (dupe) {
    //       console.debug("%d is a dupe", j);
    //       return dupe;
    //     }
    //   }
    // }
    // var duplicateIndex = _.findIndex(array, function(value, index, collection) {
    //   var equal = _.isEqual.bind(undefined, value);
    //   return _.findIndex(collection, function(val, ind) {
    //      return ind < index && equal(val);
    //   }) !== -1;
    // });
    // console.log(dupe);
    // if (1 == 1) {
    //   this.toastr.warning("Request ID contains multiple V Codes ")
    // }
    // else {
    console.log(this.SelTechIDToAssign, this.SelDoctorIDToAssign, this.SelhelpingStaffIDToAssign);
    // return;
    const params = {
      "BookingID": this.commaseparatedBookingIds,
      "RiderID": event == 'rider' ? Number(rider.RiderID) || rider[0].RiderID : null,
      "ModifiedBy": this.loggedInUser.userid,
      "HCZoneID": event == 'branch' ? rider.HCZoneID || rider[0].HCZoneID : null,
      "SourceLogin": 1,
      "PatientMobileNumber": this.SelPatientPhoneNumber,
      "PatientMobileOperatorID": this.PatientMobileOperatorID,
      "PatientFullName": this.SelPatientFullName,
      "PatientEmailAddress": this.SelPatientEmailAddress,
      "HCBookingStatusID": 3,
      "HCTechnicianIDs": this.SelTechIDToAssign ? this.SelTechIDToAssign.join(',') : null,
      "HCDoctorIDs": this.SelDoctorIDToAssign ? this.SelDoctorIDToAssign.join(',') : null,
      "HCHelperIDs": this.SelhelpingStaffIDToAssign ? this.SelhelpingStaffIDToAssign.join(',') : null,
      "RiderFullName": rider.length || rider[0] ? rider.RiderFullName || rider[0].RiderFullName : null,
      "RiderCell": event == 'branch' ? null : rider.RiderCell ? rider.RiderCell.replaceAll('-', '') : rider[0].RiderCell.replaceAll('-', ''), //rider.RiderCell.replaceAll('-', ''),
      // rider.RiderCell.replaceAll('-', '')
      // "RiderLocID": event == 'branch' ? rider.HCZoneID : null
    }
    this.HCService.AssignRider(params).subscribe((resp: any) => {
      this.spinner.hide();
      this.PendingHCRequests.map(a => ({ "SelRiderName": rider.RiderFirstName || rider[0].RiderFirstName })
      );
      const notiType = rider.RiderID ? 'indvidual' : 'broadcast'
      // console.log(this.SelBookkings.le);
      // this.SendNotificationsToRider(rider.LocId, rider.RiderID, notiType, rider.HCZoneID);
      this.HCRequests();
      this.SelBookkings = [];
      this.SelOnlineBookkings = [];
      this.toastr.success("Successfully Assigned");
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    })
    // }
    // public string HCTechnicianIDs { get; set; }
    // public string HCDoctorIDs { get; set; }
    // public string HCHelperIDs { get; set; }

  }
  SendNotificationsToRider(locid, RiderID, notiType, HCZoneID) {

    const param = {
      "RiderLocID": notiType == "broadcast" ? locid : null,
      "RiderZoneID": notiType == "broadcast" ? HCZoneID : null,
      "NotificationData": this.SelBookkings,
      "RiderID": notiType == "indvidual" ? RiderID : null
    }
    this.HCService.SendNotificationToBranchRider(param).subscribe((resp: any) => {

    }, (err) => { console.log("err", err) })


  }

  RiderStatuses() {
    this.HCService.GetRiderStatuses().subscribe((resp: any) => {
      this.RiderStatusList = resp.PayLoad;

    }, (err) => {
      console.log("resp", err);
    })

  }
  ShowMapView(patData) {
    this.gMapInfoToDisplay = {
      lat: patData.Latitude,
      lng: patData.Longitude,
      riderlat: patData.RiderLatitude,
      riderlng: patData.RiderLongitude
    }
    this.gMultipleMarlers = [];
    this.gMultipleMarlers.push({ lat: patData.Latitude, lng: patData.Longitude, markerType: 'patient' })
    this.gMultipleMarlers.push({ lat: patData.RiderLatitude, lng: patData.RiderLongitude, markerType: 'rider' })
    this.appPopupService.openModal(this.MapView);



    this.HCService.startConnectionForRider(patData.HCRequestID);
    // let metaComRespForRiderLoc = {"hubStatusCode": 0, hubPayLoadStr: any};
    this.HCService.askRiderServerListener();
    this.HCService.hcRiderUpdateLocationResp.subscribe((resp: any) => {
      console.log("rider location respo", resp);
      // metaComRespForRiderLoc= resp; 
      if (resp.hubStatusCode == 1) {
        if (resp.hubPayLoadStr != "") {
          let j = JSON.parse(resp.hubPayLoadStr);
          console.log("jjjjj", resp.hubPayLoadStr);
          j = j.map(a => ({ ...a, "RiderLatitude": a.Latitude, "RiderLongitude": a.Longitude, "Latitude": patData.Latitude, "Longitude": patData.Longitude }))
          console.log("j", j);
          this.UShowMapView(j[0]);
        }
      }
    }, (err) => { console.log(err) })
    // console.log("HUB RESP", metaComRespForRiderLoc);

  }

  UShowMapView(patData) {
    this.gMapInfoToDisplay = {
      lat: patData.Latitude,
      lng: patData.Longitude,
      riderlat: patData.RiderLatitude,
      riderlng: patData.RiderLongitude
    }
    this.gMultipleMarlers = [];
    this.gMultipleMarlers.push({ lat: patData.Latitude, lng: patData.Longitude, markerType: 'patient' })
    this.gMultipleMarlers.push({ lat: patData.RiderLatitude, lng: patData.RiderLongitude, markerType: 'rider' })
    // this.gMultipleMarlers.push({ lat: patData[0].Latitude, lng: patData[0].Longitude, markerType: 'rider' })
    // this.gMultipleMarlers.push({ lat: patData.Latitude, lng: patData.Longitude, markerType: 'patient' })
    // // this.gMultipleMarlers.push({ lat: patData.RiderLatitude, lng: patData.RiderLongitude, markerType: 'rider' })
    // // this.appPopupService.openModal(this.MapView);


    // this.HCService.startConnectionForRider();
    // let metaComRespForRiderLoc = {};
    // metaComRespForRiderLoc[0] = this.HCService.askRiderServerListener();
    // console.log("HUB RESP", metaComRespForRiderLoc);
    // if (metaComRespForRiderLoc[0].hubStatusCode == 1) {

    // }
    // this.ShowMapView(this.JSON.parse(metaComRespForRiderLoc[0].hubPayLoadStr));
  }
  closeLoginModal() {
    this.appPopupService.closeModal();
    this.HCAdminCloseRequestRemarks = "";
  }
  CloseModel() {
    this.appPopupService.closeModal();

  }

  CompleteRequestModal(data, event) {
    console.log("data data", data);
    console.log("event event", event);
    this.RiderIDtoSeeDetail = data.RiderID;
    if (data)
      this.CommaSepBIdsToSeeDetail = data.bookingDetail.map(a => { return a.BookingPatientID }).join(',');
    switch (event) {
      case 'updaterequest':
        if (!this.HCAdminCloseRequestRemarks) {
          this.reqComRemarksClass = "invalid invalid-highlighted";
        } else {
          this.UpdateRequestStatus(this.tempData, 'CloseReq', 'HC-Admin task - PendingRequestsTab');
          this.closeLoginModal();
          this.HCAdminCloseRequestRemarks = "";
          this.HCRequests();
        }
        break;
      case 'openModel':
        this.getRegTPDetailByHCReqID(data.HCRequestID);
        this.tempData = data;
        setTimeout(() => {
          this.appPopupService.openModal(this.CompleteReqModal, { backdrop: 'static', keyboard: false });
        }, 200);
        break;
      default:
        break;
    }
  }



  CancelRequestModal(data, event) {
    switch (event) {
      case 'updateCancelReq':
        if ((this.CancelRequestRemarks || '').length < 10) {
          this.CanRemarksClass = "invalid invalid-highlighted";
          this.toastr.warning('Please enter remarks, minimum 10 characters', "Invalid");
          return;
        } else {
          this.UpdateRequestStatus(this.tempData, 'CancelReq', 'HC-Admin task - PendingRequestsTab');
          this.OnlineHCRequests();
          this.closeLoginModal();
          this.CancelRequestRemarks = "";
        }
        break;

      case 'openCancelReqModal':
        this.selDataForUpdateReq = data;
        this.appPopupService.openModal(this.CancelReqModal, { backdrop: 'static', keyboard: false });
        break;
      default:
        break;
    }
  }

  RejectRequestModal() {
    if ((this.CancelRequestRemarks || '').length < 10) {
      this.CanRemarksClass = "invalid invalid-highlighted";
      this.toastr.warning('Please enter remarks, minimum 10 characters', "Invalid");
      return;
    } else {
      this.UpdateRequestStatus(this.tempData, 'RejectReq', 'HC-Admin task - CancellationRequestsTab');
      this.OnlineHCRequests();
      this.closeLoginModal();
      this.CancelRequestRemarks = "";
    }
  }

  HCBookingStatuses() {
    this.HCService.GetHCBookingStatuses().subscribe((resp: any) => {
      this.BookingStatusList = resp.PayLoad;

    }, (err) => {
      console.log("resp", err);
    })
  }


  checkUncheckAll() {
    // for (var i = 0; i < this.PendingHCRequests.length; i++) {
    //   this.PendingHCRequests[i].isSelected = this.masterSelected;
    // }
    this.PendingHCRequests = this.PendingHCRequests.map(request => ({
      ...request,
      isSelected: this.masterSelected
    }));
    this.getCheckedItemList();
  }
  checkUncheckOnlineReq() {
    for (let i = 0; i < this.PendingHCRequests.length; i++) {
      this.PendingHCRequests[i].isSelected = this.masterSelected;
    }
    this.getCheckedOnlineReqItemList()
  }
  getCheckedOnlineReqItemList() {
    this.SelOnlineBookkings = [];
    // for (let i = 0; i < this.HCOnlineRequestList.length; i++) {
    //   if (this.HCOnlineRequestList[i].isSelected) {
    //     this.SelOnlineBookkings.push(this.HCOnlineRequestList[i]);
    //   }
    // }
    this.SelOnlineBookkings = this.paginationMyIDC.paginatedSearchResults.filter(item => item.isSelected);
    if (this.SelOnlineBookkings.length) {
      this.enabaleEditOnlineRequestBtn = false;

      // this.getZonesByHCCityId(this.SelBookkings[0].HCCityID);
    }
    else {
      this.enabaleEditOnlineRequestBtn = false;
    }
    this.selCommaSepBookingIds = this.SelOnlineBookkings.map(a => { return a.BookingPatientID }).join(',');
    const isradio = this.SelOnlineBookkings.find(a => { return a.IsHCRadioSrv === true });
    if (isradio) {
      this.enableRadioServicesActions = true;
    }
    this.commaseparatedBookingIds = this.SelOnlineBookkings.length ? this.SelOnlineBookkings.map(a => a.BookingPatientID).join(',') : '';
    this.SelPatientPhoneNumber = this.SelOnlineBookkings.length ? this.SelOnlineBookkings[0].PatientMobileNumber : null;
    this.PatientMobileOperatorID = this.SelOnlineBookkings.length ? this.SelOnlineBookkings[0].PatientMobileOperatorID : null;
    this.SelPatientFullName = this.SelOnlineBookkings.length ? this.SelOnlineBookkings[0].PatientFullName : null;
    console.log(" this.SelOnlineBookkings:", this.SelOnlineBookkings)

  }
  getCheckedItemList() {
    this.enableRadioServicesActions = false;
    this.SelBookkings = [];

    console.log("🚀 ~ checkUncheckAll ~ this.PendingHCRequests :", this.PendingHCRequests)
    console.log("🚀 ~ getCheckedItemList ~ this.HSUrgentRequests:", this.HSUrgentRequests)

    const getPendingBookingId = this.PendingHCRequests.filter(request => request.isSelected);
    const getUrgentBookingId = this.HSUrgentRequests.filter(request => request.isSelected);
    if (getPendingBookingId.length) {
      this.SelBookkings = getPendingBookingId;
    }
    if (getUrgentBookingId.length) {
      this.SelBookkings = getUrgentBookingId;
    }

    console.log("🚀 ~ getCheckedItemList ~ this.SelBookkings:", this.SelBookkings)

    // for (var i = 0; i < this.PendingHCRequests.length; i++) {
    //   if (this.PendingHCRequests[i].isSelected) {
    //     this.SelBookkings.push(this.PendingHCRequests[i]);
    //   }

    // for (var i = 0; i < this.HSUrgentRequests.length; i++) {
    //   if (this.HSUrgentRequests[i].isSelected) {
    //     this.SelBookkings.push(this.HSUrgentRequests[i]);
    //   }
    // }

    if (this.SelBookkings.length) {
      this.enabaleAssignRiderBtn = true;
      this.getZonesByHCCityId(this.SelBookkings[0].HCCityID);
    }
    else {
      this.enabaleAssignRiderBtn = false;
    }
    const isradio = this.SelBookkings.find(a => { return a.IsHCRadioSrv === true });
    //here
    this.selCommaSepBookingIds = this.SelBookkings.map(a => { return a.BookingPatientID }).join(',');
    console.log("selCommaSepBookingIds", this.selCommaSepBookingIds);
    if (isradio) {
      this.enableRadioServicesActions = true;
    }
    this.commaseparatedBookingIds = this.SelBookkings.length ? this.SelBookkings.map(a => a.BookingPatientID).join(',') : '';
    this.SelPatientPhoneNumber = this.SelBookkings.length ? this.SelBookkings[0].PatientMobileNumber : null;
    this.PatientMobileOperatorID = this.SelBookkings.length ? this.SelBookkings[0].PatientMobileOperatorID : null;
    this.SelPatientFullName = this.SelBookkings.length ? this.SelBookkings[0].PatientFullName : null;

  }

  isAllSelected() {
    this.masterSelected = this.PendingHCRequests.every(function (item: any) {
      return item.isSelected === true;
    })
    this.getCheckedItemList();
  }
  isAllOnlineReqSelected() {
    //here

    this.masterSelected = this.paginationMyIDC.paginatedSearchResults.every(function (item: any) {
      return item.isSelected === true;
    })
    console.log("🚀 ~ HCRequestsComponent ~ this.masterSelected:", this.masterSelected)
    this.getCheckedOnlineReqItemList();
  }
  refreshInProgressPagination() {

    this.InProgressReqcollectionSize = this.HCInProgressRequests.length;
    this.InProgressRequests = this.HCInProgressRequests
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.InProgpage - 1) * this.InProgpageSize, (this.InProgpage - 1) * this.InProgpageSize + this.InProgpageSize);
    // console.log("InProgressRequests", this.InProgressRequests);
  }

  refreshUrgentRequestsPagination() {
    this.UrgentReqcollectionSize = this.HCUrgentRequestList.length;
    this.HSUrgentRequests = this.HCUrgentRequestList
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.urgentPage - 1) * this.urgentPageSize, (this.urgentPage - 1) * this.urgentPageSize + this.urgentPageSize);
    // console.log("HCUrgentRequestList", this.HCUrgentRequestList);
  }

  refreshPendingRequestsPagination() {

    this.PendingReqcollectionSize = this.HCRequestList.length;
    this.PendingHCRequests = this.HCRequestList
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    // console.log("PendingHCRequests", this.PendingHCRequests);
  }
  refreshCompletedRequetsPagination() {

    this.CompletedReqcollectionSize = this.HCCompletedRquestsList.length;
    this.FilteredCompletedHCRequests = this.HCCompletedRquestsList
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.compPage - 1) * this.compPageSize, (this.compPage - 1) * this.compPageSize + this.compPageSize);
    // console.log("FilteredCompletedHCRequests", this.FilteredCompletedHCRequests);
  }
  refreshMissedRequetsPagination() {

    this.MissedReqcollectionSize = this.HCMissedRequests.length;
    this.FilteredMissedHCRequests = this.HCMissedRequests
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.missedPage - 1) * this.missedPageSize, (this.missedPage - 1) * this.missedPageSize + this.missedPageSize);
    // console.log("FilteredMissedHCRequests", this.FilteredMissedHCRequests);
  }

  refreshCancelledRequetsPagination() {
    this.CancelledReqcollectionSize = this.HCCancelledRequestList.length;
    this.FilteredCancelledHCRequests = this.HCCancelledRequestList
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.cancelledPage - 1) * this.cancelledPageSize, (this.cancelledPage - 1) * this.cancelledPageSize + this.cancelledPageSize);
    // console.log("CancelledReqcollectionSize", this.HCCancelledRequestList);
  }
  refreshCancellationRequetsPagination() {
    this.CancellationReqcollectionSize = this.HCCancellationRequestList.length;

    const startIndex = (this.cancellationPage - 1) * this.cancellationPageSize;
    const endIndex = startIndex + this.cancellationPageSize;

    this.FilteredCancellationHCRequests = this.HCCancellationRequestList.slice(startIndex, endIndex);

    console.log("FilteredCancellationHCRequests:", this.FilteredCancellationHCRequests);
  }

  refreshDelayedRequestsPagination() {

    this.DelayedReqcollectionSize = this.HCDelayedRequests.length;
    this.FilteredDelyedHCRequests = this.HCDelayedRequests
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.delayedPage - 1) * this.delayedPageSize, (this.delayedPage - 1) * this.delayedPageSize + this.delayedPageSize);
    // console.log("PendingHCRequests", this.HCDelayedRequests);
  }

  DisplayRiderSchedule(rider) {
    this.showRiderSchedule = true;
    this.SelRider = {

    };
    this.RiderTasksSchedule(rider);

  }

  RiderTasksSchedule(Riderdata) {
    this.RiderScheduleData = [];
    this.SelRider.selRiderID = Riderdata.RiderID;
    this.SelRider.selRiderName = Riderdata.RiderFirstName + ' ' + Riderdata.RiderLastName;
    this.SelRider.selRiderContactNumber = Riderdata.ReferenceContactNo;
    const params = {
      "RiderID": Riderdata.RiderID || Riderdata
    }
    this.HCService.GetRiderScheduleByRiderID(params).subscribe((resp: any) => {

      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.RiderScheduleData = resp.PayLoad.filter(a => { return a.HCBookingStatusID == 3 || a.HCBookingStatusID == 4 || a.HCBookingStatusID == 5 }) as RiderSchedule[];
        if (this.RiderScheduleData.length)
          this.showRiderSchedule = true;
        else
          this.showRiderSchedule = false;
      }
      else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.RiderScheduleData = [];
        this.showRiderSchedule = false;
      }
      else if (resp.StatusCode == 500) {

      }
    }, (err) => { console.log(err) })
  }

  CheckHCTime(event) {
    const SelHCDateTime = this.HCDateTime.year + "-" + this.HCDateTime.month + "-" + this.HCDateTime.day; + ' ' + this.HCtime.hour + ':' + this.HCtime.minute;
    const outputDate = new Date(SelHCDateTime);

    outputDate.setHours(event.hour || this.HCtime.hour);
    outputDate.setMinutes(event.minute || this.HCtime.minute);
    outputDate.setSeconds(event.second || this.HCtime.second);


    // if current mode is AM then
    if (this.HCtime.hour <= 0 && this.HCtime.hour < 12) {
      //save value as is in 24h format(no correction needed)
    }
    else if (this.HCtime.hour > 12) {//entered value is 12 then
      // store it as 0 in 24h format(in current implementation we add 12 to it and then`mod 24` transform it to 0)
    }


    // else if current mode is PM then
    //   if 0 <= entered value < 12 then
    //     add 12 and save
    //   else if  entered value >= 12
    //     store it as is in 24h format by doing`mod 24`



    if (outputDate.getTime() > new Date().getTime()) {

      this.InvalidHCTime = false;

    } else {
      this.toastr.warning("Please select available time");

      // this.HCDateTime = '';
      this.InvalidHCTime = true;
    }
    const sametimeExist = this.RiderScheduleData.filter(a => { return new Date(a.HCDateTime).getTime() == outputDate.getTime() });
    if (sametimeExist.length) {
      this.toastr.warning("Booking With Same Date Time Already Exist");
    }

  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  openRegistredTestIfo(selBookingData) {

    this.getSelBookingMoreInfo(selBookingData);
    this.appPopupService.openModal(this.RequestDetailModal);
  }
  BookingSlot = null;
  openEditOnlineReq(hc) {
    this.BookingSlot = null
    this.BookingIDToEdit = hc.BookingPatientID;
    this.BookingSlot = hc.BookingSlot

    this.appPopupService.openModal(this.EditOnlineReqModal);
  }
  openRiderAssignWithScheduleModal() {
    console.log("🚀 this.PendingHCRequests: ", this.PendingHCRequests)
    const RiderID = this.PendingHCRequests.find(a => a.isSelected)?.RiderID || null;
    // this.RidersDetail();
    this.selRiderToAssign = RiderID;
    this.selBranchid = null;
    this.SelTechIDToAssign = null;
    this.showRiderSchedule = false;
    this.RiderScheduleData = [];
    this.appPopupService.openModal(this.AssignRiderWithScheduleModal);
  }
  OpenMoreInfoPopup(selBookingData) {
    console.log("🚀 ~ HCRequestsComponent ~ OpenMoreInfoPopup ~ selBookingData:", selBookingData)

    this.getSelBookingMoreInfo(selBookingData);
    this.appPopupService.openModal(this.RequestDetailModal);
  }
  OpenInProgMoreInfoPopup(selBookingData) {

    this.getInProgSelBookingMoreInfo(selBookingData);
    this.appPopupService.openModal(this.InProgReqMoreInfoModal);
  }
  openRegDetailInfoPopup(selBookingData) {

    this.getRegisterdInfoData(selBookingData.BookingPatientID);
    this.appPopupService.openModal(this.RegDetailInfoModal);
  }
  getRegisterdInfoData(BID) {
    const params = {
      "BookingID": BID
    }
    this.HCService.registredTestDetailByBookingID(params).subscribe((resp: any) => {

      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.registredTestInfoByBookingID = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }
  OpencancelledMoreInfoPopup(selBookingData) {

    this.getcancelledSelBookingMoreInfo(selBookingData);
    this.appPopupService.openModal(this.CancelledMoreInfoModal);
  }
  getSelBookingMoreInfo(selBookingData) {
    const arr = []
    this.SelBookingData = [...arr, selBookingData]  //this.PendingHCRequests.filter(a => { return a.BookingPatientID == selBookingData.BookingPatientID })
  }
  getInProgSelBookingMoreInfo(selBookingData) {

    this.selInProgReq = this.InProgressRequests.filter(a => { return a.HCRequestID == selBookingData.HCRequestID });

  }
  getcancelledSelBookingMoreInfo(selBookingData) {
    this.selcancelledReq = this.HCCancelledRequestList.filter(a => { return a.HCRequestID == selBookingData.HCRequestID });

  }
  getRidersByZoneID(zoneDetail) {
    const param = {
      "HCZoneID": zoneDetail.HCZoneID
    }
    this.HCService.GetRiderByZoneID(param).subscribe((resp: any) => {
      this.zonesRidersList = resp.PayLoad;

    }, (err) => { console.log(err) })
  }

  OpenZoneRiderPopup(zoneDetail) {
    this.getRidersByZoneID(zoneDetail);
    this.appPopupService.openModal(this.ZoneRiders), { size: 'sm' };
  }

  openConfirmationModalForupdateRequest(selData, context) {

    this.selDataForUpdateReq = selData;

    this.appPopupService.openModal(context, { size: 'lg' });
  }
  editRequest(selData) {

    const selbookingData = this.PendingHCRequests.filter(a => { return a.BookingPatientID == selData.BookingPatientID })
    const selbookingID = btoa(selbookingData[0].BookingPatientID);
    const URL = "#/hc/update-hcbooking?BID=" + selbookingID;
    window.open(URL, '_blank');

  }
  editInProgRequest(selData) {

    const selbookingData = this.HCInProgressRequests.filter(a => { return a.BookingPatientID == selData.BookingPatientID })
    console.log("🚀 ~ editInProgRequest ~ selbookingData:", selbookingData)
    // let selbookingID = btoa(selbookingData[0].bookingDetail[0].BookingPatientID);

    this.BookingSlot = null
    this.BookingIDToEdit = selbookingData[0].bookingDetail[0].BookingPatientID;
    this.BookingSlot = selbookingData[0].bookingDetail[0].BookingSlot;

    this.appPopupService.openModal(this.EditOnlineReqModal);
    // let URL = "#/hc/update-hcbooking?BID=" + selbookingID;
    // window.open(URL, '_blank');

  }
  getSelRider() {
    const selRiderInfo = this.RidersDetailList.filter(a => { return a.RiderID == this.selRiderToAssign });
    if (selRiderInfo.length) {
      this.AssignRider(selRiderInfo, 'rider');
      setTimeout(() => {
        this.OnlineHCRequests();
        this.paginationMyIDC.paginatedSearchResults.every(sec => {
          sec.isSelected = false;
        });
        this.appPopupService.closeModal();
      }, 500);

    }
    else {
      this.toastr.warning("Please select rider first");
    }
  }

  getZonesByHCCityId(hccity) {
    console.log("SelBookingData", this.SelBookingData);
    if (hccity) {
      const params = {
        HCCityID: hccity
      }
      this.HCService.GetZonesByHCCityID(params).subscribe((resp: any) => {
        console.log("Zones by city ID ", resp);
        if (resp && resp.PayLoad && resp.StatusCode) {
          this.ZonesList = resp.PayLoad;
        }
        else {

        }
      }, (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong")
      })
    } else {
      this.toastr.error("Provide HC City")
    }
  }

  //start Pending Visits For HC Booking 

  getPendingVisistsForHCBooking() {
    this.spinner.show(this.spinnerRep.RequestDetailSpinner);
    this.VisitTPDetail = [];
    this.VisitPatDetail = [];
    this.selVisit = "";
    this.HCService.getPendingVisits().subscribe((resp: any) => {
      console.log(resp);
      this.spinner.hide(this.spinnerRep.RequestDetailSpinner);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PendingBookingVisits = resp.PayLoad;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRep.RequestDetailSpinner);
      console.log(err)
    })
  }

  getVisitDetailByVisitID(visitid) {

    this.visitCreatedByName = "";
    this.hcPerformedby = "";
    this.selVisit = visitid.VisitId || this.SearchVisitNo;
    const params = {
      VisitID: visitid.VisitId || this.SearchVisitNo
    }
    this.spinner.show(this.spinnerRep.RequestDetailSpinner);
    this.HCService.getVisitDetailByVisitID(params).subscribe((resp: any) => {
      console.log(resp);
      this.spinner.hide(this.spinnerRep.RequestDetailSpinner);
      if (resp && resp.StatusCode == 200 && resp.PayLoadDS.Table.length) {
        this.VisitPatDetail = resp.PayLoadDS.Table;
        this.visitCreatedByName = this.VisitPatDetail[0].CreatedByEmpName;
        this.hcPerformedby = this.VisitPatDetail[0].HCPerformedby;
        this.VisitTPDetail = resp.PayLoadDS.Table1;
      }
      else {
        this.VisitPatDetail = [];
        this.VisitTPDetail = [];
      }
    }, (err) => { this.spinner.hide(this.spinnerRep.RequestDetailSpinner); console.log(err) })
  }

  openBookingScreen() {
    delete this.VisitPatDetail[0]["BloodGroup"];
    // let char = '&';
    // this.VisitTPDetail.filter(a => { return a.TestProfileName.indexOf(char) > -1 }).map(a => { delete a.TestProfileName });
    // delete this.VisitPatDetail[0]["TestProfileName"];

    // this.router.navigate(['#/pat-reg/hc-booking']).then(result => {
    //   window.open('#/pat-reg/hc-booking?' + 'selVisiPat=' + btoa(JSON.stringify(this.VisitPatDetail)) + '&selVisitTP=' +
    //     btoa(JSON.stringify(this.VisitTPDetail)), '_blank');
    // });

    window.open('#/pat-reg/hc-booking?' + 'selVisiPat=' + btoa(JSON.stringify(this.VisitPatDetail)) + '&selVisitTP=' +
      btoa(JSON.stringify(this.VisitTPDetail)), '_blank');

    // this.router.navigate(['#/pat-reg/hc-booking']).then(result => {
    //   window.open('#/pat-reg/hc-booking?selVisiPat=' + (JSON.stringify(this.VisitPatDetail)) + '&selVisitTP=' +
    //     (JSON.stringify(this.VisitTPDetail)), '_blank');
    // });
    // let link = "#/pat-reg/hc-booking"
    // this.router.navigate([`${link.split('?')[0]}`, { queryParams: {selVisiPat: JSON.stringify(this.VisitPatDetail), selVisitTP: JSON.stringify(this.VisitTPDetail)}}], {

    // });

  }
  //end Pending Visits For HC Booking 

  //Start HC Chat

  checkCanRemarksValidation() {
    if (this.CancelRequestRemarks)
      this.CanRemarksClass = "valid";
    else
      this.CanRemarksClass = "invalid invalid-highlighted";

  }
  checkRequestCompRemarksValidation() {
    if (this.HCAdminCloseRequestRemarks)
      this.reqComRemarksClass = "valid";
    else
      this.reqComRemarksClass = "invalid invalid-highlighted";

  }
  getHCBookingChatMsgs() {
    const params = {
      "BookingID": this.SelDataForHCBookingChat.BookingPatientID
    }
    this.spinner.show(this.spinnerRep.chatBoxSpiiner);
    this.HCService.getHCBookingMessages(params).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.HCBookingMessages = resp.PayLoad;
      }

      this.spinner.hide(this.spinnerRep.chatBoxSpiiner); setTimeout(() => {
        // this.HCService.askServerListener();
        // this.HCService.test('there we go');
      }, 3000);
    }, (err) => {
      console.log("err", err);
      this.spinner.hide(this.spinnerRep.chatBoxSpiiner);

    })

  }

  hubConnection: signalR.HubConnection | undefined;


  startHCBookingChat(hcData) {
    this.HCBookingMessages = [];
    hcData.hasNewMessage = false;
    this.hcBookingTxtMsg = "";
    this.isHCMsgUrgent = 0;
    console.log("Goooood to go ", hcData);
    // this.selBookingIdForHCChat = hcData.BookingPatientID;
    this.SelDataForHCBookingChat = {
      "BookingPatientID": hcData.BookingPatientID,
      "RiderID": hcData.RiderID,
      "RiderDeviceToken": hcData.RiderDeviceToken
    }
    this.appPopupService.openModal(this.HCBookingChat, { size: 'xl' });
    this.getHCBookingChatMsgs();

  }
  currentBookingId: string = null;
  messages = [];
  unreadCount = {};
  openChat(hc) {
    this.SelDataForHCBookingChat = {
      "BookingPatientID": hc.BookingPatientID,
      "RiderID": hc.RiderID,
      "RiderDeviceToken": hc.RiderDeviceToken
    }
    this.appPopupService.openModal(this.HCBookingChat, { size: 'xl' });
    this.getHCBookingChatMsgs();
    console.log("hc for chat", hc);
    this.currentBookingId = hc.HCRequestID;
    this.unreadCount[hc.HCRequestID] = 0;

    // TODO: Load old messages from API
    this.messages = [];
  }

  sendMessage() {
    this.chatSrv.sendMessage(String(this.SelDataForHCBookingChat.BookingPatientID), "2", this.hcBookingTxtMsg);
  }


  DiconnectSignalR() {
    this.chatSrv.DisconnectMe()
  }
  sendHCBookingChatMessage() {
    // this.SignalR.startConnection();
    // this.SignalR.sendMessageToRider(
    //   String(this.SelDataForHCBookingChat.BookingPatientID),
    //   this.hcBookingTxtMsg,
    //   this.SelDataForHCBookingChat.RiderDeviceToken);

    // this.SignalR.messageReceived.subscribe((response: any) => {
    //   if (response) {

    //     // res.hubPayLoadStr.Message
    //     console.log('Message received in component:', response);
    //     // update UI here
    //   }
    // });
    // this.SignalR.askServerListener();
    //   let newMessage = null;

    //   // this.HCService.hcBookingChatResp.sub
    //   this.IsSendChatBtnDisabled = true;
      const params = {
        BookingID: String(this.SelDataForHCBookingChat.BookingPatientID),
        HCRequestID: null,
        isUrgent: Number(this.isHCMsgUrgent),
        RemarksForHCChat: this.hcBookingTxtMsg,
        HCBookingStatusID: null,
        UserType: 2, 
        CreatedBy: this.loggedInUser.userid,
        RemarksBy: this.loggedInUser.fullname,
        RiderID: this.SelDataForHCBookingChat.RiderID,
        RiderDeviceToken: this.SelDataForHCBookingChat.RiderDeviceToken,
        MsgSentDateTime: moment().format()
      }
    //   // setTimeout(() => {
    //   // this.HCService.askServerListener();
    //   // this.chatNoticount = 0;


      this.HCService.updateHCBookingRemarks(params)


    //   // }, 3000);
    // this.IsSendChatBtnDisabled = true;
    //  this.sharedService.insertUpdateData(API_ROUTES.UPD_HC__BOOKING_REMARKS, params)
    //   .subscribe({
    //     next: (resp: any) => {
    //       console.log("resp", resp);
    //       this.IsSendChatBtnDisabled = false;
    //       if (resp.StatusCode === 200) {
    //         // this.SignalR.sendMessageToBooking(params.BookingID, params.RemarksForHCChat);
    //         this.getHCBookingChatMsgs();
    //         this.hcBookingTxtMsg = "";
    //         this.isHCMsgUrgent = 0;
    //       } else {
    //         this.toastr.error("Something went wrong");
    //       }
    //     },
    //     error: (err) => {
    //       this.IsSendChatBtnDisabled = false;
    //       console.error("err", err);
    //       this.toastr.error("Something went wrong");
    //     }
    //   });

  }
  showMessageDetail() {
    if (this.isShowMessageDetail)
      this.isShowMessageDetail = false;
    else
      this.isShowMessageDetail = true;

  }

  //End HC Chat 

  setEmoji(emojiState) {
    this.selectedEmoji = this.feedbackRating[emojiState];
  }

  tabChanged(tabid) {
    if (tabid == 2 && this.InProgressRequests.length > 0) {
      this.InProgressRequests.forEach(b => {
        this.chatSrv.joinBooking(String(b.HCRequestID ?? ''));
      });
    }
    if (tabid == 13) {
      this.notifications = this.notifications.map(n => ({
        ...n,
        isRead: true
      }));
    }
    this.clearFieldsOnTabChange()
    this.visibleTab = tabid;
    if (tabid !== 1)
      this.enabaleAssignRiderBtn = false;
    else if (tabid == 1 && this.SelBookkings.length)
      this.enabaleAssignRiderBtn = true;
    else
      this.enabaleAssignRiderBtn = false;

    if (tabid == 8) {
      this.getPendingVisistsForHCBooking();
    }

  }

  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }
  clearFieldsOnTabChange() {
    this.SelBookkings = [];
    this.SelOnlineBookkings = [];
    this.paginationMyIDC.paginatedSearchResults.map(a => { a.isSelected = false });
    this.PendingHCRequests.map(a => { a.isSelected = false });
  }

  getRegTPDetailByHCReqID(reqid) {
    this.isShareGenerationDecision = true;
    const params = {
      HCRequestID: reqid
    }
    this.HCService.getRegTPDetailByHCReqID(params).subscribe((resp: any) => {
      console.log(resp);
      this.getVisitHomeCollectionTest();
      if (this.VisitHomeSamplingTest.length) {
        if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
          resp.PayLoad.map(a => {
            const isHC = this.VisitHomeSamplingTest.filter(b => { return a.TPId == b.TPId });
            if (isHC.length && a.StatusId == -1) {
              this.isShareGenerationDecision = false;
            }
          })
        }
      }
    }, (err) => { console.log(err) });
  }

  getVisitHomeCollectionTest() {
    this.hcBService.getVisitHomeCollectionTest().subscribe((resp: any) => {
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.VisitHomeSamplingTest = resp.PayLoad;

      }
    }, (err) => { console.log(err) })
  }

  inquiryView() {
    setTimeout(() => {
      this.docsPopupRef = this.appPopupService.openModal(this.ViewInquiry, {
        backdrop: "static",
        size: "fss",
      });
    }, 200);
  }
  HscReqLength(length: number) {
    console.log("this.HscLength, ", length)
    this.hscReqCount = length;
  }


  refreshPagination() {
    this.paginationMyIDC.collectionSize = this.HCOnlineRequestList.length;
    this.paginationMyIDC.paginatedSearchResults = this.HCOnlineRequestList
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.paginationMyIDC.page - 1) * this.paginationMyIDC.pageSize, (this.paginationMyIDC.page - 1) * this.paginationMyIDC.pageSize + this.paginationMyIDC.pageSize);
  }

  openHCReports(event) {
    if (event == 1) {
      //Inquiry
      this.appPopupService.openModal(this.InquiryReport, {
        backdrop: "static",
        size: "xl",
      });
    }
    if (event == 2) {
      //Booking
      this.appPopupService.openModal(this.BookingReport);
    }
  }

}

export interface RiderSchedule {
  HCDateTime: Date;
  PatientLatitude: number;
  PatientLongitude: number;
  BookingPatientID: number;
  // HCBookingStatusID: number, 
  HCBookingStatus: string;
  PatientName: string;
  PatientAddress: string
}
export interface NotificationModel {
  bookingID: string;
  message: string;
  userType: number;
  riderDeviceToken: string;
  isRead?: boolean;

}