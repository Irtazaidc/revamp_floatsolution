// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { LookupService } from "../../services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { UserModel, AuthService } from "src/app/modules/auth";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { PatientService } from "../../services/patient.service";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { HelperService } from "src/app/modules/shared/helpers/helper.service";

import moment from "moment";
@Component({
  standalone: false,

  selector: "app-branch-closing",
  templateUrl: "./branch-closing.component.html",
  styleUrls: ["./branch-closing.component.scss"],
})
export class BranchClosingComponent implements OnInit {
  BranchClosingID: any;
  CardTitle = "Branch Closing";
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  ActionLabel = "Add";
  isSpinner: boolean = true; //Hide Loader

  rowIndex = null;

  patientVisitsPopupRef: NgbModalRef;
  searchTextSales = "";

  @ViewChild("fdoSales") fdoSalesPopup;

  branchClosingForm = this.fb.group({
    saleDate: ["", Validators.required],
    locId: [null, Validators.required],
  });

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  spinnerRefs = {
    dataTable: "dataTable",
    closingListSection: "closingListSection",
    closingFormSection: "closingFormSection",
    SalesDataBar: "SalesDataBar",
    FDOsales: "FDOsales",
  };

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };

  depositList: any = [];
  searchText = "";
  maxDate: any;
  isSubmitted = false;
  GrandTotal = 0;
  Totalcash = 0;
  branchDataList = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService,
    private labTats: LabTatsService,
    private patientService: PatientService,
    private appPopupService: AppPopupService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.branchClosingForm.patchValue({
        saleDate: Conversions.getCurrentDateObject(),
        locId: this.loggedInUser.locationid,
      });
      this.getLocationList();
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);

    this.GetAccount();

    this.urlParams = this.helper.getUrlParams();

    console.log("🚀this.urlParams:_____", this.urlParams);
  }

  GetBranchClosingDataList() {
    this.GrandTotal = 0;
    this.Totalcash = 0;
    this.OriginalCash = 0;
    this.mainChk = false;
    this.depositList = [];
    this.closingData = {
    totalAmount: 0,
    Cash: 0,
    CreditCard: 0,
    Others: 0,
    OnlinePayment: 0,
  };
    this.setCurrencyNotesNull();
    this.pagination.paginatedSearchResults = [];
    this.getBranchSaleSummary();
    const formValues = this.branchClosingForm.getRawValue();
    const spinnerRef = this.spinnerRefs.dataTable;

    if (this.branchClosingForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      SaleDate: Conversions.formatDateObject(formValues.saleDate) ?? null,
      LocIDs: formValues.locId || null,
    };
    this.spinner.show(spinnerRef);
    this.labTats.GetFDOSaleClosing(objParams).subscribe({
      next: (res: any) => {
        this.spinner.hide(spinnerRef);
        if (
          res?.StatusCode === 200 &&
          Array.isArray(res.PayLoad) &&
          res.PayLoad.length
        ) {
          this.depositList = res.PayLoad.map((item) => ({
            ...item,
            TotalAmount:
              (item.Cash || 0) + (item.CreditCard || 0) + (item.Others || 0),
          }));

          this.refreshPagination();
          this.GrandTotal = this.gettotalOfAll();
          this.Totalcash = this.gettotalOfCash();
          this.OriginalCash = this.Totalcash;
          this.countClosingData();
        } else {
          this.toastr.info("No Record Found");
          this.depositList = [];
        }
      },
      error: (err) => {
        console.error("Error fetching report:", err);
        this.spinner.hide(spinnerRef);
        this.toastr.error("Connection error");
      },
    });
  }

  loggedInUser: UserModel;

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  branchList = [];
  getLocationList() {
    this.branchList = [];
    let param = {
      UserID: this.loggedInUser.userid || -99,
    };
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  accountList = [];
  GetAccount() {
    this.accountList = [];
    this.lookupService.GetAccount().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.accountList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  mainChk;

  selectAllItems(checked) {
    this.depositList.forEach((sec) => {
      sec.checked = checked;
    });
    this.refreshPagination();
  }

  onSelectedItem(e) {
    const checked: boolean = e.checked;
    // if (checked == true) {
    //   this.isValues = false
    // }
  }

  gettotalOfAll() {
    return this.depositList.reduce(
      (sum, item) =>
        sum + ((item.Cash || 0) + (item.CreditCard || 0) + (item.Others || 0)),
      0
    );
  }
  gettotalOfCash() {
    // let total = 0;
    // let AdjAmount = this.AdjAmount || 0;
    return this.depositList.reduce((sum, item) => sum + (item.Cash || 0), 0);
  }

  openSalesDetails(event) {
    this.selectedClosingId = event.ClosingId;
    this.selectedUserId = event.UserId;
    this.patientVisitsPopupRef = this.appPopupService.openModal(
      this.fdoSalesPopup,
      { size: "xl" }
    );
    this.getAllSaleByFDO();
  }

  formatAmountWithCommas(value) {
    return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  fdoSalesDataAll = [];
  selectedClosingId = null;
  selectedUserId = null;
  getAllSaleByFDO() {
    const formValues = this.branchClosingForm.getRawValue();

    let params = {
      userId: this.selectedUserId, // 2163, // 768 //
      fromDate: moment().subtract(7, "days").format("YYYY-MM-DDT00:00:00.000"),//Conversions.formatDateObject(formValues.saleDate) ?? null,
      toDate: Conversions.formatDateObject(formValues.saleDate) ?? null, //Conversions.formatDateObject(formValues.saleDate) ?? null
      ClosingID: this.selectedClosingId,
    };
    this.fdoSalesDataAll = [];
    this.spinner.show(this.spinnerRefs.SalesDataBar);
    this.patientService.getAllSaleByFDO(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(res);
        if (res.StatusCode == 200) {
          this.fdoSalesDataAll = res.PayLoad || [];
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(err);
      }
    );
  }

  notes = [
    { denomination: 5000, quantity: null, total: 0 },
    { denomination: 1000, quantity: null, total: 0 },
    { denomination: 500, quantity: null, total: 0 },
    { denomination: 100, quantity: null, total: 0 },
    { denomination: 50, quantity: null, total: 0 },
    { denomination: 20, quantity: null, total: 0 },
    { denomination: 10, quantity: null, total: 0 },
    { denomination: 5, quantity: null, total: 0 },
    { denomination: 1, quantity: null, total: 0 },
  ];

  grandTotal = 0;
  closingData = {
    totalAmount: 0,
    Cash: 0,
    CreditCard: 0,
    Others: 0,
    OnlinePayment: 0,
  };

  calculateNoteTotals() {
    this.grandTotal = 0;
    for (let note of this.notes) {
      note.total = note.quantity * note.denomination;
      this.grandTotal += note.total;
    }
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ClsoingRemarks = null;
  CashAdjustmentRemarks = null;
  AccountCode = null;
  Amount = null;
  AdjAmount = 0;

  countClosingData() {
    this.closingData = {
      totalAmount: 0, // Total of all (Cash + CreditCard + Others)
      Cash: 0,
      CreditCard: 0,
      Others: 0,
      OnlinePayment: 0,
    };
    // Assuming this.depositList is an array of objects with Cash, CreditCard, and Others properties
    this.depositList.forEach((item) => {
      // Add each type to the respective total
      this.closingData.Cash += item.Cash || 0;
      this.closingData.CreditCard += item.CreditCard || 0;
      this.closingData.Others += item.Others || 0;
    });
    // Calculate the total amount
    this.closingData.totalAmount =
      this.closingData.Cash +
      this.closingData.CreditCard +
      this.closingData.Others;
  }
  isSubmitClosing = false;

  saveBranhClosing() {
    if (!this.pagination.filteredSearchResults || this.pagination.paginatedSearchResults.length < 1) {
      this.toastr.warning("No data available", "Invalid");
      return;
    }

    const formValues = this.branchClosingForm.getRawValue();
    if (!this.AccountCode && !this.Amount && !this.ClsoingRemarks) {
      this.toastr.warning("Please fill the mandatory fields");
      this.isSubmitClosing = true;
      return;
    }

    if ((this.ClsoingRemarks || "").length < 10) {
      this.toastr.warning("Please enter remarks (minimum 10 characters)");
      return;
    }
    if(this.grandTotal !== this.Totalcash){
      this.toastr.warning("Please clear the difference");
      return;
    }  

    let checkedItems = this.pagination.paginatedSearchResults.filter(
      (a) => a.checked
    );
    // console.log("🚀 ~ BranchClosingComponent ~ saveBranhClosing ~ checkedItems:", checkedItems)
    let docsToSave = this.formatUploadedDocsData().filter((a) => !a.docId) || [];
    if (!checkedItems?.length) {
      this.toastr.warning("Please select item(s) to update");
      return;
    }
    if (!docsToSave?.length) {
      this.toastr.warning("Please select documents to upload");
      return;
    }
    if(docsToSave?.length > 1){
        this.toastr.warning("Please attach only one document at a time.");
      return;
    }
    let params = {
      Cash: this.closingData.Cash,
      CreditCard: this.closingData.CreditCard,
      Others: this.closingData.Others,
      OnlinePayment: this.closingData.OnlinePayment,
      LocId: formValues.locId,
      ClosingIDs: checkedItems.map((a) => a.ClosingId).join(","),
      AdjAmount: this.AdjAmount || 0,
      Remarks: this.CashAdjustmentRemarks || "N/A",
      CreatedBy: this.loggedInUser.userid || -99,
      tblVisitSaleBranchClosingDeposite: docsToSave.map((a) => {
        return {
          VisitSaleBranchClosingDepositeID: null,
          VisitSaleBranchClosingID: null,
          AccountId: parseInt(this.AccountCode, 10),
          Amount: parseInt(this.Amount, 10),
          DepositRemarks: this.ClsoingRemarks,
          DocBase64: a.GDocBase64,
          DocDirPath: null, //a.GDocBase64,
          DocName: a.Title,
          DocType: a.GDocFileType,
        };
      }),
    };
    console.log("SaveBranhClosing ~ params:_______", params);
    this.spinner.show(this.spinnerRefs.dataTable);
    this.patientService.InsertBranchSalesClosing(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        console.log(res);
        if (res.StatusCode == 200 && res.PayLoad[0].Result == 1) {
          this.toastr.success("Data saved successfully", "Success");
          this.showDepositSlip();
          this.printReport();
          this.GetBranchClosingDataList();
          this.clearLoadedDocs();
        } else {
          this.toastr.error(res.Message, "Error Saving Data");
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        console.log(err);
      }
    );
  }

  refreshPagination() {
    this.pagination.filteredSearchResults = this.depositList;
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize
      );
  }

  BranchSummaryReport = [];
  getBranchSaleSummary() {
    const formValues = this.branchClosingForm.getRawValue();
    if (this.branchClosingForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    this.BranchSummaryReport = [];
    let params = {
      LocId: formValues.locId || null,
      date: Conversions.formatDateObject(formValues.saleDate) ?? null,
    };
    this.spinner.show(this.spinnerRefs.SalesDataBar);
    this.patientService.getBranchSaleSummaryReport(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(res);
        if (res.StatusCode == 200) {
          this.BranchSummaryReport = res.PayLoad || [];
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(err);
      }
    );
  }

  loadedDocuments: any[];
  docDefault = true;

  clearLoadedDocs() {
    this.loadedDocuments = [];
    this.getLoadedDocs(null);
    this.docDefault = false;
    this.grandTotal = 0;
    this.closingData = {
      totalAmount: 0, 
      Cash: 0,
      CreditCard: 0,
      Others: 0,
      OnlinePayment: 0,
    };
  }

  getLoadedDocs(event) {
    this.docDefault = true;
    this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array

    const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document

    if (latestDoc) {
      const base64String = latestDoc.data; // Your base64 image string
      const binaryData = base64String;
      const sizeInBytes = binaryData.length;
      const sizeInKB = sizeInBytes / 1024;
      // if (sizeInKB > 100) {
      //   this.toastr.warning('Image size should be less than 100KB');
      //   return;
      // }
    }
  }
  urlParams: any = {};
  formatUploadedDocsData() {
    let docs = [];
    this.loadedDocuments
      .filter((a) => !a.docId)
      .forEach((a) => {
        let d = {
          DocId: null,
          Title: a.fileName,
          Remarks: "",
          Doc: null,
          CreatedBy: this.loggedInUser.userid,
          RefId: null,
          DocTypeId: 26,
          GDocBase64: a.data,
          GDocBase64Thumbnail: "",
          GDocFileType: a.fileType,
          DirPath: null, //`BranchClosingDocs/${this.urlParams.docTypeId}/${this.urlParams.refId}/${a.fileName}`
        };
        docs.push(d);
      });

    return docs;
  }

  SAveBranchClosing() {
    let docsToSave =
      this.formatUploadedDocsData().filter((a) => !a.docId) || [];
  }

  setCurrencyNotesNull() {
    this.notes = [
      { denomination: 5000, quantity: null, total: 0 },
      { denomination: 1000, quantity: null, total: 0 },
      { denomination: 500, quantity: null, total: 0 },
      { denomination: 100, quantity: null, total: 0 },
      { denomination: 50, quantity: null, total: 0 },
      { denomination: 20, quantity: null, total: 0 },
      { denomination: 10, quantity: null, total: 0 },
      { denomination: 5, quantity: null, total: 0 },
      { denomination: 1, quantity: null, total: 0 },
    ];

    this.ClsoingRemarks = "";
    this.CashAdjustmentRemarks = "";
    this.AdjAmount = null;
    this.Amount = null;
    this.AccountCode = null;
  }

  OriginalCash: number = 0;


 getLatestTotalAmount() {

   if (Number(this.AdjAmount) > Number(this.Amount)) {
    this.AdjAmount = null;  // force limit
    this.toastr.warning("Adjustment amount cannot exceed Amount!");
  }
  const adj = Number(this.AdjAmount) || 0;
  this.Totalcash = this.OriginalCash - adj;
}

  showDepositSlip() {
    const slipWindow = window.open(
      "",
      "_blank",
      "width=800,height=800,scrollbars=yes"
    );

    if (!slipWindow) {
      alert("Popup blocked! Allow popups for this site.");
      return;
    }

    slipWindow.document.write(this.getSlipHTML());
    slipWindow.document.close();
  }

  getSlipHTML(): string {
     let denomRows = this.notes.map(n => `
      <tr class="denomination-row">
        <td></td>
        <td></td>
        <td class="denomination-label">${n.denomination} x ${n.quantity || 0}</td>
        <td>Rs. ${n.total?.toLocaleString() || 0}</td>
      </tr>
  `).join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCB Islamic Bank Deposit Slip</title>
    <style>
        :root {
            --border-color: #000;
            --text-color: #000;
            --bg-bank: #ffffff;
            --bg-customer: #e3eedc; /* Light green for customer copy */
            --font-primary: 'Arial', sans-serif;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-primary);
            font-size: 12px;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
        }

        /* Main Container for the Slip */
        .deposit-slip {
            width: 1000px;
            border: 1px solid var(--border-color);
            padding: 15px;
            position: relative;
        }

        .bank-copy {
            background-color: var(--bg-bank);
        }

        .customer-copy {
            background-color: var(--bg-customer);
        }

        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .logo-img-placeholder {
            width: 60px;
            height: 60px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            /* border: 1px dashed #ccc; REMOVED BORDER FOR CLEANER LOOK WITH IMG */
            font-size: 10px;
            color: #666;
        }
        
        .logo-img-placeholder img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .header-start {
            width: 33.3%;
        }
        .header-center {
            width: 33.3%;
            text-align: center;
        }

        .header-end{
            width: 33.3%;
        }

        .header-center h2 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .header-center h3 {
            margin: 5px 0;
            font-size: 14px;
            font-weight: bold;
        }

        /* UPDATED HEADER STYLES TO MINIMIZE SPACE */
        .header-brand h3 {
            margin-bottom: 0px !important; 
            padding-bottom: 0px !important;
            line-height: 1;
        }
        
        .header-brand .urdu-text {
            margin-top: 2px !important;
            line-height: 1.2;
        }

        .urdu-text {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
        }

        .slip-number {
            font-size: 12px;
            font-weight: bold;
            margin-top: 5px;
            display: block;
        }

        .copy-label {
            font-style: italic;
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px; /* Reduced from 10 */
            display: block;
        }

        /* Account Details Section */
        .account-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .account-left {
            width: 65%;
        }

        .account-bottom{
              width: 100%;
        }

        .account-right {
            width: 35%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 2px; /* Reduced gap from 10px to 2px to remove space above deposit branch */
        }

        .row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        /* Specific tweak for the right side rows to be tighter */
        .account-right .row {
            margin-bottom: 4px;
        }

        .label {
            font-weight: bold;
            width: 140px;
            flex-shrink: 0;
        }

        .value {
            flex-grow: 1;
            font-weight: bold;
        }

        .input-line {
            border-bottom: 1px solid var(--border-color);
            min-width: 100px;
            display: inline-block;
        }

        /* Number Boxes */
        .num-boxes {
            display: flex;
        }
        
        .box {
            width: 20px;
            height: 20px;
            border: 1px solid var(--border-color);
            text-align: center;
            line-height: 18px;
            font-weight: bold;
            margin-right: 2px;
            background: #fff;
        }

        .checkbox-group {
            display: flex;
            gap: 15px;
            margin-left: 10px;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .check-box {
            width: 25px;
            height: 18px;
            border: 1px solid var(--border-color);
            background: #fff;
        }

        /* Main Table Section */
        .content-area {
            display: flex;
            border: 1px solid var(--border-color);
            height: 350px;
        }

        .table-container {
            width: 75%;
            border-right: 1px solid var(--border-color);
        }

        .stamp-area {
            width: 25%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #444;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            height: 100%;
        }

        th, td {
            border: 1px solid var(--border-color);
            padding: 5px;
            text-align: center;
            vertical-align: middle;
        }

        th {
            background-color: transparent;
            font-weight: bold;
            height: 40px;
        }

        /* Specific Column Widths */
        .col-1 { width: 30%; }
        .col-2 { width: 40%; }
        .col-3 { width: 15%; }
        .col-4 { width: 15%; }
        .col-6 { width: 60%; }
        .col-7 { width: 70%; }
        .denomination-row {
            height: 22px;
        }
        
        .denomination-label {
            text-align: right;
            padding-right: 5px;
        }

        .total-row td {
            font-weight: 500;
            background-color: rgba(0,0,0,0.05);
        }

        /* Amount in Words */
        .amount-words-row {
            margin-top: 5px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 5px;
        }

        /* Footer Details */
        .footer {
            margin-top: 15px;
        }

        .footer h4 {
            margin: 0 0 10px 0;
            font-size: 12px;
            font-weight: bold;
        }

        .footer-inputs {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .footer-inputs span {
            display: flex;
            align-items: flex-end;
            gap: 5px;
            width: 32%;
        }

        .footer-inputs .line {
            flex-grow: 1;
            border-bottom: 1px solid var(--border-color);
        }

        .signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
            text-align: center;
        }

        .sig-line {
            border-top: 2px solid var(--border-color);
            width: 250px;
            padding-top: 5px;
            font-weight: bold;
        }

        .terms-text {
            font-size: 10px;
            color: #444;
        }

        /* Print Styles */
        @media print {
            @page {
                size: A4 landscape;
                margin: 4mm;
            }
            body {
                background-color: #fff;
                padding: 0;
                
            }
            .deposit-slip {
              
                margin-bottom: 20px;
                page-break-after: always;
                -webkit-print-color-adjust: exact; 
            }

        }
    </style>
    </head>
    <body>

        <!-- PAGE 1: BANK COPY -->
        <div class="deposit-slip bank-copy" >
            
            <div class="header">
                <div class="header-start" style="display:flex; align-items: center;">
                  <div class="col-1">
                        <div class="logo-img-placeholder">
                            <!-- ADDED LOGO HERE -->
                            <img style="mix-blend-mode:multiply;" src="assets/images/brand/mcb_logo.png" alt="MCB Islamic">
                        </div>
                    </div>
                    <div class="col-7 header-brand" style="padding-left: 10px;"> 
                        <!-- MINIMIZED SPACING HERE -->
                        <h3>MCB Islamic Bank Ltd.</h3>
                        <div class="urdu-text">بابرکت بینکاری، ہماری ذمہ داری</div>
                    </div>
                </div>
                <div class="header-center">
                    <h4>Cash Management - Collection<br>Special Deposit Slip - Only for Cash Deposit</h4>
                </div>
                <div class="header-end" style="text-align: center;">
                    <span class="slip-number" 
                    style="margin-top:30px;">Deposit Slip # ____________________________</span>
                </div>
            </div>
            <div class="account-section">
                <div class="account-left">
                    <div class="row">
                        <span class="label">Collection A/c Title</span>
                        <span class="value" style="font-size: 11px;">
                        ________________________________________________________
                        </span>
                    </div>
                    <div class="row"  style="margin-top:15px;">
                        <span class="label">Collection A/c No.</span>
                        <div class="num-boxes">
                            <!-- 1151006506460002 -->
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                        </div>
                    </div>
                    <div class="row" style="margin-top:15px;">
                        <span class="label">Service Center Code</span>
                        <div class="num-boxes">
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                        </div>
                        <div class="checkbox-group">
                            <div class="checkbox-item"><strong>Cash</strong> <div class="check-box"></div></div>
                            <div class="checkbox-item"><strong>Cheque</strong> <div class="check-box"></div></div>
                        </div>
                    </div>
                    
                </div>
                <div class="account-right">
                    <div class="row">
                        <div class="col-6" style="padding-top:0px; margin-top:0px;">
                            <div class="row" style="padding-top:0px; margin-top:0px;">
                                <!-- REDUCED MARGIN BOTTOM HERE -->
                                <span class="copy-label" style="margin-bottom:5px;">Bank Copy</span> 
                            </div>
                            <div class="row">
                                <strong>Date</strong> <div class="input-line" style="flex-grow: 1; margin-left: 5px;"></div>
                            </div>     
                        </div>
                        <div class="col-2">
                           <div class="logo-img-placeholder">
                              <img  src="assets/images/brand/idc_logo.png" alt="IDC">
                            </div> 
                        </div>
                    </div>
                    <!-- REMOVED SPACE ABOVE DEPOSIT BRANCH -->
                    <div class="row">
                        <strong>Deposit Branch</strong> <div class="input-line" style="flex-grow: 1; margin-left: 5px;"></div>
                    </div>
                </div>
            </div>
            <div class="account-bottom">
                <div class="row">
                        <span class="label">Service Center Name</span>
                        <div class="input-line" style="width: 820px;  margin-top:10px;"></div>
                    </div>
                </div>
            <div class="content-area">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-1">Cash/Cheque/Instrument No.<br><span class="urdu-text">کیش / چیک / آلہ نمبر</span></th>
                                <th class="col-2">Drawn on Bank & Branch<br><span class="urdu-text">جاری کرنے والے بینک کا نام و برانچ</span></th>
                                <th class="col-3">Denomination<br><span class="urdu-text">مالیت</span></th>
                                <th class="col-4">Amount<br><span class="urdu-text">رقم</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        ${denomRows}
                            <!-- <tr class="denomination-row">
                                <td ></td>
                                <td ></td>
                                <td class="denomination-label">5000 x</td>
                                <td></td>
                            </tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td>
                                <td class="denomination-label">1000 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">500 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">100 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">75 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">50 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">20 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">10 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">COINS x</td><td></td></tr>
                                -->
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">TOTAL AMOUNT / <span class="urdu-text">کل رقم</span></td>
                                <td colspan="1">Rs. ${this.grandTotal.toLocaleString()}</td>
                            </tr> 

                            <tr class="">
                                <td colspan="4" style="text-align:left;">
                                    <strong>Amount (In words) / 
                                        <span class="urdu-text">رقم (لفظوں میں)</span></strong> ____________________________________________________________________________

                                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                
                                    <span></span>
                                    ____________________________________________________________________________
                                    
                                    </td>
                              
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="stamp-area" >
                    Bank Stamp
                </div>
            </div>

            <div class="footer">
                <h4>Details (All Details Mandatory)</h4>
                <div class="footer-inputs">
                    <span>Contact Person Name <div class="line"></div></span>
                    <span>Contact # <div class="line"></div></span>
                    <span>Depositor's CNIC Number <div class="line"></div></span>
                </div>
                <div class="signatures">
                    <div class="sig-line">Service Center Rep Signature</div>
                    <div class="terms-text">(As per Terms & Conditions of Reverse)</div>
                    <div class="sig-line">Bank Authorizer's Signature</div>
                </div>
            </div>
        </div>

        <!-- PAGE 2: CUSTOMER COPY (Identical Structure, Different Class) -->
      <div class="deposit-slip customer-copy" >
            
            <div class="header">
                <div class="header-start" style="display:flex; align-items: center;">
                  <div class="col-1">
                        <div class="logo-img-placeholder">
                            <!-- ADDED LOGO HERE -->
                            <img style="mix-blend-mode:multiply;" src="assets/images/brand/mcb_logo.png" alt="MCB Islamic">
                        </div>
                    </div>
                    <div class="col-7 header-brand" style="padding-left: 10px;"> 
                        <!-- MINIMIZED SPACING HERE -->
                        <h3>MCB Islamic Bank Ltd.</h3>
                        <div class="urdu-text">بابرکت بینکاری، ہماری ذمہ داری</div>
                    </div>
                </div>
                <div class="header-center">
                    <h4>Cash Management - Collection<br>Special Deposit Slip - Only for Cash Deposit</h4>
                </div>
                <div class="header-end" style="text-align: center;">
                    <span class="slip-number" 
                    style="margin-top:30px;">Deposit Slip # ____________________________</span>
                </div>
            </div>
            <div class="account-section">
                <div class="account-left">
                     <div class="row">
                        <span class="label">Collection A/c Title</span>
                        <span class="value" style="font-size: 11px;">
                        ________________________________________________________
                        </span>
                    </div>
                    <div class="row"  style="margin-top:15px;">
                        <span class="label">Collection A/c No.</span>
                        <div class="num-boxes">
                            <!-- 1151006506460002 -->
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                        </div>
                    </div>
                    <div class="row" style="margin-top:15px;">
                        <span class="label">Service Center Code</span>
                        <div class="num-boxes">
                            <div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div><div class="box"></div>
                        </div>
                        <div class="checkbox-group">
                            <div class="checkbox-item"><strong>Cash</strong> <div class="check-box"></div></div>
                            <div class="checkbox-item"><strong>Cheque</strong> <div class="check-box"></div></div>
                        </div>
                    </div>
                    
                </div>
                <div class="account-right">
                    <div class="row">
                        <div class="col-6" style="padding-top:0px; margin-top:0px;">
                            <div class="row" style="padding-top:0px; margin-top:0px;">
                                <!-- REDUCED MARGIN BOTTOM HERE -->
                                <span class="copy-label" style="margin-bottom:5px;">Customer Copy</span> 
                            </div>
                            <div class="row">
                                <strong>Date</strong> <div class="input-line" style="flex-grow: 1; margin-left: 5px;"></div>
                            </div>     
                        </div>
                        <div class="col-2">
                            <div class="logo-img-placeholder">
                              <img style="mix-blend-mode:multiply;" src="assets/images/brand/idc_logo.png" alt="IDC">
                            </div> 
                        </div>
                    </div>
                    <!-- REMOVED SPACE ABOVE DEPOSIT BRANCH -->
                    <div class="row">
                        <strong>Deposit Branch</strong> <div class="input-line" style="flex-grow: 1; margin-left: 5px;"></div>
                    </div>
                </div>
            </div>
            <div class="account-bottom">
                <div class="row">
                        <span class="label">Service Center Name</span>
                        <div class="input-line" style="width: 820px; margin-top:10px;"></div>
                    </div>
                </div>
            <div class="content-area">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-1">Cash/Cheque/Instrument No.<br><span class="urdu-text">کیش / چیک / آلہ نمبر</span></th>
                                <th class="col-2">Drawn on Bank & Branch<br><span class="urdu-text">جاری کرنے والے بینک کا نام و برانچ</span></th>
                                <th class="col-3">Denomination<br><span class="urdu-text">مالیت</span></th>
                                <th class="col-4">Amount<br><span class="urdu-text">رقم</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        ${denomRows}
                            <!-- <tr class="denomination-row">
                                <td ></td>
                                <td ></td>
                                <td class="denomination-label">5000 x</td>
                                <td></td>
                            </tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td>
                                <td class="denomination-label">1000 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">500 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">100 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">75 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">50 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">20 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">10 x</td><td></td></tr>
                            <tr class="denomination-row">
                                <td ></td>
                                <td ></td><td class="denomination-label">COINS x</td><td></td></tr>
                                -->
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">TOTAL AMOUNT / <span class="urdu-text">کل رقم</span></td>
                                <td colspan="1">Rs. ${this.grandTotal.toLocaleString()}</td>
                            </tr> 

                            <tr class="">
                                <td colspan="4" style="text-align:left;">
                                    <strong>Amount (In words) / 
                                        <span class="urdu-text">رقم (لفظوں میں)</span></strong> ____________________________________________________________________________

                                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                
                                    <span></span>
                                    ____________________________________________________________________________
                                    
                                    </td>
                              
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="stamp-area" >
                    Bank Stamp
                </div>
            </div>

            <div class="footer">
                <h4>Details (All Details Mandatory)</h4>
                <div class="footer-inputs">
                    <span>Contact Person Name <div class="line"></div></span>
                    <span>Contact # <div class="line"></div></span>
                    <span>Depositor's CNIC Number <div class="line"></div></span>
                </div>
                <div class="signatures">
                    <div class="sig-line">Service Center Rep Signature</div>
                    <div class="terms-text">(As per Terms & Conditions of Reverse)</div>
                    <div class="sig-line">Bank Authorizer's Signature</div>
                </div>
            </div>
        </div>


    </body>
    </html>
  `;
  }


printReport() {
  if(!this.pagination.paginatedSearchResults || this.pagination.paginatedSearchResults.length === 0){
    this.toastr.warning(
    'No record was found to print',
    'Record Not Found');
    return;
  }
  if (this.pagination.paginatedSearchResults.find(a => a.IsCancellationApprovelPending === 0)) {
    this.toastr.warning(
      'Cancellation approvals pending, Kindly ask your manager to approve cancellation requests',
      'Cancellation Approval Pending'
    );
    return;
  }

  this.searchText = '';

  const styleSheet = `
  <style>
    // @page {
    //   size: A5;
    //   margin: 0.5cm;
    // }
    
    body {
      width: 14.8cm; /* A5 width */
      margin: 0;
      padding: 0.5cm;
      font-size: 10px;
      line-height: 1.2;
    }
    
    .container {
      width: 100% !important;
      page-break-after: avoid;
    }
    
    .section {
      width: 100%;
      margin-bottom: 2px;
      page-break-inside: avoid;
    }
    
    .bottom-container {
      display: flex;
      width: 100%;
      gap: 2%;
      page-break-inside: avoid;
    }
    
    .currency-calculator {
      width: 58%;
    }
    
    .closing-summary {
      width: 40%;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 5px;
      font-size: 9px;
      page-break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #ccc;
      padding: 2px;
      text-align: left;
    }
    
    .text-end { text-align: right; }
    .fw-bold { font-weight: bold; }
    .text-warning { color: orange; }
    .text-green { color: green; }
    .text-danger { color: red; }
    .text-success { color: green; }
    
    .header-area {
      text-align: center;
      margin-bottom: 4px;
      page-break-after: avoid;
    }
    
    .header-area h2 {
      margin: 2px 0;
      font-size: 14px;
    }
    
    .header-area div {
      margin: 1px 0;
      font-size: 9px;
    }
    
    .divFooter {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 8px;
      padding: 2px;
      background: white;
    }
    
    input {
      display: none; /* Hide inputs in print */
    }
    
    /* Ensure tables don't break across pages */
    table {
      page-break-inside: avoid;
    }
    
    /* Reduce spacing in tables */
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    /* Make sure headers repeat on each page */
    thead {
      display: table-header-group;
    }
    
    /* Adjust font sizes for A5 */
    h4 {
      font-size: 11px;
      margin: 4px 0;
    }
  </style>
`;

  const dates = [...new Set(this.pagination.paginatedSearchResults.map(e => moment(e.CreatedOn).format("DD-MMM-YYYY")))].join(", ");
  const printedByText = `${this.loggedInUser.username || ''} @ ${moment(new Date()).format('DD-MMM-YYYY HH:mm:ss')}`;

  const header = `
    <div class="header-area">
      <h2>Branch Sales Closing</h2>
  
      <div><strong>Date(s):</strong> ${dates}</div>
      <div><strong>Printed by:</strong> ${printedByText}</div>
    </div>
  `;

  // const footer = `<div class="divFooter">${printedByText} @ ${this.fdoSalesData[0]?.BranchCode || ''}</div>`;

  // Split data into chunks for pagination if needed
  const chunkSize = 15; // Adjust based on your content size
  const chunks = [];
  for (let i = 0; i < this.pagination.paginatedSearchResults.length; i += chunkSize) {
    chunks.push(this.pagination.paginatedSearchResults.slice(i, i + chunkSize));
  }

  const transactionTables = chunks.map(chunk => {

const rows = chunk.map((item, index) => `

  <tr>
    <td>${index + 1}</td> <!-- Sr# -->
    <td>${item.EmployeeName}</td>
    <td>${item.LocCode}</td>
    <td>${item.Cash}</td>
    <td>${item.CreditCard}</td>
    <td>${item.Others}</td>
    <td class="text-end">${item.TotalAmount}</td>
    <td class="text-end">${item.SaleClosingDate}</td>
  </tr>
`).join('');

return `
  <table class="table">
    <thead>
      <tr>
        <th>Sr#</th>
         <th>FDO Name</th>
          <th>Branch</th>
          <th>Cash</th>
          <th>Credit Card</th>
          <th>Others</th>
          <th class="text-end">Amount</th>
          <th>Closing Date</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
`;
  });

    //  <td class="text-end">${item.DueBalance || '-'}</td>
   // <th class="text-end">Due Balance</th>

  const totalsHTML = `
    <div>
      <h4>Closing Summary</h4>
      <table class="table">
        <tr>
          <td><strong>Cash Amount</strong></td>
          <td class="text-end">${this.formatAmountWithCommas(this.closingData.Cash)}</td>
        </tr>
        <tr>
          <td><strong>Credit Card Amount</strong></td>
          <td class="text-end text-warning">${this.formatAmountWithCommas(this.closingData.CreditCard)}</td>
        </tr>
         <tr>
          <td><strong>Cheque Amount</strong></td>
          <td class="text-end text-warning">${this.formatAmountWithCommas(this.closingData.Others)}</td>
          </tr>
        <tr>
          <td><strong>Total Amount</strong></td>
          <td class="text-end text-green fw-bold">${this.formatAmountWithCommas(this.closingData.totalAmount)}</td>
        </tr>
      </table>
       <div class="mt-3">
        <strong>Deposit Amount: ${this.Amount ? this.Amount : '0'}</strong>
    </div>
     <div class="mt-1">
       <strong>Adjustment Amount: ${this.AdjAmount ? this.AdjAmount : 'Nill'}</strong> 
    </div>
    <div class="mt-1">
        <strong>Adjustment Remarks: ${this.CashAdjustmentRemarks ? this.CashAdjustmentRemarks : 'No remarks entered.'}</strong>
    </div>
    <div class="mt-2">
      <strong>Deposit Remarks:</strong>
      <div class="border " style="white-space: pre-wrap; word-break: break-word">
        ${this.ClsoingRemarks ? this.ClsoingRemarks : 'No remarks entered.'}
      </div>
    </div>
  </div>
  `;

  const notesHTML = this.notes.map(note => `
    <tr>
      <td>Rs. ${note.denomination.toLocaleString()}</td>
      <td class="text-end">${note.quantity || 0}</td>
      <td class="text-end fw-bold">Rs. ${note.total.toLocaleString()}</td>
    </tr>`).join('');

  const calculatorHTML = `
    <div>
      <h4><i class="bi bi-calculator me-1"></i> Currency Calculator</h4>
      <table class="table table-borderless">
        <thead>
          <tr><th>Notes</th><th>Qty</th><th>Amount</th></tr>
        </thead>
        <tbody>${notesHTML}</tbody>
        <tfoot>
          <tr><td colspan="2" class="text-end fw-bold">Calculated Total</td><td class="text-end fw-bold">Rs. ${this.grandTotal.toLocaleString()}</td></tr>
          <tr><td colspan="2" class="text-end fw-bold">Cash Amount</td><td class="text-end fw-bold">Rs. ${this.formatAmountWithCommas(this.Totalcash)}</td></tr>
          <tr>
            <td colspan="2" class="text-end fw-bold">Difference</td>
            <td class="text-end ${this.grandTotal === this.Totalcash ? 'text-success' : 'text-danger'}">
              ${this.grandTotal === this.Totalcash ? '<i class="bi bi-check-circle me-1"></i>Matched' : `Rs. ${(this.grandTotal - this.Totalcash).toLocaleString()}`}
            </td>
          </tr>
        </tfoot>
      </table>
      <div>
        <span class="${this.grandTotal === this.closingData.totalAmount ? 'text-success' : 'text-danger'}">
          ${this.grandTotal === this.closingData.totalAmount ? 'Amounts are balanced' : 'Discrepancy detected - please verify'}
        </span>
      </div>
    </div>
  `;

  setTimeout(() => {
    const customWindow = window.open('', '', 'width=900,height=800');
    customWindow.document.write('<html><head><title>Branch Sales Closing</title>' + styleSheet + '</head><body>');
    customWindow.document.write(header);
    
    // Add transaction tables
    transactionTables.forEach((table, index) => {
      customWindow.document.write(`
        <div class="section">
          ${table}
        </div>
      `);
      
      // Add summary only after the last table
      if (index === transactionTables.length - 1) {
        customWindow.document.write(`
          <div class="bottom-container">
            <div class="currency-calculator">${calculatorHTML}</div>
            <div class="closing-summary">${totalsHTML}</div>
          </div>
        `);
      }
    });

    // customWindow.document.write(footer);
    customWindow.document.write('</body></html>');
    customWindow.document.close();
    customWindow.focus();
    
    // Give the content time to render before printing
    setTimeout(() => {
      customWindow.print();
      setTimeout(() => {
        customWindow.close();
      }, 500);
    }, 200);
  }, 500);

}

accountChange(event){
  console.log("🚀 ~ BranchClosingComponent ~ accountChange ~ event:", event)
}

}
