// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output, SecurityContext, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
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
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  standalone: false,

  selector: 'app-action-buttons-small',
  templateUrl: './action-buttons-small.component.html',
  styleUrls: ['./action-buttons-small.component.scss']
})
export class ActionButtonsSmaLLComponent implements OnInit, OnChanges {
  @Output() isStatusChanged = new EventEmitter<any>();
  config = {
    toolbar: [
      ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
      ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
      ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
      ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
      ['Link', 'Unlink', 'Anchor'],
      ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'],
      ['Styles', 'Format', 'Font', 'FontSize', 'lineheight'],
      ['TextColor', 'BGColor'],
      ['Maximize', 'ShowBlocks'],
    ],
    uiColor: '#ffffff',
    toolbarGroups: [
      { name: 'clipboard', groups: ['clipboard', 'undo'] },
      { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
      { name: 'links' },
      { name: 'insert' },
      { name: 'document', groups: ['mode', 'document', 'doctools'] },
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align'] },
      { name: 'styles' },
      { name: 'colors' }
    ],
    extraPlugins: 'divarea,smiley,justify,indentblock,colorbutton,colordialog,font,tab',
    colorButton_foreStyle: {
      element: 'span',
      attributes: { 'style': 'color: #(color)' }
    },
    resize_enabled: false,
    removePlugins: 'elementspath,save,magicline,contextmenu',
    height: 400,
    removeDialogTabs: 'image:advanced;link:advanced',
    removeButtons: '',
    format_tags: 'p;h1;h2;h3;pre;div',
    undo: {
      undoStackSize: 200,
    },
    tabSpaces: 4,

    on: {
      instanceReady: function () {
        this.document.on('keydown', (event) => {
          const editor = event.editor;
          const selection = editor.getSelection();
          // Handle TAB key to insert spaces
          if (event.data.$.keyCode === 9) { // TAB key
            event.cancel(); // Prevent default behavior
            const tabSize = new Array(this.tabSpaces + 1).join(' ');
            editor.insertText(tabSize); // Insert spaces at the current cursor position
          }
        });
      },
      key: (event) => {
        const editor = event.editor;
        const selection = editor.getSelection();
        if (event.data.keyCode === 27) { // ESC key
          event.cancel();
        }
        // if (event.data.keyCode === 32) {
        //   const range = selection.getRanges()[0];
        //   const selectedText = this.getPreviousWord(range);
        //   const codeObj = this.codesList.find(a => a.TextCode === selectedText);
        //   if (codeObj) {
        //     const wordToReplace = codeObj.TextHTMLTag;
        //     const textCode = codeObj.TextCode;
        //     if (selectedText === textCode) {
        //       const previousWordRange = range.clone();
        //       previousWordRange.setEnd(range.startContainer, range.startOffset);
        //       previousWordRange.setStart(previousWordRange.startContainer, previousWordRange.startOffset - selectedText.length);
        //       previousWordRange.deleteContents();
        //       const newHtml = wordToReplace;
        //       editor.insertHtml(newHtml);
        //       this.cdr.detectChanges();
        //     }
        //   }
        // }
      }
    }
  };
  TextDescription = "";
  RISDictionaryID: any = null;
  TextCode: any = null;
  CategoryID = null;
  searchText = '';
  existingRow = [];
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonDelete = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
  isSpinnerDelete = true;//Hide Loader

  spinnerRefs = {
    listSection: 'listSection',
    formSection: 'formSection',
    techHistorySection: 'techHistorySection'
  }

  ActionLabel = "Save";
  CardTitle = "Add Dictionary Word";
  _form = this.fb.group({
    TextCode: ['', Validators.compose([Validators.required])],
    TextDescription: ['', Validators.compose([Validators.required])],
    isBold: [''],
    isItalic: [''],
    isUnderline: [''],
  });
  confirmationPopoverConfigDictionary = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }



  PatientID: any = null;
  VisitID: any = null;
  TPID: any = null;
  RISStatusID: any = null;
  MOBy: any = null;
  StatusId: any = null;
  RISWorkListID = null;
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
    techHistory: false,
    vitals: false,
    emr: false,
    moConsent: false,
    pacs: false,
    moConsentView: false,
    reportView: false,
    printReport: false,
    contrast: false,
    dicom: false,
    dictionary:false
  };
  isActive = null;
  @ViewChild('emrModal') emrModal;
  @ViewChild('vitalsModal') vitalsModal;
  @ViewChild('dictionaryModal') dictionaryModal;
  @ViewChild('moHistoryModal') moHistoryModal;
  @ViewChild('techHistoryModal') techHistoryModal;
  @Input() VisitDateTime = { RegistrationDate: null, DeliveryDate: null };
  loggedInUser: UserModel;
  vitalsModalPopupRef: NgbModalRef;
  dictionaryModalPopupRef: NgbModalRef;
  techHistoryModalPopupRef: NgbModalRef;
  visitInfo: { tpId: any; visitID: any; patientID: any; phoneNumber: any };
  screenIdentity = null;
  constructor(
    private toastr: ToastrService,
    private appPopupService: AppPopupService,
    private vitalsSrv: VitalsService,
    private route: ActivatedRoute,
    private printRptService: PrintReportService,
    private auth: AuthService,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private sanitized: DomSanitizer

  ) { }

 
  RegistrationDate = null;
  DeliveryDate = null;
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    // console.log("QuestionnairePayload in small buttons__________________", this.QuestionnairePayload)
    // console.log("btnPermission__________________", this.btnPermission)
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
  ngOnChanges(changes: SimpleChanges) {
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

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
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


  objJson = [];
  isHistory = false;
  getTechHistory(screen, active) {
    this.isActive = active;
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

  openRequestedScreen(screen, active) {
    this.isActive = active;
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
      case 'dictionary':
        this.openDictionaryModal();
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
  openDictionaryModal() {
    this.visitInfo = { tpId: this.TPID, visitID: this.VisitID, patientID: this.PatientID, phoneNumber: this.QuestionnairePayload.PatientPhoneNumber }
    this.dictionaryModalPopupRef = this.appPopupService.openModal(this.dictionaryModal, { size: 'xl' });
  }
  openMOHistory() {
    this.vitalsModalPopupRef = this.appPopupService.openModal(this.moHistoryModal, { size: 'xl' });
  }

  closeVitals() {
    this.vitalsModalPopupRef.close();
  }
  isStatusChangedRec(statusValue) {
    if (statusValue == 1) {
      this.closeVitals()
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
  printReport(visitID, TPId) {
    const url = environment.patientReportsPortalUrl + 'mo-consent?p=' + btoa(JSON.stringify({ VisitID: Number(visitID), TPID: TPId }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }

  printRadioReport(p1, p2) {
    this.isActive = p2;
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


  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> open DICOM?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  SysInfo: any = {};
  PACSServers = [];
  disabledButtonDICOM = false;
  isSpinnerDICOM = true;
  isVPN = false;
  getPACSServers(active) {
    this.isActive = active;
    this.SysInfo = this.auth.getSystemInfoFromStorage();
    // let objParams = {
    //   VisitId: this.VisitID,
    //   TPId: this.TPID,
    //   LocID: this.loggedInUser.locationid //this.SysInfo.loginLocId
    // }
    this.isVPN = localStorage.getItem('isVPN') === 'true'; //  get from local storage
    const tblVisitTestDetail = [{
      VisitID: this.VisitID,
      TPID: this.TPID
    }];
    const objParams = {
      IsVPN: this.isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail
    };
    // console.log("objParams: ", objParams)
    this.disabledButtonDICOM = true;
    this.isSpinnerDICOM = false;
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_LOC_AND_VISITS_V2, objParams).subscribe((resp: any) => {
      this.disabledButtonDICOM = false;
      this.isSpinnerDICOM = true;
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        // Dynamic handling for any number of servers
        if (this.PACSServers.length > 0) {
          // Create the URL dynamically for any number of servers
          let url = 'radiant://?n=f';

          // Add each server path to the URL
          this.PACSServers.forEach((server, index) => {
            let sanitizedPath = server.BackupServer;

            // Remove trailing slash if present
            if (sanitizedPath.endsWith('\\')) {
              sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
            }

            // Replace backslashes with URL encoding
            sanitizedPath = sanitizedPath.replace(/\\/g, '%5C');

            // Add to URL with proper parameter name
            url += `&v=%22${sanitizedPath}%22`;
          });

          // Open the URL
          window.open(url, '_blank');
        } else {
          this.disabledButtonDICOM = false;
          this.isSpinnerDICOM = true;
          this.toastr.warning("No PACS Servers Available");
        }
      } else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.toastr.warning("No Record Found");
        this.disabledButtonDICOM = false;
        this.isSpinnerDICOM = true;
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonDICOM = false;
      this.isSpinnerDICOM = true;
      this.toastr.error("Error fetching PACS servers");
    });
  }


  TextHTMLTag = "";
  dataListGlobal = [];
  insertUpdateDictionary() {
    this.TextHTMLTag = "";
    const formValues = this._form.getRawValue();
    // this.TextHTMLTag = `<span [ngClass]="{'bold': ` + formValues.isBold + `, 'italic': ` + formValues.isItalic + `, 'underline': ` + formValues.isUnderline + `}">This is some text</span>`;
    this.TextHTMLTag = this.makeHtml(formValues);
    this._form.markAllAsTouched();
    if (this._form.invalid) {
      this.toastr.warning('Please fill the required fields...!'); return false;
    } else {
      const checkDuplicateUser = this.dataListGlobal.find(el => el.CategoryID == 2 && el.TextCode.trim().localeCompare(formValues.TextCode.trim()) === 0);

      if (this.RISDictionaryID && this.TextCode === formValues.TextCode) {
        this.saveDictionary(formValues)
      } else
        if ((checkDuplicateUser)
          || (this.TextCode == formValues.TextCode)
        ) {
          this.toastr.warning("This shortcut already exists", "Shortcut Duplication"); return;
        } else {
          this.saveDictionary(formValues);
        }

    }
  }

  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
  saveDictionary(formValues) {
    //  Remove the outer <p> tag
    const htmlContent = formValues.TextDescription;
    const withoutOuterP = this.removeOuterPTags(htmlContent);
    this.spinner.show(this.spinnerRefs.formSection);
    this.disabledButton = true;
    this.isSpinner = false;
    const formData = {
      RISDictionaryID: this.RISDictionaryID,
      CategoryID: 2,
      TextCode: formValues.TextCode.trim(),
      TextDesc: this.getPlainFromHTML(formValues.TextDescription).replace('\n\n', ' '),
      TextHTMLTag: withoutOuterP,
      isBold: formValues.isBold,
      isItalic: formValues.isItalic,
      isUnderline: formValues.isUnderline,
      TextColor: this.selectedColor,
      CreatedBy: this.loggedInUser.userid || -99,
    };
    // console.log("form obj is :",formData);//return;
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RIS_DICTIONARY, formData).subscribe((data: any) => {
      if (JSON.parse(data.PayLoadStr).length) {
        if (data.StatusCode == 200) {
          this.spinner.hide(this.spinnerRefs.formSection);
          this.toastr.success(data.Message);
          this.isStatusChanged.emit(1)
          this.clearForm();
          this.getRISDictionaryByUserID();
          this.disabledButton = false;
          this.isSpinner = true;
        } else {
          this.spinner.hide(this.spinnerRefs.formSection);
          this.toastr.error(data.Message)
          this.disabledButton = false;
          this.isSpinner = true;
        }
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.formSection);
      this.disabledButton = false;
      this.isSpinner = true;
      this.toastr.error('Connection error');
    })
  }
  titleToShowOnCard: any = '';
  selectedColor = "#000";
  clearForm() {
    this.titleToShowOnCard = '';
    this.RISDictionaryID = null;
    this.ActionLabel = "Save";
    this.confirmationPopoverConfig['popoverTitle'] = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?'
    this.confirmationPopoverConfig.popoverMessage = 'Are you <b>sure</b> want to ' + this.ActionLabel.toLowerCase() + ' ?', // 'Are you sure?',
      this.CardTitle = "Add Dictionary Word";
    // this.rowIndex = null;
    setTimeout(() => {
      this._form.reset();
    }, 100);
  }
  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  makeHtml(param: any) {
    let html = param.TextDescription;
    if (param.isUnderline) {
      html = '<u>' + html + '</u>';
    }
    if (param.isItalic) {
      html = `<i style="color: ` + this.selectedColor + `!important">` + html + `</i>`;
    }
    if (param.isBold) {
      html = '<b>' + html + '</b>';
    }
    html = `<span style="font-size: 12px; font-family:Verdana,Geneva,sans-serif; color: ` + this.selectedColor + `">` + html + `</span>`;
    return html;
  }
  removeOuterPTags(html: string): string {
    // Create a DOM parser to handle the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
  
    // Get the first child element
    const bodyChild = doc.body.firstElementChild;
  
    // Check if it's a <p> tag and unwrap its content
    if (bodyChild && bodyChild.tagName.toLowerCase() === 'p') {
      return bodyChild.innerHTML;
    }
  
    // Return the original HTML if no <p> tag is found
    return html;
  }
  public getPlainFromHTML(paramHtml): string {
    const sanitizedHtmlContent = this.sanitized.sanitize(SecurityContext.HTML, paramHtml);
    return this.getPlainText(sanitizedHtmlContent);
  }
  public getPlainText(htmlContent: string): string {
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const plainText = element.textContent || element.innerText || '';
    // Clean up any additional whitespace
    return plainText.trim();
  }

  dataList = [];
  isAll = true;
  isMain = false;
  isMy = false;
  countAll = 0;
  countMain = 0;
  countMy = 0;
  getRISDictionaryByUserID() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.dataListGlobal = [];
    const params = {
      UserID: this.loggedInUser.userid || -99,
      CategoryID: 2
    };
    this.sharedService.getData(API_ROUTES.GET_RIS_DICTIONARY_BY_USER_ID, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);
      if (res.StatusCode == 200) {
        this.clearForm();
        this.dataListGlobal = res.PayLoad || [];

        this.dataListGlobal = this.dataListGlobal.map((a) => ({ CategoryTitle: (a.CategoryID == 1) ? 'Default' : 'Self', ...a }));
        this.dataListGlobal = this.dataListGlobal.map(a => ({
          RISDictionaryID: a.RISDictionaryID,
          CategoryID: a.CategoryID,
          CategoryTitle: a.CategoryTitle,
          TextCode: a.TextCode,
          TextDesc: a.TextDesc,
          TextHTMLTag: this.transform(a.TextHTMLTag)
        }))
        this.dataList = this.dataListGlobal;
        this.countAll = this.dataListGlobal.length;
        this.countMy = this.dataListGlobal.filter(a => a.CategoryID == 2).length;
      } else {
        this.dataListGlobal = [];
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.listSection);
      this.toastr.error('Connection error');
    })
  }

}
