// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-ris-due-delay-reports",
  templateUrl: "./ris-due-delay-reports.component.html",
  styleUrls: ["./ris-due-delay-reports.component.scss"],
})
export class RisDueDelayReportsComponent implements OnInit {
  dueDelayReportDataList = [];
  loggedInUser: UserModel;
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
  spinnerRefs = {
    delayreportTable: "delayreportTable",
  };

  public delayFields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    LocIDs: [null],
    StatusID: [null],
    SubSectionID: [null],
    PanelID: [null],
  };

  filterDelayForm: FormGroup = this.formBuilder.group(this.delayFields);


  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private labTats: LabTatsService,
    private excelService: ExcelService
  ) {}

  ngOnInit(): void {
    this.getLocationList();
    this.getPanelList();
    this.getTestStatus();
    this.getSubSection();
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

  testStatusList = [];
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({ testCategory: 1 }).subscribe((resp: any) => {
      let _response = resp.PayLoad || [];
      this.testStatusList = _response;
    }, (err) => {
    })
  }
  panelList = [];
  getPanelList() {
    this.panelList = [];
    let _param = {};
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
  labDeptID = 2;
  subSectionList = [];
  getSubSection() {
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    };
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        this.subSectionList = resp.PayLoad;
      },
      (err) => {
        console.log("error:", err);
        this.toasrt.error("Connection error");
      }
    );
  }

  getdelayReportData() {
    this.pagination.paginatedSearchResults = [];

    let formValues = this.filterDelayForm.getRawValue();
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

    let objParams = {
      DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null,
      LocIDs: formValues.LocIDs?.join(",") || -1,
      StatusID: formValues.StatusID || -1,
      SubSectionID: formValues.SubSectionID || -1,
      PanelIDs: formValues.PanelID ? formValues.PanelID.join(",") : -1,
    };
    console.log("objParams:::::::: ", objParams);
    this.spinner.show(this.spinnerRefs.delayreportTable);
    this.labTats.getDueDelayReportForRIS(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.delayreportTable);
        if (res.StatusCode == 200 && res.PayLoad.length) {
          this.dueDelayReportDataList = res.PayLoad;
          console.log("res:", res);
          this.filterResults()
        } else {
          this.toasrt.info("No Record Found");
          this.dueDelayReportDataList = [];
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.delayreportTable);
        this.toasrt.error("Connection error");
      }
    );
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.branchList = data || [];
          this.branchList = this.branchList.sort((a, b) => {
            if (a.Code > b.Code) {
              return 1;
            } else if (a.Code < b.Code) {
              return -1;
            } else {
              return 0;
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  onSelectAllDelayBranches() {
    this.filterDelayForm.patchValue({
      LocIDs: this.branchList.map((a) => a.LocId),
    });
  }
  onUnselectAllDelayBranches() {
    this.filterDelayForm.patchValue({
      LocIDs: [],
    });
  }

  exportAsExcel() {
    const excelData = [];
    if (this.dueDelayReportDataList.length) {
      this.dueDelayReportDataList.forEach((d, index) => {
        const row = {
          "Sr#": index + 1,
          "Patient Name": d.PatientName,
          PIN: d.PIN,
          "Test Name": d.TestName,
          "Delivery Date": d.DeliveryDate,
          "Delayed Time": d.DelayedTimeInMin,
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "Delay Report Details",
        "DelayReportDetails"
      );
    } else {
      this.toasrt.error("Cannot export empty table");
    }
  }

  onSelectAllPanels() {
    this.filterDelayForm.patchValue({
      PanelID: this.panelList.map(a => a.PanelId)
    });
  }
  onUnselectAllPanels() {
    this.filterDelayForm.patchValue({
      PanelID: []
    });
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

  const cols = [
    'PatientName',
    'PIN',
    'TestName',
    'DeliveryDate',
    'DelayedTimeInMin',
  ];

  let results: any = this.dueDelayReportDataList;

  if (this.searchText && this.searchText.length > 1) {
    const normalizedSearchText = this.searchText
      .replace(/-/g, '')
      .toLowerCase();

    results = this.dueDelayReportDataList.filter((item: any) => {
      return cols.some((col) => {
        if (!item[col]) return false;

        const value = item[col]
          .toString()
          .replace(/-/g, '')   // 🔥 FIX HERE
          .toLowerCase();

        return value.includes(normalizedSearchText);
      });
    });
  }

  this.pagination.filteredSearchResults = results;
  this.refreshPagination();
}
}
