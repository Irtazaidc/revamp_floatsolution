// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { HcDashboardService } from "../../../services/hc-dashboard.service";

@Component({
  standalone: false,

  selector: "app-hc-portable-services-share-report",
  templateUrl: "./hc-portable-services-share-report.component.html",
  styleUrls: ["./hc-portable-services-share-report.component.scss"],
})
export class HcPortableServicesShareReportComponent implements OnInit {
  ReportDataList = [];

  isSubmitted = false;
  branchList = [];
  searchText = "";
  maxDate: any;
  spinnerRefs = {
    reportTable: "reportTable",
  };

  public Fields = {
    DateFrom: ["", Validators.required],
    DateTo: ["", Validators.required],
  };

  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private HCService: HcDashboardService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.filterForm.patchValue({
        DateFrom: Conversions.getPreviousDateObject(),
        DateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
  }

  getReportData() {
    const formValues = this.filterForm.getRawValue();
    const dateFrom = formValues.DateFrom;
      const dateTo = formValues.DateTo;
      const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
      const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);
  
      // Check if DateTo is earlier than DateFrom
      if (toDate < fromDate) {
        this.toasrt.error('DateTo should be equal or greater than DateFrom');
        this.isSubmitted = false;
        return;
      }
  
      // Set the allowed range based on screenIdentity
      const maxDaysDifference =  30;
      const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));
  
      if (daysDifference > maxDaysDifference) {
        const period =  '1 month';
        this.toasrt.error(`The difference between dates should not exceed ${period}`);
        this.isSubmitted = false;
        return;
      }
  
      if (this.filterForm.invalid) {
        this.toasrt.warning("Please Fill The Mandatory Fields");
        this.isSubmitted = true;
        return;
      }
    const objParams = {
      DateFrom: Conversions.formatDateObject(formValues.DateFrom),
      DateTo: Conversions.formatDateObject(formValues.DateTo),
    };
    this.spinner.show(this.spinnerRefs.reportTable);
    this.HCService.GetHCPortableServicesShareReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.reportTable);
        if (res.StatusCode == 200 && res.PayLoad.length) {
          this.ReportDataList = res.PayLoad;
          console.log("res:", res);
        } else {
          this.toasrt.info("No Record Found");
          this.ReportDataList = [];
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.reportTable);
        this.toasrt.error("Connection error");
      }
    );
  }
}
