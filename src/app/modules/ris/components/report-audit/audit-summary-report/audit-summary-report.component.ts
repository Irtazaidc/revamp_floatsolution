// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import moment from 'moment';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { VitalsService } from '../../../services/vitals.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { environment } from 'src/environments/environment';
import { ratingElement } from '../../../../../../app/ratingElement';
import { StarRatingComponent } from 'ng-starrating';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import Swal from 'sweetalert2';

@Component({
  standalone: false,

  selector: 'app-audit-summary-report',
  templateUrl: './audit-summary-report.component.html',
  styleUrls: ['./audit-summary-report.component.scss'],
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
export class AuditSummaryReportComponent implements OnInit {
  screenIdentity = null;
  public starRatingElements: Array<ratingElement> = [];
  public starRatingElementsInner: Array<ratingElement> = [];
  public starRatingElementsNew: Array<ratingElement> = [];
  @ViewChild('detailArea') detailArea: ElementRef;
  @ViewChild('vitalsModal') vitals;
  @ViewChild('emrModal') emrModal;
  subSectionList: any = [];
  radoiologistList = [];
  risWorklist = [];
  rowIndex = null;
  searchText = '';
  // DateFrom = Conversions.getCurrentDateObjectNew();
  // DateTo = Conversions.getEndDateObjectNew();
  // Rating = null;
  // RatingCondition = null;
  inValidDateRange = false;
  // CriticalFindings = false;
  spinnerRefs = {
    listSection: 'listSection'
  }
  noDataMessage = 'Please select any radiologist to get his/her audit summary report';
  disabledButton = false;
  isSpinner = true;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessageReject: 'Are you <b>sure</b> you want to Reject?',
    popoverMessageRecommend: 'Are you <b>sure</b> you want to Recommend?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  _form = this.fb.group({
    RadiologistAuditID: [null, ''],
    RadiologistID: [null, Validators.compose(this.generateValidatorsForRadiologistID())],
    // subSectionIDs: [''],
    // dateFrom: ['', ],
    // dateTo: ['', ],
    RatingCondition: ['',],
    Rating: ['',],
    CriticalFindings: ['',],
    subSectionIDs: [null, ''],
  });

  EmpID = null;
  AuditorRadiologistID = null;
  loggedInUser: UserModel;
  isRatingRequired = false;
  constructor(
    private lookupSrv: LookupService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private helper: HelperService,
    private appPopupService: AppPopupService,
    private vitalsSrv: VitalsService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this._form = this.fb.group({
      RadiologistAuditID: [null, ''],
      RadiologistID: [, Validators.compose([Validators.required])],
      // dateFrom: [''],
      // dateTo: [''],
      RatingCondition: [''],
      Rating: [''],
      CriticalFindings: [''],
      subSectionIDs: [null, '']
    });

    // Set up dynamic validation for the Rating control based on RatingCondition
    this._form.get('RatingCondition').valueChanges.subscribe((ratingCondition) => {
      const ratingControl = this._form.get('Rating');

      if (ratingCondition) {
        this.isRatingRequired = true;
        // If RatingCondition has a value, make Rating control required
        ratingControl.setValidators([Validators.required]);
      } else {
        // If RatingCondition is empty, remove the required validator
        ratingControl.setValidators(null);
        this.isRatingRequired = true;
      }

      // Update the validity of the Rating control
      ratingControl.updateValueAndValidity();
    });
  }
  generateValidatorsForRadiologistID() {
    return this.screenIdentity === '!radiologist-audit-findings'
      ? [Validators.required]
      : [];
  }

  AuditReportRating = null;
  getStarRatingValue(param) {
    if (param.target.value) {
      this.AuditReportRating = parseFloat(param.target.value);
    }
  }
  onRate($event: { oldValue: number, newValue: number, starRating: StarRatingComponent }) {
    this.AuditReportRating = $event.newValue;
    // alert(`Old Value:${$event.oldValue}, New Value: ${$event.newValue}, Checked Color: ${$event.starRating.checkedcolor}, Unchecked Color: ${$event.starRating.uncheckedcolor}`);
  }
  RelativeCaseDistID = null;
  relativeDistlist = []
  getRelativeCaseDist() {
    this.relativeDistlist = [];
    this.sharedService.getData(API_ROUTES.GET_RELATIVE_CASE_DIST, {}).subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        this.relativeDistlist = resp.PayLoad || [];
      } else {
        this.relativeDistlist = []
      }
    }, (err) => {
      console.log("Err", err)
    })
  }


  AuditRemarks = null;
  checkboxTooltip = 'Select to finalized the audit'
  ngOnInit(): void {
    this.screenIdentity = this.route.routeConfig.path;
    if (this.screenIdentity == 'audit-summary-report') {
      this.checkboxTooltip = 'Select to finalized the audit';
    } else if (this.screenIdentity == 'audit-findings') {
      this.checkboxTooltip = 'Select to share with Radiologist'
    }
    this.loadLoggedInUserInfo();
    this.getRelativeCaseDist();
    // this._form.patchValue({
    //   dateFrom: Conversions.getCurrentDateObjectNew(),
    //   dateTo: Conversions.getEndDateObjectNew()
    // });
    this.route.params.subscribe(params => {
      // Assuming 'screenIdentity' is a route parameter

      // Update validators for RadiologistID when screenIdentity changes
      const radiologistIDControl = this._form.get('RadiologistID');
      if (radiologistIDControl) {
        radiologistIDControl.setValidators(this.generateValidatorsForRadiologistID());
        radiologistIDControl.updateValueAndValidity();
      }
    });
    this.getSubSection();
    this.getRadiologist();
    this.getRadiologistAudit();
    let _ratingElement = new ratingElement();
    _ratingElement.readonly = true;
    _ratingElement.checkedcolor = "red";
    _ratingElement.uncheckedcolor = "black";
    _ratingElement.value = this.roundedAverageRating || 0
    _ratingElement.size = 15;
    _ratingElement.totalstars = 5;
    this.starRatingElementsInner.push(_ratingElement);
    // if (this.screenIdentity == 'radiologist-audit-findings')
    //   this.getRISRadiologistAuditSummary();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getSubSection() {
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.lookupSrv.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      let _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
  }

  onSelectAllSections() {
    this._form.patchValue({
      subSectionIDs: this.subSectionList.map(a => a.SubSectionId)
    });
  }


  onUnselectAllSections() {
    this._form.patchValue({
      subSectionIDs: []
    });
  }
  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector('[formcontrolname="subSectionIDs"] .ng-input input') as HTMLInputElement;
    if (searchInput) { searchInput.value = null; }
  }

  getRadiologist() {
    let objParams = {
      isAuditor: null
    };
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST, objParams).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.radoiologistList = resp.PayLoad || [];
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }


  validateDateDifference(index) {
    const formValues = this._form.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      if (index === 1) {
        this._form.patchValue({
          dateTo: "" // Conversions.getCurrentDateObject()
        });
      }
      else {
        this._form.patchValue({
          dateFrom: ""// Conversions.getCurrentDateObject(),
        });
      }
    }
    const daysDifference = (toDate - fromDate) / (1000 * 3600 * 24);
    const revertDays = (fromDate - toDate) / (1000 * 3600 * 24);
    if (daysDifference > 60 || revertDays > 60) {
      this.toastr.error('The difference between dates should be 2 months');
      if (index === 1) {
        this._form.patchValue({
          dateTo: "" //Conversions.getCurrentDateObject()
        });
      }
      else {
        this._form.patchValue({
          dateFrom: "" //Conversions.getCurrentDateObject(),
        });
      }
    }
  }


  roundedAverageRating = null;
  AuditStatusID = null;
  AuditStatus = null;
  getRISRadiologistAuditSummary() {
    this.risWorklist = [];
    this.roundedAverageRating = null;
    let formValues = this._form.getRawValue();
    this._form.markAllAsTouched();
    if (!this.RadiologistAuditID) {
      this.toastr.warning('Please select the audit!', 'No Audit Selected');
      return
    }
    if (this._form.invalid) {
      this.toastr.warning('Please provide the required information!');
      return false;

    } else {
      let objParams = {
        RadiologistID: (this.screenIdentity == 'audit-summary-report' || this.screenIdentity == 'audit-findings') ? formValues.RadiologistID : this.loggedInUser.empid,
        AuditorRadiologistID: (this.screenIdentity == 'audit-summary-report') ? this.loggedInUser.userid : null,
        DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
        DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
        RatingCondition: formValues.RatingCondition ? formValues.RatingCondition : null,
        Rating: formValues.Rating ? formValues.Rating : null,
        CriticalFindings: formValues.CriticalFindings ? formValues.CriticalFindings : null,
        SubSectionIDs: formValues.subSectionIDs ? formValues.subSectionIDs.join(",") : null,
        isShared: (this.screenIdentity == 'radiologist-audit-findings') ? 1 : null,
        isManager: (this.screenIdentity == 'audit-findings') ? 1 : null,
        RadiologistAuditID: this.RadiologistAuditID
      }
      this.spinner.show(this.spinnerRefs.listSection);
      this.sharedService.getData(API_ROUTES.GET_RIS_RADIOLOGIST_AUDIT_SUMMARY, objParams).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoadDS && resp.PayLoadDS["Table"].length && resp.StatusCode == 200) {
          // let data = resp.PayLoadDS;
          this.risWorklist = resp.PayLoadDS["Table"] || [];
          let auditReportRow = resp.PayLoadDS["Table1"] || [];
          if (auditReportRow.length) {
            this.AuditRemarks = auditReportRow[0].Remarks;
            this.RelativeCaseDistID = auditReportRow[0].RelativeCaseDistID;
            this.AuditStatusID = auditReportRow[0].AuditStatusID;
            this.roundedAverageRating = auditReportRow[0].AuditRating;
            this.AuditStatus = auditReportRow[0].AuditStatus;
          }


          // // Assuming star ratings are stored in a property called 'starRating'
          // const accumulatedRating = this.risWorklist.reduce((accumulator, currentReport) => {
          //   // Check if the current report has a starRating property
          //   if (currentReport.hasOwnProperty('Rating')) {
          //     // Add the star rating to the accumulator
          //     return accumulator + currentReport.Rating;
          //   } else {
          //     return accumulator;
          //   }
          // }, 0); // Initial value of accumulator is set to 0

          // // Calculate the average rating
          // const averageRating = accumulatedRating / this.risWorklist.length;

          // // Round the average rating to the nearest 0.5
          // const roundedAverageRating = Math.round(averageRating * 2) / 2;


          ////////Optimized version:
          // this.roundedAverageRating = Math.round(
          //   this.risWorklist
          //     .filter(report => report.hasOwnProperty('Rating'))
          //     .reduce((accumulator, currentReport) => accumulator + currentReport.Rating, 0) /
          //   this.risWorklist.length * 2
          // ) / 2;
          //This was system calculated now we have make a parent table and doctor will give the rating
          //Saved in the main table and will get from there like in below.
          // this.roundedAverageRating = auditReportRow[0].AuditRating;

          setTimeout(() => {
            this.starRatingElements.splice(0, this.starRatingElements.length);
            let _ratingElement = new ratingElement();
            _ratingElement.readonly = true;
            _ratingElement.checkedcolor = "red";
            _ratingElement.uncheckedcolor = "black";
            _ratingElement.value = this.roundedAverageRating || 0
            _ratingElement.size = 30;
            _ratingElement.totalstars = 5;
            this.starRatingElements.push(_ratingElement);

            this.starRatingElementsNew.splice(0, this.starRatingElementsNew.length);
            let _ratingElementNew = new ratingElement();
            _ratingElementNew.readonly = true;
            _ratingElementNew.checkedcolor = "red";
            _ratingElementNew.uncheckedcolor = "black";
            _ratingElementNew.value = 0
            _ratingElementNew.size = 30;
            _ratingElementNew.totalstars = 5;
            this.starRatingElementsNew.push(_ratingElementNew);
          }, 100);
        } else {
          if (this.screenIdentity == 'radiologist-audit-findings')
            this.noDataMessage = 'No finalized audit found...';
          else {
            this.noDataMessage = 'No record found...';
          }
          this.risWorklist = []
        }

      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log("Err", err)
      })
    }
  }

  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    let pin = text.PIN;
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
  }
  returnCopyClasses(i) {
    let styleClass = 'ti-files'
    if (this.rowIndex == i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle text-white';
    } else if (this.rowIndex == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files text-white';
    } else if (this.rowIndex == !i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else {
      styleClass = 'ti-files';
    }
    return styleClass;
  }


  TPId = null;
  VisitID = null;
  VisitIDWithDashes = null;
  VisitId = this.VisitID;
  TPCode = null;
  TPName = null;
  PatientName = null;
  PatientId = null;
  RISStatusID = null;
  PatientPhoneNumber = null;
  RISWorkListID = null;
  MOBy = null;
  ProcessIDParent = null;
  isConsentRead = null;
  RegistrationDate = null;
  DeliveryDate = null;
  InitializedBy = null;
  InitializedOn = null;
  visitDetailBtnClicked = false;
  showVisitDetail(row, i) {
    this.visitDetailBtnClicked = true;
    // console.log("mo-row - visitdetail", row);
    this.rowIndex = i;
    this.TPId = row.TPId;
    this.VisitID = row.PIN.replaceAll("-", "");
    this.VisitIDWithDashes = row.VisitNo;
    this.VisitId = this.VisitID;
    this.TPCode = row.TPCode;
    this.TPName = row.TPName;
    this.PatientName = row.PatientName;
    this.PatientId = row.PatientId;
    this.RISStatusID = row.RISStatusID;
    this.PatientPhoneNumber = row.PhoneNumber;
    this.RISWorkListID = row.RISWorkListID;
    this.MOBy = row.MOBy;
    this.ProcessIDParent = row.ProcessId;
    this.isConsentRead = row.isConsentRead;
    this.RegistrationDate = moment(row.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(row.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.InitializedBy = row.InitializedBy;
    this.InitializedOn = row.InitializedOn;
    this.scrollToDetail();
  }
  scrollToDetail() {
    setTimeout(() => {
      if (this.detailArea.nativeElement) {
        this.detailArea.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  }

  isShowVitalsCard = false;
  getVitals() {
    if (this.VisitID && this.TPId) {
      let params = {
        VisitID: this.VisitID,
        TPID: this.TPId
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        if (resp.PayLoad.length) {
          this.isShowVitalsCard = true;
        } else {
          this.isShowVitalsCard = false;
        }
      }, (err) => { console.log("err", err) })
    }
  }

  isFieldDisabled = false;
  selectAllTPs(e) {
    this.risWorklist.forEach(a => {
      a.checked = false;
      if (a.TPId > 0) {
        a.checked = e.target.checked;
      }
    })
  }

  visitInfo: any = {};
  openVitals(selVisitInfo) {
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.vitals, { size: 'lg' });
  }

  openEMR(selVisitInfo) {
    this.VisitID = selVisitInfo.VisitNo.replaceAll("-", "");
    this.PatientId = selVisitInfo.PatientId;
    this.visitInfo = { tpId: selVisitInfo.TPId, visitID: selVisitInfo.VisitNo.replaceAll("-", ""), patientID: selVisitInfo.PatientId, phoneNumber: selVisitInfo.PhoneNumber }
    this.RegistrationDate = moment(selVisitInfo.RegistrationDate).format('DD-MMM-YYYY hh:mm A');
    this.DeliveryDate = moment(selVisitInfo.DeliveryDate).format('DD-MMM-YYYY hh:mm A');
    this.appPopupService.openModal(this.emrModal, { size: 'fss' });
  }
  getRowData(a, b) {

  }

  isSubmitClicked = false;
  insertUpdateRadiologistVisitTPAudit() {
    this.isSubmitClicked = true;
    let checkedItems = this.risWorklist.filter(a => a.checked);
    if (!this.AuditorRadiologistID) {
      this.toastr.warning("Please select any Doctor", "No Doctor selected");
      return;
    }
    if (!checkedItems.length) {
      this.toastr.warning("Please select any test to send", "No Test Selection");
      return;
    } else {
      let objParam = {
        AuditorRadiologistID: this.AuditorRadiologistID,
        RadiologistID: this._form.getRawValue().RadiologistID,
        CreatedBy: this.loggedInUser.userid || -99,
        Action: 1, // 1:for send report to audit , 2: for save audit report by auditor, this is only for toaster messages
        tblRadiologistVisitTPAudit: checkedItems.map(a => {
          return {
            RadiologistVisitTPAuditID: null,
            VisitID: Number(a.VisitId),
            TPID: a.TPId,
            AuditStatusID: 1,
            RelativeCaseDistID: null,
            MissedFinding: null,
            MissedExtraFinding: null,
            Remarks: null
          }
        })
      }
      this.disabledButton = true;
      this.isSpinner = false;
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RADIOLOGIST_VISIT_TP_AUDIT, objParam).subscribe((resp: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.isSpinner = true;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButton = false;
            this.isSpinner = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })

    }
  }
  printAuditSummaryReport() {
    if (!this.RadiologistAuditID) {
      this.toastr.warning("Please select any audit.", "No audit selected!");
      return;
    }
    let formValues = this._form.getRawValue();
    const url = environment.patientReportsPortalUrl + 'audit-summary-report?p=' + btoa(JSON.stringify({
      AuditorRadiologistID: (this.screenIdentity == 'audit-summary-report') ? this.loggedInUser.userid : null,
      RadiologistID: (this.screenIdentity == 'audit-summary-report' || this.screenIdentity == 'audit-findings') ? formValues.RadiologistID : this.loggedInUser.empid,
      DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      RatingCondition: formValues.RatingCondition ? formValues.RatingCondition : null,
      Rating: formValues.Rating ? formValues.Rating : null,
      CriticalFindings: formValues.CriticalFindings ? formValues.CriticalFindings : null,
      SubSectionIDs: formValues.subSectionIDs ? formValues.subSectionIDs.join(",") : null,
      isShared: (this.screenIdentity == 'radiologist-audit-findings') ? 1 : null,
      isManager: (this.screenIdentity == 'audit-findings') ? 1 : null,
      RadiologistAuditID: this.RadiologistAuditID
    }));
    let winRef = window.open(url.toString(), '_blank');
  }


  selectAllReports(e) {
    this.risWorklist.forEach(a => {
      a.checked = false;
      if ((this.screenIdentity == 'audit-findings' && a.RadiologistVisitTPAuditID > 0 && !a.isShared) || (this.screenIdentity == 'audit-summary-report' && a.RadiologistVisitTPAuditID > 0 && !a.isShared && a.AuditStatusID != 7)) {
        a.checked = e.target.checked;
      }
    })
  }
  RadiologistIDForAuditDropDown = null;
  AuditorRadiologistIDForAuditDropDown = null;
  AuditList = [];
  getRadiologistAudit() {
    this.AuditList = [];
    let objParam = {
      RadiologistID: (this.screenIdentity == 'audit-summary-report' || this.screenIdentity == 'audit-findings') ? this.RadiologistIDForAuditDropDown : this.loggedInUser.empid,
      // AuditorRadiologistID:(this.screenIdentity=='audit-findings') ? this.AuditorRadiologistIDForAuditDropDown : this.loggedInUser.userid,
      AuditorRadiologistID: (this.screenIdentity == 'audit-summary-report') ? this.loggedInUser.empid : null,
      AuditStatusID: (this.screenIdentity == 'audit-findings') ? 7 : null
    }
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_AUDIT, objParam).subscribe((resp: any) => {
      let _response = resp.PayLoad || [];
      this.AuditList = _response;
    }, (err) => {
    })
  }
  getRadiologistAuditByRadiologistID(param) {
    this.RadiologistIDForAuditDropDown = param ? param.EmpId : null;
    this.getRadiologistAudit();
  }

  // updateRadiologistVisitTPAuditShareFinalized(){
  //   if(this.screenIdentity=='audit-summary-report'){
  //     this.updateRadiologistVisitTPAudit()
  //   }else if(this.screenIdentity=='audit-findings'){
  //     this.updateRadiologistVisitTPAuditShare();
  //   }
  // }

  disabledButtonShare = false;
  isSpinnerShare = true;
  updateRadiologistVisitTPAuditShare() {
    let checkedItems = this.risWorklist.filter(a => a.checked);
    if (!checkedItems.length) {
      this.toastr.warning("Please select any report to share", "No Report Selected");
      return;
    } else {
      let objParam = {
        RadiologistVisitTPAuditIDs: checkedItems.map(obj => obj.RadiologistVisitTPAuditID).join(","),
        CreatedBy: this.loggedInUser.userid || -99,
      }
      this.disabledButtonShare = true;
      this.isSpinnerShare = false;
      this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_SHARE, objParam).subscribe((resp: any) => {
        this.disabledButtonShare = false;
        this.isSpinnerShare = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            this.getRISRadiologistAuditSummary();
            this.isSpinnerShare = true;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonShare = false;
            this.isSpinnerShare = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonShare = false;
        this.isSpinnerShare = true;
      })
    }
  }
  RadiologistAuditID = null;
  getRadiologistAuditID(param) {
    this.RadiologistAuditID = param ? param.RadiologistAuditID : null;
  }
  btnFinalizedClick = false;
  RadiologistAuditIDFinalized = null;
  updateRadiologistVisitTPAudit() {
    this.btnFinalizedClick = true;
    let checkedItems = this.risWorklist.filter(a => a.checked);
    // if (!checkedItems.length) {
    //   this.toastr.warning("Please select any report to share", "No Report Selected");
    //   return;
    // } else {
    if (!this.AuditReportRating || !this.AuditRemarks) {
      if (!this.AuditReportRating && !this.AuditRemarks) {
        this.toastr.warning("Please provide Audit Rating and Remarks", "Validatation Failed");
      } else if (!this.AuditReportRating) {
        this.toastr.warning("Please provide Audit Rating ", "Validatation Failed");
      } else if (!this.AuditRemarks) {
        this.toastr.warning("Please provide Audit Remarks", "Validatation Failed");
      }
      return
    }
    this.btnFinalizedClick = false;
    let objParam = {
      RadiologistAuditID: this.RadiologistAuditID,
      // RadiologistVisitTPAuditIDs: checkedItems.map(obj => obj.RadiologistVisitTPAuditID).join(","),
      AuditStatusID: 7,
      CreatedBy: this.loggedInUser.userid || -99,
      AuditRating: this.AuditReportRating,
      RelativeCaseDistID: this.RelativeCaseDistID,
      AuditRemarks: this.AuditRemarks
    }
    // console.log("objParam for finalization is : ",objParam);//return;
    this.disabledButtonShare = true;
    this.isSpinnerShare = false;
    // this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIOLOGIST_VISIT_TP_AUDIT, objParam).subscribe((resp: any) => {
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_V2, objParam).subscribe((resp: any) => {
      this.disabledButtonShare = false;
      this.isSpinnerShare = true;
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          if (JSON.parse(resp.PayLoadStr)[0].Result == 2) {
            let unsavedReports = resp.PayLoadDS.Table1;
            let unsavedReportsList = '';

            // Loop through the unsavedReports array and build the list
            // unsavedReports.forEach(report => {
            //   unsavedReportsList += `<li style="padding: 0; margin: 0;"><strong class="text-primary">${report.VisitID}-${report.TPID}</strong></li>`;
            // });

            // // Use the list in your Swal HTML
            // const swalHtml = `<div><ul class="text-left" style ="list-style-type: none; padding: 0; margin: 0;">${unsavedReportsList}</ul></div>`;

            let unsavedReportsTable = '<table class="table text-center"><thead><tr><th style="text-align:left"><strong>PIN</strong></th><th style="text-align:left"><strong>Test Code</strong></th></tr></thead><tbody>';

            // Loop through the unsavedReports array and build the table rows
            unsavedReports.forEach(report => {
              unsavedReportsTable += `
                  <tr>
                      <td style="padding-top: 4px; padding-bottom: 4px; text-align:left">
                          <strong>${report.VisitID}</strong>
                      </td>
                      <td style="padding-top: 4px; padding-bottom: 4px; text-align:left"><strong>${report.TPCode}</strong></td>
                  </tr>`;
            });

            unsavedReportsTable += '</tbody></table>';

            // Use the table in your Swal HTML
            const swalHtml = `<div>
            <p class="text-left"><small>Below are the reports which are not been audited. Please audit all the studies and then try to finalize the audit.</small></p>${unsavedReportsTable}</div><hr>`;
            // this.toastr.error("There are some reports which are not audited. Please complete the audit befor finalization","Unsaved Reports");
            Swal.fire({
              title: '<span class="text-primary">Unaudited Reports</span>',
              html: swalHtml,
              icon: 'warning',
              showCancelButton: true,
              allowOutsideClick: false,
              confirmButtonText: '<i class="fas fa-check"></i> OK',
              cancelButtonText: '<i class="fas fa-times"></i> Close',
              confirmButtonColor: '#1BC5BD',
              cancelButtonColor: '#F64E60',
              showCloseButton: true,
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                // this.router.navigate(['/ris/audit-report']);
                this.router.navigate(['ris/audit-report'], { queryParams: { p: btoa(this.RadiologistAuditID) } })
                Swal.close();
              }
            });

          } else {
            this.toastr.success("Audit Report finlized successfully", "Finalized");
            this.getRISRadiologistAuditSummary();
          }

          this.isSpinnerShare = true;
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          this.disabledButtonShare = false;
          this.isSpinnerShare = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.disabledButtonShare = false;
      this.isSpinnerShare = true;
    })
    // }
  }

  getMessageBasedOnScreenIdentity(): string {
    if (this.screenIdentity === 'audit-summary-report') {
      return 'Are you <strong>sure</strong> you want to finalize?';
    } else if (this.screenIdentity === 'audit-findings') {
      return 'Are you <strong>sure</strong> you want to share?';
    } else {
      // Default message if screenIdentity doesn't match the conditions
      return 'Are you <strong>sure</strong> you want to share?';
    }
  }
  advancedSearchEnabled = false;
  advancedSearch() {
    this.advancedSearchEnabled = !this.advancedSearchEnabled;
  }
  copyTextAlert(pin: any) {
    alert("hi")
    this.helper.copyMessage(pin);
  }

}
