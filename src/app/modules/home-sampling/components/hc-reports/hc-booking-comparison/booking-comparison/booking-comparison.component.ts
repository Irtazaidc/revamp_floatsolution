// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbCalendar, NgbDate,NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { HcDashboardService } from "src/app/modules/home-sampling/services/hc-dashboard.service";
import { RiderService } from "src/app/modules/home-sampling/services/rider.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { Chart } from "chart.js";
import { Label, Color } from "ng2-charts";

@Component({
  standalone: false,

  selector: "app-booking-comparison",
  templateUrl: "./booking-comparison.component.html",
  styleUrls: ["./booking-comparison.component.scss"],
})
export class BookingComparisonComponent implements OnInit {
  isSpinner = true;
  disabledButton = false;

  bookingComparisonForm: FormGroup;
  bookingComparisonList: any = [];
  requestComparison: any = [];
  isSubmitted = false;
  searchText = "";
  loggedInUser: UserModel;
  maxDate: any;
  today: NgbDate = this.calendar.getToday();
  oneDayEarlier: NgbDate = this.calendar.getPrev(this.today, "d", 1);
  noComparisonDataMessage = "Please select user";
  HomeCollectionCites: any = [];
  disableSearchButton = true;

  hczones: any = 0;
  hcCity: any = 0;
  ZonesList: any = [];
  RiderList = [];
  RidersDetailListInParam: any = [];
  showRiderSchedule = false;
  isDisable = false;

  SelRider: any = {
    selRiderID: "",
    selRiderName: "",
    selRiderContactNumber: "",
  };

  spinnerRefs = {
    ComparisontSection: "ComparisontSection",
    listSection: "listSection",
  };

  constructor(
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private calendar: NgbCalendar,
    private lookupService: LookupService,
    private HCService: HcDashboardService,
    private riderService: RiderService
  ) {}

  ngOnInit(): void {
    this.RidersDetailF();
    this.homeCollectionCites();

    this.bookingComparisonForm = this.formBuilder.group({
      dateFrom: [this.oneDayEarlier, Validators.required],
      dateTo: [this.today, Validators.required],
      hcCity: [null, ""],
      rider: [null, ""],
    });
    this.prepareChartData();
    this.maxDate = Conversions.getCurrentDateObject();
  }
  private formatDate(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return "";
    const { year, month, day } = ngbDate;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  }

  getBookingComparison() {
    const formValues = this.bookingComparisonForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom
      ? Conversions.formatDateObject(formValues.dateFrom)
      : null;
    formValues.dateTo = formValues.dateTo
      ? Conversions.formatDateObject(formValues.dateTo)
      : null;

    if (this.bookingComparisonForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.bookingComparisonList = [];
      this.isSubmitted = true;
      return;
    }

    // Check if both dates are present
    if (formValues.dateFrom && formValues.dateTo) {
      const dateFrom = new Date(formValues.dateFrom);
      const dateTo = new Date(formValues.dateTo);

      // Check if DateTo is earlier than DateFrom
      if (dateTo < dateFrom) {
        this.toastr.error("DateTo should be equal to or greater than DateFrom");
        this.bookingComparisonList = [];
        this.isSubmitted = true;
        return;
      }

      // Limit the date range to 3 months (or a specified max range)
      const maxMonthsDifference = 3; // Change this value if needed
      const oneMonthLimit = new Date(dateFrom);
      oneMonthLimit.setMonth(dateFrom.getMonth() + maxMonthsDifference);

      if (dateTo > oneMonthLimit) {
        this.toastr.warning(
          `You can only fetch data for up to ${maxMonthsDifference} months. Please adjust your date range.`
        );
        this.bookingComparisonList = [];
        this.isSubmitted = true;
        return;
      }
    }

    // If all validations pass
    this.isDisable = true;

    const objParm = {
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
      CityID: this.currentCityID || formValues.hcCity,
      RiderID: formValues.rider !== "" ? formValues.rider : null,
    };
    this.isSpinner = true;
    this.spinner.show();

    this.HCService.GetBookingComparison(objParm).subscribe(
      (resp: any) => {
        console.log("API response: ", resp);
        this.isDisable = false;
        this.spinner.hide(this.spinnerRefs.ComparisontSection);
        if (resp.StatusCode == 200 && resp.PayLoad.length) {
          this.bookingComparisonList = resp.PayLoad;
          this.prepareChartData();
          this.isSpinner = false;
          this.spinner.hide();
        } else {
          this.toastr.warning("No Record Found");
          this.bookingComparisonList = [];
          this.isSpinner = false;
          this.spinner.hide();
        }
      },
      (err) => {
        this.isSpinner = false;
        this.spinner.hide();
        this.bookingComparisonList = [];
        console.log(err);
      }
    );
  }

  homeCollectionCites() {
    this.HCService.getHCCities().subscribe(
      (resp: any) => {
        this.HomeCollectionCites = resp.PayLoad;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  currentCityID = null;
  getCityId(event) {
    event ? (this.currentCityID = event.HCCityID) : null;
  }

  RidersDetailF() {
    const params = {
      RiderID: 0,
      LocID: this.currentCityID,
    };
    this.HCService.GetRiders(params).subscribe(
      (resp: any) => {
        this.RidersDetailListInParam = resp.PayLoad;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  isDateInvalid(dateControlName: string): boolean {
    const control = this.bookingComparisonForm.get(dateControlName);
    if (control && control.value) {
      const selectedDate = new Date(
        Conversions.formatDateObject(control.value)
      );
      const maxValidDate = new Date();

      if (selectedDate > maxValidDate) {
        return true;
      }
    }
    return false;
  }

  /////// BAR-CHART //////////

  chartValuesTC: any = [];

  barChartDataTC: Chart.ChartDataSets[] = [
    { data: [45, 37, 60, 70, 46, 33], label: "Best Fruits" },
  ];
  barChartColorsTC: Color[] = [
    {
      borderColor: "#ff3972",
      backgroundColor: "rgba(39, 187, 245, 0.8)",
    },
  ];
  barChartColors: Color[] = [
    {
      borderColor: "#ff3972",
      backgroundColor: "#F64E60",
    },
  ];
  barChartLabelsTC: Label[] = [
    "Apple",
    "Banana",
    "Kiwifruit",
    "Blueberry",
    "Orange",
    "Grapes",
  ];
  barChartOptionsTC_: Chart.ChartOptions = {
    responsive: true,
  };
  barChartOptionsTC: Chart.ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Riders", // Set the label for the x-axis
          },
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Booking Data", // Set the label for the y-axis
          },
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };
  barChartLegendTC = true;
  barChartPluginsTC = [];
  barChartTypeTC = "bar";

  exportChart(chartType: string) {
    let canvas: HTMLCanvasElement;

    if (chartType === "bar2") {
      canvas = document.getElementById("barChartCanvas2") as HTMLCanvasElement;
    }
    if (canvas) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.fillStyle = "white";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      const dataURL = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `chart_${chartType}.png`;
      link.click();
    } else {
      console.error(`Could not find canvas for chart type: ${chartType}`);
    }
  }

  exportChartAsPNG() {
    this.captureChartAsImage("line").then((imageData) => {
      // Create a link
      const downloadLink = document.createElement("a");
      downloadLink.href = imageData;
      downloadLink.download = "chart.png";

      // Simulate a click on the link to trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  captureChartAsImage(chartType: string): Promise<string> {
    return new Promise((resolve) => {
      const chartContainer = document.createElement("div");
      document.body.appendChild(chartContainer);

      const chartCanvas = document.createElement("canvas");
      chartContainer.appendChild(chartCanvas);

      const chart = new Chart.Chart(chartCanvas, {
        type: chartType,
        data: {
          labels: this.barChartLabelsTC,
          datasets: [
            {
              label: "Booking Comparison",
              data: this.chartValuesTC,
              borderColor: "rgba(39, 187, 245, 0.8)",
              backgroundColor: "rgba(39, 187, 245, 0.2)",
            },
          ],
        },
        options: {
          responsive: true,
        },
      });

      // Wait for the chart to render
      setTimeout(() => {
        const imageDataUrl = chartCanvas.toDataURL("image/png");

        // Cleanup
        chartContainer.remove();

        // Resolve the promise with the image data
        resolve(imageDataUrl);
      }, 500);
    });
  }

  prepareChartData() {
    // Initialize arrays to hold data
    const assignedTasks: number[] = [];
    const completedTasks: number[] = [];
    const cancelledTasks: number[] = [];
    const inProgressTasks: number[] = [];
    const riderNames: string[] = [];

    // Loop through the bookingComparisonList and populate the data arrays
    this.bookingComparisonList.forEach((item) => {
      riderNames.push(item.RiderName);
      assignedTasks.push(item.TotalHCRequests);
      completedTasks.push(item.TotalCompletedRequests);
      cancelledTasks.push(item.TotalCancelledRequests);
      inProgressTasks.push(item.TotalInProgressRequests);
    });

    // Assign the labels (rider names)
    this.barChartLabelsTC = riderNames;

    // Assign the datasets for the chart
    this.barChartDataTC = [
      { data: assignedTasks, label: "Assigned Tasks" },
      { data: completedTasks, label: "Completed Tasks" },
      { data: cancelledTasks, label: "Cancelled Tasks" },
      { data: inProgressTasks, label: "In Progress Tasks" },
    ];
  }
}
