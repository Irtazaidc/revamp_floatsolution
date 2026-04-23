// @ts-nocheck
import { Component, OnInit, HostListener } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { DoctorShareService } from "src/app/modules/ris/services/doctor-share.service";
import { QuestionnaireService } from "src/app/modules/ris/services/questionnaire.service";
import { CONSTANTS } from "src/app/modules/shared/helpers/constants";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { BillingService } from "../../services/billing.service";
import { environment } from "src/environments/environment";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import Swal from "sweetalert2";
import { ActivatedRoute } from "@angular/router";

@Component({
  standalone: false,

  selector: "app-my-services-share",
  templateUrl: "./my-services-share.component.html",
  styleUrls: ["./my-services-share.component.scss"],
})
export class MyServicesShareComponent implements OnInit {
  // @HostListener('document:keydown', ['$event'])

  spinnerRefs = {
    searchTable: "searchTable",
  };
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;
  public Fields = {
    dateFrom: ["", Validators.required],
    dateTo: ["", Validators.required],
    doctorID: ["", Validators.required],
    testHeadID: [""],
  };

  isSubmitted = false;
  doctorlevelList = [];
  DoctorShareDetalList = [];
  DoctorShareSummaryList;
  testHeadList = [];
  ifDataPrint = false;
  groupedData = [];
  grandTotalPrice = 0;
  grandTotalShareAmount = 0;
  radoiologistList = [];
  DoctorName = null;
  isChecked = true;
  searchSlipForm: FormGroup = this.formBuilder.group(this.Fields);

  ifDetail = false;
  ifSummary = false;
  AdminAccessPermission = false;
  searchTextShareSummary = "";

  reportType = null;
  radiologistLevel: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private doctorShare: DoctorShareService,
    private questionnaireSrv: QuestionnaireService,
    private Billing: BillingService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRadiologistInfoDetail();
    this.getTestHead();
    this.getPermissions();
    setTimeout(() => {
      this.searchSlipForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
        doctorID: !this.AdminAccessPermission ? this.loggedInUser.userid : null,
      });
      // this.searchSlipForm.get("doctorID").disable();
    }, 500);

    if(!this.AdminAccessPermission){
     this.getScreenPINByUserID();
   }
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  searchDataList() {
    if (this.searchSlipForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    if (!this.reportType) {
      this.toastr.warning("Select Report Type");
      return;
    }
    this.ifSummary = false;
    this.ifDetail = false;
    this.ifDataPrint = false;
    if (this.reportType == 1) {
      this.ifSummary = true;
      this.getRadioShareSummary();
    }
    if (this.reportType == 2) {
      this.ifDetail = true;
      this.getRadioShareDetails();
    }
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    // Check for Ctrl+P or Cmd+P (MacOS)
    if ((event.ctrlKey || event.metaKey) && event.key === "p") {
      event.preventDefault(); // Prevent the default print dialog
    }
  }

  getRadioShareSummary() {
    const formValues = this.searchSlipForm.getRawValue();
    this.DoctorShareSummaryList = [];
    this.DoctorName = null;
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      DocId: this.AdminAccessPermission ? formValues.doctorID : this.loggedInUser.userid,
    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.getRadioDocShareSummary(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          this.DoctorShareSummaryList = res.PayLoad;
          this.DoctorName = this.DoctorShareSummaryList[0].DocName;
          this.ifDataPrint = true;
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
  }

  getRadioShareDetails() {
    const formValues = this.searchSlipForm.getRawValue();
    this.DoctorShareDetalList = [];
    const params = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
      DocId: this.AdminAccessPermission ? formValues.doctorID : this.loggedInUser.userid,
      HeadIds: formValues.testHeadID != "" ? formValues.testHeadID.join(",") : this.testHeadList.map(a => a.HeadId).join(","), //this.testHeadList.map(a => a.HeadId).join(","),
      LocId: -1,
    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.getRadioDocShareDetail(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          this.DoctorShareDetalList = res.PayLoad;
          this.ifDataPrint = true;
          this.groupDataByDoctorAndTest();
          this.groupDataByTestHead();
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
  }

  getTestHead() {
    this.testHeadList = [];

    this.Billing.getTestHeader({}).subscribe(
      (res: any) => {
        if (res.StatusCode === 200) {
          this.testHeadList = res.PayLoad;
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
      }
    );
  }
  getRadiologistInfoDetail() {
    this.radoiologistList = [];
    const params = {
      EmpID: null,
    };
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe(
      (res: any) => {
        if (res.StatusCode === 200) {
          this.radoiologistList = res.PayLoadDS["Table"] || [];
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
      }
    );
  }
  onChange(event: any) {
    this.reportType = event;
  }

  groupDataByDoctorAndTest() {
    const grouped = this.DoctorShareDetalList.reduce((acc, item) => {
      // Group by doctor name
      const doctor = acc.find((d) => d.DocName === item.DocName);
      if (doctor) {
        // Group by test head
        const testHead = doctor.tests.find(
          (t) => t.TestHeadID === item.TestHeadID
        );
        if (testHead) {
          testHead.data.push(item);
        } else {
          doctor.tests.push({
            TestHeadID: item.TestHeadID,
            TestHeadName: item.TestHeadName,
            data: [item],
            totalPrice: 0,
            totalShareAmount: 0,
          });
        }
      } else {
        acc.push({
          DocName: item.DocName,
          tests: [
            {
              TestHeadID: item.TestHeadID,
              TestHeadName: item.TestHeadName,
              data: [item],
              totalPrice: 0,
              totalShareAmount: 0,
            },
          ],
        });
      }
      return acc;
    }, []);

    // Initialize grand totals
    this.grandTotalPrice = 0;
    this.grandTotalShareAmount = 0;

    // Calculate totals for each section and accumulate grand totals
    grouped.forEach((doctor) => {
      doctor.tests.forEach((test) => {
        // Calculate totals for each test section
        test.totalPrice = test.data.reduce((sum, item) => sum + item.Price, 0);
        test.totalShareAmount = test.data.reduce(
          (sum, item) => sum + item.ShareAmount,
          0
        );

        // Accumulate totals for grand total
        this.grandTotalPrice += test.totalPrice;
        this.grandTotalShareAmount += test.totalShareAmount;
      });
    });

    this.groupedData = grouped;
  }

  groupedDataByTestHead = [];
  groupDataByTestHead() {
    this.groupedDataByTestHead = [];

    const grouped = this.DoctorShareDetalList.reduce((acc, item) => {
      // Find if TestHead already exists
      let test = acc.find(t => t.TestHeadID === item.TestHeadID);
      if (!test) {
        test = {
          TestHeadID: item.TestHeadID,
          TestHeadName: item.TestHeadName,
          TotalCases: 0,
          totalPrice: 0,
          totalShareAmount: 0
        };
        acc.push(test);
      }

      // Increment case count
      test.TotalCases += 1;
      test.totalPrice += item.Price;
      test.totalShareAmount += item.ShareAmount;

      return acc;
    }, []);

    this.groupedDataByTestHead = grouped;
    console.log("GroupedDataByTestHead:", this.groupedDataByTestHead);
  }


  calculateTotal(data: any): number {
    return (
      (data.XR || 0) +
      (data.MRI || 0) +
      (data.OPG || 0) +
      (data.CTSCAN || 0) +
      (data.UGS || 0) +
      (data.FLORO || 0) +
      (data.ECHO || 0) +
      (data.ETT || 0) +
      (data.ENDO || 0) +
      (data.PROC || 0) +
      (data.DOPPLER || 0)
    );
  }

  // Function to calculate column total for a particular field (e.g. XR, MRI, etc.)
  calculateColumnTotal(field: string): number {
    return this.DoctorShareSummaryList.reduce(
      (total, current) => total + (current[field] || 0),
      0
    );
  }

  // Function to calculate the grand total
  calculateGrandTotal(): number {
    return this.DoctorShareSummaryList.reduce(
      (grandTotal, current) => grandTotal + this.calculateTotal(current),
      0
    );
  }
  onSelectAllSections() {
    this.searchSlipForm.patchValue({
      testHeadID: this.testHeadList.map(a => a.HeadId)
    });
  }
  onUnselectAllSections() {
    this.searchSlipForm.patchValue({
      testHeadID: []
    });
  }

  printMyShareReport() {
    const formValues = this.searchSlipForm.getRawValue();
    if (this.reportType == 1) {
      const url =
        environment.patientReportsPortalUrl +
        "my-services-share?p=" +
        btoa(
          JSON.stringify({
            // DoctorShareSummaryList: this.DoctorShareSummaryList,
            reportType: this.reportType,
            DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
            DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
            DocId: this.loggedInUser.userid,
          })
        );
      const winRef = window.open(url.toString(), "_blank");
    }
    if (this.reportType == 2) {
      const url =
        environment.patientReportsPortalUrl +
        "my-services-share?p=" +
        btoa(
          JSON.stringify({
            // DoctorShareDetalList: this.DoctorShareDetalList,
            reportType: this.reportType,
            DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
            DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
            DocId: this.loggedInUser.userid,
            HeadId: formValues.testHeadID || -1,
            LocId: this.loggedInUser.locationid,
          })
        );
      const winRef = window.open(url.toString(), "_blank");
    }
  }
  isPINGenerated = false;
  isPINAuthinticated = false;
  getScreenPINByUserID() {
    const paramObj = {
      UserID: this.loggedInUser.userid
    }
    this.sharedService.getData(API_ROUTES.GET_SCREEN_PIN_BY_USER_ID, paramObj).subscribe((data: any) => {
      const response = data.PayLoad;
      console.log("response is ", response)
      this.isPINGenerated = response.some(item => item.ScreenPINID == 1 && item.AppUserScreenPINID);
      // if (this.isPINGenerated) {
      this.checkSecurityPIN();
      // }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    });
  }


  secutityPIN = null;
  async checkSecurityPIN() {
    const { isConfirmed } = await Swal.fire({
      title: 'Authenticate Your Security Key',
      html: `
      <form id="swal-form" autocomplete="off" onsubmit="return false">
        <!-- Dummy input to confuse autofill -->
        <input type="text" style="display:none" name="fake-username">

        ${!this.isPINGenerated
          ? `<div class="row no-gutters align-items-start mt-2" style="background-color: #FFE2E5; border: 1px solid #FFE2E5; padding: 10px; border-radius: 4px; margin-left: 0; margin-right: 0;">
              <div class="col-auto pr-2">
                <img src="./assets/images/brand/info-icon-red.png" alt="Info Icon" style="height: 36px; width: 36px;">
              </div>
              <div class="col" style="padding-left: 0;">
                <small class="d-block" style="color: #fb2d2d; font-size: 0.9rem; text-align: justify;">
                  To protect your secure data, you must first generate your secret key. Please visit the
                  <a href="#/emp-profile/security-key-generator" id="generate-key-link" class="text-primary font-weight-bold">
                    Security Key Generator
                  </a> screen to generate your key.
                </small>
              </div>
            </div> <hr>`
          : `
            <p>Please enter your security key to view your share</p>
            <input type="text" id="masked-input"
              class="form-control form-control-lg mt-2"
              style="border: 1px solid #5ea5a2 !important; font-family: 'password'"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="Enter your 6-digit security key"
              autocomplete="off"
              maxlength="6">

            <div class="row no-gutters align-items-start mt-3" style="border-top: 1px solid #bfbfbf; padding-top: 10px; margin-left: 0; margin-right: 0;">
              <div class="col-auto pr-2">
                <img src="./assets/images/brand/info-icon3.png" alt="Info Icon" style="height: 36px; width: 36px;">
              </div>
              <div class="col" style="padding-left: 0;">
                <small class="text-muted d-block" style="text-align: justify;">
                  If you don't trust your existing security key, you can reset it, or if you no longer wish to use a security key for accessing your data, you can also deactivate it
                  <a href="#/emp-profile/security-key-generator" id="reset-key-link" class="text-primary font-weight-bold">here</a>.
                </small>
              </div>
            </div>`
        }
      </form>
    `,
      didOpen: () => {
        // Handle Generate PIN link
        const generateLink = document.getElementById('generate-key-link') as HTMLAnchorElement;
        if (generateLink) {
          generateLink.addEventListener('click', (event) => {
            event.preventDefault();
            Swal.close();
            window.location.hash = '/emp-profile/security-key-generator';
          });
        }

        // Handle PIN input if already generated
        if (this.isPINGenerated) {
          const input = document.getElementById('masked-input') as HTMLInputElement;
          const realValue: string[] = [];

          if (input) {
            input.value = '';
            input.focus();

            input.addEventListener('keydown', (e) => {
              const navigationKeys = [
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End', 'Tab', 'Shift', 'Control', 'Meta', 'Alt'
              ];

              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') return;
              if (navigationKeys.includes(e.key)) return;

              const selectionStart = input.selectionStart || 0;
              const selectionEnd = input.selectionEnd || 0;

              let newCursorPos = selectionStart;

              if (e.key === 'Backspace' || e.key === 'Delete') {
                if (selectionStart !== selectionEnd) {
                  // Delete selected range
                  realValue.splice(selectionStart, selectionEnd - selectionStart);
                  newCursorPos = selectionStart;
                } else if (e.key === 'Backspace' && selectionStart > 0) {
                  realValue.splice(selectionStart - 1, 1);
                  newCursorPos = selectionStart - 1;
                } else if (e.key === 'Delete' && selectionStart < realValue.length) {
                  realValue.splice(selectionStart, 1);
                  newCursorPos = selectionStart;
                }
              } else if (/[0-9]/.test(e.key)) {
                if (realValue.length >= 6 && selectionStart === selectionEnd) {
                  e.preventDefault();
                  return;
                }

                if (selectionStart !== selectionEnd) {
                  realValue.splice(selectionStart, selectionEnd - selectionStart, e.key);
                  newCursorPos = selectionStart + 1;
                } else {
                  realValue.splice(selectionStart, 0, e.key);
                  newCursorPos = selectionStart + 1;
                }
              } else if (e.key === 'Enter') {
                e.preventDefault();
                (Swal.getConfirmButton() as HTMLElement).click();
                return;
              } else {
                e.preventDefault();
                return;
              }

              e.preventDefault();
              realValue.splice(6); // Ensure max 6 digits
              input.value = '*'.repeat(realValue.length);

              // Clamp position between 0 and realValue.length
              newCursorPos = Math.max(0, Math.min(newCursorPos, realValue.length));
              input.setSelectionRange(newCursorPos, newCursorPos);
            });
            const resetLink = document.getElementById('reset-key-link') as HTMLAnchorElement;
            if (resetLink) {
              resetLink.addEventListener('click', (event) => {
                event.preventDefault();
                Swal.close();
                window.location.hash = '/emp-profile/security-key-generator';
              });
            }

            (Swal.getConfirmButton() as HTMLElement)?.addEventListener('click', async () => {
              if (realValue.length !== 6) {
                Swal.showValidationMessage('Please enter your 6-digit security key');
                return;
              }
              this.secutityPIN = realValue.join('');
              await this.verifyUserByPIN();

              if (!this.isPINAuthinticated) {
                Swal.showValidationMessage('Invalid PIN. Please try again.');
                return;
              }
              Swal.close();
            });
          }
        }
      },
      showCancelButton: true,
      showConfirmButton: this.isPINGenerated,
      confirmButtonText: '&nbsp;&nbsp;<i class="ti-check text-white"></i>  OK &nbsp;&nbsp;',
      cancelButtonText: '<i class="ti-close text-white"></i> Cancel',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'sweet-alert-confirm-btn-primary'
      },
      preConfirm: () => false // skip default validation, handled manually
    });
  }



  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault(); // prevents input of non-numeric chars
      return false;
    }
    return true;
  }

  verifyUserByPIN(): Promise<boolean> {
    return new Promise((resolve) => {
      const paramObj = {
        ScreenPINID: 1,
        UserID: this.loggedInUser.userid,
        PIN: this.secutityPIN
      };
      this.sharedService.getData(API_ROUTES.VERIFY_USER_BY_PIN, paramObj).subscribe({
        next: (data: any) => {
          const response = data.PayLoad;
          if (data.StatusCode == 200 && response[0].Result == 1) {
            this.isPINAuthinticated = true;
            this.toastr.success("Your security key has been verified successfully", "Success");
            resolve(true); // Success
          } else {
            this.toastr.error("Your security key is invalid. Please try again with the correct security key.");
            this.isPINAuthinticated = false;
            resolve(false); // Invalid
          }
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Connection error');
          this.isPINAuthinticated = false;
          resolve(false); // Error
        }
      });
    });
  }
  screenPermissionsObj
  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log("User Screen Permsions___",this.screenPermissionsObj);
    this.AdminAccessPermission = this.screenPermissionsObj?.admin_share_access ? true : false;
    console.log("🚀  this.AdminAccessPermission:", this.AdminAccessPermission)
  }
}
