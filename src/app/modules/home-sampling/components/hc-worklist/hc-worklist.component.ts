// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { HcShareService } from "../../services/hc-share.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
@Component({
  standalone: false,

  selector: "app-hc-worklist",
  templateUrl: "./hc-worklist.component.html",
  styleUrls: ["./hc-worklist.component.scss"],
})
export class HcWorklistComponent implements OnInit {
  hcWorklistForm: FormGroup;
  disabledButton: boolean = false;
  isSubmitted = false;
  hcWorkList: any = [];
  isSpinner: boolean = true;
  branchList = [];
  searchText = "";
  isDisable = false;
  maxDate: any;

  spinnerRefs = {
    WorklistSection: "WorklistSection",
  };
  hcWorkListGrouped: any = [];

  constructor(
    private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private hcShareService: HcShareService
  ) {
    this.hcWorklistForm = this.fb.group({
      DateFrom: ["", Validators.required],
      DateTo: ["", Validators.required],
      LocId: [],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.hcWorklistForm.patchValue({
        DateFrom: Conversions.getPreviousDateObject(),
        DateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
    this.getLocationList();
  }

  getHCWorklist() {
    let formValues = this.hcWorklistForm.getRawValue();
    this.searchText = " ";
    const rawDateFrom = formValues.DateFrom;
    const rawDateTo = formValues.DateTo;

    const dateFrom: any = new Date(
      rawDateFrom.year,
      rawDateFrom.month - 1,
      rawDateFrom.day
    );
    const dateTo: any = new Date(
      rawDateTo.year,
      rawDateTo.month - 1,
      rawDateTo.day
    );

    // Check if DateTo is earlier than DateFrom
    if (dateTo < dateFrom) {
      this.toastr.error("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 30;
    const daysDifference = Math.abs((dateTo - dateFrom) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = "1 month";
      this.toastr.error(
        `The difference between dates should not exceed ${period}`
      );
      this.isSubmitted = false;
      return;
    }
    if (this.hcWorklistForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.hcWorkList = [];
      this.isSubmitted = true;
      return;
    }
    let objParm = {
      DateFrom: Conversions.formatDateObject(formValues.DateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.DateTo) || null,
      LocId: formValues.LocId || -1,
    };
    this.isSpinner = true;
    this.spinner.show();

    this.hcShareService.getHomeSamplingTestStatus(objParm).subscribe(
      (resp: any) => {
        this.isDisable = false;
        this.spinner.hide(this.spinnerRefs.WorklistSection);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          // Group data by VisitID
          const grouped = resp.PayLoad.reduce((acc, item) => {
            if (!acc[item.VisitID]) {
              acc[item.VisitID] = [];
            }
            acc[item.VisitID].push(item);
            return acc;
          }, {} as { [visitId: string]: any[] });

          // Convert to array for iteration in HTML
          this.hcWorkListGrouped = Object.keys(grouped).map((visitId) => ({
            VisitID: visitId,
            items: grouped[visitId],
          }));

          this.isSpinner = false;
          this.spinner.hide();
        } else {
          this.toastr.warning("No Record Found");
          this.hcWorkListGrouped = [];
          this.isSpinner = false;
          this.spinner.hide();
        }
      },
      (err) => {
        this.isSpinner = false;
        this.spinner.hide();
        console.log(err);
      }
    );
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
}
