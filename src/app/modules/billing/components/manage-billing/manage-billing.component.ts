// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { VisitService } from 'src/app/modules/patient-booking/services/visit.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-manage-billing',
  templateUrl: './manage-billing.component_new.html',
  styleUrls: ['./manage-billing.component.scss']
})
export class ManageBillingComponent implements OnInit {
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
    private appPopupService: AppPopupService,
    private helper: HelperService,
    private visitService: VisitService,
  ) { }
  spinnerRefs = {
    listSection: 'listSection',
    listSectionBill: 'listSectionBill',
    formSection: 'formSection',
    panelsDropdown: 'panelsDropdown'

  }
  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };

  noDataMessage = 'Please search';
  noDataMessageBill = 'Please search';
  noDataMessageGeneratedBill = 'Please search';
  inValidDateRange = false;
  isSubmittedValue = false;
  panelsList = [];
  loggedInUser: UserModel;
  ngOnInit(): void {
    this._form.patchValue({
      dateFrom: Conversions.getCurrentDateObjectNew(),
      dateTo: Conversions.getCurrentDateObject()
    });
    this._formWorklist.patchValue({
      startDate: Conversions.getCurrentDateObjectNew(),
      endDate: Conversions.getEndDateObjectNew()
    });
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getPanels();
    this.getPanelBillStatus();
    this.getPanelAddOnService();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  _form = this.fb.group({
    dateFrom: [null as any],
    dateTo: [null as any],
    // PanelId: [{ value: 1714, disabled: true }],//For live GIZ
    // PanelId: [{ value: 975, disabled: true }], // For stg. TEC
    PanelId: [null,],
    BranchID: [null,]
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

  showChildRows: boolean[] = [];

  toggleChildRows(index: number) {
    this.showChildRows[index] = !this.showChildRows[index];
  }

  toggleChildRowsGenerated(index: number) {
    this.showChildRows[index] = !this.showChildRows[index];
  }

  toggleChildRowsFromButton(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.toggleChildRows(index);
  }
  toggleChildRowsFromButtonGenerated(index: number, event: MouseEvent) {
    this.rowIndexBillDetail = index;
    event.stopPropagation();
    this.toggleChildRowsGenerated(index);
  }


  copyText(text: any, i = null) {
    let pin = text.AccNo
    this.helper.copyMessage(pin);
  }

  filteredData: any[]; // Initialize an array to hold filtered data
  // Function to perform filtering
  applyFilter(searchText: string) {
    this.filteredData = this.generatedPanelVisitsData.filter(item =>
      item.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.RegNo.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.RefNo && item.RefNo.toLowerCase().includes(searchText.toLowerCase()))
    );
  }
  applyFilterNew(searchText: string) {
    this.filteredData = this.panelVisitsData.filter(item =>
      item.Name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.RegNo.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.RefNo && item.RefNo.toLowerCase().includes(searchText.toLowerCase()))
    );
  }
  searchTextNewBill = "";
  searchTextGeneratedBill = "";
  branchList: any = [];
  selectedPanel = 1714;
  searchText = "";
  searchTextBill = "";
  rowIndex = null;
  disabledButton = false;
  disabledButtonDraft = false;
  disabledButtonSrv = false;
  disabledButtonSearchBill = false;
  isSpinner = true;
  isSpinnerDraft = true;
  isSpinnerSrv = true;
  isSpinnerSearchBill = true;
  getBranches() {
    this.sharedService.getData(API_ROUTES.LOOKUP_GET_BRANCHES, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.branchList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  panelBillStatusList = [];
  getPanelBillStatus() {
    this.sharedService.getData(API_ROUTES.GET_PANEL_BILL_STATUS, {}).subscribe((resp: any) => {
      if (resp.PayLoad) {
        this.panelBillStatusList = resp.PayLoad || [];
      }
    }, (err) => { console.log(err) })
  }

  getPanels() {
    this.panelsList = [];
    let _params = {
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
        // console.log("Panels list is__________",this.panelsList)
        // if (this.panelIdFromBookingId || this.panelIdFromVisitInfo) { //here
        //   this.convertSelectedTestProfiles({ PanelId: this.panelIdFromBookingId || this.panelIdFromVisitInfo });
        // }


        // setTimeout(() => {
        let panelID = this.panelsList.find(panel => panel.PanelId === 1714);
        if (panelID) {
          this._form.get('PanelId').setValue(1714);
          this._form.get('PanelId').disable();
        } else {
          this._form.get('PanelId').setValue(null);
          this._form.get('PanelId').enable();
        }
        // }, 200);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.panelsDropdown);
      console.log(err);
      this.toastr.error("Something went wrong.");
    });
  }
  disabledButtonSearch: boolean = false;
  isSpinnerSearch: boolean = true;
  BranchID = null;
  disabledVal = true;
  panelVisitsData: any[] = []; // Assuming you have data assigned to this variable
  totalSum = 0;
  getPanelVisitsForBilling() {
    let formValues = this._form.getRawValue();
    // Get the form values for dateFrom and dateTo
    const dateFrom: any = formValues.dateFrom;
    const dateTo: any = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isSubmittedValue = true;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 45;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = maxDaysDifference;
      this.toastr.error(`The difference between dates should not exceed ${period} Days`);
      this.isSubmittedValue = true;
      return;
    }

    this.BranchID = formValues.BranchID || -1;
    this.selectedPanel = formValues.PanelId || null;
    this._form.markAllAsTouched();
    let objParams = {
      FromDate: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      ToDate: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      PanelID: formValues.PanelId ? formValues.PanelId : -1,
      LocID: formValues.BranchID || -1,
    };
    this.spinner.show(this.spinnerRefs.listSection);
    this.disabledButtonSearch = true;
    this.isSpinnerSearch = false;
    this.sharedService.getData(API_ROUTES.GET_PANEL_VISITS_FOR_BILLING, objParams).subscribe((resp: any) => {
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      this.isSubmittedValue = false;
      this.spinner.hide(this.spinnerRefs.listSection);
      if (resp && resp.StatusCode == 200) {
        let response = resp.PayLoad;
        this.totalSum = response.reduce((sum, obj) => {
          if (obj.invData) {
            sum += obj.invData.reduce((innerSum, innerObj) => innerSum + innerObj.NetAmount, 0);
          } else {
            sum += obj.TotalAmt || 0;
          }
          return sum;
        }, 0);


        let res = response.reduce((re, o) => {
          let existObj = re.find(obj => obj.PatientId === o.PatientId);
          let amt = 0;
          if (existObj) {
            existObj.invData.push({
              VisitId: o.VisitId,
              ReceiptNo: o.ReceiptNo,
              AccNo: o.AccNo,
              PatientId: o.PatientId,
              RegNo: o.RegNo,
              Name: o.Name,
              Phone: o.Remarks,
              Remarks: o.Remarks,
              PanelId: o.PanelId,
              PnlCode: o.PnlCode,
              PanelName: o.PanelName,
              Company: o.Company,
              CreatedOn: o.CreatedOn,
              VisitDate: o.VisitDate,
              NetAmount: o.NetAmount,
              DiscAmount: o.DiscAmount,
              PanelPatientVisitStatusId: o.PanelPatientVisitStatusId,
              LocCode: o.LocCode,
              RegBy: o.RegBy,
              PatientVisitStatus: o.PatientVisitStatus
            });
            // amt += o.NetAmount;
            // existObj.TotalAmt = amt.toLocaleString();
            existObj.isValid = this.checkValidity(existObj.invData); // Call checkValidity function
          } else {
            re.push({
              PatientId: o.PatientId,
              PanelId: o.PanelId,
              Name: o.Name,
              RegNo: o.RegNo,
              VisitDate: o.VisitDate,
              RefNo: o.RefNo,
              TotalAmt: o.NetAmount,
              invData: [{
                VisitId: o.VisitId,
                ReceiptNo: o.ReceiptNo,
                AccNo: o.AccNo,
                PatientId: o.PatientId,
                RegNo: o.RegNo,
                Name: o.Name,
                Phone: o.Remarks,
                Remarks: o.Remarks,
                PanelId: o.PanelId,
                PnlCode: o.PnlCode,
                PanelName: o.PanelName,
                Company: o.Company,
                CreatedOn: o.CreatedOn,
                VisitDate: o.VisitDate,
                NetAmount: o.NetAmount,
                DiscAmount: o.DiscAmount,
                PanelPatientVisitStatusId: o.PanelPatientVisitStatusId,
                LocCode: o.LocCode,
                RegBy: o.RegBy,
                PatientVisitStatus: o.PatientVisitStatus
              }],
              isValid: this.checkValidity([o]) // Call checkValidity function with single-element array
            });
          }
          return re;
        }, []);
        // Calculate TotalAmt for each patient
        res.forEach(patient => {
          patient.TotalAmt = patient.invData.reduce((total, item) => total + item.NetAmount, 0);
          patient.TotalAmt = patient.TotalAmt.toLocaleString(); // Format total amount
        });

        // Assign the result to panelVisitsData
        this.panelVisitsData = res;
        // console.log("panelVisitsData Formated: ", this.panelVisitsData)
        if (!this.panelVisitsData.length) {
          this.noDataMessage = "No record found";
        }
        // console.log("panelVisitsData____________", this.panelVisitsData)
      }
    }, (err) => {
      console.log(err)
      this.toastr.error("Something went wrong. " + err.statusText)
      this.disabledButtonSearch = false;
      this.isSpinnerSearch = true;
      this.spinner.hide(this.spinnerRefs.listSection);
    })
  }
  checkValidity(invData) {
    return 1; //bypass the check due to allow the unverified visits also due to the new requirements
    if (invData) {
      // Check if any element in invData has PatientVisitStatus equal to 0
      const hasZeroStatus = invData.some(item => item.PatientVisitStatus === 0);
      // Return 0 if any element has PatientVisitStatus equal to 0, otherwise return 1
      return hasZeroStatus ? 0 : 1;
    } else {
      // Return 1 if invData is null or undefined
      return 1;
    }
  }

  selectAllMainAndchildRows(e: MatCheckboxChange) {
    const checked = e.checked;
    this.panelVisitsData.forEach(parentRow => {
      parentRow.checked = checked;
      if (parentRow.invData && parentRow.invData.length > 0) {
        parentRow.invData.forEach(childRow => {
          childRow.checked = checked;
        });
      }
    });
    this.onCheckboxChange();
  }

  selectAllChildRows(parentRowIndex: number, e: MatCheckboxChange) {
    const checked = e.checked;
    const parentRow = this.panelVisitsData[parentRowIndex];
    if (parentRow.invData && parentRow.invData.length > 0) {
      parentRow.invData.forEach(childRow => {
        childRow.checked = checked;
      });
    }
    this.onCheckboxChange();
  }

  selectAllGeneratedChildRows(parentRowIndex: number, e: MatCheckboxChange) {
    const checked = e.checked;
    const parentRow = this.generatedPanelVisitsData[parentRowIndex];
    if (parentRow.invData && parentRow.invData.length > 0) {
      parentRow.invData.forEach(childRow => {
        childRow.checked = checked;
      });
    }
    this.onCheckboxChangeGenerated();
  }

  showUnverifiedVisitMessage() {
    this.toastr.error("This MRN has un-verified Lab Servie/s (Visit/s) shown in red. Please verify visits and try again", "Validation Error!");
  }


  selectedCount: number = 0;
  flexCheckDisabled = false;
  onCheckboxChange_() {
    // chek for the max limit of a data packet
    let totalSum: any = 0;
    this.selectedCount = this.panelVisitsData.filter(row => row.checked).length;

    this.panelVisitsData.forEach(parentRow => {
      // Check if the parentRow is checked
      if (parentRow.checked) {
        // If checked, iterate over invData to sum NetAmount
        if (parentRow.invData) {
          parentRow.invData.forEach(childRow => {
            totalSum += childRow.NetAmount;
          });
        }
        // Add TotalAmt value if present
        else {
          totalSum += parentRow.TotalAmt || 0;
        }
      }
    });

    // Update totalSum variable
    this.totalSum = totalSum;
    this.totalSum = totalSum.toLocaleString();
    if (this.selectedCount >= 20) {
      this.toastr.warning('You can only select up to 20 patients.', 'Maximum limit is 20');
      this.flexCheckDisabled = true;
    }
  }
  onCheckboxChange() {
    // Initialize totalSum
    let totalSum: any = 0;
    this.selectedCount = this.panelVisitsData.filter(row => row.checked).length;

    // Iterate over each parent row
    this.panelVisitsData.forEach(parentRow => {
      // Check if the parentRow is checked
      if (parentRow.checked) {
        // If checked, iterate over invData to sum NetAmount
        if (parentRow.invData) {
          parentRow.invData.forEach(childRow => {
            totalSum += childRow.NetAmount;
          });
        }
        // Add TotalAmt value if present
        else {
          totalSum += parentRow.TotalAmt || 0;
        }
        if (this.selectedCount >= 20) {
          this.toastr.warning('You can only select up to 20 patients.', 'Maximum limit is 20');
          this.flexCheckDisabled = true;
        }
      }
    });

    // Set the total sum
    this.totalSum = totalSum;
  }
  onCheckboxChangeGenerated() {
    // Initialize totalSum
    let totalSum: any = 0;
    this.selectedCount = this.generatedPanelVisitsData.filter(row => row.checked).length;
    // Iterate over each parent row
    this.generatedPanelVisitsData.forEach(parentRow => {
      // Check if the parentRow is checked
      if (parentRow.checked) {
        // If checked, iterate over invData to sum NetAmount
        if (parentRow.invData) {
          parentRow.invData.forEach(childRow => {
            totalSum += childRow.NetAmount;
          });
        }
        // Add TotalAmt value if present
        else {
          totalSum += parentRow.TotalAmt || 0;
        }
        if (this.selectedCount >= 20) {
          this.toastr.warning('You can only select up to 20 patients.', 'Maximum limit is 20');
          this.flexCheckDisabled = true;
        }
      }
    });

    // Set the total sum
    this.BillNetAmout = totalSum;
  }
  selectedVisitID = null;
  selectedVisitNo = null;
  showVisitDocs(visitID, visitNo) {
    this.selectedVisitID = null;
    this.selectedVisitNo = null;
    this.selectedVisitID = visitID;
    this.selectedVisitNo = visitNo;
    setTimeout(() => {
      this.patientVisitDocsRef = this.appPopupService.openModal(this.patientVisitDocs, { size: 'lg' });
    }, 100);
  }
  invoiceCopyType = 1;
  openInvoice(VisitID) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: VisitID, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (this.invoiceCopyType || 0), timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
    // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }

  Remarks = ""
  insertUpdatePanelBill(status) {
    if (!this.PanelBillID) {
      this.insertPanelBill(status);
    } else {
      this.updatePanelBill(status);
    }
  }

  insertPanelBill(status) {
    let isFinal = status;
    let formValues = this._form.getRawValue();
    this.BranchID = formValues.BranchID || null;
    this.selectedPanel = formValues.PanelId || null;
    this._form.markAllAsTouched();

    // Initialize an empty array to store the filtered data
    let filteredData: any[] = [];
    let sumNetAmount: number = 0; // Initialize the sum variable

    // Loop through each item in the PandelVisitsData array
    for (const item of this.panelVisitsData) {
      // Check if the current item has the property 'invData'
      if (item.hasOwnProperty('invData')) {
        // Loop through the 'invData' array of the current item
        for (const invDataItem of item.invData) {
          // Check if the current 'invData' item has the 'checked' property set to true
          if (invDataItem.checked === true) {
            // Add the current 'invData' item to the filtered data array
            filteredData.push(invDataItem);
            sumNetAmount += invDataItem.NetAmount;
          }
        }
      }
    }
    let checkFiltered = this.panelVisitsData.filter(a => a.checked);
    // console.log("🚀 ~ ManageBillingComponent ~ insertPanelBill ~ checkFiltered:", checkFiltered)
    if (!checkFiltered.length) {
      this.toastr.info("Please select any patient to generate the bill", "No Patient Selected!");
      return;
    }
    // console.log("🚀 ~ ManageBillingComponent ~ insertPanelBill ~ filteredData:", filteredData)
    if (!filteredData.length) {
      this.toastr.info("Please select any patient to generate the bill", "No Patient Selected!");
      return;
    }
    // Output the filtered data
    // Get the current date and time for BillMonth
    let currentDate = moment().format('YYYY-MM-DD'); // Get current date in YYYY-MM-DD format
    // Create the desired format
    let billMonth = `${currentDate}T00:00:00+05:00`; // Concatenate the current date with the desired time and offset
    let objParam = {
      PanelBillNewID: this.PanelBillID,
      PanelID: formValues.PanelId,
      // RefNo: filteredData[0].RefNo,
      BillFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      BillTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      NetAmount: sumNetAmount,
      StatusId: 1,
      Remarks: this.Remarks,
      BillMonth: billMonth,
      isFinal: isFinal,
      CreatedBy: this.loggedInUser.userid || -99,
      tblPanelBillVisit: filteredData.map(a => {
        return {
          PanelBillNewID: '',//DB Generated
          PanelBillDetailExtNewID: a.PanelBillDetailExtNewID || null,
          VisitID: Number(a.VisitId) || 0,
          TPID: a.TPID || null,
          PatientID: a.PatientId,
          PanelAddOnServiceID: a.PanelAddOnServiceID || null,
          Price: a.NetAmount,
          PanelAddOnServiceDate: a.PanelAddOnServiceDate ? Conversions.formatDateISOObject(a.PanelAddOnServiceDate) : null,
        }
      })
    }
    // console.log("objParams________________", objParam); return;
    if (isFinal) {
      this.disabledButton = true;
      this.isSpinner = false;
    } else {
      this.disabledButtonDraft = true;
      this.isSpinnerDraft = false;
    }
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_PANEL_BILL, objParam).subscribe((resp: any) => {
      if (isFinal) {
        this.disabledButton = false;
        this.isSpinner = true;
      } else {
        this.disabledButtonDraft = false;
        this.isSpinnerDraft = true;
      }
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          let result = JSON.parse(resp.PayLoadStr)
          if(result[0].Result == 2){
            this.toastr.error('The selected visit has already been included in an existing bill. Duplicate billing is not allowed.','Duplicated Bill');
            this.selectedCount = 0;
            this.totalSum = 0;
            this.Remarks = "";
            this.BillStatus = null;
            this.BillNetAmout = 0;
            this.BillPanelID = 0;
            this.resetForm();
            this.getPanelVisitsForBilling();
            this.getPanelBill(null, null);
            return;
          }
          this.toastr.success(resp.Message);
          // if (isFinal) {
          this.selectedCount = 0;
          this.totalSum = 0;
          this.Remarks = "";
          this.BillStatus = null;
          this.BillNetAmout = 0;
          this.BillPanelID = 0;
          this.resetForm();
          this.getPanelVisitsForBilling();
          this.getPanelBill(null, null);
          // }
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          if (isFinal) {
            this.disabledButton = false;
            this.isSpinner = true;
          } else {
            this.disabledButtonDraft = false;
            this.isSpinnerDraft = true;
          }
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.toastr.error("Something went wrong. " + err.statusText)
      if (isFinal) {
        this.disabledButton = false;
        this.isSpinner = true;
      } else {
        this.disabledButtonDraft = false;
        this.isSpinnerDraft = true;
      }
    })
  }

  InsertUpdatePanelBillVisitIDServiceID(row) {
    // console.log("InsertUpdatePanelBillVisitIDServiceID ~ row:", row)
    let filteredData: any[] = [];

    filteredData = row.invData.filter(a => a.checked);
    // console.log("filteredData:", filteredData)
    let objParam = {
      PanelBillNewID: this.PanelBillID,
      BillNo: this.BillNo,
      CreatedBy: this.loggedInUser.userid || -99,
      tblPanelBillVisit: filteredData.map(a => {
        return {
          PanelBillNewID: this.PanelBillID,
          PanelBillDetailExtNewID: a.PanelBillDetailExtNewID || null,
          VisitID: Number(a.VisitId) || 0,
          TPID: a.TPID || null,
          PatientID: a.PatientId,
          PanelAddOnServiceID: a.PanelAddOnServiceID || null,
          Price: a.NetAmount,
          PanelAddOnServiceDate: a.PanelAddOnServiceDate ? Conversions.formatDateISOObject(a.PanelAddOnServiceDate) : null,
        }
      })
    }
    console.log("objParams________________", objParam);
 
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_PANEL_BILL_VISITID_SERVICEID, objParam).subscribe((resp: any) => {
      console.log("insertUpdateData ~ resp:", resp)
      if (resp.PayLoad.length) {
        if (resp.StatusCode == 200 && resp.PayLoad[0].Result == 1) {
          this.toastr.success("Panel bill saved as draft successfully");
          // this.selectedCount = 0;
          // this.totalSum = 0;
          // this.Remarks = "";
          // this.BillStatus = null;
          // this.BillNetAmout = 0;
          // this.BillPanelID = 0;
          // this.resetForm();
          // this.getPanelVisitsForBilling();
          // this.getPanelBill(null, null);
        } else if(resp.StatusCode == 200 && resp.PayLoad[0].Result == 2){
          this.toastr.error('The selected visit has already been included in an existing bill. Duplicate billing is not allowed.','Duplicated Bill');
          this.resetForm();
          this.getPanelVisitsForBilling();
          this.getPanelBill(null, null);
        }
         else {
          this.toastr.error('Something went wrong! Please contact system support.')
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.toastr.error("Something went wrong. " + err.statusText)
    })
  }
  PanelBillIDReload = null;
  updatePanelBill(status) {
    let isFinal = status;
    if (this.isTPCancel && isFinal) {
      this.toastr.error("This Bill has some cancelled test(s) remove the visit before finalizing it.");
      return;
    }

    let formValues = this._form.getRawValue();
    this.BranchID = formValues.BranchID || null;
    this.selectedPanel = formValues.PanelId || null;
    this._form.markAllAsTouched();
    // Initialize an empty array to store the filtered data
    let filteredData: any[] = [];
    let sumNetAmount: number = 0; // Initialize the sum variable

    // Loop through each item in the PandelVisitsData array
    for (const item of this.generatedPanelVisitsData) {
      // Check if the current item has the property 'invData'
      if (item.hasOwnProperty('invData')) {
        // Loop through the 'invData' array of the current item
        for (const invDataItem of item.invData) {
          // Check if the current 'invData' item has the 'checked' property set to true
          if (invDataItem.checked === true) {
            // Add the current 'invData' item to the filtered data array
            filteredData.push(invDataItem);
            sumNetAmount += invDataItem.NetAmount;
          }
        }
      }
    }
    let checkFiltered = this.generatedPanelVisitsData.filter(a => a.checked);
    if (!checkFiltered.length) {
      this.toastr.info("Please select any patient to generate the bill", "No Patient Selected!");
      return;
    }
    if (!filteredData.length) {
      this.toastr.info("Please select any patient to generate the bill", "No Patient Selected!");
      return;
    }
    // console.log("filtered Data______", filteredData);// return;
    // Output the filtered data
    // console.log("panelVisitsDataFiltered________________",filteredData);
    // Get the current date and time for BillMonth
    let currentDate = moment().format('YYYY-MM-DD'); // Get current date in YYYY-MM-DD format
    // Create the desired format
    let billMonth = `${currentDate}T00:00:00+05:00`; // Concatenate the current date with the desired time and offset
    let objParam = {
      PanelBillNewID: this.PanelBillID,
      PanelID: formValues.PanelId,
      // RefNo: filteredData[0].RefNo,
      BillFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      BillTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      NetAmount: sumNetAmount,
      StatusId: 1,
      Remarks: this.Remarks,
      BillMonth: billMonth,
      isFinal: isFinal,
      CreatedBy: this.loggedInUser.userid || -99,
      tblPanelBillVisit: filteredData.map(a => {
        return {
          PanelBillNewID: this.PanelBillID,//for edit the existing
          PanelBillDetailExtNewID: a.PanelBillDetailExtNewID || null,
          VisitID: a.VisitId ? Number(a.VisitId) : 0,
          TPID: a.TPID || null,
          PatientID: a.PatientId,
          PanelAddOnServiceID: a.PanelAddOnServiceID || null,
          Price: a.NetAmount,
          PanelAddOnServiceDate: a.PanelAddOnServiceDate ? Conversions.formatDateISOObject(a.PanelAddOnServiceDate) : null,
        }
      })
    }
    // console.log("objParams________________", objParam); return;
    if (isFinal) {
      this.disabledButton = true;
      this.isSpinner = false;
    } else {
      this.disabledButtonDraft = true;
      this.isSpinnerDraft = false;
    }
    this.sharedService.insertUpdateData(API_ROUTES.INSERT_PANEL_BILL, objParam).subscribe((resp: any) => {
      if (isFinal) {
        this.disabledButton = false;
        this.isSpinner = true;
      } else {
        this.disabledButtonDraft = false;
        this.isSpinnerDraft = true;
      }
      if (JSON.parse(resp.PayLoadStr).length) {
        if (resp.StatusCode == 200) {
          this.PanelBillIDReload = this.PanelBillID;
          let result = JSON.parse(resp.PayLoadStr)
          if(result[0].Result == 2){
            this.toastr.error('The selected visit has already been included in an existing bill. Duplicate billing is not allowed.','Duplicated Bill');
            this.selectedCount = 0;
            this.totalSum = 0;
            this.Remarks = "";
            this.BillStatus = null;
            this.BillNetAmout = 0;
            this.BillPanelID = 0;
            this.resetForm();
            this.getPanelVisitsForBilling();
            this.getPanelBill(null, null);
            return;
          }
          this.toastr.success(resp.Message);
          if (isFinal || this.isTPCancel) {
            this.selectedCount = 0;
            this.totalSum = 0;
            this.Remarks = "";
            this.BillStatus = null;
            this.BillNetAmout = 0;
            this.BillPanelID = 0;
            this.getPanelVisitsForBilling();
            if (this.PanelBillIDReload) {
              let row = this.panelBills.find(a => a.PanelBillNewID == this.PanelBillIDReload);
              this.getPanelBill(row, this.rowIndex);
            } else {
              this.getPanelBill(null, null);
            }
            this.getPanelBill(null, null);
          }
        } else {
          this.toastr.error('Something went wrong! Please contact system support.')
          if (isFinal) {
            this.disabledButton = false;
            this.isSpinner = true;
          } else {
            this.disabledButtonDraft = false;
            this.isSpinnerDraft = true;
          }
        }
      }
    }, (err) => {
      console.log(err);
      this.toastr.error("Something went wrong. " + err.statusText)
      this.toastr.error('Connection error');
      if (isFinal) {
        this.disabledButton = false;
        this.isSpinner = true;
      } else {
        this.disabledButtonDraft = false;
        this.isSpinnerDraft = true;
      }
    })
  }

  setIsNew() {
    this.isNew = true;
    this.rowIndex = null;
    this.rowIndexBillDetail = null;
    this.panelVisitsData = [];
    this.PanelBillID = null;
    this.showChildRows = [];
    this.selectedCount = 0;
    this.Remarks = null;
    this.BillStatus = null;
    this.BillNetAmout = 0;
    this.BillPanelID = 0;
    this.BillGeneratingDate = null;
    this.BillNo = null;
    this.isFinal = null;
    this.panelVisitsData = [];
    this.generatedPanelVisitsData = [];
  }

  newBill() {
    this.rowIndex = null;
    this.rowIndexBillDetail = null;
    this.panelVisitsData = [];
    this.PanelBillID = null;
    this.showChildRows = [];
    this.selectedCount = 0;
    this.Remarks = null;
    this.BillStatus = null;
    this.BillNetAmout = 0;
    this.BillPanelID = 0;
    this.BillGeneratingDate = null;
    this.BillNo = null;
    this.isFinal = null;
    this.panelVisitsData = [];
    this.generatedPanelVisitsData = [];
  }

  resetForm() {
    this.rowIndex = null;
    this.rowIndexBillDetail = null;
    this.panelVisitsData = [];
    this.PanelBillID = null;
    this.showChildRows = [];
    this.selectedCount = 0;
    this.Remarks = null;
    this.BillStatus = null;
    this.BillNetAmout = 0;
    this.BillPanelID = 0;
    this.BillGeneratingDate = null;
    this.BillNo = null;
    this.isFinal = null;
    this.panelVisitsData = [];
    this.generatedPanelVisitsData = [];
  }

  panelBills = [];
  panelBillDetail = [];
  PanelBillID = null;
  BillRemarks = ""
  BillStatus = null;
  BillNetAmout = 0;
  BillPanelID = null;
  BillGeneratingDate: any = null;
  BillNo: any = null;
  isFinal: any = null;
  isTPCancel = false;
  getPanelBill(row, i) {
    // console.log("romw _____________", row)
    this.isFinal = (row && row.isFinal)? row.isFinal : null;
    this.isTPCancel = row ? row.isTPCancel : false;
    this.generatedPanelVisitsData = [];
    this.panelVisitsData = [];
    // this.panelBills = [];
    this.BillNo = (row && row.BillNo)? row.BillNo : null;;
    this.showChildRows = [];
    this.rowIndex = i;
    this.rowIndexBillDetail = null;
    this.PanelBillID = row ? row.PanelBillNewID : null;
    let formValues = this._formWorklist.getRawValue();

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
    let objParams = {
      FromDate: formValues.startDate ? Conversions.formatDateObject(formValues.startDate) : null,
      ToDate: formValues.endDate ? Conversions.formatDateObject(formValues.endDate) : null,
      PanelID: formValues.PanelId ? formValues.PanelId : null,
      PanelBillStatusID: formValues.PanelBillStatusID,
      PanelBillID: this.PanelBillID,
      MRN: formValues.PatientMRN || null,
    };
    if (!objParams.PanelBillID) {
      this.spinner.show(this.spinnerRefs.listSectionBill);
      this.disabledButtonSearchBill = true;
      this.isSpinnerSearchBill = false;
    }
    this.sharedService.getData(API_ROUTES.GET_PANEL_BILL_NEW, objParams).subscribe((resp: any) => {
      if (!objParams.PanelBillID) {
        this.disabledButtonSearchBill = false;
        this.isSpinnerSearchBill = true;
        this.spinner.hide(this.spinnerRefs.listSectionBill);
      }
      if (resp && resp.StatusCode == 200) {
        let response = resp.PayLoad;
        // console.log("resp is : ",response)
        // console.log("resp[0] is : ",response[0])
        if (!response.length) {
          this.noDataMessageBill = "No record found";
        }
        if (!objParams.PanelBillID) {
          this.panelBills = response;
          if (this.panelBills.length) {
            this.PanelBillID = this.panelBills[0].PanelBillNewID;
            this.Remarks = this.panelBills[0].Remarks;
            // this.BillStatus = this.panelBills[0].BillStatus;
            this.BillStatus = this.panelBills[0].isFinal ? 'Finalized' : 'Drafted';
            let BillNetAmoutRaw = this.panelBills[0].NetAmount || 0;
            this.BillNetAmout = BillNetAmoutRaw.toLocaleString();
            this.BillPanelID = this.panelBills[0].PanelId || 0;
            this.BillGeneratingDate = this.panelBills[0].BillGeneratingDate || null;
            // this.BillNo = this.panelBills[0].BillNo || null;
            // this.isFinal = this.panelBills[0].isFinal || null;
            // this.rowIndex = 0;
          }
          // console.log("we are in if and isFinal is : ", this.isFinal)
        } else {
          this.panelBillDetail = response[0];
          this.Remarks = this.panelBillDetail['Remarks'];
          this.BillStatus = this.panelBillDetail['BillStatus'];
          this.BillStatus = this.panelBillDetail['isFinal'] ? 'Finalized' : 'Drafted';
          let BillNetAmoutRaw = this.panelBillDetail['NetAmount'] || 0;
          this.BillNetAmout = BillNetAmoutRaw.toLocaleString();
          this.BillPanelID = this.panelBillDetail['PanelId'] || 0;
          this.BillGeneratingDate = this.panelBillDetail['BillGeneratingDate'] || null;
          // this.BillNo = this.panelBillDetail['BillNo'] || null;
          // this.isFinal = this.panelBillDetail['isFinal'] || null;
          // console.log("we are in else and isFinal is : ", this.isFinal)
        }
        setTimeout(() => {
          if ((this.isFinal || this.isTPCancel) && this.rowIndex != null) {
            this.getPanelBillDetail();
          }
          if (!this.isFinal && this.rowIndex != null) {
            this.loadData();
          }
        }, 200);
      }
      this.inValidDateRange = false;
    }, (err) => {
      console.log(err)
      this.toastr.error("Something went wrong. " + err.statusText)
      if (!objParams.PanelBillID) {
        this.disabledButtonSearchBill = false;
        this.isSpinnerSearchBill = true;
        this.spinner.hide(this.spinnerRefs.listSectionBill);
      }
    })
           
  }


  isNew = true;
  generatedPanelVisitsData: any[] = [];
  getPanelBillDetail() {
    this.isNew = false;
    let objParams = {
      PanelBillID: this.PanelBillIDReload ? this.PanelBillIDReload : this.PanelBillID
    };

    this.spinner.show(this.spinnerRefs.listSection);

    this.sharedService.getData(API_ROUTES.GET_PANEL_BILL_DETAIL, objParams).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.listSection);

      if (resp && resp.StatusCode == 200) {
        let response = resp.PayLoad;

        if (!response.length) {
          this.noDataMessageGeneratedBill = 'No record found.';
          return;
        }

        // 🔄 Map-based transformation for optimal grouping
        const patientMap = new Map();

        response.forEach(o => {
          const patientId = o.PatientId;
          const refNoPresent = o.RefNo !== null && o.RefNo !== undefined && o.RefNo !== '';

          const invEntry = {
            VisitId: o.VisitId,
            ReceiptNo: o.ReceiptNo,
            AccNo: o.AccNo,
            PatientId: o.PatientId,
            RegNo: o.RegNo,
            Name: o.Name,
            Phone: o.Phone,
            Remarks: o.Remarks,
            PanelID: o.PanelID,
            PnlCode: o.PnlCode,
            PanelName: o.PanelName,
            Company: o.Company,
            CreatedOn: o.CreatedOn,
            VisitDate: o.VisitDate,
            NetAmount: o.NetAmount,
            DiscAmount: o.DiscAmount,
            PanelPatientVisitStatusId: o.PanelPatientVisitStatusId,
            LocCode: o.LocCode,
            RegBy: o.RegBy,
            RefNo: o.RefNo,
            PanelAddOnServiceID: o.PanelAddOnServiceID,
            PanelBillDetailExtNewID: o.PanelBillDetailExtNewID,
            PanelAddOnServiceDate: o.PanelAddOnServiceDate,
            ServiceName: o.PanelAddOnService,
            PatientVisitStatus: o.PatientVisitStatus,
            checked: true
          };

          if (patientMap.has(patientId)) {
            const existObj = patientMap.get(patientId);
            existObj.invData.push(invEntry);

            // 🔄 Set RefNo if it wasn't already set
            if ((!existObj.RefNo || existObj.RefNo === '') && refNoPresent) {
              existObj.RefNo = o.RefNo;
            }

            // Update validity
            existObj.isValid = this.checkValidity(existObj.invData);
          } else {
            // Create new group
            patientMap.set(patientId, {
              PatientId: o.PatientId,
              PanelId: o.PanelID,
              Name: o.Name,
              RegNo: o.RegNo,
              VisitDate: o.VisitDate,
              RefNo: refNoPresent ? o.RefNo : '',
              TotalAmt: 0,
              checked: true,
              invData: [invEntry],
              isValid: this.checkValidity([o])
            });
          }
        });

        // Convert map to array and compute total amount
        let res = Array.from(patientMap.values());
        res.forEach(patient => {
          const total = patient.invData.reduce((sum, item) => sum + (item.NetAmount || 0), 0);
          patient.TotalAmt = total.toLocaleString();
        });

        this.generatedPanelVisitsData = res;
        console.log("generatedPanelVisitsData: ", this.generatedPanelVisitsData);

      }
    }, (err) => {
      console.log(err);
      this.toastr.error("Something went wrong. " + err.statusText);
      this.spinner.hide(this.spinnerRefs.listSection);
    });
  }


  printPanleBillsummaryReport() {
    const url = environment.patientReportsPortalUrl + 'panel-bill-summary?p=' + btoa(JSON.stringify({ PanelBillID: this.PanelBillID, BillNo: this.BillNo, BillGeneratingDate: this.BillGeneratingDate, BillPanelID: this.BillPanelID }));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    let winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);

  }
  printPanleBillPatientWiseReport(parentRow) {
    let obj = {
      PatientID: parentRow.PatientId,
      PanelBillID: this.PanelBillID,
      BillNo: this.BillNo,
      BillGeneratingDate: this.BillGeneratingDate,
      BillPanelID: this.BillPanelID,
      PatientName: parentRow.Name,
      RegNo: parentRow.RegNo,
      RefNo: parentRow.RefNo,
      isFinal: this.isFinal,
    }
    const url = environment.patientReportsPortalUrl + 'panel-bill-patient-wise-summary?p=' + btoa(JSON.stringify(obj));
    // let winRef = window.open(url.toString(), '_blank', 'resizable,height=700,width=900');
    let winRef = window.open(url.toString(), '_blank');
    setTimeout(() => {
      // winRef.close();
    }, 1000);
  }
  panelAddOnServices = [];
  srvIndex = null;
  getPanelAddOnService() {
    this.sharedService.getData(API_ROUTES.GET_PANEL_ADDON_SERVICE, {}).subscribe((resp: any) => {
      if (resp.StatusCode == 200) {
        this.panelAddOnServices = resp.PayLoad || [];
      }
    }, (err) => { console.log(err) })

  }


  addedItems: any[] = [];
  parentRow = {}
  rowIndexBillDetail = null;
  openPanelAddOnServicesModal(index: number, parentRow, type) {
    if (!parentRow.isValid) {
      this.toastr.error("This Patient have some Unverified visits so you can't add services", "Unverified Visits");
      return;
    }
    this.type = type;
    this.rowIndexBillDetail = index;
    this.parentRow = parentRow;
    this.srvIndex = index;
    this.addedItems = (this.panelVisitsData[index].invData || []).filter(item => !item.VisitId);
    this.panelAddOnServices.forEach(service => {
      const matchedItem = this.addedItems.find(item => item.PanelAddOnServiceID === service.PanelAddOnServiceID);
      // if (matchedItem) {
      //   service.checked = true;
      //   service.Price = matchedItem.NetAmount; // Assuming the price is stored in the NetAmount property
      // } else {
      service.checked = false; // Uncheck items not present in addedItems
      service.Price = null; // Reset price for unchecked items
      service.PanelAddOnServiceDate = null; // Reset PanelAddOnServiceDate for unchecked items
      // }
    });
    this.panelAddOnServicesModalRef = this.appPopupService.openModal(this.panelAddOnServicesModal, { backdrop: 'static', size: "lg" });
  }

  type = null;//1:Add item to new bill dataset,, 2: add to Generated bill data set
  openPanelGeneratedAddOnServicesModal(index: number, parentRow, type) {
    if (this.isFinal) {
      return
    }
    if (!parentRow.isValid) {
      this.toastr.error("This Patient have some Unverified visits so you can't add services", "Unverified Visits");
      return;
    }
    this.type = type;
    this.rowIndexBillDetail = index;
    this.parentRow = parentRow;
    this.srvIndex = index;
    this.addedItems = (this.generatedPanelVisitsData[index].invData || []).filter(item => !item.VisitID);
    this.panelAddOnServices.forEach(service => {
      const matchedItem = this.addedItems.find(item => item.PanelAddOnServiceID === service.PanelAddOnServiceID);
      // if (matchedItem) {
      //   service.checked = true;
      //   service.Price = matchedItem.NetAmount; // Assuming the price is stored in the NetAmount property
      // } else {
      service.checked = false; // Uncheck items not present in addedItems
      service.Price = null; // Reset price for unchecked items
      service.PanelAddOnServiceDate = null; // Reset price for unchecked items
      // }
    });
    this.panelAddOnServicesModalRef = this.appPopupService.openModal(this.panelAddOnServicesModal, { backdrop: 'static', size: "lg" });
  }

  isSubmitted = false;
  appendServices() {
    if (this.type == 1) {
      this.addItems();
    }
    else if (this.type == 2) {
      this.addItemsToGeneratedDataset();
    }
  }

  addItems() {
    this.disabledButtonSrv = true;
    this.isSpinnerSrv = false;
    this.isSubmitted = true;
    let checkedItems = this.panelAddOnServices.filter(a => a.checked);
    if (!checkedItems.length) {
      this.toastr.warning("Please select any service", "No Service Selected");
      this.disabledButtonSrv = false;
      this.isSpinnerSrv = true;
      this.isSubmitted = false;
      return;
    }
    let isValidObj = true;
    checkedItems.forEach(a => {
      if (!a.Price) {
        isValidObj = false;
      }
    })

    if (!isValidObj) {
      this.toastr.error("Please enter price against selected service/s.", "Prices Not Provided");
      this.disabledButtonSrv = false;
      this.isSpinnerSrv = true;
      this.isSubmitted = false;
      return;
    } else {
      // Remove existing invData items without VisitId
      // this.panelVisitsData[this.srvIndex].invData = this.panelVisitsData[this.srvIndex].invData.filter(item => item.VisitId);

      let extraService = checkedItems.map(a => ({
        VisitId: null,
        ReceiptNo: '',
        AccNo: '',
        PatientId: this.parentRow['PatientId'],
        RegNo: '',
        Name: '',
        Phone: null,
        Remarks: '',
        PanelId: this.parentRow['PanelId'],
        PnlCode: '',
        PanelName: '',
        Company: '',
        CreatedOn: '',
        VisitDate: '',
        NetAmount: parseFloat(a.Price), // Convert to number explicitly
        PanelAddOnServiceID: a.PanelAddOnServiceID,
        PanelAddOnServiceDate: a.PanelAddOnServiceDate,
        ServiceName: a.PanelAddOnService,
        DiscAmount: 0,
        PanelPatientVisitStatusId: 1,
        LocCode: '',
        RegBy: null,
        disabled: true, // Checkbox disabled  
        checked: true
      }));

      // Append each extra service to invData
      extraService.forEach(service => {
        this.panelVisitsData[this.srvIndex].invData.push({ ...service });
      });

      // Recalculate TotalAmt for the parent row
      let totalAmt = this.panelVisitsData[this.srvIndex].invData.reduce((total, item) => total + item.NetAmount, 0);
      this.panelVisitsData[this.srvIndex].TotalAmt = totalAmt; // Keep it as a number
      this.isSubmitted = false;
      this.onCheckboxChange();
    }
    this.panelAddOnServicesModalRef.close();
    this.panelAddOnServices.forEach(a => {
      a.checked = false;
      a.Price = null;
      a.PanelAddOnServiceDate = null;
    })
    setTimeout(() => {
      this.disabledButtonSrv = false;
      this.isSpinnerSrv = true;
    }, 100);
  }

  addItemsToGeneratedDataset() {
    this.disabledButtonSrv = true;
    this.isSpinnerSrv = false;
    this.isSubmitted = true;
    let checkedItems = this.panelAddOnServices.filter(a => a.checked);
    // console.log("checkedItems: ",checkedItems)
    if (!checkedItems.length) {
      this.toastr.warning("Please select any service", "No Service Selected");
      this.disabledButtonSrv = false;
      this.isSpinnerSrv = true;
      this.isSubmitted = false;
      return;
    }
    let isValidObj = true;
    checkedItems.forEach(a => {
      if (!a.Price) {
        isValidObj = false;
      }
    })

    if (!isValidObj) {
      this.toastr.error("Please enter price against selected service/s.", "Prices Not Provided");
      this.disabledButtonSrv = false;
      this.isSpinnerSrv = true;
      this.isSubmitted = false;
      return;
    } else {
      // Remove existing invData items without VisitId
      // this.panelVisitsData[this.srvIndex].invData = this.panelVisitsData[this.srvIndex].invData.filter(item => item.VisitId);

      let extraService = checkedItems.map(a => ({
        VisitId: null,
        ReceiptNo: '',
        AccNo: '',
        PatientId: this.parentRow['PatientId'],
        RegNo: '',
        Name: '',
        Phone: null,
        Remarks: '',
        PanelId: this.parentRow['PanelId'],
        PnlCode: '',
        PanelName: '',
        Company: '',
        CreatedOn: '',
        VisitDate: '',
        NetAmount: parseFloat(a.Price), // Convert to number explicitly
        PanelAddOnServiceID: a.PanelAddOnServiceID,
        PanelAddOnServiceDate: a.PanelAddOnServiceDate,
        ServiceName: a.PanelAddOnService,
        DiscAmount: 0,
        PanelPatientVisitStatusId: 1,
        LocCode: '',
        RegBy: null,
        disabled: true, // Checkbox disabled  
        checked: true
      }));
      // console.log("extra service to be append is: ", extraService)
      // Append each extra service to invData
      extraService.forEach(service => {
        this.generatedPanelVisitsData[this.srvIndex].invData.push({ ...service });
      });

      // Recalculate TotalAmt for the parent row
      let totalAmt = this.generatedPanelVisitsData[this.srvIndex].invData.reduce((total, item) => total + item.NetAmount, 0);
      this.generatedPanelVisitsData[this.srvIndex].TotalAmt = totalAmt; // Keep it as a number
      this.isSubmitted = false;
      this.onCheckboxChangeGenerated();
    }

    this.panelAddOnServicesModalRef.close();
    this.panelAddOnServices.forEach(a => {
      a.checked = false;
      a.Price = null;
      a.PanelAddOnServiceDate = null;
    })
    setTimeout(() => {
      this.disabledButtonSrv = false;
      this.isSpinnerSrv = true;
    }, 100);
  }

  selectAllServices_(e) {
    this.panelAddOnServices.forEach(a => {
      a.checked = false;
      if (a.PanelAddOnServiceID > 0) {
        a.checked = e.target.checked;
      }
    })
  }

  selectAllServices(event: any) {
    const isChecked = event.checked;
    for (const item of this.panelAddOnServices) {
      item.checked = isChecked;
    }
  }
  removeItem(index_i: number, index_j: number) {
    // Remove the item at the specified index_j from invData array of the corresponding parent row (index_i)
    this.panelVisitsData[index_i].invData.splice(index_j, 1);

    // Recalculate the total sum for the parent row
    let totalAmt = this.panelVisitsData[index_i].invData.reduce((total, item) => total + item.NetAmount, 0);
    this.panelVisitsData[index_i].TotalAmt = totalAmt.toLocaleString();

    // Recalculate total sum for selected rows
    this.onCheckboxChange();
  }
  removeGeneratedItem(index_i: number, index_j: number) {
    // Remove the item at the specified index_j from invData array of the corresponding parent row (index_i)
    this.generatedPanelVisitsData[index_i].invData.splice(index_j, 1);

    // Recalculate the total sum for the parent row
    let totalAmt = this.generatedPanelVisitsData[index_i].invData.reduce((total, item) => total + item.NetAmount, 0);
    this.generatedPanelVisitsData[index_i].TotalAmt = totalAmt.toLocaleString();

    // Recalculate total sum for selected rows
    this.onCheckboxChangeGenerated();
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  getBorder(param, isVerified) {
    if (param) {
      if (isVerified) {
        return '1px solid #1ebac596 !important';
      } else {
        return '1px solid #dc3545 !important';
      }
    } else {
      return '1px solid #ffb000 !important';
    }
  }
  getBorderRight(param, isVerified) {
    if (param) {
      if (isVerified) {
        return '1px solid #1ebac596 !important';
      } else {
        return '1px solid #dc3545 !important';
      }

    } else {
      return '1px solid #ffb000 !important';
    }
  }

  getBorder_new(param, isVerified) {
    if (param) {
      if (isVerified) {
        return '1px solid #dc3545 !important';
      } else {
        return '1px solid #1ebac596 !important';
      }
    } else {
      return '1px solid #ffb000 !important';
    }
  }
  getBorderRight_new(param, isVerified) {
    if (param) {
      if (isVerified) {
        return '1px solid #dc3545 !important';
      } else {
        return '1px solid #1ebac596 !important';
      }
    } else {
      return '1px solid #ffb000 !important';
    }
  }






  panelVisitsDataPromiss = [];
  generatedPanelVisitsDataPromiss = [];
  getPanelVisitsForBillingMerge() {
    return new Promise<any>((resolve, reject) => {
      let formValues = this._form.getRawValue();
      this.BranchID = formValues.BranchID || -1;
      this.selectedPanel = formValues.PanelId || null;
      this._form.markAllAsTouched();
      let objParams = {
        FromDate: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
        ToDate: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
        PanelID: formValues.PanelId ? formValues.PanelId : -1,
        LocID: formValues.BranchID || -1,
      };
      this.spinner.show(this.spinnerRefs.listSection);
      this.disabledButtonSearch = true;
      this.isSpinnerSearch = false;
      this.sharedService.getData(API_ROUTES.GET_PANEL_VISITS_FOR_BILLING, objParams).subscribe((resp: any) => {
        this.disabledButtonSearch = false;
        this.isSpinnerSearch = true;
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.StatusCode == 200) {
          resolve(resp.PayLoad); // Resolve with the response payload
        }
      }, (err) => {
        console.log(err)
        this.toastr.error("Something went wrong. " + err.statusText)
        this.disabledButtonSearch = false;
        this.isSpinnerSearch = true;
        this.spinner.hide(this.spinnerRefs.listSection);
        reject(err); // Reject with the error
      })
    });
  }

  getPanelBillDetailMerge() {
    return new Promise<any>((resolve, reject) => {
      let objParams = {
        PanelBillID: this.PanelBillID
      };
      // this.spinner.show(this.spinnerRefs.listSection);
      this.sharedService.getData(API_ROUTES.GET_PANEL_BILL_DETAIL, objParams).subscribe((resp: any) => {
        // this.spinner.hide(this.spinnerRefs.listSection);
        if (resp && resp.StatusCode == 200) {
          resolve(resp.PayLoad); // Resolve with the response payload
        }
      }, (err) => {
        console.log(err)
        this.toastr.error("Something went wrong. " + err.statusText)
        // this.spinner.hide(this.spinnerRefs.listSection);
        reject(err); // Reject with the error
      })
    });
  }


  async loadData() {
    this.isNew = false;
    try {
      let panelVisitsPromisePromiss = this.getPanelVisitsForBillingMerge();
      let generatedPanelVisitsPromise = this.getPanelBillDetailMerge();
      // Wait for both promises to resolve
      let panelVisitsData = await panelVisitsPromisePromiss;
      let generatedPanelVisitsData = await generatedPanelVisitsPromise;
      this.selectedCount = generatedPanelVisitsData.filter(row => row.checked).length;

      let filteredPanelVisitsData = panelVisitsData.filter(obj1 =>
        !generatedPanelVisitsData.some(obj2 => obj1.VisitId === obj2.VisitId)
      );

      // Flatten the array obtained from the first dataset
      // let flattenedPanelVisitsData = panelVisitsData.reduce((acc, curr) => acc.concat(curr), []);

      // Merge the datasets
      let mergedData = [...filteredPanelVisitsData, ...generatedPanelVisitsData];

      mergedData = mergedData.sort((a, b) => {
        if (a.checked === 1 && b.checked !== 1) {
          return -1; // a comes before b
        } else if (a.checked !== 1 && b.checked === 1) {
          return 1; // b comes before a
        } else {
          return 0; // leave them in their current order
        }
      });

      // 🔄 Use Map to group and optimize
      const patientMap = new Map();

      mergedData.forEach(o => {
        const patientId = o.PatientId;
        const refNoPresent = o.RefNo !== null && o.RefNo !== undefined && o.RefNo !== '';

        const invEntry = {
          VisitId: o.VisitId,
          ReceiptNo: o.ReceiptNo,
          AccNo: o.AccNo,
          PatientId: o.PatientId,
          RegNo: o.RegNo,
          Name: o.Name,
          Phone: o.Phone,
          Remarks: o.Remarks,
          PanelID: o.PanelID,
          PnlCode: o.PnlCode,
          PanelName: o.PanelName,
          Company: o.Company,
          CreatedOn: o.CreatedOn,
          VisitDate: o.VisitDate,
          NetAmount: o.NetAmount,
          DiscAmount: o.DiscAmount,
          PanelPatientVisitStatusId: o.PanelPatientVisitStatusId,
          LocCode: o.LocCode,
          RegBy: o.RegBy,
          RefNo: o.RefNo,
          PanelAddOnServiceID: o.PanelAddOnServiceID,
          PanelBillDetailExtNewID: o.PanelBillDetailExtNewID,
          PanelAddOnServiceDate: o.PanelAddOnServiceDate,
          ServiceName: o.PanelAddOnService,
          PatientVisitStatus: o.PatientVisitStatus,
          Existing: o.Existing,
          checked: o.Existing ? true : false,
          isTPCancel: o.isTPCancel
        };

        if (patientMap.has(patientId)) {
          const existObj = patientMap.get(patientId);
          existObj.invData.push(invEntry);

          // Call checkValidity function
          existObj.isValid = this.checkValidity(existObj.invData);

          // ✅ Only assign RefNo if current one is valid and parent doesn't have one yet
          if ((!existObj.RefNo || existObj.RefNo === '') && refNoPresent) {
            existObj.RefNo = o.RefNo;
          }

          // ✅ Set parent isTPCancel to 1 if any child has isTPCancel = 1
          if (o.isTPCancel === 1) {
            existObj.isTPCancel = 1;
          }

        } else {
          // Push new patient group
          patientMap.set(patientId, {
            PatientId: o.PatientId,
            PanelId: o.PanelID,
            Name: o.Name,
            RegNo: o.RegNo,
            VisitDate: o.VisitDate,
            RefNo: refNoPresent ? o.RefNo : '', // ✅ Only assign if present
            TotalAmt: 0, // Initialize total amount
            // checked: true,
            Existing: o.Existing,
            checked: o.Existing ? true : false,
            isTPCancel: o.isTPCancel,
            invData: [invEntry],
            isValid: this.checkValidity([o]) // Call checkValidity function with single-element array
          });
        }
      });

      // Convert map to array
      let res = Array.from(patientMap.values());

      // Calculate TotalAmt for each patient
      res.forEach(patient => {
        patient.TotalAmt = patient.invData.reduce((total, item) => total + (item.NetAmount || 0), 0);
        patient.TotalAmt = patient.TotalAmt.toLocaleString(); // Format total amount

        // ✅ Set parent isTPCancel to 1 if any child has isTPCancel = 1
        patient.isTPCancel = patient.invData.some(child => child.isTPCancel === 1) ? 1 : 0;
      });

      this.generatedPanelVisitsData = res;
      // console.log('generatedPanelVisitsData:', this.generatedPanelVisitsData)
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  visitDetails = null;
  getVisitDetails(visitID) {
    let params = { VisitId: visitID };
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

  onMachineCodeInput(): void {
    const machineCodeControl = this._formWorklist.get("PatientMRN");
    if (machineCodeControl) {
      // Set the value to uppercase
      machineCodeControl.setValue(machineCodeControl.value.toUpperCase(), {
        emitEvent: false,
      });
    }
  }

}
