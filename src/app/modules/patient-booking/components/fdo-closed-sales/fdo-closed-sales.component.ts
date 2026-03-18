// @ts-nocheck
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { FilterByKeyPipe } from "src/app/modules/shared/pipes/filter-by-key.pipe";
import { LookupService } from "../../services/lookup.service";
import { PatientService } from "../../services/patient.service";

@Component({
  standalone: false,

  selector: "app-fdo-closed-sales",
  templateUrl: "./fdo-closed-sales.component.html",
  styleUrls: ["./fdo-closed-sales.component.scss"],
})
export class FdoClosedSalesComponent implements OnInit {
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
    Cheque: 0,
  };
  RadioEditStatus = null;
  StatusID = 7;
  fdoSummaryPopupRef: NgbModalRef;

  spinnerRefs = {
    SalesDataBar: "SalesDataBar",
  };

  selectedPaymentMode = null;

  pagination = {
    page: 1,
    pageSize: 5,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  constructor(
    private patientService: PatientService,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.auth.currentUserValue;
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.getAllSaleByFDO();
    this.getLookupsForRegistration();
  }

  getAllSaleByFDO() {
    let params = {
      userId: this.loggedInUser.userid, // 2163, // 768 //
      fromDate: moment().subtract(7, "days").format("YYYY-MM-DDT00:00:00.000"), //moment(new Date()).subtract(50, 'years').format('YYYY-MM-DDT00:00:00.000'), //  new Date(),
      toDate: moment(new Date()).format("YYYY-MM-DDT23:59:59.996"), // new Date()
      ClosingID:-1,
    };
    this.selectedDate = "";
    this.fdoClsoingRemarks = "";
    this.fdoSalesDataAll = [];
    this.fdoSalesData = [];

    this.pagination.paginatedSearchResults = [];
    this.fdoSalesDates = [];
    this.calculateAmounts(this.fdoSalesData);
    this.spinner.show(this.spinnerRefs.SalesDataBar);
    this.patientService.getAllSaleByFDO(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.SalesDataBar);
        console.log(res);
        if (res.StatusCode == 200) {
          this.fdoSalesDataAll = res.PayLoad || [];
          // this.fdoSalesData = res.payLoad || [];
          let xDates = [
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
    this.filterResults();
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
            (a) => (a.PaymentMode || "").toLowerCase().trim() == "credit card"
          )
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
        RewardPoint: data
          .filter(
            (a) => (a.PaymentMode || "").toLowerCase().trim() == "reward point"
          )
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
        Cheque: data
          .filter((a) => (a.PaymentMode || "").toLowerCase().trim() == "cheque")
          .map((a) => a.PaidAmount)
          .reduce((a, b) => a + b, 0),
      };
    } else {
      this.closingData = {
        totalAmount: 0,
        cash: 0,
        creditCard: 0,
        RewardPoint: 0,
        Cheque: 0,
      };
    }
  }

  formatAmountWithCommas(value) {
    return value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  paymentModesList = [];
  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          let _response = resp.PayLoadDS || [];
          this.paymentModesList = _response.Table5 || [];
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

    const formattedSelectedDate = moment(this.selectedDate).format(
      "DD-MMM-YYYY"
    );

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

    this.filterResults();
    this.calculateAmounts(this.fdoSalesData);
  }

  grandTotal = 0;

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  refreshPagination() {
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

  filterResults() {
    this.pagination.page = 1;
    let cols = ["VisitNo", "ReceiptNo"];
    let results: any = this.fdoSalesData;
    if (this.searchText && this.searchText.length > 1) {
      let pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(
        this.fdoSalesData,
        this.searchText,
        cols,
        this.fdoSalesData
      );
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }
}
