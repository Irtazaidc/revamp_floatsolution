// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { FilterByKeyPipe } from "src/app/modules/shared/pipes/filter-by-key.pipe";

@Component({
  standalone: false,

  selector: "app-patient-insurance",
  templateUrl: "./patient-insurance.component.html",
  styleUrls: ["./patient-insurance.component.scss"],
})
export class PatientInsuranceComponent implements OnInit {
  insuranceDataList: any = [];

  spinnerRefs = {
    dataTable: "dataTable",
    panelsDropdown: "panelsDropdown",
  };
  statusOptionForRegistration = [
    { label: "Home Sampling", value: 1 },
    { label: "Normal Registration", value: 2 },
    { label: "All", value: -1 },
  ];
  statusOptions = [
    { label: "InActive", value: 0 },
    { label: "Active", value: 1 },
    { label: "Expired", value: 2 },
    { label: "Near Expiry", value: 3 },
    { label: "All", value: -1 },
  ];

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    timeFrom: ["", [Validators.required, this.timeValidator()]],
    timeTo: ["", [Validators.required, this.timeValidator()]],
    locationid: [null],
    TypeId: [],
    PanelId: [],
  };

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  isSubmitted = false;
  showLocColumn = false;
  branchList = [];

  searchText = "";
  maxDate: any;
  isActive = -1;
  ForHomeSampling = -1;
  filterForm: FormGroup = this.formBuilder.group(this.Fields);

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
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
    this.getPanels();
    setTimeout(() => {
      const defaultTimeFrom = {hour: 0, minute: 0, second: 0}
      const defaultTimeTo = { hour: 23, minute: 59, second: 0 };
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        timeFrom: defaultTimeFrom,
        timeTo: defaultTimeTo,
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);

    this.filterForm.get("TypeId")?.valueChanges.subscribe((value) => {
      this.updatePanelValidation(value);
    });
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  activeCases = 0;
  inactiveCases = 0;
  getPatientInsuranceData() {
    this.insuranceDataList = [];
    this.pagination.paginatedSearchResults = [];
    this.searchText = "";
    this.activeCases = 0;
    this.inactiveCases = 0;

    let formValues = this.filterForm.getRawValue();
    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const DateFrom = Conversions.mergeDateTime(
      formValues.dateFrom,
      formValues.timeFrom
    );
    const DateTo = Conversions.mergeDateTime(
      formValues.dateTo,
      formValues.timeTo
    );

    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const timeFrom = formValues.timeFrom;
    const timeTo = formValues.timeTo;

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
      const period = "1 Month";
      this.toasrt.error(
        `The difference between dates should not exceed ${period}`
      );
      this.isSubmitted = false;
      return;
    }

    // Check if timeFrom is less than timeTo when dateFrom equals dateTo
    if (
      dateFrom.year === dateTo.year &&
      dateFrom.month === dateTo.month &&
      dateFrom.day === dateTo.day
    ) {
      const fromTime = new Date(
        0,
        0,
        0,
        timeFrom.hour,
        timeFrom.minute || 0,
        timeFrom.second || 0
      );
      const toTime = new Date(
        0,
        0,
        0,
        timeTo.hour,
        timeTo.minute || 0,
        timeTo.second || 0
      );

      if (fromTime >= toTime) {
        this.toasrt.error(
          "TimeFrom should be less than TimeTo when the dates are the same"
        );
        this.isSubmitted = false;
        return;
      }
    }
    let locationid = formValues.locationid;
    !locationid ? (this.showLocColumn = true) : (this.showLocColumn = false);

    let objParams = {
      DateFrom: DateFrom,
      DateTo: DateTo,
      LocIds:
        Array.isArray(formValues.locationid) && formValues.locationid.length > 0
          ? formValues.locationid.join(",")
          : this.branchList.map((a) => a.LocId).join(","),
      PatientType: formValues.TypeId || null,
      PanelID: formValues.PanelId || null,
      isActive: this.isActive,
      ForHomeSampling: this.ForHomeSampling,
    };
    this.spinner.show(this.spinnerRefs.dataTable);
    this.labTats.getPatientInsuranceDataReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        // this.isActive = -1;
        if (res.StatusCode == 200) {
          if (res.PayLoad.length) {
            this.insuranceDataList = res.PayLoad;
            this.insuranceDataList.forEach((patient) => {
              if (patient.isInsuranceActive) {
                this.activeCases++;
              } else {
                this.inactiveCases++;
              }
            });
            this.filterResults();
          } else {
            this.toasrt.info("No Record Found");
            this.insuranceDataList = [];
          }
        } else {
          this.toasrt.error("Something went wrong");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dataTable);
        this.toasrt.error("Connection error");
      }
    );
  }
  getInsuranceStatusText(data: any): string {
    switch (data.InsuranceStatusID) {
      case 2:
        return "Inactive";
      case 5:
        return "Active";
      case 9:
        return "Expired";
      case 10:
        return "Cancel Expired";
      default:
        return "-";
    }
  }

  getInsuranceStatusClass(data: any): string {
    switch (data.InsuranceStatusID) {
      case 2:
        return "text-danger"; // Inactive
      case 5:
        return "text-green"; // Active
      case 9:
      case 10:
        return "text-warning"; // Expired / Cancel Expired
      default:
        return "text-muted"; // Unknown
    }
  }

  onSelectAllBranches() {
    this.filterForm.patchValue({
      locationid: this.branchList.map((a) => a.LocId),
    });
  }
  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locationid: [],
    });
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
  exportAsExcel() {
    const excelData = [];
    if (this.insuranceDataList.length) {
      this.insuranceDataList.forEach((d) => {
        excelData.push(d);
      });
      this.excelService.exportAsExcelFile(
        excelData,
        "Patient Insurance Report",
        "Patient Insurance Report"
      );
    } else {
      this.toasrt.error("Cannot export empty table");
    }
  }

  patientTypeList = [];
  getLookupsForRegistration() {
    this.patientTypeList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          let _response = resp.PayLoadDS || [];
          this.patientTypeList = _response.Table6 || [];
        },
        (err) => {
          console.log(err);
        }
      );
  }
  panelsList = [];
  getPanels() {
    this.panelsList = [];
    let _params = {
      branchId: null,
    };
    this.spinner.show(this.spinnerRefs.panelsDropdown);
    this.lookupService.getPanels(_params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.panelsDropdown);
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}

          this.panelsList = data || [];
        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.panelsDropdown);
        console.log(err);
        this.toasrt.error("Something went wrong. " + err.statusText);
      }
    );
  }

  // onChange(event: any) {
  //   this.isActive = event;
  //   console.log('Selected status:', this.statusOptions);
  // }
  // getStatusLabel(status: number): string {
  //   switch (status) {
  //     case 1: return 'Active';
  //     case 0: return 'Inactive';
  //     case -1: return 'All';
  //     case 2: return 'Expired';
  //     case 3: return 'Near Expiry';
  //     case 4: return 'Home Sample';
  //     default: return '-';
  //   }
  // }

  onPanelChange(event) {
    if (!event) {
      this.filterForm.get("PanelId")?.setValidators([]);
      this.panelsList = [];
      return;
    }
    if (event.TypeId == 2 || event.TypeId == 5) {
      this.getPanels();
    } else {
      this.panelsList = [];
    }
  }

  updatePanelValidation(patientTypeValue: any) {

    const panelControl = this.filterForm.get("PanelId");

    if (!patientTypeValue) {
      panelControl?.clearValidators(); // Correct way to remove validation
    } else if (patientTypeValue === 2 || patientTypeValue === 5) {
      panelControl?.setValidators([Validators.required]); // Make Panel required
    } else {
      panelControl?.clearValidators(); // Remove required validation
    }

    panelControl?.updateValueAndValidity(); // Refresh validation state
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
    let cols = [
      "PatientMRNo",
      "PatientName",
      "Cell",
      "VisitID",
      "PatientPolicyNo",
    ];
    let results: any = this.insuranceDataList;
    if (this.searchText && this.searchText.length > 1) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, "")
        .toLowerCase();

      results = this.insuranceDataList.filter((item: any) => {
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

  timeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        const { hour, minute } = control.value;

        // Validate hour and minute
        if (hour > 23 || minute > 59) {
          return { invalidTime: true }; // Return an error if time is invalid
        }
      }
      return null; // No error if valid
    };
  }
}
