// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { RISCommonService } from "../../services/ris-common.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { ExcelService } from "src/app/modules/business-suite/excel.service";

@Component({
  standalone: false,

  selector: "app-machine-utilization-report",
  templateUrl: "./machine-utilization-report.component.html",
  styleUrls: ["./machine-utilization-report.component.scss"],
})
export class MachineUtilizationReportComponent implements OnInit {
  public Fields = {
    date: ["", Validators.required],
    machineBranch: [, Validators.required],
    machineId: [, Validators.required],
  };
  maxDate: any;
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  machineUtilizationForm: FormGroup = this.formBuilder.group(this.Fields);
  disabledButton: boolean = false;
  MachineList = [];
  RISMachineID: any = null;
  BranchesList: any = [];
  utilizationList: any = [];
  isSubmitted = false;
  isSpinner: boolean = true;
  isDisable = false;
  spinnerRefs = {
    listSection: "listSection",
    logSection: "logSection",
  };

  constructor(
    private toastr: ToastrService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private calendar: NgbCalendar,
    private risCommonService: RISCommonService,
    private lookupService: LookupService,
    private excelService: ExcelService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.machineUtilizationForm.patchValue({
        date: Conversions.getCurrentDateObject(), // Single date dropdown
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
    this.getMachines(this.RISMachineID);
    this.getBranches();
  }
  getBranches() {
    this.BranchesList = [];
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        let _response = resp.PayLoad;
        _response.forEach((element, index) => {
          _response[index].Title = (element.Title || "").replace(
            "Islamabad Diagnostic Centre (Pvt) Ltd",
            "IDC ",
          );
        });
        this.BranchesList = _response;
      },
      (err) => {},
    );
  }

  getUtilizationReport() {
    let formValues = this.machineUtilizationForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom
      ? Conversions.formatDateObject(formValues.dateFrom)
      : null;
    formValues.dateTo = formValues.dateTo
      ? Conversions.formatDateObject(formValues.dateTo)
      : null;

    if (this.machineUtilizationForm.invalid) {
      this.toastr.warning("Please Fill The Missing Mandatory Fields");
      this.utilizationList = [];
      this.isSubmitted = true;
      return;
    }

    // Check if the selected date range is for one day only
    if (formValues.dateFrom && formValues.dateTo) {
      const dateFrom = new Date(formValues.dateFrom);
      const dateTo = new Date(formValues.dateTo);

      // Ensure both dates are the same
      if (dateFrom.toDateString() !== dateTo.toDateString()) {
        this.toastr.warning(
          "You can only fetch data for a single day. Please select the same date for both fields.",
        );
        this.utilizationList = [];
        this.isSubmitted = true;
        return;
      }

      this.isDisable = true;
    }

    let objParm = {
      DateFrom: Conversions.formatDateObject(formValues.date),
      DateTo: Conversions.formatDateObject(formValues.date),
      RISMachineID: formValues.machineId,
      LocID: formValues.machineBranch,
    };
    this.isSpinner = true;
    this.spinner.show();

    this.risCommonService.GetRISMachineUtilization(objParm).subscribe(
      (resp: any) => {
        this.isDisable = false;
        this.spinner.hide(this.spinnerRefs.listSection);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.utilizationList = resp.PayLoad;
          this.filterResults();
          this.isSpinner = false;
          this.spinner.hide();
        } else {
          this.toastr.warning("No Record Found");
          this.utilizationList = [];
          this.isSpinner = false;
          this.spinner.hide();
        }
      },
      (err) => {
        this.isSpinner = false;
        this.spinner.hide();
        console.log(err);
      },
    );
  }

  getMachines(LocId: number) {
    this.MachineList = []; // Reset machine list

    const objParam = {
      LocationId: LocId, // Pass LocationId to the API
    };

    this.risCommonService.getRISMachine(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoadDS) {
          let data = res.PayLoadDS.Table;
          try {
            data = JSON.parse(data);
          } catch (ex) {
            console.error("Error parsing data", ex);
          }

          // Filter machines based on selected LocID
          this.MachineList = (data || []).filter(
            (machine) => machine.LocID === LocId,
          );
        }
      },
      (err) => {
        console.error("Error fetching machines", err);
      },
    );
  }

  onLocationChange() {
    const locId = this.machineUtilizationForm.get("machineBranch")?.value;

    // ✅ Clear machine dropdown selection
    this.machineUtilizationForm.get("machineId")?.reset();
    this.MachineList = [];

    if (locId) {
      this.getMachines(locId);
    }
  }

  searchText = "";
  refreshPagination() {
    let dataToPaginate = this.pagination.filteredSearchResults;
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

    const cols = ["PIN", "PatientName", "AgeGender", "TestName", "ModalityName","CheckInLoc","CheckOutLoc","RegisteredBy","InitializedBy","Status"];

    let results: any = this.utilizationList;

    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.utilizationList.filter((item: any) => {
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

  exportAsExcel() {
    const excelData = [];
    if (this.utilizationList.length) {
      this.utilizationList.forEach((d, index) => {
        const row = {
          "Sr#": index + 1,
          PIN: d.PIN,
          "Patient Name": d.PatientName,
          "Age/Gender": d.AgeGender,
          "Test Name": d.TestName,
          "Modality Name": d.ModalityName,
          "CheckIn Time": d.CheckInTime,
          "CheckOut Time": d.CheckOutTime,
          "CheckIn Loc": d.CheckInLoc,
          "CheckOut Loc": d.CheckOutLoc,
          "Registered By": d.RegisteredBy,
          "Registered At": d.RegisteredAt,
          "Initialized By": d.InitializedBy,
          "Initialized At": d.InitializedAt,
          "Status": d.Status,
          "Time Taken": d.TimeTakenDHMS,
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "Machine Utilization Report",
        "MachineUtilizationReport",
      );
    } else {
      this.toastr.error("Cannot export empty table");
    }
  }
}
