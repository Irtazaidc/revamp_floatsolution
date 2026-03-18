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
import { SharedService } from "src/app/modules/shared/services/shared.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

@Component({
  standalone: false,

  selector: "app-app-user-count-report",
  templateUrl: "./app-user-count-report.component.html",
  styleUrls: ["./app-user-count-report.component.scss"],
})
export class AppUserCountReportComponent implements OnInit {
  loggedInUser: UserModel;

  spinnerRefs = {
    dataTable: "dataTable",
  };

  appUserDataList: any = [];
  dynamicColumns: string[] = [];
  displayColumns: string[] = [];
  groupedData: { branch: string; city: string; records: any[] }[] = [];

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    locationid: [null],
    groupType: [],
  };

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  isSubmitted = false;
  branchList = [];
  searchText = "";
  maxDate: any;
  filterForm: FormGroup = this.formBuilder.group(this.Fields);
  BranchesList: any = [];

  ForGroup = "DAILY";
  groupOption = [
    { label: "Day", value: "DAILY" },
    { label: "Week", value: "WEEKLY" },
    { label: "Year", value: "MONTHLY" },
  ];

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverMessage: "",
    confirmText: `<i class='fa fa-file-excel-o'></i> Excel`,
    cancelText: `<i class='fa fa-file-pdf-o'></i> PDF`,
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => this.exportAsPDF(),
  };

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private shared: SharedService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.getBranches();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  validateDateRange(): boolean {
    const { dateFrom, dateTo } = this.filterForm.getRawValue();

    const from = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const to = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (to < from) {
      this.toastr.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    const diffDays =
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (this.ForGroup === "DAILY" && diffDays > 10) {
      this.toastr.warning("Daily report allows maximum 10 days range");
      return false;
    }

    if (this.ForGroup === "WEEKLY" && (diffDays < 60 || diffDays > 90)) {
      this.toastr.warning(
        "Weekly report requires date range between 60 and 90 days"
      );
      return false;
    }

    if (this.ForGroup === "MONTHLY" && (diffDays < 180 || diffDays > 730)) {
      this.toastr.warning(
        "Yearly report requires date range between 6 months and 2 years"
      );
      return false;
    }

    return true;
  }

  getBranches() {
    this.BranchesList = [];
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        let _response = resp.PayLoad;
        _response.forEach((element, index) => {
          _response[index].Title = (element.Title || "").replace(
            "Islamabad Diagnostic Centre (Pvt) Ltd",
            "IDC "
          );
        });
        this.BranchesList = _response;
      },
      (err) => {}
    );
  }

  private getISOWeekStartDate(year: number, week: number): Date {
    const date = new Date(year, 0, 1);
    const day = date.getDay() || 7;

    // Move to first ISO week
    date.setDate(date.getDate() + (week - 1) * 7 + (1 - day));

    // Ensure Monday
    if (date.getDay() !== 1) {
      date.setDate(date.getDate() + (1 - date.getDay()));
    }

    return date;
  }
  private getWeekOfMonth(date: Date): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    return Math.floor((date.getDate() + offset - 1) / 7) + 1;
  }
  private getOrdinal(num: number): string {
    if (num % 10 === 1 && num !== 11) return `${num}st`;
    if (num % 10 === 2 && num !== 12) return `${num}nd`;
    if (num % 10 === 3 && num !== 13) return `${num}rd`;
    return `${num}th`;
  }

  getAppUserData(): void {
    this.appUserDataList = [];
    this.groupedData = [];
    this.dynamicColumns = [];
    this.displayColumns = [];

    if (this.filterForm.invalid) {
      this.toastr.warning("Please fill mandatory fields");
      return;
    }

    if (!this.validateDateRange()) return;

    const formValues = this.filterForm.getRawValue();

    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom),
      DateTo: Conversions.formatDateObject(formValues.dateTo),
      LocID: formValues.locationid || -1,
      GroupBy: this.ForGroup,
    };

    this.spinner.show(this.spinnerRefs.dataTable);

    this.shared.getAppUserCount(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);

        if (res.StatusCode === 200 && res.PayLoad?.length) {
          this.appUserDataList = res.PayLoad;

          const ignoreKeys = [
            "Sr. No",
            "BranchName",
            "City",
            "RecordType",
            "Average",
          ];

          const rawColumns = Object.keys(res.PayLoad[0]).filter(
            (key) => !ignoreKeys.includes(key)
          );

          
          this.dynamicColumns = rawColumns;

          // ✅ FIXED DISPLAY COLUMN LOGIC
          this.displayColumns = rawColumns.map((col) => {
            /* ================= WEEKLY ================= */
            if (this.ForGroup === "WEEKLY" && col.startsWith("Wk-")) {
              const [, year, week] = col.split("-");
              return `${year}-WK${week}`;
            }

            /* ================= DAILY ================= */
            if (this.ForGroup === "DAILY") {
              return col; // ✔ display exactly what API sends
            }
            /* ================= MONTHLY ================= */
            if (this.ForGroup === "MONTHLY") {
              return new Date(col + "-01").toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
              });
            }

            return col;
          });

          /* ================= GROUP BY BRANCH + CITY ================= */
          const groupedObj: { [key: string]: any[] } = {};

          this.appUserDataList.forEach((row) => {
            const key = `${row.BranchName} - ${row.City}`;
            if (!groupedObj[key]) groupedObj[key] = [];
            groupedObj[key].push(row);
          });

          this.groupedData = Object.keys(groupedObj).map((key) => {
            const [branch, city] = key.split(" - ");
            return { branch, city, records: groupedObj[key] };
          });
        } else {
          this.toastr.info("No record found");
        }
      },
      () => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        this.toastr.error("Connection error");
      }
    );
  }

  exportAsExcel() {
    if (!this.groupedData || this.groupedData.length === 0) {
      this.toastr.error("Cannot export empty table");
      return;
    }

    const excelData: any[] = [];

    this.groupedData.forEach((group) => {
      /* 🔹 Group Header Row */
      excelData.push({
        "Branch / City": `${group.branch} - ${group.city}`,
      });

      /* 🔹 Column Headers */
      const headerRow: any = {
        "#": "#",
        "Record Type": "Record Type",
      };

      this.displayColumns.forEach((col) => {
        headerRow[col] = col;
      });

      headerRow["Average"] = "Average";
      excelData.push(headerRow);

      /* 🔹 Data Rows */
      group.records.forEach((row, index) => {
        const dataRow: any = {
          "#": index + 1,
          "Record Type": row.RecordType,
        };

        this.dynamicColumns.forEach((col) => {
          dataRow[col] = row[col] !== null ? row[col] : "-";
        });

        dataRow["Average"] = row.Average !== null ? row.Average : "-";
        excelData.push(dataRow);
      });

      /* 🔹 Empty row between groups */
      excelData.push({});
    });

    this.excelService.exportAsExcelFile(
      excelData,
      "MyIDC_App_User_Count_Report",
      "MyIDC App User Count Report"
    );
  }

  exportAsPDF() {
    const doc = new jsPDF("l", "mm", "a4"); // landscape

    const title = "MyIDC App User Count Report";
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, 15, { align: "center" });

    let startY = 25;

    this.groupedData.forEach((group, groupIndex) => {
      // Group Header
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${group.branch} - ${group.city}`, 14, startY);

      startY += 4;

      // Table Columns
      const head = [["#", "Record Type", ...this.displayColumns, "Average"]];

      // Table Rows
      const body = group.records.map((row, index) => [
        index + 1,
        row.RecordType,
        ...this.dynamicColumns.map((col) =>
          row[col] !== null ? row[col] : "-"
        ),
        row.Average !== null ? row.Average : "-",
      ]);

      autoTable(doc, {
        head,
        body,
        startY,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [52, 58, 64], // dark header
          textColor: 255,
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          startY = 20;
        },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;

      // Page break if needed
      if (startY > 180 && groupIndex < this.groupedData.length - 1) {
        doc.addPage();
        startY = 20;
      }
    });

    doc.save("App_User_Count_Report.pdf");
  }

  filterResults() {
    this.pagination.page = 1;

    const cols = ["BranchName", "City", "RecordType"];

    let results: any = this.groupedData;

    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.groupedData.filter((item: any) => {
        return cols.some((col) => {
          if (!item[col]) return false;

          const value = item[col]
            .toString()
            .replace(/-/g, "") // 🔥 FIX HERE
            .toLowerCase();

          return value.includes(normalizedSearchText);
        });
      });
    }
  }
}
