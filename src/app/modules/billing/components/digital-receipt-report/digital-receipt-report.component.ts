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

@Component({
  standalone: false,

  selector: "app-digital-receipt-report",
  templateUrl: "./digital-receipt-report.component.html",
  styleUrls: ["./digital-receipt-report.component.scss"],
})
export class DigitalReceiptReportComponent implements OnInit {
  digitalReceiptDataList: any = [];

  spinnerRefs = {
    dataTable: "dataTable",
  };
   pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    ModeId: [],
  };

  isSubmitted = false;
  branchList = [];

  searchText = "";
  maxDate: any;

  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService,
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLookupsForRegistration();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        locID: this.loggedInUser.locationid,
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 500);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

getDigitalReceiptReportData() {
    this.digitalReceiptDataList = [];
    this.pagination.paginatedSearchResults = [];
    this.searchText = "";

    const formValues = this.filterForm.getRawValue();
    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;

    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day,
    );
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toasrt.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = "1 Month";
      this.toasrt.error(
        `The difference between dates should not exceed ${period}`,
      );
      this.isSubmitted = false;
      return;
    }

    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) ?? null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) ?? null,
      PaymentModeID: formValues.ModeId || -1,
    };
    this.spinner.show(this.spinnerRefs.dataTable);
    this.labTats.getDigitalReceiptReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            this.digitalReceiptDataList = res.PayLoad;
            this.filterResults();
          } else {
            this.toasrt.info("No Record Found");
            this.digitalReceiptDataList = [];
          }
        } else {
          this.toasrt.error("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dataTable);
        this.toasrt.error("Connection error");
      },
    );
  }



  paymentModesList = [];
  patientTypeList = [];
  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          const _response = resp.PayLoadDS || [];
          this.paymentModesList = _response.Table5 || [];
          this.patientTypeList = _response.Table6 || [];
        },
        (err) => {
          console.log(err);
        },
      );
  }

  exportAsExcel() {
  const excelData = [];
  if (this.digitalReceiptDataList.length) {
    // Add data rows
    this.digitalReceiptDataList.forEach((d, index) => {
      const row = {
        "Sr#": index + 1,
        "PIN": d.PIN,
        "Receipt No": d.ReceiptNo,
        "MR No": d.MRNo,
        "Patient Name": d.PatientName,
        "JS": d.JS,
        "MCB": d.MCB
      };
      excelData.push(row);
    });
    
    // Add total row
    excelData.push({
      "Sr#": "",
      "PIN": "",
      "Receipt No": "",
      "MR No": "",
      "Patient Name": "TOTAL",
      "JS": this.getTotalJS(),
      "MCB": this.getTotalMCB()
    });
    
    this.excelService.exportAsExcelFile(
      excelData,
      "Digital Receipt Report",
      "DigitalReceiptReport"
    );
  } else {
    this.toasrt.error("Cannot export empty table");
  }
}

  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize,
      );
  }

  filterResults() {
    this.pagination.page = 1;
    const cols = [
      "PIN",
      "ReceiptNo",
      "MRNo",
      "PatientName",
      "JS",
      "MCB",
    ];
    let results: any = this.digitalReceiptDataList;
    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.digitalReceiptDataList.filter((item: any) => {
        return cols.some((col) => {
          if (!item[col]) return false;

          let value = item[col].toString().toLowerCase();
          if (col === "VisitID") {
            value = value.replace(/-/g, "");
          }
          return value.includes(normalizedSearchText);
        });
      });
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }


  // Add these methods to your component class

getTotalJS(): number {
  if (!this.digitalReceiptDataList || this.digitalReceiptDataList.length === 0) {
    return 0;
  }
  return this.digitalReceiptDataList.reduce((total, item) => {
    const jsValue = Number(item.JS) || 0;
    return total + jsValue;
  }, 0);
}

getTotalMCB(): number {
  if (!this.digitalReceiptDataList || this.digitalReceiptDataList.length === 0) {
    return 0;
  }
  return this.digitalReceiptDataList.reduce((total, item) => {
    const mcbValue = Number(item.MCB) || 0;
    return total + mcbValue;
  }, 0);
}
}
