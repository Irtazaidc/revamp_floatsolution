// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { LookupService } from '../../services/lookup.service';
import { PatientService } from '../../services/patient.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { StorageService } from '../../../shared/helpers/storage.service';
import { CONSTANTS } from '../../../shared/helpers/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardComponent } from 'angular-archwizard';
import { DomSanitizer } from '@angular/platform-browser';
import { Conversions } from '../../../shared/helpers/conversions';
import { NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import { TokenService } from '../../../shared/services/token.service';
import { HelperService } from '../../../shared/helpers/helper.service';
import { AppPopupService } from '../../../shared/helpers/app-popup.service';
import { AuthService, UserModel } from '../../../auth';
import { VisitService } from '../../services/visit.service';
import { FbrService } from 'src/app/modules/shared/services/fbr/fbr.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import moment from 'moment';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  standalone: false,

  selector: 'discount-card-sale',
  templateUrl: './discount-card-sale.component.html',
  styleUrls: ['./discount-card-sale.component.scss']
})
export class DiscountCardSaleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild('searchPatientsPopup') searchPatientsPopup;

  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild("canvas") public canvas: ElementRef;
  @ViewChild('aryecustomersuccessPopup') aryecustomersuccessPopup;
  @ViewChild('aryEmemberleadstoCardmemberPopup') aryEmemberleadstoCardmemberPopup;
  @ViewChild('noarycustomerleadstoCardmemberPopup') noarycustomerleadstoCardmemberPopup;

  video: any;
  activeVideoCameraStream: any;
  openCameraFromSource = '';
  videoDimensions = {
    width: 300,
    height: 300
  }
  cameraDevicesList = [{ id: '', name: 'default' }];
  selectedCamera = '';
  pageTitle = 'Discount Card Sale'

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  // age:any = '';
  dateFormat = 'DD-MM-YYYY'; //'YYYY-MM-DD';
  maxDate_dob = moment(new Date()).format(this.dateFormat);
  maxDate_dob_bs = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };
  resizeFileSize = {
    thumbnail: {
      width: 90,
      height: 90
    },
    width: 500,
    height: 500
  }
  resizePatientProfilePic = {
    width: 500,
    height: 500
  }
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
  showPatientAdditionalFields = false;

  dmyEnum = [
    { id: 1, name: 'day(s)' },
    { id: 2, name: 'mon(s)' },
    { id: 3, name: 'yr(s)' }
  ];

  loggedInUser: UserModel;

  screenPermissions = [];
  screenPermissionsObj: any = {};
  gendersList = [];
  salutationsList = [];
  mobileOperatorList = [];
  citiesList = [];
  countriesList = [];
  branchesList = [];
  bloodGroupList = [];
  maritalStatusList = [];
  paymentModesList = [];
  discountCardsList = [];
  cardTypeList: any = [
    {
      cardId: 1,
      cardTitle: "System Generated"
    },
    {
      cardId: 2,
      cardTitle: "Custom Card"
    },
  ];
  countryIdForPak = 168;
  cusCardno: any = null;
  cardExpiredOn: any = "";
  selectedDiscountCard: any = 1;

  patientBasicInfo = this.fb.group({
    PatientID: [''],
    MRNo: [''],
    // PatientVaccineNo: [''], //[{value: '', disabled: true}],
    // OrbitPatientID: [''],
    BookingPatientID: [''],
    Salutation: ['', Validators.required],
    FirstName: ['', Validators.required], //, Validators.required],
    LastName: [''],
    CNIC: [''],
    PassportNo: [''],
    Gender: ['', Validators.required],
    DateOfBirth: ['', Validators.required],
    Age: [{ value: '', disabled: false }, Validators.required],
    dmy: [{ value: '3', disabled: false }, Validators.required],
    FatherName: [''],
    HomeAddress: [''],
    PhoneNO: [''],
    MobileOperatorID: ['', Validators.required],
    MobileNO: ['', Validators.required],
    Emails: [''],
    ModifyBy: [0],
    PatientPic: [''],
    Religion: [''],
    CountryID: [this.countryIdForPak],
    CityID: [0],
    // EmergencyPhoneNo: [''],
    // EmergencyContactName: [''],
    // EmergencyContactRelation: [''],
    BranchID: [''],
    BloodGroup: [''],
    MaritalStatus: [''],
    ReferenceNo: [''],
    Designation: [''],
    RefDoc: '',/*[{
      Name: 'Self'
    }],*/
    RefNo: [''],
    InternalRemarks: [''],
    PatientComments: [''],
  });

  /* start - payment details */
  totalAmount = 0;
  selDiscountCardType: any = 1;
  minimumReceivableAmount = 0;
  /* end - payment details */

  cnicValidationCheck = true;

  todayDate: { year: number; month: number; day: number; };

  OrbitPatientID: any = "";

  selectedPaymentModeToAdd: any = '';
  addedPaymentModes = [];
  selectedDiscountCards = [];
  disCardRemarks = '';
  disCardAddress = '';

  patientBasicInforFormSubmitted = false;
  paymentInforFormSubmitted = false;

  spinnerRefs = {
    searchEmployee: 'searchEmployee',
    refByDocField: 'refByDocField',
    testProfilesDropdown: 'testProfilesDropdown',
    panelsDropdown: 'panelsDropdown',
    homeSamplingEmp: 'homeSamplingEmp',
    discountCards: 'discountCards',
    recentRegs: 'recentRegs'
  }


  selectedPatientSource = 0;
  selectedPatientSource_enum = { 0: 'New Reg.', 1: 'New Reg.', 10: 'Searched Patient', 11: 'Recent Registrations', 20: 'Online Booked Pat.', 21: 'Online Booked Pat. Linked', 30: 'Emp. Self', 31: 'Emp. Dep.' }

  linkdedPatient: any = null;

  patientBasicInfoDisabled = null;
  patientContactInfoDisabled = null;


  invoiceCopyTypeEnum = [
    // {
    //   id: 0,
    //   name: 'Print Preview'
    // },
    {
      id: 1,
      name: 'Print Preview',
    },
    {
      id: 2,
      name: 'Print Patient & Lab Copy',
    },
    {
      id: 3,
      name: 'Print Patient Copy',
    },
    {
      id: 4,
      name: 'Print Lab Copy',
    },
    {
      id: 5,
      name: 'Print Account Copy',
    },
    {
      id: 6,
      name: 'Account Copy Preview'
    }
  ];
  invoiceCopyType = 1;

  qTokenNo = '';
  minExpDate = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };

  public isPatientBasicInfoFormValid: (MovingDirection) => boolean;

  MACAndPOSAlert = {
    POS: '',
    POSID: '',
    MAC: ''
  };
  InvalidCardno = false;
  discountCardNumber: any = [];
  stickerText: string = null;
  isAlreadyCustomer = false;
  cardMemberOnly = false;
  disableCardNumberInput = false;
  IsPatientARYCardmember: any = false;
  AddressRequiredMsg = false;



  constructor(
    private shareSrv: SharedService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private patientService: PatientService,
    private lookupService: LookupService,
    private visitService: VisitService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private storageService: StorageService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal,
    bsModalConfig: NgbModalConfig,
    private multiApp: MultiAppService,
    private el: ElementRef,
    private appPopupService: AppPopupService,
    private qMgmtService: TokenService,
    private helperSrv: HelperService,
    private fbr: FbrService
  ) {
    bsModalConfig.backdrop = 'static';
    bsModalConfig.keyboard = false;
  }


  ngOnInit(): void {
    this.stickerText = "";
    this.AddressRequiredMsg = false;
    this.IsPatientARYCardmember = false

    this.cardMemberOnly = false;
    this.isAlreadyCustomer = false
    this.disableCardNumberInput = false;

    const current = new Date();
    this.todayDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };

    this.cd.detectChanges();

    this.getPermissions();
    this.loadLoggedInUserInfo();
    this.getGendersList();
    this.getBloodGroups();
    this.getLookupsForRegistration();
    this.getDiscountCardType();

    this.route.queryParams
      .subscribe(params => {
        this.AddressRequiredMsg = false;

        this.cardMemberOnly = false;
        this.isAlreadyCustomer = false;
        this.stickerText = "";
        this.IsPatientARYCardmember = false

        this.disableCardNumberInput = false;

        // this.appPopupService.closeModal();
        if (params.p) {
          let allParams: any = atob(params.p);
          allParams = JSON.parse(allParams);
          console.log(allParams);
          this.selectedPatientSource = allParams.patSrc || 0;

          this.searchPatient(allParams.orbitPatientID);
        } else {
          this.updateUrlParams_navigateTo('');
        }
        // if (this.selectedPatientSource != 20 && this.selectedPatientSource != 22) {
        this.appPopupService.closeModal();
        // }
        this.selectedDiscountCards = [];
        this.selectedDiscountCard = null;
      }
      );

    this.storageService.qMgmtTokenForPatReg.subscribe(token => {
      // console.log(' ccccccccccccc ', token)
      this.qTokenNo = this.getParseQMgmtToken(token);
    });

    this.qTokenNo = this.getParseQMgmtToken();

    this.isPatientBasicInfoFormValid = (direction) => {
      if (!this.macAllowedForRegistration()) {
        return;
      }
      this.patientBasicInforFormSubmitted = true;
      let valid = true;
      // return valid;
      const maxLengthErrors = [];


      const selectedDob1 = moment(new Date(this.patientBasicInfo.value.DateOfBirth.year, this.patientBasicInfo.value.DateOfBirth.month, this.patientBasicInfo.value.DateOfBirth.day)).format();
      const selectedDob = moment(new Date(`${this.patientBasicInfo.value.DateOfBirth.month}-${this.patientBasicInfo.value.DateOfBirth.day}-${this.patientBasicInfo.value.DateOfBirth.year}`)).format();
      if (moment(new Date()).diff(moment(selectedDob)) < 0) {
        valid = false;
        this.toastr.warning('Please select past date for DOB');
        return valid;
      }

      // if(!valid) {
      //   this.toastr.warning('Please fill required fields');
      // }

      if (maxLengthErrors.length) {
        this.toastr.warning(maxLengthErrors.join('<br>'), 'Input data exceed', { enableHtml: true });
      }
      if (!this.selectedDiscountCards.length) {
        valid = false;
      }
      if (this.selDiscountCardType == 2 && this.cusCardno && this.cardExpiredOn) {
        valid = true;
      }
      else if (this.selDiscountCardType == 1 && this.cusCardno == '' && this.cardExpiredOn == '') {
        valid = true;
      }
      else if (this.selDiscountCardType == 2 && this.cusCardno !== '' && this.CardTypeId == 15) {
        valid = true;
      }
      else {
        valid = false
        // this.toastr.warning("Please Select the mandatory fields");
      }
      Object.keys(this.patientBasicInfo.controls).forEach((a) => {
        // console.log(this.patientBasicInfo.controls[a].errors ? 'invalud' : 'valid')
        if (this.patientBasicInfo.controls[a].errors) {
          if (this.patientBasicInfo.controls[a].errors.maxlength) {
            maxLengthErrors.push(a + ': ' + this.patientBasicInfo.controls[a].errors.maxlength.actualLength + '/' + this.patientBasicInfo.controls[a].errors.maxlength.requiredLength);
          }
          valid = false;
        }
      });

      if (this.patientBasicInfo.controls['MobileOperatorID'].value == -1) {
        valid = false;
      }
      if (this.cusCardno && !this.isVerifiedCardNo && this.CardTypeId !== 15) {
        valid = false;
        this.toastr.error('Card Number is not verified');
        return valid;
      }
      if (this.isAlreadyCustomer == true && this.CardTypeId === 15) {
        valid = false
        this.toastr.error("Patient is already an Ary Card Member");
      }
      if (!this.IsPatientARYCardmember && this.CardTypeId === 15) {
        valid = false
        this.toastr.error("you cannot proceeed as this patient is not card member of ary");
      }
      return valid;
    };
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit');
    this.video = this.videoElement.nativeElement;

    this.patientBasicInfo.get('DateOfBirth').valueChanges.subscribe(val => {
      // console.log('DateOfBirth subscribe ',  val);
      // console.log(val);
      // let selectedDob = new Date(val.year, val.month, val.day); //moment(new Date(`${val.month}-${val.day}-${val.year}`)).format();
      const selectedDob = new Date(val.year, val.month - 1, val.day); //moment(new Date(`${val.month}-${val.day}-${val.year}`)).format();
      const _ageObj = this.calculateAge(selectedDob);
      // console.log('_ageObj _ageObj _ageObj ', _ageObj);
      this.patientBasicInfo.patchValue({
        //Age: obj.years ? (obj.years + ' years') : obj.months ? (obj.months + ' months') : (obj.days + 'days')
        Age: _ageObj.years ? _ageObj.years : _ageObj.months ? _ageObj.months : _ageObj.days
      });
      this.patientBasicInfo.patchValue({
        dmy: _ageObj.years ? '3' : _ageObj.months ? '2' : '1'
      });
    });



    this.patientBasicInfo.get('Salutation').valueChanges.subscribe((val: any) => {
      const genderValue = this.patientBasicInfo.value.Gender;
      const salutationForGender = this.salutationsList.filter(a => a.SalutationTitle == val).length ? this.salutationsList.filter(a => a.SalutationTitle == val)[0].ForGender : '';
      if (genderValue != salutationForGender && salutationForGender) {
        // setTimeout(() => {
        this.patientBasicInfo.patchValue({
          Gender: salutationForGender
        });
        // }, 500);
      }
    });

    this.patientBasicInfo.controls['LastName'].clearValidators();
  }

  discountCardChange() {

  }

  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    // this.screenPermissions = (this.storageService.getLoggedInUserProfilePermissions(_activatedroute) || []); // .filter(a=>a.state == _activatedroute);
    // this.screenPermissions.forEach(a=>{
    //   this.screenPermissionsObj[a.key] = a.key;
    // })
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log(this.screenPermissionsObj);
    this.reApplyPermissions();
  }
  reApplyPermissions() {
    if (!this.screenPermissionsObj.update_patient && this.patientBasicInfo.value.PatientID) {
      this.disablePatientBasicInfoFields(true);
    } else if (this.patientBasicInfo.value.PatientID && this.route.routeConfig.path == 'regForHS') {
      this.disablePatientBasicInfoFields(true);
    } else {
      if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {
      } else {
        this.disablePatientBasicInfoFields(false);
      }
    }
  }

  /*  start - camera */
  initCamera(config: any) {
    const browser = navigator as any;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    if (this.activeVideoCameraStream) {
      this.stopCamera();
    }
    // console.log('config ', config);

    this.spinner.show();
    browser.mediaDevices.getUserMedia(config).then(stream => {
      this.spinner.hide();
      this.activeVideoCameraStream = stream;
      this.video.srcObject = stream;
      this.video.play();
      browser.mediaDevices.enumerateDevices().then(mediaDevices => {
        this.getCameraDevices(mediaDevices);
      })
    }).catch(error => {
      this.spinner.hide();
      this.toastr.warning(error);
    });
  }
  startCamera(settings = {}) {
    let _settings = { video: true, audio: false };
    _settings = { ..._settings, ...settings };
    this.initCamera(_settings);
  }
  stopCamera() {
    if (this.activeVideoCameraStream) {
      this.activeVideoCameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.activeVideoCameraStream = '';
    this.canvas.nativeElement.getContext('2d').clearRect(0, 0, this.videoDimensions.width, this.videoDimensions.height);
  }
  capture() {
    const context = this.canvas.nativeElement.getContext("2d").drawImage(this.video, 0, 0, this.videoDimensions.width, this.videoDimensions.height);
    this.patientBasicInfo.patchValue({
      PatientPic: this.canvas.nativeElement.toDataURL("image/png")
    });
  }
  cameraChangedEvent() {
    this.openCamera('');
  }
  getCameraDevices(mediaDevices) {
    console.log(this);
    // console.log('getCameraDevices ', mediaDevices);
    this.cameraDevicesList = [{ id: '', name: 'default' }];
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const obj = {
          id: mediaDevice.deviceId,
          name: mediaDevice.label || `Camera ${count++}`
        }
        // console.log('aaaaaaaaaaaa ', obj);
        this.cameraDevicesList.push(obj);
      }
    });
  }
  /* end - camera */

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;

    // this.loggedInUser.locationid = 100; // 34;

    this.patientBasicInfo.patchValue({
      BranchID: this.loggedInUser.locationid || ''
    });
    // console.log(this.loggedInUser);
    // this.getMACAddress(this.loggedInUser);
  }

  saveDiscountCard() {

    if (!this.macAllowedForRegistration()) {
      return;
    }
    console.log("addedPaymentModes", this.addedPaymentModes)
    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);

    if (totalAmountByPaymentModes > this.totalAmount) {
      this.toastr.warning(`Payable Amount is: "<strong>${this.totalAmount}</strong>"`, 'Amount Exceed', { enableHtml: true });
      return;
    }
    this.paymentInforFormSubmitted = true;
    const data = this.getFinalDataSet();
    const paymentFormValidity: any = this.isPaymentFieldsValid();
    // console.log(paymentFormValidity);
    if (!paymentFormValidity.valid) {
      this.toastr.warning(paymentFormValidity.message);
      return;
    }

    const fbrRequestData: any = this.formatDataForFBR(data);

    // data.FBRInvoiceNo = '';
    data.FBRRequestData = fbrRequestData; //JSON.stringify(fbrRequestData);

    const dataVisit = this.getFinalDataSetforVisit();
    const fbrRequestDataforVisit: any = this.formatDataForFBR(dataVisit);
    dataVisit.FBRRequestData = fbrRequestDataforVisit;

    // this.saveDiscountCardPost(data);
    if (this.selectedDiscountCards[0].TPId) {
      this.submitRegistrationForDiscountCard(dataVisit);
    } else {
      this.saveDiscountCardPost(data);
    }
  }

  saveDiscountCardPost(data) {
    const patientVisitInvoiceWinRef: any = this.openInvoiceWindow();
    // patientVisitInvoiceWinRef.location = ''; // fix for iOS devices // https://stackoverflow.com/a/39387533 // window.open(url, '_blank'); not working on iMac/Safari
    this.spinner.show();

    this.visitService.saveDiscountCardSale(data).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length && res.PayLoad[0].Result == 1) {

        this.toastr.success('Discount card sale completed successfully.', 'Discount Card Sale');
        // this.toastr.success('Success, Registration complete.<br> Click to copy <br> <b>'+res.PayLoad[0].VisitID+"</b>", '', {enableHtml: true, timeOut: 5000, tapToDismiss: false}).onTap
        // .pipe(take(1))
        // .subscribe((a) => {
        //   this.helperSrv.copyMessage(res.PayLoad[0].VisitID)
        // });

        // this.saveQManagementTokenWithVisit(res.PayLoad[0].VisitID);
        // this.resetAllForm_CompleteRegistration();
        // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: res.payLoad[0].visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
        // window.open(url.toString(), '_blank');
        /*
        if(this.isAirportLocation()) {
          this.printBarcode(res.PayLoad[0].VisitID);
        }
        */
        patientVisitInvoiceWinRef.location = this.getPatientVisitInvoiceUrl(res.PayLoad[0].CardID);
        // this.openInvoice(res.PayLoad[0].VisitID);

        //this.updateUrlParams_navigateTo(['invoice/patient-visit-invoice'], {p: btoa(JSON.stringify({visitID: 28, loginName: "idc", timeStemp: +new Date()}))}, {replaceUrl: false, target: '_blank'});
        setTimeout(() => {
          this.cancelPatientInfoForm(); // navigate to Search Patient
        }, 1000);
      } else {
        let apiErrorMsg = "";
        if (res && res.Error) {
          apiErrorMsg = res.Error;
        }
        this.toastr.error('Error, Error Registring. ' + apiErrorMsg);
        this.closeInvoiceWindow(patientVisitInvoiceWinRef);
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      let errorMsg = '';
      if (err && err.message) {
        errorMsg = err.message;
      }
      this.toastr.error('Error Registring. Reason: ' + errorMsg);
      this.closeInvoiceWindow(patientVisitInvoiceWinRef);
    });

  }

  printBarcode(visitId) {
    const url = environment.patientReportsPortalUrl + 'smp-bc?p=' + btoa(JSON.stringify({ visitId: visitId, appName: 'WebMedicubes:pat_reg', timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
  }
  openInvoiceWindow() {
    const patientVisitInvoiceWinRef = window.open('', '_blank', 'width=900;height=100;');
    patientVisitInvoiceWinRef.opener = null;
    // create a new div element
    const heading = document.createElement("h1");
    // and give it some content
    const message = document.createTextNode("Loading Invoice...");
    // add the text node to the newly created div
    heading.appendChild(message);
    patientVisitInvoiceWinRef.document.body.append(heading);
    return patientVisitInvoiceWinRef;
  }

  openInvoice(visitId) {
    if (!visitId) {
      return;
    }
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visitId, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (this.invoiceCopyType || 0), timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
    // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }
  closeInvoiceWindow(winRef) {
    if (winRef) {
      winRef.close();
    }
  }
  getPatientVisitInvoiceUrl(visitId) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ cardId: visitId, loginName: this.loggedInUser.username, appName: 'WebMedicubes:pat_dis_card_sale', copyType: (this.invoiceCopyType) || 0, timeStemp: +new Date() }));
    return url;
  }

  getPatientCardVisitInvoiceUrl(visitId) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({
      visitID: visitId,
      loginName: this.loggedInUser.username,

      appName: 'WebMedicubes:pat_reg',
      copyType: (this.invoiceCopyType) || 0,
      timeStemp: +new Date()
    }));
    return url;
  }

  getParseQMgmtToken(token = '') {
    return this.storageService.getParseQMgmtToken();
  }
  getParseQMgmtTokenForSaving(token = '') {
    let qMgmtTokenDetails: any = token || this.storageService.getQMgmtToken(); // this.storageService.getQMgmtToken();
    let qMgmtTokenNumber = '';
    // console.log('davvvvvvvvvvvvv ', qMgmtTokenDetails);
    if (qMgmtTokenDetails) {
      try {
        qMgmtTokenDetails = JSON.parse(qMgmtTokenDetails);
      } catch (e) { }
      try {
        qMgmtTokenDetails = (qMgmtTokenDetails || '').split('=');
        if (qMgmtTokenDetails.length == 4)
          qMgmtTokenNumber = qMgmtTokenDetails[3]; // Token Number
      } catch (e) { }
    }
    return qMgmtTokenNumber;
  }
  removeQMgmtToken() {
    this.storageService.setQMgmtToken('');
    this.qTokenNo = '';
  }

  /* start -lookups */
  getLookupsForRegistration() {
    this.lookupService.getLookupsForRegistration({ branchId: this.loggedInUser.locationid }).subscribe((res: any) => {
      if (res && res.PayLoadDS && Object.keys(res.PayLoadDS).length) {
        const _responsees = res.PayLoadDS;

        this.countriesList = _responsees.Table || [];
        this.citiesList = _responsees.Table1 || [];
        this.maritalStatusList = _responsees.Table2 || [];
        this.mobileOperatorList = _responsees.Table3 || [];
        this.salutationsList = _responsees.Table4 || [];
        this.paymentModesList = _responsees.Table5.filter(a => a.ModeId && a.ModeId <= 5) || []; // this.paymentModesList = this.paymentModesList.filter(a => a.ModeId != 5); this.selectedPaymentModeToAdd = this.paymentModesList.length ? this.paymentModesList[0] : {}; // this.addedPaymentModes.push(this.selectedPaymentModeToAdd);       
        // this.paymentModesList = [{ModeId: 2, Title: "Credit Card"}, {ModeId: 3, Title: "Cheque"}, {ModeId: 4, Title: "Demand Draft"}]; this.selectedPaymentModeToAdd = this.paymentModesList.length ? this.paymentModesList[0] : {};
        const notAllowedPatientTypes = [6];
        if (!this.route.snapshot.queryParams.p) {
          notAllowedPatientTypes.push(8);
        }
      }
    }, (err) => {
    })
  }
  getBranches() {
    this.branchesList = [];
    // this.spinner.show('GetBranches');
    this.lookupService.GetBranches().subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
    }, (err) => {
      // this.spinner.hide('GetBranches');
    })
  }
  getMobileOperator() {
    this.mobileOperatorList = [];
    this.lookupService.getMobileOperator().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.mobileOperatorList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  getMobileOperatorByCode(mobileNo) {
    const params = {
      mobileCode: (mobileNo || this.patientBasicInfo.value.MobileNO || '')
    }
    if (params.mobileCode && params.mobileCode.length > 3) {
    } else {
      return;
    }
    this.spinner.show();
    this.lookupService.getMobileOperatorByCode(params).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200) {
        if (res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(res.PayLoad);
          } catch (e) { }
          if (data && data.length) {
            this.patientBasicInfo.patchValue({
              MobileOperatorID: (data[0].Column1 || '')
            })
          }
        }
        // this.mobileOperatorList = res.payLoad;
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });

  }
  getGendersList() {
    this.gendersList = [];
    this.lookupService.getGendersList().subscribe((res: any) => {
      // console.log(res);
      if (res && res.PayLoad && res.PayLoad.length) {
        this.gendersList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  getSalutationList() {
    this.salutationsList = [];
    this.lookupService.getSalutationList().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.salutationsList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  getCitiesList(countryId) {
    this.citiesList = [];
    if (!countryId) {
      return;
    }
    this.lookupService.getCities({ CountryId: countryId }).subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.citiesList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  getCountries() {
    this.countriesList = [];
    this.lookupService.getCountries({}).subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.countriesList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  getBloodGroups() {

    this.bloodGroupList = [];
    this.lookupService.getBloodGroups({}).subscribe((res: any) => {
      // this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.bloodGroupList = data || [];
      }
    }, (err) => {
      // this.spinner.hide();
      console.log(err);
    });
  }
  getMaritalStatus() {
    this.maritalStatusList = [];
    const _params = {
    }
    this.lookupService.maritalStatus(_params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.maritalStatusList = data || [];
      }
    }, (err) => {
      console.log(err);
    });

  }

  getDiscountCardType() {

    this.discountCardsList = [];
    this.selectedDiscountCards = [];
    this.selectedDiscountCard = null;
    // this.spinner.show(this.spinnerRefs.discountCards);
    this.lookupService.getDiscountCardType().subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        if (this.screenPermissionsObj.dis_card_type_all) {
          this.discountCardsList = data || [];
        } else if (this.screenPermissionsObj.dis_card_type_1) {
          this.discountCardsList = (data || []).filter(a => a.DiscountCardTypeId == 1);
        } else if (this.screenPermissionsObj.dis_card_type_2) {
          this.discountCardsList = (data || []).filter(a => a.DiscountCardTypeId == 2);
        } else {
          this.discountCardsList = [];
        }
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      console.log(err);
    });
  }

  getARYCardNumber() {

    this.spinner.show(this.spinnerRefs.discountCards);
    this.shareSrv.getDataGET(API_ROUTES.ARY_SAHOOLAT_CARD).subscribe((res: any) => {
      // setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      // }, 6000);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        const data = res.PayLoad;
        this.discountCardNumber = res.PayLoad;
        if (res.Status == false && res.ResponseCode == "10016" && res.Customer == null) {
          this.toastr.error(res.ResponseMessage);
          this.isAlreadyCustomer = true;
          return;
        }
        this.cusCardno = this.discountCardNumber[0].CardNo; //"3085040105573743";
        // Make CNIC and HomeAddress required
        this.patientBasicInfo.get('CNIC')?.setValidators([Validators.required]);
        this.patientBasicInfo.get('HomeAddress')?.setValidators([Validators.required]);

        // Update validity so Angular re-checks the controls
        this.patientBasicInfo.get('CNIC')?.updateValueAndValidity();
        this.patientBasicInfo.get('HomeAddress')?.updateValueAndValidity();
        console.log("this.discountCardNumber: ", this.discountCardNumber)
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      console.log(err);

    });
  }

  getCutomDiscountNumber(cardtype = null, cardNo = null) {
    const params = {
      CardTypeId: this.selectedDiscountCard,
      CardNo: cardNo
    }
    console.log("objparam is____________", params)
    if (!params.CardNo) {
      this.toastr.error("Please enter Card No. to verify", "Card No. Validation");
      return false
    }
    this.spinner.show(this.spinnerRefs.discountCards);
    this.lookupService.getCutomDiscountNumber(params).subscribe((res: any) => {
      // setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      // }, 6000);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        const data = res.PayLoad;
        this.discountCardNumber = res.PayLoad;

        // this block is for new method of card verification 
        if (this.discountCardNumber.length && this.discountCardNumber[0].CardNo == this.cusCardno && this.CardTypeId != 15) {
          this.isVerifiedCardNo = true;
          this.toastr.success(this.cusCardno, "Verified Card No.")
        }
        else if (this.CardTypeId !== 15) {
          this.isVerifiedCardNo = false;
          this.toastr.error('The Card No. "' + this.cusCardno + '" is invalid"')
        }

        // end of new verification method

        console.log("this.discountCardNumber: ", this.discountCardNumber)
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      console.log(err);

    });
  }
  /* end -lookups */


  InsertUpdatePatient() {
    // this.patientBasicInfo.controls['BranchID'].setValidators([]);
    // this.patientBasicInfo.controls['BranchID'].updateValueAndValidity();

    // let params = JSON.parse(JSON.stringify(this.patientBasicInfo.value));
    // params.Email = params.Emails || params.Email || '';

    const patientInfo = this.patientBasicInfo.getRawValue(); //  this.patientBasicInfo.value;
    const totalCalculatedDiscount = 0;
    const formattedDob = `${patientInfo.DateOfBirth.year}-${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}`;
    const _branchId = this.loggedInUser.locationid; //patientInfo.BranchID || this.loggedInUser.locationid || 0;


    let _patImg = null;
    if (patientInfo.PatientPic) {
      try {
        _patImg = patientInfo.PatientPic.split('base64,')[1]
      } catch (e) { }
    }

    const patientObj = {
      PatientId: patientInfo.PatientID || null,
      Title: patientInfo.Salutation,
      ISalutationID: ((this.salutationsList.find(a => a.SalutationTitle == patientInfo.Salutation) || {}).SalutationID || 0),
      FirstName: Conversions.capitalizeFirstLetter(patientInfo.FirstName || ''),
      LastName: Conversions.capitalizeFirstLetter(patientInfo.LastName || ''),
      Gender: patientInfo.Gender,
      DoB: formattedDob, //new Date(patientInfo.DateOfBirth),
      IsDoB: true,
      Age: patientInfo.Age,
      MaritalStatus: patientInfo.MaritalStatus || null, // '',
      Phone: patientInfo.PhoneNO,
      Cell: patientInfo.MobileNO,
      Email: patientInfo.Emails || null,
      ADDRESS: patientInfo.HomeAddress,
      ReferenceNo: patientInfo.ReferenceNo || null, // '',
      FatherName: patientInfo.FatherName || null,
      Fax: null, // '',
      Nationality: (this.countriesList.filter(a => a.CountryId == patientInfo.CountryID).length ? this.countriesList.filter(a => a.CountryId == patientInfo.CountryID)[0].Country : null), // '',
      CNIC: patientInfo.CNIC,
      Passport: patientInfo.PassportNo,
      Designation: patientInfo.Designation, // '',
      LocId: _branchId,
      CountryId: patientInfo.CountryID || null,
      BloodGroup: patientInfo.BloodGroup || null, // '',
      CityId: patientInfo.CityID || 0,
      OperatorId: patientInfo.MobileOperatorID,
      BookingPatientID: (patientInfo.BookingPatientID || null),
      PatientPic: _patImg,
      Docs: [],
      CreatedBy: this.loggedInUser.userid
    }

    if (!patientInfo.RefDoc) {
      this.patientBasicInfo.patchValue({
        RefDoc: {
          Name: 'Self'
        }
      });
    }

    const valid = this.isPatientBasicInfoFormValid(0);
    if (valid) {
      // console.log('valid');
      // params.PatientVaccineNo = +new Date();

      // this.patientBasicInfo.controls['BranchID'].setValidators([Validators.required]);
      // this.patientBasicInfo.controls['BranchID'].updateValueAndValidity();
      this.spinner.show();
      this.patientService.insertUpdatePatient(patientObj).subscribe((res: any) => {
        this.spinner.hide();
        // console.log(res);
        this.patientBasicInfo.patchValue({
          RefDoc: ''
        });
        if (res && res.StatusCode == 200) {
          this.toastr.success('Patient Data Saved');
          // this.resetAllForm_CompleteRegistration();
        } else {
          this.toastr.error('Patient Data Not Saved');
        }
      }, (err) => {
        this.patientBasicInfo.patchValue({
          RefDoc: ''
        });
        this.spinner.hide();
        this.toastr.error('Connection error');
        console.log(err);
      })
    } else {
      this.patientBasicInfo.patchValue({
        RefDoc: ''
      });
      this.toastr.warning('Please fill required fields');
      console.log('invalid');
    }
  }


  patientSelected_MC(patient) {
    this.selectedPatientSource = 21;
    this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: patient.OrbitPatientID, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
    this.populatePatientFields(patient);
    //if(environment.production) {
    this.appPopupService.closeModal()
    //}
  }

  searchPatient(patientId) {
    this.patientBasicInfo.patchValue({
      PatientPic: ''
    });
    // patientId = 65201868;
    const patientSearchParams = {
      PatientID: patientId,
    }
    if (patientSearchParams.PatientID) {
      this.spinner.show();
      //this.patientService.searchPatient
      this.patientService.searchPatient(patientSearchParams).subscribe((res: any) => {
        this.spinner.hide();
        // console.log(res);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            //this.searchResults = res.payLoad;
            this.populatePatientFields(res.PayLoad[0]);
            this.getAndDisplayPatientPic(patientSearchParams.PatientID);
          } else {
            this.toastr.warning('Patient record not found');
          }
        } else {
          this.toastr.error('Error: Loading patient data');
        }
      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide();
      })
    }
  }


  getAndDisplayPatientPic(PatientId) {
    this.patientBasicInfo.patchValue({
      PatientPic: ''
    });
    if (PatientId) {
      return;
    }
    this.patientService.getPatientPic({ PatientId: PatientId }).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200) {
        if (res.PayLoad && res.PayLoad.length) {
          const _patPic = (res.PayLoad[0].Pic || '');
          const _formattedPic = _patPic ? ((_patPic.indexOf('data:image/') == -1) ? (CONSTANTS.IMAGE_PREFIX.PNG + _patPic) : _patPic) : '';
          if (_formattedPic) {
            this.resizeImage('', this.resizePatientProfilePic.width, this.resizePatientProfilePic.height, 0, '', _formattedPic).then((res: string) => {
              this.patientBasicInfo.patchValue({
                PatientPic: res
              });
            }, (err) => {
            });
          }
        }
      } else {
        this.toastr.error('Error: Loading patient image');
      }
    }, (err) => {
      this.toastr.error('Server Error, loading Patient Image.');
      console.log(err);
      this.spinner.hide();
    })

  }

  disablePatientBasicInfoFields(disable) {
    this.patientBasicInfoDisabled = null;
    if (disable === false) {
      this.patientBasicInfoDisabled = null;
      this.patientBasicInfo.controls["CountryID"].enable();
      this.patientBasicInfo.controls["CityID"].enable();

      // this.patientBasicInfo.get('Salutation').setValidators([Validators.required]);
      // this.patientBasicInfo.get('Salutation').updateValueAndValidity();
      // this.patientBasicInfo.get('FirstName').setValidators([Validators.required]);
      // this.patientBasicInfo.get('FirstName').updateValueAndValidity();
      // this.patientBasicInfo.get('Gender').setValidators([Validators.required]);
      // this.patientBasicInfo.get('Gender').updateValueAndValidity();
      // this.patientBasicInfo.get('DateOfBirth').setValidators([Validators.required]);
      // this.patientBasicInfo.get('DateOfBirth').updateValueAndValidity();

    } else if (disable === true) {
      this.patientBasicInfoDisabled = true;
      this.patientBasicInfo.controls["CountryID"].disable();
      this.patientBasicInfo.controls["CityID"].disable();

      // this.patientBasicInfo.get('Salutation').setValidators([]);
      // this.patientBasicInfo.get('Salutation').updateValueAndValidity();
      // this.patientBasicInfo.get('FirstName').setValidators([]);
      // this.patientBasicInfo.get('FirstName').updateValueAndValidity();
      // this.patientBasicInfo.get('Gender').setValidators([]);
      // this.patientBasicInfo.get('Gender').updateValueAndValidity();
      // this.patientBasicInfo.get('DateOfBirth').setValidators([]);
      // this.patientBasicInfo.get('DateOfBirth').updateValueAndValidity();
      // this.patientBasicInfoFormForCovid.controls['BloodGroup'].setValidators([Validators.required]);
      // this.patientBasicInfoFormForCovid.controls['BloodGroup'].updateValueAndValidity();
    }
  }


  populatePatientFields(data) {
    console.log(data);
    // data = data[0];
    // let patient = {
    //   cnic: "1231231321321"
    //   dateOfBirth: "2021-03-01T10:50:58.927"
    //   firstName: "asdf"
    //   gender: "1"
    //   homeAddress: ""
    //   lastName: "asdf"
    //   mobileNO: "asdf"
    //   FatherName: ""
    //   passportNo: ""
    //   patientID: 1
    //   phoneNO: ""
    //   pvNo: ""
    // }
    this.OrbitPatientID = data.OrbitPatientID || data.PatientID;
    const _patPic = (data.OrbitPatientPic || data.PatientPic || '');
    const _formattedPic = _patPic ? ((_patPic.indexOf('data:image/') == -1) ? (CONSTANTS.IMAGE_PREFIX.PNG + _patPic) : _patPic) : '';
    const _formattedDob = { day: moment(data.DateOfBirth).get('date'), month: (moment(data.DateOfBirth).get('month') + 1), year: moment(data.DateOfBirth).get('year') };
    // console.log('populatePatientFields ', _formattedDob);
    data.MobileOperatorID = (data.MobileOperatorID || '') == -1 ? '' : (data.MobileOperatorID || '');
    this.cd.detectChanges();


    this.patientBasicInfo.patchValue({
      PatientID: data.OrbitPatientID || data.patientID || data.PatientID || '', // data.patientID || '',
      MRNo: data.OrbitMRNo || '', // data.patientID || '',
      // OrbitPatientID: data.orbitPatientID || '',
      // PatientVaccineNo: data.pvNo || '',
      Salutation: this.getSalutationByTitle(data.Salutation || data.SalutationTitle || ''),
      FirstName: data.FirstName || '',
      LastName: data.LastName || '',
      CNIC: (data.CNIC || '').toString().trim(),
      PassportNo: data.PassportNo || '',
      Gender: this.getGenderByValue(data.Gender), // || this.getGenderByTitle(data.Gender) || '',
      DateOfBirth: data.DateOfBirth ? _formattedDob : '', // data.dateOfBirth ? moment(data.dateOfBirth).format(this.dateFormat) : '',
      Age: '',
      FatherName: data.FatherName || '',
      HomeAddress: data.HomeAddress || data.PatientAddress || '',
      PhoneNO: data.PhoneNO || '',
      MobileOperatorID: data.MobileOperatorID || '',
      MobileNO: data.MobileNO || '',
      ModifyBy: this.loggedInUser.userid || '',
      PatientPic: '',
      Emails: data.Email || '',
      Religion: data.Religion || '',
      CountryID: data.CountryID || this.countryIdForPak || 0,
      CityID: data.CityID || 0,
      // EmergencyPhoneNo: data.EmergencyPhoneNo || '',
      // EmergencyContactName: data.EmergencyContactName || '',
      // EmergencyContactRelation: data.EmergencyContactRelation || '',
      BranchID: this.loggedInUser.locationid || '',
      BloodGroup: data.BloodGroup || '',
      MaritalStatus: data.MaritalStatus || '',
      ReferenceNo: data.ReferenceNo || '',
      Designation: data.Designation || '',
      RefDoc: data.RefByDoc || { Name: 'Self' },
      /*[{
        Name: 'Self'
      }],*/
      RefNo: data.RefNo || '',
      InternalRemarks: data.InternalRemarks || '',
      PatientComments: data.PatientComments || ''
    });

    if (data.OrbitPatientID || data.patientID || data.PatientID) { // don't apply validation for old data
      this.cnicValidationCheck = false;
    }

    if (_formattedPic) {
      // this.patientBasicInfo.patchValue({
      //   PatientPic: _formattedPic, // res
      // });

      this.resizeImage('', this.resizePatientProfilePic.width, this.resizePatientProfilePic.height, 0, '', _formattedPic).then((res: string) => {
        this.patientBasicInfo.patchValue({
          PatientPic: res
        });
      }, (err) => {
      });
    }

    setTimeout(() => { // some delay for DateOfBirth subscriber
      this.patientBasicInfo.patchValue({
        DateOfBirth: data.DateOfBirth ? _formattedDob : '', // data.dateOfBirth ? moment(data.dateOfBirth).format(this.dateFormat) : '',
      });
    }, 100);

    this.reApplyPermissions();
    //this.patientBasicInfo.get('FirstName').updateValueAndValidity()
  }
  getSalutationByTitle(salutation) {
    if (isNaN(salutation || 0)) {
      const selectedSalutation = this.salutationsList.filter(a => {
        return a.SalutationTitle == salutation;
      });
      if (selectedSalutation && selectedSalutation.length) {
        salutation = selectedSalutation[0].SalutationTitle;
      }
    } else {
      salutation = this.getSalutationById(salutation);
    }
    return salutation;
  }
  getSalutationById(salutationId) {
    let salutation = salutationId;
    const selectedSalutation = this.salutationsList.filter(a => {
      return a.SalutationID == salutationId;
    });
    if (selectedSalutation && selectedSalutation.length) {
      salutation = selectedSalutation[0].SalutationTitle;
    }
    return salutation;
  }
  getGenderByTitle(gender) {
    if (gender) {
      gender = gender.toLowerCase();
      if (gender == 'm' || gender == 'male') {
        gender = 1;
      }
      if (gender == 'f' || gender == 'female') {
        gender = 2;
      }
    }
    return gender;
  }
  getGenderByValue(gender) {
    let _gender: any = gender;
    if (!_gender) {
      _gender = '';
    }
    if (!isNaN(_gender)) {
      if (_gender == '1' || _gender == 1) {
        _gender = 'M';
      }
      if (_gender == '2' || _gender == 2) {
        _gender = 'F';
      }
    }
    return _gender
  }
  loadPatientProfileImage(event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file && file.type) {
      if (file.type.indexOf('image/') == -1) {
        this.toastr.warning('File should be Image', 'Invalid File Type');
        return;
      }
      this.loadImage(file).then((response: any) => {
        event.target.value = '';
        // this.patientBasicInfo.patchValue({
        //   PatientPic: response.data
        // });
        this.resizeImage('', this.resizePatientProfilePic.width, this.resizePatientProfilePic.height, 0, '', response.data).then((res: string) => {
          this.patientBasicInfo.patchValue({
            PatientPic: res
          });
        }, (err) => {
        });
      });
    }
  }


  loadImage(file, fileName = 'file') {
    const promise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageURL = reader.result as string;
        const _fileName = file.name || '';
        //_fileName = `${fileName}`;
        const _fileObject = {
          uniqueIdentifier: (+new Date()),
          fileName: _fileName,
          fileType: file.type || '',
          data: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
          thumbnail: imageURL, //this.sanitizer.bypassSecurityTrustResourceUrl(imageURL).toString()
        };
        if (file.type.split('/')[0] == 'image' && file.type.split('/')[1] != 'svg+xml') { // resize only if it is image
          this.resizeImage(file, this.resizeFileSize.thumbnail.width, this.resizeFileSize.thumbnail.height, 0, '', imageURL).then((res: string) => {
            _fileObject.thumbnail = res;
            resolve(_fileObject);
          }, (err) => {
            reject(err);
          });
        } else {
          resolve(_fileObject);
        }
      }
      reader.readAsDataURL(file);
    });
    return promise;
  }
  openCamera(source) {
    let cameraSettings: any = {};
    if (source == 'patient_pic') {
      this.openCameraFromSource = source;
      // cameraSettings = {video: { facingMode: 'user' }};
    } else if (source == 'attachment') {
      this.openCameraFromSource = source;
      // cameraSettings = {video: { facingMode: 'environment' }};
    } else {
      // cameraSettings = {video: { facingMode: 'environment' }};
    }

    if (this.activeVideoCameraStream) {
      this.stopCamera();
    }
    cameraSettings = {};
    if (!this.selectedCamera) {
      cameraSettings.facingMode = 'environment';
    } else {
      cameraSettings.deviceId = { exact: this.selectedCamera };
    }
    const settings = {
      video: cameraSettings,
      audio: false
    };


    try {
      const browser = navigator as any;
      browser.getUserMedia = (browser.getUserMedia ||
        browser.webkitGetUserMedia ||
        browser.mozGetUserMedia ||
        browser.msGetUserMedia);
      browser.mediaDevices.enumerateDevices().then(mediaDevices => {
        this.getCameraDevices(mediaDevices);
        this.startCamera(settings);
      })
    } catch (e) {
      this.startCamera(settings);
    }
  }

  removePatientImage() {
    this.patientBasicInfo.patchValue({
      PatientPic: ''
    });
    // console.log(this.patientBasicInfo.value);
  }



  resizeImage(file, maxWidth, maxHeight, compressionRatio = 0, imageEncoding = '', base64Data = '') {
    const self = this;
    const promise = new Promise((resolve, reject) => {
      if (!file && !base64Data) {
        resolve('');
      }
      const fileLoader = new FileReader();
      const canvas = document.createElement('canvas');
      let context = null;
      const imageObj: any = new Image();
      let blob = null;

      // create a hidden canvas object we can use to create the new resized image data
      const canvas_id = 'hiddenCanvas_' + +new Date();
      canvas.id = canvas_id;
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      canvas.style.visibility = 'hidden';
      document.body.appendChild(canvas);

      // console.log('base64Data ', base64Data);
      if (base64Data) {
        if (base64Data.indexOf('data:image') == -1) { // if pdf, icon or any other file then don't resize
          resolve('');
          return promise;
        }
        imageObj.src = base64Data;
      } else if (file && file.size) {
        // check for an image then
        // trigger the file loader to get the data from the image
        // if (file.type.match('image.*')) {
        fileLoader.readAsDataURL(file);
        // } else {
        // alert('File is not an image');
        // }

        // setup the file loader onload function
        // once the file loader has the data it passes it to the
        // image object which, once the image has loaded,
        // triggers the images onload function
        fileLoader.onload = function () {
          const data = this.result;
          imageObj.src = data;
        };

        fileLoader.onabort = () => {
          reject('The upload was aborted.');
          this.toastr.error('The upload was aborted.');
        };

        fileLoader.onerror = () => {
          reject('An error occured while reading the file.');
          this.toastr.error('An error occured while reading the file.');
        };
      }

      // set up the images onload function which clears the hidden canvas context,
      // draws the new image then gets the blob data from it
      imageObj.onload = function () {
        // Check for empty images
        if (this.width === 0 || this.height === 0) {
          this.toastr.error('Image is empty');
        } else {
          // get the context to use
          // context = canvas.getContext('2d');
          // context.clearRect(0, 0, max_width, max_height);
          // context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, max_width, max_height);
          const newSize = self.calculateAspectRatioFit(this.width, this.height, maxWidth, maxHeight);
          canvas.width = newSize.width;
          canvas.height = newSize.height;
          context = canvas.getContext('2d');
          context.clearRect(0, 0, newSize.width, newSize.height);
          context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, newSize.width, newSize.height);
          // dataURItoBlob function available here:
          // http://stackoverflow.com/questions/12168909/blob-from-dataurl
          // add ')' at the end of this function SO dont allow to update it without a 6 character edit
          blob = canvas.toDataURL(imageEncoding);
          document.getElementById(canvas_id).remove();
          // pass this blob to your upload function
          resolve(blob);
        }
      };

      imageObj.onabort = () => {
        reject('Image load was aborted.');
        this.toastr.error('Image load was aborted.');
      };

      imageObj.onerror = () => {
        resolve(imageObj.currentSrc || '');
        // reject('An error occured while loading image.');
        this.toastr.error('An error occured while loading image.');
      };
    })
    return promise;
  }
  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }


  getFinalDataSet() {
    let parsedValue = null;
    const AryCookieValue = this.getCookie("arytokendata");

    if (AryCookieValue) {
      try {
        parsedValue = JSON.parse(AryCookieValue);
        console.log("Token from cookie:", parsedValue);
        console.log("Token from cookie:", parsedValue.Token);
        console.log("Token from cookie:", parsedValue.TokenKey);
      } catch (e) {
        console.error("Invalid cookie JSON:", e);
      }
    }
    const patientInfo = this.patientBasicInfo.getRawValue(); //  this.patientBasicInfo.value;
    const formattedDob = `${patientInfo.DateOfBirth.year}-${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}`;
    const _branchId = this.loggedInUser.locationid; //patientInfo.BranchID || this.loggedInUser.locationid || 0;
    const patientObj = {
      PatientId: patientInfo.PatientID || this.OrbitPatientID || null,
      Title: patientInfo.Salutation,
      ISalutationID: ((this.salutationsList.find(a => a.SalutationTitle == patientInfo.Salutation) || {}).SalutationID || 0),
      FirstName: Conversions.capitalizeFirstLetter(patientInfo.FirstName || ''),
      LastName: Conversions.capitalizeFirstLetter(patientInfo.LastName || ''),
      Gender: patientInfo.Gender,
      DoB: formattedDob, //new Date(patientInfo.DateOfBirth),
      IsDoB: true,
      Age: patientInfo.Age,
      MaritalStatus: patientInfo.MaritalStatus || null, // '',
      Phone: patientInfo.PhoneNO,
      Cell: patientInfo.MobileNO,
      Email: patientInfo.Emails || null,
      ADDRESS: patientInfo.HomeAddress,
      ReferenceNo: patientInfo.ReferenceNo || null, // '',
      FatherName: patientInfo.FatherName || null,
      Fax: null, // '',
      Nationality: (this.countriesList.filter(a => a.CountryId == patientInfo.CountryID).length ? this.countriesList.filter(a => a.CountryId == patientInfo.CountryID)[0].Country : null), // '',
      CNIC: patientInfo.CNIC,
      Passport: patientInfo.PassportNo,
      Designation: patientInfo.Designation, // '',
      LocId: _branchId,
      CountryId: patientInfo.CountryID || 0,
      BloodGroup: patientInfo.BloodGroup || null, // '',
      CityId: patientInfo.CityID || 0,
      OperatorId: patientInfo.MobileOperatorID,
      BookingPatientID: (patientInfo.BookingPatientID),
      ARYToken: parsedValue ? parsedValue.Token : null,
      ARYTokenKey: parsedValue ? parsedValue.TokenKey : null,
      Branchcode: this.loggedInUser.currentLocation
      /*
      PVNo: patientInfo.PatientVaccineNo || '',
      ModifyBy: this.loggedInUser.userid,
      PatientPic: patientInfo.PatientPic,
      Religion: patientInfo.Religion || '',
      OrbitPatientID: patientInfo.OrbitPatientID || null,
      EmergencyPhoneNo: patientInfo.EmergencyPhoneNo || '',
      EmergencyContactName: patientInfo.EmergencyContactName || '',
      EmergencyContactRelation: patientInfo.EmergencyContactRelation || '',
      */
    }


    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);


    let paymentArr = []; // git branches testing
    const payObj = {
      VisitID: null,
      Amount: 0,
      ModeId: 0,
      InstNo: null,
      InstOwner: null,
      Remarks: null,
      TypeId: 1,
      ClosingId: 0,
      InstInvoiceNo: null,
      LocId: _branchId,
      OnlinePaymentReferenceID: null,
    }

    this.addedPaymentModes.forEach(a => {
      const _payObj = JSON.parse(JSON.stringify(payObj));
      _payObj.Amount = this.parseNumbericValues(a.amount || 0);
      _payObj.ModeId = a.ModeId || 0;
      _payObj.InstNo = a.InstOwner || null,
        _payObj.InstNo = a.CCNo || null,
        _payObj.InstInvoiceNo = a.CCTNo || null
      if (_payObj.Amount) {
        paymentArr.push(_payObj);
      }
    });


    /**/
    paymentArr = paymentArr.filter(a => a.PaidAmount); // remove credit or cash entry if amount is zero
    if (!paymentArr.length) { //} && !this.selectedPanel) {
      paymentArr.push(payObj);
    }

    let _patImg = null;
    if (patientInfo.PatientPic) {
      try {
        _patImg = patientInfo.PatientPic.split('base64,')[1]
      } catch (e) { }
    }

    const userWithoutPic: UserModel = JSON.parse(JSON.stringify(this.loggedInUser));
    userWithoutPic.pic = '';
    const details = {
      appVersion: CONSTANTS.APP_VERSION,
      webDeskVersion: this.auth.getWebDeskVersionFromStorage(),
      user: userWithoutPic
    };

    const RegistrationModel = {
      // FBRInvoiceNo: '',
      FBRRequestData: '',
      MACAddress: this.loggedInUser.macAdr || '',
      createdBy: this.loggedInUser.userid || -99,
      patientPic: _patImg,
      regModule: 1,
      address: this.disCardAddress || '',
      remarks: this.disCardRemarks || '',
      systemDetails: JSON.stringify(details),

      // createdByName: this.loggedInUser.fullname,
      patient: [patientObj],
      payment: paymentArr,
      discountCards: this.selectedDiscountCards,
      ExpiredOn: this.cardExpiredOn
        ? (this.selDiscountCardType == 2
          ? Conversions.formatDateObject(this.cardExpiredOn)
          : null)
        : null,
      MyIDCCardType: this.selDiscountCardType,
      DiscountCardNo: this.selDiscountCardType == 2 ? this.cusCardno : null,
    }
    return RegistrationModel;
  }



  getFinalDataSetforVisit() {
    const patientInfo = this.patientBasicInfo.getRawValue();
    const totalCalculatedDiscount = 0;
    // let formattedDob = moment(new Date(`${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}-${patientInfo.DateOfBirth.year}`)).format();
    const formattedDob = `${patientInfo.DateOfBirth.year}-${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}`;
    const _branchId = this.loggedInUser.locationid; //patientInfo.BranchID || this.loggedInUser.locationid || 0;
    const patientObj = {
      PatientId: patientInfo.PatientID || this.OrbitPatientID || null,
      Title: patientInfo.Salutation,
      ISalutationID: ((this.salutationsList.find(a => a.SalutationTitle == patientInfo.Salutation) || {}).SalutationID || 0),
      FirstName: Conversions.capitalizeFirstLetter(patientInfo.FirstName || ''),
      LastName: Conversions.capitalizeFirstLetter(patientInfo.LastName || ''),
      Gender: patientInfo.Gender,
      DoB: formattedDob, //patientInfo.DateOfBirth,
      IsDoB: true,
      Age: patientInfo.Age,
      MaritalStatus: patientInfo.MaritalStatus || null, // '',
      Phone: patientInfo.PhoneNO,
      Cell: patientInfo.MobileNO,
      Email: patientInfo.Emails || null,
      ADDRESS: this.disCardAddress || '',
      ReferenceNo: patientInfo.ReferenceNo || null, // '',
      FatherName: patientInfo.FatherName || null,
      Fax: null, // '',
      Nationality: (this.countriesList.filter(a => a.CountryId == patientInfo.CountryID).length ? this.countriesList.filter(a => a.CountryId == patientInfo.CountryID)[0].Country : null), // '',
      CNIC: patientInfo.CNIC,
      Passport: patientInfo.PassportNo,
      Designation: patientInfo.Designation, // '',
      LocId: _branchId,
      CountryId: patientInfo.CountryID || 0,
      BloodGroup: patientInfo.BloodGroup || null, // '',
      CityId: patientInfo.CityID || 0,
      OperatorId: patientInfo.MobileOperatorID,
      BookingPatientID: "",
      /*
      PVNo: patientInfo.PatientVaccineNo || '',
      ModifyBy: this.loggedInUser.userid,
      PatientPic: patientInfo.PatientPic,
      Religion: patientInfo.Religion || '',
      OrbitPatientID: patientInfo.OrbitPatientID || null,
      EmergencyPhoneNo: patientInfo.EmergencyPhoneNo || '',
      EmergencyContactName: patientInfo.EmergencyContactName || '',
      EmergencyContactRelation: patientInfo.EmergencyContactRelation || '',
      */
    }
    const testProfileArr = [];
    const ecltestProfileArr = [];
    const telenoretestProfileArr = [];


    this.selectedDiscountCards.forEach((a, i) => {

      const testProfileObj = {
        PacslinkSectionName: a.ModalityCode || null,
        SubSectionID: a.SubSectionID || 60,
        VisitId: null,
        TPId: a.TPId,
        Price: (a.Amount || 0),
        Remarks: null,
        StatusId: (a.TPStatusID || 1),
        ProcessId: 1, // { 1: normal, 2: urgent }
        SCollectionId: null,
        DeliveryDate: a.DeliveryDate || null,
        // InitBy: null,
        // InitDateTime: null,
        // FinalEditor: null,
        Title: (a.Title || '').trim(),
        // SampleId: null,
        // IsCancel: false,
        // SyncStatus: null,
        RegLock: 1, // _branchId,
        PackageId: a.forPkg || -1,
        Discount: 0,
        isHomeSamplingTestProfile: a.isHomeSamplingTestProfile || 0,
        PCTCode: "98160000",
        // FinalDateTime: null,
        // MarkAs: null

        /*
        GrossAmount: this.parseNumbericValues(a.TestProfilePrice || 0),
        TPCost: this.parseNumbericValues(a.TestProfilePrice || 0),
        ServiceCharges: this.parseNumbericValues(a.serviceCharges || 0),
        Discount: this.parseNumbericValues(_discountedValue),
        NetAmount: this.parseNumbericValues((a.TestProfilePrice + a.serviceCharges - _discountedValue)),
        */
        TaxRate: 0,
        TaxRateFBR: 0,
        SaleValueFBR: (a.Amount || 0),
        DiscountFBR: 0,
        TaxChargedFBR: 0,
        TotalAmountFBR: this.totalAmount,
      }

      testProfileArr.push(testProfileObj);
    });


    const ismob = '';
    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);
    const visitObj = {
      VisitID: null,
      PatientID: patientInfo.PatientID || null,
      // VisitNo: this.patientVisitInfo.visitNo,
      Remarks: this.disCardRemarks || '',
      ReceiptNo: null,
      LocId: _branchId,
      LocCode: this.loggedInUser.currentLocation,
      TokenID: null,
      HeadId: 3,
      AdjAmount: totalCalculatedDiscount, // (this.patientVisitInfo.discount || 0),
      PercentAdjAmount: 0, // this.discountPercentage || 0,
      NetAmount: this.totalAmount, // this.patientVisitInfo.netAmount
      PaidAmount: totalAmountByPaymentModes, // (this.patientVisitInfo.netAmount),
      RefBy: "Self",
      RefNo: patientInfo.RefNo,
      InternalRemarks: patientInfo.InternalRemarks,
      PatientComments: patientInfo.PatientComments,
      TypeId: 1, // 1 for Regular
      PanelId: "", // this.selectedPanel ? this.selectedPanel.PanelId : '', // this.patientVisitInfo.corporateClientID || null,
      SyncStatus: null,
      IsCancel: 0,
      RefDocId: 0, // patientInfo.RefDoc ? patientInfo.RefDoc.RefId : null,
      PercentDiscount: 0,
      ShowReportsToPanelPatients: null,
      B2BDoctorID: patientInfo.B2BDoc || 0
    }


    const paymentArr = []; // git branches testing
    const payObj = {
      VisitID: null,
      Amount: 0,
      ModeId: 0,
      InstNo: null,
      InstOwner: null,
      Remarks: null,
      TypeId: 1,
      ClosingId: 0,
      InstInvoiceNo: null,
      LocId: _branchId,
      OnlinePaymentReferenceID: null,
    }

    this.addedPaymentModes.forEach(a => {
      const _payObj = JSON.parse(JSON.stringify(payObj));
      _payObj.Amount = this.parseNumbericValues(a.amount || 0);
      _payObj.ModeId = a.ModeId || 0;
      _payObj.InstNo = a.InstOwner || null,
        _payObj.InstNo = a.CCNo || null,
        _payObj.InstInvoiceNo = a.CCTNo || null
      if (_payObj.Amount) {
        paymentArr.push(_payObj);
      }
    });

    // If only cash is acceptable
    // const hasNonMode1 = this.addedPaymentModes.some(p => p.ModeId !== 1);
    // if (hasNonMode1) {
    //   const totalAmount = this.addedPaymentModes.reduce((sum, p) => sum + this.parseNumbericValues(p.amount || 0), 0);
    //   paymentArr = [{
    //     ...payObj,
    //     Amount: totalAmount,
    //     ModeId: 1
    //   }];
    // }
    
    //paymentArr = paymentArr.filter(a => a.PaidAmount); // remove credit or cash entry if amount is zero
    if (!paymentArr.length) { //} && !this.selectedPanel) {
      paymentArr.push(payObj);
    }

    const regModule = '1';

    const userWithoutPic: UserModel = JSON.parse(JSON.stringify(this.loggedInUser));
    userWithoutPic.pic = '';
    const details = {
      appVersion: CONSTANTS.APP_VERSION,
      webDeskVersion: this.auth.getWebDeskVersionFromStorage(),
      user: userWithoutPic
    };
    const mobNoti = [];

    const RegistrationModel = {
      // FBRInvoiceNo: '',
      DiscountPerc: 0,
      FBRRequestData: '',
      MACAddress: this.loggedInUser.macAdr || '',
      discountedBy: 0,
      createdBy: this.loggedInUser.userid || -99,
      homeSamplingEmpId: null,
      CNICRelation: null,
      ProvinceID: this.loggedInUser.provinceID, //preTravelnfo.ProvinceID //|| 7,  //
      DistrictID: null,
      TehsilID: null,
      Per_TehsilID: null,
      Per_DistrictID: null,
      Per_Address: null,
      WhatsAppNo: this.patientBasicInfo.getRawValue().WhatsapNo || "",
      isSendWhatsApp: this.patientBasicInfo.getRawValue().isWhatsapNumber == true ? 1 : 0,
      isMetal: 0,
      patientPic: null,
      regModule: regModule,
      systemDetails: JSON.stringify(details),
      NewRef: 0,
      // Discount Card Info
      RewardPointTypeID: null, // redeemingRewardPoints ? 2 : null,
      RewardPercentPoint: null, // redeemingRewardPoints || null,
      CardID: null,

      // Disocunt Card Details
      CardTypeID: this.CardTypeId,
      DiscountCardNo: this.selDiscountCardType == 2 ? this.cusCardno : null,
      ExpiredOn: this.cardExpiredOn ? (this.selDiscountCardType == 2 ? Conversions.formatDateObject(this.cardExpiredOn) : null) : null,
      MyIDCCardType: this.selDiscountCardType,
      // CardPatient: [patientObj],

      // createdByName: this.loggedInUser.fullname,
      patient: [patientObj],
      outsourceHospitalPat: [{}],
      ECLOrders: null,
      telenoreOrders: null,
      visit: [visitObj],
      MobileNotification: mobNoti,
      testProfile: testProfileArr,
      payment: paymentArr,
      docs: [],
      flightDetails: [],
      PatientVaccineDetails: [],
      BrowserTypeID: ismob ? 1 : 0,
      IsSendNotification: 0,
      PatientInsuranceID: null,
      InsuranceStatusID: null,
      InsurancePolicyID: null,
      isOfferExpire: null,
      ARYCardNumber: this.CardTypeId === 15 ? this.cusCardno : null,
      BranchCode: this.loggedInUser.currentLocation
    }
    // console.log(patVaccineDetails);
    return RegistrationModel;
  }

  addNewPaymentMethod() {

    const _selPayMod = this.selectedPaymentModeToAdd;
    if (!_selPayMod || !_selPayMod.ModeId) {
      return;
    }
    _selPayMod.uniqueId = +new Date();
    const _payMod = this.addedPaymentModes.find(a => a.uniqueId == _selPayMod.uniqueId);
    if (!_payMod || _selPayMod.ModeId == 2) {
      // this.connectToCCMachine();
      // this.addedPaymentModes = this.addedPaymentModes.filter( a => a.amount); // 
      // this.addedPaymentModes.push(_selPayMod);
      this.addedPaymentModes.splice(0, 0, JSON.parse(JSON.stringify(_selPayMod)));

      this.paymentModesList.forEach(element => { // disable added payment mode button
        if (element.uniqueId == _selPayMod.uniqueId && _selPayMod.ModeId != 2) {
          element.disabled = true;
        } else if (_selPayMod.ModeId == 2) {
          if (this.addedPaymentModes.filter(x => x.ModeId == 2).length >= 5) {
            element.disabled = true;
          }
        }
      });
      // this.paymentModesListUnselected = this.paymentModesList.filter(a => !this.addedPaymentModes.map(b => b.uniqueId).includes(a.uniqueId)); // remove added payment mode button
    } else {
      this.toastr.info(_selPayMod.Title + ' payment mode already added.');
    }
    if (this.addedPaymentModes && this.addedPaymentModes.length == 1 && _selPayMod.ModeId != 5) {
      this.addedPaymentModes[0].amount = this.parseNumbericValues(this.totalAmount);
    }
  }

  removeAddedPaymentMode(item) {
    item.amount = '';

    this.addedPaymentModes = this.addedPaymentModes.filter(a => a.uniqueId != item.uniqueId);

    this.paymentModesList.forEach(element => { // disable added payment mode button
      if (element.uniqueId == item.uniqueId) {
        element.disabled = null;
      }
    });
  }

  paymentModesValueUpdated(paymentMode: any = '') {
    if (paymentMode && paymentMode.ModeId == 5 && this.selectedDiscountCard) { // discount card rewrd points
      let availableRewardPoints = this.selectedDiscountCard.RewardPoints;
      if (availableRewardPoints <= 0) {
        availableRewardPoints = 0;
      }
      if (paymentMode.amount < 0 || paymentMode.amount > availableRewardPoints) {
        this.toastr.warning('Max allowed Reward Points are: <b>' + this.selectedDiscountCard.RewardPoints + '</b>', '', { enableHtml: true });
        paymentMode.amount = availableRewardPoints;
      }
      if (paymentMode.amount > availableRewardPoints) {
        paymentMode.amount = availableRewardPoints;
      }
    }
    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);
    // console.log('paymentModesValueUpdated ', totalAmountByPaymentModes, this.patientVisitInfo.netAmount, totalAmountByPaymentModes > this.patientVisitInfo.netAmount);
  }


  CardTypeId = null;
  discountCardChanged(e) {
    this.stickerText = "";
    this.IsPatientARYCardmember = false;
    this.cardMemberOnly = false;
    this.isAlreadyCustomer = false
    this.disableCardNumberInput = false;
    this.cusCardno = "";
    this.CardTypeId = e.CardTypeId;
    this.totalAmount = 0;
    if (e && e.Amount) {
      this.totalAmount = (e.Amount || 0);
    }
    this.minimumReceivableAmount = this.totalAmount;
    this.selectedDiscountCards = [];
    if (e) {
      this.selectedDiscountCards.push(e);
    }
    if (this.selDiscountCardType == 1) {
      this.cardExpiredOn = '';
      this.cusCardno = '';
    }
    if (this.CardTypeId == 15) {
      const cookieARYValue = this.getCookie("arytokendata");
      if (!this.patientBasicInfo.getRawValue().MobileNO) {
        this.toastr.warning("Please enter mobile number first.");
        return;
      }
      else {
        if (cookieARYValue) {
          this.SearchARYSahulatCustomer();
        }
        else {

          this.GetARYToken();
        }
      }

      return;
    }
    if (this.cusCardno && this.CardTypeId) {
      this.getCutomDiscountNumber(null, this.cusCardno)
    }
    // else {
    //   this.getCutomDiscountNumber(this.selDiscountCardType);
    // }
  }

  GetARYToken() {

    this.spinner.show();
    const params = {
      BranchCode: this.loggedInUser.currentLocation,
      CreatedBy: this.loggedInUser.userid || 0
    };

    this.shareSrv.getData(API_ROUTES.ARY_TOKEN, params).subscribe(
      (resp: any) => {
        this.spinner.hide();


        if (resp?.Status === true && resp?.ResponseCode === "200") {
          try {
            const tokenData = JSON.parse(resp.ResponseDescription);

            if (tokenData?.Token && tokenData?.TokenKey) {
              // this.toastr.success("Token generated successfully.");

              // Save token in a cookie for 1 hour
              const expiry = new Date();
              expiry.setTime(expiry.getTime() + (60 * 60 * 1000)); // 1 hour
              document.cookie = `arytokendata=${encodeURIComponent(JSON.stringify(tokenData))}; expires=${expiry.toUTCString()}; path=/`;

              console.log("Token saved in cookie:", tokenData);
              const cookieValue = this.getCookie("arytokendata");
              if (cookieValue) {
                console.log("Token from cookie:", JSON.parse(cookieValue));
              }
              if (this.patientBasicInfo.getRawValue().MobileNO) {
                this.SearchARYSahulatCustomer();
              }
              else {
                this.toastr.warning("Please enter mobile number first.");
              }

              // Retrieve token back from cookie and log it

            } else {
              this.toastr.warning("Token response is missing required fields.");
            }
          } catch (e) {
            this.toastr.error("Failed to parse token response.");
            console.error("Parsing error:", e, "Response:", resp);
          }
        } else {
          this.toastr.error(resp?.ResponseMessage || "Failed to generate token.");
        }
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error("An error occurred while requesting ARY Token.");
        console.error("API error:", err);
      }
    );
  }

  // Helper function to read cookie by name
  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }

  SearchARYSahulatCustomer() {
    this.spinner.show();
    this.IsPatientARYCardmember = true;

    const cookieValue = this.getCookie("arytokendata");
    let parsedValue = null;
    if (cookieValue) {
      try {
        parsedValue = JSON.parse(cookieValue);
        console.log("Token from cookie:", parsedValue);
        console.log("Token from cookie:", parsedValue.Token);
        console.log("Token from cookie:", parsedValue.TokenKey);
      } catch (e) {
        console.error("Invalid cookie JSON:", e);
      }
    }
    const params = {
      "PhoneNumber": this.patientBasicInfo.getRawValue().MobileNO.replace(/^0/, '92'), //"923331666981"
      "CreatedBy": this.loggedInUser.userid || 0,
      "ARYToken": parsedValue ? parsedValue.Token : null,//cookieARYValue.tokenData.Token,
      "ARYTokenKey": parsedValue ? parsedValue.TokenKey : null, //cookieARYValue.TokenKey
      "Branchcode": this.loggedInUser.currentLocation//this.loggedInUser.locationid
    }
    this.shareSrv.getData(API_ROUTES.SEARCH_ARY_CUSTOMER, params).subscribe((resp: any) => {
      this.spinner.hide();



      if (resp.Status == true && resp.ResponseCode == "200" && resp.Customer != null) {
        // this.toastr.success(resp.ResponseMessage);
        this.patientBasicInfo.get('CNIC')?.setValidators([Validators.required]);
        this.patientBasicInfo.get('HomeAddress')?.setValidators([Validators.required]);

        // Update validity so Angular re-checks the controls
        this.patientBasicInfo.get('CNIC')?.updateValueAndValidity();
        this.patientBasicInfo.get('HomeAddress')?.updateValueAndValidity();
        console.log("this.discountCardNumber: ", this.discountCardNumber);

        this.toastr.success("This Customer has been found in ARY Sahulat Database.");
        resp.Customer.FeeStatus = (resp.Customer.FeeStatus || '').toLowerCase()

        if (resp.Customer.FeeStatus === 'paid')
          this.isAlreadyCustomer = true;
        else
          this.isAlreadyCustomer = false;

        // this.stickerText = "This patient is an " + resp.Customer.CardNumber;

        if (/^\d+$/.test(resp.Customer.CardNumber) && resp.Customer.FeeStatus === 'paid') {
          this.stickerText = "This patient is already an Ary Card member (Card No: " + resp.Customer.CardNumber + ") and the card fee has been paid.";
          this.disableCardNumberInput = true;
          this.IsPatientARYCardmember = true
        }
        else if (/^\d+$/.test(resp.Customer.CardNumber) && resp.Customer.FeeStatus === 'not paid') {
          // this.getARYCardNumber();
          this.cardMemberOnly = true;
          this.disableCardNumberInput = true;
          this.cusCardno = resp.Customer.CardNumber
          this.IsPatientARYCardmember = true

          this.stickerText = "This patient is already an Ary Card member (Card No: " + resp.Customer.CardNumber + "). The card fee has not been paid.";
        }
        else if (resp.Customer.CardNumber === "E-Member") {
          this.getARYCardNumber();
          this.IsPatientARYCardmember = true;
          setTimeout(() => {
            this.appPopupService.openModal(this.aryEmemberleadstoCardmemberPopup);
          }, 1000);

          this.stickerText = "This patient is an " + resp.Customer.CardNumber;
        }
        else {
          this.getARYCardNumber();
          this.IsPatientARYCardmember = false;
          // this.IsPatientARYCardmember = true;
          setTimeout(() => {
            this.appPopupService.openModal(this.noarycustomerleadstoCardmemberPopup);
          }, 1000);

          this.stickerText = "This patient is an " + resp.Customer.CardNumber;
        }

        // this.patientInforARY.get('CardNo')?.enable();
        // this.patientInforARY.patchValue({ CardNo: resp.Customer.CardNumber })
        // console.log("this.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNo", this.patientInforARY.value.CardNo); // might still be null
      }
      else if (resp.Status == false && resp.ResponseCode == "006" && resp.Customer == null) {
        this.getARYCardNumber();
        // this.IsPatientARYCardmember = false
        this.IsPatientARYCardmember = false;

        setTimeout(() => {
          this.appPopupService.openModal(this.noarycustomerleadstoCardmemberPopup);
        }, 1000);
        this.toastr.error(resp.ResponseMessage);
      }
      else {
        this.IsPatientARYCardmember = false;
        this.toastr.error(resp.ResponseMessage || "Please try again");
        // setTimeout(() => {
        //   this.appPopupService.openModal(this.aryEmemberleadstoCardmemberPopup);
        // }, 1000);
        // this.getARYCardNumber();
      }


    }, (err) => {
      this.spinner.hide();

      console.log(err)
    })
  }
  MobileNumberChange() {
    this.stickerText = "";
    this.cardMemberOnly = false;
    this.isAlreadyCustomer = false
    this.disableCardNumberInput = false;
    this.cusCardno = "";
    this.selectedDiscountCard = null;
  }


  MobileChange(MobileNO) {

    this.MobileNumberChange();
    const form = this.patientBasicInfo.getRawValue();

    if (form.MobileNO != '03111000432' && form.PhoneNO != '03111000432')
      if (form.MobileNO.length > 10) {
        setTimeout(() => {
          this.searchPatientByPhoneNo(form.MobileNO);
        }, 1000);
      }

  }


  searchPatientByPhoneNo(mobileNO) {
    const patientSearchParams = {
      MobileNO: mobileNO,
    }
    if (patientSearchParams.MobileNO) {
      this.spinner.show();
      this.patientService.searchPatient(patientSearchParams).subscribe((res: any) => {
        this.spinner.hide();
        if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
          this.populatePatiensFromMC(res.PayLoad);
        }
      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide();
      })
    }
  }

  searchPatientText = '';
  mcPatientsList = [];
  @ViewChild('mcPatientsPopup') mcPatientsPopup;
  mcPatientsPopupRef: NgbModalRef;
  populatePatiensFromMC(data) {
    this.mcPatientsPopupRef = this.appPopupService.openModal(this.mcPatientsPopup);
    this.mcPatientsList = data;
  }
  //create ARY Customer
  createARYSahoolatCustomer() {
    const maxLengthErrors = [];
    let valid = true;
    Object.keys(this.patientBasicInfo.controls).forEach((a) => {
      // console.log(this.patientBasicInfo.controls[a].errors ? 'invalud' : 'valid')
      if (this.patientBasicInfo.controls[a].errors) {
        if (this.patientBasicInfo.controls[a].errors.maxlength) {
          maxLengthErrors.push(a + ': ' + this.patientBasicInfo.controls[a].errors.maxlength.actualLength + '/' + this.patientBasicInfo.controls[a].errors.maxlength.requiredLength);
        }
        this.AddressRequiredMsg = true;
        valid = false;
      }
    });

    if (!valid) {
      this.toastr.error("Please fill all required fields to create Card-Member");
      return;

    }

    this.spinner.show();
    const AryCookieValue = this.getCookie("arytokendata");
    let parsedValue = null;
    if (AryCookieValue) {
      try {
        parsedValue = JSON.parse(AryCookieValue);
        console.log("Token from cookie:", parsedValue);
        console.log("Token from cookie:", parsedValue.Token);
        console.log("Token from cookie:", parsedValue.TokenKey);
      } catch (e) {
        console.error("Invalid cookie JSON:", e);
      }
    }
    const params = {
      CardNo: this.cusCardno,
      CellNo: this.patientBasicInfo.getRawValue().MobileNO ? this.patientBasicInfo.getRawValue().MobileNO.replace(/^0/, '92') : this.patientBasicInfo.getRawValue().PhoneNO.replace(/^0/, '92'),
      City: "Islamabad",
      CNICNo: this.patientBasicInfo.getRawValue().CNIC || "",  // Valid CNIC format
      WhatsAppNo: "",  // Optional
      Gender: this.patientBasicInfo.getRawValue().Gender,             // Or "Female"
      ProfessionID_FK: 1,         // Valid profession ID from Sahulat
      CustomerName: this.patientBasicInfo.getRawValue().Salutation + " " + this.patientBasicInfo.getRawValue().FirstName + " " + this.patientBasicInfo.getRawValue().LastName, // Full name of the customer
      Address: this.patientBasicInfo.getRawValue().HomeAddress || "",
      EmailAddress: this.patientBasicInfo.getRawValue().Emails || "",
      // OutletCode: "idcheadoffice",
      // ResponseType: "2",
      // RegionID: "1",
      // RequestSource: "web",
      // requestTypeID: 0, 
      Createdby: this.loggedInUser.userid,
      ARYToken: parsedValue ? parsedValue.Token : null,
      ARYTokenKey: parsedValue ? parsedValue.TokenKey : null,
      Branchcode: this.loggedInUser.currentLocation
    }
    this.shareSrv.getData(API_ROUTES.ARY_REGISTER_CUSTOMER, params).subscribe((resp: any) => {
      this.spinner.hide();

      if (resp.Status === true && resp.ResponseCode === "200") {
        this.appPopupService.openModal(this.aryecustomersuccessPopup);
        this.stickerText = "This patient is an Card-member now";
        this.IsPatientARYCardmember = true
        this.cardMemberOnly = true
        this.disableCardNumberInput = true

      } else {
        this.IsPatientARYCardmember = false
        this.cardMemberOnly = false
        this.disableCardNumberInput = true
        this.toastr.error(resp.ResponseMessage || "Failed to create CArd-Member");
      }
    }, (err) => {

      this.spinner.hide();
      this.IsPatientARYCardmember = false
      // this.toastr.error("Failed to create CArd-Member, Please contact Administrator.");
      this.toastr.error(err.message || "Failed to create CArd-Member, Please contact Administrator.");
      console.log(err)
    })
  }

  countrySelectedEvent() {
    // setTimeout(() => {
    this.patientBasicInfo.patchValue({
      CityID: ''
    });
    this.getCitiesList(this.patientBasicInfo.value.CountryID || '');
    // }, 100);
  }

  ageChange(value) {
    const _calculatedDob = this.calculateDOB(value, this.patientBasicInfo.value.dmy);
    this.patientBasicInfo.patchValue({
      DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
    });
  }
  dmyChange(value) {
    const _calculatedDob = this.calculateDOB(this.patientBasicInfo.value.Age, value);
    this.patientBasicInfo.patchValue({
      DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
    });
  }

  togglePatientAdditionalFields() {
    this.showPatientAdditionalFields = !this.showPatientAdditionalFields;
  }

  parseNumbericValues(value) {
    let _value = value;
    if (!isNaN(value)) {
      _value = Number(_value);
      _value = Math.floor(_value);
    } else {
      _value = 0;
    }
    return _value;
  }
  formatNumericValues(value) {
    return (value || '0').toString().replace(CONSTANTS.REGEX.nimericWithComma, ",");
  }
  getTotal(arr, key) {
    return arr.map(a => a[key]).reduce((a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b), 0);
  }

  resetPatientBasicInfoFields() {

    this.populatePatientFields({});
  }

  resetPaymentData() {
    this.addedPaymentModes.forEach(a => { this.removeAddedPaymentMode(a) })
    // this.addedPaymentModes = [];
  }
  backToPatientForm() {
    this.resetPaymentData();
  }


  enterStep(e, i) {
    // console.log('enter => event: ', e, '  index'+ i);
    if (i == 1) {
      setTimeout(() => {
        const invalidControl = this.el.nativeElement.querySelector('[name="tpFieldngb"]');
        invalidControl.focus();
      }, 100);
    }
  }
  exitStep(e, i) {
    //console.log('exit => event: ', e, '   index '+ i);
  }

  isPaymentFieldsValid() {
    const result = { valid: false, code: '', message: '' };
    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);
    const minReceivableAmount = this.minimumReceivableAmount;
    if (totalAmountByPaymentModes < minReceivableAmount) {
      result.valid = false;
      result.message = `Please Receive minimum amount of Rs: "${minReceivableAmount}"`;
      return result;
    } else {
      result.valid = true;
      result.message = '';
    }

    const creditCardEntry: any = this.addedPaymentModes.find(a => a.ModeId == 2);
    if (creditCardEntry && this.parseNumbericValues(creditCardEntry.amount) > 0 && (!creditCardEntry.CCNo || !creditCardEntry.CCTNo)) {
      result.valid = false;
      result.message = 'Please enter "Credit Card No" and "Slip No"';
      return result;
    } else {
      result.valid = true;
      result.message = '';
    }

    this.addedPaymentModes.filter(a => a.ModeId == 2).forEach(a => {
      if ((a.CCNo || a.CCTNo || a.InstOwner) && !a.amount) {
        result.valid = false;
        result.message = 'Credit Card details provided by Amount is missing';
        return result;
      }
    });

    return result;
  }

  cancelPatientInfoForm() {
    this.resetAllForm_CompleteRegistration();
    // let url = ['pat-reg/search'];
    // if(this.route.routeConfig.path == 'regForHS') {
    //   url = ['pat-reg/'];
    // }
    setTimeout(() => {
      window.location.reload();
    }, 500);
    // this.updateUrlParams_navigateTo(['pat-reg/search']);
  }


  openSearchForm() {
    this.appPopupService.openModal(this.searchPatientsPopup);
  }

  calculateAge(birthday) { // birthday is a date
    // birthday = new Date(birthday)
    // var ageDifMs = Date.now() - birthday.getTime();
    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
    // return Math.abs(ageDate.getUTCFullYear() - 1970);
    const obj = { days: 0, months: 0, years: 0 }
    if (!moment(birthday).isValid()) {
      return obj;
    }
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    const currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);
      // if(obj.months >= 12) {obj.months = 0; obj.years = 1}
    } else {
      obj.days = diffDays;
    }
    // console.log(diffDays, obj);
    /*
    this.patientBasicInfo.patchValue({
      //Age: obj.years ? (obj.years + ' years') : obj.months ? (obj.months + ' months') : (obj.days + 'days')
      Age: obj.years ? obj.years : obj.months ? obj.months : obj.days
    });
    this.patientBasicInfo.patchValue({
      dmy: obj.years ? '3' : obj.months ? '2': '1'
    });
    */
    return obj;
  }
  calculateDOB(number, dmy) {
    let dob: any = new Date();
    dmy = dmy || '3';
    if (dmy == '1') {
      dob = moment(dob).subtract(number, 'days')
    } else if (dmy == '2') {
      dob = moment(dob).subtract(number, 'months')
    } else if (dmy == '3') {
      dob = moment(dob).subtract(number, 'years')
    }
    const calculatedDob = { day: moment(dob).get('date'), month: (moment(dob).get('month') + 1), year: moment(dob).get('year') };
    /*
    this.patientBasicInfo.patchValue({
      DateOfBirth: calculatedDob, // moment(dob).format(this.dateFormat)
    });
    */
    return calculatedDob;
  }

  resetAllForm_CompleteRegistration() {
    this.resetPatientBasicInfoFields();
    this.resetPaymentData();
    this.stopCamera();
    this.wizard.goToStep(0);
    this.updateUrlParams_navigateTo('', { cacheControl: (+new Date()) });
  }



  /***** WEB SOCKET - MULTI APP *****/
  // sendCommand(cmd) {
  //   this.multiApp.sendCommand(cmd);
  // }
  /***** WEB SOCKET - MULTI APP *****/

  checkValue(controlName) {
    if (!controlName) {
      return;
    }
    const ctrl = this.patientBasicInfo.get(controlName);
    if (ctrl.disabled) {
      ctrl.enable();
    } else {
      ctrl.disable();
    }
    console.log(ctrl.disabled, ctrl.status, ctrl);
  }


  updateUrlParams_navigateTo(url, params = {}, settings = {}) {
    const _url = url || [];
    const _settings = {
      ...{
        // relativeTo: this.route,
        replaceUrl: true,
        queryParams: params
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }, ...settings
    };
    this.router.navigate(
      _url,
      _settings
    );
    this.selectedPatientSource = 1;
  }



  /* start - FBR - function */
  formatDataForFBR(data) {
    const discountCards = data.discountCards || [];
    const paymentData = data.payment || [];
    let paymentModeSelected = 1;
    const fbrPaymentModes = {
      cash: 1, // Cash
      card: 2, // Card
      giftVoucher: 3, // Gift Voucher
      loyaltyCard: 4, // Loyalty Card
      mixed: 5, // Mixes
      cheque: 6 // cheque
    }
    if (paymentData && paymentData.length == 1) {
      switch (paymentData[0].ModeId) {
        case 1:
        case '1':
          // Cash
          paymentModeSelected = fbrPaymentModes.cash;
          break;
        case 2:
        case '2':
          // Credit Card
          paymentModeSelected = fbrPaymentModes.card;
          break;
        case 3:
        case '3':
          // Cheque
          paymentModeSelected = fbrPaymentModes.cheque;
          break;

        case 4:
        case '4':
          // Demand Draft
          paymentModeSelected = fbrPaymentModes.cheque;
          break;
        case 5:
        case '5':
          // Reward Point
          paymentModeSelected = fbrPaymentModes.loyaltyCard;
          break;
      }
    } else {
      paymentModeSelected = fbrPaymentModes.mixed; // Mixed
    }


    // tax calculation formula
    // (ActualPrice * TaxRate/100) + (ActualValue) = ValueWithTax
    // (ActualValue * 17 + ActualValue * 100) / 100
    // ActualValue(17 + 100)
    // (ValueWithTax * 100) / (TaxRate + 100)
    // (900 * 100) / (TaxRate + 100) = 769.2308

    const taxRate = 0;
    const valueWithAndWithoutTax = { taxRate: 0, fullValue: this.totalAmount, taxValue: 0 }; // this.helperSrv.calculateTaxValue(((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice')) || 0) - (visitData.AdjAmount || 0), taxRate);

    let calculatedTax = valueWithAndWithoutTax.taxValue;// ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (visitData.AdjAmount || 0)) * 17 / 100;
    let totalSale = valueWithAndWithoutTax.fullValue - valueWithAndWithoutTax.taxValue; // ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (calculatedTax || 0)) || 0; // - (visitData.AdjAmount || 0)) || 0;
    let totalBillAmount = valueWithAndWithoutTax.fullValue; // - (visitData.AdjAmount || 0); // (totalSale || 0) + (calculatedTax || 0) - (visitData.AdjAmount || 0);

    if (totalSale < 0) {
      totalSale = 0;
    }
    if (totalBillAmount < 0) {
      totalBillAmount = 0;
    }
    if (calculatedTax < 0) {
      calculatedTax = 0;
    }


    const params = {
      "InvoiceNumber": "",
      "POSID": 0, // 966130
      "USIN": "0", // VisitId
      // "RefUSIN": null,
      "DateTime": new Date(),
      // "BuyerName": "Buyer Name",
      // "BuyerNTN": "1234567-8",
      // "BuyerCNIC": "12345-1234567-8",
      // "BuyerPhoneNumber": "0000-0000000",
      "TotalSaleValue": this.helperSrv.formatDecimalValue(totalSale), // 1300 | 2600 - 0 - 1300 | totalamount - tax - discount
      "TotalTaxCharged": this.helperSrv.formatDecimalValue(calculatedTax),
      "TotalQuantity": discountCards.length,
      "Discount": 0, // 1300 - 50% | discount
      // "FurtherTax": 0.0,
      "TotalBillAmount": this.helperSrv.formatDecimalValue(totalBillAmount), // 1300 | 1300 + 0 | totalSale + tax
      "PaymentMode": paymentModeSelected, // {1: Cash, 2: Card, 3: Gift Voucher, 4: Loyalty Card, 5: Mixed, 6: Cheque}
      "InvoiceType": 1, // {1: New, 2: Debit, 3: Credit}
      "Items": []
    };
    discountCards.forEach(tp => {
      const _texRate = 0; // (this.getValidAddedTestsProfiles().find(a => a.TPId == tp.TPId) || { TaxRate: 0 }).TaxRate;
      tp.TaxRate = (_texRate || 0); //(tp.TaxRate || 0);

      const tpValueWithAndWithoutTax = this.helperSrv.calculateTaxValue((tp.Amount || 0) - (tp.Discount || 0), tp.TaxRate);

      const taxCharged = tpValueWithAndWithoutTax.taxValue;// ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (visitData.AdjAmount || 0)) * 17 / 100;
      const saleAmount = tpValueWithAndWithoutTax.fullValue - tpValueWithAndWithoutTax.taxValue; // ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (calculatedTax || 0)) || 0; // - (visitData.AdjAmount || 0)) || 0;
      const totalAmount = tpValueWithAndWithoutTax.fullValue; // - (tp.Discount || 0); // (totalSale || 0) + (calculatedTax || 0) - (visitData.AdjAmount || 0);

      const item = {
        "ItemCode": tp.CardTypeId,
        "ItemName": 'Dis-Card' + tp.Code,
        "PCTCode": tp.PCTCode || '98160000', // {radiology: '98179000', lab: '98160000'} , // "98173000", // "11001010", https://download1.fbr.gov.pk/Docs/2021101313103753401chapte-98&99.pdf // page 4
        "Quantity": 1,
        "TaxRate": this.helperSrv.formatDecimalValue(tp.TaxRate),
        "SaleValue": this.helperSrv.formatDecimalValue(saleAmount),
        "Discount": this.helperSrv.formatDecimalValue(tp.Discount || 0),
        // "FurtherTax": 0.0,
        "TaxCharged": this.helperSrv.formatDecimalValue(taxCharged),
        "TotalAmount": this.helperSrv.formatDecimalValue(totalAmount),
        "InvoiceType": 1
        // "RefUSIN": null
      }
      params.Items.push(item);
    });

    params.TotalSaleValue = 0;
    params.TotalTaxCharged = 0;
    params.Discount = 0;
    params.TotalBillAmount = 0;
    params.Items.forEach(a => {
      params.TotalSaleValue += a.SaleValue;
      params.TotalTaxCharged += a.TaxCharged;
      params.Discount += a.Discount;
      params.TotalBillAmount += a.TotalAmount;
    })

    return params;
  }

  checkFBRserviceStatus() {
    this.spinner.show();
    this.fbr.checkFbrApiStatus().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.length && (res[0] || '').toLowerCase() == 'service is responding') {
        this.toastr.success('FBR service is running', 'FBR');
      }
    }, (err: any) => {
      this.spinner.hide();
      this.toastr.error('FBR service is stopped', 'FBR');
    })
  }
  getFBRinvoiceNo(data) {
    // this.spinner.show();
    return;
    this.fbr.getFbrInvoiceNo(data).subscribe((res: any) => {
      this.spinner.hide();
      this.toastr.success('FBR Invoice number generated', 'FBR');
      // res = {
      //   "InvoiceNumber": "966130BAYS37107326*test*",
      //   "Code": "100",
      //   "Response": "Fiscal Invoice Number generated successfully.",
      //   "Errors": null
      // }
      console.log(res);
    }, (err: any) => {
      this.spinner.hide();
      this.toastr.error('Error generation FBR Invoice No', 'FBR');
    })
  }
  getMACAddress(loggedInUser: UserModel) {
    // setTimeout(() => {
    const obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'get-mac', userIdentity: JSON.stringify(obj) });
    // this.sendCommand({ command: 'get-version', userIdentity: JSON.stringify(obj) });
    // }, 5000);

    setTimeout(() => {
      if (!this.loggedInUser.macAdr) {
        this.MACAndPOSAlert.MAC = 'MAC not found, Registrations will be blocked on this PC';
      }
      this.getPOSID();
    }, 5000);
    this.getPOSID();
  }
  getPOSID() {
    const params = {
      macAddress: this.loggedInUser.macAdr,
      branchId: this.loggedInUser.locationid,
      userId: this.loggedInUser.userid
    }

    this.spinner.show();
    this.visitService.getPOSID(params).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
        // res.PayLoad[0].POSID = '123123';
        if (res.PayLoad[0].POSID && res.PayLoad[0].POSID != '0') {
          this.MACAndPOSAlert.POSID = res.PayLoad[0].POSID
          this.MACAndPOSAlert.POS = ''; // `(${'POSID: ' +  res.PayLoad[0].POSID})`;
          this.auth.updateUserDetails('posId', res.PayLoad[0].POSID, false);
        } else {
          this.MACAndPOSAlert.POSID = '';
          this.MACAndPOSAlert.POS = `POSID not found, Registrations will be blocked on this PC (${'POSID: ' + res.PayLoad[0].POSID})`;
        }
      } else {
        this.MACAndPOSAlert.POS = 'POSID not found, Registrations will be blocked on this PC';
        let apiErrorMsg = "";
        if (res && res.Error) {
          apiErrorMsg = res.Error;
        }
        this.toastr.error('Error, Error Getting POSID. ' + apiErrorMsg);
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      let errorMsg = '';
      if (err && err.message) {
        errorMsg = err.message;
      }
      this.toastr.error('Error Error Getting POSID: ' + errorMsg);
      this.MACAndPOSAlert.POS = 'POSID not found, Registrations will be blocked on this PC';
    });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  macAllowedForRegistration() {
    return true;
    let allowed = true;
    if (!this.loggedInUser.macAdr) {
      this.toastr.warning('You are not allowed for Registration. Reason: MAC Address limitation');
      allowed = false;
    }
    return allowed;
  }
  /* end - FBR - function */


  copyText(text: string) {
    this.helperSrv.copyMessage(text);
  }


  ngOnDestroy() {
    this.stickerText = "";
    this.disableCardNumberInput = false;
    this.IsPatientARYCardmember = false

    const patientData = this.patientBasicInfo.getRawValue();
    if (!patientData) {
      return;
    }
    if (patientData.Salutation || patientData.FirstName || patientData.Gender || patientData.MobileNO || patientData.PhoneNO) {
      // Ask user before leaving if patient info is entered.
    }
  }

  isVerifiedCardNo = false;
  verifyCardNumberClick() {
    this.getCutomDiscountNumber(null, this.cusCardno)
  }
  verifyCardNumber(param) {
    this.patientBasicInforFormSubmitted = false;
    this.cusCardno = param.target.value;
    // let cardNumberObj = this.discountCardNumber.find(e => e.CardNo == this.cusCardno)
    // this.isVerifiedCardNo = cardNumberObj ? true : false;
    this.getCutomDiscountNumber(null, this.cusCardno)
  }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  clearCusCardNo() {
    this.cusCardno = null;
  }


  #IDC_CARD_Registration


  submitRegistrationForDiscountCard(data) {
    const patientVisitInvoiceWinRef: any = this.openInvoiceWindow();
    this.spinner.show();
    this.visitService.createVisit(data).subscribe((res: any) => {
      this.spinner.hide();
      console.log(res);
      if (res && res?.StatusCode == 200 && res?.PayLoad[0]?.Result == 1) {

        this.toastr.success('Discount card sale completed successfully.', 'Discount Card Sale');

        patientVisitInvoiceWinRef.location = this.getPatientCardVisitInvoiceUrl(res.PayLoad[0].VisitID);

        this.OrbitPatientID = res.PayLoad[0].PatientID;

        setTimeout(() => {
          this.cancelPatientInfoForm(); // navigate to Search Patient
        }, 1000);
      }
      else if (res && res.StatusCode == 502) {
        this.toastr.error(res.Message);
        this.closeInvoiceWindow(patientVisitInvoiceWinRef);
      }
      else {
        let apiErrorMsg = "";
        if (res && res.Error) {
          apiErrorMsg = res.Error;
        }
        this.toastr.error('Error, Error Registring. ' + apiErrorMsg);
        this.closeInvoiceWindow(patientVisitInvoiceWinRef);
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      let errorMsg = '';
      if (err && err.message) {
        errorMsg = err.message;
      }
      this.toastr.error('Error Registring. Reason: ' + errorMsg);
      // this.closeInvoiceWindow(patientVisitInvoiceWinRef);
    });

  }

  nextValidation() {
    if (this.patientBasicInfo.invalid || this.selectedDiscountCards.length < 1) {
      this.toastr.warning('Please fill the required Fields')
    }
  }

  ClearSaleForm() {
    this.cusCardno = "";
    this.patientBasicInfo.enable();
    this.selectedDiscountCard = null;
    this.resetAllForm_CompleteRegistration()
  }

  // submitRegistration() {
  //     let dataVisit = this.getFinalDataSetforVisit();
  //     try {
  //       let fbrRequestData: any = this.formatDataForFBR(dataVisit);
  //       dataVisit.FBRRequestData = fbrRequestData;
  //     } catch (e: any) {
  //       return throwError(() => new Error("Failed while preparing FBRRequestData"));
  //     }
  //     this.spinner.show();
  //     this.visitService.createVisit(dataVisit).pipe(
  //     // Step 1: Validate Visit Creation Response
  //     switchMap((res: any) => {
  //       if (!res || res.StatusCode !== 200 || !res.PayLoad?.length || res.PayLoad[0].Result !== 1) {
  //         return throwError(() => new Error("Visit creation failed"));
  //       }
  //       this.OrbitPatientID = res.PayLoad[0].PatientID;
  //       let data = this.getFinalDataSet();
  //       try {
  //         let fbrRequestData: any = this.formatDataForFBR(data);
  //         data.FBRRequestData = fbrRequestData;
  //       } catch (e: any) {
  //         return throwError(() => new Error("Failed while preparing FBRRequestData"));
  //       }
  //       return this.visitService.saveDiscountCardSale(data);
  //     }),
  //     // Step 2: Handle Any API Error
  //     catchError(err => {
  //       this.spinner.hide();
  //       this.toastr.error("Process stopped.Error Reason: " + err.message);
  //       return of(null); // Stop further execution
  //     })

  //   ).subscribe((res: any) => {
  //     if (!res){
  //     let apiErrorMsg = "";
  //      if (res && res.Error) {
  //       apiErrorMsg = res.Error;
  //       }
  //       this.toastr.error('Error, Error Registring. ' + apiErrorMsg);
  //       return;
  //     } 
  //     this.spinner.hide();
  //     let invoiceWindow: any = this.openInvoiceWindow();
  //     // Validate discount card response
  //     if (res.StatusCode === 200 && res.PayLoad?.length && res.PayLoad[0].Result === 1) {
  //       this.toastr.success('Discount card sale completed successfully.', 'Discount Card Sale');
  //       invoiceWindow.location = this.getPatientVisitInvoiceUrl(res.PayLoad[0].CardID);
  //       setTimeout(() => this.cancelPatientInfoForm(), 1000);
  //     } else {
  //       let apiErrorMsg = res?.Error || "";
  //       this.toastr.error("Discount Card Sale Failed. " + apiErrorMsg);
  //       this.closeInvoiceWindow(invoiceWindow);
  //     }
  //   });
  // }


  getPaymentModeIcon(modeId: number): string {
    switch (modeId) {
      case 1: return 'far fa-money-bill-alt';           // Cash fa fa-money
      case 2: return 'ti-credit-card';     // Credit Card
      case 3: return 'ti-receipt';         // Cheque
      case 4: return 'ti-briefcase';       // Demand Draft
      case 5: return 'ti-gift';            // Reward Point
      case 6: return 'ti-mobile';          // Online Payment
      default: return 'ti-wallet';         // Fallback
    }
  }
}