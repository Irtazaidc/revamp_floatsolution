// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { AbstractControl,FormBuilder,FormGroup, ValidationErrors,ValidatorFn,Validators,} from "@angular/forms";
import { HcDashboardService } from "src/app/modules/home-sampling/services/hc-dashboard.service";
import { FuelLogService } from "../../service/fuel-log.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: "app-generator-activation-logs",
  templateUrl: "./generator-activation-logs.component.html",
  styleUrls: ["./generator-activation-logs.component.scss"],
})
export class GeneratorActivationLogsComponent implements OnInit {
  loggedInUser: UserModel;

  isSubmitted = false;
  CardTitle = "Add Generator Log";
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  ActionLabel = "Save";
  GeneratorID: any = null;
  isSpinner: boolean = false;
  maxDate: any;
  GeneratorList: any = [];
  GeneratorReport: any = [];
  GeneratorReportList: any = [];
  generatorOnOffList = [];
  generatorOnOffLog = [];
  isEditMode: boolean = false;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    generatorId: [, Validators.required],
  };

  public Fields2 = {
    startDateTime: [, Validators.required],
    endDateTime: [],
    generator: [, Validators.required],
    duration: [],
    remarks: [],
    attachments: [],
  };

  getGeneratorFuelLog: FormGroup = this.formBuilder.group(this.Fields2);
  generatorForm: FormGroup = this.formBuilder.group(this.Fields);

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle:
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?", // 'Are you sure?',
    popoverTitleTests: "Are you <b>sure</b> want to save ?", // 'Are you sure?',
    popoverMessage: "",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };
  generatorConfigForm = this.formBuilder.group({
    StartDate: ["", [Validators.required,  this.timeValidator()]],
    StartTime: ["", [Validators.required, this.timeValidator()]],
    EndDate: [""],
    EndTime: [""],
    Duration: [""],
    Remarks: [""],
    Attachments: [""],
    generatorId: [, Validators.required],
  });

  spinnerRefs = {
    listSection: "listSection",
    generatorListSection: "testListSection",
    generatorFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
    searchTable: "searchTable",
    generatorReportSection: "generatorReportSection",
  };

  constructor(
    private HCService: HcDashboardService,
    private formBuilder: FormBuilder,
    private fuelLog: FuelLogService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getGeneratorList();
    setTimeout(() => {
      this.generatorForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }
  
  private formatDate(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return "";
    const { year, month, day } = ngbDate;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
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

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getGeneratorOnOffLog(selectedItem: any) {
    this.generatorOnOffLog = [];
    let _param = {
      FromDate: this.generatorForm.get('dateFrom')?.value
        ? Conversions.formatDateObject(this.generatorForm.get('dateFrom')?.value)
        : null,
      ToDate: this.generatorForm.get('dateTo')?.value
        ? Conversions.formatDateObject(this.generatorForm.get('dateTo')?.value)
        : null,
      GeneratorID: selectedItem?.GeneratorID || null,
    };
    this.fuelLog.getGeneratorOnOffLogList(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode === 200 && res.PayLoad) {
          this.generatorOnOffLog = res.PayLoad || [];
        }
      },
      (err) => {
        console.error("Error fetching log data:", err);
      }
    );
  }


  getGeneratorOnOffLogList() {
    this.generatorOnOffList = [];
    let formValues = this.generatorForm.getRawValue();
    let _param = {
      FromDate: formValues.dateFrom
        ? Conversions.formatDateObject(formValues.dateFrom)
        : null,
      ToDate: formValues.dateTo
        ? Conversions.formatDateObject(formValues.dateTo)
        : null,
      GeneratorID: formValues.generatorId || null,
    };
    this.fuelLog.getGeneratorOnOffLogList(_param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          this.generatorOnOffList = data || [];
        }
      },
      (err) => {
        console.error("Error fetching test profiles:", err);
      }
    );
  }

  selectedRow: any = null;

  populateFormData(item: any) {
    this.selectedRow = item; // Set the selected row to display its data
    this.getGeneratorOnOffLog(item); // Fetch the log data for the selected generator
  }
  onNewGeneratorClick() {
    this.generatorConfigForm.reset(); // Reset form values
    this.isEditMode = false; // Reset edit mode to ensure "Save" button is shown
    this.clearDisabledFields(); // Optionally clear any disabled fields

    this.toastr.info("Add New Item");
  }
  clearDisabledFields(): void {
    // Loop over all form controls and enable them
    Object.keys(this.generatorConfigForm.controls).forEach((controlName) => {
      const control = this.generatorConfigForm.get(controlName);
      if (control?.disabled) {
        control.enable();
      }
    });
  }

  GeneratorOnOffLogID = null;
  updateGeneratorLog() {
    // Extract form values
    let formValues = this.generatorConfigForm.getRawValue();
  
    // Validate mandatory fields
    if (!formValues.generatorId) {
      this.toastr.warning("Please select a generator.");
      return;
    }
  
    if (!formValues.StartDate) {
      this.toastr.warning("Please enter the start date.");
      return;
    }
  
    if (!formValues.StartTime) {
      this.toastr.warning("Please enter the start time.");
      return;
    }
  
    // Validate that StartDate and StartTime are valid before sending the payload
    if (!formValues.generatorId || !formValues.StartDate || !formValues.StartTime) {
      this.toastr.error("Generator, Start Date, and Start Time are required.");
      return;
    }
  
    // Determine if it's an insert or update operation
    const isEditMode = !!formValues.GeneratorOnOffLogID; // Non-zero ID indicates an update
  
    // Prepare API payload
    let param = {
      GeneratorID: formValues.generatorId,
      GeneratorOnTime: Conversions.formatDateTimeObject(
        formValues.StartDate,
        formValues.StartTime,
        false
      ),
      GeneratorOffTime:
        formValues.EndDate && formValues.EndTime
          ? Conversions.formatDateTimeObject(
              formValues.EndDate,
              formValues.EndTime,
              true
            )
          : null,
      Remarks: formValues.Remarks || "",
      CreatedBy: this.loggedInUser.userid || -99, // User ID for tracking changes
      GeneratorOnOffLogID: formValues.GeneratorOnOffLogID || null,
      isDeleted: 0,
    };
  
    // Show spinner
    this.spinner.show(this.spinnerRefs.searchTable);
  
    // API call
    this.sharedService
      .insertUpdateData(API_ROUTES.INSERT_UPDATE_GENERATOR_LOG, param).subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.searchTable);
  
          if (res && res.StatusCode === 200) {
            const message = isEditMode
              ? "Generator log updated successfully."
              : "Generator log saved successfully.";
            this.toastr.success(message);
            this.getGeneratorOnOffLogList();
            // Reset the form and toggle edit mode
            this.clearForm();
          } else {
            this.toastr.error(res.Message || "Failed to save generator log.");
          }
        },
        (err) => {
          console.error("Error:", err);
          this.spinner.hide(this.spinnerRefs.searchTable);
          this.toastr.error("Connection error while saving generator log.");
        }
      );
  }

  getGeneratorReport() {
    this.GeneratorReport = [];
    this.spinner.show(this.spinnerRefs.generatorReportSection);
    let objParm = {
      GeneratorReportList: this.GeneratorReportList,
    };
  }

  getGeneratorList() {
    this.GeneratorList = [];
    let formValues = this.getGeneratorFuelLog.getRawValue();
    console.log("formValues", formValues)
    let param = {
      LocIds :this.loggedInUser.locationid, 

    };

    this.fuelLog.getGeneratorName(param).subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoadStr) {
        let data = res.PayLoadStr;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.GeneratorList = data || [];
      }
    }, (err) => {
      console.log(err);
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
    }
  }

  addAttachment(event) {
    console.log("Attachment Added::");
  }

  // Method to calculate the time difference (duration) in hours and minutes
  calculateDuration() {
    const startTime = this.generatorConfigForm.get("StartTime").value;
    const endTime = this.generatorConfigForm.get("EndTime").value;

    // Check if either StartTime or EndTime is empty
    if (!startTime || !endTime) {
      // If either is empty, clear the Duration field
      this.generatorConfigForm.get("Duration").setValue("");
      return; // Exit the function early
    }

    // Convert Start and End times to Date objects with a base date to make comparison easier
    const startDateTime = new Date(0, 0, 0, startTime.hour, startTime.minute);
    const endDateTime = new Date(0, 0, 0, endTime.hour, endTime.minute);

    // If the end time is earlier than the start time, add 24 hours to the end time
    if (endDateTime < startDateTime) {
      endDateTime.setHours(endDateTime.getHours() + 24); // Add 24 hours
    }

    // Calculate the difference in milliseconds, then convert to hours and minutes
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationMin = durationMs / (1000 * 60); // Duration in minutes
    const durationHours = Math.floor(durationMin / 60); // Calculate full hours
    const durationRemainingMinutes = Math.round(durationMin % 60); // Remaining minutes

    // Set the duration field in hours and minutes
    const totalDuration = `${durationHours} hours ${durationRemainingMinutes} minutes`;
    this.generatorConfigForm.get("Duration").setValue(totalDuration);
  }

  // Custom validator to ensure dates are within one month
  validateDateRange(generatorForm: AbstractControl) {
    const dateFrom = generatorForm.get("dateFrom")?.value;
    const dateTo = generatorForm.get("dateTo")?.value;

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
      const to = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
      const oneMonthLater = new Date(from);
      oneMonthLater.setMonth(from.getMonth() + 1);

      if (to > oneMonthLater) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.generatorForm.valid) {
      console.log("Form is valid, proceed with data fetching...");
      // Fetch data logic here
    } else {
      console.error("Form is invalid:", this.generatorForm.errors);
    }
  }

  populateForm(item: any): void {
    // Reset the form before populating
    this.generatorConfigForm.reset();

    // Parse Start Date and Time
    const startDateTime = new Date(item.GeneratorOnTime);
    const startDate = {
      year: startDateTime.getFullYear(),
      month: startDateTime.getMonth() + 1, // Months are zero-based in JS
      day: startDateTime.getDate(),
    };
    const startTime = {
      hour: startDateTime.getHours(),
      minute: startDateTime.getMinutes(),
    };

    // Parse End Date and Time if present
    if (item.GeneratorOffTime) {
      const endDateTime = new Date(item.GeneratorOffTime);
      const endDate = {
        year: endDateTime.getFullYear(),
        month: endDateTime.getMonth() + 1,
        day: endDateTime.getDate(),
      };
      const endTime = {
        hour: endDateTime.getHours(),
        minute: endDateTime.getMinutes(),
      };
      this.generatorConfigForm.patchValue({
        EndDate: endDate,
        EndTime: endTime,
      });
    }

    this.GeneratorOnOffLogID = item.GeneratorOnOffLogID || null;
    // Patch the form values with the item data
    this.generatorConfigForm.patchValue({
      generatorId: item.GeneratorID,
      StartDate: startDate,
      StartTime: startTime,
      Remarks: item.Remarks,
      // GeneratorOnOffLogID: item.GeneratorOnOffLogID || 0, // Set it to 0 if null
    });

    // Disable fields that are already filled (not null)
    if (item.GeneratorOnTime) {
      this.generatorConfigForm.get("StartDate")?.disable();
      this.generatorConfigForm.get("StartTime")?.disable();
    }
    if (item.GeneratorID) {
      this.generatorConfigForm.get("generatorId")?.disable();
    }
    if (item.Remarks) {
      this.generatorConfigForm.get("Remarks")?.disable();
    }

    // Set edit mode to true
    this.isEditMode = item.GeneratorOnOffLogID ? true : false;
  }

  clearForm(): void {
    this.generatorConfigForm.reset();
    this.isEditMode = false; // Reset edit mode
    this.GeneratorOnOffLogID = null;
  }

  edit() {}
}
