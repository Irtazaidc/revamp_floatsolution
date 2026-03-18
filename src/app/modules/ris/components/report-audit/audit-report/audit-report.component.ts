// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RisWorklistService } from '../../../services/ris-worklist.service';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import moment from 'moment';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { VitalsService } from '../../../services/vitals.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { ratingElement } from '../../../../../../app/ratingElement';
import { StarRatingComponent } from 'ng-starrating';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,

  selector: 'app-audit-report',
  templateUrl: './audit-report.component.html',
  styleUrls: ['./audit-report.component.scss'],
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
export class AuditReportComponent implements OnInit {
  public starRatingElements: Array<ratingElement> = [];
  @ViewChild('detailArea') detailArea: ElementRef;
  @ViewChild('vitalsModal') vitals;
  @ViewChild('emrModal') emrModal;
  loggedInUser: UserModel;
  subSectionList: any = [];
  radoiologistList = [];
  risWorklist = [];
  relativeDistlist = [];
  risWorklistRow = [];
  rowIndex = null;
  searchText = '';
  AuditorRadiologistID = null;
  RadiologistID = null;
  AuditStatusID = null;
  RelativeCaseDistID = "";
  MissedFinding = null;
  isCritical = false;
  MissedExtraFinding = null;
  Remarks = null;
  AuditReportRating = null;
  AuditTypeID = 0;
  DateFrom = Conversions.getCurrentDateObjectNew();
  DateTo = Conversions.getEndDateObjectNew();
  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection'
  }

  // noDataMessage = 'Please select any radiologist with date range to send his/her test for audit';
  noDataMessage = 'Please search the data for audit';
  disabledButton = false;
  isSpinner = true;
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to submit?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  _form = this.fb.group({
    radiologstID: [, Validators.compose([Validators.required])],
    subSectionIDs: ['']
  });

  constructor(
    private formBuilder: FormBuilder,
    private lookupSrv: LookupService,
    private auth: AuthService,
    private toastr: ToastrService,
    private questionnaireSrv: QuestionnaireService,
    private spinner: NgxSpinnerService,
    private worklistSrv: RisWorklistService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private helper: HelperService,
    private appPopupService: AppPopupService,
    private vitalsSrv: VitalsService,
    private sharedService: SharedService,
    private printRptService: PrintReportService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    let _ratingElement = new ratingElement();
    //ratingElement5.readonly = true;
    _ratingElement.readonly = true;
    _ratingElement.checkedcolor = "red";
    _ratingElement.uncheckedcolor = "black";
    _ratingElement.value = 0;//7.5;
    _ratingElement.size = 30;
    _ratingElement.totalstars = 5;
    this.starRatingElements.push(_ratingElement);

    this.DateFrom = Conversions.getCurrentDateObjectNew();
    this.DateTo = Conversions.getEndDateObjectNew();
    this.EmpId = null;
    this.loadLoggedInUserInfo();
    this.getRadiologistAudit();
    this.getRelativeCaseDist();
    // this.getRISRadiologistAuditWorklist();
    this.getRadiologistByAuditor();
    this.getAuditType();
    this.getSubSection();
    this.route.queryParams.subscribe(params => {
      const paramP = params['p'];
      if (paramP) {
        const decodedParamP = atob(paramP);
        this.RadiologistAuditID = Number(decodedParamP);
        this.cd.detectChanges();
        this.getData(1);
      } 
    });
    
  }

  AuditList = []
  getRadiologistAudit() {
    this.AuditList = [];
    let objParam = {
      RadiologistID: this.RadiologistID,
      AuditorRadiologistID: this.loggedInUser.empid
    }
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_AUDIT, objParam).subscribe((resp: any) => {
      let _response = resp.PayLoad || [];
      this.AuditList = _response;
      this.cd.detectChanges();
    }, (err) => {
    })
  }

  isShowForm = true;
  hideShowIconClass = 'fa-minus';
  hideShowIconTooltip = 'Collapse Form';
  hideShowForm() {
    this.isShowForm = !this.isShowForm;
    this.hideShowIconClass = this.isShowForm ? 'fa-minus' : 'fa-plus';
    this.hideShowIconTooltip = this.isShowForm ? 'Collapse Form' : 'Expand Form';
  }

  onRate($event: { oldValue: number, newValue: number, starRating: StarRatingComponent }) {
    this.AuditReportRating = $event.newValue;
    // alert(`Old Value:${$event.oldValue}, New Value: ${$event.newValue}, Checked Color: ${$event.starRating.checkedcolor}, Unchecked Color: ${$event.starRating.uncheckedcolor}`);
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

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

  isTodo = true;
  isAudited = false;
  isAll = false;
  AuditStatusIDFilter = 1;
  makeButtonAciveDeactive(isActive) {
    if (isActive == 1) {
      this.isTodo = true;
      this.isAudited = false;
      this.isAll = false;
      this.AuditStatusIDFilter = 1;
    } else if (isActive == 2) {
      this.isTodo = false;
      this.isAudited = true;
      this.isAll = false;
      this.AuditStatusIDFilter = 2;
    } else if (isActive == 3) {
      this.AuditStatusIDFilter = null;
      this.isTodo = false;
      this.isAudited = false;
      this.isAll = true;
    } else {
      this.isTodo = true;
      this.isAudited = false;
      this.isAll = false;
    }

  }
  getRadiologistDataOnChange(event) {
    this.EmpId = event.EmpId ? event.EmpId : null;
    // this.getData(1);
    this.getRadiologistAuditByRadiologistID(this.EmpId);
  }

  getRadiologistAuditByRadiologistID(param) {
    this.RadiologistID = param;
    this.getRadiologistAudit();
  }


  RadiologistAuditID = null;
  // getRadiologistAuditID(param) {
  //   this.RadiologistAuditID = param ? param.RadiologistAuditID : null;
  // }
  isActive = null;
  inValidDateRange = false;
  isBtnClicked = false;
  getData(isActive) {
    this.isActive = isActive;
    // if(!this.DateFrom || !this.DateTo){
    //   this.risWorklist = [];
    //   this.inValidDateRange = true;
    //   this.toastr.warning("Please Select Date Range","Date Validation Error");
    //   return;
    // }
    if (!this.RadiologistAuditID) {
      this.isBtnClicked = true;
      this.risWorklist = [];
      // this.inValidDateRange = true;
      this.toastr.warning("Please Select any audit.", "No Audit Selected!");
      return;
    } else {
      this.isBtnClicked = false;
    }
    // else{
    //   this.inValidDateRange = false;
    // }
    this.makeButtonAciveDeactive(isActive);
    this.RadiologistVisitTPAuditID = null;
    // if(this.EmpId){
    this.getRISRadiologistAuditWorklist();
    // }else{
    //   this.toastr.warning("Please select any radiologist","Radiologist Not Selected")
    // }
  }
  SubSectionID = null;
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
  getRISRadiologistAuditWorklist() {
    this.getRadiologistByAuditor();
    let objParam = {
      AuditorRadiologistID: this.loggedInUser.userid,
      RadiologistVisitTPAuditID: this.RadiologistVisitTPAuditID,
      RadiologistID: this.EmpId,
      AuditStatusIDFilter: this.AuditStatusIDFilter,
      // DateFrom: this.DateFrom ? Conversions.formatDateObject(this.DateFrom) : null,
      // DateTo: this.DateTo ? Conversions.formatDateObject(this.DateTo) : null,
      RadiologistAuditID: this.RadiologistAuditID,
      SubSectionID: this.SubSectionID
    }
    this.spinner.show(this.spinnerRefs.listSection); //return;
    this.sharedService.getData(API_ROUTES.GET_RIS_RADIOLOGIST_AUDIT_WORKLIST, objParam).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
        // console.log("there we goooo resp is: ",resp)
        if (objParam.RadiologistVisitTPAuditID) {
          this.risWorklistRow = resp.PayLoad || [];
          let row = this.risWorklistRow[0]
          this.visitDetailBtnClicked = true;
          this.TPId = row.TPID;
          this.VisitID = row.PIN.replaceAll("-", "");
          this.VisitIDWithDashes = row.PIN;
          this.VisitId = this.VisitID;
          this.TPCode = row.TPCode;
          this.TPName = row.TPName;
          this.PatientName = row.PatientName;
          this.PatientId = row.PatientID;
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
          // this.AuditorRadiologistID = row.AuditorRadiologistID;
          this.RadiologistID = row.RadiologistiD;
          this.AuditStatusID = row.AuditStatusID;
          this.RelativeCaseDistID = row.RelativeCaseDistID ? row.RelativeCaseDistID : "";
          this.MissedFinding = row.MissedFinding;
          this.isCritical = row.isCritical || 0;
          this.MissedExtraFinding = row.MissedExtraFinding;
          this.Remarks = row.Remarks;
          this.AuditReportRating = row.Rating;
          this.AuditTypeID = row.AuditTypeID || 0;
          setTimeout(() => {
            this.starRatingElements.splice(0, this.starRatingElements.length);
            let _ratingElement = new ratingElement();
            _ratingElement.readonly = this.AuditStatusID > 2 ? true : false;
            _ratingElement.checkedcolor = "red";
            _ratingElement.uncheckedcolor = "black";
            _ratingElement.value = this.AuditReportRating || 0
            _ratingElement.size = 30;
            _ratingElement.totalstars = 5;
            this.starRatingElements.push(_ratingElement);
          }, 100);
        } else {
          this.risWorklist = [];
          this.risWorklist = resp.PayLoad || [];
          setTimeout(() => {
            if (this.risWorklist.length) {
              this.showVisitDetail(this.risWorklist[0], 0)
            }
          }, 200);
        }

      } else {
        if (this.RadiologistAuditID) {
          this.noDataMessage = 'No record found against the selected criteria.';
        } else {
          this.noDataMessage = 'Please select any any audit.';
        }
        this.risWorklist = []
      }

    }, (err) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      console.log("Err", err)
    })
  }

  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    let pin = text.PIN
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
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndex == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files';
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
  RadiologistVisitTPAuditID = null;
  showVisitDetail(row, i) {
    // console.log("row is________________________",row)
    this.AuditStatusID = row.AuditStatusID;
    this.rowIndex = i;
    this.RadiologistVisitTPAuditID = row.RadiologistVisitTPAuditID;
    this.MOBy = row.MOBy
    setTimeout(() => {
      this.getRISRadiologistAuditWorklist();
    }, 300);
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
  getStarRatingValue(param) {
    if (param.target.value) {
      this.AuditReportRating = parseFloat(param.target.value);
    }
  }
  isSubmitClicked = false;
  insertUpdateRadiologistVisitTPAudit() {
    if (!this.AuditReportRating) {
      this.toastr.error("Please Provide Rating", "No Star Selected");
      return;
    }
    if (!this.MissedFinding && this.isCritical) {
      this.toastr.error("Please provide critical missing findinds OR Uncheck the critical checkobx", "Validation Error");
      return;
    }
    // this.isSubmitClicked = true;
    // if (!this.Remarks) {
    //   this.toastr.warning("Please enter remarks", "No Remarks");
    //   return;
    // } 
    else {
      let objParam = {
        AuditorRadiologistID: this.loggedInUser.userid || -99,
        RadiologistID: this.RadiologistID,
        CreatedBy: this.loggedInUser.userid || -99,
        Action: 2, // 1:for send report to audit , 2: for save audit report by auditor, this is only for toaster messages
        tblRadiologistVisitTPAudit: [

          {
            RadiologistVisitTPAuditID: this.RadiologistVisitTPAuditID,
            VisitID: Number(this.VisitID),
            TPID: this.TPId,
            AuditStatusID: 2,
            RelativeCaseDistID: this.RelativeCaseDistID,
            MissedFinding: this.MissedFinding,
            isCritical: this.isCritical,
            MissedExtraFinding: this.MissedExtraFinding,
            Remarks: this.Remarks,
            Rating: this.AuditReportRating,
            AuditTypeID: this.AuditTypeID
          }
        ]
      }
      this.disabledButton = true;
      this.isSpinner = false;
      this.spinner.show(this.spinnerRefs.formSection);
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RADIOLOGIST_VISIT_TP_AUDIT, objParam).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.toastr.success(resp.Message);
            if (this.reportFeedbackPopupRef)
              this.reportFeedbackPopupRef.close();
            this.AuditReportRating = null;
            this.isSpinner = true;
            this.RadiologistVisitTPAuditID = null;
            if (this.starRatingElements.length > 0) {
              this.starRatingElements.splice(0, this.starRatingElements.length);
              let _ratingElement = new ratingElement();
              //ratingElement5.readonly = true;
              _ratingElement.checkedcolor = "red";
              _ratingElement.uncheckedcolor = "black";
              _ratingElement.value = 0;//7.5;
              _ratingElement.size = 30;
              _ratingElement.totalstars = 5;
              this.starRatingElements.push(_ratingElement);
            }
            this.getRISRadiologistAuditWorklist();
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButton = false;
            this.isSpinner = true;
          }
        }
      }, (err) => {
        this.spinner.hide(this.spinnerRefs.formSection);
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButton = false;
        this.isSpinner = true;
      })

    }
  }


  EmpId = null;
  getRadiologistByAuditor() {
    let objParams = {
      AuditorRadiologistID: this.loggedInUser.userid,
      DateFrom: this.DateFrom ? Conversions.formatDateObject(this.DateFrom) : null,
      DateTo: this.DateTo ? Conversions.formatDateObject(this.DateTo) : null,
    };
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST_BY_AUDITOR, objParams).subscribe((resp: any) => {
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

  auditTypes = [];
  getAuditType() {
    this.sharedService.getData(API_ROUTES.GET_AUDIT_TYPE, {}).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.auditTypes = data.PayLoad || [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  // Print report /////////////////////////////////////////////////////////
  ViewReport(itemType, reportType = 'normal') {
    let radioTestIds = '';
    let radioTP: any = [];
    //   radioTP =[{
    //     "ACCOUNTNO": this.VisitId,
    //     "TESTRESULT_ID": "",
    //     "TestID": "",
    //     "hasEmailSend": "n",
    //     "TESTRESULTID": "n",
    //     "BRANCH_ID": 0,
    //     "PROFILETESTS": this.TPCode,
    //     "PROFILETESTSDESC": this.TPName,
    //     "SECTION": "",
    //     "STATUS": "Final",
    //     "ABBRIVATION": "n",
    //     "REPORTINGTIME": "2023-07-05T20:00:00",
    //     "PROFILETESTID": this.TPID,
    //     "SECTIONID": 7,
    //     "ISPANEL": 0,
    //     "IsCash": "",
    //     "PANELNAME": "n",
    //     "CREATEDON": "n",
    //     "SectionType": "Radiology",
    //     "ReportTemplateType": 2,
    //     "DSBy": "n",
    //     "isReportable": 1,
    //     "WR_ALLOWED": 1,
    //     "EnableEmail": "n",
    //     "ENABLESMS": "n",
    //     "InOut": "N",
    //     "DueBalance": "",
    //     "PanelMailToPatient": "n",
    //     "PanelMailToPanel": "n",
    //     "PanelSMSAlert": "n",
    //     "PanelShowReport": "n",
    //     "PanelShouldReportMails": "n",
    //     "PanelIsByPassDueAmount": "n",
    //     "PanelPOCEmail": "n",
    //     "ProfileIsEmailEnable": "n",
    //     "ProfileIsSMSEnable": "n",
    //     "ProfileIsShowOnline": null,
    //     "isPackage": 1,
    //     "TypeId": 1,
    //     "PROFILEID": "",
    //     "SUBSECTIONID": 18,
    //     "EncAccountNo": null,
    //     "PanelID": null,
    //     "permission_ViewGraphicalReportIcon": false,
    //     "permission_ViewReportIcon": true,
    //     "permission_PRViewReportIcon": true,
    //     "permission_ViewPreReportIcon": false,
    //     "permission_ViewDeliverReportIcon": true,
    //     "permission_InPrgresIcon": false,
    //     "permission_PACSImages": true,
    //     "permission_IsReportableIcon": true,
    //     "permission_PanelIsTestAllowOnlineIcon": false,
    //     "permission_IsTestAllowOnlineIcon": false,
    //     "permission_IsdueblnceIcon": false,
    //     "permission_IsTestCancelled": false,

    // }]
    radioTP = [{
      "ACCOUNTNO": this.VisitId,
      "PROFILETESTS": this.TPCode,
      "PROFILETESTSDESC": this.TPName,
      "PROFILETESTID": this.TPId,

    }]
    // console.log("radioTP: ",radioTP);return;

    if (!this.TPId) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {


      radioTestIds = this.TPId;
      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        let patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe((res: any) => {
          // console.log("ressssssssssssssssss: ", res)
          try {
            res = JSON.parse(res);
          } catch (ex) {
          }
          if (res.success) {
            console.log(res.PatientReportUrl);
            patientReportWinRef.location = this.addSessionExpiryForReport(res.PatientReportUrl);
            // window.open(this.patientReportUrl)
          } else {
            alert("Report cannot be opened");
          }
        }, (err) => {
          alert("Error Opening Report");
        });
      }
    }
  }


  openReportWindow() {
    let patientVisitInvoiceWinRef = window.open('', '_blank');
    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    let reportSegments = reportUrl.split('?');
    if (reportSegments.length > 1) {
      reportUrl = reportSegments[0] + '?' + btoa(atob(reportSegments[1]) + '&SessionExpiryTime=' + (+new Date() + (CONSTANTS.REPORT_EXPIRY_TIME * 1000))); // &pdf=1
    }
    return reportUrl;
  }

  ////////////////end print report//////////////////////////

  insertUpdateRadiologistVisitTPAuditPopUp() {
    this.clickSubmit = true;
    if (!this.feedbackRemarks || this.feedbackRemarks == "") {
      this.toastr.error("Please provide Remarks !", "Remarks validation");
      return;
    } else {
      this.clickSubmit = false;
    }

    let dsQuestions = this.feedbackQuestions.filter(a => a.checked);
    let dataObj = {
      VisitID: Number(this.VisitId),
      TPID: this.TPId,
      Remarks: this.feedbackRemarks,
      CreatedBy: this.loggedInUser.userid,
      SourceID: 1,
      tblDSFeedBack: dsQuestions.map(a => (
        {
          QuestionID: a.QuestionId,
          Question: a.Description
        }
      ))
    };
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_DS_FEEDBACK, dataObj).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.reportFeedbackPopupRef.close();
        // this.toastr.success(data.Message);
        this.insertUpdateRadiologistVisitTPAudit();
      }
    }, (err) => {
      console.log(err);
    })
  }

  goBack(param) {
    this.isFeedback = param;
  }

  clickSubmit = false;
  selectFeedback(param) {
    this.isFeedback = param;
    if (!this.isFeedback) {
      this.insertUpdateRadiologistVisitTPAudit();
    } else {
      this.getDSQuestions();
    }
  }

  getDSQuestions() {
    this.sharedService.getData(API_ROUTES.GET_DS_QUESTIONS, {}).subscribe((data: any) => {
      if (data.StatusCode == 200) {
        this.feedbackQuestions = data.PayLoad;
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }


  isSpinnerFinalize = true;
  isSpinnerFinalizePopup = true;
  isSpinnerRepeat = true;
  isSpinnerRepeatPopup = true;
  disabledButtonFinalize = false;
  disabledButtonFinalizePopup = false;
  disabledButtonRepeat = false;
  disabledButtonRepeatPopup = false;

  reportFeedbackPopupRef: NgbModalRef;
  isFeedback = false;
  feedbackRemarks = null;
  feedbackRemarksTouched = false;
  feedbackQuestions = [];
  @ViewChild('reportFeedback') reportFeedback;
  openFeadBackForm() {
    this.feedbackQuestions.forEach(a => {
      a.checked = false;
    })
    this.reportFeedbackPopupRef = this.appPopupService.openModal(this.reportFeedback, { backdrop: 'static', size: 'md' });
  }
  disabledButtonDelete = false;
  isSpinnerDelete = true;
  deleteRecord() {
    let params = {
      TableName: "dbo.RadiologistVisitTPAudit",
      PrimaryKey: "RadiologistVisitTPAuditID",
      PrimaryKeyValue: this.RadiologistVisitTPAuditID,
      ModifiedBy: this.loggedInUser.userid || -99
    };
    this.sharedService.deleteRecord(API_ROUTES.DELETE_RECORD_BY_TABLE_NAME, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      this.disabledButtonDelete = false;
      this.isSpinnerDelete = true;
      if (res.StatusCode == 200) {
        this.toastr.success("Audit case removed from the list successfully.", "Successful Removal");
        this.getData(this.isActive);
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.listSection);
      this.toastr.error('Connection error');
    })
  }

}