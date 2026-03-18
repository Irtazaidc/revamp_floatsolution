// @ts-nocheck
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import moment from "moment";
import { Conversions } from "../../../../shared/helpers/conversions";
import { CONSTANTS } from "../../../../shared/helpers/constants";
import { NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AppPopupService } from "../../../helpers/app-popup.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { PatientService } from "src/app/modules/patient-booking/services/patient.service";
import { HelperService } from "../../../helpers/helper.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";

@Component({
  standalone: false,

  selector: "app-patient-basic-info",
  templateUrl: "./patient-basic-info.component.html",
  styleUrls: ["./patient-basic-info.component.scss"],
})
export class PatientBasicInfoComponent implements OnInit {
  @Input("PatientData") patientData: any = {};
  @Input("VisitDateTime") VisitDateTime = {
    RegistrationDate: null,
    DeliveryDate: null,
  };
  @Input("PatientId") patientId: number;
  @Input("VisitId") visitId: number;
  @ViewChild("patPicPopup") patPicPopup;
  @Output() emitCardvalues = new EventEmitter<any>();
  patPicPopupRef: NgbModalRef;
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  searchResults: any = [];
  _patientData: any = {};
  _patientId: number;
  _visitId: number;
  isInsuranceActive: boolean = false; // Default value

  spinnerRefs = {
    patPicPopup: "patPicPopup",
    patientInfoBar: "patientInfoBar",
  };

  ngbModalOptions: NgbModalOptions = {
    backdrop: true, // 'static',
    keyboard: true,
  };

  constructor(
    private appPopupService: AppPopupService,
    private patientService: PatientService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private helper: HelperService,
    private lookupService: LookupService
  ) {}
  RegistrationDate = null;
  DeliveryDate = null;
  ngOnInit(): void {
    this.RegistrationDate = this.VisitDateTime.RegistrationDate || null;
    this.DeliveryDate = this.VisitDateTime.DeliveryDate || null;
    // this.getPatientData();
  }

  ngAfterViewInit() {
    //this.getPatientData();
  }

  ngOnChanges(e) {
    this.getPatientData();
    this.RegistrationDate = this.VisitDateTime.RegistrationDate || null;
    this.DeliveryDate = this.VisitDateTime.DeliveryDate || null;
  }

  getPatientData() {
    this._patientData = this.patientData;
    this._patientId = this.patientId;
    this._visitId = this.visitId;

    if (
      this._patientData &&
      (this._patientData.MRNo ||
        this._patientData.PatientID ||
        this._patientData.FirstName)
    ) {
      // patientData is provided, use this data
      if (
        (this._patientData.Age || "").toString().indexOf("yr") == -1 &&
        (this._patientData.Age || "").toString().indexOf("mon") == -1 &&
        (this._patientData.Age || "").toString().indexOf("day") == -1
      ) {
        this._patientData.Age =
          this._patientData.Age +
          " " +
          (this._patientData.dmy == "3"
            ? "yr(s)"
            : this._patientData.dmy == "2"
            ? "mon(s)"
            : this._patientData.dmy == "1"
            ? "day(s)"
            : "");
      }
      // Now check for insurance after data is assigned
      this.isInsuranceActive =
        this._patientData.PayLoad?.[0]?.isInsuranceActive ?? false;
    } else if (this._patientId || this._visitId) {
      // patientId is provided, get patientData and use
      this.searchPatient(this._patientId, this._visitId);
    } else {
      this._patientId = null;
      this._patientData = {};
    }
  }

  searchPatient(patientId, visitId) {
    // patientId = 65201868;
    this._patientData = {};
    let patientSearchParams = {
      PatientID: patientId,
      VisitId: visitId,
    };
    if (!patientSearchParams.PatientID && !patientSearchParams.VisitId) {
      return;
    }
    this.spinner.show(this.spinnerRefs.patientInfoBar);
    //this.patientService.searchPatient
    this.patientService.searchPatient(patientSearchParams).subscribe(
      (res: any) => {
        this._patientData = {};
        this.spinner.hide(this.spinnerRefs.patientInfoBar);
        
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            this.emitCardvalues.emit(res.PayLoad[0]);
            // this.searchResults = res.PayLoad[0];
            this.formatPatientData(res.PayLoad[0]);
            // this.getAndDisplayPatientPic(patientSearchParams.PatientID);
            this.checkInsuranceExpiryStatus(res.PayLoad[0].OrbitPatientID);
          } else {
            this.searchResults = res.PayLoad[0];
            this.toastr.warning("Patient record not found");
          }
        } else {
          this.toastr.error("Error: Loading patient data");
        }
      },
      (err) => {
        this.toastr.error("Error loading Patient data");
        console.log(err);
        this.spinner.hide(this.spinnerRefs.patientInfoBar);
      }
    );
  }

  getAndDisplayPatientPic(PatientId) {
    this._patientData.PatientPic = "";
    if (!PatientId) {
      return;
    }
    this.patientService.getPatientPic({ PatientId: PatientId }).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            let _patPic = res.PayLoad[0].Pic || "";
            let _formattedPic = _patPic
              ? _patPic.indexOf("data:image/") == -1
                ? CONSTANTS.IMAGE_PREFIX.PNG + _patPic
                : _patPic
              : "";
            if (_formattedPic) {
              this._patientData.PatientPic = _formattedPic;
            }
          }
        } else {
          this.toastr.error("Error: Loading patient image");
        }
      },
      (err) => {
        this.toastr.error("Server Error, loading Patient Image.");
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  formatPatientData(data) {
    // let _patPic = (data.OrbitPatientPic || data.PatientPic || '');
    // let _formattedPic = _patPic ? ((_patPic.indexOf('data:image/') == -1) ? (CONSTANTS.IMAGE_PREFIX.PNG + _patPic) : _patPic) : '';
    // let _formattedDob = {day:moment(data.DateOfBirth).get('date'),month:(moment(data.DateOfBirth).get('month')),year:moment(data.DateOfBirth).get('year')};
    let _formattedAge = "";
    if (data.DateOfBirth) {
      let _ageObj: any = data.DateOfBirth
        ? this.calculateAge(new Date(data.DateOfBirth))
        : {};
      _formattedAge = _ageObj.years
        ? _ageObj.years + " yr(s)"
        : _ageObj.months + " mon(s)"
        ? _ageObj.months
        : _ageObj.days + " day(s)";
    }
    data.MobileOperatorID =
      (data.MobileOperatorID || "") == -1 ? "" : data.MobileOperatorID || "";
    this._patientData = {
      PatientID: data.OrbitPatientID || "",
      MRNo: data.OrbitMRNo || "",
      Salutation: data.Salutation || data.SalutationTitle || "", // this.getSalutationByTitle(data.Salutation || data.SalutationTitle || ''),
      FirstName: data.FirstName || "",
      LastName: data.LastName || "",
      CNIC: data.CNIC || "",
      PassportNo: data.PassportNo || "",
      Gender: data.Gender || "",
      DateOfBirth: data.DateOfBirth || "", // data.dateOfBirth ? moment(data.dateOfBirth).format(this.dateFormat) : '',
      Age: _formattedAge || "",
      FatherName: data.FatherName || "",
      HomeAddress: (data.HomeAddress || '').trim(),
      RegistrationLocation: data.RegistrationLocation || "",
      PhoneNO: data.PhoneNO || "",
      MobileOperatorID: data.MobileOperatorID || "",
      MobileNO: data.MobileNO || "",
      ModifyBy: "",
      // PatientPic: _formattedPic,
      Emails: data.Email || "",
      BranchID: "",
      BloodGroup: data.BloodGroup || "",
      MaritalStatus: data.MaritalStatus || "",

      VisitPanelName: data.VisitPanelName || "",
      VisitPatientType: data.VisitPatientType || "",
      VisitRefBy: data.VisitRefBy || "",
      VisitID: data.VisitID || "",
      isInsuranceActive: data.isInsuranceActive || "",
    };
  }

  calculateAge(birthday) {
    // birthday is a date
    // birthday = new Date(birthday)
    // var ageDifMs = Date.now() - birthday.getTime();
    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
    // return Math.abs(ageDate.getUTCFullYear() - 1970);
    let obj = { days: 0, months: 0, years: 0 };
    if (!moment(birthday).isValid()) {
      return obj;
    }
    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    let bday: any = new Date(
      birthday.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    ); //(2021, 3, 2);
    let currentDate: any = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    let diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);
      // if(obj.months >= 12) {obj.months = 0; obj.years = 1}
    } else {
      obj.days = diffDays;
    }
    /*
    this.patientBasicInfo.patchValue({
      //Age: obj.years ? (obj.years + ' years') : obj.months ? (obj.months + ' months') : (obj.days + 'days')
      Age: obj.years ? obj.years : obj.months ? obj.months : obj.days
    });
    this.patientBasicInfo.patchValue({
      dmy: obj.years ? '3' : obj.months ? '2': '1'
    });
    */
    return obj;
  }

  convertDate(date) {
    let dateToReturn = "";
    if (!date) {
      return dateToReturn;
    }
    if (typeof date === "string") {
      dateToReturn = moment(date).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
    } else if (typeof date === "object") {
      dateToReturn = moment(
        Conversions.formatDateObjectToString(date),
        "MM/DD/YYYY HH:mm:ss"
      ).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
      // dateToReturn = moment(Conversions.formatDateObjectToString(date)).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
    }
    if (dateToReturn == "Invalid date") {
      dateToReturn = date;
    }
    return dateToReturn;
    // return date.day + '-' + date.month + '-' + date.year;
  }

  openPatientPicture() {
    this.patPicPopupRef = this.appPopupService.openModal(
      this.patPicPopup,
      this.ngbModalOptions
    );
    if (this._patientData && this._patientData.PatientID) {
      this.getAndDisplayPatientPic(this._patientData.PatientID);
    }
  }
  // isCoppied = null;
  copyText(pin: any) {
    this.helper.copyMessage(pin);
    // this.isCoppied = true;
    // setTimeout(() => {
    //   this.isCoppied = false;
    // }, 3000);
  }

  expiryStaus = [];
  insuranceBadge: {
    class: string;
    text: string;
    tooltip: string;
    backgroundcolor: string;
  } = null;

  checkInsuranceExpiryStatus(PatientID) {
    this.expiryStaus = [];
    this.insuranceBadge = null;

    const _params = {
      PatientID: PatientID
      // PatientPortalUserID: null,
    };

    this.spinner.show(this.spinnerRefs.patientInfoBar);

    this.lookupService.getInsuranceExpiryDate(_params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.patientInfoBar);

        if (res && res.StatusCode === 200 && res.PayLoadStr) {
          let data;
          try {
            data = JSON.parse(res.PayLoadStr);
          } catch (ex) {
            console.error("Payload parse error:", ex);
            return;
          }

          this.expiryStaus = data;

          if (this.expiryStaus.length > 0) {
            const record = this.expiryStaus[0];
            const newDays = record?.NewExpireDays;
            const statusID = record?.InsuranceStatusID;
            const isActive = record?.isInsuranceActive;

            // 🔹 Debugging (optional):

            // ✅ Rule: statusID = 10 => Cancelled Expired
            if (statusID === 10) {
              this.insuranceBadge = {
                class: "bg-danger",
                text: "FIT Coverage Expired",
                backgroundcolor: "",
                tooltip: "Cancelled Expired",
              };
            }
            // ✅ Rule 1: If insurance is active and statusID = 5
            else if (statusID === 5) {
              if (isActive === true) {
                if (newDays <= 0) {
                  this.insuranceBadge = {
                    class: "bg-danger",
                    text: "FIT Coverage Expired",
                    tooltip: "FIT Coverage has expired",
                    backgroundcolor: "rgb(128, 0, 0)", // dark red
                  };
                } else if (newDays <= 10) {
                  this.insuranceBadge = {
                    class: "near-expiry",
                    text: "Near To Expiry",
                    tooltip: "FIT Coverage expiring soon",
                    backgroundcolor: "rgb(163, 35, 0)", // red
                  };
                } else {
                  this.insuranceBadge = {
                    class: "bg-primary",
                    text: "FIT Coverage Activated",
                    backgroundcolor: "",
                    tooltip: "FIT Coverage activated",
                  };
                }
              } else {
                this.insuranceBadge = {
                  class: "bg-secondary",
                  text: "FIT Coverage Inactive",
                  tooltip: "FIT Coverage is not active",
                  backgroundcolor: "",
                };
              }
            }



            // ✅ Rule 2: StatusID = 2 and NewExpireDays > 7
            else if (statusID === 2 && newDays > 7) {
              this.insuranceBadge = {
                class: "bg-danger",
                text: "FIT Coverage Expired",
                backgroundcolor: "",
                tooltip: "7 days expired",
              };
            }
            // ✅ Rule 3: StatusID != 2 and NewExpireDays > 90
            else if (statusID !== 2 && newDays > 90) {
              this.insuranceBadge = {
                class: "bg-danger",
                text: "FIT Coverage Expired",
                backgroundcolor: "",
                tooltip: "90 days expired",
              };
            }
             else if (statusID == 9 && newDays <= 0) {
              this.insuranceBadge = {
                class: "bg-danger",
                text: "FIT Coverage Expired",
                backgroundcolor: "",
                tooltip: "Expired",
              };
            }
            // ✅ Rule 4: StatusID = 2 and NewExpireDays <= 7
            else if (statusID === 2 && newDays <= 7) {
              this.insuranceBadge = {
                class: "bg-warning",
                text: "Willing",
                tooltip: "",
                backgroundcolor: "",
              };
            }
            // ✅ Rule 5: StatusID = 6 
           else if (statusID === 6) {
              if (isActive === true) {
                if (newDays <= 0) {
                  this.insuranceBadge = {
                    class: "bg-danger",
                    text: "FIT Coverage Expired",
                    tooltip: "FIT Coverage has expired",
                    backgroundcolor: "rgb(128, 0, 0)", // dark red
                  };
                } else if (newDays <= 10) {
                  this.insuranceBadge = {
                    class: "near-expiry",
                    text: "Near To Expiry",
                    tooltip: "FIT Coverage expiring soon",
                    backgroundcolor: "rgb(163, 35, 0)", // red
                  };
                } else {
                  this.insuranceBadge = {
                    class: "bg-primary",
                    text: "FIT Coverage Reactivated",
                    backgroundcolor: "",
                    tooltip: "FIT Coverage Reactivated",
                  };
                }
              } else {
                this.insuranceBadge = {
                  class: "bg-secondary",
                  text: "FIT Coverage Inactive",
                  tooltip: "FIT Coverage is not active",
                  backgroundcolor: "",
                };
              }
            }

          }

        }
      },
      (err) => {
        this.spinner.hide(this.spinnerRefs.patientInfoBar);
        console.error(err);
        this.toastr.error("Something went wrong. " + err.statusText);
      }
    );
  }
}
