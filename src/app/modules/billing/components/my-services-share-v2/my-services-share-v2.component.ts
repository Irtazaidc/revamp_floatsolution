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
import { SharedService } from "src/app/modules/shared/services/shared.service";
import Swal from "sweetalert2";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { ActivatedRoute } from "@angular/router";
import { FilterByKeyPipe } from "src/app/modules/shared/pipes/filter-by-key.pipe";

@Component({
  standalone: false,

  selector: 'app-my-services-share-v2',
  templateUrl: './my-services-share-v2.component.html',
  styleUrls: ['./my-services-share-v2.component.scss']
})
export class MyServicesShareV2Component implements OnInit {
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
  subSectionId: [],
};

isSubmitted = false;
doctorlevelList = [];
DoctorShareDetalList = [];
DoctorShareDetalSummaryList = [];
DoctorShareDetalSummaryBySectionAndDate = [];
DoctorShareDetalSummaryBySectionPercent = [];
DoctorShareDetalSummaryByDatePercent = [];
DoctorShareSummaryList;
testHeadList = [];
ifDataPrint = false;
groupedData = [];
grandTotalPrice = 0;
grandTotalShareAmount = 0;
radoiologistList = [];
DoctorName = null;
isChecked = true;
TypeID = -1;
searchSlipForm: FormGroup = this.formBuilder.group(this.Fields);

ifDetail = false;
ifSummary = false;
AdminAccessPermission = false;

searchTextShareSummary = "";
searchTextShareDetail = "";

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
  private lookupSrv : LookupService,
  private sharedService: SharedService,
  private route: ActivatedRoute,
) {}

ngOnInit(): void {
  this.loadLoggedInUserInfo();
  this.getRadiologistInfoDetail();
  this.getSubSection();
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
  this.uniqueSubSections = [];
  this.DoctorName = null;
  const params = {
    DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
    DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
    DocId: this.AdminAccessPermission ? formValues.doctorID : this.loggedInUser.userid,
  };
  this.spinner.show(this.spinnerRefs.searchTable);
  this.Billing.getRadioDocShareSummaryV2(params).subscribe(
    (res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable);
      if (res.StatusCode === 200) {
        this.DoctorShareSummaryList = res.PayLoad;
        this.getRISSummaryCounts();
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
clearGroupedSections(){
  this.groupedSections = [];
  this.DoctorShareDetalList = [];
  this.DoctorShareDetalSummaryList = [];
  this.DoctorShareDetalSummaryBySectionAndDate = [];
  this.DoctorShareDetalSummaryBySectionPercent =  [];
  this.DoctorShareDetalSummaryByDatePercent =  [];
}

getRadioShareDetails(){
  this.ifDetail = true;
  const formValues = this.searchSlipForm.getRawValue();
  this.DoctorShareDetalList = [];
  this.clearGroupedSections();
  const params = {
    DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
    DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
    DocId: this.AdminAccessPermission ? formValues.doctorID : this.loggedInUser.userid,
    SubSectionID: formValues.subSectionId || -1,
    TypeId: this.TypeID,
  };
  this.spinner.show(this.spinnerRefs.searchTable);
  this.Billing.getRadioDocShareDetailV2(params).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.searchTable);
    if (res.StatusCode === 200) {
      this.DoctorShareDetalList = (res.PayLoadDS['Table'] || []);
      this.DoctorShareDetalSummaryList = (res.PayLoadDS['Table1'] || []);
      this.DoctorShareDetalSummaryBySectionAndDate = (res.PayLoadDS['Table2'] || []);
      this.DoctorShareDetalSummaryBySectionPercent = (res.PayLoadDS['Table3'] || []);
      this.DoctorShareDetalSummaryByDatePercent = (res.PayLoadDS['Table4'] || []);
      // console.log("this.DoctorShareDetalList__",this.DoctorShareDetalList)
      this.ifDataPrint = true;
      this.groupDataBySubSection(); 
      // this.groupDataByTestHead();
    }
    else {
      this.toastr.error('Something Went Wrong');
    }
  }, (err) => {
    console.log(err);
    this.toastr.error('Connection error');
    this.spinner.hide(this.spinnerRefs.searchTable);
  })
}

// getTestHead() {
//   this.testHeadList = [];

//   this.Billing.getTestHeader({}).subscribe(
//     (res: any) => {
//       if (res.StatusCode === 200) {
//         this.testHeadList = res.PayLoad;
//       } else {
//         this.toastr.error("Something Went Wrong");
//       }
//     },
//     (err) => {
//       console.log(err);
//       this.toastr.error("Connection error");
//     }
//   );
// }
getRadiologistInfoDetail() {
  this.radoiologistList = [];
  const params = {
    EmpID: null,
  };
  this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe(
    (res: any) => {
      if (res.StatusCode === 200) {
        this.radoiologistList = res.PayLoadDS["Table"] || [];
        this.radoiologistList = this.radoiologistList.map(item => ({
        ...item,
        DocLabel: `${item.EmpNoWithPrefix} - ${item.FullName}`}));
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

customSearch(term: string, item: any) {
      term = term.toLowerCase();
      return (
          (item.FullName && item.FullName.toLowerCase().includes(term)) ||
          (item.EmpNoWithPrefix && item.EmpNoWithPrefix.toLowerCase().includes(term))
      );
  }
  
onChange(event: any) {
  this.reportType = event;
}

groupedSections: any[] = [];
overallGrandTotal = {
  reportedBy: 0,
  dsBy: 0,
  grandTotal: 0
};

groupDataBySubSection() {

  console.log('Grouping started:', this.DoctorShareDetalList);

  this.groupedSections = [];
  const sectionMap = new Map<number, any>();

  if (!this.DoctorShareDetalList || !this.DoctorShareDetalList.length) {
    console.warn('No DoctorShareDetalList found');
    return;
  }

  this.DoctorShareDetalList.forEach(item => {

    // HANDLE GRAND TOTAL
    if (item.SubSectionID == null && item.PatientName === 'GRAND TOTAL') {
      this.overallGrandTotal = {
        // Price: item.Price || 0,
        reportedBy: item['Reported By'] || 0,
        dsBy: item['DS By'] || 0,
        grandTotal: item.TotalShare || 0
      };
      return;
    }

    if (item.SubSectionID == null) {
      return; // skip invalid rows
    }

    if (!sectionMap.has(item.SubSectionID)) {
      sectionMap.set(item.SubSectionID, {
        SubSectionID: item.SubSectionID,
        SubSectionTitle: item.SubSectionTitle,
        rows: [],
        // totalPrice: 0,
        totalReportedBy: 0,
        totalDSBy: 0,
        totalGrandTotal: 0
      });
    }

    const section = sectionMap.get(item.SubSectionID);
    section.rows.push(item);

    // section.totalPrice += item.Price || 0;
    section.totalReportedBy += item['Reported By'] || 0;
    section.totalDSBy += item['DS By'] || 0;
    section.totalGrandTotal += item.TotalShare || 0;
  });

  this.groupedSections = Array.from(sectionMap.values());

  console.log('FINAL GROUPED SECTIONS:', this.groupedSections);
}


groupedDataByTestHead = [];

groupDataByTestHead() {
  this.groupedDataByTestHead = [];

  if (!this.DoctorShareDetalList?.length) {
    return;
  }

  const groupedMap = this.DoctorShareDetalList.reduce((acc, item) => {

    // Skip invalid / grand total rows
    if (!item.SubSectionID || item.PatientName === 'GRAND TOTAL') {
      return acc;
    }

    const key = item.SubSectionID;

    if (!acc[key]) {
      acc[key] = {
        SubSectionId: item.SubSectionID,
        TestHeadName: item.SubSectionTitle,
        TotalCases: 0,
        totalReportedBy: 0,
        totalDSBy: 0,
        sectionTotal: 0
      };
    }

    acc[key].TotalCases += 1;
    acc[key].totalReportedBy += item['Reported By'] || 0;
    acc[key].totalDSBy += item['DS By'] || 0;
    acc[key].sectionTotal =
      acc[key].totalReportedBy + acc[key].totalDSBy;

    return acc;
  }, {} as any);

  this.groupedDataByTestHead = Object.values(groupedMap);

  console.log('GroupedDataByTestHead:', this.groupedDataByTestHead);
}



uniqueDates: string[] = [];
uniqueSubSections: string[] = [];
groupedDataByDate: any[] = [];
getRISSummaryCounts() {
  const dataMap = new Map<string, any>();
  this.uniqueSubSections = [];

  this.DoctorShareSummaryList.forEach(item => {
    const dateKey = item.ShareDate.split('T')[0];
    const section = item.SubSectionTitle;

    if (!this.uniqueSubSections.includes(section)) {
      this.uniqueSubSections.push(section);
    }

    if (!dataMap.has(dateKey)) {
      dataMap.set(dateKey, { ShareDate: dateKey });
    }

    const row = dataMap.get(dateKey);

    if (!row[section]) {
      row[section] = { dsBy: 0, reportedBy: 0 };
    }

    row[section].dsBy += item['DS By'] || 0;
    row[section].reportedBy += item['Reported By'] || 0;

    dataMap.set(dateKey, row);
  });

  this.uniqueSubSections.sort();
  this.uniqueDates = Array.from(dataMap.keys());
  this.groupedDataByDate = Array.from(dataMap.values());

  console.log("Processed groupedDataByDate:", this.groupedDataByDate);
}

calculateRowTotal(row: any): number {
  return this.uniqueSubSections.reduce((sum, section) => {
    const data = row[section];
    return sum + (data?.dsBy || 0) + (data?.reportedBy || 0);
  }, 0);
}


// Total per column
calculateColumnTotal(section: string, key: 'dsBy' | 'reportedBy'): number {
  return this.groupedDataByDate.reduce((total, row) => {
    const data = row[section];
    return total + (data?.[key] || 0);
  }, 0);
}


// Grand total
calculateGrandTotal(): number {
  return this.groupedDataByDate.reduce((grand, row) => grand + this.calculateRowTotal(row), 0);
}


// printMyShareReport() {
//   let formValues = this.searchSlipForm.getRawValue();
//   if (this.reportType == 1) {
//     const url =
//       environment.patientReportsPortalUrl +
//       "my-services-share?p=" +
//       btoa(
//         JSON.stringify({
//           // DoctorShareSummaryList: this.DoctorShareSummaryList,
//           reportType: this.reportType,
//           DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
//           DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
//           DocId: this.loggedInUser.userid,
//         })
//       );
//     let winRef = window.open(url.toString(), "_blank");
//   }
//   if (this.reportType == 2) {
//     const url =
//       environment.patientReportsPortalUrl +
//       "my-services-share?p=" +
//       btoa(
//         JSON.stringify({
//           // DoctorShareDetalList: this.DoctorShareDetalList,
//           reportType: this.reportType,
//           DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
//           DateTo: Conversions.formatDateObject(formValues.dateTo) || null,
//           DocId: this.loggedInUser.userid,
//           HeadId: formValues.testHeadID || -1,
//           LocId: this.loggedInUser.locationid,
//         })
//       );
//     let winRef = window.open(url.toString(), "_blank");
//   }
// }

subSectionList =[]
 getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: 2
    }
    this.lookupSrv.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      const _response = resp.PayLoad;
      this.subSectionList = _response;
    }, (err) => {
      this.toastr.error('Connection error');
    })
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
                  <img src="./assets/images/brand/info-icon3.png" alt="Info Icon" style="height: 36px; width: 36px; color: #034a8dff;">
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
              this.toastr.error("Your security key is invalid. Please try again with correct security key.");
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
    this.AdminAccessPermission = this.screenPermissionsObj?.admin_share_accessV2 ? true : false;
    console.log("🚀  this.AdminAccessPermission:", this.AdminAccessPermission)
  }

  filterResults() {
     const cols = ['PIN','PatientName','TPName','SubSectionTitle'];
     let results: any = this.groupedSections;
     if (this.searchTextShareDetail && this.searchTextShareDetail.length > 1) {
       const pipe_filterByKey = new FilterByKeyPipe();
       results = pipe_filterByKey.transform(this.DoctorShareDetalList, this.searchTextShareDetail, cols, this.DoctorShareDetalList);
     }
     this.DoctorShareDetalList = results;
      this.groupDataBySubSection();
   }
}
