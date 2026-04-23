// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbCalendar, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { HcDashboardService } from "../../../services/hc-dashboard.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import moment from "moment";

@Component({
  standalone: false,

  selector: "app-rider-share-report",
  templateUrl: "./rider-share-report.component.html",
  styleUrls: ["./rider-share-report.component.scss"],
})
export class RiderShareReportComponent implements OnInit {
  riderShareReportForm: FormGroup;
  dateFrom: any;
  dateTo: any;
  StatsDate = "";
  shareList: any = {};
  currentCityID = null;
  RidersDetailListInParam: any = [];
  loggedInUser: UserModel;


  spinnerRefs = {
    TotalShareCount: "TotalShareCount",
    chartGraphStats: "chartGraphStats",
  };

  constructor(
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private calendar: NgbCalendar,
    private lookupService: LookupService,
    private HCService: HcDashboardService
  ) {}

  ngOnInit(): void {
    this.getRiderShareReport();
    this.loadLoggedInUserInfo();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getRiderShareReport() {
    this.shareList = [];

    // Validate and format the dates
    if (!this.dateFrom || !this.dateTo) {
      const currentMonthDates = this.getCurrentMonthDateObject();
      this.dateFrom = currentMonthDates.startDate;
      this.dateTo = currentMonthDates.endDate;
    }

    // Convert NgbDateStruct to the required API date format
    const formattedDateFrom = this.formatDateToApiString(this.dateFrom);
    const formattedDateTo = this.formatDateToApiString(this.dateTo);

    if (!formattedDateFrom || !formattedDateTo) {
      this.toastr.warning("Invalid date format!");
      return;
    }

    // Fetch the RiderID
    this.fetchRiderID().then((riderID) => {
      if (!riderID) {
        this.toastr.warning("No RiderID found!");
        return;
      }

      // Prepare parameters
      const objParm = {
        DateFrom: Conversions.formatDateObject(this.dateFrom),
        DateTo: Conversions.formatDateObject(this.dateTo),
        // RiderID: -1,   //this was for mobile application
        UserID: this.loggedInUser.userid,
      };

      // API call
      this.HCService.GetHCRiderShareReport(objParm).subscribe(
        (resp: any) => {
          if (resp.StatusCode == 200 && resp.PayLoad) {
            this.shareList = resp.PayLoad;
          } else {
            this.toastr.warning(resp.Message);
          }
        },
        (err) => {
          console.error(err);
          this.spinner.hide(this.spinnerRefs.TotalShareCount);
        }
      );
    });
  }

  // Convert RidersDetailF to a Promise
  fetchRiderID(): Promise<number> {
    return new Promise((resolve, reject) => {
      const params = {
        RiderID: 0,
        LocID: this.currentCityID,
      };

      this.HCService.GetRiders(params).subscribe(
        (resp: any) => {
          if (resp && resp.PayLoad && resp.PayLoad.length > 0) {
            const riderID = resp.PayLoad[0].RiderID;
            resolve(riderID);
          } else {
            resolve(null);
          }
        },
        (err) => {
          console.log(err);
          reject(err);
        }
      );
    });
  }

  RidersDetailF() {
    const params = {
      RiderID: 0,
      LocID: this.currentCityID,
    };
    this.HCService.GetRiders(params).subscribe(
      (resp: any) => {
        this.RidersDetailListInParam = resp.PayLoad;
        console.log("riders :", this.RidersDetailListInParam);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // Helper method to format NgbDateStruct to API date string (YYYY-MM-DD)
  formatDateToApiString(date: NgbDateStruct): string {
    if (!date || !date.year || !date.month || !date.day) {
      return null;
    }

    // Ensure 2-digit month and day
    const month = date.month.toString().padStart(2, "0");
    const day = date.day.toString().padStart(2, "0");
    return `${date.year}-${month}-${day}`;
  }

  getCurrentMonthDateObject(): {
    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
  } {
    const currentDate = moment();

    const startOfMonth = currentDate.clone().startOf("month"); // Start of the current month
    const endOfMonth = currentDate.clone().endOf("month"); // End of the current month

    return {
      startDate: {
        day: startOfMonth.date(),
        month: startOfMonth.month() + 1, // Months are 0-indexed in Moment.js
        year: startOfMonth.year(),
      },
      endDate: {
        day: endOfMonth.date(),
        month: endOfMonth.month() + 1, // Months are 0-indexed in Moment.js
        year: endOfMonth.year(),
      },
    };
  }

  onDateChangeofStats(event) {
    if (event === "2") {
      // This Month
      const currentMonthDates = Conversions.getCurrentMonthDateRange(); // Updated to return start & end
      this.dateFrom = currentMonthDates.startDate;
      this.dateTo = currentMonthDates.endDate;
      this.getRiderShareReport();
      return;
    }

    if (event === "3") {
      // Previous Month
      const previousMonthDates = Conversions.getPreviousMonthDateRange(); // Updated to return start & end
      this.dateFrom = previousMonthDates.startDate;
      this.dateTo = previousMonthDates.endDate;
      this.getRiderShareReport();
      return;
    }
  }
}
