// @ts-nocheck
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LabTatsService } from "src/app/modules/lab/services/lab-tats.service";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { PrintReportService } from "src/app/modules/print-reports/services/print-report.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { environment } from "src/environments/environment";
import { CONSTANTS } from "src/app/modules/shared/helpers/constants";
import { PatientService } from "src/app/modules/patient-booking/services/patient.service";
import { ActivatedRoute } from "@angular/router";
import { Conversions } from "src/app/modules/shared/helpers/conversions";
import { VisitService } from "src/app/modules/patient-booking/services/visit.service";
import { RecruitmentService } from "../../services/recruitment.service";
import moment from "moment";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";

@Component({
  standalone: false,

  selector: "app-employee-medical-record",
  templateUrl: "./employee-medical-record.component.html",
  styleUrls: ["./employee-medical-record.component.scss"],
})
export class EmployeeMedicalRecordComponent implements OnInit {
  @ViewChild("patientVisitDocs") patientVisitDocs;
  patientVisitDocsRef: NgbModalRef;
  isDisable = false;
  isSpinnerDisable = true;
  isSubmitted = false;
  branchList = [];
  selectedVisitID = null;
  searchText = "";
  AttachmentId = "0";
  TotalRecord = 0;
  AttachmentFound = 0;
  NoAttachmentFound = 0;
  maxDate: any;
  public Fields = {
    locID: [],
    departmentIds: [],
    Designation: [],
  };
  public fieldForTest = {
    TPId: [],
    patientID: [],
  };

  filterForm: FormGroup = this.formBuilder.group(this.Fields);
  testFilterForm: FormGroup = this.formBuilder.group(this.fieldForTest);
  spinnerRefs = {
    dataTable: "dataTable",
    refByDocField: "refByDocField",
    searchEmployee: "searchEmployee",
    patientVisits: "patientVisits",
    TestSection: "TestSection",
  };
  docAuditDataList: any = null;
  testList: any = null;
  testDropdownList: any = null;
  visitTestsList: any = null;

  paymentModesList = [];
  patientTypeList = [];
  employeesList = [];
  panelList = [];
  patientBasicInforFormSubmitted = false;
  loggedInUser: UserModel;
  departmentsList = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private printRptService: PrintReportService,
    private cd: ChangeDetectorRef,
    private appPopupService: AppPopupService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private visit: VisitService,
    private recruitment: RecruitmentService,
    private visitService: VisitService,
    private testProfileService: TestProfileService
  ) {}

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getLocationList();
    this.getDepartment();
    this.getDesignations();
    this.getTestProfileList();
    this.getEmployeesData();

    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 500);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getLookupsForRegistration() {
    this.paymentModesList = [];
    this.lookupService
      .getLookupsForRegistration({ branchId: this.loggedInUser.locationid })
      .subscribe(
        (resp: any) => {
          const _response = resp.PayLoadDS || [];
          this.paymentModesList = _response.Table5 || [];
          this.patientTypeList = _response.Table6 || [];
        },
        (err) => {
          console.log(err);
        }
      );
  }

  designaitonsList = [];

  getDesignations() {
    this.designaitonsList = [];
    this.recruitment.getDesignations().subscribe(
      (resp: any) => {
        this.designaitonsList = resp.PayLoad || [];
        if (!this.designaitonsList.length) {
          console.log("No Recored found");
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getDepartment() {
    this.departmentsList = [];
    this.lookupService.GetDepartments().subscribe(
      (resp: any) => {
        this.departmentsList = resp.PayLoad || [];
        if (!this.departmentsList.length) {
          console.log("No Recored found");
        }
      },
      (err) => {
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

  rowIndex = null;
  onDataLoaded(data: any[]) {
    this.docAuditDataList = data;
    this.AttachmentFound = this.docAuditDataList.filter(
      (item) => item.DocumentsFound != 0
    ).length;
    this.NoAttachmentFound = this.docAuditDataList.filter(
      (item) => item.DocumentsFound === 0
    ).length;
    this.rowIndex = data.length > 0 ? 0 : null; // Set the first row as selected if data exists
    if (data.length > 0) {
      const cleanedVisitId = data[0].PIN?.replace(/-/g, "");
      this.selectedVisitID = cleanedVisitId;
      this.GetVisitTestDetails(this.selectedVisitID);
      console.log("VisitIDDDD: ", this.selectedVisitID);
    }
  }

  GetVisitTestDetails(EncVisitID: any) {
    const params = {
      AccountNo: EncVisitID,
      branchID: 1,
      SampleRefNo: "",
      HospitalMRNo: "",
      ForAllProfileTests: 0,
    };
    console.log("Visit Test Details params: ", params);

    this.spinner.show(this.spinnerRefs.dataTable);
    this.printRptService.getVisitDetails(params).subscribe(
      (resp: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        console.log("Visit Test Details Response: ", resp);

        if (resp && resp.statusCode == 200 && resp.payLoad) {
          const parsedPayload = JSON.parse(resp.payLoad);
          this.testList = parsedPayload.Table || [];

          console.log("testList:::: ", this.testList);
        } else {
          this.toastr.info("No Data Found");
        }
      },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.dataTable);
      }
    );
  }

  isRowSelected = false;
  getTableRowData(patient: any, index: number) {
    console.log("Full patient object:", patient); // Debug log
    this.patientVisitsList = [];

    this.selectedVisitID = patient.PatientId; // <-- Adjust if needed after checking log
    this.rowIndex = index;
    this.isRowSelected = true;

    console.log("Extracted patient ID:", this.selectedVisitID);
    this.getVisitsForInvoice(patient);
  }

  patientVisitsList = [];
  selectedPatient: any = null; // globally available
  
  getVisitsForInvoice(patient?: any) {
    if (patient) {
      this.selectedPatient = patient;
    }
  
    console.log("getVisitsForInvoice called", this.selectedPatient);
  
    const selectedTPID = this.testFilterForm.get('TPId')?.value;
    console.log('Selected TPId:', selectedTPID);
  
    this.patientVisitsList = [];
  
    const params = {
      patientID: this.selectedPatient?.PatientId, // uses the stored one
      TPID: selectedTPID || null,
    };
  
    if (params.patientID) {
      this.spinner.show(this.spinnerRefs.patientVisits);
  
      this.patientService.getPatientVisitsByPatientID(params).subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.patientVisits);
          console.log("getVisitsForInvoice:: ", res);
  
          if (res?.StatusCode === 200 && res?.PayLoad?.length) {
            this.patientVisitsList = res.PayLoad;
          } else {
            this.toastr.info("No Data Found");
          }
        },
        (err) => {
          console.error("Error fetching visits:", err);
          this.spinner.hide(this.spinnerRefs.patientVisits);
          this.patientVisitsList = [];
          this.toastr.error("Connection error");
        }
      );
    } else {
      this.toastr.info("Please select a patient first");
    }
  }

  rowIndexBillDetail = null;
  showChildRows: boolean[] = [];

  toggleChildRowsFromButtonGenerated(index: number, event: MouseEvent) {
    this.rowIndexBillDetail = index;
    event.stopPropagation();

    this.toggleChildRowsGenerated(index);

    const selectedRow = this.patientVisitsList[index];
    if (selectedRow && selectedRow.EncVisitID) {
      console.log("selectedRow.EncVisitID::: ", selectedRow.EncVisitID);
      this.GetVisitTestDetails(selectedRow.EncVisitID);
    } else {
      console.warn("EncVisitID not found for selected row:", selectedRow);
    }
  }
  
 toggleChildRowsGenerated(index: number) {
  // Check if the clicked row is already open
  const isAlreadyOpen = this.showChildRows[index];

  // Close all rows
  this.showChildRows = this.showChildRows.map(() => false);

  // If the same row wasn't already open, open it
  if (!isAlreadyOpen) {
    this.showChildRows[index] = true;
  }
}

  

  invoiceCopyType = 1;
  openInvoice(VisitId) {
    console.log("invoice method called");
    const url =
      environment.patientReportsPortalUrl +
      "pat-reg-inv?p=" +
      btoa(
        JSON.stringify({
          visitID: VisitId,
          loginName: this.loggedInUser.username,
          appName: "WebMedicubes:search_pat",
          copyType: this.invoiceCopyType || 0,
          timeStemp: +new Date(),
        })
      );
    window.open(url.toString(), "_blank");
  }

  selectedVisitNo = null;
  showVisitDocs(PIN, VisitId) {
    console.log("docs method called");
    this.selectedVisitID = VisitId;
    this.selectedVisitNo = PIN;
    setTimeout(() => {
      this.patientVisitDocsRef = this.appPopupService.openModal(
        this.patientVisitDocs,
        { size: "lg" }
      );
    }, 100);
  }

  trackByIndex(index: number): number {
    return index;
  }

  employeeDependentsList: any = [];

  getEmployeesData() {
    this.employeesList = [];
    this.TotalRecord = 0;
    this.patientVisitsList = [];
    const formValues = this.filterForm.getRawValue();

    const objParam = {
      DepartmentId: formValues.departmentIds || -1,
      DesignationId: formValues.Designation || -1,
      locId: formValues.locID || -1,
    };

    this.lookupService.getEmployeeListByLocID(objParam).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          let data = res.PayLoadDS.Table;
          try {
            data = JSON.parse(data);
          } catch (ex) {}

          this.employeesList = data || [];
          this.TotalRecord = this.employeesList.length;

          // Call getVisitsForInvoice for each employee with OrbitPatientID
          if (this.employeesList.length > 0) {
            this.employeesList.forEach((employee) => {
              if (employee.OrbitPatientID) {
                this.getVisitsForInvoice(employee);
              }
            });
          } else {
            // If no employees, ensure visits list is cleared
            this.patientVisitsList = [];
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  SelectedTPs: any = [];
  isLetterHead: any = "";

  ViewReport(itemType, rptType, row) {
    let chemistryTestIds = "";
    let pakageTestIds = "";
    let grphicalTestIds = "";
    let radioTestIds = "";

    let chemistryTP: any = [];
    let grphicalTP: any = [];
    let radioTP: any = [];
    let pakageTP: any = [];

    this.SelectedTPs = this.testList.filter(
      (item) => row.PROFILETESTID === item.PROFILETESTID
    );

    if (!this.SelectedTPs.length) {
      this.toastr.error("Please Select Test(s)/Profile(s) to deliver");
    } else {
      pakageTP = this.SelectedTPs.length
        ? this.SelectedTPs.filter((a) => {
            return a.isPackage == 3;
          }).map((a) => {
            return a;
          })
        : "";
      pakageTestIds = pakageTP.length
        ? pakageTP.map((a) => a.PROFILETESTID).join(",")
        : "";
      if (rptType === "grf") {
        grphicalTP = this.SelectedTPs.length
          ? this.SelectedTPs.filter((a) => {
              return (
                a.SECTIONID == 1 &&
                a.permission_ViewGraphicalReportIcon &&
                a.isPackage != 3
              );
            }).map((a) => {
              return a;
            })
          : "";
        grphicalTestIds = grphicalTP.length
          ? grphicalTP.map((a) => a.PROFILETESTID).join(",")
          : "";
      } else if (rptType === "simple") {
        chemistryTP = this.SelectedTPs.length
          ? this.SelectedTPs.filter((a) => {
              return a.SECTIONID == 1 && a.isPackage != 3;
            }).map((a) => {
              return a;
            })
          : "";
        chemistryTestIds = chemistryTP.length
          ? chemistryTP.map((a) => a.PROFILETESTID).join(",")
          : "";
      }
      radioTP = this.SelectedTPs.length
        ? this.SelectedTPs.filter((a) => {
            return a.SECTIONID == 7 && a.isPackage != 3;
          }).map((a) => {
            return a;
          })
        : "";
      radioTestIds = radioTP.length
        ? radioTP.map((a) => a.PROFILETESTID).join(",")
        : "";

      if (pakageTestIds) {
        pakageTP = { ...pakageTP };
        pakageTP[0].PROFILETESTID = pakageTestIds;
        pakageTP[0].ReportType = "pkg";
        pakageTP[0].ItemType = itemType;
        pakageTP[0].AppName = "medicubes";
        pakageTP[0].LoginName_MC = this.loggedInUser.username;
        if (this.isLetterHead) pakageTP[0].headerImage = 1;
        else pakageTP[0].headerImage = 0;

        console.log("pakageTestIds:: ", pakageTP[0]);

        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(pakageTP[0]).subscribe(
          (res: any) => {
            try {
              res = JSON.parse(res);
            } catch (ex) {}
            if (res.success) {
              console.log(res.PatientReportUrl);
              patientReportWinRef.location = this.addSessionExpiryForReport(
                res.PatientReportUrl
              );
            } else {
              alert("Report cannot be opened");
            }
          },
          (err) => {
            alert("Error Opening Report");
          }
        );
      }

      if (chemistryTestIds) {
        chemistryTP = { ...chemistryTP };
        chemistryTP[0].PROFILETESTID = chemistryTestIds;
        chemistryTP[0].ReportType = "tp";
        chemistryTP[0].ItemType = itemType;
        chemistryTP[0].AppName = "medicubes";
        chemistryTP[0].LoginName_MC = this.loggedInUser.username;

        if (this.isLetterHead) chemistryTP[0].headerImage = 1;
        else chemistryTP[0].headerImage = 0;

        console.log("chemistryTestIds:: ", chemistryTP[0]);

        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(chemistryTP[0]).subscribe(
          (res: any) => {
            try {
              res = JSON.parse(res);
            } catch (ex) {}
            if (res.success) {
              console.log(res.PatientReportUrl);
              patientReportWinRef.location = this.addSessionExpiryForReport(
                res.PatientReportUrl
              );
            } else {
              alert("Report cannot be opened");
            }
          },
          (err) => {
            alert("Error Opening Report");
          }
        );
      }

      if (radioTestIds) {
        radioTP = { ...radioTP };
        radioTP[0].PROFILETESTID = radioTestIds;
        radioTP[0].ReportType = "tp";
        radioTP[0].ItemType = itemType;
        radioTP[0].AppName = "medicubes";
        radioTP[0].LoginName_MC = this.loggedInUser.username;
        if (this.isLetterHead) radioTP[0].headerImage = 1;
        else radioTP[0].headerImage = 0;

        console.log("radioTestIds:", radioTP[0]);

        const patientReportWinRef: any = this.openReportWindow();
        this.printRptService.getPatientReportUrl(radioTP[0]).subscribe(
          (res: any) => {
            try {
              res = JSON.parse(res);
            } catch (ex) {}
            if (res.success) {
              console.log(res.PatientReportUrl);
              patientReportWinRef.location = this.addSessionExpiryForReport(
                res.PatientReportUrl
              );
            } else {
              alert("Report cannot be opened");
            }
          },
          (err) => {
            alert("Error Opening Report");
          }
        );
      }

      if (grphicalTestIds) {
        grphicalTP = { ...grphicalTP };
        grphicalTP[0].PROFILETESTID = grphicalTestIds;
        grphicalTP[0].ReportType = "grf";
        grphicalTP[0].ItemType = itemType;
        grphicalTP[0].AppName = "medicubes";
        grphicalTP[0].LoginName_MC = this.loggedInUser.username;
        const patientReportWinRef: any = this.openReportWindow();

        if (this.isLetterHead) grphicalTP[0].headerImage = 1;
        else grphicalTP[0].headerImage = 0;

        console.log("grphicalTestIds:: ", grphicalTP[0]);

        this.printRptService.getPatientReportUrl(grphicalTP[0]).subscribe(
          (res: any) => {
            try {
              res = JSON.parse(res);
            } catch (ex) {}
            if (res.success) {
              console.log(res.PatientReportUrl);
              patientReportWinRef.location = this.addSessionExpiryForReport(
                res.PatientReportUrl
              );
            } else {
              alert("Report cannot be opened");
            }
          },
          (err) => {
            alert("Error Opening Report");
          }
        );
      }
    }
  }
  openReportWindow() {
    const patientVisitInvoiceWinRef = window.open("", "_blank");
    return patientVisitInvoiceWinRef;
  }

  addSessionExpiryForReport(reportUrl) {
    const reportSegments = reportUrl.split("?");
    if (reportSegments.length > 1) {
      reportUrl =
        reportSegments[0] +
        "?" +
        btoa(
          atob(reportSegments[1]) +
            "&SessionExpiryTime=" +
            (+new Date() + CONSTANTS.REPORT_EXPIRY_TIME * 1000)
        );
    }
    return reportUrl;
  }

  addParametersInReportUrl(reportUrl, queryParams) {
    if (!queryParams) {
      return reportUrl;
    }
    const reportSegments = reportUrl.split("?");
    if (reportSegments.length > 1) {
      reportUrl =
        reportSegments[0] + "?" + btoa(atob(reportSegments[1]) + queryParams);
    }
    return reportUrl;
  }

  selectedTPID = 0;

  getTestProfileList() {
    this.testDropdownList = [];
    const _param = {
      branchId: 1,
      TestProfileCode: null,
      TestProfileName: null,
      panelId: null,
      TPIDs: "",
    };
    this.spinner.show(this.spinnerRefs.TestSection);
    this.testProfileService.getTestsByName(_param).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.TestSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) {}
        this.testDropdownList = data || [];
      }
    });
  }
}
