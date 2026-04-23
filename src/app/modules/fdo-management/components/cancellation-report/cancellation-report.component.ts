// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { ExcelService } from "src/app/modules/business-suite/excel.service";
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { UserModel, AuthService } from "src/app/modules/auth";
import { Conversions } from "../../../shared/helpers/conversions";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: "app-cancellation-report",
  templateUrl: "./cancellation-report.component.html",
  styleUrls: ["./cancellation-report.component.scss"],
})
export class CancellationReportComponent implements OnInit {
  cancellationReportDataList = [];

  spinnerRefs = {
    cancellationreportTable: "dueclearancereportTable",
  };

  loggedInUser: UserModel;

  today: NgbDate = this.calendar.getToday();
  oneDayEarlier: NgbDate = this.calendar.getPrev(this.today, "d", 1);

  public Fields = {
    dateFrom: [this.oneDayEarlier, Validators.required],
    dateTo: [this.today, Validators.required],
    patientType: [, Validators.required],
    locID: [, Validators.required],
    cancellationType: [, Validators.required],
  };

  isSubmitted = false;
  branchList = [];

  searchText = "";
  maxDate: any;

  cancellationReportForm: FormGroup = this.formBuilder.group(this.Fields);

  paymentMethodList = [];
  patientTypeList = [];

  cancellationTypes = [
    { label: "All", value: 0 },
    { label: "Normal", value: 1 },
    { label: "Urgent", value: 2 },
    { label: "Critical", value: 3 },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private excelService: ExcelService,
    private labTats: LabTatsService,
    private calendar: NgbCalendar
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  private formatDate(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return "";
    const { year, month, day } = ngbDate;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  }

  getCancellationReport() {
    const formValues = this.cancellationReportForm.getRawValue();
    formValues.dateFrom = formValues.dateFrom
      ? Conversions.formatDateObject(formValues.dateFrom)
      : null;
    formValues.dateTo = formValues.dateTo
      ? Conversions.formatDateObject(formValues.dateTo)
      : null;

    if (this.cancellationReportForm.invalid) {
      this.toasrt.warning("Please Complete All The Fields");
      this.isSubmitted = true;
      return;
    }
    // Get the selected cancellation type from the form or default to 'All'
    const selectedCancellationType = formValues.cancellationType || "All";

    // Find the corresponding value from the cancellationTypes array
    const cancellationTypeValue =
      this.cancellationTypes.find(
        (type) => type.label === selectedCancellationType
      )?.value || 0;

    const objParams = {
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
      PatientType: formValues.TypeId || -1,
      LocIds: formValues.locID ? formValues.locID.join(",") : 1,
      UserId: this.loggedInUser.userid || -1,
      CancellationType: cancellationTypeValue,
    };

    this.spinner.show(this.spinnerRefs.cancellationreportTable);
    this.labTats.getCancellationReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.cancellationreportTable);
        if (res.StatusCode === 200 && res.PayLoad && res.PayLoad.length > 0) {
          this.cancellationReportDataList = res.PayLoad;
        } else if (res.StatusCode === 200 && res.PayLoad) {
          this.toasrt.info("No Record Found");
          this.cancellationReportDataList = [];
        } else {
          this.toasrt.error("Invalid response or empty data");
        }
        this.spinner.hide(this.spinnerRefs.cancellationreportTable);
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.cancellationreportTable);
        this.toasrt.error("Connection error");
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

  onSelectAllBranches() {
    this.cancellationReportForm.patchValue({
      locID: this.branchList.map((a) => a.LocId),
    });
  }

  onUnselectAllBranches() {
    this.cancellationReportForm.patchValue({
      locID: [],
    });
  }

  testStatusList = [];
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({ testCategory: 1 }).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad || [];
        this.testStatusList = _response;
      },
      (err) => {}
    );
  }

  getLookupsForRegistration() {
    this.paymentMethodList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          const _response = resp.PayLoadDS || [];
          this.paymentMethodList = _response.Table5 || [];
          this.patientTypeList = _response.Table6 || [];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  exportAsExcel() {
    const excelData = [];
    if (this.cancellationReportDataList.length) {
      this.cancellationReportDataList.forEach((d, index) => {
        const row = {
          "Sr#": index + 1,
          "Test Code": d.TestCode,
          "Test Name": d.TestName,
          "Cancelled on": d.ChangedOn,
          "Remarks": d.Remarks,
          "Cancelled Amount": d.CancelledAmount,
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(excelData, "Cancellation Report","Cancellation-Report");
    } else {
      this.toasrt.error("Cannot export empty table");
    }
  }
}
