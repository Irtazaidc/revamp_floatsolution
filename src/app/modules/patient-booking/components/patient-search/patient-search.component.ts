// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import { PatientService } from '../../services/patient.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, UserModel } from '../../../../modules/auth';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { animate, AUTO_STYLE, state, style, transition, trigger } from '@angular/animations';
import { VisitService } from '../../services/visit.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { ConscentForms } from 'src/assets/docs/conscent-forms/conscent-forms';

import moment from 'moment';
import { LookupService } from '../../services/lookup.service';
import { DiscountCardService } from '../../services/discount-card.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
// import { StorageService } from 'src/app/modules/shared/helpers/storage.service';

@Component({
  standalone: false,

  selector: 'app-patient-search',
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.scss'],
  animations: [
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)' }),
        animate('400ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PatientSearchComponent implements OnInit, AfterViewInit, OnChanges {

  @Output() patientSelectedEvent = new EventEmitter<any>();
  @Output() testSearchEvent = new EventEmitter<any>();
  @Output() visitSelectedEvent = new EventEmitter<any>();
  @Output() gettingValueTableRow = new EventEmitter<any>();
  @Output() visistList = new EventEmitter<any>();
  @Output() cardInfo = new EventEmitter<any>();
  @Input() buttonControls = ['visits'];
  @Input() isInquiry = false;
  @Input() SectionToShow = { showCardNo: false, NoRecordLabel: true, hidePIN: true, selectedPatientEvent: false };
  @ViewChild('patientVisits') patientVisitsPopup;
  @ViewChild('EditPatientRecord') EditPatientRecord;
  @ViewChild('patientVisitsInfo') patientVisitsPopupInfo;
  patientVisitsPopupRef: NgbModalRef;
  @ViewChild('patientVisitDocs') patientVisitDocs;
  patientVisitDocsRef: NgbModalRef;
  @ViewChild('patientDiscountCards') patientDiscountCards;
  patientDiscountCardsRef: NgbModalRef;
  @ViewChild('fitToFlyPopup') fitToFlyPopup;
  @ViewChild("showSearchTest") showSearchTest;
  searchTextVisit = '';

  selectedPatient: any = '';
  selectedExistingPatient: any = '';
  hideTable = false;
  loggedInUser: UserModel;
  editPatientInformation: FormGroup;
  loggedInUser$: Observable<UserModel>;
  loggedInUser1: UserModel;
  discountCardlist = [];
  customPatterns = {
    'A': { pattern: new RegExp('[A-Z]') },
    '0': { pattern: new RegExp('[0-9]') }
  };

  patientSearchParams = {
    PatientID: '',
    BookingID: '',
    VisitId: '',
    PatientNo: '',
    FirstName: '',
    LastName: '',
    CNIC: '',
    PassportNo: '',
    MobileNO: '',
    CardNO: '',
    eclHospitalMrno: '',
    GIZReferenceNo: ''
  }

  searchResults = [{ Message: 'No Record(s) Found' }];
  filteredSearchResults = [];
  paginatedSearchResults = [];
  page = 1;
  pageSize = 5;
  collectionSize = 0;

  patientVisitsList = [];

  advancedSearchEnabled = false;

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

  screenPermissions = [];
  screenPermissionsObj: any = {};

  spinnerRefs = {
    searchPatients: 'searchPatients',
    patientVisits: 'patientVisits',
    patientDiscountCards: 'patientDiscountCards'
  }

  buttonControlsPermissions = {
    bookingBtn: false,
    visitsBtn: false,
    invoiceBtn: false,
    barcodeBtn: false,
    patientSelectBtn: false,
    discountCardSaleBtn: false,
    discountCardsViewBtn: false,
    visitSelectBtn: false,
    printFinalReports: false,
    searchVisitBtn: false,
    searchCardBtn: false,
    showResults: false,
    attachDocs: false,
    visitEditBtn: false,
    testSearchBtn: false,
    FITBtn: false,
  }
  selectedVisit = null;
  countriesList: any[];
  patientIDforPatientCard: number = null;
  infoDeskChk = false;
  patientDiscountCardsList = [];
  editPatientContactBtn = true
  patientData: any = [];
  curDate = "";
  selectedDob = "";
  PACSServers: any;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private appPopupService: AppPopupService,
    private visitService: VisitService,
    private helperService: HelperService,
    private lookupService: LookupService,
    private discountCardService: DiscountCardService,
    private sharedService: SharedService
    // private storageService: StorageService
  ) {
    this.editPatientInformation = this.fb.group({
      FirstName: [''],
      LastName: [''],
      MobileOperatorID: [''],
      MobileNO: [''],
      HomeAddress: [''],
      Email: [''],
    });
  }


  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPermissions();
    this.getMobileOperator();
    this.reEvaluateButtonsPermissions();
    (this.route.routeConfig.path == 'info-desk') ? this.infoDeskChk = true : this.infoDeskChk = false;
  }

  ngAfterViewInit() {
    this.reEvaluateButtonsPermissions();
  }

  ngOnChanges(e) {
    this.reEvaluateButtonsPermissions();
  }
  onInputChange() {
    if (this.patientSearchParams.PatientNo) {
      this.patientSearchParams.PatientNo = this.patientSearchParams.PatientNo.toUpperCase();
    }
  }
  clearFields(activeFieldName) {
    switch (activeFieldName) {
      case 'MobileNO': {
        this.patientSearchParams.PatientNo = "";
        this.patientSearchParams.VisitId = "";
        this.patientSearchParams.CardNO = "";
        break;
      }
      case 'PatientNo': {
        this.patientSearchParams.MobileNO = "";
        this.patientSearchParams.VisitId = "";
        this.patientSearchParams.CardNO = "";
        break;
      }
      case 'VisitId': {
        this.patientSearchParams.MobileNO = "";
        this.patientSearchParams.PatientNo = "";
        this.patientSearchParams.CardNO = "";
        break;
      }
      case 'CardNO': {
        this.patientSearchParams.MobileNO = "";
        this.patientSearchParams.PatientNo = "";
        this.patientSearchParams.VisitId = "";
        break;
      }
    }
  }
  loadLoggedInUserInfo() {
    this.loggedInUser$ = this.auth.currentUserSubject.asObservable();
    this.loggedInUser = this.auth.getUserFromLocalStorage();// this.storageService.getLoggedInUserProfile();
    this.loggedInUser1 = this.auth.currentUserValue;
    
  }

  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
  }

  openSearchTest() {
    setTimeout(() => {
      this.appPopupService.openModal(this.showSearchTest, {
        backdrop: "static",
        size: "xl",
      });
    }, 200);
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

  searchPatient() {

    if (this.patientSearchParams.CardNO.length) {
      this.discountCardlist = [];
      this.hideTable = true;
      const params = { cardNo: this.patientSearchParams.CardNO };
      this.spinner.show(this.spinnerRefs.searchPatients);
      this.discountCardService.getDiscountCardDetails(params).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.searchPatients);
        if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
          this.discountCardlist = res.PayLoad;
          this.cardInfo.emit(this.discountCardlist);
          // this.toastr.success('Fetching Record');
        }
        else {
          this.toastr.error('No Record Found');
        }
      },
        (err) => {
          this.toastr.error('Connection error');
          console.log(err);
        }
      );
      return;
    }
    else if (this.patientSearchParams.GIZReferenceNo.length) {
      this.getPatientInfoByGIZRefNo();
      return;
    }

    this.hideTable = false;
    //here
    const params = this.patientSearchParams;
    params.BookingID = (params.BookingID || '').trim();
    params.VisitId = (params.VisitId || '').trim().toString().replace(/\D/g, '');
    params.PatientNo = (params.PatientNo || '').trim();
    params.FirstName = (params.FirstName || '').trim();
    params.LastName = (params.LastName || '').trim();
    params.CNIC = (params.CNIC || '').trim();
    params.PassportNo = (params.PassportNo || '').trim();
    params.MobileNO = (params.MobileNO || '').trim().toString().replace(/\D/g,'');
    if (params.BookingID
      || params.VisitId
      || params.PatientNo
      || params.FirstName
      || params.LastName
      || params.CNIC
      || params.PassportNo
      || params.MobileNO
      || params.eclHospitalMrno
      || params.GIZReferenceNo) {
      if (params.MobileNO && params.MobileNO.length < 7) {
        this.toastr.warning("Please enter atleast 7 digits");
        return
      }
      else {
        this.searchResults = [{ Message: 'Loading...' }];
        this.filteredSearchResults = this.searchResults;
        this.refreshPagination();
        this.spinner.show(this.spinnerRefs.searchPatients);
        params.VisitId = (params.VisitId || '').replace(/-/g, '');
        this.patientService.searchPatient(params).subscribe((res: any) => {
          this.spinner.hide(this.spinnerRefs.searchPatients);
          if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
            this.searchResults = res.PayLoad;
            if (params.VisitId && res.PayLoad.length == 1) {
              this.visitSelectedEvent.emit({ VisitID: params.VisitId });
            }
          } else {
            this.searchResults = [{ Message: 'No Record(s) Found' }];
            this.visitSelectedEvent.emit(null);
          }
          this.filteredSearchResults = this.searchResults;
          this.refreshPagination();
        }, (err) => {
          this.searchResults = [{ Message: 'Connection Error' }];
          this.filteredSearchResults = this.searchResults;
          this.refreshPagination();
          this.toastr.error('Connection error');
          console.log(err);
          this.spinner.hide(this.spinnerRefs.searchPatients);
        })
      }
    } else {
      this.toastr.warning('Please enter atleast one field');
    }
  }
  // searchPatient(patientId) {
  //   let patientSearchParams = {
  //     PatientID: patientId,
  //   }
  //   if( patientSearchParams.PatientID ) {
  //     this.spinner.show();
  //     //this.patientService.searchPatient
  //     this.patientService.searchPatientOrbit(patientSearchParams).subscribe( (res: any) => {
  //       this.spinner.hide();
  //       // console.log(res);
  //       if(res && res.statusCode == 200 && res.payLoad && res.payLoad.length) {
  //         //this.searchResults = res.payLoad;
  //         this.populatePatientFields(res.payLoad[0]);
  //       } else {
  //         this.toastr.warning('Patient record not found');
  //       }
  //     },  (err) => {
  //       this.toastr.error('Connection error');
  //       console.log(err);
  //       this.spinner.hide();
  //     })
  //   }
  // }
  getVisitsForInvoice(patient) {
    this.patientVisitsPopupRef = this.appPopupService.openModal(this.patientVisitsPopup, { size: 'lg' });
    this.patientVisitsList = [];

    const params = { patientID: patient.OrbitPatientID };
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
        this.refreshPagination();
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
  searchPatientVisit() {
    this.patientVisitsList = [];
    const params = this.patientSearchParams;
    params.BookingID = (params.BookingID || '').trim();
    params.VisitId = (params.VisitId || '').trim().toString().replace(/\D/g, '');
    params.PatientNo = (params.PatientNo || '').trim();
    params.FirstName = (params.FirstName || '').trim();
    params.LastName = (params.LastName || '').trim();
    params.CNIC = (params.CNIC || '').trim();
    params.PassportNo = (params.PassportNo || '').trim();
    params.MobileNO = (params.MobileNO || '').trim();
    params.eclHospitalMrno = (params.eclHospitalMrno || '').trim();
    if (params.BookingID
      || params.VisitId
      || params.PatientNo
      || params.FirstName
      || params.LastName
      || params.CNIC
      || params.PassportNo
      || params.MobileNO
      || params.eclHospitalMrno) {

      if (params.MobileNO && params.MobileNO.length < 7) {
        this.toastr.warning("Please enter atleast 7 digits");
        return;
      }

      this.refreshPagination();
      this.spinner.show(this.spinnerRefs.searchPatients);
      params.VisitId = (params.VisitId || '').replace(/-/g, '');
    } else {
      this.toastr.warning('Please fill atleast one field');
      return;
    }
    this.patientService.searchPatientVisits(params).subscribe((res: any) => {

      this.spinner.hide(this.spinnerRefs.searchPatients);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        const PatientVisits = res.PayLoad;
        if (
          //to show patient visits on popup
          this.route.routeConfig.path == 'info-desk'
          || this.route.routeConfig.path == 'inquiry-report'
          || this.route.routeConfig.path == 'addendum-second-opinion-request'
          || this.route.routeConfig.path == 'report-reset-request'
          || this.route.routeConfig.path == 'initial-report-reset-request'
        ) {
          // if (params.VisitId && res.PayLoad.length == 1) {
          //   this.visitSelectedEvent.emit({ VisitID: params.VisitId });
          // }else{
          //   this.patientVisitsPopupRef = this.appPopupService.openModal(this.patientVisitsPopup, { size: 'lg' });
          // }

          const PatientVisitsInfo = PatientVisits.map(a => ({
            BranchID: a.BranchID,
            CreatedOn: a.VisitDateTime,
            PatientID: a.PatientId,
            VisitID: a.VisitId,
            VisitNo: a.PIN,
            isAirLine: a.isAirLine,
            EncVisitID: a.VisitID,
            PatientName: a.PatientName
          }));
          this.patientVisitsPopupRef = this.appPopupService.openModal(this.patientVisitsPopup, { size: 'lg' });
          this.patientVisitsList = PatientVisitsInfo;
          this.patientIDforPatientCard = this.patientVisitsList[0].PatientID;
          this.visitIDforPatientCard = this.patientVisitsList[0].VisitID;
          // this.patientVisitsPopupRef = this.appPopupService.openModal(this.patientVisitsPopupInfo, { size: 'lg' });
        } else {
          this.visistList.emit(PatientVisits);
          this.patientIDforPatientCard = null;
        }
      }
      else {
      }
      // this.refreshPagination();

    },
      (err) => {
        this.searchResults = [{ Message: 'Connection Error' }];
        this.refreshPagination();
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide(this.spinnerRefs.searchPatients);
      })
  }


  visitIDforPatientCard = null;
  updatePatientCard(v) {
    this.visitIDforPatientCard = v.VisitID
    if (this.route.routeConfig.path == 'info-desk' || this.route.routeConfig.path == 'inquiry-report') {
      this.patientIDforPatientCard = v.PatientID
    } else {
      this.patientIDforPatientCard = null
    }
  }
  openInvoice(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visit.VisitID, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (this.invoiceCopyType || 0), timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
    // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }
  openFITCertificate(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({
       visitID: visit.VisitID,
       PatientID: visit.PatientID,
       loginName: this.loggedInUser.username, 
       appName: 'WebMedicubes:search_pat',
       isFromFITBtn: 1,
       isPatientWilling: 1,
        copyType: (this.invoiceCopyType || 0), 
        timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');

  }
  // 221201013403
  OpenFitToFlyCertificate(v) {

    console.log("OpenFitToFlyCertificate", v);
    this.patientData = [];
    const params = {
      "VisitID": v.VisitID
    }
    this.patientService.getPatientInfoByVisitID(params).subscribe((resp: any) => {

      console.log(resp);
      this.patientData = resp.PayLoadArr[0];
      this.selectedDob = moment(this.patientData).format('DD-MM-yyyy')
      console.log("this.patientDatathis.patientDatathis.patientData", this.patientData);
      this.curDate = moment(new Date()).format('DD-MM-yyyy')
    }, (err) => {
      console.log(err);
    });

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

  printBarcode(visit) {
    const url = environment.patientReportsPortalUrl + 'smp-bc?p=' + btoa(JSON.stringify({ visitId: visit.VisitID, appName: 'WebMedicubes:search_pat', timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
  }

  getPatientDiscountCards(patient) {
    this.getDiscountCardsByPatient(patient.OrbitPatientID);
  }
  getDiscountCardsByPatient(patientId) {
    this.patientDiscountCardsList = [];
    if (!patientId) {
      return;
    }
    this.patientDiscountCardsRef = this.appPopupService.openModal(this.patientDiscountCards, { size: 'lg' });
    const params = {
      patientId: patientId // this.patientBasicInfo.get('PatientID').value;
    }
    this.spinner.show(this.spinnerRefs.patientDiscountCards);
    this.lookupService.getDiscountCardsByPatientId(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.patientDiscountCards);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.patientDiscountCardsList = data || [];
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.patientDiscountCards);
      console.log(err);
    });
  }

  newRegistration() {
    let _url = ['pat-reg/reg'] || [];
    if (this.route.routeConfig.path == 'regForHS') {
      _url = ['pat-reg/regForHS'];
    }
    this.updateUrlParams_navigateTo(_url);
  }

  patientSelected(patient) {

    let _url = ['pat-reg/reg'] || [];
    if (this.route.routeConfig.path == 'regForHS') {
      _url = ['pat-reg/regForHS'];
    } else if (this.route.routeConfig.path == 'hc-booking') {
      _url = ['pat-reg/hc-booking'];
    } else if (this.route.routeConfig.path == 'dis-card-sale') {
      _url = ['pat-reg/dis-card-sale']
    }
    this.updateUrlParams_navigateTo(_url, { p: btoa(JSON.stringify({ orbitPatientID: patient.OrbitPatientID, patSrc: 10 })) }); // patientID: patient.OrbitPatientID, 
    // this.router.navigate(
    //   _url, {
    //     // relativeTo: this.route,
    //     replaceUrl: true,
    //     queryParams: {p: btoa(JSON.stringify( {patientID: patient.patientID} ))},
    //     // queryParamsHandling: 'merge', // remove to replace all query params by provided
    //   }
    // );

    // this.router.navigate(
    //   _url,
    //   {
    //     relativeTo: this.route,
    //     replaceUrl: true,

    //     // queryParamsHandling: 'merge', // remove to replace all query params by provided
    //   });
    // }

  }
  visitSelectedForDocs(visit) {
    this.selectedVisit = null;
    setTimeout(() => {
      this.selectedVisit = visit;

      const visitId = (visit || {}).VisitID;
      if (!visitId) {
        this.toastr.warning('Visit not selected');
        return;
      }
      this.patientVisitDocsRef = this.appPopupService.openModal(this.patientVisitDocs, { size: 'lg' });
    }, 100);
  }

  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }

  reEvaluateButtonsPermissions() {
    if (this.route.routeConfig.path == 'search') {
      this.buttonControlsPermissions.bookingBtn = true;
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.invoiceBtn = true;
      this.buttonControlsPermissions.barcodeBtn = true;
      this.buttonControlsPermissions.showResults = true;
      this.buttonControlsPermissions.visitEditBtn = true;
      this.buttonControlsPermissions.attachDocs = true;
      this.buttonControlsPermissions.FITBtn = true;
      // this.buttonControlsPermissions.searchCardBtn = false;

      this.buttonControlsPermissions.discountCardsViewBtn = true;
    } else if (this.route.routeConfig.path == 'pat-rpts') {
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = false;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      this.buttonControlsPermissions.printFinalReports = true;
      this.buttonControlsPermissions.searchVisitBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.FITBtn = true;
      // this.buttonControlsPermissions.searchCardBtn = false;

    }
    else if (this.route.routeConfig.path == 'cc-request-handling') {
      this.buttonControlsPermissions.searchVisitBtn = false;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = true;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.discountCardsViewBtn = false;
    }
    else if (this.route.routeConfig.path == 'update-visit-info') {
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.invoiceBtn = true;


    }
    else if (this.route.routeConfig.path == 'hc-request-submission') {
      this.buttonControlsPermissions.searchVisitBtn = false;
      this.buttonControlsPermissions.visitsBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = true;
    }
    else if (this.route.routeConfig.path == 'create-complaint-feedback') {
      this.buttonControlsPermissions.searchVisitBtn = false;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = true;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.discountCardsViewBtn = false;
    }
    else if (this.route.routeConfig.path == 'add-family') {
      this.buttonControlsPermissions.searchVisitBtn = false;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = false;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = false;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = false;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.discountCardsViewBtn = true;
    }
    else if (this.route.routeConfig.path == 'manage-cms-request') {
      this.buttonControlsPermissions.searchVisitBtn = false;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = true;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.discountCardsViewBtn = false;
    }
    else if (this.route.routeConfig.path == 'manage-my-cms') {
      this.buttonControlsPermissions.searchVisitBtn = false;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = true;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.discountCardsViewBtn = false;
    }
    else if (this.route.routeConfig.path == 'info-desk' && this.isInquiry) {
      this.buttonControlsPermissions.searchVisitBtn = true;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = false;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = false;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.FITBtn = true;
      this.buttonControlsPermissions.discountCardsViewBtn = false;
    }
    else if (
      //show search visits button and hide search pateints button
      this.route.routeConfig.path == 'inquiry-report'
      || this.route.routeConfig.path == 'addendum-second-opinion-request'
      || this.route.routeConfig.path == 'report-reset-request'
      || this.route.routeConfig.path == 'initial-report-reset-request'
      && this.isInquiry
    ) {
      this.buttonControlsPermissions.searchVisitBtn = true;
      this.buttonControlsPermissions.bookingBtn = false;
      this.buttonControlsPermissions.visitsBtn = false;
      this.buttonControlsPermissions.invoiceBtn = false;
      this.buttonControlsPermissions.barcodeBtn = false;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = false;
      this.buttonControlsPermissions.discountCardSaleBtn = false;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = false;
      this.buttonControlsPermissions.discountCardsViewBtn = false;
    }
    else if (this.route.routeConfig.path == 'info-desk' && !this.isInquiry) {
      this.buttonControlsPermissions.searchVisitBtn = true;
      this.buttonControlsPermissions.bookingBtn = true;
      this.buttonControlsPermissions.visitsBtn = true;
      this.buttonControlsPermissions.invoiceBtn = true;
      this.buttonControlsPermissions.FITBtn = true;
      this.buttonControlsPermissions.barcodeBtn = true;
      // this.buttonControlsPermissions.searchCardBtn = false;
      this.buttonControlsPermissions.patientSelectBtn = true;
      this.buttonControlsPermissions.discountCardSaleBtn = true;
      this.buttonControlsPermissions.visitSelectBtn = true;
      this.buttonControlsPermissions.showResults = true;
      this.buttonControlsPermissions.discountCardsViewBtn = true;
      this.buttonControlsPermissions.testSearchBtn = true;

    } else {
      this.buttonControlsPermissions.bookingBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'booking') ? true : false;
      this.buttonControlsPermissions.visitsBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'visits') ? true : false;
      this.buttonControlsPermissions.invoiceBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'invoice') ? true : false;
      this.buttonControlsPermissions.barcodeBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'barcode') ? true : false;
      this.buttonControlsPermissions.patientSelectBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'patientselection') ? true : false;
      this.buttonControlsPermissions.discountCardSaleBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == ('discountCardSaleBtn').toLowerCase()) ? true : false;
      this.buttonControlsPermissions.discountCardsViewBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == ('discountCardsViewBtn').toLowerCase()) ? true : false;
      this.buttonControlsPermissions.visitSelectBtn = this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'visitselection') ? true : false;
      this.buttonControlsPermissions.showResults = true;
      // this.buttonControlsPermissions.searchCardBtn = false;
    }

    if (this.buttonControls.find(a => (a || '').toString().toLowerCase().trim() == 'attachdocs')) {
      this.buttonControlsPermissions.attachDocs = true;
    }
  }


  patientRowDoubleClick(patient) {
    if (this.buttonControlsPermissions.patientSelectBtn || this.SectionToShow.selectedPatientEvent) {
      this.selectedExistingPatient = patient;
      this.patientSelectedEvent.emit(this.selectedExistingPatient);
    }
  }
  patientExistingAddFamily(event) {
    this.selectedPatient = event;
    this.patientSelectedEvent.emit(this.selectedPatient);
  }
  visitRowDoubleClickEvent(visit) {
    this.appPopupService.closeModal(this.patientVisitsPopupRef);
    if (this.buttonControlsPermissions.visitSelectBtn) {
      this.visitSelectedEvent.emit(visit);
    }
  }

  refreshPagination() {
    this.collectionSize = this.filteredSearchResults.length;
    this.paginatedSearchResults = this.filteredSearchResults
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  copyText(text: string) {
    this.helperService.copyMessage(text);
  }

  // openModal(content) {
  //   this.modalService.open(content, {size: 'lg', ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
  //   }, (reason) => {
  //     this.patientVisitsList = [];
  //   });
  // }

  // closeModal() {
  //   this.modalService.dismissAll();
  //   this.patientVisitsList = [];
  // }


  updateUrlParams_navigateTo(url, params = {}, settings = {}) {
    const _url = url || [];
    const _settings = {
      ...{
        // relativeTo: this.route,
        replaceUrl: true,
        queryParams: params,
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }, ...settings
    };
    this.router.navigate(
      _url,
      _settings
    );
  }

  getInfoForConscent(visitInfo) {
    const params = {
      "VisitID": visitInfo.VisitID
    }
    this.patientService.getConscentDetailByVisitID(params).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        const PatData = resp.PayLoad;
        this.openConscentForm(PatData[0]);
      }
      else {
        this.toastr.warning("Visit was not booked on airline")
      }
    }, (err) => { console.log("err", err) })

  }

  OpenMOConsentForm(visitInfo) {
    let url = environment.patientReportsPortalUrl;
    url = url + 'mo-consent?p=' + btoa(JSON.stringify({ isShowMiniConsent: 1, VisitID: visitInfo.VisitID, LocAddress:this.loggedInUser.locAddress }));
    window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
  }


  openConscentForm(patData) {
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

      if (patData.PanelId) {
        const panelConscent = ConscentForms.covid[patData.PanelId];
        if (panelConscent) {
          data += '<div class="pagebreak"> </div>';
          data += panelConscent;
        } else {
          data += '<div class="pagebreak"> </div>';
          data += ConscentForms.covid.general;
        }
      }


      // let flightData = this.patientFlightDetails.getRawValue();
      const flightDate = "";
      // if (flightData.FlightDate && flightData.FlightDate.day && flightData.FlightDate.month && flightData.FlightDate.year) {
      //   flightDate = moment(new Date(`${flightData.FlightDate.month}-${flightData.FlightDate.day}-${flightData.FlightDate.year}`)).format('DD-MMM-YYYY');
      // }
      let selectedDob = "";
      if (patData.DateOfBirth && patData.DateOfBirth.day && patData.DateOfBirth.month && patData.DateOfBirth.year) {
        selectedDob = moment(new Date(`${patData.DateOfBirth.month}-${patData.DateOfBirth.day}-${patData.DateOfBirth.year}`)).format('DD-MMM-YYYY');
      }

      data = this.helperService.replaceAll(data, '[PATIENT_NAME]', patData.PatientName);
      data = this.helperService.replaceAll(data, '[PATIENT_AGE]', patData.PaitentAge);
      data = this.helperService.replaceAll(data, '[PATIENT_DOB]', patData.DateOfBirth);
      data = this.helperService.replaceAll(data, '[PATIENT_GENDER]', patData.Gender);
      if (patData.Cell) {
        data = this.helperService.replaceAll(data, '[PATIENT_MOBILE]', patData.Cell);
      } else {
        data = this.helperService.replaceAll(data, '[PATIENT_MOBILE]', patData.Phone);
      }
      data = this.helperService.replaceAll(data, '[PATIENT_ADDRESS]', patData.PatientAddress);
      data = this.helperService.replaceAll(data, '[PATIENT_EMAIL]', patData.Email);
      data = this.helperService.replaceAll(data, '[PATIENT_VISIT_DATE]', moment().format('DD-MMM-YYYY HH:mm'));
      const cnic = (patData.CNIC || '').toString().padEnd(13, ' ').split('');
      cnic.forEach((digit, idx) => {

        data = this.helperService.replaceAll(data, '[PATIENT_CNIC_' + idx + ']', digit);
      });

      data = this.helperService.replaceAll(data, '[PATIENT_CNIC]', (patData.CNIC || ''));
      let nationality = '';
      // if (patData.CountryID) {
      nationality = patData.Nationality;   //(this.countriesList.find(a => a.CountryId == patData.CountryID) || { Country: '' }).Country;
      // }
      data = this.helperService.replaceAll(data, '[PATIENT_NATIONALITY]', (nationality || ''));
      data = this.helperService.replaceAll(data, '[PATIENT_FLIGHT_NO]', patData.FlightNo);
      data = this.helperService.replaceAll(data, '[PATIENT_FLIGHT_DATE]', (flightDate || ''));


      data = this.helperService.replaceAll(data, '[PATIENT_PPNO]', (patData.Passport || ''));
      data = this.helperService.replaceAll(data, '[PATIENT_BOOKING_REF_NO]', (patData.BookingReferenceNo || '')); // ticket no
      data = this.helperService.replaceAll(data, '[PATIENT_LAB]', (patData.Lab || ''));
      data = this.helperService.replaceAll(data, '[PATIENT_SAMPLE_COLLECTION_LOC]', '');
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
  getValuesFromPopUp(row) {
    // console.log("Getdata on row click",row)
    this.gettingValueTableRow.emit(row);
  }
  patientBasicInforFormSubmitted = false;
  getSelectedPatient: any;
  editSelectedPatient(patient) {
    this.getSelectedPatient = patient;
    this.editPatientContactBtn = true;
    this.patientVisitsPopupRef = this.appPopupService.openModal(this.EditPatientRecord, { size: 'lg' });
    this.editPatientInformation.patchValue({
      FirstName: this.getSelectedPatient["FirstName"],
      LastName: this.getSelectedPatient["LastName"] || '',
      MobileNO: this.getSelectedPatient["MobileNO"],
      MobileOperatorID: this.getSelectedPatient["MobileOperatorID"],
      Email: this.getSelectedPatient["Email"] || '',
      // passport: this.getSelectedPatient["PassportNo"] || '',
      HomeAddress: this.getSelectedPatient["HomeAddress"] || '',
    })
  }
  mobileOperatorList = [];
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
      mobileCode: (mobileNo || this.editPatientInformation.value.MobileNO || '')
    }
    if (params.mobileCode && params.mobileCode.length > 3) {
    } else {
      return;
    }
    this.lookupService.getMobileOperatorByCode(params).subscribe((res: any) => {
      // console.log(res);
      if (res && res.StatusCode == 200) {
        if (res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(res.PayLoad);
          } catch (e) { }
          if (data && data.length) {

          }
        }
        // this.mobileOperatorList = res.payLoad;
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });

  }
  getPatientInfoByGIZRefNo() {
    this.searchResults = [{ Message: 'Loading...' }];
    this.refreshPagination();
    const params = this.patientSearchParams;
    params.GIZReferenceNo = (params.GIZReferenceNo || '').trim();
    this.patientService.searchPatientByRefNoForGIZ(params).subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.searchResults = resp.PayLoad;

        console.log("this.searchResults ", this.searchResults);
        if (params.VisitId && resp.searchResults.length == 1) {
          this.visitSelectedEvent.emit({ VisitID: params.VisitId });
        }
        this.refreshPagination();
        this.filteredSearchResults = this.searchResults;
      }
    }, (err) => {
      console.log(err);
      this.searchResults = [{ Message: 'Connection Error' }];
      this.filteredSearchResults = this.searchResults;
      this.refreshPagination();
      this.toastr.error('Connection error');
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchPatients);
    })
  }
  openShortcut1() {
    // Replace 'path/to/shortcut.lnk' with the path to your shortcut file
    const shortcutPath = 'C:/Users/Iqra/Desktop/MetaDesk.appref-ms';

    // Trigger the download of the shortcut file
    const link = document.createElement('a');
    link.setAttribute('href', shortcutPath);
    link.setAttribute('download', 'shortcut.lnk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openShortcut() {
    this.toastr.info("Working in progress", "Success");
    // let VisitID = visitID.replace("-", "");
    // 240301044020,@TPId INT=926--2123
    const objParams = {
      VisitId: '240301134507',//'240301044020',//VisitID,
      TPId: 639//926//TPID
    }
    console.log("objParam: ", objParams)
    // this.disabledButtonSearch = true;
    // this.isSpinnerSearch = false;
    // this.spinner.show(this.spinnerRefs.comparativeSection);
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS, objParams).subscribe((resp: any) => {
      // this.disabledButtonSearch = false;
      // this.isSpinnerSearch = true;
      // this.spinner.hide(this.spinnerRefs.comparativeSection);
      if (resp.StatusCode == 200) {
        this.PACSServers = resp.PayLoad || [];
        let createLink = (this.PACSServers[0].BackupServer);
        console.log("PACSServers___", this.PACSServers);
        console.log("createLink___", createLink);
        createLink = createLink.substring(0, createLink.length - 1)
        const sanitizedPath = createLink.replace(/\\/g, '%5C');
        const url = ('radiant://?n=f&v=%22' + sanitizedPath + '%22')
        console.log("url is :", url)

        // let winRef = window.open((url), '_blank');
        const winRef = window.open((url), '_blank');
        // const shortcutPath = createLink;
        //   let url = ('radiant://?n=d&v=%22'+createLink+'%22') 

        // // Trigger the download of the shortcut file
        // const link = document.createElement('a');
        // link.setAttribute('href', url);
        // //link.setAttribute('download', 'shortcut.lnk');
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
      }
    }, (err) => {
      // this.disabledButtonSearch = false;
      // this.isSpinnerSearch = true;
      // this.spinner.hide(this.spinnerRefs.comparativeSection);
      console.log(err)
    })



  }

  getSelectedPatVisitNo(visit) {
    const VisitData = visit;
    console.log("🚀 ~ getSelectedPatVisitNo ~ let VisitData:", VisitData)
    this.testSearchEvent.emit(VisitData);
    this.closeTestSearchModal()
  }

  closeTestSearchModal() {
    this.modalService.dismissAll();
  }

onlyNumberKey(evt: KeyboardEvent) {
  const allowedKeys = [
    'Backspace', 'Tab', 'Enter', 'Delete',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];

  if (
    !allowedKeys.includes(evt.key) &&
    !/^\d$/.test(evt.key)
  ) {
    evt.preventDefault();
  }
}

/* 🔥 This handles paste, hyphens, spaces, etc */
onMobileInput() {
  if (this.patientSearchParams.MobileNO) {
    this.patientSearchParams.MobileNO =
      this.patientSearchParams.MobileNO.replace(/\D/g, '');
  }
}
}
