// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { forkJoin } from "rxjs";
import { DatePipe } from "@angular/common";

@Component({
  standalone: false,

  selector: "app-user-cash-report",
  templateUrl: "./user-cash-report.component.html",
  styleUrls: ["./user-cash-report.component.scss"],
})
export class UserCashReportComponent implements OnInit {
  isSubmitted = false;
  branchList = [];

  searchText = "";
  maxDate: any;
  userCashDataList: any = [];
  paymentModesList = [];
  patientTypeList = [];
  TotalCash: number = 0;
  TotalCC: number = 0;
  reportType = null;
  ifDetail = false;
  ifSummary = false;

  spinnerRefs = {
    delayreportTable: "delayreportTable",
  };

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    locID: [, Validators.required],
    ModeId: [],
    UserId: [],
    TypeId: [],
  };
  filterForm: FormGroup = this.formBuilder.group(this.Fields);
  loggedInUser: UserModel;
  employeesList: any[];
  groupedUserCashData: any[] = [];
  totalAmount: number = 0;
  totalPayments: number = 0;
  totalRefunds: number = 0;
  totalRegularCash: number = 0;
  totalRegularCC: number = 0;
  totalRegularOnline: number = 0;
  totalRegularChq: number = 0;
  totalCashInst: number = 0;
  totalCCInst: number = 0;
  totalChqInst: number = 0;
  totalROnlineInst: number = 0;
  totalCashRefund: number = 0;
  totalCreditCardRefund: number = 0;
  totalRefundOnline: number = 0;


  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
    this.getEmployeesData();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 500);
    
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getTotal(data: any): number {
    return (
      (data.Cash || 0) +
      (data.CC || 0) +
      (data.OnlinePayment || 0) +
      (data.Cheque || 0) +
      (data.DemandDraft || 0) +
      (data.RewardPoints || 0) -
      (data.Refund || 0)
    );
  }

  getUserCashSummaryReportData() {
    const formValues = this.filterForm.getRawValue();
    const spinnerRef = this.spinnerRefs.delayreportTable;

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please fill the mandatory fields");
      this.isSubmitted = true;
      return;
    }
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toasrt.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      this.toasrt.error(
        `The difference between dates should not exceed 1 Month`
      );
      this.isSubmitted = false;
      return;
    }

    this.ifSummary = true;

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) ?? null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) ?? null,
      LocIDs: formValues.locID.join(",") || -1,
      PaymentMode: formValues.ModeId || -1,
      CreatedBy: formValues.UserId || -1,
    };

    this.spinner.show(spinnerRef);
    this.labTats.getUserCashSummaryReport(objParams).subscribe({
      next: (res: any) => {
        this.spinner.hide(spinnerRef);

        if (
          res?.StatusCode === 200 &&
          Array.isArray(res?.PayLoadDS?.Table) &&
          res.PayLoadDS.Table.length
        ) {
          const data = res.PayLoadDS.Table;
          this.userCashDataList = data || [];
          console.log("Raw userCashDataList::", this.userCashDataList);

          // ✅ Group by EmployeeName
          const grouped = data.reduce((acc, item) => {
            const user = item.EmployeeName || "Unknown";

            if (!acc[user]) {
              acc[user] = {
                UserName: user,
                records: [],
                totals: {
                  Cash: 0,
                  CreditCard: 0,
                  OnlinePayment: 0,
                  CashInst: 0,
                  CreditCardInst: 0,
                  OnlinePaymentInst: 0,
                  CashRefund: 0,
                  CreditCardRefund: 0,
                  OnlinePaymentRefund: 0,
                },
                expanded: false,
              };
            }

            acc[user].records.push(item);

            // ✅ Add values to each section total
            acc[user].totals.Cash += item.Cash || 0;
            acc[user].totals.CreditCard += item.CreditCard || 0;
            acc[user].totals.OnlinePayment += item.OnlinePayment || 0;
            acc[user].totals.CashInst += item.CashInst || 0;
            acc[user].totals.CreditCardInst += item.CreditCardInst || 0;
            acc[user].totals.OnlinePaymentInst += item.OnlinePaymentInst || 0;
            acc[user].totals.CashRefund += item.CashRefund || 0;
            acc[user].totals.CreditCardRefund += item.CreditCardRefund || 0;
            acc[user].totals.OnlinePaymentRefund += item.OnlinePaymentRefund || 0;

            return acc;
          }, {});

          this.groupedUserCashData = Object.values(grouped);

          // ✅ Calculate grand totals (Regular + Installment + Refund)
          this.totalRegularCash = data.reduce(
            (sum, x) => sum + (x.Cash || 0),
            0
          );
          this.totalRegularCC = data.reduce(
            (sum, x) => sum + (x.CreditCard || 0),
            0
          );
          this.totalRegularOnline = data.reduce(
            (sum, x) => sum + (x.OnlinePayment || 0),
            0
          );
          this.totalCashInst = data.reduce(
            (sum, x) => sum + (x.CashInst || 0),
            0
          );
          this.totalCCInst = data.reduce(
            (sum, x) => sum + (x.CreditCardInst || 0),
            0
          );
          this.totalROnlineInst = data.reduce(
            (sum, x) => sum + (x.OnlinePaymentInst || 0),
            0
          );
          this.totalCashRefund = data.reduce(
            (sum, x) => sum + (x.CashRefund || 0),
            0
          );
          this.totalCreditCardRefund = data.reduce(
            (sum, x) => sum + (x.CreditCardRefund || 0),
            0
          );
          this.totalRefundOnline = data.reduce(
            (sum, x) => sum + (x.OnlinePaymentRefund || 0),
            0
          );

          // ✅ Total Amount (Regular + Installment - Refund)
          this.totalAmount =
            this.totalRegularCash +
            this.totalRegularCC +
            this.totalRegularOnline +
            this.totalCashInst +
            this.totalCCInst +
            this.totalROnlineInst -
            this.totalCashRefund +
            this.totalCreditCardRefund +
            this.totalRefundOnline;
        } else {
          this.toasrt.info("No Record Found");
          this.userCashDataList = [];
          this.groupedUserCashData = [];
          this.totalAmount =
            this.totalRegularCash =
            this.totalRegularCC =
            this.totalRegularOnline =
            this.totalCashInst =
            this.totalCCInst =
            this.totalROnlineInst =
            this.totalCashRefund =
            this.totalCreditCardRefund =
            this.totalRefundOnline =
              0;
        }
      },
      error: (err) => {
        console.error("Error fetching report:", err);
        this.spinner.hide(spinnerRef);
        this.toasrt.error("Connection error");
      },
    });
  }
  getUserCashDetailReportData() {
    let formValues = this.filterForm.getRawValue();
    const spinnerRef = this.spinnerRefs.delayreportTable;

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    this.ifDetail = true;

    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    if (toDate < fromDate) {
      this.toasrt.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));
    if (daysDifference > maxDaysDifference) {
      this.toasrt.error(
        `The difference between dates should not exceed 1 Month`
      );
      this.isSubmitted = false;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) ?? null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) ?? null,
      LocIDs: formValues.locID.join(",") || -1,
      PaymentMode: formValues.ModeId || -1,
      CreatedBy: formValues.UserId || -1,
    };

    this.spinner.show(spinnerRef);
    this.labTats.getUserCashDetailReport(objParams).subscribe({
      next: (res: any) => {
        this.spinner.hide(spinnerRef);

        if (
          res?.StatusCode === 200 &&
          Array.isArray(res?.PayLoadDS?.Table) &&
          res.PayLoadDS.Table.length
        ) {
          this.userCashDataList = res.PayLoadDS.Table || [];
          console.log("userCashDataList:", this.userCashDataList);

          // ✅ Group data by UserName
          this.groupedUserCashData = this.groupDataByUser(
            this.userCashDataList
          );
          this.expandedUsers = {};

          // ✅ Totals (overall)
          this.TotalCash = this.userCashDataList.reduce(
            (sum, item) => sum + (item.Cash || 0) + (item.CashInst || 0),
            0
          );
          this.TotalCC = this.userCashDataList.reduce(
            (sum, item) => sum + (item.CC || 0) + (item.CCInst || 0),
            0
          );
        } else {
          this.toasrt.info("No Record Found");
          this.userCashDataList = [];
          this.groupedUserCashData = [];
          this.TotalCash = 0;
          this.TotalCC = 0;
        }
      },
      error: (err) => {
        console.error("Error fetching report:", err);
        this.spinner.hide(spinnerRef);
        this.toasrt.error("Connection error");
      },
    });
  }

  // ✅ Helper to group data by UserName
  groupDataByUser(data: any[]): any[] {
    const grouped = data.reduce((acc, curr) => {
      const user = curr.UserName || "Unknown";
      if (!acc[user]) acc[user] = [];
      acc[user].push(curr);
      return acc;
    }, {});

    return Object.keys(grouped).map((user) => ({
      userName: user,
      records: grouped[user],
      totals: this.calculateUserTotals(grouped[user]),
    }));
  }

  // ✅ Helper to calculate totals for each user
  calculateUserTotals(records: any[]) {
    // Step 1: Calculate individual sums
    const totalPayments = records.reduce(
      (sum, r) =>
        sum +
        ((r.Cash || 0) +
          (r.CC || 0) +
          (r.Cheque || 0) +
          (r.OnlinePayment || 0) +
          (r.CashInst || 0) +
          (r.CCInst || 0) +
          (r.ChequeInst || 0) +
          (r.OnlinePaymentInst || 0) +
          (r.DemandDraft || 0) +
          (r.RewardPoints || 0)),
      0
    );

    const totalRefunds = records.reduce(
      (sum, r) => sum + ((r.RefundCash || 0) + (r.RefundCC || 0) + (r.RefundOnlinePayment || 0)) ,
      0
    );

    // Step 2: Calculate other breakdown totals
    const totalCash = records.reduce((sum, r) => sum + (r.Cash || 0), 0);
    const totalCC = records.reduce((sum, r) => sum + (r.CC || 0), 0);
    const totalCheque = records.reduce((sum, r) => sum + (r.Cheque || 0), 0);
    const totalOnlinePayment = records.reduce((sum, r) => sum + (r.OnlinePayment || 0), 0);
    const totalCashInst = records.reduce(
      (sum, r) => sum + (r.CashInst || 0),
      0
    );
    const totalCCInst = records.reduce((sum, r) => sum + (r.CCInst || 0), 0);
    const totalChequeInst = records.reduce(
      (sum, r) => sum + (r.ChequeInst || 0),
      0
    );
    const totalOnlinePaymentInst = records.reduce((sum, r) => sum + (r.OnlinePaymentInst || 0), 0);
    const totalDD = records.reduce((sum, r) => sum + (r.DemandDraft || 0), 0);
    const totalReward = records.reduce(
      (sum, r) => sum + (r.RewardPoints || 0),
      0
    );
    const totalRefundCash = records.reduce(
      (sum, r) => sum + (r.RefundCash || 0),
      0
    );
    const totalRefundCC = records.reduce(
      (sum, r) => sum + (r.RefundCC || 0),
      0
    );
    const totalRefundOnlinePayment = records.reduce(
      (sum, r) => sum + (r.RefundOnlinePayment || 0),
      0
    );

    // Step 3: Compute final total
    const totalAmount = totalPayments - totalRefunds;

    // Step 4: Return object
    return {
      totalPayments,
      totalRefunds,
      totalAmount,
      totalCash,
      totalCC,
      totalCheque,
      totalOnlinePayment,
      totalCashInst,
      totalCCInst,
      totalChequeInst,
      totalOnlinePaymentInst,
      totalDD,
      totalReward,
      totalRefundCash,
      totalRefundCC,
      totalRefundOnlinePayment
    };
  }

  expandedUsers: { [user: string]: boolean } = {};

  // ✅ Expand/Collapse toggle
  toggleUser(user: string) {
    this.expandedUsers[user] = !this.expandedUsers[user];
  }

  getLookupsForRegistration() {
    let param = {};
    this.paymentModesList = [];
    this.lookupService.getLookupsForRegistration(param)
      .subscribe(
        (resp: any) => {
          let _response = resp.PayLoadDS || [];
          this.paymentModesList = _response.Table9 || [];
        },
        (err) => {
          console.log(err);
        }
      );
  }

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

  getEmployeesData() {
    this.employeesList = [];
    let objParam = {
      DepartmentId: -1,
      DesignationId: -1,
      locId: -1,
    };

    this.lookupService.getEmployeeListByLocID(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          let data = res.PayLoadDS.Table;
          try {
            data = JSON.parse(data);
          } catch (ex) {}

          this.employeesList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  exportAsExcel() {
    const excelData = [];
    if (this.userCashDataList.length) {
      this.userCashDataList.forEach((d) => {
        const row = {
          Name: d.UserName,
          Date: this.datePipe.transform(d.RecDate, "dd MMM, yyyy") || "--",
          "Total Amount":
            d.Cash +
            d.CC +
            d.Cheque +
            d.DemandDraft +
            d.RewardPoints +
            d.Refund,
          Cash: d.Cash || "--",
          "Credit Card": d.CC || "--",
          Cheque: d.Cheque || "--",
          "Demand Draft": d.DemandDraft || "--",
          "Reward Points": d.RewardPoints || "--",
          Refund: d.Refund || "--",
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "User Cash Summary Report",
        "User-Cash-Summary-Report"
      );
    } else {
      this.toasrt.error("Cannot export empty table");
    }
  }

  onChange(event: any) {
    console.log("Selected Report Type::", event);
    this.onMonthlyRadioChange(this.reportType);
    this.reportType = event;
  }

  onMonthlyRadioChange(reportTypeValue: string) {
    const isDisabled = reportTypeValue === "1";
    const modeControl = this.filterForm.get("ModeId");

    if (isDisabled) {
      modeControl?.reset();
      modeControl?.disable();
    } else {
      modeControl?.enable();
    }
    this.reportType = reportTypeValue;
  }

  searchDataList() {
    if (!this.reportType) {
      this.toasrt.warning("Select Report Type");
      return;
    }
    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    this.ifSummary = false;
    this.ifDetail = false;
    if (this.reportType == 1) {
      this.getUserCashSummaryReportData();
    }
    if (this.reportType == 2) {
      this.getUserCashDetailReportData();
    }
  }

  //   get totalAmount(): number {
  //   return (
  //     this.userCashDataList?.reduce(
  //       (sum, d) => sum + ((d.Cash || 0) + (d.CC || 0) + (d.Cheque || 0) + (d.CashInst || 0) + (d.CCInst || 0) + (d.ChqInst || 0)),
  //       0
  //     ) || 0
  //   );
  // }
  //   get totalRegularCash(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.Cash || 0), 0) || 0;
  // }
  //   get totalRegularCC(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.CC || 0), 0) || 0;
  // }
  //   get totalRegularChq(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.Chq || 0), 0) || 0;
  // }
  //   get totalCashInst(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.CashInst || 0), 0) || 0;
  // }
  //   get totalCCInst(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.CCInst || 0), 0) || 0;
  // }
  //   get totalChqInst(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.ChqInst || 0), 0) || 0;
  // }

  // Grand total of "Total Amount" column
  // get grandTotal(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + this.getTotal(d), 0) || 0;
  // }

  // // Optional: individual column totals
  // get totalCash(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.Cash || 0), 0) || 0;
  // }
  // get totalCC(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.CC || 0), 0) || 0;
  // }
  // get totalCheque(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.Cheque || 0), 0) || 0;
  // }
  // get totalDemandDraft(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.DemandDraft || 0), 0) || 0;
  // }
  // get totalRewardPoints(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.RewardPoints || 0), 0) || 0;
  // }
  // get totalRefund(): number {
  //   return this.userCashDataList?.reduce((sum, d) => sum + (d.Refund || 0), 0) || 0;
  // }
}
