// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, Inject, KeyValueDiffers, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { LookupService } from '../../services/lookup.service';
import { PatientService } from '../../services/patient.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { StorageService } from '../../../../modules/shared/helpers/storage.service';
import moment from 'moment';

// Ensure `ToastrService` is preserved as a runtime value for DI analysis.
const _toastrServiceToken = ToastrService;
import { CONSTANTS } from '../../../shared/helpers/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardComponent } from 'angular-archwizard';
import { DomSanitizer } from '@angular/platform-browser';
import { Conversions } from '../../../shared/helpers/conversions';
import { NgbDateStruct, NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
// import { MultiAppService } from '../../../shared/services/multi-app.service';
import { TestProfileService } from '../../services/test-profile.service';
// import { Observable } from 'rxjs/Rx';
// import { Observable, OperatorFunction } from 'rxjs';
// import { catchError, switchMap, debounceTime, tap, distinctUntilChanged  } from 'rxjs/operators';
// import { of } from 'rxjs/observable/of';
import { merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, debounceTime, filter, map, tap, distinctUntilChanged, switchMap, take } from 'rxjs/operators';
// import { GetValueFromArrayPipe } from '../../../../pipes/get-value-from-array.pipe';
import { TokenService } from '../../../shared/services/token.service';
// import { IVisitDocs, VisitDocs } from '../../../../models/documents.model';
// import { LEADING_TRIVIA_CHARS } from '@angular/compiler/src/render3/view/template';
import { HelperService } from '../../../shared/helpers/helper.service';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { AuthService, UserModel } from '../../../../modules/auth';
import { GetValueFromArrayPipe } from '../../../../modules/shared/pipes/get-value-from-array.pipe';
import { VisitService } from '../../services/visit.service';
import { HcBookingService } from '../../services/hc-booking.service';
import { A } from '@angular/cdk/keycodes';
import { HcDashboardService } from 'src/app/modules/home-sampling/services/hc-dashboard.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConscentForms } from 'src/assets/docs/conscent-forms/conscent-forms';
import { FbrService } from 'src/app/modules/shared/services/fbr/fbr.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { HcCityAuthService } from 'src/app/modules/home-sampling/services/hc-city-auth.service';
import { EclService } from '../../services/ecl.service';
import { DoctorService } from 'src/app/modules/doctors/services/doctor.service';
import { es } from 'date-fns/locale';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { ThirdAssignedInterviewersComponent } from 'src/app/modules/recruitment/components/third-assigned-interviewers/third-assigned-interviewers.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { PostexService } from '../../services/postex.service';
declare let Checkout: any;

@Component({
  standalone: false,
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.scss'],
  animations: [
    // Animation for progress bar fill
    trigger('progressFill', [
      state('void', style({ width: '0%' })), // Initial state
      transition(':enter', [ // When element is added to the DOM
        animate('1s ease-in-out', style({ width: '*' })) // Animate to current width
      ])
    ]),
    // Animation for Congrats message and button
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(-20px)' })), // Initial state
      transition(':enter', [ // When element is added to the DOM
        animate('0.5s ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PatientRegistrationComponent implements OnInit, AfterViewInit, OnDestroy {


  @ViewChild(WizardComponent) public wizard: WizardComponent;
  @ViewChild('mcPatientsPopup') mcPatientsPopup;
  @ViewChild('docPrint', { static: false }) docPrint: ElementRef;
  mcPatientsPopupRef: NgbModalRef;
  @ViewChild('OlaDocPopup') OlaDocPopup;
  OlaDocPopupRef: NgbModalRef;
  @ViewChild('mcEmployeesPopup') mcEmployeesPopup;
  @ViewChild('isMetalPopup') isMetalPopup;
  @ViewChild('searchPatientsPopup') searchPatientsPopup;
  @ViewChild('fitToFlyPopup') fitToFlyPopup;
  @ViewChild('outSourcePatSerachPopup') outSourcePatSerachPopup;
  @ViewChild('patientBasicInfoForCovidPopup') patientBasicInfoForCovidPopup;
  patientBasicInfoForCovidPopupRef: NgbModalRef;
  @ViewChild('patientBasicInfoForDenguePopup') patientBasicInfoForDenguePopup;
  patientBasicInfoForDenguePopupRef: NgbModalRef;
  @ViewChild('patientFlightDetailsPopup') patientFlightDetailsPopup;
  patientFlightDetailsPopupRef: NgbModalRef;

  @ViewChild('InsurancePolicyPopup') InsurancePolicyPopup;
  InsurancePolicyPopupRef: NgbModalRef;

  patientVisitsList = []
  patientVisitsPopupRef: NgbModalRef;
  searchTextVisit = ''
  @ViewChild('patientVisits') patientVisitsPopup;

  @ViewChild('InsuarncePolicyHelpPopup') InsuarncePolicyHelpPopup;
  InsuarncePolicyHelpPopupRef: NgbModalRef;

  @ViewChild('patientVaccineDetailsPopup') patientVaccineDetailsPopup;
  @ViewChild('mapPopup') mapPopup;
  @ViewChild('BookingSuccessPopup') BookingSuccessPopup;
  mapPopupRef: NgbModalRef;
  @ViewChild('AssignRiderPopup') AssignRiderPopup;
  patientVaccineDetailsPopupRef: NgbModalRef;
  AssignRiderPopupRef: NgbModalRef;
  @ViewChild('recentRegistrationsPopup') recentRegistrationsPopup;
  @ViewChild('arySahulatPopup') arySahulatPopup;
  @ViewChild('noRecordPopup') noRecordPopup;
  @ViewChild('aryecustomersuccessPopup') aryecustomersuccessPopup;
  selectedRecentVisit = null;
  @ViewChild('patientVisitDocsPopup') patientVisitDocsPopup;
  patientVisitDocsPopupRef: NgbModalRef;

  @ViewChild('associatedTestModal') associatedTestModal;
  associatedTestModalRef: NgbModalRef;

  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild("canvas") public canvas: ElementRef;
  gMapInfoToDisplay: { lat: any; lng: any };
  mapName: any = '';
  video: any;
  activeVideoCameraStream: any;
  openCameraFromSource = '';
  videoDimensions = {
    width: 300,
    height: 300
  }
  cameraDevicesList = [{ id: '', name: 'default' }];
  selectedCamera = '';
  pageTitle = 'Patient Registration'
  tabIndexes = {
    MRNo: '',
    BookingPatientID: 1,
    Salutation: 2,
    FirstName: 3,
    LastName: 4,
    Gender: 5,
    DateOfBirthCalendar: 6,
    DateOfBirth: 7,
    Age: '',
    dmy: '',
    MobileOperatorID: 8,
    MobileNO: 9,
    PhoneNO: 10,
    Emails: 11,
    HomeAddress: 12,
    CNIC: 13,
    PassportNo: 14,
    RefDoc: 15,
    RefNo: 16,
    InternalRemarks: 17,
    PatientComments: 18,
    PatientInfoNextButton: 19,
    TestProfilePicker: 20,
    TestProfileNextButton: 21
  }

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  enableRenameVisitAttachmentField = -1;
  HomeAddress: any = "";
  HCRemarks: any = "";
  // age:any = '';
  dateFormat = 'DD-MM-YYYY'; //'YYYY-MM-DD';
  maxDate_dob = moment(new Date()).format(this.dateFormat);
  maxDate_dob_bs = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };
  minDate_hcdatetime_bs = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };
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

  isPatientWilling: any = "true";
  isBookingUrgent: any;
  isWhatsapNumber: any = null;
  loggedInUser: UserModel;
  searchPatientText = '';
  screenPermissions = [];
  screenPermissionsObj: any = {};
  gendersList = [];
  salutationsList = [];
  mobileOperatorList = [];
  HCRequestSourceList = [];
  citiesList = [];
  countriesList = [];
  branchesList = [];
  bloodGroupList = [];
  maritalStatusList = [];
  refByDocList = [{ Name: 'Self', QRCodeNumber :''  }];
  B2BDocList = [];
  selectedB2BDoctor = null;
  paymentModesList = [];
  patientTypeList = [];
  labTestProcessList = [];
  discountApprovingAuthorityList = []; // [{id: 1, name: 'AAA'}, {id: 2, name: 'BBBB'}];
  homeSamplingEmpList = [];
  panelsList = [];
  employeesList = [];
  employeeDependentsList: any = [];
  airlinesList = [];
  airportsList = [];
  vaccinesList = [];
  vaccinesDosageList = [{ id: 1, name: 'Dose 1' }, { id: 2, name: 'Dose 2' }];
  vaccinationCentersList = [{ id: 1, name: 'F-9 Park' }, { id: 2, name: 'PIMS' }, , { id: 3, name: 'IDC' }];
  vaccineStatusList = [{ id: 0, name: 'Not Vaccinated' }, { id: 1, name: 'Partially Vaccinated' }, { id: 2, name: 'Fully Vaccinated' }];
  minimumReceivablePercentage = {
    temp: 100,
    dynamic: 100
  };
  minimumReceivableAmount = 0;
  countryIdForPak = 168;
  bookingNoDisabled = null;

  // emailV = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);;
  patientBasicInfo = this.fb.group({
    PatientID: [{ value: '', disabled: true }],
    MRNo:[{ value: '', disabled: true }],
    // PatientVaccineNo: [''], // [{value: '', disabled: true}],
    // OrbitPatientID: [''],
    BookingPatientID: [''],
    Salutation: [''],
    FirstName: [''], //, Validators.required],
    LastName: [''],
    CNIC: [''],
    PassportNo: [''],
    Gender: [''],
    DateOfBirth: [''],
    Age: [{ value: '', disabled: false }, ''],
    dmy: [{ value: '3', disabled: false }, ''],
    FatherName: [''],
    HomeAddress: [''],
    PhoneNO: ['', [
      // Validators.pattern('^[0-9]{7,15}$')  // Only numbers with a length of 7 to 20
      Validators.pattern('^[0-9]{7,20}$')
    ]],
    AlternateContact: ['', [
      // Validators.pattern('^[0-9]{7,15}$')  // Only numbers with a length of 7 to 20
      Validators.pattern('^[0-9]{7,20}$')
    ]],
    MobileOperatorID: [''],
    MobileNO: [''],
    isWhatsapNumber: [''],
    WhatsapNo: [''],
    // Emails: ['', Validators.email],
    Emails: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
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
    // RefDocText: [''], // manual text field

    B2BDoc: [0],
    RefNo: [''],
    InternalRemarks: [''],
    PatientComments: [''],
  });

  cnicValidationCheck = true;

  patientBasicInfoFormForCovid = this.fb.group({
    CNIC: [''],
    PassportNo: [''],
    HomeAddress: [''],
    PhoneNO: [''],
    MobileOperatorID: [''],
    MobileNO: [''],
    Emails: ['', Validators.email],
    CountryID: [this.countryIdForPak],
    CityID: [0],
    BloodGroup: [''],
    CNICRelation: [''],
    ProvinceID: [''],
    // DistrictID: [''],
    // TehsilID: [''],
    // Per_DistrictID: [''],
    // Per_TehsilID: [''],
    Per_Address: ['']
  });

  patientInforARY = this.fb.group({
    PINCode: [''],
    CardNo: ['']
  });

  patientBasicInfoFormForDengue = this.fb.group({
    CNIC: ['', [Validators.required, Validators.minLength(13)]],
    PassportNo: [''],
    HomeAddress: [''],
    PhoneNO: [''],
    MobileOperatorID: [''],
    MobileNO: [''],
    Emails: ['', Validators.email],
    CountryID: [this.countryIdForPak],
    CityID: [0],
    BloodGroup: [''],
    CNICRelation: [''],
    ProvinceID: [''],
    DistrictID: ['', Validators.required],
    TehsilID: ['', Validators.required],
    Per_DistrictID: ['', Validators.required],
    Per_TehsilID: ['', Validators.required],
    Per_Address: ['', Validators.required]
  });


  patientFlightDetails = this.fb.group({
    VisitId: [null],
    AirlineId: [0],
    FlightNo: [''],
    FlightDate: [null],
    BookingReferenceNo: [''],
    AirportId: [0],
    PassportNo: [''],
  });

  patientVaccineDetails = this.fb.group({
    PatientID: [0],
    VaccineID: [0],
    Dosage: [0],
    VaccineDate: [null],
    VaccinationCenter: [null],
    CreatedBy: [0],
    VaccinationStatus: [0] // -- 0=not vaccinated, 1=fully vaccinated, 2=Partialy vaccinated
  });
  patLocationForHC: any;

  PatientBookingSuccessMsg: any = "";
  HCDateTime: any = "";
  meridian = true;
  HCtime: any = ""
  todayDate: { year: number; month: number; day: number; };
  InvalidHCTime = false;
  hcBookingSourceID: any = 0;
  hcCityID: any = '';

  urlBookingID: any = "";
  panelIdFromBookingId: any = null;
  RidersDetailList: any = [];
  showRiderSchedule: boolean;
  RS: any;
  mapName1: string;
  SelRider: any = {
    "selRiderID": '',
    "selRiderName": '',
    "selRiderContactNumber": '',
  };
  selBranchid: any = null;
  PreTravelBookingPatient: any = {};
  OrbitPatientID: any = "";
  HCBookingSourceClass = "";
  gcCitiesList: any[];
  HCCityClass = "";
  isDiscountFrombookingID: any = false;
  panelTypeFromBookingId: any;
  selVisit: any = "";
  panelIdFromVisitInfo: any;
  paneltypeFromVisitInfo: any;
  isLockTPSection = false;
  BookingNo: any = "";
  RefByFromVisitAssciate: any = "";
  outSourceHospitalPatData: any = [];
  lockPatientTypeAndPanel = false;
  BookingNoFromDB: any = false;
  VisitHomeSamplingTest: any = [];
  outsourceHospitals: any = [];
  selOutPat: any;
  outSourceHospitalTPData: any = [];
  telenorePatientInfo: any = {};
  telenorecardOwnerInfo: any = {};
  outHospitalID: any = null;
  teleHospitalMRN: any = "";
  teleHospitalPatientID: any = 0;
  teleHospitalOrderNo: any;
  FBI: any = "";
  BookingNoFromDBVal: any = "";
  isOrderRegForECLAllowed = true;
  alertMesForAssociatedTP: any = "";
  alertMesForAssociatedTPurdu: any = "";
  techList: any = [];
  HelpingStaffList: any = [];
  DocList: any = [];
  SelDoctorIDToAssign: any = null;
  SelhelpingStaffIDToAssign: any = null;
  SelTechIDToAssign: any = null;
  branchList: any = [];
  enableRadioServicesActions = false;
  personalRelations: any = [];
  districts: any = [];
  tehsils: any = [];
  provinces: any = [];
  MobDeviceNotificationsList: any = [];
  commaSepDeviceNames: any = "";
  FirstNameWarTxt = "";
  isdenguerestrictions = 0;
  patientBasicInfoFormForDengueSubmitted: boolean;
  pertehsilsList: any = [];
  provinceDB: any = null;
  perDisricts: any = [];
  OlaDocPatients: any = [];
  OlaHospitalMRNo: any = "";
  OlaHospitalOrderNo: any = "";
  OlaHospitalID: any = "";
  selectedOlaDiscount: any = null;
  OlaDocB2bPanelID: any = "";
  OlaHospitalPatientID: any = "";
  byPassReqPatientData = false;
  patientData: any = [];
  selectedDob: string;
  curDate: string;
  RefByDocID: any = null;
  CMSRequestNo: string = null;
  isMetal: any = 0;
  showFoloroConscentFormBtn = false;
  isEligibleForInsurance = false;
  InsuarncePolicyHelpContent = "";
  isByPassInsuarancePolicy: any;
  InsuarancePolicyDetail: any = {};
  showMediConscentFormBtn = false;
  isshowprogressbar = true;
  isEligibleForInsurancePanel = true;
  InsuranceActiveDate: any = null;
  InsuranceActive: any;
  isEligibleForInsuranceActiveDate = true;
  Insuranceshouldntoffer = false;
  PatientInsuranceID: any = null;
  InsuranceStatusID: any = 0;
  isUpgradePolicy: any = false;
  isUpgradePolicyAllowed = false;
  isReactivePolicyAllowed = false;
  isReactivePolicy = false;
  InsurancePolicyNotExpired = false;
  InsuranceWillingExpireDate: any;
  PanelType: any = 0;
  stickerText: string = null;
  noRecordMessage: string = null;
  isLockTPOnly = false;
  AryPanelid: number = null;
  OnlinePaymentReferenceID: any = null;
  isurgentbooking: any = false;
  getlatLngPosition(LatLngPosition) {
    this.patLocationForHC = LatLngPosition;
    console.log("LatLngPosition.position.lat()", LatLngPosition.position);
  }
  getlatLngPosition1(LatLngPosition) {
    this.patLocationForHC = LatLngPosition;
    console.log("LatLngPosition.position.lat()", LatLngPosition.position);
  }
  clearPatientVaccinationDetails() {
    this.patientVaccineDetails.reset();
    this.isVaccineDetailCheck = false;
    // console.log(this.patientVaccineDetails.value);
  }

  visitAttachments = [];
  selectedPaymentModeToAdd: any = '';
  addedPaymentModes = [];
  selectedTestProfiles = [];
  selectedTPItem = '';
  searchByCodeNameRadio = 'code';
  chkSearchByExactMatch = false;


  patientVisitInfo = {
    // visitNo: '',
    onlineBookingNo: '',
    corporateClientID: 0,
    grossAmount: 0,
    discount: 0,
    // discountApprovingAuthority: 0,
    netAmount: 0,
    remarks: ''
  }
  btnAndViewPermissions = {
    patientRegBtn: false,
    hcBookingBtn: false,
    hcBookingPaymentView: false,
    patRegPaymentView: false,
    hcGoogleMaps: false
  }
  testProfileList = [];
  patientBasicInforFormSubmitted = false;
  vaccineInforFormSubmitted = false;
  paymentInforFormSubmitted = false;
  patientBasicInfoFormForCovidSubmitted = false;
  patientFlightDetailsFormSubmitted = false;
  patientVaccineDetailsFormSubmitted = false;

  mcPatientsList = [];
  discountPercentage = 0;
  oldDiscountPercentage = 0;
  discountFieldDisabled = false;
  discountedCharges = 0;
  discountMaxValue = 100;
  isVaccineDetailCheck = false;

  spinnerRefs = {
    searchEmployee: 'searchEmployee',
    refByDocField: 'refByDocField',
    B2BDocField: 'B2BDocField',
    testProfilesDropdown: 'testProfilesDropdown',
    panelsDropdown: 'panelsDropdown',
    homeSamplingEmp: 'homeSamplingEmp',
    discountCards: 'discountCards',
    recentRegs: 'recentRegs',
    patientVisits: 'patientVisits',
    radoiologistList: 'radoiologistList',
    OnlineBanking: 'OnlineBanking',
    OnlineMCBBanking: 'OnlineMCBBanking',
  }


  // selectedEmployee: any = {
  //   emp: '',
  //   dep: ''
  // }
  selectedPatientSource = 0;
  selectedPatientSource_enum = { 0: 'New Reg.', 1: 'New Reg.', 10: 'Searched Patient', 11: 'Recent Registrations', 20: 'Online Booked Pat.', 21: 'Online Booked Pat. Linked', 30: 'Emp. Self', 31: 'Emp. Dep.' }

  linkdedPatient: any = null;

  selectedApprovAuth = 0;
  selectedPatientType = 1; // 1 for Regular
  selectedPatientType_prev = 1;
  patientTypeFieldDisabled = null;
  selectedPanel = null;
  selectedHomeSamplingEmp = null;
  homeSamplingEmpFieldShow = false;
  patientBasicInfoDisabled = null;
  patientContactInfoDisabled = null;
  patientVisitInfoDisabled = null;

  hideOptionalFields = false;

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
  // invoiceCopyType = 1;
  invoiceCopyType = 3; //print only patient copy

  discountCardsList = [];
  hideDiscountCardField = true;
  selectedDiscountCard = null;
  redeemRewardPoints = 0;

  airportLocationIds = [116, 117, 118, 119, 120, 121, 122, 123];

  qTokenNo = '';

  nonDiscountableTests = [];

  allRemarks = {
    InternalRemarks: '',
    PatientComments: '',
    InternalRemarksClass: '',
  }


  showConscentFormBtn = false;

  recentRegistrations = [];

  public isPatientBasicInfoFormValid: (MovingDirection) => boolean;
  public isPatientVisitInfoFormValid: (MovingDirection) => boolean;


  searchingTP = false;
  searchTPFailed = false;
  ngbFormatterTP_input = (x: any) => x ? (x.TestProfileCode + ' - ' + x.TestProfileName) : '';
  ngbFormatterTP_output = (x: any) => x ? (`${x.TestProfileCode} - ${x.TestProfileName} (${this.parseNumbericValues(x.TestProfilePrice)})`) : '';
  // ngbSearchTP: OperatorFunction<string, any> = (text$: Observable<any>) =>
  /*
  ngbSearchTP = (text$: Observable<any>) =>
    text$.pipe(
      // debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searchingTP = true),
      switchMap((term) => {
        let _params = {
          tpids: null,
          code: (this.searchByCodeNameRadio == 'code' ? term : null),
          desc: (this.searchByCodeNameRadio == 'name' ? term : null),
          branchId: this.loggedInUser.locationid || 1,
          panelId: (this.selectedPanel || '') // this.selectedPanel ? this.selectedPanel.PanelId : '' // this.patientBasicInfo.value.corporateClientID || '',
        }
        if (!_params.code && !_params.desc) {
          return of([]);
        }
        if (term.length < 2) {
          return of([]);
        }
        return this.tpService.getTestsByNameParsed(_params)
        // return of([{TestProfileCode: 'aaaa', id: 1}]);
        // return this.tpService.getTestsByName(_params).pipe(
        //   tap((res) => {
        //       this.searchTPFailed = false;
        //       console.log(res.payLoadArr);
        //       return of([]);//res.payLoadArr.map(a => a.TestProfileCode));
        //   }),
        //   catchError(() => {
        //     this.searchTPFailed = true;
        //     return of([]);
        //   }))
      }),
      tap(() => this.searchingTP = false)
    )*/
  ngbSearchTP2 = (text$: Observable<any>) =>
    text$.pipe(
      // debounceTime(300),
      distinctUntilChanged(),
      map((term) => {
        if (term.length < 1) {
          return this.testProfileList;
        }
        let colKeyToFilter = 'TestProfileCode'; // { TestProfileCode, TestProfileName }
        if (this.searchByCodeNameRadio == 'name') {
          colKeyToFilter = 'TestProfileName';
          return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20);
        } else {
          colKeyToFilter = 'TestProfileCode';
          term = (term || '').trim();
          if (this.chkSearchByExactMatch) {
            return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase() == term.toLowerCase()).slice(0, 20);
          }
          return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase().indexOf(term.toLowerCase()) == 0).slice(0, 20);
        }
        // return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20);
      })
    )

  ngbFormatterRefBy_input = (x: any) => x ? x.Name : ''; // will be displayed input field when value is selected
  ngbFormatterRefBy_output = (x: any) => x ? x.Name : ''; // will be displayed in dropdown items
  // ngbSearchRefBy = (text$: Observable<any>) => // used to bind data to dropdown
  //   text$.pipe(
  //     // debounceTime(300),
  //     distinctUntilChanged(),
  //     map(term => term.length < 2 ? [{ Name: 'Self' }]
  //       : this.refByDocList.filter(v => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
  //   )

  ngbSearchRefBy = (text$: Observable<any>) =>
  text$.pipe(
    distinctUntilChanged(),
    map(term => {
      if (term.length < 2) {
        return [{ Name: 'Self', QRCodeNumber :''  }];
      }

      const searchTerm = term.toLowerCase();

      return this.refByDocList
        .filter(v =>
          (v.Name && v.Name.toLowerCase().includes(searchTerm)) ||
          (v?.QRCodeNumber && v?.QRCodeNumber.toString().includes(searchTerm))
        )
        .slice(0, 20);
    })
  );


  // need to remove
  VaccinationCentersList = [];

  currencyNoteReceived = 0;
  currencyNoteChangeAmount = 0;

  _isAirportLocation = false;
  _isAirline = false;
  _isEmbassy = false;

  vd = [];
  // RiderScheduleData: RiderSchedule[] = [];
  RiderScheduleData: RiderSchedule[] = [];
  RiderScheduleDisplayedColumns = ['PatientName', 'HCDateTime', 'HCBookingStatus', 'PatientAddress', 'Map']; //HCBookingStatusID
  // dataSource = this.RiderScheduleData; //new MatTableDataSource<RiderSchedule>(this.RiderScheduleData);

  tpParametersForPopover = [];

  MACAndPOSAlert = {
    POS: '',
    POSID: '',
    MAC: ''
  };

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    @Inject(PatientService) private patientService: any,
    @Inject(LookupService) private lookupService: any,
    @Inject(ToastrService) private toastr: any,
    @Inject(NgxSpinnerService) private spinner: any,
    @Inject(StorageService) private storageService: any,
    @Inject(EclService) private ecl: any,
    @Inject(AuthService) private auth: any,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    @Inject(NgbModal) private modalService: any,
    @Inject(NgbModalConfig) bsModalConfig: any,
    @Inject(HcDashboardService) private HCMService: any,
    @Inject(MultiAppService) private multiApp: any,
    @Inject(TestProfileService) private tpService: any,
    private el: ElementRef,
    @Inject(AppPopupService) private appPopupService: any,
    @Inject(TokenService) private qMgmtService: any,
    @Inject(HelperService) private helperSrv: any,
    @Inject(VisitService) private visitService: any,
    @Inject(HcBookingService) private hcService: any,
    @Inject(FbrService) private fbr: any,
    @Inject(HcCityAuthService) private hccityAuth: any,
    @Inject(DoctorService) private doctorService: any,
    @Inject(HcDashboardService) private HCService: any,
    @Inject(SharedService) private shareSrv: any,
    @Inject(DoctorService) private docSrv: any,
    @Inject(PostexService) private postexService: any

  ) {
    bsModalConfig.backdrop = 'static';
    bsModalConfig.keyboard = false;
  }


  ngOnInit(): void {
    // Voucher implementation
    this.isVoucher = false;
    this.isVoucherVerified = false;
    this.allRemarks.InternalRemarks = "";
    this.recalculateAmountsVoucher();

    this.registerMastercardCallbacks();


    this.isLockTPOnly = false;
    this.stickerText = '';

    // alert("Test");
    this.patientInforARY = this.fb.group(
      {
        PINCode: [''],
        CardNo: ['']
      },
      { validators: this.pinOrCardValidator }
    );
    this.isEligibleForInsuranceActiveDate = true;
    this.isUpgradePolicyAllowed = false;
    this.isPatientWilling = "true";
    this.InsuranceActiveDate = null;
    this.selectedTestProfiles = [];

    this.getInsurancePolicyDetail();
    this.GetInsuarancePolicyBits();
    this.GetARYPanelID();
    this.getPanelIDForB2b();
    // this.openFitToFlyForm();
    this.getmsjForAssociatedTP();
    this.districts = []
    this.tehsils = []
    this.pertehsilsList = []
    this.perDisricts = []
    // this.selectedTestProfiles = [];
    this.mapName = "map";
    this.mapName1 = "map1";
    this.SelRider = {
      "selRiderID": '',
      "selRiderName": '',
      "SelRiderContactNumber": '',
    };
    this.RiderTasksSchedule('');
    const current = new Date();
    this.todayDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.multiApp.updateScannedDoc([]);
    this.CheckButtonAndViewControlsPermissions();
    if (this.btnAndViewPermissions.hcBookingBtn) {
      this.GetHCBookingSources();
      this.getHCCities();
    }
    // this.patientBasicInfo.patchValue({
    //   RefDoc: {
    //     RefId: 1
    //   }
    // });
    // let _imgData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABPCAYAAABrs9IqAAAAAXNSR0IArs4c6QAAD3pJREFUeF7tnHlwFFUex7/dM5PMZGZCTgIJSSAH4TKYRDS4KrqlWIVKIVuKxakcGzCiUFvrAQIqh6BbAltrUAmIli6lW1uu+wdQlgVlLUFMiagxyQZycOQCQsidOTLdW7/X0z0zyUzSScap3a1uCshMv36v3+f93vf3e7/3gBNFUYR2/eoEOA30r86YNaCBDg1nDXSIOGugNdChIhCidjSN1kCHiECImtEsWgMdIgIhakazaA10iAiEqBnNojXQISIQomY0i9ZAh4hAiJrRLFoDHSICIWpGs2gNdIgIhKgZzaI10CEiEKJmNIv+bwUtQoAIzr2z6/8tOU66r10eAsOyaHYARHSxp+lnTvQGKh8P4eEeB2jARwFaFAVwogCnyIHnZdBk4wJEgQO4PvAIY5A10KME3ecSsfeTr3CrQ6fURKA5nkNsrBVzZ01CVmoc9DqdezA0KRmWdDDJEF1w9AGL/liM+hYPQA4iBE4Er9cjLzMOG5fejcykWPA8ScnIQdOJtaFmhnyqrX+5QN+PxHfI7+Fd53DqHxZoqph+uVwuvPePUnR2k05Lr03fE1ABAsoq6/HInHQsfSgPvG50oAVB8MvFW5qojL8BGWqAqOLByngfS6SfqZ3+bdHzOp1OqSdQfcMHLYpwCCI27P4CzW199KpSBAKAh4DoqAjMSIvB5NRoPJyfBZ7XD2mRg1nYtWvXcPHiRXCyhwUQHRONqVOnKvU6HA6Ulpb6lKFJxPE89Ho9+200GmExmxEVFQ2z2aw4bDbjAlyiIBmWw+5AQ0MD6upqUV/fgLb2NjidTlZffHw8Jk6ciOTkFMTFxzHo/i4f0ENNBdas4EKvyGHFHz7C1Zu+oMG5qHdIGWvFc4vvxG9uSwGv00sDMUL5OHnyJPbu3QsI7qnDAXfl52Pz5s1KnR0dHViyeAnpmsdnkDMm0DodDAYDg0sDlJKcgunTpyM3LxeRY8ZI0ubn/djsFUR0dXbi+PHjOF1SgprqathsNjajqSUKBmgQY6JjkJeXh1WrVyEuPn5w0FLoJrIpGPiiKFpAnwAc+dtptHaR2UilSZ91PAdTRDhqrtxA3tQkLH94JjhZOgaRaeUWhYv9yh07dgzbtm0D775Bg33fnDl4+623JdAcQKAfevBBKeZk3fDqgzzA7u8IbGxsLPJn5+PJRYuQlpamTH1WnyjJIElEU0MjDh8+jG+++QadnZ2sPaVuek+vZsiy9/15PzIzM4cALQJOWy9sjU0AhXABaLtIk+LiseGdE2hsdSqlRHKEHA+zSYecrLG4a1oiciaPR9QYM5vSoo9Fy0se6XHpFnVSBWhRxJz75+AttaBlXfOSOPrKEGbAlClTUbC2ADk5OR6dJdCiiOvXr+FA0QF8/fXXTCbkS/JTbq0kt+S+MSzQnZdrUbuvCLzD5qN3SiPUhMmEuOXLseWLCly7JUuHDI6Hw+EEpxfxwtLZuFrXiHkPZCMh1gyOJ+3y1kN6RjILnpGmTypBz5mDt94e3KJJk5OTk+Hsc6KjsxNtbW1w9blYi8wyQTNQxyC/9PJLSElNlb4nXRZF/PXTT3Ho0CH09PT4QCYZSkxKQvzYeCYj9VeusrqHB7qyHGVr1kO090AfQEF4iwWJ27fik9pu3OqQJ7T0LiQdUZEWdPfaMGlCJH6suAx7nx5pE6Kg1xugrG/cs44XgYToCCz47QwYDLzbsn2d0wDpIIseCjSAjIwMbNq0ielpV3cX6urqUHL6NMp+LgM5T1mXSWNXrlqJpcuWITw8HIJLQEN9PQoLC9Hc3KzIBQ1CQkICFixYgNtzchATGwO73c7Knjp5ChcuXMCOXTuHlg4y1s6Kcvxc8Bx4m53ZXn/5YJPGYkbS61vx8olLaGhV5iVETmAgTWHhyJ0WgwfvmIgbt3pw9KsKXG/phpOtGj0RCskTjeW05Cj8ZdN8mIy0mqRQztdrjxR09sxsFB8sZpZLFtrb28tgF39wEGfOnFFA0z0qSzMkJiYGgsuF9997H0eOHFFCRipDkDds2IBZd86CxWpVHDHNkubmJpSUlOCee+9FUlLS4BpNdzvLK/FTwbPQ22zgfaa528nQS1sikPz6VhT91IZr7QRGgudWLtjsIm62t2H17+7CL+U1iE+IQ8vNLnR0S3G2R4YEOHU8po4Nx6rH8xEWZvBotderjgp0cbHPtCcHV172C7NWskY5EjKaTPjg4AfIyspCb08Pi2AonJMvKrd4yWKsXbeORTDybJA6LvW8u7ubzQj5fn/aPuGdBLoQelsvc2yeS9IR+lM0mzDpta24cqMdQmevBzQvxZxihBXVQgQM0VZcuNiCioYOxEYaWaTiDqRYTQInwGoxYPMz9yPKbAqYGwkWaImJyHR6zerVKC8vV0DTe+/YuRNz587F1StXsWTxYjYQ8hUVFYVtr72G2XfP9humDhUWs4Hx/sdCgUFLqzOG22xC2tYtqD36GfTNzcrLUJzCE0CjCYbcHITNnYfKNieOn65DVX0rHHYp6+eV2sO4KB6fv/M0wikEDBDnBBO0HI5t27aVxcbyIohAv7BhA5YsWYKK8nIU/L5A0XF649TUVDYQk7Mm9zdU1Z+HD9oSgbQtr6Jq//sIa7jkGQC3vVIY5zKGI27VahQ1A+kTU9Fus6Onx0nBtvJiRqMeE8easfiRO2AYJB8STNCy5e3cuRP//PJLH9DPrV+P5cuX45efy7B27VqfkI5i7Z27diEtPU012CGl48eCQhhsvf3COy+LtpqR7gZtaLjspWOSMNC6QIALxjtn41/3LMRXZy8jMtIEnqRF0EmGKwK3ZcRhzeO5iLLQPTniGNiPYIMmnSan9t3Zsz6gX92yBfPnz0dtTS2eXrHCRzrIEb6+/Q3MnDlTWUkOl7jHokWgo7oaVW/sgM5O4Y8nu0DrQfkSIkyYtLYAlW/uhb7xsjLhSThk0IAL/NQpSPzTPhz4eynOX7gBW68DLrfuUyIqf1oCXnz6PlgjjdBRWwGW6CMGnZ2NYtkZ0lrIveptbmrGypXPoPVmq9KmTq/Du0VFLKZub2vDU4ueQmsrC6nYRU7u2cJCPPHkEyz29lZAqc9Soo0MJlDuRAFNhW1dXeiprSGTZBGAv/0TWmqbE5Pww5r10DfUDwwBmccUoZ+Sgds/Ooz2Hjsq6q6hrcOuVEhWHx9lwu2Z4xFuJC/uXqz4MZORgKZqsrOzcdALNFkyRQaHDhbj6NGjPi0lTZiAogNFGDduHFx9fdi8aTNOnTrlU4Yikjd370bi+PEsh+Ld8b6+PpSVlbEFUlxcnF9j9wEtCG6H5RNx+K7pBVEE73Liu0XLoKtvHJBqlnImgC4rHbkfH1KW3qTdchwjayV9FskKpPWa3xccKWjK7u3es4flLOwOOygLeKakBMePHWe5EfkiC1zw+AKsf/55REREQHQJOHfuHF588UV0dXX5zLT82bOxcOFCZGRmwGQysbppVfjtt9/i7Nmz2LhxI1so+bu8pEMEQaTuKtGxn76LdNPpROmTy8A3NgwCOgO5HxcDPAkDiY8UmTOJZgkelv9iCW1JNoIHmuqnkGzWrFkga+vs6mSgW1pusjjZOzlEVvjyK6+wbB6lOEUaGLsDe/bsxonjJ5gkyOVpUCZMmIDMyZORkDCW6filS5dQXVODMIMB+/arSCrJoyCvvP11m+ERXBAdTpQuWg4dBfX9CnosOgN5HxeD4/VSvsjHvXqv7wfffRmpRfuzKu+sHsEbM2YM1q1bh0cfexR6Ay2YPO/CltTbt6Pq31VKxk6+3z/DSd+TZKjK3qnxogposmgZdL8HB4I2BDJWNU0i2KAJCkkETfHH5s9nixRydiyf5QWaMnalZ7/Dhx9+iKqqKp+VpGKUXulY1UklNb0miGxryelgGs03NAbSI/BZmcyieX50oE+cOIEd23f4TBzKKezatcsnH/3IvHk++WH5xeStprDwcFgsFpZlmzFjOh64/wGkZ6TDaDQNiCLkZ50OB2qqa/DZ55/jh3PncO36dZYLoUuRH45y8CZMmzaNbUaQtAyu0SpIS6BFcE47zixaCn19k9+neMpnT8lyg5akY6QXTWFKvHv2JoGU1BRmibIFUiqT0preiXgZBoVu3pBp8UGJf+99vkDvJksEOc/vv/8e58+fR1NTE7o6u1h0Qg4xJjaWDVhubi7LlajKdQwFQwHtsOPM0hV+QctZEf3kLNxx+D1wtJU1CtDyhqgPRA4+oOQ41h9oBpz3H6cPtb3Wf3OWnF97ezvLUVM6NSwsDNZIKyIjIwNuiSkzazj/MYrHoh2o2P8u0NoSYGw46BMTkVW4Vkr4jxI05Y/JAgMtFigaoDIsGuc5Tzmll9IP/Y8KUOqUrNIfcHlXnaCShvtsugbw5d478/3BDG8XnL0tRR4CXKxjfo4CuPd5RJ4DH2YAz8K7kV8EsKamhoVrBJQsnDpOK7fo6GgW65IuNjY2sgUJWZd8UVKfylOIRpuzZJFUBzlD2h2hGNhqtbIQkHZk2GBxHPubwFIkQQsRSirRs/QctUeDQGVI86k8tSFHMTRwo9ZoySqk3DPxlHVzMIzSKI8cNHWQOkudJCAEiuBUVFQgPT2dASBHRPEsTWvqKAEnayV49Js+kxOkv9mxA4uF1UOgCRp9Twl7+kz10SAQ5JSUFFRWVmJcwjhcrb/KwsHWW7dgDA9HS0sL2wygQdTp9DAY9GzA2VEGP9ewLFoBLW0Wg5OPAAyYJ+7dZE7KQY8GNHVETtITFDmfQN/Jjoe0ksIxWRroGdqGIssnx0cWR9btnY+Q5UaeJVQX3ZcPyNBnsmqql3LzDocNLrsTjq5u8JTb4DiEW83QhYUx0HRQiJ4ZMtcxHJsb7EDCAObDqThIZeUEkqy9Qzk9f82yQaPTSQC6mhrRVl0N2r3QkxSS36GtN0sE9CYzwq0WGMdYYTCEB0yODduig8TiV69GdmYjbsh97ICOynRdroOt5RZMY+NgsFqgM4Sxmers64PLKR3u5I0GGCPMzCcFRTpG/OL/Yw9Ks0LK+pDzZzka6awC6wkdkXAnKtln8lfMH3lv9Xv1+f/WooMxrszls0My7g1ooikfmnEDl1MOir8P4Pg10MEYERV1aKBVQApGEQ10MCiqqEMDrQJSMIpooINBUUUdGmgVkIJRRAMdDIoq6tBAq4AUjCIa6GBQVFGHBloFpGAU0UAHg6KKOjTQKiAFo4gGOhgUVdShgVYBKRhFNNDBoKiiDg20CkjBKKKBDgZFFXVooFVACkYRDXQwKKqoQwOtAlIwimigg0FRRR3/AaDTgIx7fgJAAAAAAElFTkSuQmCC';
    // let _obj:IVisitDocs = { // = new VisitDocs();
    //   docId: null,
    //   visitId: null,
    //   uniqueIdentifier: +new Date(),
    //   fileName: 'Docs - 1',
    //   fileType: 'image/png',
    //   data: _imgData,
    //   thumbnail: _imgData,
    //   sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(_imgData),
    //   sanitizedThumbnail: this.sanitizer.bypassSecurityTrustResourceUrl(_imgData)
    // };
    // console.log('________________ ', _obj);
    // _obj.docId = null;
    // _obj.uniqueIdentifier = (+new Date());
    // _obj.fileName = 'Docs - 1';
    // _obj.fileType = 'image/png';
    // _obj.data = _imgData;
    // _obj.thumbnail = _imgData;
    // _obj.visitId = null;
    // _obj.sanitizedData = this.sanitizer.bypassSecurityTrustResourceUrl(_imgData);
    // _obj.sanitizedThumbnail = this.sanitizer.bypassSecurityTrustResourceUrl(_imgData);
    // this.vd.push(_obj);
    // OR 
    // this.vd = this.helperSrv.addPrefixToDocs(res.PayLoadDS.Table4);

    this.cd.detectChanges();

    const whatsappCtrl = this.patientBasicInfo.get('WhatsapNo');
    const checkboxCtrl = this.patientBasicInfo.get('isWhatsapNumber');

    // Initial check (for edit / patchValue cases)
    if (whatsappCtrl?.value) {
      checkboxCtrl?.setValue(true, { emitEvent: false });
    }

    // Watch for changes
    whatsappCtrl?.valueChanges.subscribe(value => {
      if (value && value.replace(/_/g, '').length > 0) {
        checkboxCtrl?.setValue(true);
      } else {
        checkboxCtrl?.setValue(false);
      }
    });

    this.getPermissions();
    this.loadLoggedInUserInfo();
    // this.getVaccinationCentre();
    // this.getBranches();
    this.getGendersList();
    this.getBloodGroups();
    this.getRefByDoctors();
    this.getB2BDoctors();
    // setTimeout(() => {
    this.getTestProfileList('');
    // }, 5000);
    this.getLookupsForRegistration();

    this.getEmployeesForHomeSampling();
    this.getAirlines();
    this.getAirports();
    this.getVaccines();
    this.personalRelation();
    this.branches();
    this.getProvinces();
    this.getdistricts();
    this.getTehsils();
    this.getPerdistricts();
    setTimeout(() => {
      this.getMobileDeviceTokenByPatientID();
    }, 1000);
    // this.getSalutationList();
    // this.getMobileOperator();
    // this.getMaritalStatus();
    // this.getCountries();
    // this.getCitiesList(168);

    this.route.queryParams.subscribe(params => {
        console.log("QuerryParams___________", params);
        this.selectedB2BDoctor = null;
        this.isLockTPOnly = false;
        this.stickerText = '';

        // this.appPopupService.closeModal();
        if (params.p) {
          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          this.PatientInsuranceID = null;
          this.isLockTPSection = false;
          if (!this.urlBookingID && !this.BookingNo)
            this.selectedTestProfiles = [];
          // if (!this.outHospitalID) {
          //   this.isLockTPSection = false;
          //   this.outHospitalID = null;
          //   this.outSourceHospitalPatData = [];
          //   this.outSourceHospitalTPData = [];
          //   this.panelIdFromBookingId = null;
          //   this.panelTypeFromBookingId = null;
          // }
          // this.selectedTestProfiles = [];
          this.RefByFromVisitAssciate = null;
          let allParams: any = atob(params.p);
          allParams = JSON.parse(allParams);
          // console.log("Queryy AllParams_______",allParams);
          this.selectedPatientSource = allParams.patSrc || 0;

          this.controlFieldsForEmployee(false);
          setTimeout(() => {
            this.getMobileDeviceTokenByPatientID();
          }, 900);
          if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {
            this.controlFieldsForEmployee(true);
          }
          if (this.selectedPatientSource == 31) {
              this.router.navigate([], { queryParams: {}, replaceUrl: true });
          }
          this.searchPatient(allParams.orbitPatientID);
          // let isOlaDocPatient = this.getHospitalPatientByHospitalID(3);
          // console.log(isOlaDocPatient);
          // console.log("this allParams", allParams)
          const plist = this.patientTypeList;
          this.patientTypeList = [];
          plist.forEach(a => { if (a.TypeId == 8) { a.disabled = false } });
          plist.forEach(a => { this.patientTypeList.push(a) });
          this.checkElligiblePatientForPolicy(allParams.orbitPatientID);

        }
        else if (params.b) {
          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          this.PatientInsuranceID = null;

          if (!this.urlBookingID)
            this.selectedTestProfiles = [];
          this.urlBookingID = atob(params.b);
          // setTimeout(() => {
          this.searchPatientByTrackingID(this.urlBookingID).then(resp => {
            // console.log(resp);
          });
          // this.searchPatientByTrackingID(this.urlBookingID).then(resp => {
          //   console.log("resp Promise ", resp)
          // })
          // }, 500);

        }
        // atob(params.selVisiPat
        else if (params.selVisiPat && params.selVisitTP) {
          this.PatientInsuranceID = null;
          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          // this.selectedTestProfiles = [];
          this.RefByFromVisitAssciate = null;

          this.isLockTPSection = true;
          // console.log((JSON.parse(params.selVisitTP)));
          let allParams: any = atob(params.selVisiPat);
          let allParamsTP: any = atob(params.selVisitTP);
          allParamsTP = JSON.parse(allParamsTP);
          allParams = JSON.parse(allParams);
          this.selVisit = allParams[0].VisitId;
          console.log(allParams);
          this.RefByFromVisitAssciate = allParamsTP[0].RefByDoc

          this.selectedPatientSource = allParams[0].patSrc || 10;
          this.panelIdFromVisitInfo = allParams[0].PanelID;
          this.paneltypeFromVisitInfo = allParams[0].PanelType;
          this.controlFieldsForEmployee(false);
          if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {
            this.controlFieldsForEmployee(true);
          }
          setTimeout(() => {
            this.populatePatientFields(allParams[0]);
            this.getAndDisplayPatientPic(allParams[0]);
            this.addTestsFromBooking(allParamsTP)
          }, 2000);

          const plist = this.patientTypeList;
          this.patientTypeList = [];
          plist.forEach(a => { if (a.TypeId == 8) { a.disabled = false } });
          plist.forEach(a => { this.patientTypeList.push(a) });
          this.updateUrlParams_navigateTo('');

        }
        else if (params.outHospital) {
          this.PatientInsuranceID = null;
          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          this.selectedTestProfiles = [];
          // console.log((JSON.parse(params.selVisitTP)));
          this.resetAllForm_CompleteRegistration();
          this.panelIdFromBookingId = null;
          this.unLinkOrbitPatient('');
          this.resetPatientBasicInfoFields();
          let allParams: any = atob(params.outHospital);
          allParams = JSON.parse(allParams);
          this.searchOutSourcePatients(allParams);
        }
        else if (params.bookingInfoTelenore) {
          this.PatientInsuranceID = null;

          // console.log((JSON.parse(params.selVisitTP)));
          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          this.selectedTestProfiles = [];
          this.resetAllForm_CompleteRegistration();
          this.panelIdFromBookingId = null;
          this.unLinkOrbitPatient('');
          this.resetPatientBasicInfoFields();
          let telePatient: any = atob(params.bookingInfoTelenore);
          const teleOwner: any = atob(params.ownerInfoTele);
          telePatient = JSON.parse(telePatient);
          this.telenorePatientInfo = telePatient;
          this.telenorecardOwnerInfo = teleOwner;
          this.outHospitalID = JSON.parse(atob(params.orgID)).HospitalID;
          this.teleHospitalMRN = JSON.parse(atob(params.teleHospitalMRN)).teleHospitalMRNo;
          this.teleHospitalPatientID = JSON.parse(atob(params.teleHospitalPatientID)).teleHospitalPatientID;
          // this.teleHospitalOrderNo =JSON.parse(atob(params.hospitalOrderNo)).HospitalOrderNo;
          setTimeout(() => {
            this.populatePatientFields(telePatient);
          }, 900);
          this.panelTypeFromBookingId = 1;
          this.panelIdFromBookingId = 1214;
          this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 });
          this.lockPatientTypeAndPanel = true;
        }
        else if (params.ccrBooking) {
          this.PatientInsuranceID = null;

          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          // this.selectedTestProfiles = [];
          const data: any = JSON.parse(atob(params.ccrBooking));
          this.CMSRequestNo = data.CMSRequestNo; //data. 

          console.log("dataArray:", data)
          setTimeout(() => {
            data.PatientID ? this.searchPatient(data.PatientID) : this.populatePatientFields(data);
          }, 1000);
          this.updateUrlParams_navigateTo('');
        }
        else {
          this.PatientInsuranceID = null;
          this.isEligibleForInsuranceActiveDate = true;
          this.isUpgradePolicyAllowed = false;
          this.isPatientWilling = "true";
          this.InsuranceActiveDate = null;
          if (!this.urlBookingID && !this.BookingNo)
            this.selectedTestProfiles = [];
          this.patientBasicInfo.patchValue({
            B2BDoc: 0
          });
          const plist = this.patientTypeList;
          this.patientTypeList = [];
          plist.forEach(a => { if (a.TypeId == 8) { a.disabled = true } });
          plist.forEach(a => { this.patientTypeList.push(a) });
          this.updateUrlParams_navigateTo('');
          this.resetPatientBasicInfoFields();
          this.resetVisitData();
          this.resetPaymentData();
          this.resetPatientBasicInfoFormForCovidPopup();
          this.resetPatientFlightDetailsPopup();
          this.resetPatientVaccineDetailsPopup();
          // this.BookingNo = "";
          this.patientBasicInfo.patchValue({
            BookingPatientID: ''
          });
          this.wizard.goToStep(0);
          // this.selectedTestProfiles = [];

        }

        // if (this.selectedPatientSource != 20 && this.selectedPatientSource != 22) {
        this.appPopupService.closeModal();
        // }
      }
      );

    this.storageService.qMgmtTokenForPatReg.subscribe(token => {
      // console.log(' ccccccccccccc ', token)
      this.qTokenNo = this.getParseQMgmtToken(token);
    });

    this.qTokenNo = this.getParseQMgmtToken();

    // this.spinner.hide();
    // this.toastr.error('Connection Error');

    this.isPatientBasicInfoFormValid = (direction) => {
      this.patientData = this.patientBasicInfo.getRawValue();

      if (!this.macAllowedForRegistration()) {
        return;
      }
      this.patientBasicInforFormSubmitted = true;
      let valid = true;
      // return valid;
      const maxLengthErrors = [];
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

      const dob: any = (this.patientBasicInfo.value as any).DateOfBirth;
      const selectedDob1 = moment(new Date(dob?.year, dob?.month, dob?.day)).format();
      const selectedDob = moment(new Date(`${dob?.month}-${dob?.day}-${dob?.year}`)).format();
      this.selectedDob = moment(new Date(`${dob?.month}-${dob?.day}-${dob?.year}`)).format('DD-MM-yyyy');
      this.curDate = moment(new Date()).format('DD-MM-yyyy');
      if (moment(new Date()).diff(moment(selectedDob)) < 0) {
        valid = false;
        this.toastr.warning('Please select past date for DOB');
        return valid;
      }
      // if(!valid) {
      //   this.toastr.warning('Please fill required fields');
      // }
      if (valid) {
        const data: any = this.patientBasicInfo.getRawValue();
        this.patientBasicInfoFormForCovid.patchValue({
          CNIC: data.CNIC || '',
          PassportNo: data.PassportNo || '',
          HomeAddress: data.HomeAddress || '',
          PhoneNO: data.PhoneNO || '',
          MobileOperatorID: data.MobileOperatorID || '',
          MobileNO: data.MobileNO || '',
          Emails: data.Email || data.Emails || '',
          CountryID: data.CountryID || this.countryIdForPak || 0,
          CityID: data.CityID || 0,
          BloodGroup: data.BloodGroup || '',
        });
        this.patientBasicInfoFormForDengue.patchValue({
          CNIC: data.CNIC || '',
          PassportNo: data.PassportNo || '',
          HomeAddress: data.HomeAddress || '',
          PhoneNO: data.PhoneNO || '',
          MobileOperatorID: data.MobileOperatorID || '',
          MobileNO: data.MobileNO || '',
          Emails: data.Email || data.Emails || '',
          CountryID: data.CountryID || this.countryIdForPak || 0,
          CityID: data.CityID || 0,
          BloodGroup: data.BloodGroup || '',
          Per_DistrictID: data.PermanentDistrictID ?? data.Per_DistrictID ?? null,
          Per_TehsilID: data.PermanentTehsilID ?? data.Per_TehsilID ?? null,
        });
      }

      if (maxLengthErrors.length) {
        this.toastr.warning(maxLengthErrors.join('<br>'), 'Input data exceed', { enableHtml: true });
      }

      if (valid) {
        this.panelIdFromBookingId = null;
        this.panelTypeFromBookingId = null;
      }

      return valid;
    };

    this.isPatientVisitInfoFormValid = (direction) => {

      this.patientData = this.patientBasicInfo.getRawValue();
      console.log("this.patientDatathis.patientDatathis.patientDatathis.patientData", this.patientData)
      this.vaccineInforFormSubmitted = true;
      if (direction === 1) { // backward
        return true;
      }
      let valid = false;

      if (this.getValidAddedTestsProfiles().length) { // (this.selectedTestProfiles.length) {
        valid = true;
      } else {
        this.toastr.warning('Please select atleast one test / profile');
        valid = false;
        return valid;
      }

      if (this.selectedPatientType && (this.selectedPatientType == 2 || this.selectedPatientType == 5) && !this.selectedPanel) {
        this.toastr.warning('Please select "Panel"');
        valid = false;
        return valid;
      }
      if(this.isDocFieldDisable && !this.RadiologistID){
        this.toastr.warning('Please select "Radiologist"');
        valid = false;
        return valid;
      }

      if (this.homeSamplingEmpFieldShow && !this.selectedHomeSamplingEmp && !this.btnAndViewPermissions.hcBookingBtn) {
        this.toastr.warning('Please select "Home Sampling Employee"');
        valid = false;
        return valid;
      }

      if (!this.hideDiscountCardField && !this.selectedDiscountCard && this.selectedPatientType == 8) {
        this.toastr.warning('Please select "Discount Card"');
        valid = false;
        return valid;
      }

      const isCovidAntigen = this.getValidAddedTestsProfiles().filter(a => a.isCovidTestProfile).find(a => a.TPId == 2177);
      const isCovidPCR = this.getValidAddedTestsProfiles().filter(a => a.isCovidTestProfile).find(a => a.TPId == 2153);
      if ((this.getValidAddedTestsProfiles().find(a => a.isCovidTestProfile)) && !this.patientBasicInfoFormForCovidValid().valid) {
        // console.log('this.patientBasicInfoFormForCovidValid() ', this.patientBasicInfoFormForCovidValid());
        if (!this.isAirportLocation()) { //} && (isCovidAntigen || isCovidPCR)) {

          this.openPatientBasicInfoFormForCovidPopup();
          valid = false;
          return valid;
        }
      }
      if (this.isDengueTestSelected() && !this.patientBasicInfoFormForDengueValid().valid) {

        this.openPatientBasicInfoFormForDenguePopup();
        valid = false;
        return valid;
      }

      if (this.selectedPanel && (this.isAirline() || this.isEmbassy()) && !this.patientFlightDetailsValid().valid && !this.btnAndViewPermissions.hcBookingBtn) {
        this.openPatientFlightDetailsPopup();
        valid = false;
      }
      if (valid) {
        console.log(" this.discountPercentage", this.discountPercentage);
        if (
          this.patientBasicInfo.getRawValue().B2BDoc
          && (
            !this.selectedPatientType
            || this.selectedPatientType === 1
            || this.selectedPatientType < 2
            || this.selectedPatientType === 8)) {
          const dicsounts: number[] = [
            this.B2BDocList.find(a => a.B2BDoctorID == this.patientBasicInfo.getRawValue().B2BDoc).Discount || 0, // this.selectedB2BDoctor.Discount || 0
            (this.selectedDiscountCard?.DiscountInPercent || 0)
          ];
          const discountType = this.B2BDocList.find(a => a.B2BDoctorID == this.patientBasicInfo.getRawValue().B2BDoc).DiscountTypeID || 0;
          this.oldDiscountPercentage = this.discountPercentage;

          if (this.selectedOlaDiscount === null) {
            if (discountType === 1) {
              this.discountMaxValue = dicsounts.reduce((a, b) => { return Math.max(a, b) }, 0);
            }
            else {
              this.discountFieldDisabled = true;
              this.discountPercentage = dicsounts.reduce((a, b) => { return Math.max(a, b) }, 0);
            }
          }
          else {
            this.discountPercentage = this.selectedOlaDiscount
          }
          this.discountValueChanged();
        } else {
          this.oldDiscountPercentage = 0;

        }

        this.recalculateAmounts();
        this.allRemarks.InternalRemarks = this.patientBasicInfo.controls['InternalRemarks'].value || '';
        this.allRemarks.PatientComments = this.patientBasicInfo.controls['PatientComments'].value || '';
      }
      return valid;
    };

    const params = {
      UserID: this.loggedInUser.userid
    }

    this.lookupService.getUserProvince(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.provinceDB = resp.PayLoad[0].RegId;
      }
    }, (err) => { console.log(err) });
    // setTimeout(() => {
    //   this.openModal(this.patientBasicInfoForCovidPopup);
    // }, 2000);
    // this.selectedPatientType = 2


    // if (this.macAllowedForRegistration()) {
    //   alert("FOUND")
    //   return;
    // }
    // else {
    //   alert("Not FOUND")
    // }
    this.getCitiesList(168);
  }
  // Custom validator: at least one of the two should be filled
  pinOrCardValidator(control: AbstractControl): ValidationErrors | null {
    const pin = (control.get('PINCode')?.value || '').toString().trim();
    const card = (control.get('CardNo')?.value || '').toString().trim();

    if (!pin && !card) {
      return { pinOrCardRequired: true };
    }
    return null;
  }

  GetInsuarancePolicyBits() {
    this.shareSrv.getData(API_ROUTES.GET_INSUARANCE_BITS, {}).subscribe((resp: any) => {
      // console.log("resp", resp);
      this.isByPassInsuarancePolicy = Number(resp.PayLoadStr);
      // console.log("this.isByPassInsuarancePolicy ", this.isByPassInsuarancePolicy);

    }, (err => {
      console.log(err);
    }))
  }
  isRadiologyTest = false;
  GetARYPanelID() {
    this.shareSrv.getDataGET(API_ROUTES.ARY_PANEL_ID).subscribe((resp: any) => {
      // console.log("resp", resp);
      this.AryPanelid = Number(resp.PayLoadStr);
      // console.log("this.isByPassInsuarancePolicy ", this.isByPassInsuarancePolicy);

    }, (err => {
      console.log(err);
    }))
  }
  progress = 0;


  // Calculate the percentage for progress bar
  getProgressValue(): number {
    // Check if eligibility criteria are met

    if (this.patientVisitInfo.netAmount >= this.InsuarancePolicyDetail.ActiveOnPaidAmount) {
      this.isEligibleForInsurance = true; // Trigger animation and message
      this.isshowprogressbar = true;
    }
    else {
      this.isEligibleForInsurance = false; //false
      this.isshowprogressbar = false;
    }
    let progresval = Math.round((this.patientVisitInfo.netAmount / this.InsuarancePolicyDetail.ActiveOnPaidAmount) * 100)
    if (progresval >= 100) {
      progresval = 100
    }
    return progresval;
  }


  ngAfterViewInit() {
    // console.log('ngAfterViewInit');
    this.video = this.videoElement.nativeElement;
    const formVal = this.patientBasicInfo.value.dmy;
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
        dmy: _ageObj.years ? '3' : _ageObj.months ? '2' : _ageObj.days || formVal.dmy == 1 ? '1' : '3'
      });
    });
    /*
    this.patientBasicInfo.get('dmy').valueChanges.subscribe(val => {
      let _calculatedDob = this.calculateDOB(this.patientBasicInfo.value.Age, val);
      this.patientBasicInfo.patchValue({
        DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
      });
    });
    
    this.patientBasicInfo.get('Age').valueChanges.subscribe(val => {
      let _calculatedDob = this.calculateDOB(val, this.patientBasicInfo.value.dmy);
      this.patientBasicInfo.patchValue({
        DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
      });
    });
    */

    // this.patientBasicInfo.get('MobileNO').valueChanges.subscribe(val => {
    //   // if(val && val.length > 3) {
    //   //   this.getMobileOperatorByCode(val);
    //   // }
    // });

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
    // this.patientBasicInfo.get('Gender').valueChanges.subscribe(val => {
    //   let genderValue = val;
    //   let salutationValue = this.patientBasicInfo.value.Salutation;
    //   let salutationForGender = this.salutationsList.filter(a=>a.id==salutationValue).length ? this.salutationsList.filter(a=>a.id==salutationValue)[0].ForGender : 0;
    //   let requiredSalutationForGender = this.salutationsList.filter(a=>a.ForGender==genderValue).length ? this.salutationsList.filter(a=>a.ForGender==genderValue)[0].id : '';
    //   if(genderValue != salutationForGender && requiredSalutationForGender && genderValue && salutationValue == '') {
    //     setTimeout(() => {
    //       this.patientBasicInfo.patchValue({
    //         Salutation: requiredSalutationForGender
    //       });
    //     }, 500);
    //   }
    // });

    this.patientBasicInfo.controls['LastName'].clearValidators();
    if (this.isAirportLocation()) {
      this.hideOptionalFields = true;
      this.patientBasicInfo.patchValue({
        RefDoc: {
          Name: 'Self'
        }
      });
      this.patientBasicInfo.controls['LastName'].clearValidators();
      this.patientBasicInfo.controls['LastName'].updateValueAndValidity();
    }

    if (this.route.routeConfig.path == 'regForHS') {

      this.hideOptionalFields = true;
      if (this.urlBookingID) {
        this.pageTitle = 'Patient Reg. Home Smp' + '-' + this.urlBookingID || this.BookingNo;
      }
      else {
        this.pageTitle = 'Patient Reg. Home Smp';
      }
    }
  }
  getPanelIDForB2b() {

    const params = {}
    this.shareSrv.getData(API_ROUTES.PANEL_IDS_FOR_OLA_B2B, params).subscribe((resp: any) => {

      if (resp.StatusCode = 200) {
        this.OlaDocB2bPanelID = resp.PayLoadStr;
      }
    }, (err) => { console.log(err) })
  }
  getHospitalPatientByHospitalID(hospitalID: number, mobileNo: string, isopenSearchPatientform: any) {
    const params = {
      HospitalID: hospitalID,
      MobileNo: mobileNo
    }
    this.shareSrv.getData(API_ROUTES.GET_HOSPITAL_PATIENT_BY_HOSPITALID, params).subscribe({
      next: (resp: any) => {
        if (resp && resp.PayLoadStr && resp.StatusCode == 200) {
          const payloadArr = JSON.parse(resp.PayLoadStr);
          this.OlaDocPatients = payloadArr.Table ? JSON.parse(resp.PayLoadStr).Table : [];
          console.log("this.OlaDocPatients", this.OlaDocPatients);
          if (this.OlaDocPatients.length) {
            this.OlaDocPatientPopup();
          }
          else {
            if (isopenSearchPatientform === 1) {
              const form = this.patientBasicInfo.getRawValue();
              this.searchPatientByPhoneNo(form.MobileNO);
            }
          }
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => { }
    });
  }
  getMobileDeviceTokenByPatientID() {
    if (this.route.routeConfig.path == 'hc-booking') {
      return;
    }
    else {
      const params = {
        "PatientID": this.patientBasicInfo.value.PatientID
      }
      this.lookupService.getMobileDeviceTokensByPatientID(params).subscribe((resp: any) => {
        // console.log(resp);
        if (resp && resp.PayLoadDS && resp.StatusCode == 200) {
          this.MobDeviceNotificationsList = resp.PayLoadDS.Table;
          this.MobDeviceNotificationsList = [... new Set(this.MobDeviceNotificationsList)];
          // console.log(this.MobDeviceNotificationsList);
          // console.log("this.MobDeviceNotificationsList", this.MobDeviceNotificationsList);
          // this.MobDeviceNotificationsList = this.MobDeviceNotificationsList.reduce((unique, o) => {
          //   if (!unique.some(obj => obj.label === o.label && obj.value === o.value)) {
          //     unique.push(o);
          //   }
          //   return unique;
          // }, []);
          this.commaSepDeviceNames = this.MobDeviceNotificationsList.map(a => { return a.DeviceModel }).join(',');
          // console.log("MobDeviceNotificationsList dddd", this.MobDeviceNotificationsList);
        }
      }, (err) => {
        console.log("err", err);
        this.toastr.error("Something Went Wrong")
      })
    }
  }
  operatorPrefixes: Record<string, number> = {
    '0340': 1, '0341': 1, '0342': 1, '0343': 1, '0344': 1, '0345': 1, '0346': 1, '0347': 1, '0348': 1, '0349': 1, // Telenor
    // '0300': 2, '0301': 2, '0302': 2, '0303': 2, '0304': 2, '0305': 2, // Mobilink
    '0310': 3, '0311': 3, '0312': 3, '0313': 3, '0314': 3, '0315': 3, '0316': 3, '0317': 3, '0318': 3, '0319': 3,  // Zong
    '0320': 4, '0321': 4, '0322': 4, '0323': 4, '0324': 4, '0325': 4, '0326': 4, '0327': 4, '0328': 4, '0329': 4, // Warid
    // '0330': 5, '0331': 5, '0332': 5, '0333': 5, '0334': 5, // Ufone
    '0330': 5, '0331': 5, '0332': 5, '0333': 5, '0334': 5, '0335': 5, '0336': 5, '0337': 5, '0338': 5, // Ufone
    '0339': 6, // Onic
    '0355': 7, //SCOM
    '0300': 2, '0301': 2, '0302': 2, '0303': 2, '0304': 2, '0305': 2, '0306': 2, '0307': 2, '0308': 2, '0309': 2 //jazz + mobilink
  };
  MobileChange(MobileNO) {
    const form = this.patientBasicInfo.getRawValue();

    const firstFourDigits = form.MobileNO.substring(0, 4);
    const operatorID = this.operatorPrefixes[firstFourDigits];

    if (operatorID) {
      this.patientBasicInfo.patchValue({
        MobileOperatorID: operatorID
      });
    } else {
      this.patientBasicInfo.patchValue({
        MobileOperatorID: ''
      });
    }
    // !this.OrbitPatientID && 
    if (form.MobileNO != '03111000432' && form.PhoneNO != '03111000432')
      if (form.MobileNO.length > 10) {
        if (this.OlaDocB2bPanelID != "") {
          this.getHospitalPatientByHospitalID(3, form.MobileNO, 0);
        }

        setTimeout(() => {
          this.searchPatientByPhoneNo(form.MobileNO);
        }, 1000);
      }
    if (form.WhatsAppNo === form.PhoneNO && form.PhoneNO && form.WhatsAppNo) {
      this.patientBasicInfo.patchValue({
        isWhatsapNumber: 1
      })
    }
    else {
      this.patientBasicInfo.patchValue({
        isWhatsapNumber: 0
      })
    }
  }
  checkFirstName(patientBasicInfo) {

    if (patientBasicInfo == '') {
      this.patientBasicInfo.patchValue({
        FirstName: 'Muhammad'
      });
      this.FirstNameWarTxt = "";
    }
    else {
      const val = patientBasicInfo.controls.FirstName.value;
      const lowerVal = val.toLowerCase();
      const invalidNames = ['muhammad', 'mehammad', 'mohammad', 'mohammad', 'muhamad', 'muhmmad', 'muhammad', 'muhamad', 'mohd'];
      if (invalidNames.includes(lowerVal)) {
        this.FirstNameWarTxt = "Write Forcefully";
        console.log("patientBasicInfo", patientBasicInfo.controls.FirstName.value);
        this.patientBasicInfo.patchValue({
          FirstName: 'M.'
        });
      }
    }
  }

  personalRelation() {
    this.lookupService.getPersonalRelation().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.personalRelations = resp.PayLoad;
        // console.log(" this.personalRelations", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }
  getdistricts() {

    this.districts = [];
    this.lookupService.getdistricts().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.districts = resp.PayLoad;
        // console.log(" this.districts", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }
  getPerdistricts() {

    this.perDisricts = [];
    this.lookupService.getdistricts().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.perDisricts = resp.PayLoad;
        // console.log(" this.districts", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }
  getTehsils() {

    this.tehsils = [];
    this.lookupService.getTehsils().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.tehsils = resp.PayLoad;
        // console.log(" this.districts", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }
  getPerTehsils() {

    this.pertehsilsList = [];
    this.lookupService.getTehsils().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.pertehsilsList = resp.PayLoad;

      }
    }, (err) => { console.log(err) })
  }
  getTehsilsByDistrictID() {
    this.tehsils = [];
    const val = this.patientBasicInfoFormForDengue.getRawValue();
    const params = {
      "DistrictID": val.DistrictID
    }
    this.lookupService.getTehsilsByDistrictID(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.tehsils = resp.PayLoad;
        // console.log(" this.districts", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }
  getTehsilsByPerDistrictID() {
    this.pertehsilsList = [];
    const val = this.patientBasicInfoFormForDengue.getRawValue();
    const params = {
      "DistrictID": val.Per_DistrictID
    }
    this.lookupService.getTehsilsByDistrictID(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.pertehsilsList = resp.PayLoad;
        // console.log(" this.districts", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }
  getProvinces() {
    this.lookupService.getProvinces().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.provinces = resp.PayLoad;
        // console.log(" this.districts", this.personalRelations);
      }
    }, (err) => { console.log(err) })
  }

  branches() {
    this.shareSrv.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  getmsjForAssociatedTP() {
    this.tpService.getMsjForAssocitedTP().subscribe((resp: any) => {
      // console.log("resp", resp);
      this.alertMesForAssociatedTP = resp.Message;
      this.alertMesForAssociatedTPurdu = resp.Message2;

    }, (err) => { console.log("err", err) })
  }
  CheckHCTime(event) {
    const SelHCDateTime = this.HCDateTime.year + "-" + this.HCDateTime.month + "-" + this.HCDateTime.day; + ' ' + this.HCtime.hour + ':' + this.HCtime.minute;
    const outputDate = new Date(SelHCDateTime);
    console.log("outputDate", outputDate);
    event.hour || this.HCtime.hour ? outputDate.setHours(event.hour || this.HCtime.hour) : '';
    event.minute || this.HCtime.minute ? outputDate.setMinutes(event.minute || this.HCtime.minute) : '';
    event.second || this.HCtime.second ? outputDate.setSeconds(event.second || this.HCtime.second) : '';


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
    // this.RiderScheduleData = this.RiderScheduleData.filter(a => { console.log(new Date(a.HCDateTime).getDate()); return new Date(a.HCDateTime).getDate() == new Date(outputDate).getDate() });
    const sametimeExist = this.RiderScheduleData.filter(a => { return new Date(a.HCDateTime).getTime() == outputDate.getTime() });
    if (sametimeExist.length) {
      this.toastr.warning("Booking With Same Date Time Already Exist");
    }

    console.log("outputDate", outputDate);
  }
  CheckButtonAndViewControlsPermissions() {

    if (this.route.routeConfig.path == 'reg') {
      this.btnAndViewPermissions.patientRegBtn = true;
      this.btnAndViewPermissions.hcBookingBtn = false;
      this.btnAndViewPermissions.hcBookingPaymentView = false;
      this.btnAndViewPermissions.patRegPaymentView = true;
      this.btnAndViewPermissions.hcGoogleMaps = false;
    }
    else if (this.route.routeConfig.path == 'regForHS') {
      this.btnAndViewPermissions.patientRegBtn = true;
      this.btnAndViewPermissions.hcBookingBtn = false;
      this.btnAndViewPermissions.hcBookingPaymentView = false;
      this.btnAndViewPermissions.patRegPaymentView = true;
      this.btnAndViewPermissions.hcGoogleMaps = false;
    }
    else if (this.route.routeConfig.path == 'hc-booking') {
      this.commaSepDeviceNames = "";
      this.MobDeviceNotificationsList = [];
      this.btnAndViewPermissions.patientRegBtn = false;
      this.btnAndViewPermissions.hcBookingBtn = true;
      this.btnAndViewPermissions.hcBookingPaymentView = true;
      this.btnAndViewPermissions.patRegPaymentView = false;
      this.btnAndViewPermissions.hcGoogleMaps = true;
    }
  }
  currentRoutePatch = null;
  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    // this.screenPermissions = (this.storageService.getLoggedInUserProfilePermissions(_activatedroute) || []); // .filter(a=>a.state == _activatedroute);
    // this.screenPermissions.forEach(a=>{
    //   this.screenPermissionsObj[a.key] = a.key;
    // }) //hc-booking // screenPermissionsObj.drafted_booking
    this.currentRoutePatch = this.route.routeConfig.path
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    // console.log(this.screenPermissionsObj);
    this.reApplyPermissions();
  }
  reApplyPermissions() {

    if (!this.screenPermissionsObj.update_patient && this.patientBasicInfo.value.PatientID) {


      this.disablePatientBasicInfoFields(true);
      if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {
        this.controlFieldsForEmployee(true);
      }
    }
    else if (this.patientBasicInfo.value.PatientID && this.route.routeConfig.path == 'regForHS') {
      this.disablePatientBasicInfoFields(true);
    }

    else {
      if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {
        this.controlFieldsForEmployee(true);
      } else {
        this.disablePatientBasicInfoFields(false);
      }
    }

    if (!this.screenPermissionsObj.update_patient_phone && this.patientBasicInfo.value.PatientID) {
      this.patientBasicInfo.controls["MobileNO"].disable();
      this.patientBasicInfo.controls["MobileOperatorID"].disable();
      this.patientBasicInfo.controls["WhatsapNo"].disable();
      this.patientBasicInfo.controls["PhoneNO"].disable();
      this.patientBasicInfo.controls["Emails"].disable();
    }
    else {
      this.patientBasicInfo.controls["MobileNO"].enable();
      this.patientBasicInfo.controls["MobileOperatorID"].enable();
      this.patientBasicInfo.controls["WhatsapNo"].enable();
      this.patientBasicInfo.controls["PhoneNO"].enable();
      this.patientBasicInfo.controls["Emails"].enable();
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
  captureDocument() {
    const context = this.canvas.nativeElement.getContext("2d").drawImage(this.video, 0, 0, this.videoDimensions.width, this.videoDimensions.height);
    const imageURL = this.canvas.nativeElement.toDataURL("image/png");
    const _fileName = 'capture_' + +new Date();
    const _fileObject = {
      uniqueIdentifier: (+new Date()),
      fileName: _fileName,
      fileType: 'image/png',
      data: imageURL,
      sanitizedData: this.sanitizer.bypassSecurityTrustResourceUrl(imageURL),
      thumbnail: imageURL,
    };
    this.resizeImage('', this.resizeFileSize.thumbnail.width, this.resizeFileSize.thumbnail.height, 0, '', imageURL).then((res: string) => {
      _fileObject.thumbnail = res;
      this.visitAttachments.push(_fileObject);
      console.log(_fileObject);
    }, (err) => {
      this.toastr.warning('Invalid image captured');
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
    this._isAirportLocation = this.isAirportLocation(this.loggedInUser.locationid);
    // console.log(this.loggedInUser);
    this.getMACAddress(this.loggedInUser);
    // this.getSystemInformation(this.loggedInUser);

  }

  createVisit() {
    if (!this.macAllowedForRegistration()) {
      return;
    }
    if (!this.isOrderRegForECLAllowed) {
      this.toastr.error("This order is already registered, Please contact admin");
      return;
    }

    const hasMode6 = this.addedPaymentModes?.some(x => x.ModeId === 6);
    if (hasMode6 && !this.verifyRAASTSuccess) {
      this.toastr.warning(
        "Online payment transaction has not been verified yet. Please verify the transaction to proceed."
      );
      return;
    }
    this.paymentInforFormSubmitted = true;
    const data = this.getFinalDataSet();
    const paymentFormValidity: any = this.isPaymentFieldsValid();
    // console.log(paymentFormValidity);
    console.log("discount:", this.discountPercentage);
    if (!paymentFormValidity.valid) {
      this.toastr.warning(paymentFormValidity.message);
      return;
    }

    const intRemarksLen = (this.allRemarks.InternalRemarks || '').trim().length;
    if (
      ((this.discountPercentage && !this.discountFieldDisabled)
        || this.parseNumbericValues(this.patientVisitInfo.netAmount) - this.parseNumbericValues(this.getTotal(this.addedPaymentModes, 'amount')))
      && intRemarksLen < 10
    ) {
      this.toastr.warning('Please enter remarks (minimum 10 characters)');
      this.allRemarks.InternalRemarksClass = 'invalid invalid-highlighted';
      return;
    } else {
      this.allRemarks.InternalRemarksClass = '';
    }

    const fbrRequestData: any = this.formatDataForFBR(data);


    data.testProfile.forEach(a => {
      const t = fbrRequestData.Items.find(b => b.ItemCode == a.TPId);
      if (t) {
        a.TaxRateFBR = t.TaxRate;
        a.SaleValueFBR = t.SaleValue;
        a.DiscountFBR = t.Discount;
        a.TaxChargedFBR = t.TaxCharged;
        a.TotalAmountFBR = t.TotalAmount;
      }
    })

   if (hasMode6) {
      this.InsertOnlinePaymentQrCodeCredentials();
      this.InsertOnlinePaymenVerificationCredentials();
    }
    // data.FBRInvoiceNo = '';
    data.FBRRequestData = fbrRequestData; //JSON.stringify(fbrRequestData);
    this.createVisitPost(data);
    /*
    this.fbr.getFbrInvoiceNo(fbrRequestData).subscribe((res:any) => {
      this.spinner.hide();
      this.toastr.success('FBR Invoice number generated', 'FBR');
      // res = {
      //   "InvoiceNumber": "966130BAYS37107326*test*",
      //   "Code": "100",
      //   "Response": "Fiscal Invoice Number generated successfully.",
      //   "Errors": null
      // }
  
      data.FBRInvoiceNo = res.InvoiceNumber || '';
      data.FBRRequestData = JSON.stringify(fbrRequestData);
      if(res && res.InvoiceNumber) {
        this.createVisitPost(data);
      } else {
        this.toastr.error('FBR Invoice No not generated', 'FBR');
      }
      console.log(res);
    }, (err:any) => {
      this.spinner.hide();
      this.toastr.error('Error generation FBR Invoice No', 'FBR');
    })*/


  }
  createVisitPost(data) {
    const IsPrintMOConsent = this.selectedTestProfiles.filter(a => { return a.IsPrintMOConsent === true });

    const patientVisitInvoiceWinRef: any = this.openInvoiceWindow();
    const patientRisMOConsentWinRef: any = null;
    // if (ismoallowed.length)
    //   patientRisMOConsentWinRef = this.openRisMOConsentWindow();
    // patientVisitInvoiceWinRef.location = ''; // fix for iOS devices // https://stackoverflow.com/a/39387533 // window.open(url, '_blank'); not working on iMac/Safari
    this.spinner.show();

    this.visitService.createVisit(data).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length && res.PayLoad[0].Result == 1) {
        this.toastr.success('Success, Registration complete');
        // this.toastr.success('Success, Registration complete.<br> Click to copy <br> <b>'+res.PayLoad[0].VisitID+"</b>", '', {enableHtml: true, timeOut: 5000, tapToDismiss: false}).onTap
        // .pipe(take(1))
        // .subscribe((a) => {
        //   this.helperSrv.copyMessage(res.PayLoad[0].VisitID)
        // });

        this.saveQManagementTokenWithVisit(res.PayLoad[0].VisitID);
        // this.resetAllForm_CompleteRegistration();
        // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: res.payLoad[0].visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
        // window.open(url.toString(), '_blank');
        /*
        if(this.isAirportLocation()) {
          this.printBarcode(res.PayLoad[0].VisitID);
        }
        */

        patientVisitInvoiceWinRef.location = this.getPatientVisitInvoiceUrl(res.PayLoad[0].VisitID, res.PayLoad[0].PatientID, IsPrintMOConsent.length);

        // if (ismoallowed.length)
        //   patientRisMOConsentWinRef.location = this.getPatientRisMOConsentUrl(res.PayLoad[0].VisitID);
        // this.openInvoice(res.PayLoad[0].VisitID);

        //this.updateUrlParams_navigateTo(['invoice/patient-visit-invoice'], {p: btoa(JSON.stringify({visitID: 28, loginName: "idc", timeStemp: +new Date()}))}, {replaceUrl: false, target: '_blank'});
        setTimeout(() => {
          this.cancelPatientInfoForm(); // navigate to Search Patient
        }, 1000);
      }
      else if (res && res.StatusCode == 502) {
        this.toastr.error(res.Message);
        this.closeInvoiceWindow(patientVisitInvoiceWinRef);
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


  private ensureCheckoutReady(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof Checkout !== 'undefined') {
        resolve();
      } else {
        const interval = setInterval(() => {
          if (typeof Checkout !== 'undefined') {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      }
    });
  }
  pay() {
    const sessionId = "SESSION0002658912408H2933561J14" //res?.sessionId;
    if (typeof Checkout === 'undefined') {
      alert('Mastercard Checkout not loaded');
      return;
    }
    if (!sessionId) {
      console.error("No sessionId returned from API");
      return;
    }

    console.log("Session ID:", sessionId);
    console.log("Checkout ID:", Checkout);

    // Configure Checkout
    (window as any).Checkout.configure({
      session: { id: sessionId }
    });

    // Open Payment Page (full redirect)
    // (window as any).Checkout.showEmbededPage();
    (window as any).Checkout.showEmbeddedPage('#embed-target');

    //     this.shareSrv.getData(API_ROUTES.CREATE_SESSION_MCB, '').subscribe({
    //       next: (res: any) => {
    //         const sessionId = "SESSION0002567635186I3398281F15" //res?.sessionId;
    // // CRITICAL: Ensure Checkout is ready
    //         if (typeof Checkout === 'undefined') {
    //           alert('Mastercard Checkout not loaded');
    //           return;
    //         }
    //         if (!sessionId) {
    //           console.error("No sessionId returned from API");
    //           return;
    //         }

    //         console.log("Session ID:", sessionId);
    //         console.log("Checkout ID:", Checkout);

    //         // Configure Checkout
    //         (window as any).Checkout.configure({
    //           session: { id: sessionId }
    //         });

    //         // Open Payment Page (full redirect)
    //         (window as any).Checkout.showPaymentPage();
    //       },
    //       error: (err) => {
    //         console.error("Failed to create session:", err);
    //         alert("Payment session failed. Please try again.");
    //       }
    //     });
  }

  copymobileText(): void {
    const mobileNumber = this.patientBasicInfo.get('MobileNO')?.value;

    if (mobileNumber) {
      // Patch the MobileNO value into the WhatsapNo field
      this.patientBasicInfo.patchValue({
        WhatsapNo: mobileNumber
      });
    } else {
      console.error("Mobile number is empty or invalid.");
    }
  }
  BookingStatusID = null;
  DraftHCBooking(BookingStatus) {
    this.BookingStatusID = BookingStatus;
    setTimeout(() => {
      this.HCBooking();
    }, 2000)
  }


  HCBooking() {
    if (this.HCDateTime && this.HCtime && this.patLocationForHC.position.lat() && this.patLocationForHC.position.lng()) {
      if (this.hcBookingSourceID) {
        if (this.hcCityID) {
          this.HCCityClass = '';
          if (!this.InvalidHCTime) {
            if (this.discountPercentage && !this.selectedApprovAuth) {
              this.toastr.warning("Please Select Approving Authority");
            }
            else {
              const params = this.getHCBookingFinalDataSet();
              this.spinner.show();
              this.hcService.bookHcPatient(params).subscribe((resp: any) => {
                this.spinner.hide();
                // console.log(resp);
                if (resp.statusCode == 200) {
                  this.PatientBookingSuccessMsg = resp.message;
                  this.toastr.success(resp.message);
                  // this.cancelPatientInfoForm();
                  this.cd.detectChanges();
                  this.appPopupService.openModal(this.BookingSuccessPopup, { size: 'sm' });
                }
                else {
                  let apiErrorMsg = "";
                  if (resp && resp.Error) {
                    apiErrorMsg = resp.Error;
                  }
                  this.toastr.error('Error, Error Booking. ' + apiErrorMsg);
                }
                setTimeout(() => {
                  // this.cancelPatientInfoForm(); // navigate to Search Patient
                }, 1000);
              }, (err) => {
                this.toastr.error('Error HC Booking.');
                console.log(err);
                this.spinner.hide();
              })
            }

          } else {
            this.toastr.error("Please Select Available Data And Time")
          }


        }
        else {
          this.HCCityClass = 'invalid invalid-highlighted';
          this.toastr.warning("Please Select Home Collection City");
        }
      }
      else {
        this.HCBookingSourceClass = 'invalid invalid-highlighted';
        this.toastr.warning("Please Select Home Collection Booking Source");
      }
    }
    else {
      this.toastr.warning("Please Provide Date And Time For Home Collection");
    }
  }
  saveQManagementTokenWithVisit(visitId) {
    visitId = (visitId || '').toString().replaceAll('-', '');
    const params = {
      visitId: visitId,
      tokenId: this.getParseQMgmtTokenForSaving(), // getParseQMgmtToken(),
      userId: this.loggedInUser.userid
    }
    if (!params.visitId || !params.tokenId) {
      return;
    }
    // this.spinner.show();
    this.qMgmtService.saveQManagementTokenWithVisit(params).subscribe((res: any) => {
      this.removeQMgmtToken();
      // this.spinner.hide();
    }, (err) => {
      this.removeQMgmtToken();
      // this.spinner.hide();
    })
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
    // const url = this.getPatientVisitInvoiceUrl(visitId); // environment.patientReportsPortalUrl + 'pat-reg-inv?p='+ btoa(JSON.stringify({visitID: visitId, loginName: this.loggedInUser.username, appName: 'WebMedicubes:pat_reg', copyType: (this.invoiceCopyType) || 0, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
    return patientVisitInvoiceWinRef;
  }
  openRisMOConsentWindow() {
    const patientMOConsentWinRef = window.open('', '_blank', 'width=900;height=100;');
    patientMOConsentWinRef.opener = null;
    // create a new div element
    const heading = document.createElement("h1");
    // and give it some content
    const message = document.createTextNode("Loading Consent...");
    // add the text node to the newly created div
    heading.appendChild(message);
    patientMOConsentWinRef.document.body.append(heading);
    // const url = this.getPatientVisitInvoiceUrl(visitId); // environment.patientReportsPortalUrl + 'pat-reg-inv?p='+ btoa(JSON.stringify({visitID: visitId, loginName: this.loggedInUser.username, appName: 'WebMedicubes:pat_reg', copyType: (this.invoiceCopyType) || 0, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
    return patientMOConsentWinRef;
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
  visitSelectedForDocs(visit) {
    this.selectedRecentVisit = null;
    this.selectedRecentVisit = visit;
    if (!this.selectedRecentVisit.VisitID) {
      return;
    }
    setTimeout(() => {
      this.patientVisitDocsPopupRef = this.appPopupService.openModal(this.patientVisitDocsPopup, { size: 'lg' });
    }, 100);
  }


  closeInvoiceWindow(winRef) {
    if (winRef) {
      winRef.close();
    }
  }
  getPatientVisitInvoiceUrl(visitId, PatientId, IsPrintMOConsent) {
    // const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visitId, loginName: this.loggedInUser.username, IsPrintMOConsent: IsPrintMOConsent, appName: 'WebMedicubes:pat_reg', copyType: (this.invoiceCopyType) || 0, timeStemp: +new Date() }));
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({
      visitID: visitId,
      PatientID: PatientId,
      loginName: this.loggedInUser.username,
      IsPrintMOConsent: IsPrintMOConsent,
      appName: 'WebMedicubes:pat_reg',
      copyType: (this.invoiceCopyType) || 0,
      isPatientWilling: this.isPatientWilling == "true" ? 1 : 0,
      timeStemp: +new Date()
    }));
    return url;
  }
  getPatientRisMOConsentUrl(visitId) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ isConsentOnly: true }));
    return url;
  }
  HomeAddressChange(screen) {

    switch (screen) {
      case 1:
        this.HomeAddress = this.patientBasicInfo.controls['HomeAddress'].value || '';
        break;
      case 2:
        this.patientBasicInfo.patchValue({
          HomeAddress: this.HomeAddress || ''
        });
        break;
    }
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
        // try {
        //   _responsees = JSON.parse(_responsees);
        // } catch (ex) {}
        //_responsees.Table  = Countries
        //_responsees.Table1 = Cities
        //_responsees.Table2 = MaritalStatus
        //_responsees.Table3 = MobileOperator
        //_responsees.Table4 = Salutations
        //_responsees.Table5 = PaymentMode
        //_responsees.Table6 = PatientType
        //_responsees.Table7 = LabTestProcess
        //_responsees.Table8 = minimumReceivablePercentage

        this.countriesList = _responsees.Table || [];
        this.citiesList = _responsees.Table1 || [];
        this.maritalStatusList = _responsees.Table2 || [];
        this.mobileOperatorList = _responsees.Table3 || [];
        // console.log("mobileOperatorListmobileOperatorListmobileOperatorListmobileOperatorListmobileOperatorListmobileOperatorList", this.mobileOperatorList)
        this.salutationsList = _responsees.Table4 || [];
        //this.paymentModesList = _responsees.Table5 || []; // this.paymentModesList = this.paymentModesList.filter(a => a.ModeId != 5); this.selectedPaymentModeToAdd = this.paymentModesList.length ? this.paymentModesList[0] : {}; // this.addedPaymentModes.push(this.selectedPaymentModeToAdd);       
        // this.paymentModesList = [{ModeId: 2, Title: "Credit Card"}, {ModeId: 3, Title: "Cheque"}, {ModeId: 4, Title: "Demand Draft"}]; this.selectedPaymentModeToAdd = this.paymentModesList.length ? this.paymentModesList[0] : {};
        const notAllowedPatientTypes = [6];
        if (!this.route.snapshot.queryParams.p) {
          notAllowedPatientTypes.push(8);
        }
        this.patientTypeList = _responsees.Table6 || [];
        // environment.production ? 
        this.patientTypeList.forEach(a => { if (notAllowedPatientTypes.includes(a.TypeId)) { a.disabled = true } });
        //  : '';
        this.labTestProcessList = _responsees.Table7 || [];
        this.paymentModesCategoryList = _responsees.Table9 || [];
        if (_responsees.Table8 && _responsees.Table8.length && _responsees.Table8[0].MinReceivablePercent) {
          this.minimumReceivablePercentage.temp = _responsees.Table8[0].MinReceivablePercent;
          this.minimumReceivablePercentage.dynamic = _responsees.Table8[0].MinReceivablePercent;
        }

        if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {
          this.controlFieldsForEmployee(true);
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
    if (!this.isAirportLocation()) {
      return;
    }

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
        // let maleIds = [1];
        // let femaleIds = [2,3,4];
        //   this.salutationsList.forEach( a => {
        //   a['forGender'] = maleIds.includes(a.SalutationTitle) ? 1 : femaleIds.includes(a.SalutationTitle) ? 2 : 0;
        // });
        // console.log(this.salutationsList);
        // this.salutationsList = [
        //   {id: 1, name: 'Mr.' , forGender: 1},
        //   {id: 2, name: 'Miss.' , forGender: 2},
        //   {id: 3, name: 'Mrs.' , forGender: 2},
        //   {id: 4, name: 'Ms.' , forGender: 2},
        //   {id: 5, name: 'Dr.' , forGender: 0},
        //   {id: 6, name: 'Prof.' , forGender: 0},
        //   {id: 7, name: 'F/O.' , forGender: 0},
        //   {id: 8, name: 'M/O.' , forGender: 0},
        //   {id: 9, name: 'S/O.' , forGender: 0},
        //   {id: 10, name: 'D/O.' , forGender: 0},
        //   {id: 11, name: 'Baby.' , forGender: 0},
        //   {id: 12, name: 'Baby Of.' , forGender: 0},
        //   {id: 13, name: 'C/O.' , forGender: 0}
        // ];
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
    // this.bloodGroupList = [
    //   {id: 'A•Positive', title: 'A+'},
    //   {id: 'O•Positive', title: 'O+'},
    //   {id: 'B•Positive', title: 'B+'},
    //   {id: 'AB•Positive', title: 'AB+'},
    //   {id: 'A•Negative', title: 'A-'},
    //   {id: 'O•Negative', title: 'O-'},
    //   {id: 'B•Negative', title: 'B-'},
    //   {id: 'AB•Negative', title: 'AB-'},
    // ];
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
  getTestProfileList(tpname) {
    this.testProfileList = [];
    const _params = {
      tpids: null,
      code: (this.searchByCodeNameRadio == 'code' ? tpname : null),
      desc: (this.searchByCodeNameRadio == 'name' ? tpname : null),
      branchId: this.loggedInUser.locationid,
      panelId: this.selectedPatientType !== 5 ? (this.selectedPanel || '') : '' // this.selectedPanel ? this.selectedPanel.PanelId : '' //this.patientBasicInfo.value.corporateClientID || '',
    }
    if (!this.loggedInUser.locationid) {
      this.toastr.warning('Branch ID not found');
      return;
    }

    this.spinner.show(this.spinnerRefs.testProfilesDropdown);
    this.tpService.getTestsByName(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.testProfilesDropdown);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        // console.log(data, "data");
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        if (data.length) {
          data.forEach(element => {
            element.TestProfileCodeDesc = `${element.TestProfileCode} - ${element.TestProfileName} (${element.TestProfilePrice})`;
          });
        }
        this.testProfileList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.testProfilesDropdown);
      console.log(err);
    });
  }
  getRefByDoctors() {
    this.refByDocList = [{ Name: 'Self', QRCodeNumber :''  }];
    const _params = {};
    this.spinner.show(this.spinnerRefs.refByDocField);
    this.lookupService.getRefByDoctors(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.refByDocField);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.refByDocList = data || [{ Name: 'Self', QRCodeNumber :''  }];

        // console.log("this.refByDocList", this.refByDocList);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.refByDocField);
      console.log(err);
    });
  }
  refByDocSelected(e) {
    // if(e?.item?.RefId)
    this.RefByDocID = e?.item?.RefId
    if (this.RefByDocID) {
      this.isRefDocSelected = true; // disable checkbox
    }
    if (!this.OlaHospitalOrderNo) //because in case of olaDoc Patient we hthsiave to append specific id
      this.getRefByB2bDoctorsMapping(e?.item?.RefId, null);
    console.log("selectedB2BDoctor", this.selectedB2BDoctor)
    // this.discountPercentage = //this.;
    // this.discountPercentage =   this.selectedB2BDoctor && this.selectedB2BDoctor.length? this.selectedB2BDoctor[0].Discount : this.selectedPatientType == 6? 100:0;
    this.discountPercentage = this.selectedPatientType == 6 ? 100 : this.selectedB2BDoctor && this.selectedB2BDoctor.length ? this.selectedB2BDoctor[0].Discount : 0;
    if (this.selectedPatientSource >= 30 && this.selectedPatientSource < 40) {

    }
    else {
      this.patientTypeChanged({ TypeId: this.selectedPatientType });
    }
  }
  getB2BDoctors(b2bDoctorID = 0) {
    // console.log('b2bDoctorID ', b2bDoctorID);
    this.B2BDocList = [];
    this.patientBasicInfo.patchValue({
      B2BDoc: 0
    });
    this.selectedB2BDoctor = null;
    const _params = {
      // B2BDoctorID: b2bDoctorID
    };
    this.spinner.show(this.spinnerRefs.B2BDocField);
    this.lookupService.getB2BDoctors(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.B2BDocField);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.B2BDocList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.B2BDocField);
      console.log(err);
    });
  }

  // This method is used to get the mapping of Referring Doctors based on selected B2B Doctor and Referring Doctor. It will help in auto-selecting the B2B Doctor when a Referring Doctor is selected and vice versa. Additionally, it will also auto-select the patient type and panel based on the B2B Doctor mapping, which is crucial for ensuring that the correct patient type and panel are selected for the visit, especially when there are specific requirements for certain patient types (e.g., patient type 6). 11-FEB-2026

  getRefByB2bDoctorsMapping(refId, b2bDocID) {
    if (b2bDocID || refId) {
      const _params = {
        refId: refId,
        B2BDoctorID: b2bDocID
      };
      // this.patientBasicInfo.patchValue({
      //   B2BDoc: 0
      // });
      if (refId !== null) {
        this.selectedB2BDoctor = null;
        this.patientBasicInfo.patchValue({
          B2BDoc: 0
        });
      }
      // if (!refId) {
      //   return;
      // }
      this.selectedB2BDoctor = { B2BDocName: 'loading...' }
      this.spinner.show(this.spinnerRefs.B2BDocField);
      this.doctorService.getRefByB2BDoctorsMapping(_params).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.B2BDocField);

        this.selectedB2BDoctor = null;
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;

          if (refId !== null) {
            try {
              data = JSON.parse(data);
            } catch (ex) { }
            console.log(data);
            data = data || [];
            if (data.length) {
              this.patientBasicInfo.patchValue({
                B2BDoc: data[0].B2BDoctorID
              });
              this.selectedB2BDoctor = data[0];
            }
          }
          else {
            this.refByDocList = [{ Name: 'Self', QRCodeNumber :''  }];
            // this.refByDocList = data; 
            data.map(a => {
              const aa = { "Name": a.RefByDocName, "RefId": a.RefId, "QRCodeNumber": a.QRCodeNumber || '' }
              this.refByDocList.push(aa);
            })
            console.log("refByDocListrefByDocListrefByDocListrefByDocList", this.refByDocList);
          }

        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.B2BDocField);
        this.patientBasicInfo.patchValue({
          B2BDoc: 0
        });
        this.selectedB2BDoctor = null;
        console.log(err);
      });
    }
  }

  getPanels() {
    this.panelsList = [];
    this.mainPanelsList = [];
    const _params = {
      branchId: !this.btnAndViewPermissions.hcBookingBtn ? this.loggedInUser.locationid : null
    }
    if (!this.loggedInUser.locationid) {
      this.toastr.warning('Branch ID not found');
      return;
    }
    this.spinner.show(this.spinnerRefs.panelsDropdown);
    this.lookupService.getPanels(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.panelsDropdown);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.mainPanelsList = data || [];
        this.panelsList = data || [];
        if (this.panelIdFromBookingId || this.panelIdFromVisitInfo) {
          this.convertSelectedTestProfiles({ PanelId: this.panelIdFromBookingId || this.panelIdFromVisitInfo });
        }
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.panelsDropdown);
      console.log(err);
    });
  }
  getApprovingAuthoritiesByDiscount() {
    try {
      const dis = Number(this.discountPercentage);
      if (dis > this.discountMaxValue) {
        this.discountPercentage = this.discountMaxValue;
      }
    } catch (e) { }
    this.discountApprovingAuthorityList = [];
    if (!this.discountPercentage)
      this.selectedApprovAuth = 0;
    const _params = {
      discountPercentage: this.discountPercentage || ''
    }
    this.lookupService.getApprovingAuthoritiesByDiscount(_params).subscribe((res: any) => {
      if (!this.discountPercentage)
        this.selectedApprovAuth = 0;
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.discountApprovingAuthorityList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }
  getEmployeesForHomeSampling() {

    this.homeSamplingEmpList = [];
    this.selectedHomeSamplingEmp = null;
    this.spinner.show(this.spinnerRefs.homeSamplingEmp);
    this.lookupService.getEmployeesForHomeSampling({}).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.homeSamplingEmp);
      this.selectedHomeSamplingEmp = null;
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.homeSamplingEmpList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.homeSamplingEmp);
      console.log(err);
    });
  }
  getEmployeesForTestRegistration() {
    this.employeesList = [];
    this.employeeDependentsList = [];
    this.spinner.show(this.spinnerRefs.searchEmployee);
    // this.lookupService.getEmployeesForTestRegistration({}).subscribe((res: any) => {
    this.lookupService.GetEmployeesForTestApproval({}).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchEmployee);
      if (res && res.StatusCode == 200 && res.PayLoadDS) {
        let data = res.PayLoadDS.Table;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.employeesList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.searchEmployee);
      console.log(err);
    });
  }
  getEmployeeDetailsAndDependents(event) {
    this.employeeDependentsList = [];
    if (!event) {
      return;
    }
    this.spinner.show(this.spinnerRefs.searchEmployee);
    const params = {
      PatientId: event.PatientId || null
    };
    this.lookupService.GetFreeTestApprovalDependents(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchEmployee);
      if (res && res.StatusCode == 200 && res.PayLoadDS) {
        let data = res.PayLoadDS;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.employeeDependentsList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.searchEmployee);
      console.log(err);
    });
  }
  getAirlines() {
    this.airlinesList = [];
    const params = {
      panelId: this.selectedPanel || ''
    };
    this.lookupService.getAirlines(params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.airlinesList = data || [];
      }
    }, (err) => {
      // this.spinner.hide();
      console.log(err);
    });
  }
  getAirports() {
    this.airportsList = [];
    const params = {};
    this.lookupService.getAirports(params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.airportsList = data || [];
      }
    }, (err) => {
      // this.spinner.hide();
      console.log(err);
    });
  }
  getVaccines() {
    this.vaccinesList = [];
    const params = {};
    this.lookupService.getVaccines(params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.vaccinesList = data || [];
      }
    }, (err) => {
      // this.spinner.hide();
      console.log(err);
    });
  }
  getDiscountCardsByPatient(patientId) {
    this.discountCardsList = [];
    this.selectedDiscountCard = null;
    if (!patientId) {
      return;
    }
    const params = {
      patientId: patientId // this.patientBasicInfo.get('PatientID').value;
    }
    this.spinner.show(this.spinnerRefs.discountCards);
    this.lookupService.getDiscountCardsByPatientId(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.discountCardsList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.discountCards);
      console.log(err);
    });
  }
  /* end -lookups */
  getDosageList() {
    const vaccID = this.patientVaccineDetails.value.VaccineID;
    console.log(vaccID);
    const objSelectedVacc = this.vaccinesList.find(o => o.VaccineID === vaccID);
    if (objSelectedVacc) {
      const vaccDosageReq = objSelectedVacc.DoseRequired;
      if (vaccDosageReq === 2) {
        this.vaccinesDosageList = [{ id: 1, name: 'Dose 1' }, { id: 2, name: 'Dose 2' }];
      }
      else if (vaccDosageReq === 1) {
        this.vaccinesDosageList = [{ id: 1, name: 'Dose 1' }];
      }
      else {
        this.vaccinesDosageList = [{ id: 1, name: 'Dose 1' }, { id: 2, name: 'Dose 2' }, { id: 3, name: 'Dose 3' }];
      }


    }


  }

  tpFilterType(value) {
    // console.log(value);
    this.searchByCodeNameRadio = value;
  }

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
      CreatedBy: this.loggedInUser.userid,
      WhatsAppNo: patientInfo.WhatsapNo,
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

  /* patient basic info for COVID-19 */
  openPatientBasicInfoFormForCovidPopup() {
    this.patientBasicInfoFormForCovidSubmitted = false;
    this.patientBasicInfoForCovidPopupRef = this.appPopupService.openModal(this.patientBasicInfoForCovidPopup);

    const covidDetails = this.patientBasicInfo.value;
    this.patientBasicInfoFormForCovid.patchValue({
      CNIC: covidDetails.CNIC,
      PassportNo: covidDetails.PassportNo,
      HomeAddress: covidDetails.HomeAddress,
      PhoneNO: covidDetails.PhoneNO,
      MobileOperatorID: covidDetails.MobileOperatorID,
      MobileNO: covidDetails.MobileNO,
      Emails: covidDetails.Emails,
      CountryID: covidDetails.CountryID,
      CityID: covidDetails.CityID,
      BloodGroup: covidDetails.BloodGroup
    });
  }

  /* patient basic info for COVID-19 */
  openPatientBasicInfoFormForDenguePopup() {
    this.patientBasicInfoFormForDengueSubmitted = false;
    this.patientBasicInfoForDenguePopupRef = this.appPopupService.openModal(this.patientBasicInfoForDenguePopup);
    const covidDetails = this.patientBasicInfo.value;
    const dengue = this.patientBasicInfoFormForDengue.value;
    this.patientBasicInfoFormForDengue.patchValue({
      CNIC: covidDetails.CNIC,
      PassportNo: covidDetails.PassportNo,
      HomeAddress: covidDetails.HomeAddress,
      PhoneNO: covidDetails.PhoneNO,
      MobileOperatorID: covidDetails.MobileOperatorID,
      MobileNO: covidDetails.MobileNO,
      Emails: covidDetails.Emails,
      CountryID: covidDetails.CountryID,
      CityID: covidDetails.CityID,
      BloodGroup: covidDetails.BloodGroup,
      Per_DistrictID: covidDetails.PermanentDistrictID,
      Per_TehsilID: covidDetails.PermanentTehsilID,
    });
  }
  savePatientBasicInfoFormForCovidPopup() {
    console.log(this.patientBasicInfoFormForCovid);
    this.patientBasicInfoFormForCovidSubmitted = true;
    const covidFormValidity = this.patientBasicInfoFormForCovidValid();
    if (!covidFormValidity.valid) { // this.patientBasicInfoFormForCovid.valid) {
      this.toastr.warning('<b>' + covidFormValidity.invalidFields.join('</b>, <b>') + '</b>', 'Invalid Fields', { enableHtml: true });
      return;
    }
    const covidDetails = this.patientBasicInfoFormForCovid.getRawValue();
    this.patientBasicInfo.patchValue({
      CNIC: covidDetails.CNIC,
      PassportNo: covidDetails.PassportNo,
      HomeAddress: covidDetails.HomeAddress,
      PhoneNO: covidDetails.PhoneNO,
      MobileOperatorID: covidDetails.MobileOperatorID,
      MobileNO: covidDetails.MobileNO,
      Emails: covidDetails.Emails,
      CountryID: covidDetails.CountryID,
      CityID: covidDetails.CityID,
      BloodGroup: covidDetails.BloodGroup,
    });
    this.patientBasicInfoForCovidPopupRef.close();

    // if(this.selectedPanel && this.panelsList.find(a => a.PanelId == this.selectedPanel).isAirLine && !this.patientFlightDetailsValid()) {
    //   this.openPatientFlightDetailsPopup();
    // }

    this.wizard.goToNextStep();

    // this.closeModal();
  }
  savePatientBasicInfoFormForDenguePopup() {
    console.log(this.patientBasicInfoFormForDengue);
    this.patientBasicInfoFormForDengueSubmitted = true;
    const covidFormValidity = this.patientBasicInfoFormForDengueValid();
    if (!covidFormValidity.valid) { // this.patientBasicInfoFormForCovid.valid) {
      this.toastr.warning('<b>' + covidFormValidity.invalidFields.join('</b>, <b>') + '</b>', 'Invalid Fields', { enableHtml: true });
      return;
    }
    const covidDetails = this.patientBasicInfoFormForDengue.getRawValue();
    this.patientBasicInfo.patchValue({
      CNIC: covidDetails.CNIC,
      PassportNo: covidDetails.PassportNo,
      HomeAddress: covidDetails.HomeAddress,
      PhoneNO: covidDetails.PhoneNO,
      MobileOperatorID: covidDetails.MobileOperatorID,
      MobileNO: covidDetails.MobileNO,
      Emails: covidDetails.Emails,
      CountryID: covidDetails.CountryID,
      CityID: covidDetails.CityID,
      BloodGroup: covidDetails.BloodGroup,
      Per_DistrictID: covidDetails.PermanentDistrictID,
      Per_TehsilID: covidDetails.PermanentTehsilID,
    });
    this.patientBasicInfoForDenguePopupRef.close();

    // if(this.selectedPanel && this.panelsList.find(a => a.PanelId == this.selectedPanel).isAirLine && !this.patientFlightDetailsValid()) {
    //   this.openPatientFlightDetailsPopup();
    // }

    this.wizard.goToNextStep();

    // this.closeModal();
  }
  resetPatientBasicInfoFormForCovidPopup() {
    this.patientBasicInfoFormForCovidSubmitted = false;
    this.patientBasicInfoFormForCovid.patchValue({
      CNIC: [''],
      PassportNo: [''],
      HomeAddress: [''],
      PhoneNO: [''],
      MobileOperatorID: [''],
      MobileNO: [''],
      Emails: [''],
      CountryID: [this.countryIdForPak],
      CityID: [0],
      BloodGroup: [''],
    });
  }
  patientBasicInfoFormForCovidValid() {
    const validityObj = {
      valid: false,
      invalidFields: [],
      message: ''
    }
    const covidFormControls = this.patientBasicInfoFormForCovid.controls;
    const covidFormControlsValues = this.patientBasicInfoFormForCovid.getRawValue();
    console.log(covidFormControlsValues);
    console.log(covidFormControls);
    /*
    let fieldsToValidate = ['CNIC','PassportNo','HomeAddress','PhoneNO','MobileOperatorID','MobileNO','Emails','CountryID','CityID','BloodGroup'];
    fieldsToValidate = ['CNIC','PassportNo','HomeAddress','CountryID']; // ,'CityID' // 'BloodGroup' // 'Emails'
    // covidFormControls['PassportNo'].setValidators([Validators.required]);
    // covidFormControls['PassportNo'].updateValueAndValidity();
    // covidFormControls['BloodGroup'].setValidators([Validators.required]);
    // covidFormControls['BloodGroup'].updateValueAndValidity();
    if(!this.selectedPanel || !this.selectedPatientType || this.selectedPatientType < 2 || this.selectedPatientType == 1) {
      fieldsToValidate = ['CNIC','HomeAddress']; // ,'CityID','Emails','CountryID'
      // covidFormControls['PassportNo'].clearValidators();
      // covidFormControls['PassportNo'].updateValueAndValidity();
      // covidFormControls['BloodGroup'].clearValidators();
      // covidFormControls['BloodGroup'].updateValueAndValidity();
    }
    fieldsToValidate.forEach( (a, i) => {
      if(Object.keys(covidFormControls).includes(a)) {
        if(!covidFormControls[a].value) {
          invalidFields.push(a);
        }
      }
    });
    */
    if (covidFormControlsValues.HomeAddress) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.HomeAddress);
    } else {
      validityObj.invalidFields.push('HomeAddress');
    }

    // if (covidFormControlsValues.DistrictID && this.loggedInUser.provinceID == 2) {
    //   validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.DistrictID);
    // } else {
    //   validityObj.invalidFields.push('DistrictID');
    // }

    // if (covidFormControlsValues.TehsilID && this.loggedInUser.provinceID == 2) {
    //   validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.TehsilID);
    // } else {
    //   validityObj.invalidFields.push('TehsilID');
    // }

    // if (covidFormControlsValues.Per_TehsilID && this.loggedInUser.provinceID == 2) {
    //   validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.Per_TehsilID);
    // } else {
    //   validityObj.invalidFields.push('Per_TehsilID');
    // }

    // if (covidFormControlsValues.Per_DistrictID && this.loggedInUser.provinceID == 2) {
    //   validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.Per_DistrictID);
    // } else {
    //   validityObj.invalidFields.push('Per_DistrictID');
    // }

    // if (covidFormControlsValues.Per_DistrictID && this.loggedInUser.provinceID == 2) {
    //   validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.Per_DistrictID);
    // } else {
    //   validityObj.invalidFields.push('Per_DistrictID');
    // }

    if (covidFormControlsValues.CNIC || covidFormControlsValues.PassportNo) {
      // validityObj.invalidFields = validityObj.invalidFields.filter( a => (a != covidFormControlsValues.CNIC && a != covidFormControlsValues.PassportNo));
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != 'CNIC or PassportNo');
    } else {
      validityObj.invalidFields.push('CNIC or PassportNo');
      // validityObj.invalidFields.push('CNIC');
    }

    if ((covidFormControls['MobileNO'].value && covidFormControls['MobileOperatorID'].value)
      || covidFormControls['PhoneNO'].value
    ) {
    } else {
      validityObj.invalidFields.push('MobileNO');
      validityObj.invalidFields.push('MobileOperatorID');
      validityObj.invalidFields.push('PhoneNO');
    }

    // if(this.selectedPanel) {
    //   if(covidFormControls['CountryID'].value < 1) {
    //     invalidFields.push('CountryID');
    //   }  
    // }

    // if(this.patientBasicInfoFormForCovid.controls['CityID'].value < 1) {
    //   invalidFields.push('CityID');
    // }
    validityObj.invalidFields = [...new Set(validityObj.invalidFields)];
    console.log(validityObj.invalidFields);
    validityObj.valid = validityObj.invalidFields.length ? false : true;
    return validityObj; // invalidFields.length ? false : true;
    // return this.patientBasicInfoFormForCovid.valid;
  }
  patientBasicInfoFormForDengueValid() {
    const validityObj = {
      valid: false,
      invalidFields: [],
      message: ''
    }
    if (this.provinceDB != 2 && this.provinceDB != 1) {
      this.logProvinceNotPunjabInfo(this.loggedInUser.provinceID);
    }
    const covidFormControls = this.patientBasicInfoFormForDengue.controls;
    const covidFormControlsValues = this.patientBasicInfoFormForDengue.getRawValue();
    console.log(covidFormControlsValues);
    console.log(covidFormControls);
    /*
    let fieldsToValidate = ['CNIC','PassportNo','HomeAddress','PhoneNO','MobileOperatorID','MobileNO','Emails','CountryID','CityID','BloodGroup'];
    fieldsToValidate = ['CNIC','PassportNo','HomeAddress','CountryID']; // ,'CityID' // 'BloodGroup' // 'Emails'
    // covidFormControls['PassportNo'].setValidators([Validators.required]);
    // covidFormControls['PassportNo'].updateValueAndValidity();
    // covidFormControls['BloodGroup'].setValidators([Validators.required]);
    // covidFormControls['BloodGroup'].updateValueAndValidity();
    if(!this.selectedPanel || !this.selectedPatientType || this.selectedPatientType < 2 || this.selectedPatientType == 1) {
      fieldsToValidate = ['CNIC','HomeAddress']; // ,'CityID','Emails','CountryID'
      // covidFormControls['PassportNo'].clearValidators();
      // covidFormControls['PassportNo'].updateValueAndValidity();
      // covidFormControls['BloodGroup'].clearValidators();
      // covidFormControls['BloodGroup'].updateValueAndValidity();
    }
    fieldsToValidate.forEach( (a, i) => {
      if(Object.keys(covidFormControls).includes(a)) {
        if(!covidFormControls[a].value) {
          invalidFields.push(a);
        }
      }
    });
    */
    // if (covidFormControlsValues.HomeAddress && this.loggedInUser.provinceID !== 2) {
    if (covidFormControlsValues.HomeAddress || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.HomeAddress);
    } else if (!covidFormControlsValues.HomeAddress || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields.push('HomeAddress');
    }

    // if (covidFormControlsValues.DistrictID && this.loggedInUser.provinceID !== 2) {
    if (covidFormControlsValues.DistrictID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.DistrictID);
    } else if (!covidFormControlsValues.DistrictID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields.push('DistrictID');
    }

    // if (covidFormControlsValues.TehsilID && this.loggedInUser.provinceID !== 2) {
    if (covidFormControlsValues.TehsilID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.TehsilID);
    } else if (!covidFormControlsValues.TehsilID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields.push('TehsilID');
    }

    // if (covidFormControlsValues.Per_TehsilID && this.loggedInUser.provinceID !== 2) {
    if (covidFormControlsValues.Per_TehsilID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.Per_TehsilID);
    } else if (!covidFormControlsValues.Per_TehsilID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields.push('Per_TehsilID');
    }

    // if (covidFormControlsValues.Per_DistrictID && this.loggedInUser.provinceID !== 2) {
    if (covidFormControlsValues.Per_DistrictID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.Per_DistrictID);
    } else if (!covidFormControlsValues.Per_DistrictID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields.push('Per_DistrictID');
    }

    // if (covidFormControlsValues.Per_DistrictID && this.loggedInUser.provinceID !== 2) {
    if (covidFormControlsValues.Per_DistrictID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != covidFormControlsValues.Per_DistrictID);
    } else if (!covidFormControlsValues.Per_DistrictID || (this.provinceDB !== 2 && this.provinceDB != 1)) {
      validityObj.invalidFields.push('Per_DistrictID');
    }

    if (covidFormControlsValues.CNIC && covidFormControlsValues.CNIC.length === 13) {
      // validityObj.invalidFields = validityObj.invalidFields.filter( a => (a != covidFormControlsValues.CNIC && a != covidFormControlsValues.PassportNo));
      validityObj.invalidFields = validityObj.invalidFields.filter(a => a != 'CNIC or PassportNo');
    } else if (((!covidFormControlsValues.CNIC || (this.provinceDB !== 2 && this.provinceDB != 1)) || covidFormControlsValues.CNIC.length !== 13)) {
      validityObj.invalidFields.push('CNIC');
      // validityObj.invalidFields.push('CNIC');
    }

    if ((covidFormControls['MobileNO'].value && covidFormControls['MobileOperatorID'].value)
      || covidFormControls['PhoneNO'].value
    ) {
    } else {
      validityObj.invalidFields.push('MobileNO');
      validityObj.invalidFields.push('MobileOperatorID');
      validityObj.invalidFields.push('PhoneNO');
    }

    // if(this.selectedPanel) {
    //   if(covidFormControls['CountryID'].value < 1) {
    //     invalidFields.push('CountryID');
    //   }  
    // }

    // if(this.patientBasicInfoFormForCovid.controls['CityID'].value < 1) {
    //   invalidFields.push('CityID');
    // }
    validityObj.invalidFields = [...new Set(validityObj.invalidFields)];
    console.log(validityObj.invalidFields);
    validityObj.valid = validityObj.invalidFields.length ? false : true;

    // setTimeout(() => {
    //   resolve("1 sec");
    // }, 1000);



    //  const res = await myPromise;
    // console.log(res); 


    return validityObj; // invalidFields.length ? false : true;
    // return this.patientBasicInfoFormForCovid.valid;
  }
  /* patient basic info for COVID-19 */

  /* patient FLIGHT DETAILS */
  openPatientFlightDetailsPopup() {
    this.patientFlightDetailsFormSubmitted = false;
    this.patientFlightDetailsPopupRef = this.appPopupService.openModal(this.patientFlightDetailsPopup, { size: 'md' });

    // let flightdate = this.PreTravelBookingPatient.FlightDate ? moment(this.PreTravelBookingPatient.FlightDate).format('dd-mm-yyyy') : '';
    // { year: 1789, month: 7, day: 14 },
    // this.resetPatientFlightDetailsPopup();
    if (this.PreTravelBookingPatient && this.PreTravelBookingPatient.FlightNo) {
      const flightdate = this.PreTravelBookingPatient.FlightDate.split('T');
      console.log("flightdate", flightdate);
      const patientData = this.patientBasicInfo.getRawValue();
      this.patientFlightDetails.patchValue({
        PassportNo: patientData.PassportNo || '' || this.PreTravelBookingPatient.PassportNo,
        AirlineId: this.PreTravelBookingPatient.AirlineID,
        FlightNo: this.PreTravelBookingPatient.FlightNo,
        FlightDate: { day: moment(flightdate[0]).get('date'), month: (moment(flightdate[0]).get('month') + 1), year: moment(flightdate[0]).get('year') },//  moment(flightdate[0],'yyyy-mm-dd').format('yyyy-mm-dd'),
        AirportId: this.PreTravelBookingPatient.AirportID,
        BookingReferenceNo: this.PreTravelBookingPatient.TicketReferenceNo
      });
    }
    else if (this.patientFlightDetails) {
      const patientData = this.patientBasicInfo.getRawValue();
      this.patientFlightDetails.patchValue({
        PassportNo: patientData.PassportNo || '',

      });
    }

  }
  openInsuarncePolicyPopup() {
    this.InsurancePolicyPopupRef = this.appPopupService.openModal(this.InsurancePolicyPopup, { size: 'md' });
  }
  openInsuarncePolicyHelpPopup() {
    this.InsuarncePolicyHelpContent = "<ul><li><strong>Understand Patient's Coverage:</strong> Review Patient's policy to know what treatments and services are covered.</li><li><strong>Check Network Hospitals:</strong> Ensure Patient's preferred hospitals or clinics are part of the insurer's network.</li><li><strong>Keep Documentation Ready:</strong> Always have your insurance card and policy details available for emergencies.</li><li><strong>Verify Pre-authorization:</strong> Check if prior approval is required for specific treatments or procedures.</li><li><strong>Know Your Co-pay:</strong> Understand any out-of-pocket expenses you may need to cover.</li><li><strong>Emergency Helpline:</strong> Save your insurance provider's helpline number for quick assistance.</li></ul>"
    this.InsuarncePolicyHelpPopupRef = this.appPopupService.openModal(this.InsuarncePolicyHelpPopup, { size: 'md' });
  }
  getInsurancePolicyDetail() {
    this.shareSrv.getDataGET(API_ROUTES.GET_INSUARANCE_Details).subscribe((resp: any) => {
      // console.log("InsuarancePolicyDetailInsuarancePolicyDetail resp", resp);
      if (resp.StatusCode === 200) {
        this.InsuarancePolicyDetail = JSON.parse(resp.PayLoadStr);
        this.InsuarancePolicyDetail = this.InsuarancePolicyDetail[0];
        // console.log("this.isByPassInsuarancePolicy ", this.InsuarancePolicyDetail);
      }
    }, (err => {
      console.log(err);
    }))
  }
  checkElligiblePatientForPolicy(orbitPatientID) {
    this.isUpgradePolicyAllowed = false;
    this.InsuranceActiveDate = null
    const params = {
      "PatientID": orbitPatientID
    }
    this.shareSrv.getData(API_ROUTES.INSURANCE_DETAIL_BYPID, params).subscribe((resp: any) => {
      // console.log("CHECK_ELIGIBLE_PATIENT_FOR_POLICY CHECK_ELIGIBLE_PATIENT_FOR_POLICY", resp);
      if (resp.StatusCode === 200) {
        this.InsuranceActive = JSON.parse(resp.PayLoadStr);
        // if (this.InsuranceActive.length > 1) {

        if (this.InsuranceActive.length > 1) {
          this.InsuranceActive = this.InsuranceActive.filter(item => item.InsuranceStatusID === 2);
          console.log("🚀 ~ PatientRegistrationComponent ~ checkElligiblePatientForPolicy ~ this.InsuranceActive:", this.InsuranceActive)
        }
        else {

        }

        if (this.InsuranceActive.length) {
          const activeInsurance = this.InsuranceActive[0];
          this.InsuranceActive = activeInsurance;
          console.log("foundInsurances", this.InsuranceActive)
          // }
          // this.InsuranceActive.isOfferExpire = 1;
          this.InsuranceActiveDate = this.InsuranceActive.InsuranceActiveDate;

          if (this.InsuranceActiveDate != null)
            this.checkInsuranceEligibility();
          this.PatientInsuranceID = this.InsuranceActive.PatientInsuranceID;
          if (this.InsuranceActive.isOfferExpire == 1 && !this.InsuranceActive.InsuranceActiveDate) {
            this.PatientInsuranceID = this.InsuranceActive.PatientInsuranceID;
            this.InsuranceStatusID = this.InsuranceActive.InsuranceStatusID;

          }
          else if (this.InsuranceActive.isOfferExpire == 0 && !this.InsuranceActive.InsuranceActiveDate) {
            this.isEligibleForInsuranceActiveDate = false;
            this.InsuranceWillingExpireDate = this.InsuranceActive.OfferExpireOn;
            this.InsurancePolicyNotExpired = true
          }
        }

      }
    }, (err => {
      console.log(err);
    }))
  }

  checkInsuranceEligibility() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    const insuranceDate = new Date(this.InsuranceActiveDate);
    insuranceDate.setHours(0, 0, 0, 0); // Normalize to midnight

    const diffTime = insuranceDate.getTime() - today.getTime();
    const diffDays = Math.abs(diffTime / (1000 * 3600 * 24)); // Ensure positive value

    const insuranceActiveDate = new Date(this.InsuranceActive.InsuranceActiveDate);
    const insuranceExpireDate = new Date(this.InsuranceActive.InsuranceExpireDate);

    const isInsuranceActive = today >= insuranceActiveDate && today <= insuranceExpireDate;

    // console.log('Is Insurance Active?', isInsuranceActive);

    console.log(diffDays); // !isUpgradePolicyAllowed // !isReactivePolicyAllowed

    if (diffDays <= this.InsuarancePolicyDetail.PolicyResetDays && diffDays <= this.InsuarancePolicyDetail.PolicyResetDays) {
      this.isEligibleForInsuranceActiveDate = false;
    }
    else if (diffDays >= this.InsuarancePolicyDetail.PolicyResetDays) {
      this.isUpgradePolicyAllowed = true;
    }
    else if (diffDays >= this.InsuarancePolicyDetail.PolicyResetDays && diffDays >= this.InsuarancePolicyDetail.PolicyDuration) {
      this.isReactivePolicyAllowed = true;
    }

    // console.log("🚀  this.InsuranceActive.InsuranceStatusID:", this.InsuranceActive.InsuranceStatusID)
    if (isInsuranceActive && this.InsuranceActive.InsuranceStatusID === 5) {
      this.isUpgradePolicyAllowed = true;
    }
    console.log("isEligibleForInsuranceActiveDatethis.isEligibleForInsuranceActiveDate", this.isEligibleForInsuranceActiveDate)
    console.log("isUpgradePolicyAllowed.isUpgradePolicyAllowed", this.isUpgradePolicyAllowed)
    console.log("isReactivePolicyAllowed.isReactivePolicyAllowed", this.isReactivePolicyAllowed)
    // if (!this.InsuranceActiveDate) {
    //   this.Insuranceshouldntoffer = true;
    // }
    const date = new Date(this.InsuranceActiveDate);
    const formattedDate = date.toISOString().split('T')[0];
    this.toastr.info(`This patient already availed insurance policy on ${formattedDate}`, "Insurance Policy");
  }

  UpgradePolicy(e) {
    this.isUpgradePolicy = e.value;
  }

  ReActivePolicy(e) {
    this.isReactivePolicy = e.value;
  }

  WillingPolicyChange(e) {
    this.isPatientWilling = e.value;
  }

  updatePolicyWilingStatus() {
    const params = {
      "PatientID": this.patientBasicInfo.getRawValue().PatientID,
      "CreatedBy": this.loggedInUser.userid,
      "InsuranceStatusID": this.isPatientWilling == true ? 1 : 0
    }
    this.shareSrv.getData(API_ROUTES.UPDATE_INSURANCE_POLICY_STATUS, params).subscribe((resp: any) => {
      // console.log("InsuarancePolicyDetailInsuarancePolicyDetail resp", resp);
      if (resp.statusCode === 200) {
        this.InsuarancePolicyDetail = JSON.parse(resp.PayLoadStr);
        // console.log("this.isByPassInsuarancePolicy ", this.InsuarancePolicyDetail);
      }
    }, (err => {
      console.log(err);
    }))
  }
  savePatientFlightDetailsPopup() {
    console.log(this.patientFlightDetails);
    this.patientFlightDetailsFormSubmitted = true;
    const flightDetailsFormValidity = this.patientFlightDetailsValid();
    if (!flightDetailsFormValidity.valid) { // this.patientBasicInfoFormForCovid.valid) {
      this.toastr.warning('<b>' + flightDetailsFormValidity.invalidFields.join('</b>, <b>') + '</b>', 'Invalid Fields', { enableHtml: true });
      return;
    }
    const _flightDetails = this.patientFlightDetails.getRawValue();
    console.log(_flightDetails);
    // this.patientFlightDetails.patchValue({
    //   VisitId: null,
    //   AirlineId: _flightDetails.AirlineId || 0,
    //   FlightNo: _flightDetails.FlightNo || '',
    //   FlightDate: _flightDetails.FlightDate || null,
    //   BookingReferenceNo: _flightDetails.BookingReferenceNo || '',
    //   AirportId: _flightDetails.AirportId || 0,
    //   PassportNo: _flightDetails.PassportNo || '',
    // });
    this.patientBasicInfo.patchValue({
      PassportNo: _flightDetails.PassportNo || ''
    });
    this.patientFlightDetailsPopupRef.close();
    this.wizard.goToNextStep();
    // this.closeModal();
  }
  saveARYPopup() {
    console.log(this.patientInforARY);
    if (this.patientInforARY.invalid) {
      this.patientInforARY.markAllAsTouched();
      return;
    }
    // Close the ARY popup
    this.appPopupService.closeModal(this.arySahulatPopup);
    console.log(this.patientInforARY.value);
  }
  resetPatientFlightDetailsPopup() {
    this.patientFlightDetailsFormSubmitted = false;
    this.patientFlightDetails.patchValue({
      VisitId: null,
      AirlineId: 0,
      FlightNo: '',
      FlightDate: null,
      BookingReferenceNo: '',
      AirportId: 0
    });
  }
  patientFlightDetailsValid() {
    const validityObj = {
      valid: false,
      invalidFields: [],
      message: ''
    }
    console.log('this.patientFlightDetails.value ', this.patientFlightDetails.value);
    console.log('this.patientFlightDetails.controls ', this.patientFlightDetails.controls);

    let fieldsToValidate = ['VisitId', 'AirlineId', 'AirportId', 'BookingReferenceNo', 'FlightDate', 'FlightNo'];
    fieldsToValidate = ['AirlineId', 'AirportId', 'BookingReferenceNo', 'FlightDate', 'FlightNo', 'PassportNo'];
    if (this.isAirportLocation()) {
      fieldsToValidate = ['AirlineId', 'FlightNo', 'PassportNo'];
    }
    fieldsToValidate.forEach((a, i) => {
      if (Object.keys(this.patientFlightDetails.controls).includes(a)) {
        if (!this.patientFlightDetails.controls[a].value) {
          validityObj.invalidFields.push(a);
        }
      }
    });

    if ((this.patientFlightDetails.controls['AirlineId'].value < 1)) {
      validityObj.invalidFields.push('AirlineId');
    }
    if (!this.isAirportLocation()) {
      if ((this.patientFlightDetails.controls['AirportId'].value < 1)) {
        validityObj.invalidFields.push('AirportId');
      }
    }

    validityObj.invalidFields = [...new Set(validityObj.invalidFields)];
    validityObj.invalidFields.forEach((a, i) => {
      if (a == 'AirlineId') { validityObj.invalidFields[i] = 'Airline' };
      if (a == 'AirportId') { validityObj.invalidFields[i] = 'Airport' };
      if (a == 'BookingReferenceNo') { validityObj.invalidFields[i] = 'Booking Ref. No' };
      if (a == 'FlightDate') { validityObj.invalidFields[i] = 'Flight Date' };
      if (a == 'FlightNo') { validityObj.invalidFields[i] = 'Flight No' };
      if (a == 'PassportNo') { validityObj.invalidFields[i] = 'Passport No' };
    })
    console.log('patientFlightDetailsValid invalidFields', validityObj.invalidFields, fieldsToValidate);
    validityObj.valid = validityObj.invalidFields.length ? false : true;
    return validityObj; // invalidFields.length ? false : true;
    // return invalidFields.length ? false : true;
    // return this.patientBasicInfoFormForCovid.valid;
  }
  getAirlineCode(airlineId) {
    if (this.PreTravelBookingPatient && this.PreTravelBookingPatient.FlightNo) {
      return '';
    }
    const filterPipe = new GetValueFromArrayPipe();
    const iataCode = filterPipe.transform(airlineId, 'AirlineId', 'IATACode', this.airlinesList);
    return iataCode;
  }
  getAirlineIdByPanelId(panelId, setValue) {
    const filterPipe = new GetValueFromArrayPipe();
    const airlineId = filterPipe.transform(panelId, 'PanelId', 'AirlineId', this.airlinesList);
    // console.log('dddd ', airlineId);
    if (setValue) {
      this.patientFlightDetails.patchValue({
        AirlineId: airlineId
      });
    }
    return airlineId;
  }

  /* patient FLIGHT DETAILS */

  /* patient VACCINE DETAILS */
  openPatientVaccineDetailsPopup() {
    console.log(this.isVaccineDetailCheck);
    this.patientVaccineDetailsFormSubmitted = false;
    if (this.isVaccineDetailCheck == true) {
      this.patientVaccineDetailsPopupRef = this.appPopupService.openModal(this.patientVaccineDetailsPopup, { size: 'md' });
    }
    else {
      this.patientVaccineDetails.reset();
    }

  }
  openAssignRiderPopup() {
    this.RidersDetail();
    const isradio = this.selectedTestProfiles.find(a => { return a.IsHCRadioSrv === true });
    const ismoallowed = this.selectedTestProfiles.find(a => { return a.IsMOAllowed === true });
    if (isradio) {
      this.enableRadioServicesActions = true;
    }
    else {
      this.enableRadioServicesActions = false;
    }
    this.appPopupService.openModal(this.AssignRiderPopup);
    //this.AssignRiderPopupRef =
  }
  DisplayRiderSchedule(rider) {
    this.showRiderSchedule = true;
    this.SelRider = {

    };
    this.RiderTasksSchedule(rider);

  }

  RiderTasksSchedule(Riderdata) {
    if (!Riderdata) {
      return;
    }
    this.RiderScheduleData = [];
    this.SelRider.selRiderID = Riderdata.RiderID;
    this.SelRider.selRiderName = Riderdata.RiderFirstName + ' ' + Riderdata.RiderLastName;
    this.SelRider.selRiderContactNumber = Riderdata.ReferenceContactNo;
    const params = {
      "RiderID": Riderdata.RiderID
    }
    this.HCMService.GetRiderScheduleByRiderID(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp.StatusCode == 200 && resp.PayLoad.length) {

        // let todaydate = moment(new Date(), 'YYYY-MM-DD');
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
    }, (err) => { console.log(err); this.toastr.error("something went wrong ") })
  }
  RidersDetail() {
    const params = {
      RiderID: 0,
      LocID: this.selBranchid
    }
    this.HCMService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailList = resp.PayLoad;
      const aa = this.RidersDetailList.filter(a => { return a.RiderStatusID == 1 }); console.log(aa);
      if (!this.selBranchid) {
        this.techList = this.RidersDetailList.filter(a => { return a.HCUserTypeID == 2 });
        this.HelpingStaffList = this.RidersDetailList.filter(a => { return a.HCUserTypeID == 3 });
        this.DocList = this.RidersDetailList.filter(a => { return a.HCUserTypeID == 4 });
      }
    }, (err) => { console.log(err) })
  }
  savePatientVaccineDetailsPopup() {
    console.log(this.patientVaccineDetails);
    this.patientVaccineDetailsFormSubmitted = true;
    if (!this.patientVaccineDetailsValid()) { // this.patientFlightDetails.valid) {
      this.toastr.warning('Please enter all fields');
      return;
    }
    const _vaccineDetails = this.patientVaccineDetails.getRawValue();
    console.log(_vaccineDetails);
    this.patientVaccineDetailsPopupRef.close();
  }
  resetPatientVaccineDetailsPopup() {
    this.patientVaccineDetailsFormSubmitted = false;
    this.patientVaccineDetails.patchValue({
      PatientID: 0,
      VaccineID: 0,
      Dosage: 0,
      VaccineDate: null,
      VaccinationCenter: null,
      CreatedBy: 0,
      VaccinationStatus: 0
    });
  }
  patientVaccineDetailsValid() {
    const invalidFields = [];
    console.log('this.patientVaccineDetails.value ', this.patientVaccineDetails.value);
    console.log('this.patientVaccineDetails.controls ', this.patientVaccineDetails.controls);

    const fieldsToValidate = Object.keys(this.patientVaccineDetails.controls);
    fieldsToValidate.forEach((a, i) => {
      if (Object.keys(this.patientVaccineDetails.controls).includes(a)) {
        if (!this.patientVaccineDetails.controls[a].value) {
          invalidFields.push(a);
        }
      }
    });

    console.log('patientVaccineDetails invalidFields', invalidFields);
    return invalidFields.length ? false : true;
    // return this.patientBasicInfoFormForCovid.valid;
  }

  /* patient VACCINE DETAILS */

  searchPatientByTrackingID(bookingNo): Promise<any> {
    return new Promise((resolve, reject) => {
      this.BookingNo = bookingNo;
      // this.resetPatientBasicInfoFields();
      const patientSearchParams = {
        BookingID: (bookingNo || '').trim(),
        BranchID: this.loggedInUser.locationid
      }
      // if(!environment.production) {
      //   patientSearchParams.BranchID = 69;
      // }
      if (patientSearchParams.BookingID) {
        this.getVisitHomeCollectionTest();
        this.resetAllForm_CompleteRegistration();
        this.panelIdFromBookingId = null;
        this.unLinkOrbitPatient('');
        this.resetPatientBasicInfoFields();
        this.updateUrlParams_navigateTo('', { cacheControl: (+new Date()) });
        this.spinner.show();

        this.patientService.searchPatientByBookingID(patientSearchParams).subscribe((res: any) => {

          this.bookingNoDisabled = true;
          this.spinner.hide();
          this.resetAllForm_CompleteRegistration();
          this.unLinkOrbitPatient('');
          this.resetPatientBasicInfoFields();
          this.updateUrlParams_navigateTo('', { cacheControl: (+new Date()) });
          // console.log(res); {table}
          // res.PayLoadStr = res.PayLoad;

          if (this.route.routeConfig.path == 'regForHS') {

            this.hideOptionalFields = true;
            if (this.urlBookingID) {
              this.pageTitle = 'Patient Reg. Home Smp' + ' - ' + this.urlBookingID || this.BookingNo;
            }
            else {
              this.pageTitle = 'Patient Reg. Home Smp';
            }
          }
          if (res && res.StatusCode == 200) {
            let fullDataSet: any = '';
            fullDataSet = res.PayLoadDS || [];
            // try {
            //   fullDataSet = JSON.parse(res.PayLoadStr);
            // } catch (e) {}

            // if(fullDataSet && fullDataSet.Table2 && fullDataSet.Table2.length && fullDataSet.Table2[0].BookingMsg) {
            //   this.toastr.info(fullDataSet.Table2[0].BookingMsg);
            //   return;
            // }
            if (res.PayLoadDS && res.PayLoadDS.Table && res.PayLoadDS.Table.length && res.PayLoadDS.Table[0].PanelID) {
              // this.FBI = res.PayLoadDS.Table[0].BookingPatientID;

              this.BookingNoFromDB = res.PayLoadDS.Table[0].BookingPatientID ? true : false;
              this.selectedPatientType = 2;
              this.selectedPanel = res.PayLoadDS.Table[0].PanelID
              this.panelIdFromBookingId = res.PayLoadDS.Table[0].PanelID;
              this.panelTypeFromBookingId = res.PayLoadDS.Table[0].PanelType;
              this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 });
              // let obj = { PanelId: res.PayLoadDS.Table[0].PanelID, PanelType: 2 }
              // this.panelChanged(obj);
            }


            if (fullDataSet && fullDataSet.Table && fullDataSet.Table.length) {
              this.BookingNoFromDB = res.PayLoadDS.Table[0].BookingPatientID ? true : false;
              this.BookingNoFromDBVal = res.PayLoadDS.Table[0].BookingPatientID;
              this.PreTravelBookingPatient = fullDataSet.Table[0];
              setTimeout(() => {
                this.selectedHomeSamplingEmp = fullDataSet.Table[0].RiderEmpID ? fullDataSet.Table[0].RiderEmpID : null;
              }, 2000)
              this.toastr.success('Patient data loaded');
              // this.searchPatientByPhoneNo(fullDataSet.Table[0].MobileNO || '');

              if (fullDataSet && fullDataSet.Table1 && fullDataSet.Table1.length) {
                setTimeout(() => {
                  this.populatePatiensFromMC(fullDataSet.Table1); // list of Patients in Popup                  
                }, 2000);
              } else {
                this.searchPatientByPhoneNo(fullDataSet.Table[0].MobileNO || '');
              }
              this.selectedPatientSource = 20;
              this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: fullDataSet.Table[0].OrbitPatientID, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
              this.populatePatientFields(fullDataSet.Table[0]);
              if (res.PayLoadDS && res.PayLoadDS.Table && res.PayLoadDS.Table.length && res.PayLoadDS.Table[0].DiscountPerc) {
                this.isDiscountFrombookingID = true;
                this.discountPercentage = res.PayLoadDS.Table[0].DiscountPerc;
                this.discountValueChanged();
              }
              if (fullDataSet.Table3 && fullDataSet.Table3.length) {

                // this.spinner.show(this.spinnerRefs.testProfilesDropdown);
                // setTimeout(function () {
                resolve(this.addTestsFromBooking(fullDataSet.Table3));

                // let aa = this.addTestsFromBooking(fullDataSet.Table3).then(resp => {
                //   resolve(aa);
                if (fullDataSet.Table4 && fullDataSet.Table4.length) {
                  this.vd = this.helperSrv.addPrefixToDocs(fullDataSet.Table4);
                }

                // });

                // this.spinner.hide();
                // }, 6000)

              }

              // setTimeout(() => {
              // this.panelChanged({PanelType: 2});
              // }, 15000);

            } else {
              this.toastr.warning('No record(s) found');
              this.bookingNoDisabled = null;
            }
          } else {
            this.toastr.warning('No record(s) found');
            this.bookingNoDisabled = null;
          }
          this.showHideHomeSamplingEmpField();
        }, (err) => {
          this.toastr.error('Connection error');
          console.log(err);
          this.spinner.hide();
        })
      } else {
        this.toastr.warning('Please enter Booking Number');
      }
    });
  }

  getVisitHomeCollectionTest() {
    this.hcService.getVisitHomeCollectionTest().subscribe((resp: any) => {
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.VisitHomeSamplingTest = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  isOutsource = false;
  searchOutSourcePatients(allParams) {

    const params = {
      "HospitalPatientID": allParams.HospitalPatientID,
      "BranchID": this.loggedInUser.locationid
    }
    this.patientService.searchOutsourceHospitalPat(params).subscribe((resp: any) => {
      // console.log(resp);

      if (resp.StatusCode == 200) {
        let fullDataSet: any = '';
        fullDataSet = resp.PayLoadDS || [];
        if (resp.PayLoadDS && resp.PayLoadDS.Table && resp.PayLoadDS.Table.length && resp.PayLoadDS.Table[0].PanelID) {
          this.selectedPanel = resp.PayLoadDS.Table[0].PanelID
        }
        if (fullDataSet && fullDataSet.Table && fullDataSet.Table.length) {
          this.outHospitalID = fullDataSet.Table[0].HospitalID;
          const orderNumber = fullDataSet.Table[0].HospitalOrderNo;

          if (this.outHospitalID === 1) {
            this.getVisitsAgainstOrderNumbers(orderNumber);
            this.isurgentbooking = fullDataSet.Table[0].isUrgent;
            const processId = this.isurgentbooking === true ? 2 : 1; // 2=Urgent, 1=Normal
            setTimeout(() => {
              this.selectedTestProfiles.forEach(tp => {
                tp.ProcessId = processId;
              });
            }, 9000);
          }

          this.outSourceHospitalPatData = resp.PayLoadDS.Table;
          console.log("this.outSourceHospitalPatData", this.outSourceHospitalPatData);
          this.outSourceHospitalTPData = resp.PayLoadDS.Table1;
          if ((fullDataSet.Table[0].PatientType == 'IPD' || fullDataSet.Table[0].PatientType == 'ER') && this.outHospitalID === 1)
            this.isLockTPSection = true;
          else
            this.isLockTPSection = false;

          // comment for voucher implementation
          // if (this.outHospitalID === 5 || this.outHospitalID === 6 || this.outHospitalID === 9) {
          //   this.panelIdFromBookingId = fullDataSet.Table[0].PanelIDForBinding;
          //   if (this.outHospitalID === 6) {
          //     this.panelIdFromBookingId = 403;
          //   }
          //   if (this.outHospitalID !== 9)
          //     this.panelTypeFromBookingId = 2;
          //   else {
          //     this.panelTypeFromBookingId = 1;

          //   }
          //   this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 })
          //   if (this.outHospitalID != 9)
          //     this.isLockTPSection = true;
          //   this.lockPatientTypeAndPanel = true;
          // }

          // add for voucher implementation
          if (this.outHospitalID === 3 || this.outHospitalID === 5 || this.outHospitalID === 6 || this.outHospitalID === 9) {
            this.voucherCode = fullDataSet.Table[0].CouPonCode;
            this.panelIdFromBookingId = fullDataSet.Table[0].PanelIDForBinding;
            if (this.outHospitalID === 6) {
              this.panelIdFromBookingId = 403;
            }
            ////////// Oladoc settings/////////
            if (this.outHospitalID === 3) {
              if (this.voucherCode) {
                this.panelIdFromBookingId = 1960;
              } else {
                this.panelIdFromBookingId = 1304;
              }
            }

            if (this.outHospitalID !== 9)
              this.panelTypeFromBookingId = 2;
            else {
              this.panelTypeFromBookingId = 1;

            }
            this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 })
            if (this.outHospitalID != 9)
              this.isLockTPSection = true;
            this.lockPatientTypeAndPanel = true;
          }


          if (this.outHospitalID === 9) {
            this.isLockTPSection = false;
            //here
            setTimeout(() => {
              this.paymentModesList.forEach(a => a.disabled = null);
              this.paymentModesCategoryList.forEach(a => a.disabled = null);
              this.discountFieldDisabled = false;
            }, 9000);

          }
          this.selectedPatientSource = 20;
          this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: fullDataSet.Table[0].OrbitPatientID, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
          // this.getTestProfileList('');

          if (fullDataSet.Table1 && fullDataSet.Table2.length) {

            setTimeout(() => { // some delay for DateOfBirth subscriber
              this.populatePatiensFromMC(fullDataSet.Table2); // list of Patients in Popup
            }, 300);
          }
          else {
            this.populatePatientFields(fullDataSet.Table[0]);
          }
          if (fullDataSet.Table[0].PatientType == 'ER') {
            this.panelIdFromBookingId = 774;
            this.panelTypeFromBookingId = 2;
            this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 })
          }
          else if (fullDataSet.Table[0].PatientType == 'IPD') {
            this.panelIdFromBookingId = 693;
            this.panelTypeFromBookingId = 2;
            this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 })
          }
          else if (fullDataSet.Table[0].PatientType == 'OPD') {
            this.lockPatientTypeAndPanel = true;
            this.panelIdFromBookingId = 689;
            this.panelTypeFromBookingId = 1;
            this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 })
          }
          //   
          else if (fullDataSet.Table[0].PatientType == 'ECLHEMP') {
            this.lockPatientTypeAndPanel = true;
            this.panelIdFromBookingId = 720;
            this.panelTypeFromBookingId = 1;
            this.patientTypeChanged({ TypeId: 2, fromBookingId: 1 })
          }

          setTimeout(() => {
            if (fullDataSet.Table1 && fullDataSet.Table1.length) {
              (this.addTestsFromBooking(fullDataSet.Table1));
            }
          }, 5000);


        } else {
          this.toastr.warning('No record(s) found');
        }
      }
    }, (err) => { console.log(err) })
  }


  _searchPatientByTrackingID(bookingNo) {


    // this.resetPatientBasicInfoFields();
    const patientSearchParams = {
      BookingID: (bookingNo || '').trim(),
      BranchID: this.loggedInUser.locationid
    }
    // if(!environment.production) {
    //   patientSearchParams.BranchID = 69;
    // }
    if (patientSearchParams.BookingID) {
      this.resetAllForm_CompleteRegistration();
      this.unLinkOrbitPatient('');
      this.resetPatientBasicInfoFields();
      this.updateUrlParams_navigateTo('', { cacheControl: (+new Date()) });
      this.spinner.show();
      this.patientService.searchPatientByBookingID(patientSearchParams).subscribe((res: any) => {
        this.bookingNoDisabled = true;
        this.spinner.hide();
        this.resetAllForm_CompleteRegistration();
        this.unLinkOrbitPatient('');
        this.resetPatientBasicInfoFields();
        this.updateUrlParams_navigateTo('', { cacheControl: (+new Date()) });
        // console.log(res); {table}
        // res.PayLoadStr = res.PayLoad;
        if (res && res.StatusCode == 200) {
          let fullDataSet: any = '';
          fullDataSet = res.PayLoadDS || [];
          // try {
          //   fullDataSet = JSON.parse(res.PayLoadStr);
          // } catch (e) {}

          // if(fullDataSet && fullDataSet.Table2 && fullDataSet.Table2.length && fullDataSet.Table2[0].BookingMsg) {
          //   this.toastr.info(fullDataSet.Table2[0].BookingMsg);
          //   return;
          // }
          if (fullDataSet && fullDataSet.Table && fullDataSet.Table.length) {
            this.toastr.success('Patient data loaded');
            // this.searchPatientByPhoneNo(fullDataSet.Table[0].MobileNO || '');
            if (fullDataSet && fullDataSet.Table1 && fullDataSet.Table1.length) {
              this.populatePatiensFromMC(fullDataSet.Table1); // list of Patients in Popup
            } else {
              this.searchPatientByPhoneNo(fullDataSet.Table[0].MobileNO || '');
            }
            this.selectedPatientSource = 20;
            this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: fullDataSet.Table[0].OrbitPatientID, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
            this.populatePatientFields(fullDataSet.Table[0]);
            if (fullDataSet.Table3 && fullDataSet.Table3.length) {
              this.addTestsFromBooking(fullDataSet.Table3);
              // this.spinner.show();
              // setTimeout(function () {
              // let aa = this.addTestsFromBooking(fullDataSet.Table3).then(resp => {
              //   resolve(aa);
              //   if (fullDataSet.Table4 && fullDataSet.Table4.length) {
              //     this.vd = this.helperSrv.addPrefixToDocs(fullDataSet.Table4);
              //   }

              // });

              // this.spinner.hide();
              // }, 2000)

            }

          } else {
            this.toastr.warning('No record(s) found');
            this.bookingNoDisabled = null;
          }
        } else {
          this.toastr.warning('No record(s) found');
          this.bookingNoDisabled = null;
        }
      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide();
      })
    } else {
      this.toastr.warning('Please enter Booking Number');
    }


  }

  clearBooking() {
    this.BookingNo = "";
    this.resetAllForm_CompleteRegistration();
    this.bookingNoDisabled = null;
    this.patientBasicInfo.patchValue({
      BookingPatientID: ''
    });
  }
  populatePatiensFromMC(data) {
    this.mcPatientsPopupRef = this.appPopupService.openModal(this.mcPatientsPopup);
    this.mcPatientsList = data;
  }
  OlaDocPatientPopup() {
    this.OlaDocPopupRef = this.appPopupService.openModal(this.OlaDocPopup, { backdrop: 'static', size: 'md' });
  }
  populateHospitalPatientAndClose() {
    setTimeout(() => {
      if (this.outSourceHospitalPatData && this.outSourceHospitalPatData.length)
        this.populatePatientFields(this.outSourceHospitalPatData[0]);
    }, 200);
    this.appPopupService.closeModal(this.mcPatientsPopupRef);

    // this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: patient.OrbitPatientID, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
    // this.populatePatientFields(patient);
    // //if(environment.production) {
    // this.appPopupService.closeModal()

  }

  closeOlaDocPopup() {
    this.appPopupService.closeModal(this.OlaDocPopupRef);
    const form = this.patientBasicInfo.getRawValue();
    if (!this.OrbitPatientID)
      this.searchPatientByPhoneNo(form.MobileNO);
  }
  closeIsMetalPopup() {
    this.appPopupService.closeModal(this.isMetalPopup);
    console.log("ismetal", this.isMetal)
  }
  patientSelected_MC(patient) {
    this.unLinkOrbitPatient('');
    this.selectedPatientSource = 21;
    this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: patient.OrbitPatientID, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
    this.populatePatientFields(patient);
    //if(environment.production) {
    this.appPopupService.closeModal()
    //}
  }

  olaPatientSelected(patient) {

    this.OlaHospitalMRNo = patient.HospitalMRNo;
    this.OlaHospitalOrderNo = patient.HospitalOrderNo;
    this.OlaHospitalID = patient.HospitalID;
    this.OlaHospitalPatientID = patient.HospitalPatientID;
    this.patientBasicInfo.patchValue({
      B2BDoc: Number(this.OlaDocB2bPanelID)
    });


    this.selectedOlaDiscount = patient.Discount;
    this.getRefByB2bDoctorsMapping(null, this.OlaDocB2bPanelID)
    this.appPopupService.closeModal();
    const form = this.patientBasicInfo.getRawValue();

    //  this.populatePatientFields(patient); 

    if (!this.OrbitPatientID) {
      this.searchPatientByPhoneNo(form.MobileNO);
    }
    else { }
  }

  linkOrbitPatient(patient) {
    this.linkdedPatient = patient;
    this.patientBasicInfo.patchValue({
      PatientID: patient.orbitPatientID
    })
    //if(environment.production) {
    this.appPopupService.closeModal()
    //}
  }
  unLinkOrbitPatient(patient) {
    this.linkdedPatient = null;
    this.patientBasicInfo.patchValue({
      PatientID: ''
    })
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

             if (this.pendingTPIds?.length) {
              this.patchTPTestsFromIds(this.pendingTPIds);
              this.pendingTPIds = [];
              this.isLockTPSection = true;
              this.isVoucherVerifiedArea = false;
            }
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

  patchTPTestsFromIds(tpIds: number[]) {
  if (!this.testProfileList?.length || !tpIds?.length) return;

  tpIds.forEach(id => {
    const test = this.testProfileList.find(t => Number(t.TPId) === Number(id));
    if (test) {
      this.selectEventngbTP({ item: test }, 'Auto');
    } else {
      console.warn('TP not found in testProfileList:', id);
    }
  });

  this.cd.detectChanges();
}
  getRegistrationByUserID(userId = 0) {
    this.selectedRecentVisit = null;
    this.recentRegistrations = [];
    this.appPopupService.openModal(this.recentRegistrationsPopup);
    const params = {
      userId: userId || this.loggedInUser.userid,
    }
    if (params.userId) {
      this.spinner.show(this.spinnerRefs.recentRegs);
      this.patientService.getRegistrationByUserID(params).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.recentRegs);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            this.recentRegistrations = res.PayLoad;
          } else {
            this.toastr.warning('No Registrations');
          }
        } else {
          this.toastr.error('Error: Loading Recent Registrations');
        }
      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide(this.spinnerRefs.recentRegs);
      })
    }
  }
  recentVisitClick(patientId) {
    if (patientId) {
      this.patientBasicInfo.patchValue({
        B2BDoc: 0
      });
      this.selectedPatientSource = 11;
      this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: patientId, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
      // this.searchPatient(patientId);
      this.modalService.dismissAll();
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

  openSearchEmpPopup() {
    this.getEmployeesForTestRegistration();
    this.appPopupService.openModal(this.mcEmployeesPopup);
  }
  empSelectedEvent(e) {
    // console.log(e, this.selectedEmployee.emp);
    // this.selectedEmployee.emp = e;
    this.getEmployeeDetailsAndDependents(e);
  }
  employeeForBookingSelectedEvent(emp) {
    console.log(emp);
    if (emp && emp.PatientId) {
      this.selectedPatientSource = 30;
      this.controlFieldsForEmployee(true);
      this.updateUrlParams_navigateTo('', { p: btoa(JSON.stringify({ orbitPatientID: emp.PatientId, patSrc: this.selectedPatientSource, cacheControl: (+new Date()) })) });
      // this.searchPatient(emp.PatientId);
      this.modalService.dismissAll();
    }
  }
  pendingTPIds: number[] = [];
  selectedEmployeeRequestId: number = null;
  isVoucherVerifiedArea = true;
employeeDependentForBookingSelectedEvent(dep) {
  console.log(dep);
  this.pendingTPIds = [];
  this.selectedEmployeeRequestId = null;
   this.isVoucherVerifiedArea = true;
  if (dep && dep.PatientId) {
    this.selectedPatientSource = 31;
    this.controlFieldsForEmployee(true);
    this.selectedEmployeeRequestId = dep.RequestIds;
    this.pendingTPIds = (dep.TPIds || '').split(',').map(x => Number(x.trim())).filter(x => !isNaN(x));

    this.updateUrlParams_navigateTo('', {p: btoa(JSON.stringify({
        orbitPatientID: dep.PatientId, patSrc: this.selectedPatientSource, cacheControl: (+new Date())
      }))});

    this.modalService.dismissAll();
  }
}

  patchTPTests(selectedObj) {
    if (!this.testProfileList?.length) return;
    const tpIds = selectedObj.TPIds.split(',').map(Number);
    tpIds.forEach(id => {
      const test = this.testProfileList.find(t => t.TPId === id);
      if (test) {
        this.selectEventngbTP({ item: test }, 'Auto');
      }
    });
  }
  
  controlFieldsForEmployee(disable) {
    const patinfo = this.patientBasicInfo.getRawValue();
    this.discountMaxValue = 100;
    if (!this.urlBookingID && !patinfo.BookingPatientID)
      this.patientBasicInfoDisabled = disable ? true : null;
    if (disable) {
      this.patientTypeChanged({ TypeId: 6 }); // this.selectedPatientType = 6;
      this.patientTypeFieldDisabled = disable;
      this.discountPercentage = 100;
      this.discountFieldDisabled = true;
      if (!this.discountPercentage)
        this.selectedApprovAuth = 0;
      this.minimumReceivablePercentage.dynamic = 0;
      this.paymentModesList.forEach(a => a.disabled = true);
      console.log('disableddddddd this.paymentModesList', this.paymentModesList);
    } else {
      if (!this.panelIdFromBookingId && !this.panelIdFromVisitInfo) {
        this.patientTypeChanged({ TypeId: 1 }); // this.selectedPatientType = 1;
        this.patientTypeFieldDisabled = disable;
        if (!this.isDiscountFrombookingID)
          this.discountPercentage = 0;
        this.selectedApprovAuth = 0;
      }
      this.discountFieldDisabled = false;
      if (this.panelTypeFromBookingId != 2) {
        this.minimumReceivablePercentage.dynamic = this.minimumReceivablePercentage.temp;
        this.paymentModesList.forEach(a => a.disabled = null);
        this.paymentModesCategoryList.forEach(a => a.disabled = null);
      }
      // console.log('enable this.paymentModesList', this.paymentModesList);
    }
  }

  populatePatientFields(data) {

    console.log('populatePatientFields', data);
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

    if (data.PanelID) {
      this.selectedPatientType = 2
      const TID = {
        TypeId: 2
      }
      // this.getTestProfileList('');
      this.getPanels();
      // this.panelra
      // this.patientTypeChanged(TID);
    }
    this.patientBasicInfo.patchValue({
      isWhatsapNumber: 0
    })
    // if (this.route.routeConfig.path == 'regForHS') {
    //   regModule = '2';
    // }
    this.patientBasicInfo.patchValue({
      PatientID: data.OrbitPatientID || data.patientID || data.PatientID || '', // data.patientID || '',
      MRNo: data.OrbitMRNo || '', // data.patientID || '',
      // OrbitPatientID: data.orbitPatientID || '',
      // PatientVaccineNo: data.pvNo || '',
      Salutation: this.getSalutationByTitle(data.Salutation || data.SalutationTitle || '').toString().trim(),
      FirstName: data.FirstName || data.Name || '',
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
      RefDoc: null,
      /*[{
        Name: 'Self'
      }],*/
      RefNo: data.RefNo || '',
      InternalRemarks: data.InternalRemarks || '',
      PatientComments: data.PatientComments || '',
      WhatsapNo: data.WhatsAppNo || ''
    });
    if (data.WhatsAppNo === data.PhoneNO && data.PhoneNO && data.WhatsAppNo) {
      this.patientBasicInfo.patchValue({
        isWhatsapNumber: 1
      })
    }
    this.isMetal = data.isMetal || 0
    if (this.urlBookingID || this.BookingNo || this.RefByFromVisitAssciate) {
      this.patientBasicInfo.patchValue({
        RefDoc: this.isAirportLocation() ? { Name: 'Self' } : data.RefByDoc || this.RefByFromVisitAssciate ? { Name: data.RefByDoc || this.RefByFromVisitAssciate } : null
      });
    }
    if (data.OrbitPatientID || data.patientID || data.PatientID) { // don't apply validation for old data
      this.cnicValidationCheck = false;
    }
    this.selectedPanel = data.PanelID || this.panelIdFromBookingId || this.panelIdFromVisitInfo;

    this.discountPercentage = data.DiscountPerc;
    this.selectedApprovAuth = data.DiscountedBy;


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


    this.patientBasicInfoFormForCovid.patchValue({
      CNIC: data.CNIC || '',
      PassportNo: data.PassportNo || '',
      HomeAddress: data.HomeAddress || '',
      PhoneNO: data.PhoneNO || '',
      MobileOperatorID: data.MobileOperatorID || '',
      MobileNO: data.MobileNO || '',
      Emails: data.Email || '',
      CountryID: data.CountryID || this.countryIdForPak || 0,
      CityID: data.CityID || 0,
      BloodGroup: data.BloodGroup || ''
    });

    this.patientBasicInfoFormForDengue.patchValue({
      CNIC: data.CNIC || '',
      PassportNo: data.PassportNo || '',
      HomeAddress: data.HomeAddress || '',
      PhoneNO: data.PhoneNO || '',
      MobileOperatorID: data.MobileOperatorID || '',
      MobileNO: data.MobileNO || '',
      Emails: data.Email || '',
      CountryID: data.CountryID || this.countryIdForPak || 0,
      CityID: data.CityID || 0,
      BloodGroup: data.BloodGroup || '',
      Per_DistrictID: data.PermanentDistrictID,
      Per_TehsilID: data.PermanentTehsilID,
    });

    if (this.panelIdFromBookingId && this.panelIdFromVisitInfo) {
      this.getApprovingAuthoritiesByDiscount();
    }
    this.reApplyPermissions();

    const form = this.patientBasicInfo.getRawValue();

    if (!this.OlaDocPatients.length && form.MobileNO) {
      if (this.OlaDocB2bPanelID != "") {
        this.getHospitalPatientByHospitalID(3, form.MobileNO, 0);
      }
    }

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

  checkSalutaion() {
    const patientData = this.patientBasicInfo.getRawValue();
    console.log("patientData.Salutation ", patientData.Salutation);
    if (patientData.Salutation === 'Other') {
      this.byPassReqPatientData = true
    }
    else {
      this.byPassReqPatientData = false
    }
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
  getValidAddedTestsProfiles() {

    return this.selectedTestProfiles.filter(a => a.allowForReg != false);
  }
  _addTestsFromBooking(testsData): Promise<any> {
    return new Promise((resolve, reject) => {

      testsData.forEach(element => {
        const tp = this.testProfileList.find(a => a.TPId == element.TPID);
        // if(tp) {
        //   tp = JSON.parse(JSON.stringify(tp));
        //   tp.ProcessId = 1;
        //   this.selectedTestProfiles.push(tp);
        // }
        if (tp) {
          if (!this.selectedTestProfiles.find(a => a.TPId == tp.TPId)) {
            const aa = JSON.parse(JSON.stringify(tp));
            aa.ProcessId = 1;
            this.selectedTestProfiles.push(aa);
            resolve(this.selectedTestProfiles)
          } else {
            // this.toastr.info('Already selected');
          }
        }
        this.recalculateAmounts();
        setTimeout(() => {
          this.selectedTPItem = '';
        }, 100);
      });


    });
  }
  // addTestsFromBooking(testsData) {
  //   testsData.forEach(tp => {
  //     let aa = JSON.parse(JSON.stringify(tp));
  //     aa.ProcessId = 1;
  //     this.selectedTestProfiles.push(tp);
  //   });
  //   this.recalculateAmounts();
  //   setTimeout(() => {
  //     this.selectedTPItem = '';
  //   }, 100);
  // }
  /*
  addTestsFromBooking(testsData) {
    testsData.forEach(element => {
      let tp = this.testProfileList.find(a => a.TPId == element.TPID);
      // if(tp) {
      //   tp = JSON.parse(JSON.stringify(tp));
      //   tp.ProcessId = 1;
      //   this.selectedTestProfiles.push(tp);
      // }
      if (tp) {
        if (!this.selectedTestProfiles.find(a => a.TPId == tp.TPId)) {
          let aa = JSON.parse(JSON.stringify(tp));
          aa.ProcessId = 1;
          this.selectedTestProfiles.push(aa);
          // resolve(this.selectedTestProfiles)
        } else {
          // this.toastr.info('Already selected');
        }
      }
      this.recalculateAmounts();
      setTimeout(() => {
        this.selectedTPItem = '';
      }, 100);
    });
  }
  */
  addTestsFromBooking(testsData) {
    if (this.selectedPanel) {
      // this.patientTypeChanged()
    }
    // console.log(testsData);
    testsData.forEach(element => {
      this.selectEventngbTP({ item: element }, 'FrombookingID');
      // let tp = this.testProfileList.find(a => a.TPId == element.TPID);
      // // if(tp) {
      // //   tp = JSON.parse(JSON.stringify(tp));
      // //   tp.ProcessId = 1;
      // //   this.selectedTestProfiles.push(tp);
      // // }

      // // if (tp) {
      // // if (!this.selectedTestProfiles.find(a => a.TPId == tp.TPId)) {
      // // let aa = JSON.parse(JSON.stringify(tp));
      // // aa.ProcessId = 1;
      // this.selectedTestProfiles.push(element);
      // // } else {
      // // this.toastr.info('Already selected');
      // // }
      // // }
      // this.recalculateAmounts();
      setTimeout(() => {
        this.selectedTPItem = '';
        if (this.panelIdFromBookingId && this.panelIdFromVisitInfo)
          this.patientTypeChanged({ TypeId: 2 });
      }, 100);
    });
  }
  loadSelectedAttachmentFileMultiple(event) {
    const files = (event.target as HTMLInputElement).files; // event.target.files;
    if (files.length) {
      this.spinner.show();
      const loadImagePromises = [];
      try {
        Array.from(files).forEach((file: any, i) => {
          loadImagePromises.push(this.loadImage(file, 'file_' + ++i));
        });
        Promise.all(loadImagePromises).then(responses => {
          event.target.value = '';
          this.spinner.hide();
          this.visitAttachments = [...this.visitAttachments, ...responses];
          console.log('kkkkkkkkkkkkkkkk responses => ', responses, this.visitAttachments);
        }, (errors) => {
          event.target.value = '';
          this.spinner.hide();
          console.log(errors);
        });
      } catch (e) {
        event.target.value = '';
        this.spinner.hide();
      }
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
  removeVisitAttachment(attachment) {
    if (attachment) {
      this.visitAttachments = this.visitAttachments.filter(a => a.uniqueIdentifier != attachment.uniqueIdentifier);
    } else {
      this.visitAttachments = [];
    }
  }

  toggleRenameField(action, attachment) {
    this.enableRenameVisitAttachmentField = -1;
    if (action == 'show') {
      if (attachment) {
        this.enableRenameVisitAttachmentField = attachment.uniqueIdentifier;
      }
    }
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
  getLoadedVisitDocs(e) {
    // console.log('doccccccccccccccccccccs ', e);
    // this.visitAttachments = [...this.visitAttachments, ...e];
    this.visitAttachments = e;
    // this.toastr.warning(this.visitAttachments.toString());
  }

  getVisitAttachmentsData() {
    const docs = [];
    /*
    public class DocumentsModelForVisit
    {
      public int? VisitDocumentID { get; set; }
      public int? VisitID { get; set; }
      public string VisitDocTitle { get; set; }
      public string Remarks { get; set; }
      public byte[] VisitDocumentPic { get; set; }
      public string VisitDocBase64 { get; set; }
      public string VisitDocBase64Thumbnail { get; set; }
      public string VisitDocType { get; set; }
      public int VisitDocSourceID { get; set; } // { id to identify from where file is uploaded }
    }
    */

    this.visitAttachments.forEach(a => {
      docs.push({
        VisitDocumentID: null,
        VisitID: null,
        VisitDocTitle: a.fileName,
        Remarks: '',
        VisitDocumentPic: null, // a.data.replace(/^data:image\/[a-z]+;base64,/, ""), // it will be converted to byte[] in API for backward support
        VisitDocBase64: a.data,
        VisitDocBase64Thumbnail: a.thumbnail,
        VisitDocType: a.fileType,
        VisitDocSourceID: 1, // from registration, visit creation
        // CreatedBy: this.loggedInUser.userid
      });
    })

    return docs;
  }
  hcBookingAttachments() {
    const attachments = [];
    if (this.visitAttachments.length) {
      this.visitAttachments.forEach(a => {
        attachments.push({
          BookingPatientID: null,
          BookingPatientDocumentTitle: a.fileName,
          Remarks: '',
          DocType: a.fileType,
          DocumentPic: a.thumbnail,
          DocumentImage1: a.thumbnail,
        });
      })
    }
    return attachments;
  }
  getFinalDataSet() {
    let InsuranceStatusID = null;
    let PatientInsuranceID = this.PatientInsuranceID;
    let InsurancePolicyID = this.InsuarancePolicyDetail.InsurancePolicyID;
    const isOfferExpire = this.InsuranceActive ? this.InsuranceActive.isOfferExpire : null
    const isReactivePolicy = this.isReactivePolicy === true ? "true" : "false";
    if (this.patientVisitInfo.netAmount >= this.InsuarancePolicyDetail.ActiveOnPaidAmount) {
      if (this.isUpgradePolicyAllowed) {
        InsuranceStatusID = 6
      }
      else if (this.isPatientWilling == "true") {
        InsuranceStatusID = 2
      }
      else if (this.isPatientWilling == "false") {
        InsuranceStatusID = 3
      }
      // else if (this.isEligibleForInsuranceActiveDate == false) {
      //   InsuranceStatusID = 8
      // }
      else if (isReactivePolicy == "true") {
        InsuranceStatusID = 7
      }
    }
    else {
      PatientInsuranceID = null;
      InsuranceStatusID = null
      InsurancePolicyID = null
      // isOfferExpire = null
    }
    if (InsuranceStatusID == null) {
      InsurancePolicyID = null
      // isOfferExpire = null
    }
    const patientInfo = this.patientBasicInfo.getRawValue();
    if (patientInfo.BookingPatientID && this.BookingNoFromDB !== patientInfo.BookingPatientID) {
      this.toastr.error("Your booking id is not valid, Please contact home collection department asap");
      return;
    } //  this.patientBasicInfo.value;
    if (InsuranceStatusID == null && this.PanelType && this.PanelType != 2) {
      this.toastr.warning("Please select patient willing status");
      return;
    }
    let totalCalculatedDiscount = 0;

    // this.selectedTestProfiles.forEach( a=> {
    //   let _discountedValue = a.IsDiscountable && this.discountPercentage ? (((a.TestProfilePrice || 0) * this.discountPercentage) / 100) : 0;
    //   _discountedValue = Math.round(_discountedValue);
    //   totalCalculatedDiscount += _discountedValue;
    // })
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
      BookingPatientID: (this.BookingNoFromDBVal || this.urlBookingID),
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

    this.getValidAddedTestsProfiles().forEach((a, i) => {
      let _discountedValue = a.IsDiscountable && this.discountPercentage ? (((a.TestProfilePrice || 0) * this.discountPercentage) / 100) : 0;
      _discountedValue = Math.round(_discountedValue);
      totalCalculatedDiscount += _discountedValue;
      const testProfileObj = {
        PacslinkSectionName: a.ModalityCode,
        SubSectionID: a.SubSectionID,
        VisitId: null,
        TPId: a.TPId,
        Price: (a.TestProfilePrice || 0),
        Remarks: null,
        StatusId: (a.TPStatusID || 1),
        ProcessId: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].PatientType == 'ER' ? 2 : a.ProcessId || 1, // { 1: normal, 2: urgent }
        SCollectionId: null,
        DeliveryDate: a.DeliveryDate || null,
        // InitBy: null,
        // InitDateTime: null,
        // FinalEditor: null,
        Title: (a.TestProfileName || '').trim(),
        // SampleId: null,
        // IsCancel: false,
        // SyncStatus: null,
        RegLock: 1, // _branchId,
        PackageId: a.forPkg || -1,
        Discount: _discountedValue,
        isHomeSamplingTestProfile: a.isHomeSamplingTestProfile || 0,
        PCTCode: a.PCTCode || '',
        // FinalDateTime: null,
        // MarkAs: null

        /*
        GrossAmount: this.parseNumbericValues(a.TestProfilePrice || 0),
        TPCost: this.parseNumbericValues(a.TestProfilePrice || 0),
        ServiceCharges: this.parseNumbericValues(a.serviceCharges || 0),
        Discount: this.parseNumbericValues(_discountedValue),
        NetAmount: this.parseNumbericValues((a.TestProfilePrice + a.serviceCharges - _discountedValue)),
        */

        TaxRateFBR: null,
        SaleValueFBR: null,
        DiscountFBR: null,
        TaxChargedFBR: null,
        TotalAmountFBR: null,
      }
      let aa = {};
      let teleArr = {};
      teleArr = {
        TestName: a.TestProfileCode,
        "PriceOfTest": this.testProfileList.filter(z => { return z.TPId == a.TPId }).map(y => { return y.RegTestProfilePrice }).toString(),//a.TestProfilePrice,
        "Discount": this.testProfileList.filter(z => { return z.TPId == a.TPId }).map(y => { return y.RegTestProfilePrice - y.TestProfilePrice }).toString(),
        "Name": this.telenorePatientInfo.Name,
        "Relation": this.telenorePatientInfo.Relation
      }
      telenoretestProfileArr.push(teleArr)
      aa = this.outSourceHospitalTPData.filter(c => { return c.TPId == a.TPId }).map(b => {
        aa = {
          "OrderDetailId": b.HPOrderDetailID,
          "Amount": a.TestProfilePrice,
          "TPId": a.TPId
        }
        ecltestProfileArr.push(aa);
      }
      )
      testProfileArr.push(testProfileObj);
    });

    console.log("ecltestProfileArr", ecltestProfileArr);
    let outSourceHospitalPatient = {}

    if (this.outHospitalID == 1) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 1,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }
    else if (this.outHospitalID == 5) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 5,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }
    else if (this.outHospitalID == 6) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 6,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }
    else if (this.outHospitalID == 7) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 7,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }

    else if (this.outHospitalID == 8) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.hospitalOrderNumber,
        HospitalID: 8,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }

    else if (this.outHospitalID == 9) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 9,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }
    else if (this.outHospitalID == 3) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 3,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }
    else if (this.outHospitalID == 4) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        HospitalID: 4,
        HospitalPatientID: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalPatientID ? this.outSourceHospitalPatData[0].HospitalPatientID : null,
        // Invoices_Detail: ecltestProfileArr
      };
    }
    else if (this.outHospitalID == 2) {
      outSourceHospitalPatient = {
        HospitalMRNo: this.teleHospitalMRN,
        HospitalOrderNo: null,
        HospitalID: this.outHospitalID,
        HospitalPatientID: this.teleHospitalPatientID
      }
    }
    else if (this.OlaHospitalID == 3) {
      outSourceHospitalPatient = {
        HospitalMRNo: Number(this.OlaHospitalMRNo),
        HospitalOrderNo: Number(this.OlaHospitalOrderNo),
        HospitalID: 3,
        HospitalPatientID: Number(this.OlaHospitalPatientID)
      }
    }

    const ecltestProfileArrObj = {
      "Orders": [{
        HospitalMRNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalMRNo ? this.outSourceHospitalPatData[0].HospitalMRNo : null,
        HospitalOrderNo: this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].HospitalOrderNo ? this.outSourceHospitalPatData[0].HospitalOrderNo : null,
        Invoices_Detail: ecltestProfileArr
      }]
    };

    /*
    let selectedPanelType = 0;
    if(this.selectedPanel) {
      let _selectedPanel = this.panelsList.find( a=> a.PanelId == this.selectedPanel);
      selectedPanelType = _selectedPanel.PanelType;
    }
   
    if(totalCalculatedDiscount == 0
      && ((this.selectedPatientType && this.selectedPatientType == 6) || (selectedPanelType == 2))) {
      totalCalculatedDiscount = this.patientVisitInfo.grossAmount;
    }
    */
    const ismob = this.detectMob();
    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);
    const visitObj = {
      VisitID: null,
      PatientID: patientInfo.PatientID || null,
      // VisitNo: this.patientVisitInfo.visitNo,
      Remarks: this.patientVisitInfo.remarks || null,
      ReceiptNo: null,
      LocId: _branchId,
      LocCode: this.loggedInUser.currentLocation,
      TokenID: null,
      HeadId: 3,
      AdjAmount: totalCalculatedDiscount, // (this.patientVisitInfo.discount || 0),
      PercentAdjAmount: 0, // this.discountPercentage || 0,
      NetAmount: (this.patientVisitInfo.grossAmount), // this.patientVisitInfo.netAmount
      PaidAmount: totalAmountByPaymentModes, // (this.patientVisitInfo.netAmount),
      // RefBy: patientInfo.RefDoc ? patientInfo.RefDoc.Name : null,
      RefBy: this.isNoRefChecked
        ? this.newRefBy || null // if checkbox checked → manual text value
        : patientInfo.RefDoc?.Name || null, // else → dropdown object’s Name
      RefNo: patientInfo.RefNo,
      InternalRemarks: patientInfo.InternalRemarks,
      PatientComments: patientInfo.PatientComments,
      TypeId: this.selectedPatientType ? this.selectedPatientType : 1, // 1 for Regular
      PanelId: (this.selectedPanel || ''), // this.selectedPanel ? this.selectedPanel.PanelId : '', // this.patientVisitInfo.corporateClientID || null,
      SyncStatus: null,
      IsCancel: 0,
      RefDocId: 0, // patientInfo.RefDoc ? patientInfo.RefDoc.RefId : null,
      PercentDiscount: this.discountPercentage || 0,
      ShowReportsToPanelPatients: null,
      B2BDoctorID: patientInfo.B2BDoc || 0
      /*
      GrossAmount: this.parseNumbericValues(this.patientVisitInfo.grossAmount),
      Discount: this.parseNumbericValues(this.patientVisitInfo.discount),
      DiscountApprovingAuthority: this.selectedApprovAuth || 0,
      NetAmount: this.parseNumbericValues(this.patientVisitInfo.netAmount),
      */
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
    let redeemingRewardPoints = 0;
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
      if (a.ModeId == 5) {
        redeemingRewardPoints = this.parseNumbericValues(a.amount || 0);
      }
      if (a.ModeId == 6) {
        _payObj.OnlinePaymentReferenceID = this.refnumberforQRCode?.[0]?.ReferenceID ?? null;
      }
    });
    /*
    if(this.selectedDiscountCard && this.selectedDiscountCard.RedeemingRewardPoints) { // reward pointes entry
      let _payObj = JSON.parse(JSON.stringify(payObj));
      _payObj.Amount = this.parseNumbericValues(this.selectedDiscountCard.RedeemingRewardPoints || 0);
      _payObj.ModeId = 5;
      _payObj.InstNo = null,
      _payObj.InstNo = null,
      _payObj.InstInvoiceNo = null
      paymentArr.push(_payObj);
    }
    */

    const filesData = this.getVisitAttachmentsData();
    /**/
    // paymentArr = paymentArr.filter( a => a.PaidAmount); // remove credit or cash entry if amount is zero
    if (!paymentArr.length) { //} && !this.selectedPanel) {
      paymentArr.push(payObj);
    }
    // if(this.selectedPanel) { // don't add payments for Credit Panel
    //   let _selectedPanel = this.panelsList.find( a=> a.PanelId == this.selectedPanel);
    //   if(_selectedPanel && _selectedPanel.PanelType == 2) { // Credit Panel
    //     paymentArr = [];
    //   }
    // }

    const _flightDetails = this.patientFlightDetails.getRawValue();
    console.log(_flightDetails);
    let formattedFlightDate = null;
    if (_flightDetails.FlightDate) {
      formattedFlightDate = `${_flightDetails.FlightDate.year}-${_flightDetails.FlightDate.month}-${_flightDetails.FlightDate.day}`;
    }
    let flightDetails = []
    if (this.isAirline() || this.isEmbassy()) {
      flightDetails = [{
        VisitId: null,
        AirlineId: _flightDetails.AirlineId || 0,
        FlightNo: this.getAirlineCode(_flightDetails.AirlineId || 0) + _flightDetails.FlightNo || '',
        FlightDate: formattedFlightDate || null,
        BookingReferenceNo: _flightDetails.BookingReferenceNo || '',
        AirportId: _flightDetails.AirportId || 0,
        CreatedBy: this.loggedInUser.userid,
        CreatedOn: new Date()
      }]
    }

    let _patImg = null;
    if (patientInfo.PatientPic) {
      try {
        _patImg = patientInfo.PatientPic.split('base64,')[1]
      } catch (e) { }
    }

    const _patVaccineDetails = this.patientVaccineDetails.value;

    let patVaccineDetails = [];
    if (_patVaccineDetails.VaccineID > 0) {
      let formattedVaccineDate = null;
      let _VaccinationStatus = 0;
      if (_patVaccineDetails.VaccineDate) {
        formattedVaccineDate = `${_patVaccineDetails.VaccineDate.year}-${_patVaccineDetails.VaccineDate.month}-${_patVaccineDetails.VaccineDate.day}`
      }

      const objSelectedVacc = this.vaccinesList.find(o => o.VaccineID == _patVaccineDetails.VaccineID);
      if (objSelectedVacc) {
        _VaccinationStatus = 100;
        const vaccDosageReq = objSelectedVacc.DoseRequired;
        console.log("dose req:", vaccDosageReq, objSelectedVacc);
        if (vaccDosageReq == 1 && _patVaccineDetails.Dosage == 1) {
          _VaccinationStatus = 2;
        }
        else if (vaccDosageReq == 2 && _patVaccineDetails.Dosage == 1) {
          _VaccinationStatus = 1;
        }
        else if (vaccDosageReq == 2 && _patVaccineDetails.Dosage == 2) {
          _VaccinationStatus = 2;
        }
      }

      patVaccineDetails = [{
        PatientID: _patVaccineDetails.PatientID || 0,
        VaccineID: _patVaccineDetails.VaccineID || 0,
        Dosage: _patVaccineDetails.Dosage || 0,
        VaccineDate: formattedVaccineDate || new Date(),
        VaccinationCenter: _patVaccineDetails.VaccinationCenter || '',
        VaccinationStatus: _VaccinationStatus || 0
      }]
    }

    let regModule = '1';
    if (this.route.routeConfig.path == 'regForHS') {
      regModule = '2';
    }

    const userWithoutPic: UserModel = JSON.parse(JSON.stringify(this.loggedInUser));
    userWithoutPic.pic = '';
    const details = {
      appVersion: CONSTANTS.APP_VERSION,
      webDeskVersion: this.auth.getWebDeskVersionFromStorage(),
      user: userWithoutPic
    };
    const mobNoti = [];
    this.MobDeviceNotificationsList.map(a => {
      const obj = {
        MobileDeviceNotificationID: a.MobileDeviceNotificationID,
        DeviceToken: a.DeviceToken,
        Title: a.Title,
        DeviceModel: a.DeviceModel,
        JSONExpoResp: "",
        PatientPortalUserID: a.PatientPortalUserID
      }
      mobNoti.push(obj);
    })
    let telenorePatInfo = {};
    if (this.telenorecardOwnerInfo) {
      telenorePatInfo = {
        LabId: "145c80f7-8cff-4f6c-940d-de24a1c79d51",
        MobileNumber: this.telenorecardOwnerInfo.length ? JSON.parse(this.telenorecardOwnerInfo).MobileNumber : null,
        Date: "12/07/2022",
        TotalAmount: telenoretestProfileArr.reduce((acc, cv) => { return Number(acc) + Number(cv.PriceOfTest) }, 0),//visitObj.NetAmount.toString(),
        TotalPaidAmount: visitObj.PaidAmount.toString(),
        TotalDiscountAmount: telenoretestProfileArr.reduce((acc, cv) => { return Number(acc) + Number(cv.Discount) }, 0),
        TestDetails: telenoretestProfileArr
        // [
        //   {
        //     TestName: "LFT",
        //     PriceOfTest: "1000",
        //     Discount: "200",
        //     Relation: "Mother",
        //     Name: "Nabeel bhai",
        //   }
        // ]
      }
    }
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
    const preTravelnfo = this.patientBasicInfoFormForCovid.getRawValue();
    const denguelnfo = this.patientBasicInfoFormForDengue.getRawValue();
    const RegistrationModel = {
      // FBRInvoiceNo: '',
      DiscountPerc: this.discountPercentage,
      RadiologistID: this.RadiologistID,
      FBRRequestData: '',
      MACAddress: this.loggedInUser.macAdr || '',
      discountedBy: this.selectedApprovAuth,
      createdBy: this.loggedInUser.userid || -99,
      homeSamplingEmpId: (this.homeSamplingEmpFieldShow ? (this.selectedHomeSamplingEmp || 0) : null),
      CNICRelation: preTravelnfo.CNICRelation || null,
      ProvinceID: this.loggedInUser.provinceID, //preTravelnfo.ProvinceID //|| 7,  //
      DistrictID: denguelnfo.DistrictID || null,
      TehsilID: denguelnfo.TehsilID || null,
      FreeTestRequestIds: this.selectedEmployeeRequestId || null,
      Per_TehsilID: denguelnfo.Per_TehsilID || null,
      Per_DistrictID: denguelnfo.Per_DistrictID || null,
      Per_Address: preTravelnfo.Per_Address || null,
      WhatsAppNo: this.patientBasicInfo.getRawValue().WhatsapNo,
      isSendWhatsApp: this.patientBasicInfo.getRawValue().isWhatsapNumber == true ? 1 : 0,
      isMetal: this.isMetal == true ? 1 : 0,
      patientPic: _patImg,
      regModule: regModule,
      systemDetails: JSON.stringify(details),

      // Discount Card Info
      RewardPointTypeID: this.selectedPatientType == 8 && this.selectedDiscountCard ? 2 : null, // redeemingRewardPoints ? 2 : null,
      RewardPercentPoint: this.selectedPatientType == 8 && this.selectedDiscountCard ? this.selectedDiscountCard.RewardPercentPoint : null, // redeemingRewardPoints || null,
      CardID: ((this.selectedPatientType == 8 && this.selectedDiscountCard) ? this.selectedDiscountCard.CardId : null),

      // createdByName: this.loggedInUser.fullname,
      patient: [patientObj],
      outsourceHospitalPat: this.outSourceHospitalPatData.length || outSourceHospitalPatient ? [outSourceHospitalPatient] : null,
      ECLOrders: this.outSourceHospitalPatData.length && this.outHospitalID === 1 ? [ecltestProfileArrObj] : null,
      telenoreOrders: this.telenorecardOwnerInfo.length ? [telenorePatInfo] : null,
      visit: [visitObj],
      MobileNotification: mobNoti,
      testProfile: testProfileArr,
      payment: paymentArr,
      docs: filesData,
      flightDetails: flightDetails,
      PatientVaccineDetails: patVaccineDetails,
      BrowserTypeID: ismob ? 1 : 0,
      IsSendNotification: 1,
      PatientInsuranceID: PatientInsuranceID,
      InsuranceStatusID: InsuranceStatusID,
      InsurancePolicyID: InsurancePolicyID,
      isOfferExpire: isOfferExpire,
      ARYCardNumber: this.patientInforARY.getRawValue().CardNo || null,
      ARYPinCode: !this.patientInforARY.getRawValue().CardNo || this.patientInforARY.getRawValue().CardNo == '' ? "0000" : this.patientInforARY.getRawValue().PINCode,  //this.patientInforARY.getRawValue().PINCode || null
      ARYToken: parsedValue ? parsedValue.Token : null,
      CouponCode: this.voucherCode ? this.voucherCode : null,
      ARYTokenKey: parsedValue ? parsedValue.TokenKey : null,
      Branchcode: this.loggedInUser.currentLocation,
      NewRef: this.isNoRefChecked ? 1 : 0,
      NewRefByCity: this.newRefByCity || null
    }
    // console.log(patVaccineDetails);
    return RegistrationModel;
  }



  getHCBookingFinalDataSet() {
    let totalCalculatedDiscount = 0;
    const testProfileArr = [];
    let testProfileArrr = {};
    const testProfileObj = {};
    const filesData = this.hcBookingAttachments();

    this.getValidAddedTestsProfiles().forEach(a => {
      let _discountedValue = a.IsDiscountable && this.discountPercentage ? (((a.TestProfilePrice || 0) * this.discountPercentage) / 100) : 0;
      _discountedValue = Math.round(_discountedValue);
      totalCalculatedDiscount += _discountedValue;
    })

    testProfileArrr = this.getValidAddedTestsProfiles().map(a => ({

      // a.TestProfileDiscount = ;   // p-(p*0.1)
      VisitId: null,
      TPId: a.TPId,
      Price: (a.TestProfilePrice || 0),
      Discount: a.IsDiscountable && this.discountPercentage ? a.TestProfilePrice - (a.TestProfilePrice * this.discountPercentage / 100) : 0,
      Remarks: null,
      StatusId: (a.TPStatusID || 1),
      ProcessId: a.ProcessId || 1, // { 1: normal, 2: urgent }
      SCollectionId: null,
      DeliveryDate: a.DeliveryDate || null,
      Title: (a.TestProfileName || '').trim(),
      RegLock: 1, // _branchId,
      PackageId: a.forPkg || -1,
      // Discount: totalCalculatedDiscount,
      isHomeSamplingTestProfile: a.isHomeSamplingTestProfile || 0,
    }
    ))



    // testProfileArrr = testProfileArr;
    const patientInfo = this.patientBasicInfo.getRawValue();
    const preTravelnfo = this.patientBasicInfoFormForCovid.getRawValue();
    const formattedDob = patientInfo.DateOfBirth.year + "-" + patientInfo.DateOfBirth.month + "-" + patientInfo.DateOfBirth.day;//`${patientInfo.DateOfBirth.year}-${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}`;
    const formattedHCdDateTime = this.HCDateTime.year + "-" + this.HCDateTime.month + "-" + this.HCDateTime.day + ' ' + this.HCtime.hour + ':' + this.HCtime.minute;//`${patientInfo.DateOfBirth.year}-${patientInfo.DateOfBirth.month}-${patientInfo.DateOfBirth.day}`;
    const OnlineBookedTPNames = this.selectedTestProfiles.map(a => { return a.TestProfileCodeDesc }).join(',');
    const radiosrv = this.selectedTestProfiles.find(a => { return a.IsHCRadioSrv }) ? 1 : 0;
    console.log("radiosrv");
    console.log("this.linkdedPatient", this.linkdedPatient);
    const PatientData = {
      FirstName: patientInfo.FirstName, //Conversions.capitalizeFirstLetter(patientInfo.FirstName || ''),
      LastName: patientInfo.LastName, //Conversions.capitalizeFirstLetter(patientInfo.LastName || ''),
      DateOfBirth: formattedDob,
      MobileNo: patientInfo.MobileNO,
      Phone: patientInfo.PhoneNO,
      AlternateContact: patientInfo.AlternateContact,
      MobileOperatorID: Number(patientInfo.MobileOperatorID),
      Email: patientInfo.Emails || null,
      TestIDs: '',
      Address: patientInfo.HomeAddress,
      Gender: patientInfo.Gender,
      CNIC: patientInfo.CNIC,
      City: null,
      DocRefByName: patientInfo.RefDoc ? patientInfo.RefDoc.Name : null,
      PatientNotes: '',
      onlinePatientID: this.OrbitPatientID || null,
      SalutationID: ((this.salutationsList.find(a => a.SalutationTitle == patientInfo.Salutation) || {}).SalutationID || 0),
      SalutationTitle: patientInfo.Salutation,
      TPDiscount: 0,
      OnlineBookedTPData: testProfileArrr,
      OnlineBookedTPTotalAmount: (this.patientVisitInfo.grossAmount), //
      TotalBillAmountToReceive: (this.patientVisitInfo.netAmount), //
      OnlineBookedDocuments: filesData,
      reCaptchaToken: '',
      isHomeCollection: 1,
      Latitude: this.patLocationForHC.position.lat(),
      Longitude: this.patLocationForHC.position.lng(),
      GoogleAddressName: 'abc',//this.patLocationForHC.GoogleAddressName, 
      BookByEmpID: this.loggedInUser.userid,
      HCDateTime: formattedHCdDateTime,
      IsUrgentBooking: this.isBookingUrgent,
      TPCodes: OnlineBookedTPNames,
      BookingSourceID: this.hcBookingSourceID || null,
      HCCityID: Number(this.hcCityID) || null,
      BookingPanelID: (this.selectedPanel || ''),
      BookingDiscountPercentage: this.discountPercentage ? this.discountPercentage.toFixed(3) : 0,
      DiscountedBy: this.selectedApprovAuth,
      HCRemarks: this.HCRemarks,
      RiderID: this.SelRider.selRiderID,
      HCBookingStatusID: this.getHCBookingStatusID(), //"selRiderID": '' 
      HCRiderName: this.SelRider.selRiderName,
      HCRiderCellNo: this.SelRider.selRiderContactNumber,
      CreatedBy: this.loggedInUser.userid,
      VisitID: this.selVisit,
      isSendMsgAllowed: this.isLockTPSection ? false : true,
      PassportNumber: preTravelnfo.PassportNo,
      IsHCRadioSrv: radiosrv,
      HCTechnicianIDs: this.SelTechIDToAssign ? this.SelTechIDToAssign.join(',') : null,
      HCDoctorIDs: this.SelDoctorIDToAssign ? this.SelDoctorIDToAssign : null,
      HCHelperIDs: this.SelhelpingStaffIDToAssign ? this.SelhelpingStaffIDToAssign : null,
      CMSRequestNo: this.CMSRequestNo ? this.CMSRequestNo : null
    }

    return PatientData;
  }

  getHCBookingStatusID(): number {
    const riderId = this.SelRider?.selRiderID;
    const bookingStatus = this.BookingStatusID;

    if (bookingStatus && riderId) return 1;
    if (riderId && !bookingStatus) return 3;
    if (riderId !== null && riderId !== undefined && bookingStatus) return 1;

    return 1; // default case
  }

  InsertUpdatePatientVisit_Next() {
    // console.log(this.patientBasicInfo);

  }
  openConscentForm() {
    const styleSheet = `
      <style>
        body {
          width: 21cm;
          height: 29.7cm;
          margin: auto;
          font-size: 13px;
          font-family: "Calibri",sans-serif;
        }
        .page {
          width: 21cm;
          height: 29.7cm;
          margin: auto;
          border: 1px solid #000;
          padding: 0px 12px;
          margin-bottom: 50px;
        }
        .printable-area {
          border-collapse: separate;
          border-spacing: 0;
          font-family: verdana, roboto, 'trebuchet MS', 'Lucida sans';
          color: #212121;
          background: #ffffff;
          width: 100%;
          font-size: 10px;
          text-align: left;
        }

        .printable-area thead > tr > th {
          border-right: 1px solid #C9CED3;
          border-bottom: 3px solid #eee;
          padding: 2px 2px 2px 5px;
        }
        .printable-area  tbody > tr > td {
          border-bottom: solid 1px #ededed;
          padding: 2px 2px 2px 5px;
        }

        .cost-column {
          text-align: right;
          padding-right: 5px;
        }
        .no-print{
          display:none;
        }
        .header-area{
          text-align: center;
          font-family: verdana, roboto, 'trebuchet MS', 'Lucida sans';
          margin-top:5px;
          margin-bottom:5px;
        }
        .report-name {
          font-weight: bold;
          font-size: 16px;
        }
        .branch-name {
          font-weight: bold;
          font-size: 14px;
        }
        .report-dates {
          font-weight: bold;
          font-size: 16px;
        }
        .sales-person-info {
          font-weight: bold;
          font-size: 16px;
        }
        .printed-by-area {
          font-size: 10px;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .page {
            border: 1px solid #eee;
          }
          div.divFooter {
            position: fixed;
            bottom: 0;
            font-family: verdana, roboto, 'trebuchet MS', 'Lucida sans';
            font-size: 9px;
          }
          .pagebreak { clear: both; page-break-before: always; } /* page-break-after works, as well */
        }
      </style>`;

    const printedByText = `${this.loggedInUser.username || ''} @ ${moment(new Date()).format('DD-MMM-YYYY HH:mm:ss')}`;
    const header = `<div class="header-area">
                      <div class="branch-name"><span class="label">Islamabad Diagnostic Centre (Pvt Ltd</span></div>
                        <div class="report-name"><span class="label">Consent & Case report form for Novel Coronavirus COVID-19</span></div>
                        </div>`;
    const footer = `<div class="divFooter printed-by-area">${printedByText}</div>`;

    setTimeout(() => {
      let data = ConscentForms.covid.airlinesOath; // general;

      if (this.selectedPanel) {
        const panelConscent = ConscentForms.covid[this.selectedPanel];
        if (panelConscent) {
          data += '<div class="pagebreak"> </div>';
          data += panelConscent;
        } else {
          data += '<div class="pagebreak"> </div>';
          data += ConscentForms.covid.general;
        }
      }

      // patientBasicInfo = this.fb.group({
      //   PatientID: [''],
      //   MRNo: [''],
      //   BookingPatientID: [''],
      //   Salutation: [''],
      //   FirstName: [''], //, Validators.required],
      //   LastName: [''],
      //   CNIC: [''],
      //   PassportNo: [''],
      //   Gender: [''],
      //   DateOfBirth: [''],
      //   Age: [{ value: '', disabled: false }, ''],
      //   dmy: [{ value: '3', disabled: false }, ''],
      //   FatherName: [''],
      //   HomeAddress: [''],
      //   PhoneNO: [''],
      //   MobileOperatorID: [''],
      //   MobileNO: [''],
      //   Emails: [''],
      //   ModifyBy: [0],
      //   PatientPic: [''],
      //   Religion: [''],
      //   CountryID: [this.countryIdForPak],
      //   CityID: [0],
      //   BranchID: [''],
      //   BloodGroup: [''],
      //   MaritalStatus: [''],
      //   ReferenceNo: [''],
      //   Designation: [''],
      //   RefDoc: '',
      //   RefNo: [''],
      //   InternalRemarks: [''],
      //   PatientComments: [''],
      // });


      const patData = this.patientBasicInfo.getRawValue();
      const flightData = this.patientFlightDetails.getRawValue();
      let flightDate = "";
      if (flightData.FlightDate && flightData.FlightDate.day && flightData.FlightDate.month && flightData.FlightDate.year) {
        flightDate = moment(new Date(`${flightData.FlightDate.month}-${flightData.FlightDate.day}-${flightData.FlightDate.year}`)).format('DD-MMM-YYYY');
      }
      let selectedDob = "";
      if (patData.DateOfBirth && patData.DateOfBirth.day && patData.DateOfBirth.month && patData.DateOfBirth.year) {
        selectedDob = moment(new Date(`${patData.DateOfBirth.month}-${patData.DateOfBirth.day}-${patData.DateOfBirth.year}`)).format('DD-MMM-YYYY');
      }

      data = this.helperSrv.replaceAll(data, '[PATIENT_NAME]', patData.Salutation + ' ' + patData.FirstName + ' ' + patData.LastName);
      data = this.helperSrv.replaceAll(data, '[PATIENT_AGE]', patData.Age + ' ' + (this.dmyEnum.find(a => a.id == patData.dmy) || { name: '' }).name);
      data = this.helperSrv.replaceAll(data, '[PATIENT_DOB]', selectedDob);
      data = this.helperSrv.replaceAll(data, '[PATIENT_GENDER]', patData.Gender);
      if (patData.MobileNO) {
        data = this.helperSrv.replaceAll(data, '[PATIENT_MOBILE]', patData.MobileNO);
      } else {
        data = this.helperSrv.replaceAll(data, '[PATIENT_MOBILE]', patData.PhoneNO);
      }
      data = this.helperSrv.replaceAll(data, '[PATIENT_ADDRESS]', patData.HomeAddress);
      data = this.helperSrv.replaceAll(data, '[PATIENT_EMAIL]', patData.Emails);
      data = this.helperSrv.replaceAll(data, '[PATIENT_VISIT_DATE]', moment().format('DD-MMM-YYYY HH:mm'));
      // CNIC
      const cnic = (patData.CNIC || '').toString().padEnd(13, ' ').split('');
      cnic.forEach((digit, idx) => {
        // data = data.replace('[PATIENT_CNIC_'+idx+']', digit);
        data = this.helperSrv.replaceAll(data, '[PATIENT_CNIC_' + idx + ']', digit);
      });
      // data = data.replace('[PATIENT_CNIC_1]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_2]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_3]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_4]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_5]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_6]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_7]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_8]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_9]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_10]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_11]', patData.Age);
      // data = data.replace('[PATIENT_CNIC_12]', patData.Age);

      data = this.helperSrv.replaceAll(data, '[PATIENT_CNIC]', (patData.CNIC || ''));
      let nationality = '';
      if (patData.CountryID) {
        nationality = (this.countriesList.find(a => a.CountryId == patData.CountryID) || { Country: '' }).Country;
      }
      data = this.helperSrv.replaceAll(data, '[PATIENT_NATIONALITY]', (nationality || ''));
      data = this.helperSrv.replaceAll(data, '[PATIENT_FLIGHT_NO]', (this.getAirlineCode(flightData.AirlineId) || 0) + (flightData.FlightNo || ''));
      data = this.helperSrv.replaceAll(data, '[PATIENT_FLIGHT_DATE]', (flightDate || ''));


      data = this.helperSrv.replaceAll(data, '[PATIENT_PPNO]', (patData.PassportNo || ''));
      data = this.helperSrv.replaceAll(data, '[PATIENT_BOOKING_REF_NO]', (flightData.BookingReferenceNo || '')); // ticket no
      data = this.helperSrv.replaceAll(data, '[PATIENT_LAB]', (patData.Lab || ''));
      data = this.helperSrv.replaceAll(data, '[PATIENT_SAMPLE_COLLECTION_LOC]', '');
      //BookingReferenceNo

      const customWindow = window.open('Covid Registration Conscent Form1', 'Covid Registration Conscent Form1' + +new Date());
      customWindow.document.write('<html><head>' + styleSheet + '');
      customWindow.document.write('</head><body>');
      // customWindow.document.write('<h3>' + header + '</h3>');
      customWindow.document.write(data);
      customWindow.document.write(footer);
      customWindow.document.write('</body></html>');
      customWindow.print();
      if (environment.production) {
        setTimeout(a => { customWindow.close(); }, 1000);
      }
    }, 500);
  }


  openFloroConsentForm() {
    const styleSheet = `
     <style>
       body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .header-table, .footer {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .header-table td, .header-table th, .footer div {
            padding: 10px;
            border: 1px solid #ccc;
        }
        .header-table th {
            text-align: left;
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .form-title {
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
            margin: 20px 0;
        }
        .body {
            padding: 10px;
            border: 1px solid #ccc;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            text-align: left;
        }
        .footer div {
            flex: 1;
            margin-right: 10px;
        }
        .footer div:last-child {
            margin-right: 0;
        }
    </style>`;



    const data = ` <!-- Header Section -->
    <table class="header-table">
        <tr>
            <th>Name</th>
            <th>Age/Gender</th>
            <th>Date</th>
        </tr>
        <tr>
            <td>____________________</td>
            <td>____________________</td>
            <td>____________________</td>
        </tr>
        <tr>
            <th>MR No</th>
            <th>Patient ID</th>
            <th>Contact No</th>
        </tr>
        <tr>
            <td>____________________</td>
            <td>____________________</td>
            <td>____________________</td>
        </tr>
    </table>

    <!-- Form Title -->
    <div class="form-title">CONSENT FORM OF FLUOROSCOPY PROCEDURE</div>

    <!-- Body Section -->
  
<div><strong>1. Test/Procedure Name:</strong> ______________________________</div>
        <div><strong>2. Type of contrast used:</strong> ______________________________</div>
        <div><strong>3. Pregnancy Alert (for females):</strong></div>
        <p>To avoid any hazardous effects of x-rays and contrast agent to developing fetus, please provide the following information:</p>
        <div><strong>Are you pregnant? </strong> Yes / No</div>
        <div><strong>LMP Date:</strong> ______________</div>
        <div><strong>4. Patient’s clinical history and findings:</strong> ____________________________</div>
        <div><strong>5. History of any allergy:</strong> ____________________________</div>
        <div><strong>6. Any previous history of surgery:</strong> ____________________________</div>
        <div><strong>7. History and date of previous intervention/endoscopy/colonoscopy with or without biopsy:</strong></div>
        <div>____________________________________________________________________</div>
        <div><strong>8. Any previous imaging study / Record available:</strong> ____________________________</div>

        <p>I hereby give written consent for (sedation / general anesthesia WITH / WITHOUT) to my patient for fluoroscopy procedure as it is required for this examination. The said procedure and its complication have been explained to me and I have no hesitation in undergoing this test. I will not hold any person responsible for any (complication --- mild or severe) which may occur as a result of contrast medium/procedure.</p>
    <!-- Footer Section -->
    <div class="footer">
        <div>
            <strong>Patient/Guardian Signature & Name:</strong> ______________________
        </div>
        <div>
            <strong>Signature & Name of Technician:</strong> ______________________
        </div>
        <div>
            <strong>Name & Signature of Doctor:</strong> ______________________
        </div>
    </div>
 `;

    const customWindow = window.open('', '_blank', 'width=800,height=600');
    customWindow.document.write(`<html><head>${styleSheet}</head><body>${data}</body></html>`);
    customWindow.document.close();
    customWindow.print();
  }
  openMediConsentForm() {
    const styleSheet = `
    <style>   body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        padding: 20px;
                        border: 1px solid #ccc;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 {
                        text-align: center;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .signature-section {
                        margin-top: 30px;
                    }
                    .signature-section label {
                        display: block;
                        font-weight: bold;
                        margin-top: 10px;
                    }
                    .signature-section input[type="text"] {
                        width: 100%;
                        padding: 8px;
                        margin-top: 5px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }
                </style>
    `;

    const data = `
    <h1>IV/Oral Medication/Cannulation Consent Form</h1>
                <p>
                    I do hereby consent for the IV medications as advised by the physician's prescription. I understand that
                    like any intervention despite best medical practice some chances of risk still remain which may vary
                    from minimal reactions to serious adverse reactions including risk of mortality. I give my consent for the
                    IV access and treatment to proceed.
                </p>
                <div class="signature-section">
                    <label for="name-signature">Parent/Guardian/Patient Name & Signature:</label>
                    <input type="text" id="name-signature" placeholder="">
                </div>
                <div class="signature-section">
                    <label for="date">Dated:</label>
                    <input type="text" id="date" placeholder="">
                </div>
    `;

    const customWindow = window.open('', '_blank', 'width=800,height=600');
    customWindow.document.write(`<html><head>${styleSheet}</head><body>${data}</body></html>`);
    customWindow.document.close();
    customWindow.print();
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
      this.addedPaymentModes[0].amount = this.parseNumbericValues(this.patientVisitInfo.netAmount);
    }
  }
  connectToCCMachine() {
    const obj = {
      user: this.loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'CCDetail', userIdentity: JSON.stringify(obj) });
  }
  // removeAddedPaymentMode(item) {
  //   item.amount = '';

  //   this.addedPaymentModes = this.addedPaymentModes.filter(a => a.uniqueId != item.uniqueId);
  //   if (this.selectedPatientType !== 7) {
  //     this.paymentModesList.forEach(element => { // disable added payment mode button
  //       if (element.uniqueId == item.uniqueId) {
  //         element.disabled = null;
  //       }
  //     });
  //   }

  //   // this.paymentModesListUnselected = this.paymentModesList.filter(a => !this.addedPaymentModes.map(b => b.uniqueId).includes(a.uniqueId));
  //   this.recalculateAmounts();
  // }

   removeAddedPaymentMode(item) {
    item.amount = '';
    this.qrString = '';
    // this.verifyRAASTSuccess = false;
    this.addedPaymentModes = this.addedPaymentModes.filter(a => a.uniqueId != item.uniqueId);
    if (this.selectedPatientType !== 7) {
      this.paymentModesList.forEach(element => { // disable added payment mode button
        if (element.uniqueId == item.uniqueId) {
          element.disabled = null;
        }
      });
      this.paymentModesCategoryList.forEach(element => { // disable added payment mode button
        if (element.PaymentModeCategoryID == item.ModeId) {
          element.disabled = null;
        }
      });
    }

    // this.paymentModesListUnselected = this.paymentModesList.filter(a => !this.addedPaymentModes.map(b => b.uniqueId).includes(a.uniqueId));
    this.recalculateAmounts();
  }

  discountValueChanged() {
    this.selectedApprovAuth = 0;
    try {
      const dis = Number(this.discountPercentage);
      if (dis > this.discountMaxValue) {
        this.discountPercentage = this.discountMaxValue;
      }
    } catch (e) { }
    this.recalculateAmounts();
    this.getApprovingAuthoritiesByDiscount();
  }
  recalculateAmounts() {
    // add for voucher implementation
    if (this.isVoucherVerified) {
      this.recalculateAmountsVoucher();
      return
    }
    const testProfileCost = this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice');

    let totalCalculatedDiscount = 0;
    this.nonDiscountableTests = [];
    this.getValidAddedTestsProfiles().forEach(a => {
      let _discountedValue = a.IsDiscountable && this.discountPercentage ? (((a.TestProfilePrice || 0) * this.discountPercentage) / 100) : 0;
      if (!a.IsDiscountable) {
        this.nonDiscountableTests.push(a.TestProfileCode);
      }
      // console.log('aaaaa ',a, _discountedValue);
      _discountedValue = Math.round(_discountedValue);
      totalCalculatedDiscount += _discountedValue;
    })

    const _discountedValue = this.parseNumbericValues(totalCalculatedDiscount); // this.parseNumbericValues((testProfileCost * this.discountPercentage) / 100);
    this.discountedCharges = this.parseNumbericValues((testProfileCost - _discountedValue));
    this.patientVisitInfo.discount = this.parseNumbericValues(_discountedValue);

    const _payInfo = {
      grossAmount: this.parseNumbericValues(Number(testProfileCost)),
      netAmount: this.parseNumbericValues(Number(testProfileCost - this.patientVisitInfo.discount))
    }

    // this.patientVisitPaymentInfo.cashAmount = this.parseNumbericValues(_payInfo.netAmount);
    // this.patientVisitPaymentInfo.creditCard = {amount: 0, slipNo: '', cardNo : ''};
    this.patientVisitInfo.grossAmount = this.parseNumbericValues(_payInfo.grossAmount);
    this.patientVisitInfo.netAmount = this.parseNumbericValues(_payInfo.netAmount);
    this.minimumReceivableAmount = Math.round((this.minimumReceivablePercentage.dynamic * this.parseNumbericValues(this.patientVisitInfo.netAmount)) / 100);

    this.paymentModesValueUpdated();
    this.currencyNoteReceivedChanged();

    /*
    let intRemarksLen = (this.allRemarks.InternalRemarks || '').trim().length;
    if (
      ((this.discountPercentage && !this.discountFieldDisabled)
        || this.parseNumbericValues(this.patientVisitInfo.netAmount) - this.parseNumbericValues(this.getTotal(this.addedPaymentModes, 'amount')))
      && intRemarksLen < 10
    ) {
      // this.toastr.warning('Please enter remarks');
      this.allRemarks.InternalRemarksClass = 'invalid invalid-highlighted';
      return;
    } else {
      this.allRemarks.InternalRemarksClass = '';
    }
    */
  }
  currencyNoteReceivedChanged() {
    this.currencyNoteChangeAmount = this.parseNumbericValues(this.currencyNoteReceived);
    const cashMode = this.addedPaymentModes.find(a => a.ModeId == 1);
    if (cashMode) {
      // console.log(this.currencyNoteReceived, this.currencyNoteChangeAmount, cashMode, '   1111  ',  this.parseNumbericValues(this.currencyNoteReceiveda) - this.parseNumbericValues(cashMode.amount));
      this.currencyNoteChangeAmount = this.parseNumbericValues(this.currencyNoteReceived) - this.parseNumbericValues(cashMode.amount);
      if (this.currencyNoteChangeAmount < 0) {
        this.currencyNoteChangeAmount = 0;
      }
      // console.log(this.currencyNoteChangeAmount);
    }
  }
  paymentModesValueUpdated(paymentMode: any = '') {
    // this.recalculateAmounts();
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
    if (totalAmountByPaymentModes > this.patientVisitInfo.netAmount) {
      this.toastr.warning('Amount is exceeded than bill amount');
      if (paymentMode) {
        paymentMode.amount = 0;
      } else {
        this.addedPaymentModes.forEach(a => {
          a.amount = 0;
        })
      }
    }
    this.currencyNoteReceivedChanged();

    /*
    let intRemarksLen = (this.allRemarks.InternalRemarks || '').trim().length;
    if (
      ((this.discountPercentage && !this.discountFieldDisabled)
        || this.parseNumbericValues(this.patientVisitInfo.netAmount) - this.parseNumbericValues(this.getTotal(this.addedPaymentModes, 'amount')))
        && intRemarksLen < 10
    ) {
      // this.toastr.warning('Please enter remarks');
      this.allRemarks.InternalRemarksClass = 'invalid invalid-highlighted';
      return;
    } else {
      this.allRemarks.InternalRemarksClass = '';
    }
    */
  }

  approvingAuthorityChanged() {
    // console.log(this.selectedApprovAuth);
    // this.discountPercentage = 0;
    // this.recalculateAmounts();
  }
  mainPanelsList = []
  patientTypeChanged(e) {
    this.mainPanelsList = [];
    this.panelsList = [];
    this.showHideConscentFormButton();
    this.selectedPatientType = ((e && e.TypeId) ? e.TypeId : 1);

    if (this.selectedPatientType == 1) {
      setTimeout(() => {
        this.isPatientWilling = "true";
        this.isEligibleForInsurancePanel = true;
        this.isshowprogressbar = true;
        this.isEligibleForInsurance = true;
        this.cd.detectChanges();
      }, 10);
      // console.log("isEligibleForInsurancePanel:", this.isEligibleForInsurancePanel);
      // console.log("selectedTestProfiles.length:", this.selectedTestProfiles.length);
      // console.log("isByPassInsuarancePolicy:", this.isByPassInsuarancePolicy);
      // console.log("getProgressValue():", this.getProgressValue());
    }
    else if (this.selectedPatientType == 2 || this.selectedPatientType == 6) {
      this.isEligibleForInsurancePanel = false;
      this.isshowprogressbar = false;
      this.isEligibleForInsurance = false;
    }
    // if(this.selectedPatientType_prev == 2 || this.selectedPatientType == 2) { // load all tests only if deselecting panel or switching to panel
    //   this.getTestProfileList('');
    // }
    // this.selectedPatientType_prev = this.selectedPatientType;
    // && e.fromBookingId == 1
    if (e && this.panelIdFromBookingId || this.panelIdFromVisitInfo) {
      this.selectedPanel = this.panelIdFromBookingId;
    } else {
      this.selectedPanel = null;
    }
    // if (!this.panelIdFromBookingId && !this.panelIdFromVisitInfo)
    // this.selectedPanel = null;
    this.resetPatientFlightDetailsPopup();
    this.hideDiscountCardsField(true);
    // console.log(e);
    if (!this.isDiscountFrombookingID)
      this.discountPercentage = 0;

    this.discountFieldDisabled = false;
    this.discountMaxValue = 100;
    this.selectedApprovAuth = 0;
    this.minimumReceivablePercentage.dynamic = this.minimumReceivablePercentage.temp;
    this.paymentModesList.forEach(a => a.disabled = null);
    this.paymentModesCategoryList.forEach(a => a.disabled = null);
    if (e && e.TypeId == 5) {
      this.discountFieldDisabled = true;
      this.minimumReceivablePercentage.dynamic = 100;
    }
    if (e && e.TypeId == 2 || e.TypeId == 5) {
      // this.selectedPatientType_prev = 2;
      // Panel selected
      this.getPanels();
    } else {
      this.panelsList = [];
      this.recalculateDiscountAndMinPayable();
      /*
      if (e && e.TypeId) {
        console.log('e.TypeId ', e.TypeId)
        switch (e.TypeId) {
          case 5: // Panel Securities
            this.discountPercentage = 0;
            this.discountFieldDisabled = true;
            this.selectedApprovAuth = 0;
            this.minimumReceivablePercentage.dynamic = 100;
            break;
  
          case 7: // FOC
            this.discountPercentage = 100;
            this.discountFieldDisabled = true;
            this.selectedApprovAuth = 0;
            this.minimumReceivablePercentage.dynamic = 0;
            this.paymentModesList.forEach(a => a.disabled = true);
            break;
  
          case 8: // Discount Card
            this.hideDiscountCardsField(false);
            break;
          case 1: //regular
            this.paymentModesList.forEach(a => a.disabled = null);
            break;
  
          default:
            break;
        }
      }
      */
    }
    // if (this.selectedPatientType_prev == 2 || this.selectedPatientType == 2) {
    //   if (this.panelTypeFromBookingId != 2 && this.paneltypeFromVisitInfo != 2) {
    //     this.panelChanged(
    //       {
    //         PanelType: this.panelTypeFromBookingId || this.paneltypeFromVisitInfo,
    //         PanelId: this.panelIdFromBookingId || this.paneltypeFromVisitInfo
    //       })
    //   }
    // }
    if (this.selectedPatientType_prev == 2 || this.selectedPatientType == 2) {
      if (this.panelTypeFromBookingId != 2 && this.paneltypeFromVisitInfo != 2)
        this.panelChanged('');
      else
        this.panelChanged(
          {
            PanelType: this.panelTypeFromBookingId || this.paneltypeFromVisitInfo,
            PanelId: this.panelIdFromBookingId || this.paneltypeFromVisitInfo
          })
    }
    this.selectedPatientType_prev = this.selectedPatientType;

    this.addedPaymentModes.forEach(a => { // remove all payments
      this.removeAddedPaymentMode(a);
    })

    this.convertSelectedTestProfiles({ PanelId: this.selectedPanel });

    setTimeout(() => {
      this.panelsList = (e.TypeId === 5) ? this.mainPanelsList.filter(panel => panel.PanelType === 2) : [...this.mainPanelsList];
    }, 1000);
  }
  panelChanged(e) {
    console.log(" PanelChanged ~ e:", e)
    if (!e || !e.PanelId) {
      this.convertSelectedTestProfiles({ PanelId: null });
      this.getTestProfileList('');
    }
    this.stickerText = "";
    this.isLockTPOnly = false;
    if (this.AryPanelid && e.PanelId == this.AryPanelid) { //ARY sahoolat panel case  stg
      // if (e.PanelId == 1957) { //ARY sahoolat panel case  stg
      // if (e.PanelId == 2148) { //ARY sahoolat panel case  LIVE
      // this.spinner.show();
      this.isLockTPOnly = true;
      const cookieARYValue = this.getCookie("arytokendata");

      if (cookieARYValue) {
        this.SearchARYSahulatCustomer();
      }
      else {
        this.GetARYToken();
      }
    }

    const MaxHealthPanels = [
      '1721', //"MAX-IDCAFG"
      '487',  //"MAX10P"
      '488', //"MAX20P"
      '493', //"MAX30P"
      '1547',//"MAX50P"
      '486', //"MAX8P"
      '486', //"MAX8P"
      '727', //"MAXASKARI"
      '1009', //"MAXBB"
      '730', //"Max Culture"
      //  '863', // "MAXDR"
      '707', // "Max East West Insurance"
      //  '507', // "MAXECHO"
      '1926', // "Health Econex for Maxhealth."
      '665', // "MAXFSA"
      '626', // "MAX HEALTH IGI"
      '505', // "MAXIPD"
      '505', // "MAXIPD"
      '260', // "MAXJLI"
      '619', // "MAXMED
      '650', // "MAXMEDICT"
      '264', // "MAXPQFT"
      '463', // "MAXNAYATEL"
      '691', // "MAXRAILWAY"
      '200', // "MAXOPD"
      '789', // "MAXRAY"
      '1930', // "MAXPNAC"
      '1933', // "MAXSLC"
      '757', // "MAXRTIP"
      '748', // "MAXSNB"
      '728', // "MAXTP"
      '246', // "MAXSBP"
      '251', // "MAXZTBL"
      '1832', // "MAXSNGPL"
      '1832', // "MAXSNGPL"
      '1154', // "MAXSSC - SEhat Sahulat Card for Admitted Patients"
    ];
    if (e && MaxHealthPanels.includes(e.PanelId.toString())) {
      this.openSwalForMaxHealthPanel();
    }

    if (e.PanelType == 2)
      this.isPatientWilling = null;
    else
      this.isPatientWilling = "true";
    if (e && e.isInsuranceAvailable) {
      this.isEligibleForInsurancePanel = true;
      this.isshowprogressbar = true;
    }
    else {
      this.isshowprogressbar = false;
      this.isEligibleForInsurancePanel = false;
      this.isPatientWilling = null;
    }
    this.showHideConscentFormButton();
    this.getTestProfileList('');
    this.convertSelectedTestProfiles(e);
    // console.log(e);
    this.addedPaymentModes = [];
    // this.paymentModesList.forEach(a => a.disabled = null);
    this.resetPatientFlightDetailsPopup();
    if (!this.panelIdFromBookingId)
      this.minimumReceivablePercentage.dynamic = this.minimumReceivablePercentage.temp;

    this.recalculateDiscountAndMinPayable();

    this.discountMaxValue = 100;
    if (e && e.PanelType) {

      // setTimeout(() => {
      // let disAllowedToPanel = (this.panelsList.find(a => a.PanelId == e.PanelId) || { MaxDiscount: 0 }).MaxDiscount || 0;
      const disAllowedToPanel = this.panelsList.length > 0
        ? (this.panelsList.find(a => a.PanelId == e.PanelId)?.MaxDiscount ?? 0)
        : this.discountMaxValue;
      this.discountMaxValue = disAllowedToPanel; // (this.panelsList.find(a => a.PanelId == e.PanelId) || {MaxDiscount: 100}).MaxDiscount || 100;

      // }, 9000);
      this.discountFieldDisabled = false;
      switch (e.PanelType) {
        case 1: // Cash Panel          
          this.discountPercentage = 0;
          if (this.discountMaxValue <= 0) {
            this.discountFieldDisabled = true;
          }
          this.selectedApprovAuth = 0;
          this.paymentModesList.forEach(a => a.disabled = null);
          this.paymentModesCategoryList.forEach(a => a.disabled = null);
          break;

        case 2: // Credit Panel
          this.discountPercentage = 0;
          this.PanelType = e.PanelType;
          // if (this.discountMaxValue <= 0) {
          this.discountFieldDisabled = true;
          // }

          this.selectedApprovAuth = 0;
          if (this.selectedPatientType == 5) {
            this.minimumReceivablePercentage.dynamic = 100;
          }
          else {
            this.minimumReceivablePercentage.dynamic = 0;
          }
          if (this.selectedPatientType != 5)
            this.paymentModesList.forEach(a => a.disabled = true);
          break;

        case 3: // Hybrid Panel
          this.discountPercentage = 0;
          if (this.discountMaxValue <= 0) {
            this.discountFieldDisabled = true;
          }
          this.selectedApprovAuth = 0;
          this.minimumReceivablePercentage.dynamic = 0;
          this.paymentModesList.forEach(a => a.disabled = null);
          this.paymentModesCategoryList.forEach(a => a.disabled = null);
          break;

        default:

          break;
      }
    }
    // if (!this.panelIdFromBookingId) {
    this.addedPaymentModes.forEach(a => { // remove all payments
      this.removeAddedPaymentMode(a);
    })
    this.isEmbassy();
    this.isAirline();
    // };

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
              this.SearchARYSahulatCustomer();
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
    this.selectedTestProfiles = []

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
      "ARYToken": parsedValue.Token,//cookieARYValue.tokenData.Token,
      "ARYTokenKey": parsedValue.TokenKey, //cookieARYValue.TokenKey
      "Branchcode": this.loggedInUser.currentLocation//this.loggedInUser.locationid
    }
    this.shareSrv.getData(API_ROUTES.SEARCH_ARY_CUSTOMER, params).subscribe((resp: any) => {
      this.spinner.hide();

      if (resp.Status == true && resp.ResponseCode == "200" && resp.Customer != null) {
        this.isLockTPOnly = false
        // this.toastr.success(resp.ResponseMessage);
        this.toastr.success("This Customer has been found in ARY Sahoolat Database.");

        // this.stickerText = "This patient is an " + resp.Customer.CardNumber;

        if (/^\d+$/.test(resp.Customer.CardNumber)) {
          this.stickerText = "This patient is an ARY Card Member. Card No: " + resp.Customer.CardNumber;
        } else {
          this.stickerText = "This patient is an " + resp.Customer.CardNumber;
        }

        // this.patientInforARY.get('CardNo')?.enable();
        // this.patientInforARY.patchValue({ CardNo: resp.Customer.CardNumber })
        console.log("this.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNothis.patientInforARY.value.CardNo", this.patientInforARY.value.CardNo); // might still be null
        this.appPopupService.openModal(this.arySahulatPopup);
      }
      else if (resp.Status == false && resp.ResponseCode == "006" && resp.Customer == null) {
        this.toastr.error(resp.ResponseMessage);
        this.showNoRecordModal(resp.ResponseMessage);
        this.isLockTPOnly = true;
      }
    }, (err) => {
      this.spinner.hide();

      console.log(err)
    })
  }

  // New method to display a modal for no record found
  showNoRecordModal(message: string) {
    this.noRecordMessage = message;
    this.appPopupService.openModal(this.noRecordPopup);
  }
  retrySearch() {
    this.SearchARYSahulatCustomer(); // Or clear fields and re-trigger if needed
  }

  //create ARY Customer
  createARYSahoolatCustomer() {
    //here
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
      CellNo: this.patientBasicInfo.getRawValue().MobileNO ? this.patientBasicInfo.getRawValue().MobileNO.replace(/^0/, '92') : this.patientBasicInfo.getRawValue().PhoneNO.replace(/^0/, '92'),
      City: "Islamabad",
      CNICNo: this.patientBasicInfo.getRawValue().CNIC || "",  // Valid CNIC format
      WhatsAppNo: this.patientBasicInfo.getRawValue().WhatsapNo || "",  // Optional
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
      "ARYToken": parsedValue.Token,//cookieARYValue.tokenData.Token,
      "ARYTokenKey": parsedValue.TokenKey, //cookieARYValue.TokenKey
      "Branchcode": this.loggedInUser.currentLocation//this.loggedInUser.locationid
    }
    this.shareSrv.getData(API_ROUTES.ARY_REGISTER_CUSTOMER, params).subscribe((resp: any) => {
      if (resp.Status === true && resp.ResponseCode === "200") {
        this.appPopupService.openModal(this.aryecustomersuccessPopup);
        this.isLockTPOnly = false;
        this.stickerText = "This patient is an E-member now";

      } else {
        this.toastr.error(resp.ResponseMessage || "Failed to create E-Customer. Please try again.");
      }
    }, (err) => { console.log(err) })
  }
  openARYSahulatPopup() {
    this.appPopupService.openModal(this.arySahulatPopup);
  }

  recalculateDiscountAndMinPayable() {
    if (this.selectedPatientType) {
      // console.log('e.TypeId ', this.selectedPatientType)
      switch (this.selectedPatientType) {
        case 5: // Panel Securities
          this.discountPercentage = 0;
          setTimeout(() => {
            this.discountFieldDisabled = true;
          }, 500);
          this.selectedApprovAuth = 0;
          this.minimumReceivablePercentage.dynamic = 100;
          break;

        case 7: // FOC
          this.isEligibleForInsurancePanel = false
          this.discountPercentage = 100;
          this.discountFieldDisabled = true;
          this.selectedApprovAuth = 0;
          this.minimumReceivablePercentage.dynamic = 0;
          this.paymentModesList.forEach(a => a.disabled = true);
          break;

        case 8: // Discount Card
          this.hideDiscountCardsField(false);
          break;
        case 1: //regular
          this.paymentModesList.forEach(a => a.disabled = null);
          this.paymentModesCategoryList.forEach(a => a.disabled = null);
          break;

        default:
          break;
      }
    }
  }
  homeSamplingEmpChanged(e) {
    console.log('sdfsfd ', e);
  }
  isWhatsapCheckChange() {
    const WhatsapNo = this.patientBasicInfo.getRawValue().WhatsapNo;
    const isWhatsapNumber = this.patientBasicInfo.getRawValue().isWhatsapNumber;

    if (isWhatsapNumber && WhatsapNo === '') {
      const mobileno = this.patientBasicInfo.getRawValue().MobileNO;
      this.patientBasicInfo.patchValue({
        WhatsapNo: mobileno
      })
    }
    else if (!isWhatsapNumber) {
      this.patientBasicInfo.patchValue({
        WhatsapNo: ''
      })
    }
  }
  disableEnter(event: KeyboardEvent) {
    event.preventDefault();
  }
  discountCardChanged(e) {
    console.log(e);
    this.discountPercentage = 0;

    this.discountFieldDisabled = true;
    this.selectedApprovAuth = 0;
    if (e && e.DiscountInPercent) {
      // discount e.DiscountInPercent
      this.discountPercentage = (Number(e.DiscountInPercent || 0) || 0);
    }
    this.recalculateAmounts();
  }
  redeemRewardPointsChangedEvent(e, paymentItem = null) {
    console.log(e.target.value, this.selectedDiscountCard.RedeemingRewardPoints, this.selectedDiscountCard);
    let availableRewardPoints = this.selectedDiscountCard.RewardPoints;
    if (availableRewardPoints <= 0) {
      availableRewardPoints = 0;
    }
    if (e.target.value < 0 || e.target.value > availableRewardPoints) {
      this.toastr.warning('Max allowed Reward Points are: <b>' + this.selectedDiscountCard.RewardPoints + '</b>', '', { enableHtml: true });
      this.selectedDiscountCard.RedeemingRewardPoints = availableRewardPoints;
    }
    // if(paymentItem){
    //   this.addedPaymentModes = this.addedPaymentModes.filter(a => a.ModeId != 5);
    //   this.paymentModesValueUpdated(paymentItem);
    // }
    // TODO: add entry in AddedPaymentModes
  }

  convertSelectedTestProfiles(panel) {
    // this.selectedTestProfiles.filter(a => a.TypeId == 3).forEach(a => {
    //   this.removeSelectedTestProfile(a);
    //   this.toastr.warning('Packages are removed, Please select them again.');
    // })
    // don't include Package parameters
    const tpIds = this.selectedTestProfiles.filter(a => !a.forPkg).map(a => a.TPId).join(',').trim();
    if (!tpIds) {
      return;
    }
    let panelId = '';
    if (this.selectedPanel) {
      panelId = this.selectedPanel;
    }
    if (panel && panel.PanelId) {
      panelId = panel.PanelId
    }
    const _params = {
      tpids: tpIds,
      code: null,
      desc: null,
      branchId: this.loggedInUser.locationid,
      panelId: this.selectedPatientType !== 5 ? panelId : '', // || (this.selectedPanel ? this.selectedPanel.PanelId : '')
    }
    if (!this.loggedInUser.locationid) {
      this.toastr.warning('Branch ID not found');
      this.selectedTestProfiles.forEach(a => {
        a.allowForReg = false;
      })
      return;
    }
    //if (!this.outSourceHospitalPatData) {
    this.selectedTestProfiles.forEach(a => {
      a.allowForReg = false;
    })
    //}
    this.spinner.show();
    this.tpService.getTestsByNameParsed(_params).subscribe(resp => {
      this.spinner.hide();
      /*
      (resp || []).forEach(element => {
        element.ProcessId = 1;
      });
   
      let notAllowedForPanel = this.selectedTestProfiles.filter(a => resp.find(b => b.TPId == a.TPId) ? false : true); // remove already added tests/profiles
      notAllowedForPanel.forEach(element => {
        element.allowForReg = false;
        element.TestProfilePrice = 0;
      });
      //TestProfilePrice
   
      this.selectedTestProfiles = [...resp, ...notAllowedForPanel];
      */
      this.selectedTestProfiles.forEach(a => {
        if (!a.IsDiscountable && (this.selectedPatientType == 6 || this.selectedPatientType == 7)) {
          a.allowForReg = false;
        } else {
          a.allowForReg = true;
        }
        // let matched  = resp.find(b => b.TPId == a.TPId); // || b.TPId == a.forPkg
        if (a.TypeId == 3 || a.forPkg) { // For Packages - treat pakcages differently
          // let pkg  = this.selectedTestProfiles.find(b => ((b.TPId == a.TPId || b.TPId == a.forPkg) && b.TypeId == 3));
          // let pkgTests  = this.selectedTestProfiles.filter(b => b.forPkg == a.TPId);

          const matchedPkg = resp.find(b => b.TPId == a.TPId || b.TPId == a.forPkg);
          if (matchedPkg) {
            a.TaxRate = matchedPkg.TaxRate || 0;
            if (a.TypeId == 3) {
              a.TestProfilePrice = matchedPkg.TestProfilePrice || 0;
            } else if (a.forPkg) {
              a.TestProfilePrice = 0;
            }
          } else {
            a.allowForReg = false;
            a.TestProfilePrice = 0;
            a.TaxRate = 0;
          }

          // if(matched) {
          //   a.TestProfilePrice = matched.TestProfilePrice || 0;
          // } else {
          //   this.selectedTestProfiles.filter(c => c.TypeId == 3 && c.TPId == a.TPId)
          // }
        } else { // For Tests and Profiles
          const matched = resp.find(b => b.TPId == a.TPId); // || b.TPId == a.forPkg
          if (matched) {
            a.TestProfilePrice = matched.TestProfilePrice || 0;
            a.TaxRate = matched.TaxRate || 0;
          } else {
            a.allowForReg = false;
            a.TestProfilePrice = 0;
            a.TaxRate = 0;
          }
        }
      })
      this.recalculateAmounts();
      this.showHideConscentFormButton();
      if (resp.length) {
        this.toastr.success('Tests / Profiles prices updated');
      }
    }, (err) => {
      this.spinner.hide();
      let errorMsg = '';
      if (err && err.message) {
        errorMsg = err.message;
      }
      this.toastr.error('Delete tests and ReSelect. <br><br> Reason: ' + errorMsg, 'Test Rates not updated', { enableHtml: true });
      this.selectedTestProfiles.forEach(a => {
        a.allowForReg = false;
      })
      this.recalculateAmounts();
      this.showHideConscentFormButton();
    })
  }

  /*
  testProfileSelected(tpId) {
    let selectedID = this.selectedTPItem;
    let selectedObj = this.testProfileList.find(a => a.TPId == selectedID)
    if (selectedObj) {
      if (!this.selectedTestProfiles.find(a => a.TPId == selectedID)) {
        selectedObj.ProcessId = 1;
        this.selectedTestProfiles.push(selectedObj);
      } else {
        this.toastr.info('Already selected');
      }
    }
    this.recalculateAmounts();
    setTimeout(() => {
      this.selectedTPItem = '';
    }, 100);
  }
  */
  selectEventngbTP(event, eventType) {
    // event && event.item 
    const selectedObj = (event && event.item ? event.item : '');
    if (selectedObj.SubSectionID == 18) {
      // || selectedObj.SubSectionID == 7 || selectedObj.SubSectionID == 47
      this.appPopupService.openModal(this.isMetalPopup);
    }
    console.log("selectedObj employeeeeeeeessssssssssss___________", selectedObj);
    if (this.BookingNo && eventType == 'Manual') {
      console.log(selectedObj);
      // getVisitHomeCollectionTest
      if (this.VisitHomeSamplingTest.length) {
        const IsVisitHomeSampleTest = this.VisitHomeSamplingTest.filter(a => { return a.TPId == selectedObj.TPId })
        // if (selectedObj.TPId == 709 || selectedObj.TPId == 2142 || selectedObj.TPId == 2157) {
        if (IsVisitHomeSampleTest.length) {
          this.toastr.error("You Are Not Allowed To Add This Test, Please Contact Home Sample Collection Department");
          this.selectedTPItem = '';
          return;
        }
      }
    }
    else {
      if (this.route.routeConfig.path != 'hc-booking') {
        if (selectedObj.TPId == 709 && !this.BookingNo) {
          this.toastr.error("You Are Not Allowed To Add This Test, Please Contact Home Sample Collection Department");
          this.selectedTPItem = '';
          return;
        }
      }
    }
    if (selectedObj) {
      if (!selectedObj.IsDiscountable && (this.selectedPatientType == 6 || this.selectedPatientType == 7)) {
        this.toastr.warning('This test is not allowed for <string>FOC</string> or <string>Staff</string>', 'Not Allowed', { enableHtml: true });
        this.selectedTPItem = '';
        return;
      }
      if (selectedObj.TypeId == 3) {

        // ===== added: prevent adding same package multiple times =====
        const pkgAlreadyInSelected = this.selectedTestProfiles.some(x =>
          (x.TypeId === 3 && x.TPId === selectedObj.TPId) || (x.forPkg === selectedObj.TPId)
        );
        if (pkgAlreadyInSelected) {
          this.toastr.info('This package is already selected');
          setTimeout(() => {
            this.selectedTPItem = '';
          }, 100);
          return;
        }
        // ==========================================================

        const _params = {
          packageId: selectedObj.TPId,
          branchId: this.loggedInUser.locationid,
          panelId: (this.selectedPanel || '') // this.selectedPanel ? this.selectedPanel.PaselectEventngbTPnelId : '' //this.patientBasicInfo.value.corporateClientID || '',
        }
        this.spinner.show();
        this.tpService.getPackageTestsProfiles(_params).subscribe((res: any) => {

          this.spinner.hide();
          if (res && res.StatusCode == 200 && res.PayLoad) {
            let data = res.PayLoad;
            try {
              data = JSON.parse(data);
            } catch (ex) { }
            if (data.length) {
              data.forEach(element => {
                element.ProcessId = this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].PatientType == 'ER' ? 2 : 1;
                element.forPkg = selectedObj.TPId;
                if (!selectedObj.IsDiscountable && (this.selectedPatientType == 6 || this.selectedPatientType == 7)) {
                  element.allowForReg = false;
                } else {
                  element.allowForReg = true;
                }
                element.TaxRate = selectedObj.TaxRate || 0
              });

              // let sameTestProfiles = data.forEach(a => { // if test/profile is in package then remove already added test/profile and use test/profile that is part of package
              //   let exist = this.selectedTestProfiles.find(b => b.TPId == a.TPId);
              //   if (exist) {
              //     // this.selectedTestProfiles = this.selectedTestProfiles.filter(b => b.TPId != a.TPId);
              //     alert("Duplicate Test/Profile not allowed");
              //     this.removeDuplicatesPopupRef = this.appPopupService.openModal(this.removeDuplicatesPopup, { size: 'lg' });
              //   }
              // });


              // ---------------------------
              // DUPLICATE GROUPING — with EXTERNAL TEST group
              // ---------------------------
              this.groupDuplicateTests(data, selectedObj);

              // ---------------------------
              // END DUPLICATE GROUPING
              // ---------------------------

              // console.log('sameTestProfiles ', sameTestProfiles);

              // data = data.filter(a => this.selectedTestProfiles.find(b => b.TPId == a.TPId) ? false : true); // remove already added tests/profiles

              this.selectedTestProfiles = [...this.selectedTestProfiles, ...data];

              // this.showHideHomeSamplingEmpField();
              this.recalculateAmounts();
              this.showHideConscentFormButton();

              this.convertSelectedTestProfiles({ PanelId: this.selectedPanel });
            }
          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);

          let errorMsg = '';
          if (err && err.message) {
            errorMsg = err.message;
          }
          this.toastr.error('Delete tests and ReSelect. <br><br> Reason: ' + errorMsg, 'Package Tests not fetched', { enableHtml: true });
          this.selectedTestProfiles.forEach(a => {
            if (a.TPId == selectedObj.TPId) {
              a.allowForReg = false;
            }
          })
          this.recalculateAmounts();
          this.showHideConscentFormButton();

         
        });
      }
      
      if (!this.selectedTestProfiles.find(a => a.TPId == selectedObj.TPId)) {
        const aa = JSON.parse(JSON.stringify(selectedObj));
        aa.ProcessId = this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].PatientType == 'ER' ? 2 : 1;
        if (this.outHospitalID !== null && this.outHospitalID != 0) {
          const mc = this.testProfileList.find(a => { if (a.TPId == aa.TPId) { return a.ModalityCode } })
          aa.ModalityCode = aa.ModalityCode ? mc.ModalityCode : null;
        }
        this.selectedTestProfiles.push(aa);

        this.isRadiologyTest = this.selectedTestProfiles?.some(a => a.LabDepartment == 2);
        console.log("this.isRadiologyTest", this.isRadiologyTest);
        console.log("Updated", this.selectedTestProfiles);
        if (aa.TypeId == 1 || aa.TypeId == 3) {
          const profilesIds = this.selectedTestProfiles.filter(a => a.TypeId == 2).map(a => a.TPId).join(',');
          this.checkIfTestAlreadyAddedInProfile(profilesIds);
        } else if (aa.TypeId == 2) {
          this.checkIfTestAlreadyAddedInProfile(aa.TPId);
        }
        // this.outSourceHospitalTPData 

        if (selectedObj.AssociatedTPIDs) {
          const comm = selectedObj.AssociatedTPIDs.split(',');
          try {
            comm.forEach(a => {
              if (!this.selectedTestProfiles.find(c => c.TPId == a)) {
                this.testProfileList.map(b => {
                  if (b.TPId == Number(a)) {
                    b.ProcessId = this.outSourceHospitalPatData.length && this.outSourceHospitalPatData[0].PatientType == 'ER' ? 2 : 1;
                    if (!b.IsDiscountable && (this.selectedPatientType == 6 || this.selectedPatientType == 7)) {
                      this.toastr.warning('This test is not allowed for <string>FOC</string> or <string>Staff</string>', 'Not Allowed', { enableHtml: true });
                    }
                    else {
                      this.selectedTestProfiles.push(b);
                      if (b.TypeId == 1 || b.TypeId == 3) {
                        const profilesIds = this.selectedTestProfiles.filter(a => a.TypeId == 2).map(a => a.TPId).join(',');
                        this.checkIfTestAlreadyAddedInProfile(profilesIds);
                      } else if (b.TypeId == 2) {
                        this.checkIfTestAlreadyAddedInProfile(b.TPId);
                      }
                    }
                  }
                  // this.associatedTestModalRef = this.appPopupService.openModal(this.associatedTestModal, { size: 'sm' , backdrop: 'static', keyboard: false});
                  // this.showHideConscentFormButton();
                });
              }
              else {
                this.toastr.info('Already selected');
              }
            });
          }
          catch (ex) {
            console.log(ex);
          }
          this.appPopupService.openModal(this.associatedTestModal, { backdrop: 'static', keyboard: false, size: 'sm' });
        }

        this.showHideConscentFormButton();
      } else {
        this.toastr.info('Already selected');
      }
    }

    this.showHideHomeSamplingEmpField();

    this.recalculateAmounts();
    setTimeout(() => {
      this.selectedTPItem = '';
    }, 100);
  }
  checkIfTestAlreadyAddedInProfile(profileIds) {
    const _profileIds = profileIds;
    if (!_profileIds) {
      return;
    }
    const params = {
      profileIds: _profileIds
    }
    this.tpService.getTestsByProfileId(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        const testsAlreadyInProfile = [];
        this.selectedTestProfiles.filter(a => a.TypeId == 1).forEach(a => {
          if (res.PayLoad.find(b => b.TestId == a.TPId)) {
            testsAlreadyInProfile.push(a);
          }
        });
        if (testsAlreadyInProfile.length) {
          this.toastr.info('<b>' + testsAlreadyInProfile.map(a => a.TestProfileCode).join('</b>, <b>') + '</b> already added as part of Profile(s)', 'Already Added', { enableHtml: true });
          testsAlreadyInProfile.forEach(tp => {
            this.removeSelectedTestProfile(tp);
          });
        }
      }
    }, err => {
      console.log(err);
    })

  }
  showTPParameters(tp) {
    console.log("🚀 ~ showTPParameters ~ tp:", tp)
    this.tpParametersForPopover = [];
    const targetIDs = ['51', '47', '7', '58', '45', '39', '46', '37', '43', '12', '36', '50', '18', '44', '34', '35', '49', '38', '48', '25', '29', '62'];
    if (targetIDs.includes(tp.SubSectionID.toString())) {
      // Show warning if the condition is met
      // this.toastr.warning('${{TestProfileName}} is not a profile');
      const TestProfileCode = tp.TestProfileCode;
      const TestProfileName = tp.TestProfileName;
      this.tpParametersForPopover = [{ Code: TestProfileCode, Name: TestProfileName }];
      return;
    }
    const params = {
      TPId: tp.TPId
    }
    this.tpParametersForPopover = [{ Code: 'Loading...', Name: '' }];
    this.tpService.GetTestsByTestProfileID(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        console.table(res.PayLoad);
        this.tpParametersForPopover = res.PayLoad;
      }
    }, err => {
      this.tpParametersForPopover = [{ Code: 'server error', Name: '' }];
      console.log(err);
    })
    // let params = {
    //   profileIds: tp.TPId
    // }
    // this.tpParametersForPopover = [{ Code: 'Loading...', Name: '' }];
    // this.tpService.getTestsByProfileId(params).subscribe((res: any) => {
    //   if (res.StatusCode == 200 && res.PayLoad) {
    //     console.table(res.PayLoad);
    //     this.tpParametersForPopover = res.PayLoad;
    //   }
    // }, err => {
    //   this.tpParametersForPopover = [{ Code: 'server error', Name: '' }];
    //   console.log(err);
    // })
  }

  removeSelectedTestProfile(tp) {
    if (this.urlBookingID || this.BookingNo || this.RefByFromVisitAssciate) {
      if (!this.checkIfRevomedTestIsHCTest(tp)) {
        this.selectedTestProfiles = this.selectedTestProfiles.filter(a => {
          return tp.TPId != a.TPId;
        })
        this.selectedTestProfiles = this.selectedTestProfiles.filter(a => { // for package test profiles
          return tp.TPId != a.forPkg;
        })
        this.showHideHomeSamplingEmpField();
        this.recalculateAmounts();
        this.showHideConscentFormButton();
      }
      else {
        this.toastr.warning('This Test Cannot Be Removed. Please Contact Home Sample Collection Department')
        return false;
      }
    }
    else {
      this.selectedTestProfiles = this.selectedTestProfiles.filter(a => {
        return tp.TPId != a.TPId;
      })
      this.selectedTestProfiles = this.selectedTestProfiles.filter(a => { // for package test profiles
        return tp.TPId != a.forPkg;
      })

      this.showHideHomeSamplingEmpField();
      this.recalculateAmounts();
      this.showHideConscentFormButton();
    }
    this.isRadiologyTest = this.selectedTestProfiles?.some(a => a.LabDepartment == 2);
        console.log("this.isRadiologyTest", this.isRadiologyTest);
  }
  checkIfRevomedTestIsHCTest(selTpData) {
    // selectedObj.TPId == 709 || selectedObj.TPId == 2142 || selectedObj.TPId == 2157
    let found = false;
    const IsVisitHomeSampleTest = this.VisitHomeSamplingTest.filter(a => { return a.TPId == selTpData.TPId })
    // if (selectedObj.TPId == 709 || selectedObj.TPId == 2142 || selectedObj.TPId == 2157) {
    if (IsVisitHomeSampleTest.length)
      return found = true;
    else
      return found = false

    // if (selTpData.TPId == 709 || selTpData.TPId == 2142 || selTpData.TPId == 2157)

  }
  showHideConscentFormButton() {
    if (this.isCovidTestSelected() && this.selectedPanel && (this.isAirline() || this.isEmbassy())) {
      this.showConscentFormBtn = true;
    } else {
      this.showConscentFormBtn = false;
    }
    const isfloro = this.selectedTestProfiles.filter(a => {
      return a.SubSectionID == 36
    });
    // && a.TPId !== 923 && a.TPId !== 915 && a.TPId !== 431
    //     && a.TPId !== 449 && a.TPId !== 914 && a.TPId !== 916
    //     && a.TPId !== 417
    //     && a.TPId !== 450 && a.TPId !== 451
    //     && a.TPId !== 920 && a.TPId !== 383 && a.TPId !== 2327
    const tpid = this.selectedTestProfiles.filter(a => {
      return a.TPId == 919
    })
    const tpidMedi = this.selectedTestProfiles.filter(a => {
      return a.TPId == 2541
    })
    if (isfloro.length && !tpid.length) {
      this.showFoloroConscentFormBtn = true;
    }
    else {
      this.showFoloroConscentFormBtn = false;
    }
    if (tpidMedi.length) {
      this.showMediConscentFormBtn = true;
    }
    else {
      this.showMediConscentFormBtn = false;
    }

  }

  showHideHomeSamplingEmpField() {
    if (this.getValidAddedTestsProfiles().find(a => a.isHomeSamplingTestProfile)) {
      this.homeSamplingEmpFieldShow = true;
    } else {
      this.homeSamplingEmpFieldShow = false;
    }
  }

  hideDiscountCardsField(hide) {
    this.discountCardsList = [];
    this.selectedDiscountCard = null;
    if (!this.patientBasicInfo.get('PatientID').value) {
      hide = true; // hide field for new patient
    }
    if (hide) {
      this.hideDiscountCardField = true;
    } else {
      this.hideDiscountCardField = false;
      this.getDiscountCardsByPatient(this.patientBasicInfo.get('PatientID').value);
    }
  }


  countrySelectedEvent() {
    // setTimeout(() => {
    this.patientBasicInfo.patchValue({
      CityID: ''
    });
    this.getCitiesList(this.patientBasicInfo.value.CountryID || '');
    // }, 100);
  }
  countrySelectedCovidPopupEvent() {
    // setTimeout(() => {
    this.patientBasicInfo.patchValue({
      CityID: ''
    });
    this.getCitiesList(this.patientBasicInfoFormForCovid.value.CountryID || '');
    // }, 100);
  }
  ageChange(value) {

    if (value == 0) {
      this.patientBasicInfo.patchValue({
        DateOfBirth: '', // moment(dob).format(this.dateFormat)
      });
    }
    else {
      const _calculatedDob = this.calculateDOB(value, this.patientBasicInfo.value.dmy);
      this.patientBasicInfo.patchValue({
        DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
      });
    }
  }
  dmyChange(value) {

    if ((value == 2 || value == 3) && !this.patientBasicInfo.value.Age) {
      this.patientBasicInfo.patchValue({
        Age: 1
      });
    }
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
    return value.toString(); //.replace(CONSTANTS.REGEX.nimericWithComma, ",");
  }
  getTotal(arr, key) {

    return arr.map(a => a[key]).reduce((a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b), 0);
  }

  resetPatientBasicInfoFields() {
    if (!this.panelIdFromBookingId && !this.panelIdFromVisitInfo) {
      this.selectedTestProfiles = [];
      this.visitAttachments = [];
    }
    this.populatePatientFields({});
  }
  resetVisitData() {
    this.patientVisitInfo = {
      // visitNo: '',
      onlineBookingNo: '',
      corporateClientID: 0,
      grossAmount: 0,
      discount: 0,
      // discountApprovingAuthority: 0,
      netAmount: 0,
      remarks: ''
    }
    this.visitAttachments = [];
    this.selectedTestProfiles = [];
    if (!this.panelIdFromBookingId && !this.panelIdFromVisitInfo) {
      this.patientTypeChanged({ TypeId: 1 }); // this.selectedPatientType = 1;
    }
    this.selectedPanel = null;
    this.recalculateAmounts();
  }
  resetPaymentData() {
    this.addedPaymentModes = [];
    this.discountPercentage = 0;
    this.selectedApprovAuth = 0;
    this.currencyNoteReceived = 0;
    this.currencyNoteChangeAmount = 0;
    this.recalculateAmounts();
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
    const minReceivableAmount = Math.round((this.minimumReceivablePercentage.dynamic * this.parseNumbericValues(this.patientVisitInfo.netAmount)) / 100);
    const totalAmountByPaymentModes = this.addedPaymentModes.map(a => this.parseNumbericValues(a.amount)).reduce((a, b) => a + b, 0);
    if (totalAmountByPaymentModes < minReceivableAmount) {
      result.valid = false;
      result.message = `Please Receive minimum amount of Rs: "${minReceivableAmount}"`;
      return result;
    } else {
      result.valid = true;
      result.message = '';
    }

    const creditCardEntry: any = this.addedPaymentModes.find(a => a.ModeId == 2);
    const JazzCashEntry: any = this.addedPaymentModes.find(a => a.ModeId == 8);
    if (creditCardEntry && this.parseNumbericValues(creditCardEntry.amount) > 0 && (!creditCardEntry.CCNo || !creditCardEntry.CCTNo)) {
      result.valid = false;
      result.message = 'Please enter "Credit Card No" and "Slip No"';
      return result;
    } else if(JazzCashEntry && this.parseNumbericValues(JazzCashEntry.amount) > 0 && (!JazzCashEntry.CCNo || !JazzCashEntry.InstOwner)){
      result.valid = false;
      result.message = 'Please enter "Transaction Id" and "Account Name"';
      return result;
    } else {
      result.valid = true;
      result.message = '';
    }

    if (this.discountPercentage < 0 || this.discountPercentage > this.discountMaxValue) {
      result.valid = false;
      result.message = 'Discount % should be between 0 to ' + this.discountMaxValue;
      return result;
    } else {
      result.valid = true;
      result.message = '';
    }

    if (this.discountPercentage > 0 && !this.selectedApprovAuth && !this.discountFieldDisabled) {
      result.valid = false;
      result.message = 'Please select "Approving Authority" for Discount';
      return result;
    } else {
      result.valid = true;
      result.message = '';
    }

    let _panelType = 0
    if (this.selectedPanel) { // don't add payments for Credit Panel
      const _selectedPanel = this.panelsList.find(a => a.PanelId == this.selectedPanel) || {};
      _panelType = _selectedPanel.PanelType || 0;
    }
    console.log(this.selectedPanel, _panelType);
    if (!this.addedPaymentModes.length && this.discountPercentage != 100 && this.minimumReceivablePercentage.dynamic != 0) { //} _panelType != 2) {
      result.valid = false;
      result.message = 'Please enter atleast one payment mode';
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
  openFitToFlyForm() {
    this.appPopupService.openModal(this.fitToFlyPopup, { backdrop: "static", size: "xl", });  //md, xl. fss
  }

  printFTFCertificate(param) {
    setTimeout(() => {
      const data = document.getElementById(param).innerHTML;
      const documentWindow = window.open();
      documentWindow.document.write(`
      <html>
        <head>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
          <style>
          body {
            width:100%;
            margin: auto;
            font-size: 19px;
          }
          .margin{
            margin-top:20px;
          }
          .marginli{
            margin-top:33px;
            margin-bottom:10px;
          }
          .marginp{
            margin-top:60px;
          }
          .underline {
            text-decoration: underline;
          }
          .col-md-4{
              width:33.33%;
          }
          .col-md-8 {
            width:66.67%;
          }
          .col-md-6{
            width:50%;
          }
          .border {
            border: 1px solid #000; 
            padding: 10px;  
          }
          
          </style>
        </head>
        <body >
          ${data}
        </body>
      </html>
    `);
      setTimeout(() => {
        documentWindow.print();
      }, 300);
    }, 500);
  }


  openOutSourceHospitalsPatientsForm(selOutPat) {
  // add for voucher implmentation 
    this.isVoucher = false;
    this.isVoucherVerified = false;
    this.allRemarks.InternalRemarks = "";
    this.voucherCode = '';
    this.isOutsource = false;
    this.recalculateAmountsVoucher();

    this.selOutPat = selOutPat;
    this.appPopupService.openModal(this.outSourcePatSerachPopup);
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
    const formVal = this.patientBasicInfo.getRawValue();

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    const currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);

      // if(obj.months >= 12) {obj.months = 0; obj.years = 1}
    }
    else if (diffDays == 0 && formVal.dmy == '3') {
      const _calculatedDob = this.calculateDOB(1, this.patientBasicInfo.value.dmy);
      obj.years = Math.floor(1);
      this.patientBasicInfo.patchValue({
        DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
      });
    }
    else if (diffDays == 0 && formVal.dmy == '2') {
      obj.months = Math.floor(1);
    }
    else if (diffDays == 0 && formVal.dmy == '1') {
      const _calculatedDob = this.calculateDOB(1, this.patientBasicInfo.value.dmy);
      obj.days = Math.floor(1);
      this.patientBasicInfo.patchValue({
        DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
      });
    }
    else {
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
    this.resetVisitData();
    this.resetPaymentData();
    this.stopCamera();
    this.wizard.goToStep(0);
    this.updateUrlParams_navigateTo('', { cacheControl: (+new Date()) });
  }

  isAirportLocation(locationId = 0) {
    let _locId = locationId;
    try {
      _locId = this.loggedInUser.locationid;
    } catch (e) { }
    if (locationId) {
      _locId = locationId;
    }
    this._isAirportLocation = this.airportLocationIds.indexOf(_locId) > -1;
    return this.airportLocationIds.indexOf(_locId) > -1;
  }

  isAirline() {
    // console.log('isAirline ', this.selectedPanel && this.panelsList.find(a => a.PanelId == this.selectedPanel).isAirLine)
    const isAirline = this.panelsList.length ? this.panelsList && this.selectedPanel && this.panelsList.find(a => a.PanelId == this.selectedPanel).isAirLine : '';
    this._isAirline = isAirline;
    return isAirline;
  }
  isEmbassy() {
    // console.log('isEmbassy ', this.selectedPanel && this.panelsList.find(a => a.PanelId == this.selectedPanel).isEmbassy)
    const isEmbassy = this.panelsList.length ? this.panelsList && this.selectedPanel && this.panelsList.find(a => a.PanelId == this.selectedPanel).isEmbassy : '';
    this._isEmbassy = isEmbassy;
    return isEmbassy;
  }
  isCovidTestSelected() {
    return this.selectedTestProfiles.find(a => a.isCovidTestProfile) ? true : false;
  }
  isDengueTestSelected() {
    return this.selectedTestProfiles.find(a => a.isDengueTest) ? true : false;
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

  allRemarksChanged(fieldName) {
    switch (fieldName) {
      case 'internal-remarks1':
        this.allRemarks.InternalRemarks = this.patientBasicInfo.controls['InternalRemarks'].value || '';
        break;
      case 'patient-remarks1':
        this.allRemarks.PatientComments = this.patientBasicInfo.controls['PatientComments'].value || '';
        break;
      case 'internal-remarks2':
        this.patientBasicInfo.patchValue({
          InternalRemarks: this.allRemarks.InternalRemarks || ''
        });
        break;
      case 'patient-remarks2':
        this.patientBasicInfo.patchValue({
          PatientComments: this.allRemarks.PatientComments || ''
        });
        break;
    }
    const intRemarksLen = (this.allRemarks.InternalRemarks || '').trim().length;
    if (
      ((this.discountPercentage && !this.discountFieldDisabled)
        || this.parseNumbericValues(this.patientVisitInfo.netAmount) - this.parseNumbericValues(this.getTotal(this.addedPaymentModes, 'amount')))
      && intRemarksLen < 10
    ) {
      // this.toastr.warning('Please enter remarks');
      this.allRemarks.InternalRemarksClass = 'invalid invalid-highlighted';
      return;
    } else {
      this.allRemarks.InternalRemarksClass = '';
    }
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
    this.controlFieldsForEmployee(false);
  }

  GetHCBookingSources() {
    this.hcService.getHCBookingSources().subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.HCRequestSourceList = resp.PayLoad.filter(a => { return a.BookingSourceID !== 7 });

        console.log(this.HCRequestSourceList);
      }
    }, (err) => { console.log(err) })
  }
  // openModal(content, settings = {}) {
  //   let defaultSettings = {size: 'xl'};
  //   let _settings = {...defaultSettings, ...settings};
  //   let modalRef = this.modalService.open(content, _settings);
  //   modalRef.result.then((result) => {
  //   }, (reason) => {
  //   });
  //   return modalRef;
  // }

  // closeModal() {
  //   this.modalService.dismissAll();
  //   this.mcPatientsList = [];
  // }
  OpenMap(pdata) {
    this.gMapInfoToDisplay = {
      lat: pdata.PatientLatitude,
      lng: pdata.PatientLongitude,
    }
    this.appPopupService.openModal(this.mapPopup, { size: 'lg' });
    // this.appPopupService.openModal(this.AssignRiderPopup, { size: 'lg' });
  }
  OpenHCRequestScreen() {
    // this.router.navigate(['#/hc/hc-requests']).then(result => {  });
    window.open('#/hc/hc-requests', '_blank');
  }
  // EditHCRequest() {
  //   console.log("SelBookingData", selData);
  //   let selbookingData = this.PendingHCRequests.filter(a => { return a.BookingPatientID == selData.BookingPatientID })
  //   let selbookingID = btoa(selbookingData[0].BookingPatientID);
  //   let URL = "#/hc/update-hcbooking?BID=" + selbookingID;
  //   window.open(URL, '_blank');

  // }


  /* start - FBR - function */
  formatDataForFBR(data) {
    const testsData = data.testProfile || [];
    const paymentData = data.payment || [];
    const visitData = data.visit.length ? data.visit[0] : {};
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

      if (this.selectedPanel) { // use Check as payment mode for Credit Panel
        let _panelType = 0
        const _selectedPanel = this.panelsList.find(a => a.PanelId == this.selectedPanel) || {};
        _panelType = _selectedPanel.PanelType || 0;
        if (_panelType == 2) {
          paymentModeSelected = fbrPaymentModes.cheque;
        }
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

    let taxRate = 0;
    if (this.getValidAddedTestsProfiles() && this.getValidAddedTestsProfiles().length) {
      taxRate = (this.getValidAddedTestsProfiles()[0].TaxRate || 0);
    }
    const valueWithAndWithoutTax = this.helperSrv.calculateTaxValue(((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice')) || 0) - (visitData.AdjAmount || 0), taxRate);
    //new code commented// let valueWithAndWithoutTax = this.helperSrv.calculateTaxValue(((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice')) || 0), taxRate);
    // let totalBillAmount = (this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) + calculatedTax;
    // let totalSale = (totalBillAmount || 0) - calculatedTax - (visitData.AdjAmount || 0);

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
      "TotalQuantity": testsData.length,
      "Discount": this.helperSrv.formatDecimalValue(visitData.AdjAmount || 0), // 1300 - 50% | discount
      // "FurtherTax": 0.0,
      "TotalBillAmount": this.helperSrv.formatDecimalValue(totalBillAmount), // 1300 | 1300 + 0 | totalSale + tax
      "PaymentMode": paymentModeSelected, // {1: Cash, 2: Card, 3: Gift Voucher, 4: Loyalty Card, 5: Mixed, 6: Cheque}
      "InvoiceType": 1, // {1: New, 2: Debit, 3: Credit}
      "Items": []
    };
    testsData.forEach(tp => {
      const _texRate = (this.getValidAddedTestsProfiles().find(a => a.TPId == tp.TPId) || { TaxRate: 0 }).TaxRate;
      tp.TaxRate = (_texRate || 0); //(tp.TaxRate || 0);
      // let taxCharged = this.calculateTaxValue((tp.Price || 0), tp.TaxRate).taxValue; // ((tp.TaxRate || 0) * ((tp.Price || 0) - (tp.Discount || 0)) / 100) || 0;

      // let calculatedTax = 0;
      // let totalBillAmount = (this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) + calculatedTax;
      // let totalSale = (totalBillAmount || 0) - calculatedTax - (visitData.AdjAmount || 0);

      const tpValueWithAndWithoutTax = this.helperSrv.calculateTaxValue((tp.Price || 0) - tp.Discount, tp.TaxRate);
      // let totalBillAmount = (this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) + calculatedTax;
      // let totalSale = (totalBillAmount || 0) - calculatedTax - (visitData.AdjAmount || 0);

      const taxCharged = tpValueWithAndWithoutTax.taxValue;// ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (visitData.AdjAmount || 0)) * 17 / 100;
      const saleAmount = tpValueWithAndWithoutTax.fullValue - tpValueWithAndWithoutTax.taxValue; // ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (calculatedTax || 0)) || 0; // - (visitData.AdjAmount || 0)) || 0;
      const totalAmount = tpValueWithAndWithoutTax.fullValue; // - (tp.Discount || 0); // (totalSale || 0) + (calculatedTax || 0) - (visitData.AdjAmount || 0);

      // let saleAmount = ((tp.Price || 0) - (taxCharged || 0)) || 0; // - (tp.Discount || 0)) || 0;
      // let totalAmount = (saleAmount || 0) + (taxCharged || 0) - (tp.Discount || 0);

      const item = {
        "ItemCode": tp.TPId,
        "ItemName": tp.Title,
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

  // getSystemInformation(loggedInUser: UserModel) {
  //   // setTimeout(() => {
  //   let obj = {
  //     user: loggedInUser,
  //     timestamp: +new Date(),
  //     screen: encodeURIComponent(window.location.href)
  //   }

  //   this.sendCommand({ command: 'sys-info', userIdentity: JSON.stringify(obj) });

  // }

  detectMob() {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }
  getPOSID() {
    // console.log("loggedInUser", this.loggedInUser)
    const ismob = this.detectMob();
    // console.log("aa", ismob)
    const params = {
      macAddress: this.loggedInUser.macAdr,
      branchId: this.loggedInUser.locationid,
      userId: this.loggedInUser.userid,
      browserTypeID: ismob ? 1 : 0
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


  getHCCities() {
    this.gcCitiesList = [];
    this.spinner.show();
    this.hccityAuth.getHCCities().subscribe((res: any) => {
      this.spinner.hide();
      if (res.StatusCode == 200) {
        this.gcCitiesList = res.PayLoad || [];
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
    })
  }

  copyText(text: string) {
    this.helperSrv.copyMessage(text);
  }


  ngOnDestroy() {
    this.isLockTPOnly = false;
    this.stickerText = '';
    const patientData = this.patientBasicInfo.getRawValue();
    if (!patientData) {
      return;
    }
    if (patientData.Salutation || patientData.FirstName || patientData.Gender || patientData.MobileNO || patientData.PhoneNO) {
      // Ask user before leaving if patient info is entered.
    }
    this.isEligibleForInsuranceActiveDate = true;
    this.isUpgradePolicyAllowed = false;
    this.isPatientWilling = "false";
    this.InsuranceActiveDate = null;
    this.selectedTestProfiles = [];
  }
  CheckHCBookingSourceVAlidation() {
    if (this.hcBookingSourceID) {
      this.HCBookingSourceClass = 'valid';
    }
    else {
      this.HCBookingSourceClass = 'invalid invalid-highlighted';
    }
  }

  getOutsourceHospitals() {
    this.ecl.getOutSourceHospitalDetail().subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.outsourceHospitals = resp.PayLoad
      }
    }, (err) => { console.log(err) })
  }

  getVisitsAgainstOrderNumbers(orderNumber) {
    this.isOrderRegForECLAllowed = true;
    const params = {
      "HospitalOrderNo": (orderNumber)
    }
    this.ecl.getVisitsAgainstOrderNumbers(params).subscribe((resp: any) => {
      // console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.isOrderRegForECLAllowed = false;
      }
      else {
        this.isOrderRegForECLAllowed = true;
      }
    }, (err) => { console.log(err); })
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }


  logProvinceNotPunjabInfo(provinceid) {
    const params = {
      "Msg": "user province id is not correct. current userid is " + 1 + "but it should be 2"
    }
    this.lookupService.logData(params).subscribe((resp: any) => {
      // console.log(resp);
    }, (err) => { console.log(err); })
  }

  getVisitsForInvoice(patient) {
    this.patientVisitsPopupRef = this.appPopupService.openModal(this.patientVisitsPopup, { size: 'lg' });
    this.patientVisitsList = [];
    const params = { patientID: patient };
    if (params.patientID) {
      this.spinner.show(this.spinnerRefs.patientVisits);
      this.patientVisitsList = [{ Message: 'Loading...' }];
      this.visitService.getPatientVisitsForInvoice(params).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.patientVisits);
        if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
          this.patientVisitsList = res.PayLoad;
        } else {
          this.patientVisitsList = [{ Message: 'No Record(s) Found' }];
        }
        // this.refreshPagination();
      }, (err) => {
        this.patientVisitsList = [{ Message: 'Connection Error' }];
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide(this.spinnerRefs.patientVisits);
      })
    } else {
      this.toastr.warning('Invalid');
    }
  }

  openInvoiceforHistory(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visit.VisitID, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (this.invoiceCopyType || 0), timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
  }



  visitDetails = null;
  getVisitDetails(visitID) {
    const params = { VisitId: visitID.replace(/-/g, '') };
    this.visitDetails = {
      // pateintInfo: null,
      // visitInfo: null,
      tpInfo: [],
    }
    if (params.VisitId) {
      this.visitService.getVisitDetails(params).subscribe((res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          this.visitDetails = {
            // pateintInfo: res.PayLoadDS.Table.length ? res.PayLoadDS.Table[0] : null,
            // visitInfo: res.PayLoadDS.Table1.length ? res.PayLoadDS.Table1[0] : null,
            tpInfo: res.PayLoadDS.Table2 || [],
          }
        }

      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide();
      })
    }
  }
  nextValidation() {
    if (this.patientBasicInfo.invalid) {
      this.toastr.warning('Please fill the required Fields')
    }
  }


  hospitalOrderNumber: string | null = null;
  maxHealthHospitalID: number | null = 8;
  openSwalForMaxHealthPanel() {
    Swal.fire({
      title: 'Enter Hospital Order Number',
      input: 'text',
      inputPlaceholder: 'Hospital Order Number',
      confirmButtonText: 'Confirm',
      allowOutsideClick: false,
      showCancelButton: false,  // only confirm button
      preConfirm: (value) => {
        if (!value || value.trim() === '') {
          Swal.showValidationMessage('Hospital Order Number is required');
          return false;
        }
        return value.trim(); // will be stored in result.value
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.hospitalOrderNumber = result.value;
        this.outHospitalID = 8;
      }
    });
  }


  // -------------------------------------------------------------------
  // begin:: DUPLICATE TEST HANDLING
  // -------------------------------------------------------------------
  removeDuplicatesPopupRef: NgbModalRef;
  @ViewChild('removeDuplicatesPopup') removeDuplicatesPopup;
  duplicateTests: any[] = [];
  private groupDuplicateTests(data: any[], selectedObj: any): void {
    // reset view
    this.duplicateTests = [];

    // normalize incoming data (API sometimes returns JSON string)
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = [];
      }
    }
    if (!Array.isArray(data)) data = [];

    const incomingPkg = selectedObj || null;
    const incomingTests = data.filter(d => d && d.TypeId !== 3); // tests (non-package) from incoming payload

    // Build a map: packageId (number|string) -> { package: pkgObj, tests: [testObjs] }
    const packageTestsMap = new Map<any, { package: any; tests: any[] }>();

    const allSelected = Array.isArray(this.selectedTestProfiles) ? this.selectedTestProfiles : [];

    // 1) Add all package objects from selectedTestProfiles
    allSelected
      .filter(sp => sp.TypeId === 3)
      .forEach(pkg => {
        const tests = allSelected.filter(
          t => (t.TypeId === 1 || t.TypeId === 2) && t.forPkg === pkg.TPId
        );
        packageTestsMap.set(pkg.TPId, { package: pkg, tests: tests.map(t => ({ ...t })) });
      });

    // 2) Add packages referenced by tests that might not have package object present
    allSelected
      .filter(t => (t.TypeId === 1 || t.TypeId === 2) && t.forPkg)
      .forEach(t => {
        const pid = t.forPkg;
        if (!packageTestsMap.has(pid)) {
          const pkgObj =
            allSelected.find(p => p.TypeId === 3 && p.TPId === pid) ||
            data.find(d => d.TypeId === 3 && d.TPId === pid) ||
            { TPId: pid, TestProfileCode: 'Pkg-' + pid, TestProfileName: 'Package ' + pid, TestProfilePrice: 0 };
          const testsForPkg = allSelected.filter(s => (s.TypeId === 1 || s.TypeId === 2) && s.forPkg === pid);
          packageTestsMap.set(pid, { package: pkgObj, tests: testsForPkg.map(t => ({ ...t })) });
        }
      });

    // 3) Add external (independent) tests (selectedTestProfiles entries without forPkg)
    const externalTests = allSelected.filter(t => (t.TypeId === 1 || t.TypeId === 2) && !t.forPkg);
    if (externalTests.length > 0) {
      packageTestsMap.set('EXTERNAL', {
        package: { TPId: 'EXTERNAL', TestProfileCode: 'EXTERNAL TEST', TestProfileName: 'External Independent Tests', TypeId: 3 },
        tests: externalTests.map(t => ({ ...t }))
      });
    }

    // 4) Add incoming package (the package that was just selected) and its incoming tests (merge if exists)
    if (incomingPkg && incomingPkg.TPId) {
      const incomingPkgId = incomingPkg.TPId;
      // if data also contains a package row for incoming, prefer selectedObj but merge tests
      const incomingEntryTests = incomingTests.map(t => ({ ...t }));
      if (!packageTestsMap.has(incomingPkgId)) {
        packageTestsMap.set(incomingPkgId, { package: incomingPkg, tests: incomingEntryTests });
      } else {
        const entry = packageTestsMap.get(incomingPkgId)!;
        incomingEntryTests.forEach(t => {
          if (!entry.tests.find(et => et.TPId === t.TPId)) entry.tests.push({ ...t });
        });
        packageTestsMap.set(incomingPkgId, entry);
      }
    } else {
      // If no selectedObj but data contains a package (rare), add it
      data.filter(d => d && d.TypeId === 3).forEach(pkgFromData => {
        if (!packageTestsMap.has(pkgFromData.TPId)) {
          const incomingPkgTests = data.filter(d => d && d.forPkg === pkgFromData.TPId).map(t => ({ ...t }));
          packageTestsMap.set(pkgFromData.TPId, { package: pkgFromData, tests: incomingPkgTests });
        }
      });
    }

    // 5) Count unique package-presence per TPId (we want TPIds that exist in more than one package/external set)
    const tpidPackageCount: Record<number, number> = {};
    packageTestsMap.forEach(entry => {
      const seen = new Set<number>();
      (entry.tests || []).forEach(t => {
        if (t && typeof t.TPId !== 'undefined' && !seen.has(t.TPId)) {
          tpidPackageCount[t.TPId] = (tpidPackageCount[t.TPId] || 0) + 1;
          seen.add(t.TPId);
        }
      });
    });

    // 6) Determine TPIds that are duplicates (present in >1 package group)
    const duplicateTPIds = Object.keys(tpidPackageCount)
      .map(k => Number(k))
      .filter(tpId => tpidPackageCount[tpId] > 1);

    // 7) Build duplicate groups: only include packages that contain at least one duplicate TPId,
    //    and only keep the duplicate tests inside each package.
    if (duplicateTPIds.length > 0) {
      const groupsArr: any[] = [];
      packageTestsMap.forEach(entry => {
        const dupTests = (entry.tests || []).filter(t => duplicateTPIds.includes(t.TPId));
        // dedupe tests per package by TPId to avoid visual duplicates
        const uniq: any[] = [];
        const seen = new Set<number>();
        dupTests.forEach(t => {
          if (!seen.has(t.TPId)) {
            seen.add(t.TPId);
            uniq.push({ ...t });
          }
        });
        if (uniq.length > 0) {
          groupsArr.push({ package: entry.package, tests: uniq });
        }
      });

      // sort: external first, then regular packages (alphabetical by TestProfileCode)
      groupsArr.sort((a, b) => {
        if (a.package.TPId === 'EXTERNAL') return -1;
        if (b.package.TPId === 'EXTERNAL') return 1;
        return (a.package.TestProfileCode || '').localeCompare(b.package.TestProfileCode || '');
      });

      this.duplicateTests = groupsArr;

      // open modal (ensure static backdrop & keyboard disabled so outside click/ESC won't close it)
      try {
        // close existing modal ref if present to avoid duplicates
        if (this.removeDuplicatesPopupRef) {
          try { this.removeDuplicatesPopupRef.close(); } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }

      this.removeDuplicatesPopupRef = this.appPopupService.openModal(this.removeDuplicatesPopup, {
        size: 'lg',
        backdrop: 'static',
        keyboard: false
      });

      // debug (optional - remove in prod)
      // console.log('groupDuplicateTests -> duplicateTPIds', duplicateTPIds, 'groups', this.duplicateTests);
    } else {
      // no duplicates — clear view and close popup if open
      this.duplicateTests = [];
      if (this.removeDuplicatesPopupRef) {
        try { this.removeDuplicatesPopupRef.close(); } catch (e) { /* ignore */ }
        this.removeDuplicatesPopupRef = null;
      }
    }
  }
  removeDuplicateTest(test: any): void {
    if (!test) return;

    // 1) find group + test inside duplicateTests (exact reference or by TPId)
    let groupIndex = this.duplicateTests.findIndex(g => g.tests.indexOf(test) !== -1);
    let testIndex = -1;

    if (groupIndex !== -1) {
      testIndex = this.duplicateTests[groupIndex].tests.indexOf(test);
    } else {
      groupIndex = this.duplicateTests.findIndex(g => g.tests.some(t => t.TPId === test.TPId));
      if (groupIndex !== -1) {
        testIndex = this.duplicateTests[groupIndex].tests.findIndex(t => t.TPId === test.TPId);
      }
    }

    if (groupIndex === -1 || testIndex === -1) return;

    const group = this.duplicateTests[groupIndex];

    // 2) remove only that test from the group's tests array (for popup view)
    const [removedTest] = group.tests.splice(testIndex, 1);

    // 3) if group has no tests left, remove the entire group (from popup view)
    if (!group.tests.length) {
      this.duplicateTests.splice(groupIndex, 1);
    }

    // 4) remove the corresponding entry from selectedTestProfiles (match by TPId + forPkg / EXTERNAL)
    const pkgId = group.package?.TPId;
    let selIdx = -1;

    if (pkgId === 'EXTERNAL') {
      selIdx = this.selectedTestProfiles.findIndex(sp =>
        sp.TPId === removedTest.TPId && (sp.forPkg === undefined || sp.forPkg === null || sp.forPkg === '')
      );
    } else {
      selIdx = this.selectedTestProfiles.findIndex(sp =>
        sp.TPId === removedTest.TPId && sp.forPkg === pkgId
      );
    }

    // fallback: if exact match not found, try TPId+code
    if (selIdx === -1) {
      selIdx = this.selectedTestProfiles.findIndex(sp =>
        sp.TPId === removedTest.TPId && sp.TestProfileCode === removedTest.TestProfileCode
      );
    }

    if (selIdx !== -1) {
      this.selectedTestProfiles.splice(selIdx, 1);
    }

    // 5) check if package header itself has no child tests left → remove the header row also
    if (pkgId && pkgId !== 'EXTERNAL') {
      const stillHasTests = this.selectedTestProfiles.some(sp => sp.forPkg === pkgId);
      if (!stillHasTests) {
        // remove the package header itself (TypeId === 3 row with that TPId)
        const pkgIndex = this.selectedTestProfiles.findIndex(sp => sp.TypeId === 3 && sp.TPId === pkgId);
        if (pkgIndex !== -1) {
          this.selectedTestProfiles.splice(pkgIndex, 1);
        }
      }
    }

    // 6) update totals / UI
    if (typeof this.recalculateAmounts === 'function') this.recalculateAmounts();
    if (typeof this.showHideConscentFormButton === 'function') this.showHideConscentFormButton();

    // 7) rebuild the duplicate groups from the actual selectedTestProfiles so popup matches reality
    this.rebuildDuplicateTestsFromSelected();

    // 8) if no duplicates remain in selectedTestProfiles, auto-close modal
    if (!this.hasDuplicatesInSelectedProfiles() && this.removeDuplicatesPopupRef) {
      try {
        this.removeDuplicatesPopupRef.close();
      } catch (e) { /* ignore */ }
      this.removeDuplicatesPopupRef = null;
    }
  }


  isDuplicate(test: any): boolean {
    if (!test) return false;
    // count occurrences in selectedTestProfiles (source of truth)
    const count = this.selectedTestProfiles.filter(sp => sp.TPId === test.TPId).length;
    return count > 1; // show delete only if more than 1 in actual data
  }
  private rebuildDuplicateTestsFromSelected(): void {
    // Reuse same grouping logic but WITHOUT any incoming package
    const data: any[] = []; // no incoming data
    const incomingPkg: any = null;

    const packageTestsMap = new Map<number | string, { package: any; tests: any[] }>();

    // 1) Existing packages
    this.selectedTestProfiles
      .filter(sp => sp.TypeId === 3)
      .forEach(pkg => {
        const tests = this.selectedTestProfiles.filter(
          t => (t.TypeId === 1 || t.TypeId === 2) && t.forPkg === pkg.TPId
        );
        packageTestsMap.set(pkg.TPId, { package: pkg, tests: tests.map(t => ({ ...t })) });
      });

    // 2) External tests (TypeId 1/2 without forPkg)
    const externalTests = this.selectedTestProfiles.filter(
      t => (t.TypeId === 1 || t.TypeId === 2) && !t.forPkg
    );
    if (externalTests.length > 0) {
      packageTestsMap.set('EXTERNAL', {
        package: {
          TPId: 'EXTERNAL',
          TestProfileCode: 'EXTERNAL TEST',
          TestProfileName: 'External Independent Tests',
          TypeId: 3
        },
        tests: externalTests.map(t => ({ ...t }))
      });
    }

    // 3) Packages referenced by tests (safety net)
    this.selectedTestProfiles
      .filter(t => (t.TypeId === 1 || t.TypeId === 2) && t.forPkg)
      .forEach(t => {
        const pid = t.forPkg;
        if (!packageTestsMap.has(pid)) {
          const pkgObj = this.selectedTestProfiles.find(p => p.TypeId === 3 && p.TPId === pid)
            || { TPId: pid, TestProfileCode: 'Pkg-' + pid, TestProfileName: 'Package ' + pid, TestProfilePrice: 0 };

          const testsForPkg = this.selectedTestProfiles.filter(s => (s.TypeId === 1 || s.TypeId === 2) && s.forPkg === pid);
          packageTestsMap.set(pid, { package: pkgObj, tests: testsForPkg.map(t => ({ ...t })) });
        }
      });

    // 4) Count TPId occurrences across packages (including EXTERNAL)
    const tpidCount: Record<number, number> = {};
    packageTestsMap.forEach(entry => {
      const seen = new Set<number>();
      (entry.tests || []).forEach(t => {
        if (!seen.has(t.TPId)) {
          tpidCount[t.TPId] = (tpidCount[t.TPId] || 0) + 1;
          seen.add(t.TPId);
        }
      });
    });

    // 5) Find duplicate TPIds
    const duplicateTPIds = Object.keys(tpidCount).map(k => Number(k)).filter(id => tpidCount[id] > 1);

    // 6) Build groups — keep only duplicates
    const groupsArr: any[] = [];
    if (duplicateTPIds.length > 0) {
      packageTestsMap.forEach(entry => {
        const dupTests = (entry.tests || []).filter(t => duplicateTPIds.includes(t.TPId));
        if (dupTests.length > 0) {
          groupsArr.push({
            package: entry.package,
            tests: dupTests
          });
        }
      });

      // order: external first
      groupsArr.sort((a, b) => {
        if (a.package.TPId === 'EXTERNAL') return -1;
        if (b.package.TPId === 'EXTERNAL') return 1;
        return (a.package.TestProfileCode || '').localeCompare(b.package.TestProfileCode || '');
      });
    }

    this.duplicateTests = groupsArr;
  }

  // utility function to check if duplicates still exist
  hasDuplicatesInSelectedProfiles(): boolean {
    const tpidCount: Record<string, number> = {};

    this.selectedTestProfiles.forEach(test => {
      const key = String(test.TPId);
      tpidCount[key] = (tpidCount[key] || 0) + 1;
    });

    // if any TPId has count > 1, duplicates still exist
    return Object.values(tpidCount).some(count => count > 1);
  }

  onCloseDuplicatePopup() {
    if (!this.hasDuplicatesInSelectedProfiles()) {
      this.removeDuplicatesPopupRef.close();
    } else {
      this.toastr.warning(
        'Please resolve all duplicate tests before closing this window.',
        'Resolve Duplicates',
        { positionClass: 'toast-top-right' }
      );
    }
  }

  // -------------------------------------------------------------------
  // end:: DUPLICATE TEST HANDLING
  // -------------------------------------------------------------------
  isNoRefChecked = false;
  onNoRefCheckedChange(event: Event): void {
    this.isNoRefChecked = (event.target as HTMLInputElement).checked;
    if (this.isNoRefChecked) {
      this.openSwalForNewRefBy();
    } else {
      const refDocControl = this.patientBasicInfo.get('RefDoc');
      refDocControl?.setValidators([Validators.required]);
      refDocControl?.enable();   // enable when checkbox is unchecked   
    }

    // return;

    // const refDocControl = this.patientBasicInfo.get('RefDoc');
    // const refDocTextControl = this.patientBasicInfo.get('RefDocText');

    // if (this.isNoRefChecked) {
    //   // when checkbox checked → make RefDocText required, clear RefDoc
    //   refDocControl?.clearValidators();
    //   refDocControl?.setValue('');
    //   refDocTextControl?.setValidators([Validators.required]);




    // } else {
    //   // when unchecked → make RefDoc required, clear RefDocText
    //   refDocTextControl?.clearValidators();
    //   refDocTextControl?.setValue('');
    //   refDocControl?.setValidators([Validators.required]);
    // }
    // ///////// Empty the and set the variables:
    // this.discountPercentage = 0;
    // this.selectedB2BDoctor = null;
    // this.panelsList = [];
    // this.recalculateDiscountAndMinPayable();
    // this.panelChanged('');
    // if (this.isNoRefChecked) {
    //   // Clear dropdown value
    //   this.patientBasicInfo.patchValue({
    //     B2BDoc: null
    //   });

    //   // Clear validation
    //   this.patientBasicInfo.get('B2BDoc')?.clearValidators();
    //   const discountedChargesField = document.querySelector(
    //     'input[name="discount"]'
    //   ) as HTMLInputElement;

    //   if (discountedChargesField) {
    //     discountedChargesField.removeAttribute('disabled');
    //   }
    // } else {
    //   // Re-apply validation when unchecked
    //   this.patientBasicInfo.get('B2BDoc')?.setValidators([Validators.required]);
    // }
    // // Update the control state
    // this.patientBasicInfo.get('B2BDoc')?.updateValueAndValidity();
    // refDocControl?.updateValueAndValidity();
    // refDocTextControl?.updateValueAndValidity();
  }
  onRefDocBlur() {
    const refDocCtrl = this.patientBasicInfo.get('RefDocText');
    if (refDocCtrl) {
      const trimmedValue = (refDocCtrl.value || '').trim();
      refDocCtrl.setValue(trimmedValue);

      // if empty after trimming, clear it and keep 'required' validation
      if (!trimmedValue) {
        refDocCtrl.setErrors({ required: true });
      }
    }
  }
  isRefDocSelected = false;
  newRefBy: string | null = null;

  _openSwalForNewRefBy() {
    Swal.fire({
      title: 'Enter Referring Doctor Name',
      input: 'text',
      inputPlaceholder: 'Enter Ref. Doctor Name',
      confirmButtonText: 'Confirm',

      allowOutsideClick: false,   // disables closing by clicking outside
      allowEscapeKey: false,      // disables closing via ESC key
      showCancelButton: false,    // only confirm button

      preConfirm: (value) => {
        if (!value || value.trim() === '') {
          Swal.showValidationMessage('Referring Doctor Name is required');
          return false;
        }
        return value.trim(); // will be stored in result.value
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.newRefBy = result.value;
        const refDocControl = this.patientBasicInfo.get('RefDoc');

        if (this.isNoRefChecked) {
          refDocControl?.clearValidators();
          refDocControl?.setValue('');
          refDocControl?.disable();  // disable when No Ref checkbox is checked
        } else {
          refDocControl?.setValidators([Validators.required]);
          refDocControl?.enable();   // enable when checkbox is unchecked
        }

        refDocControl?.updateValueAndValidity();
      }
    });
  }
  newRefByCity: any = '';
  openSwalForNewRefBy() {

    const htmlForm = `
    <div class="form-group">
      <input id="swal-refdoc-name" class="form-control" value="Dr. " type="text" placeholder="Enter Ref. Doctor Name" />
    </div>
    <div class="form-group mt-2">
      <select id="swal-city" class="form-control">
        <option value="">-- Select City --</option>
        ${this.citiesList.map(c => `<option value="${c.CityName}">${c.CityName}</option>`).join('')}
      </select>
    </div>
  `;

    Swal.fire({
      title: 'Enter Referring Doctor Details',
      html: htmlForm,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,

      didOpen: () => {
        const nameInput = document.getElementById('swal-refdoc-name') as HTMLInputElement;

        if (nameInput) {
          nameInput.focus();
          const val = nameInput.value;
          nameInput.value = '';
          nameInput.value = val;
        }

        // Remove error on typing
        nameInput?.addEventListener('input', () => {
          nameInput.classList.remove('swal-input-error');
        });
      },

      preConfirm: () => {
        const nameInput = document.getElementById('swal-refdoc-name') as HTMLInputElement;
        const citySelect = document.getElementById('swal-city') as HTMLSelectElement;

        const docName = nameInput.value.trim();
        const city = citySelect.value;

        // Reset previous error
        nameInput.classList.remove('swal-input-error');

        // 1. If user left only "Dr." (with or without space)
        if (docName === 'Dr.' || docName === 'Dr') {
          nameInput.classList.add('swal-input-error');
          Swal.showValidationMessage('Please provide the doctor name');
          return false;
        }

        // 2. Now extract the part after "Dr." so short names like "Dr. Al" also get caught
        const cleanName = docName.replace(/^Dr\.?/i, '').trim();

        // If nothing left after removing Dr.
        if (!cleanName) {
          nameInput.classList.add('swal-input-error');
          Swal.showValidationMessage('Please provide the doctor name');
          return false;
        }

        // 3. Validate minimum length (shortest valid name = "Ali")
        if (cleanName.length < 3) {
          nameInput.classList.add('swal-input-error');
          Swal.showValidationMessage('Please provide a valid doctor name');
          return false;
        }

        return { docName, city };
      }
    }).then(result => {

      if (result.isConfirmed) {
        this.newRefBy = (result.value as { docName: string; city: string }).docName;
        this.newRefByCity = (result.value as { docName: string; city: string }).city;
        const refDocControl = this.patientBasicInfo.get('RefDoc');

        if (this.isNoRefChecked) {
          refDocControl?.clearValidators();
          refDocControl?.setValue('');
          refDocControl?.disable();
        } else {
          refDocControl?.setValidators([Validators.required]);
          refDocControl?.enable();
        }
        refDocControl?.updateValueAndValidity();
      }

      if (result.isDismissed) {
        this.isNoRefChecked = false;

        const refDocControl = this.patientBasicInfo.get('RefDoc');
        refDocControl?.setValidators([Validators.required]);
        refDocControl?.enable();
        refDocControl?.updateValueAndValidity();

        const checkbox = document.querySelector('#noRefCheckBox') as HTMLInputElement;
        if (checkbox) checkbox.checked = false;
      }

    });
  }


  RadiologistID = null;
  radoiologistList = [];
  getRadiologistInfo() {
    this.radoiologistList = [];
    const params = {
      EmpID: null
    };
    this.spinner.show(this.spinnerRefs.radoiologistList);
    this.shareSrv.getRadiologistInfo(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.radoiologistList);
      this.radoiologistList = res.PayLoadDS['Table'] || [];
      // console.log("Radiologists are:", this.radoiologistList)
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.radoiologistList);
      this.toastr.error('Connection error');
    })
  }
  isEmergencyAssign = false;
  isDocFieldDisable = false;
  onChangeIsEmergencyCheckbox(event) {
    console.log("🚀event:", event)
    if(event?.target.checked == true){
      this.isDocFieldDisable = true
      this.getRadiologistInfo();
    } else {
        this.isDocFieldDisable = false;
        this.RadiologistID = null;
        this.radoiologistList = [];
    }
  }

  

  // -------------------------------------------------------------------
  // Start:: Online Payment Method
  // -------------------------------------------------------------------




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

  qrString = '';
  authData = null;
  refnumberforQRCode = null;
  JSONresponseOfZindagiQR: Record<string, any> = {};
  JSONParamOfZindagiQR: Record<string, any> = {};

  async generateQRCode(OnlineMode: any) {
    console.log("GenerateQRCode ~ item:", OnlineMode);
    this.JSONresponseOfZindagiQR = {};
    this.JSONParamOfZindagiQR = {};
    this.authData = null;
    this.refnumberforQRCode = null;
    if (!OnlineMode.amount) {
      this.qrString = '';
      this.hideQrString = false;
      return;
    }
    try {
      this.spinner.show(this.spinnerRefs.OnlineBanking);

      this.authData = await this.fetchAuthorizationforJsBank();
      this.refnumberforQRCode = await this.GetOnlinePaymentReferenceforQRCode();

      if (!this.refnumberforQRCode) {
        this.toastr.error('Error generating reference number', 'Error');
        return;
      }
      if (!this.authData) {
        this.toastr.error('Authorization credentials not received', 'Error');
        return;
      }

      let location;
      try {
        location = await this.getCurrentLocation();
      } catch (err) {
        this.toastr.error("Error getting location: Allow location permission", 'Error');
        location = { lat: 0, lon: 0 };
      }

      this.qrString = '';
      this.hideQrString = false;
      const objParm = {
        dynamicQrReq: {
          referenceNumber: this.refnumberforQRCode[0].ReferenceID,
          amount: this.parseNumbericValues(OnlineMode.amount),
          longitude: `${location.lon}`,
          latitude: `${location.lat}`,
          // contextOfTrans: 'Digital Goods',
          // duePayableAmount: 0,
          // adjustmentAmount: 0,
          // purposeOfTransaction: '5818',
          // transactionType: 'DQRP',
          // merchant: 'RP-01IDCISB',
          // operator: 'RAAST'
        }
      };
      this.JSONParamOfZindagiQR = objParm;
      const resp: any = await this.postexService.createQrCodeViaProxy(objParm, this.authData).toPromise();
      const data = resp;//JSON.parse(resp.Result);
      this.JSONresponseOfZindagiQR = data;
      this.spinner.hide(this.spinnerRefs.OnlineBanking);
      if (data && data.dynamicQrRes && data.dynamicQrRes.responseCode === 'WB0000') {
        this.hideQrString = true;
        this.qrString = data.dynamicQrRes.qrString;
      } else if (data && data.errorcode && data.errorcode === '4006') {
        const resetResp = await this.resetAuthorizationforJSBank(this.authData.clientId);
        console.log("🚀 resetResp:", resetResp)
        await this.generateQRCode(OnlineMode);
      } else {
        const errorMessage = resp?.messages || 'Something went wrong while generating QR code.';
        Swal.fire({ icon: 'error', title: 'QR Code Generation Failed', text: errorMessage });
        this.qrString = '';
        this.hideQrString = false;
      }
    } catch (error) {
      this.spinner.hide(this.spinnerRefs.OnlineBanking);
      console.error('Error generating QR code:', error);
      Swal.fire({ icon: 'error', title: 'Error generating QR code:', text: 'Something went wrong while generating QR code.' });
    }
  }

  printReceipt() {

    if (!this.JSONreponseOfZindagiInquiry?.accountInfoRes) {
      console.error("❌ No Inquiry response found.");
      return;
    }

    const inquiry = this.JSONreponseOfZindagiInquiry.accountInfoRes;
    const txn = inquiry.transactionStatus?.[0];
    const refno = this.JSONresponseOfZindagiQR.dynamicQrRes.referenceNumber
    // Build Full Patient Name
    const patientName =
      this.patientBasicInfo.value.Salutation + ' ' +
      this.patientBasicInfo.value.FirstName + ' ' +
      (this.patientBasicInfo.value.MiddleName ? this.patientBasicInfo.value.MiddleName + ' ' : '') +
      (this.patientBasicInfo.value.LastName ? this.patientBasicInfo.value.LastName : '');

    const patientCell = this.patientBasicInfo.value.MobileNO;

    // Build HTML receipt string
    const receiptHtml = `
    <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .receipt-box {
            width: 80%;
            border: 1px solid #000;
            padding: 20px;
            font-size: 14px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
          }
          .label { font-weight: bold; width: 150px; display: inline-block; }
          .row { margin-bottom: 8px; }
          .line { border-bottom: 1px solid #333; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="title">Payment Receipt</div>

          <div class="row"><span class="label">Patient Name:</span> ${patientName}</div>
          <div class="row"><span class="label">Mobile No:</span> ${patientCell}</div>

          <div class="line"></div>

          <div class="row"><span class="label">Bill Number:</span> ${refno}</div>
          <div class="row"><span class="label">Status:</span> ${inquiry.responseDescription}</div>

          <div class="line"></div>

          <div class="row"><span class="label">Transaction ID:</span> ${txn?.transactionId || ''}</div>
          <div class="row"><span class="label">Amount:</span> ${txn?.transactionAmount || ''}</div>
          <div class="row"><span class="label">Sender Name:</span> ${txn?.reserved4 || ''}</div>
          <div class="row"><span class="label">Sender IBAN:</span> ${txn?.reserved5 || ''}</div>
          <div class="row"><span class="label">STAN:</span> ${txn?.stan || ''}</div>

          <div class="line"></div>

          <div style="text-align:center; margin-top:20px;">
            <small>Thank you for using our services.</small>
          </div>
        </div>

        <script>
          window.print();
          setTimeout(() => window.close(), 500);
        </script>
      </body>
    </html>
  `;

    // Open print window
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.open();
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }



  getCurrentLocation(): Promise<{ lat: number, lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true }
      );
    });
  }

  fetchAuthorizationforJsBank(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postexService.fetchAuthorizationforJsBank().subscribe(
        (resp: any) => {
          if (resp && resp.payLoad) {
            console.log('fetchAuthorizationforJsBank ~ data:', resp.payLoad);
            resolve(resp.payLoad);
          } else {
            this.spinner.hide(this.spinnerRefs.OnlineBanking);
            this.toastr.error('Authorization failed');
            reject('No payload received');
            return
          }
        },
        (err) => {
          this.spinner.hide(this.spinnerRefs.OnlineBanking);
          this.toastr.error('Authorization failed');
          console.error('error:', err);
          reject(err);
          return
        }
      );
    });
  }
  resetAuthorizationforJSBank(clientId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postexService.resetAuthorizationViaProxy(clientId).subscribe(
        (resp: any) => {
            const parsedResult = JSON.parse(resp.Result);
          if (parsedResult && parsedResult.payLoad) {
            console.log('resetAuthorizationforJsBank ~ data:', parsedResult.payLoad);
            resolve(parsedResult.payLoad);
          } else {
            this.spinner.hide(this.spinnerRefs.OnlineBanking);
            reject('No payload received');
          }
        },
        (err) => {
          this.spinner.hide(this.spinnerRefs.OnlineBanking);
          console.error('error:', err);
          reject(err);
        }
      );
    });
  }

  InsertOnlinePaymentQrCodeCredentials() {
    const param = {
      OnlinePaymentReferenceID: this.JSONParamOfZindagiQR?.dynamicQrReq?.referenceNumber ?? "",
      PaymentModeCategoryID: 6, //this.selectedPaymentCategoryToAdd.PaymentModeCategoryID,
      PaymentModeID: 6, // this.selectedPaymentModeToAdd.ModeId,
      Amount: Number(this.JSONParamOfZindagiQR?.dynamicQrReq?.amount) ?? 0,
      latitude: this.JSONParamOfZindagiQR?.dynamicQrReq?.latitude ?? "",
      longitude: this.JSONParamOfZindagiQR?.dynamicQrReq.longitude ?? "",
      contextOfTrans: this.JSONParamOfZindagiQR?.dynamicQrReq?.contextOfTrans ?? "Digital Goods",
      duePayableAmount: 0, //Number(this.JSONParamOfZindagiQR?.dynamicQrReq?.duePayableAmount) ?? 0,
      adjustmentAmount: 0, // Number(this.JSONParamOfZindagiQR?.dynamicQrReq?.adjustmentAmount) ?? 0,
      purposeOfTransaction: this.JSONParamOfZindagiQR?.dynamicQrReq?.purposeOfTransaction ?? "5818",
      transactionType: this.JSONParamOfZindagiQR?.dynamicQrReq?.transactionType ?? "DQRP",
      merchant: this.JSONParamOfZindagiQR.dynamicQrReq.merchant ?? "RP-01IDCISB",
      operatorName: this.JSONParamOfZindagiQR?.dynamicQrReq?.operator ?? "RAAST",
      QRCodeReqJSON: JSON.stringify(this.JSONParamOfZindagiQR) ?? "",
      CreatedBy: this.loggedInUser.userid || -99,
      responseDescription: this.JSONresponseOfZindagiQR?.dynamicQrRes?.responseDescription ?? "",
      qrString: this.JSONresponseOfZindagiQR?.dynamicQrRes?.qrString ?? "",
      responseCode: this.JSONresponseOfZindagiQR?.dynamicQrRes?.responseCode ?? "",
      QRCodeResponseJSON: JSON.stringify(this.JSONresponseOfZindagiQR) ?? "",
    };
    this.postexService.InsertOnlinePaymentQrCodeCredentials(param).subscribe(
      (resp: any) => {
        if (resp && resp.PayLoad[0].Result == 1) {
          console.log("QR code credentials logs Successfully Saved");
        } else {
          console.log(resp.PayLoad[0].Message);
        }
      },
      (err) => {
        console.error('error:', err);
        console.log("Connection error occured while saving QR Code");
      }
    );
  }

  paymentModesCategoryList = [];
   GetPaymentModeByPaymentModeCategory() {
    // this.qrString = '';
    // this.hideQrString = false;
    const params = { PaymentModeCategoryID: this.selectedPaymentCategoryToAdd.PaymentModeCategoryID };
    this.lookupService.GetPaymentModeByPaymentModeCategory(params).subscribe((resp: any) => {
      console.log(resp);
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.paymentModesList = resp.PayLoad;
        if (this.paymentModesList.length === 1) {
          //  this.selectedPaymentModeToAdd ? this.removeAddedPaymentMode(this.selectedPaymentModeToAdd) : ''; 
          this.selectedPaymentModeToAdd = this.paymentModesList[0];
          this.addNewPaymentMethod();
        }
         this.paymentModesCategoryList.forEach(element => { // disable added payment mode button
            if (element.PaymentModeCategoryID == this.selectedPaymentCategoryToAdd.PaymentModeCategoryID) {
              element.disabled = true;
            }
          });
      }
    }, (err) => { console.log(err) });
  }

  selectedPaymentCategoryToAdd: any = '';

  GetOnlinePaymentReferenceforQRCode(): Promise<any> {
    const formValues = this.patientBasicInfo.getRawValue();
    return new Promise((resolve, reject) => {
      const param = {
        PaymentModeCategoryID: this.selectedPaymentCategoryToAdd?.PaymentModeCategoryID,
        PaymentModeID: this.selectedPaymentModeToAdd?.ModeId,

        Amount: this.JSONParamOfZindagiQR?.dynamicQrReq?.amount ?? 0,
        BranchID: this.loggedInUser.locationid,
        PatientID: formValues.PatientID || null,
        PatientName: this.patientBasicInfo?.value?.Salutation + ' ' + this.patientBasicInfo.value.FirstName + ' ' + (this.patientBasicInfo.value.MiddleName ? this.patientBasicInfo.value.MiddleName + ' ' : '') + ' ' + (this.patientBasicInfo.value.LastName ? this.patientBasicInfo.value.LastName + ' ' : ''),
        PatientCellNo: this.patientBasicInfo?.value?.MobileNO,

        CreatedBy: this.loggedInUser.userid,

      };
      this.postexService.GetOnlinePaymentReference(param).subscribe(
        (resp: any) => {
          if (resp && resp?.StatusCode == 200 && resp?.PayLoad[0]?.Result == 1) {
            resolve(resp.PayLoad);
          } else {
            this.toastr.error(resp.PayLoad[0].ErrorDetails);
            reject('No payload received');
          }
        },
        (err) => {
          console.error('error:', err);
          this.toastr.error("Connection error occured while saving QR Code");
          reject(err);
        }
      );
    });
  }
  JSONParamOfZindagiInquiry
  JSONreponseOfZindagiInquiry
  verifyRAASTSuccess = false;
  hideQrString = false;
  verifyPaymentTransactionQRforRAASTPay(): void {
    this.JSONParamOfZindagiInquiry = {};
    this.JSONreponseOfZindagiInquiry = null;
    this.verifyRAASTSuccess = false;
    if (!this.JSONresponseOfZindagiQR?.dynamicQrRes?.referenceNumber) {
      this.toastr.error("❌ Missing referenceNumber from Zindagi QR response.");
      return;
    }

    const requestPayload = {
      dynamicQRPayInquiryReq: {
        mobileNumber: "03438530074",
        dateTime: Conversions.getCurrentDateISOFormat(),
        rrn:  this.generateRRN(),  //  this.refnumberforQRCode[0].RRN?.toString(),      
        billNumber: this.JSONresponseOfZindagiQR.dynamicQrRes.referenceNumber?.toString(), //"5647730638384577" //"1760405850017465",
      }
    };
    this.JSONParamOfZindagiInquiry = requestPayload;
    this.spinner.show(this.spinnerRefs.OnlineBanking);
    this.postexService.verifyTransaction(requestPayload, this.authData).subscribe({
      next: (resp: any) => {
         this.spinner.hide(this.spinnerRefs.OnlineBanking);
        console.log("⬅️ verifyTransaction response:", resp);
        this.JSONreponseOfZindagiInquiry = resp
        if (resp?.accountInfoRes?.responseCode === "00") {
          this.verifyRAASTSuccess = true;
          this.hideQrString = true;
          const transaction = resp.accountInfoRes.transactionStatus?.[0];
          this.toastr.success("✅ Payment Verified Successfully!");
          console.log("📌 Processing Status:", transaction?.processingStatusName);
          console.log("📌 Received Amount:", transaction?.transactionAmount);
          console.log("📌 Sender Name:", transaction?.reserved4);
          console.log("📌 Sender IBAN:", transaction?.reserved5);
          console.log("📌 Transaction ID:", transaction?.transactionId);
          console.log("📌 STAN:", transaction?.stan);
        }
        else {
          this.toastr.error("⚠️ Verification failed:", resp?.accountInfoRes?.responseDescription || resp?.messages || resp?.dynamicQRPayInquiryRes.responseDescription || "Unknown error");
          // this.qrString = '';
        }
      },
      error: (err) => {
        this.toastr.error("❌ verifyTransaction API error:", err);
        this.spinner.hide(this.spinnerRefs.OnlineBanking);
        // this.qrString = '';
      }
    });
  }

  InsertOnlinePaymenVerificationCredentials() {
    const tran = this.JSONreponseOfZindagiInquiry?.accountInfoRes?.transactionStatus[0];
    const param = {
      OnlinePaymentReferenceID: this.refnumberforQRCode[0]?.ReferenceID || 0,
      PaymentModeCategoryID: 6,
      InquiryReqJSON: JSON.stringify(this.JSONParamOfZindagiInquiry ?? {}),
      MobileNo: "03438530074",
      RRN: Number(this.refnumberforQRCode[0]?.RRN) || 0,
      BillNumber: String(this.refnumberforQRCode[0]?.ReferenceID ?? ""),
      ResponseDateTime: this.JSONreponseOfZindagiInquiry?.accountInfoRes?.responseDateTime ? Conversions.convertToISOFormat(this.JSONreponseOfZindagiInquiry?.accountInfoRes?.responseDateTime) : new Date().toISOString(),

      ProductId: tran?.productId ? Number(tran.productId) : 0,
      TransactionCodeId: tran.transactionCodeId ?? "",
      TransactionCode: tran?.transactionCode ?? "",
      TransactionDetailId: tran?.transactionDetailId ?? "",
      TransactionId: tran?.transactionId ?? "",

      ProductName: tran?.productName ?? "",
      FonepayTransactionCode: tran?.fonepayTransactionCode ?? "",
      TransactionAmount: tran?.transactionAmount ?? 0,
      Stan: tran?.stan ?? "",

      Reserved10: tran?.reserved10 ?? "",
      Reserved9: tran?.reserved9 ?? "",
      Reserved8: tran?.reserved8 ?? "",
      Reserved7: tran?.reserved7 ?? "",
      Reserved6: tran?.reserved6 ?? "",
      Reserved5: tran?.reserved5 ?? "",
      Reserved4: tran?.reserved4 ?? "",
      Reserved3: tran?.reserved3 ?? "",
      Reserved2: tran?.reserved2 ?? "",
      Reserved1: tran?.reserved1 ?? "",

      ProcessingStatusName: tran?.processingStatusName ?? "",
      RecipientMobileNo: tran?.recipientMobileNo ?? "",

      HashData: this.JSONreponseOfZindagiInquiry?.accountInfoRes?.hashData ?? "",
      ResponseCode: this.JSONreponseOfZindagiInquiry?.accountInfoRes?.responseCode ?? "",

      OnlinePaymentInquiryRespJSON: JSON.stringify(this.JSONreponseOfZindagiInquiry ?? {}),

      CreatedBy: this.loggedInUser?.userid ?? -99,
    };

    this.postexService.InsertOnlinePaymenVerificationCredentials(param).subscribe(
      (resp: any) => {
        if (resp && resp.PayLoad[0].Result == 1) {
          console.log("Verification credentials logs Successfully Saved");
        } else {
          console.log(resp.PayLoad[0].Message);
        }
      },
      (err) => {
        console.error('error:', err);
        console.log("Connection error occured while saving QR Code");
      }
    );
  }

    generateRRN(): string {
    const now = new Date();
    const mmdd =('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2);
    const random6 = Math.floor(100000 + Math.random() * 900000).toString();
    let rrn = mmdd + random6; // max → 10 digits
    const min = 7;
    const max = 9;
    const finalLength = Math.floor(Math.random() * (max - min + 1)) + min;
    rrn = rrn.slice(-finalLength);
    return rrn;
  }

  // ------------------------------------------------------------------
  // END:: Online Payment Method
  // -------------------------------------------------------------------
  // ------------------------------------------------------------------
  // START:: MCB
  // -------------------------------------------------------------------

  registerMastercardCallbacks() {
    const self = this;

    (window as any).errorCallback = function (error: any) {
      console.error('MCB Error:', error);
      self.onPaymentError(error);
    };

    (window as any).cancelCallback = function () {
      console.warn('Payment cancelled');
      self.onPaymentCancelled();
    };

    (window as any).completeCallback = function (response: any) {
      console.log('Payment completed:', response);
      self.onPaymentCompleted(response);
    };
  }
  onPaymentError(error: any) {
    this.spinner.hide(this.spinnerRefs.OnlineMCBBanking);
    alert('Payment failed. Please try again.');
  }

  onPaymentCancelled() {
    this.spinner.hide(this.spinnerRefs.OnlineMCBBanking);
    alert('Payment was cancelled.');
  }

  onPaymentCompleted(response: any) {
    console.log('Result Indicator:', response.resultIndicator);
    console.log('Session Version:', response.sessionVersion);

    // 🔥 Call your backend to verify payment
    // this.verifyPayment(response);
  }
  // pay() {
  //   // const sessionId = "SESSION0002046949386E7072802I03" //res?.sessionId;
  //   // if (typeof Checkout === 'undefined') {
  //   //   alert('Mastercard Checkout not loaded');
  //   //   return;
  //   // }
  //   // if (!sessionId) {
  //   //   console.error("No sessionId returned from API");
  //   //   return;
  //   // }

  //   // console.log("Session ID:", sessionId);
  //   // console.log("Checkout ID:", Checkout);

  //   // // Configure Checkout
  //   // (window as any).Checkout.configure({
  //   //   session: { id: sessionId }
  //   // });

  //   // Open Payment Page (full redirect)
  //   // (window as any).Checkout.showEmbededPage();
  //   // (window as any).Checkout.showEmbeddedPage('#embed-target');
  //   let OnlineMode = this.addedPaymentModes.find(a => a.ModeId == 7);
  //   this.OnlinePaymentReferenceID = null
  //   let params = {
  //     OrderId: "0000120",
  //     Amount: OnlineMode.amount,
  //     PaymentModeCategoryID: this.selectedPaymentCategoryToAdd.PaymentModeCategoryID,
  //     ModeId: OnlineMode.ModeId,
  //     BranchID: this.loggedInUser.locationid,
  //     PatientID: this.patientBasicInfo.value.PatientID || null,
  //     PatientName: this.patientBasicInfo.value.Salutation + ' ' + this.patientBasicInfo.value.FirstName + ' ' + (this.patientBasicInfo.value.MiddleName ? this.patientBasicInfo.value.MiddleName + ' ' : '') + ' ' + (this.patientBasicInfo.value.LastName ? this.patientBasicInfo.value.LastName + ' ' : ''),
  //     PatientCellNo: this.patientBasicInfo.value.MobileNO,

  //     CreatedBy: this.loggedInUser.userid,
  //   }
  //   console.log("Calling MCB session API:", API_ROUTES.CREATE_SESSION_MCB);
  //   console.log("Calling MCB session API:", API_ROUTES.ARY_TOKEN);
  //   console.log("Checkout available:", window["Checkout"]);
  //   this.spinner.show(this.spinnerRefs.OnlineMCBBanking);
  //   this.shareSrv.getData(API_ROUTES.CREATE_SESSION_MCB, params).subscribe({
  //     next: (res: any) => {
  //       this.spinner.hide(this.spinnerRefs.OnlineMCBBanking);
  //       this.OnlinePaymentReferenceID = res?.OnlinePaymentReferenceID;
  //       const sessionId = res?.sessionId;
  //       // 🔥 CRITICAL: Ensure Checkout is ready

  //       if (typeof Checkout === 'undefined') {
  //         alert('Mastercard Checkout not loaded');
  //         return;
  //       }
  //       if (!sessionId) {
  //         console.error("No sessionId returned from API");
  //         return;
  //       }

  //       console.log("Session ID:", sessionId);
  //       console.log("Checkout ID:", Checkout);
  //       // const sessionId = res?.sessionId;

  //       if (!sessionId) {
  //         alert("No session ID returned");
  //         return;
  //       }

  //       // 1️⃣ 🔥 Open tab synchronously
  //       const paymentWindow = window.open('', '_blank', 'width=1200;height=1200;'); //, 'width=1200;height=1200;'
  //       if (!paymentWindow) {
  //         alert('Please allow popups for this site.');
  //         return;
  //       }
  //       const paymentUrl = `https://test-mcbpk.mtf.gateway.mastercard.com/checkout/entry/${sessionId}?checkoutVersion=1.0.0`;
  //       paymentWindow.location.href = paymentUrl;

  //     },
  //     error: (err) => {
  //       // console.error("Failed to create session:", err);
  //       alert("Payment session failed. Please try again.");
  //       this.spinner.hide(this.spinnerRefs.OnlineMCBBanking);
  //     }
  //   });
  // }
  verfiyMCBPayment() {
    if (!this.OnlinePaymentReferenceID)
      return;
    const params = {
      "orderId": this.OnlinePaymentReferenceID
    }
    const url = `${API_ROUTES.MCB_VERIFY_ORDER}/${this.OnlinePaymentReferenceID}`;

    this.shareSrv.getUtility(url).subscribe({
      next: (res: any) => {
        console.log("MCB Payment verification response:", res);
      },
      error: (err) => {
        this.spinner.hide(this.spinnerRefs.OnlineMCBBanking);
      }
    });
  }

  completeCallback(response: any) {
    console.log("response: ", response);
    console.log("resultIndicator: ", response.resultIndicator);
    console.log("sessionVersion: ", response.sessionVersion);

    // OPTIONAL: Call backend after success
    // this.verifyPayment(response.sessionVersion);
  }



  // ------------------------------------------------------------------
  // START:: VOUCHER/COUPON DISCOUNT IMPLEMENTATION
  // -------------------------------------------------------------------

  voucherCode = '';
  campaignCoupons: any[] = [];
  couponVerificationMessage = '';
  couponMessageClass = '';   // bootstrap classes
  isSpinnerVoucher = true;
  disabledButtonVoucher = false;
  confirmationPopoverConfigVoucher = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirm Coupon Application',
    popoverMessage: 'The discount will be applied only to eligible test(s) after validation.',
    confirmText: 'Apply <i class="fa fa-check"></i>',
    cancelText: 'Cancel <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  };


  isVoucher = false;
  isVoucherVerified = false;
  voucherEligibleTPIds: number[] = [];
  voucherDiscountPercentage = 0;
  voucherAmountSummaryHtml = '';
  descountPerc = 0;

  verifyVoucherCode() {
    this.spinner.show();
    this.disabledButtonVoucher = true;
    this.isSpinnerVoucher = false;

    const dTestProfileIDs = this.selectedTestProfiles
      .map(t => t.TPId)
      .filter(id => id != null);

    const _param = {
      CouponCode: this.voucherCode,
      LocID: this.loggedInUser.locationid,
      PanelID: this.selectedPanel || null,
      DTestProfileIDs: dTestProfileIDs
    };

    this.shareSrv
      .getData(API_ROUTES.VERIFY_COUPON_FOR_REGISTRATION, _param)
      .subscribe(
        (resp: any) => {
          this.spinner.hide();
          this.disabledButtonVoucher = false;
          this.isSpinnerVoucher = true;
          this.isVoucher = true;

          this.couponVerificationMessage = resp?.Message;

          switch (resp?.StatusCode) {

            case 200:
              this.campaignCoupons = resp.PayLoad || [];
              let appliedOnTests = '';
              let discountPercent = '';

              if (this.campaignCoupons.length) {
                this.isVoucherVerified = true;
                if (!this.isOutsource || (this.isOutsource && this.campaignCoupons[0].PanelIDs == -1)) {
                  this.selectedPatientType = 1;
                  this.selectedPanel = null;
                }
                // if (this.campaignCoupons[0].PanelIDs == -1) {
                //   this.selectedPatientType = 1;
                //   this.selectedPanel = null;
                // } else {
                //   this.selectedPanel = 2;
                //   this.selectedPanel = this.campaignCoupons[0].PanelIDs;
                // }
                discountPercent = this.campaignCoupons[0].DiscountPercent
                  ? `${this.campaignCoupons[0].DiscountPercent}%`
                  : '';
                this.descountPerc = this.campaignCoupons[0].DiscountPercent;
                this.allRemarks.InternalRemarks = `Voucher Discount Applied | Code: ${this.voucherCode} | Gross: ${this.patientVisitInfo.grossAmount} | Net: ${this.patientVisitInfo.netAmount}`;
              }

              if (
                this.campaignCoupons.length &&
                this.campaignCoupons[0].DTestProfileIDs
              ) {
                const eligibleTPIds = this.campaignCoupons[0].DTestProfileIDs
                  .split(',')
                  .map((id: string) => Number(id.trim()))
                  .filter((id: number) => !isNaN(id));

                this.voucherEligibleTPIds = eligibleTPIds;
                this.voucherDiscountPercentage =
                  Number(this.campaignCoupons[0].DiscountPercent) || 0;

                const matchedTests = this.selectedTestProfiles.filter(t =>
                  eligibleTPIds.includes(t.TPId)
                );

                appliedOnTests = matchedTests
                  .map(t => t.TestProfileCode)
                  .filter(code => !!code)
                  .join(', ');

                // Calculate voucher discount
                this.recalculateAmountsVoucher();
              }

              // -----------------------------
              // Main success message (existing)
              // -----------------------------
              this.couponVerificationMessage =
                discountPercent && appliedOnTests
                  ? `Coupon verified successfully. The discount will be applied on eligible test(s) <strong>(${appliedOnTests})</strong> against this voucher.<br/>
                    <strong>Discount:</strong> ${discountPercent}`
                  : resp.Message;

              // -----------------------------
              // Voucher amount summary (NEW – UI only)
              // -----------------------------
              this.voucherAmountSummaryHtml =
                appliedOnTests
                  ? `
                    <span class="font-weight-semibold">Gross Amt:</span>
                    ${this.patientVisitInfo.grossAmount}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <span class="font-weight-semibold">Voucher Discount:</span>
                    ${discountPercent} (${this.patientVisitInfo.discount})
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <span class="font-weight-semibold">Net Amt:</span>
                    ${this.patientVisitInfo.netAmount}
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <span class="font-weight-semibold">Applied Tests:</span>
                    <strong>(${appliedOnTests})</strong>
                  `
                  : '';

              const toasterMessage =
                discountPercent && appliedOnTests
                  ? `Coupon verified successfully. Discount applied on (${appliedOnTests}). Discount: ${discountPercent}`
                  : resp.Message;
              this.allRemarks.InternalRemarks = `Voucher Discount Applied | Code: ${this.voucherCode} | Gross: ${this.patientVisitInfo.grossAmount} | Net: ${this.patientVisitInfo.netAmount}`;
              this.couponMessageClass = 'text-primary border-primary';
              this.toastr.success(toasterMessage);
              break;

            case 204:
              this.campaignCoupons = [];
              this.isVoucherVerified = false;

              this.voucherEligibleTPIds = [];
              this.voucherDiscountPercentage = 0;
              this.voucherAmountSummaryHtml = '';
              this.recalculateAmounts();

              this.couponVerificationMessage = resp.Message;
              this.couponMessageClass = 'text-success border-success';
              this.toastr.info(resp.Message);
              break;

            case 400:
              this.isVoucherVerified = false;

              this.voucherEligibleTPIds = [];
              this.voucherDiscountPercentage = 0;
              this.voucherAmountSummaryHtml = '';
              this.recalculateAmounts();

              this.couponVerificationMessage = Array.isArray(resp.PayLoad)
                ? resp.PayLoad.map(e => e.Error).join(', ')
                : resp.Message;

              this.couponMessageClass = 'text-warning border-warning';
              this.toastr.warning(this.couponVerificationMessage);
              break;

            default:
              this.isVoucherVerified = false;

              this.voucherEligibleTPIds = [];
              this.voucherDiscountPercentage = 0;
              this.voucherAmountSummaryHtml = '';
              this.recalculateAmounts();

              this.couponVerificationMessage = 'Unexpected response from server.';
              this.couponMessageClass = 'text-danger border-danger';
              this.toastr.error(this.couponVerificationMessage);
          }
        },
        () => {
          this.spinner.hide();
          this.disabledButtonVoucher = false;
          this.isSpinnerVoucher = true;
          this.isVoucherVerified = false;
          this.allRemarks.InternalRemarks = "";

          this.voucherEligibleTPIds = [];
          this.voucherDiscountPercentage = 0;
          this.voucherAmountSummaryHtml = '';
          this.recalculateAmounts();

          this.couponVerificationMessage = 'Connection error';
          this.couponMessageClass = 'text-danger border-danger';
          this.toastr.error('Connection error');
        }
      );
  }



  recalculateAmountsVoucher() {
    const allTests = this.getValidAddedTestsProfilesVoucher();

    const eligibleTests = allTests.filter(t =>
      this.voucherEligibleTPIds.includes(t.TPId)
    );

    const nonEligibleTests = allTests.filter(t =>
      !this.voucherEligibleTPIds.includes(t.TPId)
    );

    // Gross calculations
    const eligibleGross = this.getTotalVoucher(eligibleTests, 'TestProfilePrice');
    const nonEligibleGross = this.getTotalVoucher(nonEligibleTests, 'TestProfilePrice');

    // Voucher discount only on eligible tests
    let voucherDiscount = 0;

    eligibleTests.forEach(test => {
      if (test.IsDiscountable) {
        const discountValue =
          ((test.TestProfilePrice || 0) * this.voucherDiscountPercentage) / 100;

        voucherDiscount += Math.round(discountValue);
      }
    });

    voucherDiscount = this.parseNumbericValues(voucherDiscount);

    // Final amounts
    const grossAmount = this.parseNumbericValues(eligibleGross + nonEligibleGross);
    const netAmount = this.parseNumbericValues(grossAmount - voucherDiscount);

    // Persist values
    this.patientVisitInfo.grossAmount = grossAmount;
    this.patientVisitInfo.discount = voucherDiscount;
    this.patientVisitInfo.netAmount = netAmount;

    this.discountedCharges = netAmount;

    // Minimum receivable logic stays SAME
    this.minimumReceivableAmount = Math.round(
      (this.minimumReceivablePercentage.dynamic * netAmount) / 100
    );

    // Reuse existing payment logic
    this.paymentModesValueUpdated();
    this.currencyNoteReceivedChanged();
  }
  getValidAddedTestsProfilesVoucher() {
    return this.selectedTestProfiles.filter(a => a.allowForReg !== false);
  }
  getTotalVoucher(arr, key) {
    return arr
      .map(a => this.parseNumbericValues(a[key]))
      .reduce((a, b) => a + b, 0);
  }



  // ------------------------------------------------------------------
  // START:: VOUCHER/COUPON DISCOUNT IMPLEMENTATION
  // -------------------------------------------------------------------


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



