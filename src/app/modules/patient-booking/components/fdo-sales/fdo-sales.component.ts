// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { PatientService } from "../../services/patient.service";
import { TestProfileService } from "../../services/test-profile.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute } from "@angular/router";
import { timeout } from "rxjs/operators";
import { LookupService } from "../../services/lookup.service";
import { FilterByKeyPipe } from "src/app/modules/shared/pipes/filter-by-key.pipe";

// declare var $;

@Component({
  standalone: false,

  selector: "app-fdo-sales",
  templateUrl: "./fdo-sales-new.component.html",
  styleUrls: ["./fdo-sales.component.scss"],
})
export class FdoSalesComponent implements OnInit {
  loggedInUser: UserModel;
  searchText = "";
  fdoRemarks: "";
  fdoSalesDataAll = [];
  fdoSalesData = [];
  fdoSalesDates = [];
  selectedDate: "";
  fdoClsoingRemarks: "";
  closingData = {
    totalAmount: 0,
    cash: 0,
    creditCard: 0,
    RewardPoint: 0,
     JSBANK: 0,
    Cheque: 0,
  };
  RadioEditStatus = null;
  StatusID = 7;
  fdoSummaryPopupRef: NgbModalRef;

  spinnerRefs = {
    SalesDataBar: "SalesDataBar",
  };

  selectedPaymentMode: number[] = [];

   pagination = {
    page: 1,
    pageSize: 5,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
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

  constructor(
    private patientService: PatientService,
    // private storageService: StorageService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private route: ActivatedRoute,
    private lookupService: LookupService
  ) // private testProfileService: TestProfileService
  {}

  ngOnInit(): void {
    this.loggedInUser = this.auth.currentUserValue;
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.getSaleByFDO();
    this.getLookupsForRegistration();
  }

  getSaleByFDO() {
    const params = {
      userId: this.loggedInUser.userid, // 2163, // 768 //
      fromDate: moment().subtract(3, "days").format("YYYY-MM-DDT00:00:00.000"), //moment(new Date()).subtract(50, 'years').format('YYYY-MM-DDT00:00:00.000'), //  new Date(),
      toDate: moment(new Date()).format("YYYY-MM-DDT23:59:59.996"), // new Date()
    };
    this.selectedDate = "";
    this.fdoClsoingRemarks = "";
    this.fdoSalesDataAll = [];
    this.fdoSalesData = [];
    this.fdoSummaryReport = [];
    this.pagination.paginatedSearchResults = []
    this.fdoSalesDates = [];
    this.calculateAmounts(this.fdoSalesData);
    this.spinner.show(this.spinnerRefs.SalesDataBar);
    this.patientService.getSaleByFDO(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(res);
        if (res.StatusCode == 200) {
          this.fdoSalesDataAll = res.PayLoad || [];
          // this.fdoSalesData = res.payLoad || [];
          const xDates = [
            ...new Set(
              this.fdoSalesDataAll.map((element) => {
                return moment(element.CreatedOn).format("x");
              })
            ),
          ];
          xDates.sort();
          this.fdoSalesDates = xDates.map((date) => {
            return moment(date, "x").format("DD-MMM-YYYY");
          });
          this.fdoSalesDates = [...new Set(this.fdoSalesDates)];
          if (this.fdoSalesDates.length) {
            // set latest date selected by default
            this.selectedDate =
              this.fdoSalesDates[this.fdoSalesDates.length - 1];
            this.dateSelected();
          }
          // this.calculateAmounts(this.fdoSalesData);
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(err);
      }
    );
  }
  PendingIsCancellationApprovel = false;
  dateSelected() {
    this.fdoSalesData = this.fdoSalesDataAll.filter((a) => {
      return moment(a.CreatedOn).format("DD-MMM-YYYY") == this.selectedDate;
    });
    console.log("🚀 this.fdoSalesData:", this.fdoSalesData);
    this.calculateAmounts(this.fdoSalesData);
    this.PendingIsCancellationApprovel = this.fdoSalesData.some(
      (payment) => payment.IsCancellationApprovelPending === 0
    );
    this.fdoSummaryProcess();
    this.filterResults();
    this.setCurrencyNotesNull();
  }
  calculateAmounts(data) {
    if (data && data.length) {
      this.closingData = {
        totalAmount: data.map((a) => a.PaidAmount).reduce((a, b) => a + b, 0),
        cash: data
          .filter((a) => (a.PaymentMode || "").toLowerCase().trim() == "cash")
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
        creditCard: data
          .filter(
            (a) => (a.PaymentMode || "").toLowerCase().trim() == "credit card")
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
        RewardPoint: data
          .filter(
            (a) => (a.PaymentMode || "").toLowerCase().trim() == "reward point")
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
        JSBANK: data
          .filter(
            (a) => (a.PaymentMode || "").toLowerCase().trim() == "js bank")
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0), 
        Cheque: data
          .filter(
            (a) => (a.PaymentMode || "").toLowerCase().trim() == "cheque")
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
      };
    } else {
      this.closingData = {
        totalAmount: 0,
        cash: 0,
        creditCard: 0,
        RewardPoint: 0,
         JSBANK: 0,
        Cheque: 0,
      };
    }
  }

  fdoClosingSave() {
    // if(!this.fdoRemarks) {
    //   this.toastr.warning('Please enter Remarks.');
    //   return;
    // }
    if((this.fdoClsoingRemarks || '').length < 10) {
      this.toastr.warning('Please enter remarks, minimum 10 characters');
      return;
    }
    else if((this.fdoClsoingRemarks || '').length > 250) {
      this.toastr.warning('Maximum 250 characters are allowed','Limit Exceed');
      return;
    }

     if(!this.pagination.paginatedSearchResults || this.pagination.paginatedSearchResults.length === 0){
        this.toastr.warning(
        'No record was found to save',
        'Record Not Found');
      return;
      }
    console.log(this.fdoSalesData);
    if (this.fdoSalesData.find((a) => a.IsCancellationApprovelPending == 0)) {
      this.toastr.warning(
        "Cancellation approvals pending, Kindly ask your manager to approve cancellation requests",
        "Cancellation Approval Pending"
      );
      return;
    }
    // if(confirm('Are you sure you want to close booking for today?')) {
    // setTimeout(() => {
    this.updatePaymentCashClosing();
    // }, 1000);
    // }
  }

  updatePaymentCashClosing() {
    const params = {
      ModifyBy: this.loggedInUser.userid,
      DepositeRemarks: this.fdoClsoingRemarks,
      ClosingDate: moment(new Date()).format(),
      PaymentsData: [],
    };
    params.PaymentsData = this.fdoSalesData.map((a) => {
      return {
        PaymentID: a.PaymentID,
        PaidAmount: a.PaidAmount,
        PatientTypeName: a.PatientTypeName,
      };
    });
    this.patientService.updateFDOPaymentCashClosing(params).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200) {
          if(res.PayLoad[0].Result == 1){
           this.toastr.success('Data saved successfully', 'Success');
            this.printReport();
            setTimeout(() => {
              this.getSaleByFDO();
              // this.getFDOSummaryReport(this.selectedDate);
            }, 500);
          }
          else{
            this.toastr.error('An error occurred while processing the request.', 'Failed');
          }

        } else {
          this.toastr.error('Unexpected error occurred. Please try again.', 'Error');
        }
      },
      (err) => {
        this.toastr.error("Server Connection error");
        console.log(err);
      }
    );
  }

  formatAmountWithCommas(value) {
    return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

printReport() {
  if(!this.pagination.paginatedSearchResults || this.pagination.paginatedSearchResults.length === 0){
    this.toastr.warning(
    'No record was found to print',
    'Record Not Found');
    return;
  }
  if (this.fdoSalesData.find(a => a.IsCancellationApprovelPending === 0)) {
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

  const dates = [...new Set(this.fdoSalesData.map(e => moment(e.CreatedOn).format("DD-MMM-YYYY")))].join(", ");
  const printedByText = `${this.loggedInUser.username || ''} @ ${moment(new Date()).format('DD-MMM-YYYY HH:mm:ss')}`;

  const header = `
    <div class="header-area">
      <h2>Daily Sale</h2>
      <div><strong>Branch:</strong> ${this.fdoSalesData[0]?.BranchCode || ''}</div>
      <div><strong>Date(s):</strong> ${dates}</div>
      <div><strong>Printed by:</strong> ${printedByText}</div>
    </div>
  `;

  const footer = `<div class="divFooter">${printedByText} @ ${this.fdoSalesData[0]?.BranchCode || ''}</div>`;

  // Split data into chunks for pagination if needed
  const chunkSize = 15; // Adjust based on your content size
  const chunks = [];
  for (let i = 0; i < this.fdoSummaryReport.length; i += chunkSize) {
    chunks.push(this.fdoSummaryReport.slice(i, i + chunkSize));
  }

  const transactionTables = chunks.map(chunk => {
    // const rows = chunk.map(item => `
    //   <tr >
    //     <td>${item.VisitNo}</td>
    //     <td>${item.PatientName}</td>
    //     <td>${item.ReceiptNo}</td>
    //     <td>${item.PanelCode || item.PatientTypeName || '-'}</td>
       
    //     <td class="text-end fw-bold">${this.formatAmountWithCommas(item.PaidAmount)}</td>
    //     <td>${item.PaymentMode}</td>
    //     <td>${moment(item.CreatedOn).format('DD MMM YYYY, hh:mm A')}</td>
    //   </tr>`).join('');
    
    // return `
    //   <table class="table">
    //     <thead>
    //       <tr>
    //         <th>PIN</th>
    //         <th>Name</th>
    //         <th>Receipt No</th>
    //         <th>Patient Type</th>
    //         <th class="text-end">Amount</th>
    //         <th>Payment Mode</th>
    //         <th>Date/Time</th>
    //       </tr>
    //     </thead>
    //     <tbody>${rows}</tbody>
    //   </table>
    // `;

const rows = chunk.map((item, index) => `

  <tr>
    <td>${index + 1}</td> <!-- Sr# -->
    <td>${item.PatientType}</td>
    <td>${item.PaymentMode}</td>
    <td>${item.Total}</td>
    <td class="text-end">${item.TotalAmount}</td>
  </tr>
`).join('');

return `
  <table class="table">
    <thead>
      <tr>
        <th>Sr#</th>
        <th>Patient Type</th>
        <th>Payment Mode</th>
        <th>Count</th>
        <th class="text-end">Amount</th>
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
          <td class="text-end">${this.formatAmountWithCommas(this.closingData.cash)}</td>
        </tr>
        <tr>
          <td><strong>Credit Card Amount</strong></td>
          <td class="text-end text-warning">${this.formatAmountWithCommas(this.closingData.creditCard)}</td>
        </tr>
         <tr>
          <td><strong>Cheque Amount</strong></td>
          <td class="text-end text-warning">${this.formatAmountWithCommas(this.closingData.Cheque)}</td>
          </tr>
          <tr>
              <td><strong>Reward Points</strong></td>
              <td class="text-end text-success">${this.formatAmountWithCommas(this.closingData.RewardPoint)}</td>
          </tr>
          <tr>
            <td><strong>Online Payment</strong></td>
            <td class="text-end">
              <div class="d-flex justify-content-between">
                <span class="text-start">JS Bank : </span>
                <span>${this.formatAmountWithCommas(this.closingData.JSBANK)}</span>
              </div>
            </td>
          </tr>
        <tr>
          <td><strong>Total Amount</strong></td>
          <td class="text-end text-green fw-bold">${this.formatAmountWithCommas(this.closingData.totalAmount)}</td>
        </tr>
      </table>
    <div class="mt-3">
      <strong>Remarks:</strong>
      <div class="border p-2 " style="white-space: pre-wrap; word-break: break-word;">
        ${this.fdoClsoingRemarks ? this.fdoClsoingRemarks : 'No remarks entered.'}
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
          <tr><td colspan="2" class="text-end fw-bold">Cash Amount</td><td class="text-end fw-bold">Rs. ${this.formatAmountWithCommas(this.closingData.cash)}</td></tr>
          <tr>
            <td colspan="2" class="text-end fw-bold">Difference</td>
            <td class="text-end ${this.grandTotal === this.closingData.cash ? 'text-success' : 'text-danger'}">
              ${this.grandTotal === this.closingData.cash ? '<i class="bi bi-check-circle me-1"></i>Matched' : `Rs. ${(this.grandTotal - this.closingData.cash).toLocaleString()}`}
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
    const customWindow = window.open('', '', 'width=800,height=600');
    customWindow.document.write('<html><head><title>FDO Daily Sale</title>' + styleSheet + '</head><body>');
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

    customWindow.document.write(footer);
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



  // printReport() {

  //   if (this.fdoSalesData.find((a) => a.IsCancellationApprovelPending == 0)) {
  //     this.toastr.warning(
  //       "Cancellation approvals pending, Kindly ask your manager to approve cancellation requests",
  //       "Cancellation Approval Pending"
  //     );
  //     return;
  //   }

  //   this.searchText = "";
  //   let styleSheet = `
  //     <style>
  //       body {
  //         width: 21cm;
  //         margin: auto;
  //       }
  //       .printable-area {
  //         border-collapse: separate;
  //         border-spacing: 0;
  //         font-family: verdana, roboto, 'trebuchet MS', 'Lucida sans';
  //         color: #212121;
  //         background: #ffffff;
  //         width: 100%;
  //         font-size: 10px;
  //         text-align: left;
  //       }

  //       .printable-area thead > tr > th {
  //         border-right: 1px solid #C9CED3;
  //         border-bottom: 3px solid #eee;
  //         padding: 2px 2px 2px 5px;
  //       }
  //       .printable-area  tbody > tr > td {
  //         border-bottom: solid 1px #ededed;
  //         padding: 2px 2px 2px 5px;
  //       }

  //       .cost-column {
  //         text-align: right;
  //         padding-right: 5px;
  //       }
  //       .no-print{
  //         display:none;
  //       }
  //       .header-area{
  //         text-align: center;
  //         font-family: verdana, roboto, 'trebuchet MS', 'Lucida sans';
  //         margin-top:5px;
  //         margin-bottom:5px;
  //       }
  //       .report-name {
  //         font-weight: bold;
  //         font-size: 16px;
  //       }
  //       .branch-name {
  //         font-weight: bold;
  //         font-size: 14px;
  //       }
  //       .report-dates {
  //         font-weight: bold;
  //         font-size: 16px;
  //       }
  //       .sales-person-info {
  //         font-weight: bold;
  //         font-size: 16px;
  //       }
  //       .printed-by-area {
  //         font-size: 10px;
  //       }

  //       @media print {
  //         div.divFooter {
  //           position: fixed;
  //           bottom: 0;
  //           font-family: verdana, roboto, 'trebuchet MS', 'Lucida sans';
  //           font-size: 9px;
  //         }
  //         .non-printable{
  //         display: none
  //         }  
  //       }
  //     </style>`;

  //   let dates: any = [
  //     ...new Set(
  //       this.fdoSalesData.map((element) => {
  //         return moment(element.createdOn).format("DD-MMM-YYYY");
  //       })
  //     ),
  //   ];
  //   dates = dates.join(", ");
  //   // let printedByText = `<hr><div class="printed-by-area">Printed by: ${this.loggedInUser.username || this.loggedInUser.fullname || ''} @ ${moment(new Date()).format('DD-MMM-YYYY HH:mm:ss')} ${(this.loggedInUser.userid)}</div>`;
  //   let printedByText = `${this.loggedInUser.username || ""} @ ${moment(
  //     new Date()
  //   ).format("DD-MMM-YYYY HH:mm:ss")}`; // (${this.loggedInUser.userid})
  //   let header = `<div class="header-area">
  //                     <div class="report-name"><span class="label">Daily Sale</span></div>
  //                     <div class="branch-name"><span class="label">${
  //                       this.fdoSalesData[0].BranchCode
  //                     }</span></div>
  //                     <div>
  //                       <span class="report-dates"><span class="label">Date(s): </span> <span class="value">${dates}</span></span>
  //                       <span>&nbsp &nbsp</span>
  //                       <span class="sales-person-info"><span class="label">Name:</span> <span class="value">${
  //                         this.loggedInUser.fullname ||
  //                         this.loggedInUser.username ||
  //                         ""
  //                       }</span></span>
  //                     </div>
  //                     <div class="printed-by-area"><span class="label">Printed by:</span> <span class="value">${printedByText}</span></div>
  //                 </div>`;
  //   let footer = `<div class="divFooter printed-by-area">${printedByText} @ ${this.fdoSalesData[0].BranchCode}</div>`;

  //   // let data = $('.fdo-sales-table')[0].outerHTML;
  //   // data += $('.printable-area-totals')[0].outerHTML;
  //   setTimeout(() => {
  //     let data = "";
  //     document.querySelectorAll(".printable-area").forEach((e, i) => {
  //       data += e.outerHTML;
  //     });
  //     let customWindow = window.open(
  //       "FDO-Daily-Sale-Rport",
  //       "FDO-Daily-Sales-Rport" + +new Date()
  //     );
  //     customWindow.document.write("<html><head>" + styleSheet + "");
  //     customWindow.document.write("</head><body>");
  //     customWindow.document.write("<h3>" + header + "</h3>");
  //     customWindow.document.write(data);
  //     customWindow.document.write(footer);
  //     customWindow.document.write("</body></html>");
  //     customWindow.print();
  //     setTimeout((a) => {
  //       customWindow.close();
  //     }, 500);
  //   }, 500);
  // }
  /////

  fdoSummaryReport = [];

  @ViewChild("fdoSummaryModal") fdoSummaryModal;
  fdoSummaryProcess() {
    // this.fdoSummaryPopupRef = this.appPopupService.openModal(this.fdoSummaryModal, { backdrop: 'static', size: 'xl' });
    setTimeout(() => {
      this.getFDOSummaryReport(this.selectedDate);
    }, 200);
  }
  getFDOSummaryReport(selectedDate: string) {
    this.fdoSummaryReport = []
    if (!selectedDate) {
      console.warn("No date selected");
      return;
    }

    const params = {
      userId: this.loggedInUser.userid, // 2163, // 768 //
      date: moment(selectedDate, "DD-MMM-YYYY").format(
        "YYYY-MM-DDT00:00:00.000"
      ), //  new Date(),
    };
    this.fdoSummaryReport = [];
    this.spinner.show();
    this.patientService.getFDOSummaryReport(params).subscribe(
      (res: any) => {
        this.spinner.hide();
        console.log(res);
        if (res.StatusCode == 200) {
          this.fdoSummaryReport = res.PayLoad || [];
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  paymentModesList = [];
  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          const _response = resp.PayLoadDS || [];
          // Defer assignment to avoid NG0100 (sync emissions in dev mode)
          Promise.resolve().then(() => {
            this.paymentModesList = _response.Table5 || [];
          });
        },
        (err) => {
          console.log(err);
        }
      );
  }

PaymentModeSelected() {
  console.log("SelectedPaymentMode:", this.selectedPaymentMode);

  if (!this.selectedDate) {
    this.toastr.warning("Selected date is not set. Aborting filter.");
    this.pagination.paginatedSearchResults = [];
    return;
  }

  const formattedSelectedDate = moment(this.selectedDate).format("DD-MMM-YYYY");

  if (!this.fdoSalesDataAll || !Array.isArray(this.fdoSalesDataAll)) {
    this.toastr.warning("Sales Data is not available or not an array.");
    this.pagination.paginatedSearchResults = [];
    return;
  }

  this.fdoSalesData = this.fdoSalesDataAll.filter((entry) => {
    const entryDate = moment(entry.CreatedOn).format("DD-MMM-YYYY");
    const dateMatch = entryDate === formattedSelectedDate;
    const modeMatch =
      this.selectedPaymentMode && this.selectedPaymentMode.length > 0
        ? this.selectedPaymentMode.includes(entry.ModeId)
        : true;
    return dateMatch && modeMatch;
  });

  this.filterResults()
  this.calculateAmounts(this.fdoSalesData);
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

  calculateNoteTotals() {
    this.grandTotal = 0;
    for (const note of this.notes) {
      note.total = note.quantity * note.denomination;
      this.grandTotal += note.total;
    }
  }

   validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

   refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

   filterResults() {
       this.pagination.page = 1;
       const cols = ['VisitNo', 'ReceiptNo'];
       let results: any = this.fdoSalesData;
       if (this.searchText && this.searchText.length > 1) {
         const pipe_filterByKey = new FilterByKeyPipe();
         results = pipe_filterByKey.transform(this.fdoSalesData, this.searchText, cols, this.fdoSalesData);
       }
       this.pagination.filteredSearchResults = results;
       this.refreshPagination();
   }

   setCurrencyNotesNull(){
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
   }
    
}
