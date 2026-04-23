// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ThirdShortlistedApplicantsComponent } from 'src/app/modules/recruitment/components/third-shortlisted-applicants/third-shortlisted-applicants.component';
import { VitalsService } from 'src/app/modules/ris/services/vitals.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { environment } from '../../../../../../../../environments/environment'
import { ActivatedRoute } from '@angular/router';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-action-buttons-large',
  templateUrl: './action-buttons-large.component.html',
  styleUrls: ['./action-buttons-large.component.scss']
})
export class ActionButtonsLargeComponent implements OnInit, OnChanges {
  techHistoryModalPopupRef: NgbModalRef;
  @ViewChild('techHistoryModal') techHistoryModal;
  @Input() isStatusChanged: any = [];
  @Output() isShowCard = new EventEmitter<any>();
  @Input() VisitDateTime = { RegistrationDate: null, DeliveryDate: null };
  loggedInUser: UserModel;

  PatientID: any = null;
  VisitID: any = null;
  TPID: any = null;
  RISStatusID: any = null;
  MOBy: any = null;
  StatusId: any = null;
  RISWorkListID: any = null;
  @Input() QuestionnairePayload = {
    TPID: null,
    VisitID: null,
    PatientID: null,
    RISStatusID: null,
    MOBy: null,
    PatientPhoneNumber: null,
    StatusId: null,
    RISWorkListID: null
  };
  @Input() btnPermission = {
    vitals: false,
    emr: false,
    moConsent: false,
    pacs: false,
    moConsentView: false,
    printReport: false,
    dicom: false,
    techHistory: false
  };
  @ViewChild('emrModal') emrModal;
  @ViewChild('vitalsModal') vitalsModal;
  @ViewChild('moHistoryModal') moHistoryModal;
  vitalsModalPopupRef: NgbModalRef;
  visitInfo: { tpId: any; visitID: any; patientID: any; phoneNumber: any };
  constructor(
    private toastr: ToastrService,
    private appPopupService: AppPopupService,
    private vitalsSrv: VitalsService,
    private route: ActivatedRoute,
    private printRptService: PrintReportService,
    private auth: AuthService,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService
  ) { }
  RegistrationDate = null;
  DeliveryDate = null;
  screenIdentity = null;
  ngOnInit(): void {
    // console.log("QuestionnairePayload__________________", this.QuestionnairePayload)
    // console.log("btnPermission__________________", this.btnPermission)
    this.loadLoggedInUserInfo();
    this.screenIdentity = this.route.routeConfig.path;
    this.PatientID = this.QuestionnairePayload.PatientID;
    this.VisitID = this.QuestionnairePayload.VisitID;
    this.TPID = this.QuestionnairePayload.TPID;
    this.RISStatusID = this.QuestionnairePayload.RISStatusID;
    this.MOBy = this.QuestionnairePayload.MOBy;
    this.RegistrationDate = this.VisitDateTime.RegistrationDate || null;
    this.DeliveryDate = this.VisitDateTime.DeliveryDate || null;
    this.StatusId = this.QuestionnairePayload.StatusId || null;
    this.RISWorkListID = this.QuestionnairePayload.RISWorkListID || null;
  }

  ngOnChanges(): void {
    this.PatientID = this.QuestionnairePayload.PatientID;
    this.VisitID = this.QuestionnairePayload.VisitID;
    this.TPID = this.QuestionnairePayload.TPID;
    this.RISStatusID = this.QuestionnairePayload.RISStatusID;
    this.MOBy = this.QuestionnairePayload.MOBy;
    this.StatusId = this.QuestionnairePayload.StatusId || null;
    this.RISWorkListID = this.QuestionnairePayload.RISWorkListID || null;
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  openRequestedScreen(screen) {
    let url = environment.patientReportsPortalUrl;
    switch (screen) {
      case 'moConsent':
        if (!this.MOBy) {
          this.toastr.warning("MO not performed against this test", "MO Consent")
        } else {
          url = url + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(this.VisitID), TPID: this.TPID }));
          const winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
        }

        break;
      case 'emr':
        this.openEMR();
        break;
      case 'vitals':
        this.openVitals();
        break;
      case 'moConsentView':
        if (!this.MOBy) {
          this.toastr.warning("MO not performed against this test", "MO Consent")
        } else {
          this.openMOHistory();
        }
        break;
    }
    // setTimeout(() => {
    //   // winRef.close();
    // }, 1000);
  }
  isShowVitalsCard = false;
  getVitals() {
    if (this.VisitID && this.TPID) {
      const params = {
        VisitID: this.VisitID,
        TPID: this.TPID
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
  commingSoon() {
    this.toastr.info('Comming soon');
  }
  openEMR() {
    // , phoneNumber: this.PhoneNumber
    this.visitInfo = { tpId: this.TPID, visitID: null, patientID: this.PatientID, phoneNumber: this.QuestionnairePayload.PatientPhoneNumber }
    this.appPopupService.openModal(this.emrModal, { size: 'fss-inner' });
  }
  openVitals() {
    this.visitInfo = { tpId: this.TPID, visitID: this.VisitID, patientID: this.PatientID, phoneNumber: this.QuestionnairePayload.PatientPhoneNumber }
    this.vitalsModalPopupRef = this.appPopupService.openModal(this.vitalsModal, { size: 'xl' });
  }
  openMOHistory() {
    this.getVitals();
    this.visitInfo = { tpId: this.TPID, visitID: this.VisitID, patientID: this.PatientID, phoneNumber: this.QuestionnairePayload.PatientPhoneNumber }
    this.vitalsModalPopupRef = this.appPopupService.openModal(this.moHistoryModal, { size: 'xl' });
  }
  closeVitals() {
    this.vitalsModalPopupRef.close();
  }
  isStatusChangedRec(statusValue) {
    if (statusValue == 1) {
      this.closeVitals()
      this.getVitals()
      this.isShowCard.emit(1);
    }
  }

  printMOHistoryReport(visitID, TPId) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(visitID), TPID: TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }
  printRadioReport(){
    this.ViewReport(1);
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
      "ACCOUNTNO": this.VisitID,
      "PROFILETESTS": "",//this.TPCode,
      "PROFILETESTSDESC": "",//this.TPName,
      "PROFILETESTID": this.TPID,

    }]
    // console.log("radioTP: ",radioTP);return;

    if (!this.TPID) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    }
    else {


      radioTestIds = this.TPID;
      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = 'medicubes';
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();
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
    const patientVisitInvoiceWinRef = window.open('', '_blank');
    return patientVisitInvoiceWinRef;
  }
  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split('?');
    if (reportSegments.length > 1) {
      reportUrl = reportSegments[0] + '?' + btoa(atob(reportSegments[1]) + '&SessionExpiryTime=' + (+new Date() + (CONSTANTS.REPORT_EXPIRY_TIME * 1000))); // &pdf=1
    }
    return reportUrl;
  }


  objJson = [];
  isHistory = false;
  spinnerRefs = {
    techHistorySection: 'techHistorySection',
  }
  getTechHistory() {
    if (!this.RISWorkListID) {
      this.toastr.warning("No history recorded"); return;
    }
    const objParams = {
      RISWorkListID: this.RISWorkListID
    }
    this.sharedService.getData(API_ROUTES.GET_TECHNICIAN_HISTORY_JSON, objParams).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.techHistorySection);
      if (resp.StatusCode == 200) {
        const technicianHitory = resp.PayLoad[0] || [];
        this.objJson = technicianHitory.TechnicianHistoryJSON ? JSON.parse(technicianHitory.TechnicianHistoryJSON) : []
        // console.log("this.objJson:", this.objJson)
        if (this.objJson.length) {
          for (const obj of this.objJson) {
            if (obj.technicianHitory !== "") {
              this.isHistory = true;
              break;
            }
          }
        }
        this.techHistoryModalPopupRef = this.appPopupService.openModal(this.techHistoryModal, { size: 'sm' });
      } else {
        this.toastr.error("Something went wrong with loading tech history")
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.techHistorySection);
      console.log(err)
    })

  }


}
