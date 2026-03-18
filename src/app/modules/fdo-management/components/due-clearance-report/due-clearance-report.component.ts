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
import { SharedService } from "src/app/modules/shared/services/shared.service";
import {NgbDate,NgbCalendar, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: "app-due-clearance-report",
  templateUrl: "./due-clearance-report.component.html",
  styleUrls: ["./due-clearance-report.component.scss"],
})
export class DueClearanceReportComponent implements OnInit {
  dueClearanceReportDataList = [];

  spinnerRefs = {
    dueclearancereportTable: "dueclearancereportTable",
  };

  loggedInUser: UserModel;

  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    locID: [, Validators.required],
    statusID: [],
    patientType: [],
    paymentMethod: [],
  };

  isSubmitted = false;
  branchList = [];
  totalAmounts: any = {};


  searchText = "";
  maxDate: any;

  filterForm: FormGroup = this.formBuilder.group(this.Fields);

  paymentMethodList = [];
  patientTypeList = [];

  today: NgbDate = this.calendar.getToday();
  oneDayEarlier: NgbDate = this.calendar.getPrev(this.today, "d", 1);

  constructor(
    private formBuilder: FormBuilder,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private excelService: ExcelService,
    private labTats: LabTatsService,
    private sharedService: SharedService,
    private calendar: NgbCalendar
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getLookupsForRegistration();

    this.filterForm = this.formBuilder.group({
      dateFrom: [this.oneDayEarlier, Validators.required],
      dateTo: [this.today, Validators.required],
      locID: [    , Validators.required],
      statusID: [],
      patientType: [],
      paymentMethod: [],
    });
  }

  calculateTotal(field: string): number | string {
    if (!this.dueClearanceReportDataList || this.dueClearanceReportDataList.length === 0) {
        return '--';
    }
    const total = this.dueClearanceReportDataList
        .map(item => item[field] || 0)
        .reduce((sum, current) => sum + parseFloat(current), 0);
    return total > 0 ? total : '--';
}

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getDueClearanceReport() {
    let formValues = this.filterForm.getRawValue();

    if (this.filterForm.invalid) {
      this.toasrt.warning("Please Complete All The Fields");
      this.isSubmitted = true;
      return;
    }

    let objParams = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      LocIds: formValues.locID ? formValues.locID.join(",") : null,
      PatientType: -1,
      PaymentMode: formValues.paymentMethod || -1,
      UserId: this.loggedInUser.userid,
    };
    this.spinner.show(this.spinnerRefs.dueclearancereportTable);
    this.sharedService.getDueClearanceReport(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dueclearancereportTable);
        if (res.StatusCode == 200 && res.PayLoad.length) {
          this.dueClearanceReportDataList = res.PayLoad;
        } else {
          this.toasrt.info("No Record Found");
          this.dueClearanceReportDataList = [];
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dueclearancereportTable);
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
    this.filterForm.patchValue({
      locID: this.branchList.map((a) => a.LocId),
    });
  }

  onUnselectAllBranches() {
    this.filterForm.patchValue({
      locID: [],
    });
  }

  testStatusList = [];
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({ testCategory: 1 }).subscribe(
      (resp: any) => {
        let _response = resp.PayLoad || [];
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
          let _response = resp.PayLoadDS || [];
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
    if (this.dueClearanceReportDataList.length) {
      this.dueClearanceReportDataList.forEach((d, index) => {
        const row = {
          "Sr#": index + 1,
          "Patient Name": d.Name,
          "Reg NO.": d.ReceiptNo,
          "MRN No.": d.MRNo,
          "Cash": d.Cash,
          "Credit Card": d.CreditCard,
          "Cheque": d.Cheque,
          "Demand Draft": d.DemandDraft,
          "Receiving Date": d.ReceivingDate,
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(excelData, "Due Clearance Report","Due-Clearance-Report");
    } else {
      this.toasrt.error("Cannot export empty table");
    }
  }
}
