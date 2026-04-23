// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-panel-services-share",
  templateUrl: "./panel-services-share.component.html",
  styleUrls: ["./panel-services-share.component.scss"],
})
export class PanelServicesShareComponent implements OnInit {
  panelServicesShareDataList = [];
  loggedInUser: UserModel;
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
  spinnerRefs = {
    delayreportTable: "delayreportTable",
  };

  public delayFields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    PanelID: [null],
  };

  filterDelayForm: FormGroup = this.formBuilder.group(this.delayFields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private shared: SharedService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.getPanelList();
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.filterDelayForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  panelList = [];
  getPanelList() {
    this.panelList = [];
    const _param = {};
    this.lookupService.getPanels(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.panelList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getPanelServicesShareData() {
    this.pagination.paginatedSearchResults = [];

    const formValues = this.filterDelayForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(
      dateFrom.year,
      dateFrom.month - 1,
      dateFrom.day
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
      const period = "1 month";
      this.toasrt.error(
        `The difference between dates should not exceed ${period}`
      );
      this.isSubmitted = false;
      return;
    }

    if (this.filterDelayForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const objParams = {
      FromDate: formValues.dateFrom
        ? Conversions.formatDateObject(formValues.dateFrom)
        : null,
      ToDate: formValues.dateTo
        ? Conversions.formatDateObject(formValues.dateTo)
        : null,
      PanelId: formValues.PanelID || -1,
    };
    console.log("objParams:::::::: ", objParams);
    this.spinner.show(this.spinnerRefs.delayreportTable);
    this.shared.getPanelServicesShare(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.delayreportTable);
        if (res.StatusCode == 200 && res.PayLoad.length) {
          this.panelServicesShareDataList = res.PayLoad;
          console.log("res:", res);
          this.filterResults();
        } else {
          this.toasrt.info("No Record Found");
          this.panelServicesShareDataList = [];
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.delayreportTable);
        this.toasrt.error("Connection error");
      }
    );
  }

  exportAsExcel() {
    const excelData = [];
    if (this.panelServicesShareDataList.length) {
      this.panelServicesShareDataList.forEach((d, index) => {
        const row = {
          "Sr#": index + 1,
          "Patient Name": d.Name,
          "Age": d.Age,
          "Gender": d.Gender,
          "MRN": d.MRN,
          "Visit ID": d.VisitId,
          "Visit Date": d.VisitDate,
          "Test Name": d.Title,
          "Test Code": d.TPCode,
          "Net Price": d.NetPrice,
          "Share": d.Share,
          "Panel": d.PanelCode,
          "Lab Share Percent": d.LabSharePercent,
          "Radio Share Percent": d.RadioSharePercent,
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "Panel Services Share",
        "Panel Services Share"
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
          this.pagination.pageSize
      );
  }
  filterResults() {
    this.pagination.page = 1;

    const cols = [
      "MRN",
      "Name",
      "Age",
      "Gender",
      "VisitId",
      "LabSharePercent",
      "RadioSharePercent",
      "VisitDate",
      "TPId",
      "TPCode",
      "Title",
      "NetPrice",
      "Share",
      "PanelId",
      "PanelCode",
      "PanelName",
      "RefBy",
    ];

    let results: any = this.panelServicesShareDataList;

    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.panelServicesShareDataList.filter((item: any) => {
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

    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }
}
