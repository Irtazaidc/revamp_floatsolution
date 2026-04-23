// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-alfalah-email-report",
  templateUrl: "./alfalah-email-report.component.html",
  styleUrls: ["./alfalah-email-report.component.scss"],
})
export class AlfalahEmailReportComponent implements OnInit {
  alfalahEmailList: any = [];
  spinnerRefs = {
    dataTable: "dataTable",
  };
  statusOptions = [
    { label: "Successfully sent", value: 1 },
    { label: "Not sent", value: 2 },
    { label: "Sent with error", value: 3 },
    { label: "All", value: -1 },
  ];

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
  };

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  isSubmitted = false;
  searchText = "";
  maxDate: any;
  allEmails = -1;
  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private shared: SharedService,
    private excelService: ExcelService,
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getAlfalahEmailData() {
    this.alfalahEmailList = [];
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
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      FilterBy: this.allEmails,
    };
    this.spinner.show(this.spinnerRefs.dataTable);
    this.shared.getAlfalahEmailReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            this.alfalahEmailList = res.PayLoad;
          } else {
            this.toasrt.info("No Record Found");
            this.alfalahEmailList = [];
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
  exportAsExcel() {
    const excelData = [];
    if (this.alfalahEmailList.length) {
      this.alfalahEmailList.forEach((d) => {
        excelData.push(d);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "Alfalah Email Report",
        "Alfalah Email Report",
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
      "VisitId",
      "EmailTo",
      "RegDate",
      "EmailStatus",
      "Attempts",
      "EMailAPIResponse",
    ];
    let results: any = this.alfalahEmailList;
    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.alfalahEmailList.filter((item: any) => {
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

  

  get totalSuccess(): number {
  return this.alfalahEmailList?.filter(
    x => x.EmailStatus === 'Successfully Sent'
  ).length || 0;
}

get totalFailed(): number {
  return this.alfalahEmailList?.filter(
    x => x.EmailStatus === 'Not SuccessFully Sent'
  ).length || 0;
}

get totalNotSent(): number {
  return this.alfalahEmailList?.filter(
    x => x.EmailStatus === 'Not Sent'
  ).length || 0;
}

selectedEmails: any[] = [];
selectAllFailed = false;

get failedEmails() {
  return this.alfalahEmailList?.filter(
    x => x.EmailStatus === 'Not SuccessFully Sent'
  ) || [];
}

get showResendButton(): boolean {
  return this.selectedEmails.length > 0;
}

toggleSelection(row: any, event: any) {
  if (event.target.checked) {
    this.selectedEmails.push(row);
  } else {
    this.selectedEmails = this.selectedEmails.filter(x => x !== row);
    this.selectAllFailed = false;
  }
}

toggleSelectAll(event: any) {
  this.selectAllFailed = event.target.checked;

  if (this.selectAllFailed) {
    this.selectedEmails = [...this.failedEmails];
  } else {
    this.selectedEmails = [];
  }
}

resendSelected() {
  if (!this.selectedEmails.length) {
    this.toasrt.warning("Please select at least one failed email");
    return;
  }

  // Extract MailIds
  const emailIds = this.selectedEmails
    .map(x => x.MailId)
    .filter(Boolean) // safety
    .join(',');

    console.log("Resending emails with IDs:", emailIds);

  if (!emailIds) {
    this.toasrt.error("Invalid Email IDs");
    return;
  }

  const objParams = {
    EmailIDs: emailIds,
    CreatedBy: this.loggedInUser.userid
  };

  this.spinner.show(this.spinnerRefs.dataTable);

  this.shared.resendAlfalahEmailReport(objParams).subscribe(
    (res: any) => {
      this.spinner.hide(this.spinnerRefs.dataTable);

      if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
        this.toasrt.success("Email resend request submitted successfully");

        // optional refresh
        this.selectedEmails = [];
        this.selectAllFailed = false;
        this.getAlfalahEmailData();
      } else {
        this.toasrt.error(res.Message || "Resend failed");
      }
    },
    (err) => {
      this.spinner.hide(this.spinnerRefs.dataTable);
      console.error(err);
      this.toasrt.error("Connection error while resending emails");
    }
  );
}


}
