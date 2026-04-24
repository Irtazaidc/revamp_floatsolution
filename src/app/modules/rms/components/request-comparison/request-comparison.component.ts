// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { FormGroup,  FormBuilder } from "@angular/forms";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { NgbCalendar,NgbDate,NgbDateStruct,} from "@ng-bootstrap/ng-bootstrap";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { ComplaintDashboardService } from "src/app/modules/complaints-feedback/services/complaint-dashboard.service";

@Component({
  standalone: false,

  selector: "app-request-comparison",
  templateUrl: "./request-comparison.component.html",
  styleUrls: ["./request-comparison.component.scss"],
})
export class RequestComparisonComponent implements OnInit {
  isSpinner = true;
  disabledButton = false;

  requestComparisonForm: FormGroup;
  requestComparisonList: any = [];
  requestComparison: any = [];
  isSubmitted = false;
  searchText = "";
  loggedInUser: UserModel;
  maxDate: any;
  today!: NgbDate;
  oneDayEarlier!: NgbDate;
  noComparisonDataMessage = "Please select user";

  employeesList = [];

  spinnerRefs = {
    ComparisontSection: "ComparisontSection",
  };

  constructor(
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private calendar: NgbCalendar,
    private lookupService: LookupService,
    private complaintDashboardService: ComplaintDashboardService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getEmployeesData();

    this.today = this.calendar.getToday();
    this.oneDayEarlier = this.calendar.getPrev(this.today, "d", 1);

    this.requestComparisonForm = this.formBuilder.group({
      dateFrom: [this.oneDayEarlier],
      dateTo: [this.today],
      EmpId: [],
    });

    this.requestComparisonForm.get("EmpId").valueChanges.subscribe((value) => {
      if (!value) {
        this.requestComparisonList = [];
      }
    });
  }
  private formatDate(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return "";
    const { year, month, day } = ngbDate;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getRequestComparison() {
    const formValues = this.requestComparisonForm.getRawValue();
    if (!formValues.EmpId) {
      this.toastr.warning("Please select a user first");
      return;
    }
    formValues.dateFrom = formValues.dateFrom
      ? Conversions.formatDateObject(formValues.dateFrom)
      : null;
    formValues.dateTo = formValues.dateTo
      ? Conversions.formatDateObject(formValues.dateTo)
      : null;

    const objParm = {
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
      ResponsibleUserID: formValues.EmpId || -1,
    };
    this.isSpinner = true;
    this.spinner.show();

    this.complaintDashboardService
      .getGetCMSRequestByResponsiblePersonUserID(objParm).subscribe(
        (resp: any) => {
          this.disabledButton = false;
          this.isSpinner = true;
          console.log(resp);
          this.spinner.hide(this.spinnerRefs.ComparisontSection);
          if (resp.StatusCode == 200 && resp.PayLoadStr.length) {
            this.requestComparisonList = JSON.parse(resp.PayLoadStr);
            this.isSpinner = false;
            this.spinner.hide();
          } else {
            this.toastr.warning("No Record Found");
          }
        },
        (err) => {
          this.isSpinner = false;
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  getEmployeesData() {
    this.employeesList = [];

    const objParam = {
      DepartmentId: -1,
      DesignationId: -1,
      locId: -1,
    };
    this.lookupService.getEmployeeListByDepDesLocID(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          let data = res.PayLoadDS.Table;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.employeesList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
