// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { NgxSpinnerService } from "ngx-spinner";
import { NgbDateStruct, NgbCalendar, NgbDate } from "@ng-bootstrap/ng-bootstrap";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-pacslink-dashboard",
  templateUrl: "./pacslink-dashboard.component.html",
  styleUrls: ["./pacslink-dashboard.component.scss"],
})
export class PacslinkDashboardComponent implements OnInit {
  pacsLogList: any = [];
  pacsParamForm: FormGroup;
  isSpinner: boolean = true;
  today : NgbDate = this.calendar.getToday();
  oneDayEarlier : NgbDate = this.calendar.getPrev(this.today, 'd', 1);
  disabledButton: boolean = false;
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  constructor(
    private toastr: ToastrService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private calendar: NgbCalendar
  ) {}

  ngOnInit(): void {
    this.pacsParamForm = this.formBuilder.group({
      dateFrom: [this.oneDayEarlier, ],
      dateTo: [this.today, ],
      visitID: ['', [Validators.pattern(/^[0-9-]*$/)]]
    });
  } 

  private formatDate(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return "";
    const { year, month, day } = ngbDate;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  }

  refreshPagination() {
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate.slice(
      (this.pagination.page - 1) * this.pagination.pageSize,
      this.pagination.page * this.pagination.pageSize
    );
  }
  numericValidator() {
    return (control: any) => {
      const value = control.value;
      return value && !/^[0-9]+$/.test(value) ? { nonNumeric: true } : null;
    };
  }

  onPinInput() {
    const pinControl = this.pacsParamForm.get("visitID");
    const dateFromControl = this.pacsParamForm.get("dateFrom");
    const dateToControl = this.pacsParamForm.get("dateTo");

    if (pinControl?.value) {
      // Clear date fields if PIN is filled
      dateFromControl?.setValue(null);
      dateToControl?.setValue(null);
      dateFromControl?.clearValidators();
      dateToControl?.clearValidators();
    } else {
      // Require date fields if PIN is empty
      dateFromControl?.setValue(this.oneDayEarlier);
      dateToControl?.setValue(this.today);
      dateFromControl?.setValidators([Validators.required]);
      dateToControl?.setValidators([Validators.required]);
    }
    pinControl.updateValueAndValidity();
    dateFromControl?.updateValueAndValidity();
    dateToControl?.updateValueAndValidity();
  }

  onDateChange() {
    if (
      this.pacsParamForm.get("dateFrom")?.value ||
      this.pacsParamForm.get("dateTo")?.value
    ) {
      this.pacsParamForm.patchValue({
        visitID: null,
      });
      this.pacsParamForm.get("visitID")?.clearValidators();
    } else {
      this.pacsParamForm
        .get("visitID")
        ?.setValidators([Validators.required, Validators.pattern(/^[0-9-]+$/)]);
    }
    this.pacsParamForm.get("visitID")?.updateValueAndValidity();
  }

  getPACsCommLog() {
    if (this.pacsParamForm.invalid) {
      this.toastr.error("Please fill all required fields!");
      return;
    }
    const dateFrom = this.pacsParamForm.get("dateFrom")?.value;
    const dateTo = this.pacsParamForm.get("dateTo")?.value;
  
    const startDate = new Date(this.formatDate(dateFrom));
    const endDate = new Date(this.formatDate(dateTo));
    const timeDifference = endDate.getTime() - startDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
  
    if (dayDifference > 1) {
      this.toastr.error("You can only fetch data for one day.");
      return;
    }

    const params = this.getParams();

    this.isSpinner = true;
    this.spinner.show();


    this.sharedService.getPACsCommLog(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (res.StatusCode === 200) {
          if (res.PayLoad && res.PayLoad.length > 0) {
          this.pacsLogList = res.PayLoad || [];
          this.pagination.filteredSearchResults = this.pacsLogList;
          this.refreshPagination();
          this.isSpinner = false;
          this.spinner.hide();
        }else{
          this.pacsLogList = [];
          this.isSpinner = false;
          this.spinner.hide();
          this.toastr.error("Invalid PIN! Please check and try again.");
        }
      }
        else {
          this.isSpinner = false;
          this.spinner.hide();
          this.toastr.error("Something went wrong");
        }
      },
      (err) => {
        this.disabledButton = false;
        this.isSpinner = false;
        this.spinner.hide();

        this.pacsLogList = [];
        console.error(err);
        this.toastr.error("Connection error");
      }
    );
  }

  getParams(){
    const formValues = this.pacsParamForm.getRawValue();
    const pin = formValues.visitID ? formValues.visitID.replaceAll('-', '') : null;

    if (pin && isNaN(Number(pin))) {
      this.toastr.error("PIN must be numeric!");
      return null; 
    }
    let params;
    if(pin){
      params = {
        VisitID: pin || null,
        DateFrom: null,
        DateTo: null,
      };
    }
    else{
      params = {
        VisitID: null,
        DateFrom: Conversions.formatDateObject(formValues.dateFrom),
        DateTo: Conversions.formatDateObject(formValues.dateTo),
      };
    }
    return params
  }
}
