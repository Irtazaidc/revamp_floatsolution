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

@Component({
  standalone: false,

  selector: 'app-send-for-audit',
  templateUrl: './send-for-audit.component.html',
  styleUrls: ['./send-for-audit.component.scss']
})
export class SendForAuditComponent implements OnInit {
  @ViewChild('detailArea') detailArea: ElementRef;
  @ViewChild('vitalsModal') vitals;
  @ViewChild('emrModal') emrModal;
  subSectionList: any = [];
  radoiologistList = [];
  risWorklist = [];
  rowIndex = null;
  searchText = '';
  spinnerRefs = {
    listSection: 'listSection'
  }
  noDataMessage = 'Please search test to send for audit';
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
    RadiologistID: [, Validators.compose([Validators.required])],
    subSectionIDs: [''],
    dateFrom: ['', Validators.compose([Validators.required])],
    dateTo: ['', Validators.compose([Validators.required])]
  });

  EmpID = null;
  AuditorRadiologistID = null;
  loggedInUser: UserModel;
  checkedItemCount = 0;
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
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this._form.patchValue({
      dateFrom: Conversions.getCurrentDateObjectNew(),
      dateTo: Conversions.getEndDateObjectNew()
    });
    this.getSubSection();
    this.getRadiologist();
    this.getAuditorRadiologist();

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
  auditorRadoiologistList = []
  getAuditorRadiologist() {
    let objParams = {
      isAuditor: 1
    };
    this.sharedService.getData(API_ROUTES.GET_RADIOLOGIST, objParams).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.auditorRadoiologistList = resp.PayLoad || [];
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
    if (daysDifference > 92 || revertDays > 92) {
      this.toastr.error('The difference between dates should be 3 months');
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
  validateDateDifference__(index) {
    const formValues = this._form.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toastr.error('The difference between dates should be at most 3 months');
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
      return; // Exit function if toDate is less than fromDate
    }

    // Calculate the difference in months
    const monthsDifference = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + toDate.getMonth() - fromDate.getMonth();
    console.log("monthsDifference:  ", monthsDifference)

    if (monthsDifference > 3) {
      this.toastr.error('The difference between dates should be at most 3 months');
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
      return; // Exit function if difference is less than 3 months
    }
  }


  getRISWorkListForAudit() {
    this.mainChk = false;
    this.checkedItemCount = 0;
    this.risWorklist = [];
    let formValues = this._form.getRawValue();
    this._form.markAllAsTouched();
    if (this._form.invalid) {
      this.toastr.warning('Please select any radiologist!'); return false;
    } else {
      let params = {
        RadiologistEmpID: formValues.RadiologistID,
        SubSectionIDs: formValues.subSectionIDs ? formValues.subSectionIDs.join(",") : null,
        DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : '',
        DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : '',
      }
      this.spinner.show(this.spinnerRefs.listSection);
      this.sharedService.getData(API_ROUTES.GET_RIS_WORKLIST_FOR_AUDIT, params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.PayLoad && resp.PayLoad.length && resp.StatusCode == 200) {
          this.risWorklist = resp.PayLoad || [];
          // console.log("risWorklist is: ", this.risWorklist)
        } else {
          this.noDataMessage = 'No record found...';
          this.risWorklist = []
        }

      }, (err) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        console.log("Err", err)
      })
    }
  }

  RadiologistName = "";
  onRadiologistChange(ev) {
    this.RadiologistName = (ev) ? ev.Notation + "" + ev.FirstName + ev.LastName : "";
  }

  isCoppied = null;
  rowIndexCpy = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    let pin = text.VisitNo
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
    this.VisitID = row.VisitNo.replaceAll("-", "");
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

  showVisitDetailForSendList(row, i) {
    this.visitDetailBtnClicked = true;
    // console.log("mo-row - visitdetail", row);
    this.rowIndexToSend = i;
    this.TPId = row.TPId;
    this.VisitID = row.VisitNo.replaceAll("-", "");
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
  mainChk = false;
  isFieldDisabled = false;
  selectAllTPs(e) {
    this.risWorklist.forEach(a => {
      a.checked = false;
      if (a.TPId > 0) {
        a.checked = e.target.checked;
      }
    });
    this.checkedItemCount = e.target.checked ? this.risWorklist.filter(item => item.checked).length : 0;
    this.mainChk = this.risWorklist.length == this.checkedItemCount ? true : false;
  }
  uncheckedAllTPs() {
    this.risWorklist.forEach(a => {
      a.checked = false;
    });
    this.checkedItemCount = 0;
    this.mainChk = false;
  }
  countCheckedItems() {
    let checkedItems = this.risWorklist.filter(item => item.checked);
    this.checkedItemCount = checkedItems.length;
    this.mainChk = this.risWorklist.length == this.checkedItemCount ? true : false;
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

  listTosend = [];
  addToList() {
    let checkedItems = this.risWorklist.filter(a => a.checked);
    if (!checkedItems.length) {
      this.toastr.warning("Please select any test to add to send list for audit", "No Test Selection");
      return;
    }

    // Check for duplicates
    const duplicates = [];
    for (const newItem of checkedItems) {
      if (this.listTosend.some(item => item.VisitNo === newItem.VisitNo && item.TPId === newItem.TPId)) {
        duplicates.push({ VisitNo: newItem.VisitNo, TPName: newItem.TPName });
      }
    }

    if (duplicates.length > 0) {
      // Show toaster message for duplicates
      let message = '<ul style="list-style-type:none; padding-left:0;">';
      duplicates.forEach((dup) => {
        message += `<li>Item: ${dup.VisitNo} (${dup.TPName})</li>`;
      });
      message += '</ul>';
      message += 'Already added to the send list! Please remove the duplicates and retry.';
      this.toastr.warning(message, "Duplicates Found", { enableHtml: true });
      return;
    }
    // No duplicates found, proceed to add to listTosend
    this.listTosend = [...this.listTosend, ...checkedItems];
    if (this.listTosend.length) {
      this._form.get('RadiologistID').disable();
    }
  }

  rowIndexToSend = null;
  removeItem(itemToRemove) {
    // Find the index of the item to remove in the listTosend array based on VisitNo and TPID
    const index = this.listTosend.findIndex(item => item.VisitNo === itemToRemove.VisitNo && item.TPId === itemToRemove.TPId);

    // Check if the item was found
    if (index !== -1) {
      // Create a new array without the removed item
      this.listTosend = this.listTosend.filter((item, i) => i !== index);
    } else {
      console.error("Item not found in listTosend array.");
    }
  }

  isSubmitClicked = false;
  insertUpdateRadiologistVisitTPAudit() {
    this.isSubmitClicked = true;
    // let checkedItems = this.risWorklist.filter(a => a.checked);
    let checkedItems = this.listTosend;
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
        RadiologistName: this.RadiologistName,
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
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RADIOLOGIST_VISIT_TP_AUDIT_V2, objParam).subscribe((resp: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(resp.PayLoadStr).length) {
          if (resp.StatusCode == 200) {
            this.checkedItemCount = 0;
            this.mainChk = false;
            this.toastr.success(resp.Message);
            this._form.get('RadiologistID').enable();
            this.uncheckedAllTPs();
            // this.getRISWorkListForAudit();
            this.listTosend = [];
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


}
