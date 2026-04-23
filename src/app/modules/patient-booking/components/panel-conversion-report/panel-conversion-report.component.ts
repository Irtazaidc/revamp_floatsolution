// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { LookupService } from '../../services/lookup.service';

@Component({
  standalone: false,

  selector: 'app-panel-conversion-report',
  templateUrl: './panel-conversion-report.component.html',
  styleUrls: ['./panel-conversion-report.component.scss']
})
export class PanelConversionReportComponent implements OnInit {
  panelConversionDataList: any = [];
  spinnerRefs = {
    dataTable: "dataTable",
  };

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    PanelID: [null],

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
    private lookupService: LookupService,
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

  getPanelConversionData() {
    this.panelConversionDataList = [];
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
    };
    this.spinner.show(this.spinnerRefs.dataTable);
    this.shared.getPanelConversionReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            this.panelConversionDataList = res.PayLoad;
            this.filterResults();
          } else {
            this.toasrt.info("No Record Found");
            this.panelConversionDataList = [];
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
    if (this.panelConversionDataList.length) {
      this.panelConversionDataList.forEach((d) => {
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
      "TPTitle",
      "RegPanel",
      "ConvertedPanel",
      "Price",
      "Discount",
      "ConvertedPrice",
    ];
    let results: any = this.panelConversionDataList;
    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.panelConversionDataList.filter((item: any) => {
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
}
