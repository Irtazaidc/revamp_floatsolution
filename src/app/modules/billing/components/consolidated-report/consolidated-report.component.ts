// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-consolidated-report',
  templateUrl: './consolidated-report.component.html',
  styleUrls: ['./consolidated-report.component.scss']
})
export class ConsolidatedReportComponent implements OnInit {
  @ViewChild('patientVisitDocs') patientVisitDocs;
  patientVisitDocsRef: NgbModalRef;
  @ViewChild('panelAddOnServicesModal') panelAddOnServicesModal;
  panelAddOnServicesModalRef: NgbModalRef;
  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private auth: AuthService,
    private helper: HelperService,
  ) { }
  spinnerRefs = {
    listSection: 'listSection',
    listSectionBill: 'listSectionBill',
    listSectionConsolidatedBill: 'listSectionConsolidatedBill',
    formSection: 'formSection',
    panelsDropdown: 'panelsDropdown'

  }
  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to save?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };

  searchTextBill = "";
  searchTextGeneratedBill = "";
  searchTextGeneratedBillDetail = "";
  branchList: any = [];
  selectedPanel = 1714;
  rowIndex = null;
  disabledButton = false;
  disabledButtonDraft = false;
  disabledButtonFinalize = false;
  disabledButtonSearchBill = false;
  disabledButtonSearchConsolidatedBill = false;
  isSpinner = true;
  isSpinnerDraft = true;
  isSpinnerFinalize = true;
  isSpinnerSearchBill = true;
  isSpinnerSearchConsolidatedBill = true;
  disabledButtonSearch = false;
  isSpinnerSearch = true;
  BranchID = null;
  panelBills = [];
  panelConsolidatedBills = [];
  Remarks = "";
  selectedCount = 0;
  flexCheckDisabled = false;
  billType = 1
  noDataMessage = 'Please search';
  noDataMessageBill = 'Please search';
  noDataMessageGeneratedBill = 'Please search';
  inValidDateRange = false;
  inValidDateRangeBill = false;
  isSubmittedValue = false;
  panelsList = [];
  loggedInUser: UserModel;

  ngOnInit(): void {
    this._form.patchValue({
      startDate: Conversions.getCurrentDateObjectNew(),
      endDate: Conversions.getEndDateObjectNew(),
    });
    this._formWorklist.patchValue({
      startDate: Conversions.getCurrentDateObjectNew(),
      endDate: Conversions.getEndDateObjectNew(),
      PanelId: 1714
    });
    this._formWorklist.get('PanelId').disable();
    this.generateConsolidatedBillNo();
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getPanels();
  }
  getBranches() {
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  getPanels() {
    this.panelsList = [];
    const _params = {
      branchId: null
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
        this.panelsList = data || [];
        // let panelID = this.panelsList.find(panel => panel.PanelId === 1714);
        // if (panelID) {
        //   this._form.get('PanelId').setValue(1714);
        //   this._form.get('PanelId').disable();
        // } else {
        //   this._form.get('PanelId').setValue(null);
        //   this._form.get('PanelId').enable();
        // }
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.panelsDropdown);
      console.log(err);
      this.toastr.error("Something went wrong.");
    });
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  _form = this.fb.group({
    startDate: [null as any],
    endDate: [null as any],
    // PanelId: [{ value: 1714, disabled: true }],//For live GIZ
    // PanelId: [{ value: 975, disabled: true }], // For stg. TEC
    // PanelId: [null,],
    // BranchID: [null,]
  });
  _formWorklist = this.fb.group({
    startDate: [null as any],
    endDate: [null as any],
    // PanelId: [{ value: 1714, disabled: true }],//For live GIZ
    // PanelId: [{ value: 975, disabled: true }], // For stg. TEC
    PanelId: [null,],
    PanelBillStatusID: [null,],
    PatientMRN: ['']
  });


  copyText(text: any, i = null) {
    const pin = text.AccNo
    this.helper.copyMessage(pin);
  }

  printPanleBillPatientWiseReport(parentRow) {
    const obj = {
      PatientID: parentRow.PatientId,
    }
    const url = environment.patientReportsPortalUrl + 'panel-bill-patient-wise-summary?p=' + btoa(JSON.stringify(obj));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    const winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }


  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  getPanelBillForConsolidation() {
    this.newBillPress = true;
    this.showConsolidatedBillDetail = false;
    const formValues = this._formWorklist.getRawValue();
    // Get the form values for dateFrom and dateTo
    const dateFrom: any = formValues.startDate;
    const dateTo: any = formValues.endDate;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.inValidDateRange = true;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 45;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = maxDaysDifference;
      this.toastr.error(`The difference between dates should not exceed ${period} Days`);
      this.inValidDateRange = true;
      return;
    }

    this._formWorklist.markAllAsTouched();
    const objParams = {
      FromDate: formValues.startDate ? Conversions.formatDateObject(formValues.startDate) : null,
      ToDate: formValues.endDate ? Conversions.formatDateObject(formValues.endDate) : null,
      // PanelID: formValues.PanelId ? formValues.PanelId : null,
    };
    this.disabledButtonSearchBill = true;
    this.isSpinnerSearchBill = false;
    this.spinner.show(this.spinnerRefs.listSectionBill);
    this.sharedService.getData(API_ROUTES.GET_PANEL_BILL_FOR_CONSOLIDATION, objParams).subscribe((resp: any) => {
      this.disabledButtonSearchBill = false;
      this.isSpinnerSearchBill = true;
      this.spinner.hide(this.spinnerRefs.listSectionBill);
      if (resp && resp.StatusCode == 200) {
        const response = resp.PayLoad;
        if (!response.length) {
          this.noDataMessageBill = "No record found";
        }
        this.panelBills = response;
        this.Remarks = "";
      }
      this.inValidDateRange = false;
    }, (err) => {
      console.log(err)
      this.toastr.error("Something went wrong. " + err.statusText)
      this.disabledButtonSearchBill = false;
      this.isSpinnerSearchBill = true;
      this.spinner.hide(this.spinnerRefs.listSectionBill);
    })

  }


  /////////////////////////////////////////////////////////////////////////////////////////////////////
  ConsolidatedBillNo = null;
  generateConsolidatedBillNo() {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const billMonth = today.toISOString().slice(0, 10);
    const params = {
      PanelId: 1714,
      BillMonth: billMonth
    };
    this.sharedService.getData(API_ROUTES.GENERATE_CONSOLIDATED_BILL_NO, params).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        this.ConsolidatedBillNo = res.PayLoad[0].ConsolidatedBillNo || null;
      }

    }, (err) => {
      this.toastr.error('Connection error');
      console.log(err);
      this.spinner.hide();
    })
  }
  newBill() {
    this.newBillPress = true;
    this.isFinal = false
    this.isExisting = false;
    this.invoiceNo = null;
    this.invoiceMonth = null;
    this.panelConsolidatedBillID = null;
    this.consolidatedRemarks = null;
    this.showConsolidatedBillDetail = false;
    this.rowIndex = null;
    this.panelBills = [];
    this.panelConsolidatedBillsDetail = [];
  }
  newBillPress = true;
  saveConsolidatedBill(isFinal) {
    this.isFinal = isFinal;
    if (this.panelConsolidatedBillID) {
      this.updatePanelConsolidatedBill();
    } else {
      this.insertPanelConsolidatedBill();
    }
  }
  insertPanelConsolidatedBill() {
    const filteredData: any[] = this.panelBills.filter(a => a.checked);
    if (!filteredData.length) {
      this.toastr.info("Please select any patient to generate the bill", "No Patient Selected!");
      return;
    }
    const today = new Date();
    const billMonth = filteredData[0].BillFrom//today.toISOString().slice(0, 10);
    const params = {
      PanelId: 1714,  // Update to dynamic PanelId if needed
      BillMonth: billMonth,
      BillType: this.billType == 1 ? "OPD" : "IPD",
    };
    this.sharedService.getData(API_ROUTES.GENERATE_CONSOLIDATED_BILL_NO, params).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoad) {
          this.ConsolidatedBillNo = res.PayLoad[0].ConsolidatedBillNo || null;
          const ids = filteredData
            .filter(item => item.PanelBillNewID != null)
            .map(item => item.PanelBillNewID);
          if (!ids.length) {
            this.toastr.warning("No valid PanelBillNewID found in the selected bills.");
            console.warn("No valid PanelBillNewID found in the array.");
            return;
          }
          const commaSeparatedIDs = ids.join(',');
          const invoiceMonth = moment().format('DD-MMM-YY');
          const objParam = {
            PanelConsolidatedBillID: null,
            ConsolidatedBillNo: this.ConsolidatedBillNo,
            ConsolidatedAmount: filteredData.reduce((sum, row) => sum + (Number(row.NetAmount) || 0), 0),
            InvoiceMonth: invoiceMonth,
            Remarks: this.Remarks,
            PanelBillNewIDs: commaSeparatedIDs,
            CreatedBy: this.loggedInUser?.userid || -99,
            BillType: this.billType,
            isFinal: this.isFinal
          };
          this.disabledButtonDraft = true;
          this.isSpinnerDraft = false;
          this.sharedService.insertUpdateData(API_ROUTES.INSERT_PANEL_CONSOLIDATED_BILL, objParam).subscribe(
            (resp: any) => {
              this.disabledButtonDraft = false;
              this.isSpinnerDraft = true;
              if (resp.StatusCode === 200 && resp.PayLoadStr) {
                const result = JSON.parse(resp.PayLoadStr);
                // if (result.length && result[0].Result === 2) {
                //   this.toastr.error('The selected visit has already been included in an existing bill. Duplicate billing is not allowed.', 'Duplicated Bill');
                //   return;
                // }
                this.toastr.success(resp.Message);
                // this.getPanelBillForConsolidation();
                this.newBill();
                this.getPanelConsolidatedBill();
              } else {
                this.toastr.error('Something went wrong! Please contact system support.');
              }
            },
            (err) => {
              console.error("Insert error:", err);
              this.toastr.error('Connection error');
              this.toastr.error("Something went wrong. " + err.statusText);
              this.disabledButtonDraft = false;
              this.isSpinnerDraft = true;
            }
          );
        } else {
          this.toastr.error("Failed to generate consolidated bill number.");
        }
      },
      (err) => {
        console.error("Bill number generation error:", err);
        this.toastr.error('Connection error');
        this.toastr.error("Error generating consolidated bill number. " + err.statusText);
      }
    );
  }

  updatePanelConsolidatedBill() {
    const filteredData: any[] = this.panelConsolidatedBillsDetail.filter(a => a.checked);
    if (!filteredData.length) {
      this.toastr.info("Please select any patient to generate the bill", "No Patient Selected!");
      return;
    }
    const today = new Date();
    const billMonth = filteredData[0].BillFrom//today.toISOString().slice(0, 10);
    const params = {
      PanelId: 1714,  // Update to dynamic PanelId if needed
      BillMonth: billMonth,
      BillType: this.billType == 1 ? "OPD" : "IPD",
    };

    const ids = filteredData
      .filter(item => item.PanelBillNewID != null)
      .map(item => item.PanelBillNewID);
    if (!ids.length) {
      this.toastr.warning("No valid PanelBillNewID found in the selected bills.");
      console.warn("No valid PanelBillNewID found in the array.");
      return;
    }
    const commaSeparatedIDs = ids.join(',');
    const invoiceMonth = moment().format('DD-MMM-YY');
    const objParam = {
      PanelConsolidatedBillID: this.panelConsolidatedBillID,
      ConsolidatedBillNo: this.invoiceNo,
      ConsolidatedAmount: filteredData.reduce((sum, row) => sum + (Number(row.NetAmount) || 0), 0),
      InvoiceMonth: invoiceMonth,
      Remarks: this.Remarks,
      PanelBillNewIDs: commaSeparatedIDs,
      CreatedBy: this.loggedInUser?.userid || -99,
      BillType: this.billType,
      isFinal: this.isFinal
    };
    this.disabledButtonFinalize = true;
    this.isSpinnerFinalize = false;
    this.sharedService.insertUpdateData(API_ROUTES.UPDATE_PANEL_CONSOLIDATED_BILL, objParam).subscribe(
      (resp: any) => {
        this.disabledButtonFinalize = false;
        this.isSpinnerFinalize = true;
        if (resp.StatusCode === 200 && resp.PayLoadStr) {
          const result = JSON.parse(resp.PayLoadStr);
          // if (result.length && result[0].Result === 2) {
          //   this.toastr.error('The selected visit has already been included in an existing bill. Duplicate billing is not allowed.', 'Duplicated Bill');
          //   return;
          // }
          this.toastr.success(resp.Message);
          this.getPanelConsolidatedBill();
          this.newBill();
        } else {
          this.toastr.error('Something went wrong! Please contact system support.');
        }
      },
      (err) => {
        console.error("Insert error:", err);
        this.toastr.error('Connection error');
        this.toastr.error("Something went wrong. " + err.statusText);
        this.disabledButtonFinalize = false;
        this.isSpinnerFinalize = true;
      }
    );

  }

  totalSum = 0;
  totalSumFormatted = '';
  onCheckboxChange() {
    this.selectedCount = this.panelBills.filter(row => row.checked).length;
    this.totalSum = this.panelBills
      .filter(row => row.checked)
      .reduce((sum, row) => sum + (Number(row.NetAmount) || 0), 0);
    this.totalSumFormatted = this.totalSum.toLocaleString('en-IN');
  }
  onCheckboxChangeExisting() {
    this.selectedCount = this.panelConsolidatedBillsDetail.filter(row => row.checked).length;
    this.totalNetAmount = this.panelConsolidatedBillsDetail
      .filter(row => row.checked)
      .reduce((sum, row) => sum + (Number(row.NetAmount) || 0), 0);
    // this.totalSumFormatted = this.totalSum.toLocaleString('en-IN');
  }


  getPanelConsolidatedBill() {
    this.newBill();
    this.isExisting = false;
    this.panelConsolidatedBills = [];
    const formValues = this._form.getRawValue();
    // Get the form values for dateFrom and dateTo
    const dateFrom = formValues.startDate;
    const dateTo = formValues.endDate;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.inValidDateRangeBill = true;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 45;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = maxDaysDifference;
      this.toastr.error(`The difference between dates should not exceed ${period} Days`);
      this.inValidDateRangeBill = true;
      return;
    }

    this._form.markAllAsTouched();
    const objParams = {
      FromDate: formValues.startDate ? Conversions.formatDateObject(formValues.startDate) : null,
      ToDate: formValues.endDate ? Conversions.formatDateObject(formValues.endDate) : null,
      // PanelID: formValues.PanelId ? formValues.PanelId : null,
    };
    this.disabledButtonSearchConsolidatedBill = true;
    this.isSpinnerSearchConsolidatedBill = false;
    this.spinner.show(this.spinnerRefs.listSectionConsolidatedBill);
    this.sharedService.getData(API_ROUTES.GET_PANEL_CONSOLIDATED_BILL, objParams).subscribe((resp: any) => {
      this.disabledButtonSearchConsolidatedBill = false;
      this.isSpinnerSearchConsolidatedBill = true;
      this.spinner.hide(this.spinnerRefs.listSectionConsolidatedBill);
      if (resp && resp.StatusCode == 200) {
        const response = resp.PayLoad;
        if (!response.length) {
          this.noDataMessageBill = "No record found";
        }
        this.panelConsolidatedBills = response;
        this.Remarks = "";
      }
      this.inValidDateRange = false;
    }, (err) => {
      console.log(err)
      this.toastr.error("Something went wrong. " + err.statusText)
      this.disabledButtonSearchConsolidatedBill = false;
      this.isSpinnerSearchConsolidatedBill = true;
      this.spinner.hide(this.spinnerRefs.listSectionConsolidatedBill);
    })
  }
  panelConsolidatedBillsDetail = [];
  showConsolidatedBillDetail = false;
  totalNetAmount = 0;
  panelConsolidatedBillID = null;
  consolidatedRemarks = null;
  invoiceNo = null;
  invoiceMonth = null;
  isExisting = false;
  isFinal = false;
  getConsolidatedBillDetail(i, row) {
    if (row.isFinal) {
      this.getFinalPanelConsolidatedBillDetail(i, row);
    } else {
      this.getPanelConsolidatedBillDetail(i, row);
    }

  }
  getPanelConsolidatedBillDetail(i, row) {
    this.isFinal = row.isFinal;
    this.billType = row.BillType;
    this.isExisting = true;
    this.newBillPress = false;
    this.invoiceNo = row.PanelConsolidatedBillNo;
    this.invoiceMonth = row.InvoiceMonth ? row.InvoiceMonth.split('-').slice(1).join('-') : null;
    this.panelConsolidatedBillID = row.PanelConsolidatedBillID;
    this.consolidatedRemarks = row.Remarks;

    this.showConsolidatedBillDetail = true;
    this.rowIndex = i;
    this.panelConsolidatedBillsDetail = [];
    const objParams = {
      PanelConsolidatedBillID: row.PanelConsolidatedBillID
    };
    this.sharedService.getData(API_ROUTES.GET_PANEL_CONSOLIDATED_BILL_DETAIL, objParams).subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200) {
        const response = resp.PayLoad;
        if (!response.length) {
          this.noDataMessageBill = "No record found";
        }
        this.panelConsolidatedBillsDetail = response;
        // this.totalNetAmount = this.panelConsolidatedBillsDetail.reduce((sum, item) => sum + (Number(item.NetAmount) || 0), 0);
        this.totalNetAmount = this.panelConsolidatedBillsDetail.filter(a => a.checked).reduce((sum, row) => sum + (Number(row.NetAmount) || 0), 0);
      }
    }, (err) => {
      console.log(err)
      this.toastr.error("Something went wrong. " + err.statusText)
    })
  }
  getFinalPanelConsolidatedBillDetail(i, row) {
    this.isFinal = row.isFinal;
    this.billType = row.BillType;
    this.isExisting = true;
    this.newBillPress = false;
    this.invoiceNo = row.PanelConsolidatedBillNo;
    this.invoiceMonth = row.InvoiceMonth ? row.InvoiceMonth.split('-').slice(1).join('-') : null;
    this.panelConsolidatedBillID = row.PanelConsolidatedBillID;
    this.consolidatedRemarks = row.Remarks;

    this.showConsolidatedBillDetail = true;
    this.rowIndex = i;
    this.panelConsolidatedBillsDetail = [];
    const objParams = {
      PanelConsolidatedBillID: row.PanelConsolidatedBillID
    };
    this.sharedService.getData(API_ROUTES.GET_FINAL_PANEL_CONSOLIDATED_BILL_DETAIL, objParams).subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200) {
        const response = resp.PayLoad;
        if (!response.length) {
          this.noDataMessageBill = "No record found";
        }
        this.panelConsolidatedBillsDetail = response;
        // this.totalNetAmount = this.panelConsolidatedBillsDetail.reduce((sum, item) => sum + (Number(item.NetAmount) || 0), 0);
        this.totalNetAmount = this.panelConsolidatedBillsDetail.filter(a => a.checked).reduce((sum, row) => sum + (Number(row.NetAmount) || 0), 0);
      }
    }, (err) => {
      console.log(err)
      this.toastr.error("Something went wrong. " + err.statusText)
    })
  }
  printConsolidatedReport() {
    const panelID = 1714;
    const obj = { invoiceNo: this.invoiceNo, invoiceMonth: this.invoiceMonth, panelID: panelID, panelConsolidatedBillID: this.panelConsolidatedBillID }
    const url = environment.patientReportsPortalUrl + 'panel-consolidated-bill?p=' + btoa(JSON.stringify({ invoiceNo: this.invoiceNo, invoiceMonth: this.invoiceMonth, panelID: panelID, panelConsolidatedBillID: this.panelConsolidatedBillID }));
    const winRef = window.open(url.toString(), '_blank');
    // setTimeout(() => {
    //   // winRef.close();
    // }, 1000);
  }


}
