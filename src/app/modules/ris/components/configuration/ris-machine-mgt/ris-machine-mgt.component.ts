// @ts-nocheck
import { Component, Input,OnChanges, OnInit, ViewChild,  ElementRef,} from "@angular/core";
// import { LabConfigsService } from '../../services/lab-configs.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AuthService, UserModel } from "src/app/modules/auth";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { RISCommonService } from "../../../services/ris-common.service";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { QuestionnaireService } from "../../../services/questionnaire.service";
import { DoctorShareService } from "../../../services/doctor-share.service";
import { NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-ris-machine-mgt",
  templateUrl: "./ris-machine-mgt.component.html",
  styleUrls: ["./ris-machine-mgt.component.scss"],
})
export class RISMachineMgtComponent implements OnInit {
  RISMachineID: any = null;
  isOnOff: any = true;
  isOnOffRemarks: any = null;
  MachineList = [];
  SectionList = [];
  SubSectionList = [];
  searchText = "";
  searchTextMachine = "";
  MachineExistingRow = [];
  BranchesList: any = [];
  filteredAvailableRadiologist = [];
  LabDeptID = -1;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonTests = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true; //Hide Loader
  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    machineFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
    radTable: "radTable",
    searchTable: "searchTable",
  };
  selectedShift = " ";
  isSubmitted = false;

  ActionLabel = "Save";
  CardTitle = "Add RIS Machine";
  machineConfigForm = this.fb.group({
    MachineName: ["", Validators.compose([Validators.required])],
    MachineCode: ["", Validators.compose([Validators.required])],
    MachineDetail: [""],
    Abbreviation: ["", Validators.compose([Validators.required])],
    Capacity: [""],
    isManual: [0],
    isOperational: [0],
    TestSubSectionID: ["", Validators.compose([Validators.required])],
    MachineDesc: [""],
    machineBranch: ["", Validators.compose([Validators.required])],
    AETitle: [""],
    MachineModel: [""],
    MachineManufactureID: [""],
    MachineStartTime: [""],
    MachineEndTime: [""],
    Duration: [""],
    // machineBranch: ['', [Validators.required]]
  });
  radiologistAvlForm = this.fb.group({
    LocID: ["", Validators.compose([Validators.required])],
  });
  loggedInUser: UserModel;
  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle:
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?", // 'Are you sure?',
    popoverTitleTests: "Are you <b>sure</b> want to save ?", // 'Are you sure?',
    popoverMessage: "",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };
  page = 1;
  pageSize = 5;
  collectionSize = 0;
  filteredSearchResults = [];
  paginatedSearchResults = [];
  testList = [];
  MachineNameToShowOnCard: any = "";
  MachineTestID: any = null;
  ExistingSelectedTests: any = [];
  radoiologistWorkWeek: any;
  isDissabledChk = false;
  isFieldDisabled = false;
  operationalTime: any;
  startTime: NgbTimeStruct = { hour: 9, minute: 0, second: 0 };
  endTime: NgbTimeStruct = { hour: 5, minute: 0, second: 0 };

  // refreshPagination() {
  //   this.collectionSize = this.NotificationsList.length;
  //   this.paginatedSearchResults = this.NotificationsList
  //     .map((item, i) => ({id: i + 1, ...item}))
  //     .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  //     console.log('refresh pagination noti list: ',this.paginatedSearchResults)
  // }
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private risCommonService: RISCommonService,
    private auth: AuthService,
    private testProfileService: TestProfileService,
    private sharedService: SharedService,
    private questionnaireSrv: QuestionnaireService,
    private doctorShare: DoctorShareService
  ) {}

  rowIndex = null;
  ngOnInit(): void {
    // this.getTestProfileList();
    this.getBranches();
    this.loadLoggedInUserInfo();
    this.getRISMachine(this.RISMachineID, null, null);
    // this.getSection();
    this.getSubSectionByParent(7);
    this.getMachineManufacture();
    this.getSubSection();
    this.onSelectAllBranches();
    this.getOperationalTime();
  }

  getOperationalTime() {
    const params = {};
    this.isSpinner = false;
    this.lookupService.getDHRMGeneralShift(params).subscribe(
      (res: any) => {
        this.isSpinner = true;
        if (res.StatusCode == 200) {
          this.operationalTime = res.PayLoad;
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        console.log(err);
        this.toastr.error("Connection error");
      }
    );
    this.spinner.hide();
  }

  getTestProfileList() {
    this.spinner.show(this.spinnerRefs.testListSection);
    this.testList = [];
    const _param = {
      BranchID: 1,
      isRadiologyTests: 1,
      SubSectionIDs: null,
    };
    this.doctorShare.getTestPrfoileRadiologistTests(_param).subscribe(
      (res: any) => {
        if (res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data = JSON.parse(data);
          } catch (ex) {}
          this.testList = data || [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  machineManufactureList = [];
  getMachineManufacture() {
    const _param = {};
    this.sharedService
      .getData(API_ROUTES.GET_MACHINE_MANUFACTURE, _param)
      .subscribe(
        (res: any) => {
          if (res && res.StatusCode == 200 && res.PayLoad) {
            const data = res.PayLoad;
            this.machineManufactureList = data || [];
          }
        },
        (err) => {
          this.toastr.error("Connection error");
        }
      );
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  // getSection() {
  //   this.SectionList = [];
  //   let objParm = {
  //     SectionID: -1
  //   }
  //   this.lookupService.getSectionBySectionID(objParm).subscribe((resp: any) => {
  //     let _response = resp.PayLoad;
  //     this.SectionList = _response.filter(a=>a.SectionId !=7);
  //   }, (err) => {
  //     this.toastr.error('Connection error');
  //   })
  // }

  getSubSectionByParent(SectionID) {
    this.SubSectionList = [];
    const objParm = {
      SectionID: SectionID,
      LabDeptID: this.LabDeptID,
    };
    this.lookupService.getSubSectionByParent(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.SubSectionList = _response;
      },
      (err) => {
        this.toastr.error("Connection error");
      }
    );
  }

  insertUpdateMachine() {
    this.spinner.show(this.spinnerRefs.machineFormSection);
    const formValues = this.machineConfigForm.getRawValue();
    this.machineConfigForm.markAllAsTouched();
    if (this.machineConfigForm.invalid) {
      this.spinner.hide(this.spinnerRefs.machineFormSection);
      this.toastr.warning("Please fill the required fields...!");
      return false;
    } else {
      this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      this.isSpinner = false; // Button Spinner show
      const formData = {
        RISMachineID: this.RISMachineID,
        MachineName: formValues.MachineName,
        MachineCode: formValues.MachineCode,
        Abbreviation: formValues.Abbreviation,
        Capacity: formValues.Capacity,
        isManual: formValues.isManual == true ? 1 : 0,
        isOperational: formValues.isOperational == true ? 1 : 0,
        TestSectionID: 7,
        TestSubSectionID:  formValues.TestSubSectionID == "" ? null : formValues.TestSubSectionID,
        LocID: formValues.machineBranch,
        MachineDetail: formValues.MachineDetail,
        MachineDesc: formValues.MachineDesc,
        AETitle: formValues.AETitle,
        MachineModel: formValues.MachineModel,
        MachineStartTime: formValues.MachineStartTime? Conversions.formatTimeObject(formValues.MachineStartTime): null,
        MachineEndTime: formValues.MachineEndTime ? Conversions.formatTimeObject(formValues.MachineEndTime): null,
        MachineManufactureID: formValues.MachineManufactureID,
        CreatedBy: this.loggedInUser.userid || -99,
      };
      console.log("formData::::: ",formData)
      this.risCommonService.insertUpdateRISMachine(formData).subscribe(
        (data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.spinner.hide(this.spinnerRefs.machineFormSection);
              this.toastr.success(data.Message);
              this.clearForm();
              this.getRISMachine(this.RISMachineID, null, null);
              this.disabledButton = false;
              this.isSpinner = true;
            } else {
              this.spinner.hide(this.spinnerRefs.machineFormSection);
              this.toastr.error(data.Message);
              this.disabledButton = false;
              this.isSpinner = true;
            }
          }
        },
        (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.machineFormSection);
          this.disabledButton = false;
          this.isSpinner = true;
          this.toastr.error("Connection error");
        }
      );
    }
  }

  getRISMachine(RISMachineID, TestSubSectionID, i) {
    this.testList.forEach((element, index) => {
      element.checked = false;
      element.PerformingTime = "";
      element.RISMachineTestID = null;
    });
    this.rowIndex = i;
    this.MachineExistingRow = [];
    this.ExistingSelectedTests = [];
    this.RISMachineID = RISMachineID;
    if (RISMachineID) {
      this.ActionLabel = "Update";
      this.CardTitle = "Update RIS Machine";
      this.confirmationPopoverConfig["popoverTitle"] =
        "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?";
      this.spinner.show(this.spinnerRefs.machineFormSection);
    } else {
      this.ActionLabel = "Save";
      this.CardTitle = "Add RIS Machine";
      this.confirmationPopoverConfig["popoverTitle"] =
        "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?";
      this.spinner.show(this.spinnerRefs.listSection);
    }

    const params = {
      RISMachineID: RISMachineID,
    };
    this.risCommonService.getRISMachine(params).subscribe(
      (res: any) => {
        this.RISMachineID
          ? this.spinner.hide(this.spinnerRefs.machineFormSection)
          : this.spinner.hide(this.spinnerRefs.listSection);
        if (res.StatusCode == 200) {
          // console.log("existint data fo rmachine is : ",res)
          if (params.RISMachineID) {
            this.disabledButtonTests = false;
            this.MachineExistingRow = res.PayLoadDS["Table"][0] || [];
            this.ExistingSelectedTests = res.PayLoadDS["Table1"] || [];
            this.getTestList(TestSubSectionID, this.ExistingSelectedTests);
            this.spinner.hide(this.spinnerRefs.listSection);
            this.machineConfigForm.patchValue({
              MachineName: this.MachineExistingRow["MachineName"],
              MachineCode: this.MachineExistingRow["MachineCode"],
              Abbreviation: this.MachineExistingRow["Abbreviation"],
              Capacity: this.MachineExistingRow["Capacity"],
              isManual: this.MachineExistingRow["isManual"],
              isOperational: this.MachineExistingRow["isOperational"],
              TestSectionID: this.MachineExistingRow["TestSectionID"],
              TestSubSectionID: this.MachineExistingRow["TestSubSectionID"],
              machineBranch: this.MachineExistingRow["LocID"],
              MachineDetail: this.MachineExistingRow["MachineDetail"],
              MachineDesc: this.MachineExistingRow["MachineDesc"],

              AETitle: this.MachineExistingRow["AETitle"],
              MachineModel: this.MachineExistingRow["MachineModel"],
              MachineManufactureID:
                this.MachineExistingRow["MachineManufactureID"],
            });
            this.MachineNameToShowOnCard =
              this.MachineExistingRow["MachineName"];
            this.isOnOff = this.MachineExistingRow["isOnOff"];
            this.isOnOffRemarks =
              this.MachineExistingRow["isOnOffRemarks"] || null;
          } else {
            this.clearForm();
            this.MachineList = res.PayLoadDS["Table"] || [];
            this.filteredResults = [...this.MachineList];
            this.refreshPagination();
             this.applyFilter();
            if (!this.MachineList.length) {
              this.toastr.info("No record found.");
            }
          }
        } else {
          this.toastr.error(
            "Something went wrong! Please contact administrator"
          );
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.RISMachineID
          ? this.spinner.hide(this.spinnerRefs.machineFormSection)
          : this.spinner.hide(this.spinnerRefs.listSection);
      }
    );
    this.spinner.hide();
  }

  filteredResults: any[] = [];  // after filtering
  applyFilter() {
  if (this.searchTextMachine && this.searchTextMachine.trim() !== '') {
    const search = this.searchTextMachine.toLowerCase();
    this.filteredResults = this.MachineList.filter(item =>
      (item.MachineName?.toLowerCase().includes(search) ||
       item.BranchCode?.toLowerCase().includes(search))
    );
  } else {
    this.filteredResults = [...this.MachineList];
  }

  this.pagination.collectionSize = this.filteredResults.length;
  this.pagination.page = 1; // reset to first page when search changes
  this.refreshPagination();
}
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
  refreshPagination() {
  // use filteredResults if it exists, otherwise fall back to MachineList
  const dataToPaginate = this.filteredResults?.length
    ? this.filteredResults
    : this.MachineList;

  this.pagination.collectionSize = dataToPaginate.length;

  this.pagination.paginatedSearchResults = dataToPaginate
    .map((item, i) => ({ id: i + 1, ...item }))
    .slice(
      (this.pagination.page - 1) * this.pagination.pageSize,
      (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize
    );
}

  clearForm() {
    this.MachineNameToShowOnCard = "";
    this.RISMachineID = null;
    this.ActionLabel = "Save";
    this.disabledButtonTests = true;
    this.confirmationPopoverConfig["popoverTitle"] =
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?";
    this.CardTitle = "Add RIS Machine";
    setTimeout(() => {
      this.machineConfigForm.reset();
    }, 100);
  }

  getBranches() {
    // this.lookupService.GetBranches().subscribe((resp: any) => {
    //   if (resp.StatusCode == 200) {
    //     this.BranchesList = resp.PayLoad||[];
    //     console.log('BranchesList: ',this.BranchesList)
    //   }
    //   else {
    //     this.toastr.error("Something Went Wrong");
    //   }
    // }, (err) => { console.log("err", err) })

    this.BranchesList = [];
    // this.spinner.show('GetBranches');
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        // this.spinner.hide('GetBranches');
        const _response = resp.PayLoad;
        _response.forEach((element, index) => {
          _response[index].Title = (element.Title || "").replace(
            "Islamabad Diagnostic Centre (Pvt) Ltd",
            "IDC "
          );
        });
        this.BranchesList = _response;
        //this.selectedBranch = 0;
        // setTimeout(() => {
        //   //this.selectedBranch = this.loggedInUser.locationid;
        //   this.notificationConfiForm.patchValue({
        //     branchIds: [this.loggedInUser.locationid]
        //   });
        // }, 100);
      },
      (err) => {
        // this.spinner.hide('GetBranches');
      }
    );
  }

  associateTests() {
    this.disabledButtonTests = true; // Lock the button after for submit to wait till process is completed and respone is send
    this.isSpinner = false; // Button Spinner show
    const selectedTests = this.testList.filter((a) => a.checked);
    console.log("selected test are ", selectedTests);
    let isValidPerformingTime = true;
    selectedTests.forEach((a) => {
      if (!a.PerformingTime) {
        isValidPerformingTime = false;
      }
    });
    if (!isValidPerformingTime) {
      this.toastr.warning("Please provide performance time");
      this.spinner.hide(this.spinnerRefs.testListSection);
      this.disabledButtonTests = false;
      this.isSpinner = true;
      return;
    } else {
      if (selectedTests.length) {
        const objParam = {
          RISMachineID: this.RISMachineID,
          CreatedBy: this.loggedInUser.userid || -99,
          tblMachineTest: selectedTests.map((a) => {
            return {
              MachineTestID: a.RISMachineTestID,
              MachineID: this.RISMachineID,
              TPID: a.TPID,
              PerformingTime: a.PerformingTime,
              MachinePriority: null,
            };
          }),
        };
        this.risCommonService.insertUpdateRISMachineTest(objParam).subscribe(
          (data: any) => {
            this.spinner.hide(this.spinnerRefs.testListSection);
            this.disabledButtonTests = false;
            this.isSpinner = true;
            if (JSON.parse(data.PayLoadStr).length) {
              if (data.StatusCode == 200) {
                this.toastr.success(data.Message);
                this.getRISMachine(this.RISMachineID, null, null);
              } else {
                this.toastr.error(data.Message);
              }
            }
          },
          (err) => {
            console.log(err);
            this.spinner.hide(this.spinnerRefs.testListSection);
            this.toastr.error("Connection error");
            this.spinner.hide(this.spinnerRefs.testListSection);
            this.disabledButtonTests = false;
            this.isSpinner = true;
          }
        );
      } else {
        this.toastr.warning("Please select test(s) first");
        this.spinner.hide(this.spinnerRefs.testListSection);
        this.disabledButtonTests = false;
        this.isSpinner = true;
      }
    }
  }

  selectAllTests(e) {
    this.testList.forEach((a) => {
      a.checked = false;
      if (a.TPID > 0) {
        a.checked = e.target.checked;
      }
    });
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getTestList(TestSubSectionID, ExistingSelectedTests) {
    this.spinner.show(this.spinnerRefs.testListSection);
    this.testList = [];
    const _param = {
      TPID: null,
      TestProfileCode: null,
      TestProfileName: null,
      SubSectionID: TestSubSectionID,
      LabDeptID: 2,
    };
    this.sharedService
      .getData(API_ROUTES.GET_TEST_PROFILES_FOR_ANALYTICS, _param)
      .subscribe(
        (res: any) => {
          this.spinner.hide(this.spinnerRefs.testListSection);
          if (res && res.StatusCode == 200 && res.PayLoad) {
            const data = res.PayLoad;
            this.testList = data || [];
            if (this.testList.length && ExistingSelectedTests.length) {
              this.testList.forEach((element, index) => {
                const matchedTests = this.ExistingSelectedTests.find(
                  (a) => a.TPId == element.TPID
                );
                if (matchedTests) {
                  element.checked = true;
                  element.PerformingTime = ExistingSelectedTests.find(
                    (a) => a.TPId == element.TPID
                  ).PerformingTime;
                  element.RISMachineTestID = ExistingSelectedTests.find(
                    (a) => a.TPId == element.TPID
                  ).RISMachineTestID;
                }
              });
            }
          }
        },
        (err) => {
          this.toastr.error("Connection error");
        }
      );
  }

  ////////////////////////////// Radiologist Availability ////////////////////////////

  subSectionList: any = [];
  multiple = true;
  validateBranch = false;
  techAudit = true;
  branchList: any = [];

  buttonControlsPermissions = {
    branch: false,
    modality: false,
    dateFrom: false,
    dateTo: false,
    visitID: false,
    FilterBy: false,
    subsectionids: false,
  };

  selectedIndex = 0;
  getDataForTestAssociation() {
    this.selectedIndex = 1;
  }

  onMachineCodeInput(): void {
    const machineCodeControl = this.machineConfigForm.get("MachineCode");
    if (machineCodeControl) {
      // Set the value to uppercase
      machineCodeControl.setValue(machineCodeControl.value.toUpperCase(), {
        emitEvent: false,
      });
    }
  }

  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="subSectionIDs"] .ng-input input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = null;
    }
  }

  onSelectAllSections() {
    this.radiologistAvlForm.patchValue({
      subSectionIDs: this.subSectionList.map((a) => a.SubSectionId),
    });
    this.validateBranch = false;
  }

  onUnselectAllSections() {
    this.radiologistAvlForm.patchValue({
      subSectionIDs: [],
    });
  }

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: 2,
    };
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.subSectionList = _response;
      },
      (err) => {
        this.toastr.error("Connection error");
      }
    );
  }

  checkBranch(e) {
    const visitID = this.radiologistAvlForm.getRawValue().visitID;
    if (!e.length && visitID) this.validateBranch = true;
    else this.validateBranch = false;

    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="branch"] .ng-input input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = null;
    }
  }

  onSelectAllBranches() {
    this.radiologistAvlForm.patchValue({
      branch: this.branchList.map((a) => a.LocId),
    });
    this.validateBranch = false;
  }
  onUnselectAllBranches() {
    this.radiologistAvlForm.patchValue({
      branch: [],
    });
    this.validateBranch = true;
  }

  calculateDuration() {
    const startTime = this.machineConfigForm.get("MachineStartTime").value;
    const endTime = this.machineConfigForm.get("MachineEndTime").value;

    // Check if either StartTime or EndTime is empty
    if (!startTime || !endTime) {
      // If either is empty, clear the Duration field
      this.machineConfigForm.get("Duration").setValue("");
      return; // Exit the function early
    }

    // Convert Start and End times to Date objects with a base date to make comparison easier
    const startDateTime = new Date(0, 0, 0, startTime.hour, startTime.minute);
    const endDateTime = new Date(0, 0, 0, endTime.hour, endTime.minute);

    // If the end time is earlier than the start time, add 24 hours to the end time
    if (endDateTime < startDateTime) {
      endDateTime.setHours(endDateTime.getHours() + 24); // Add 24 hours
    }

    // Calculate the difference in milliseconds, then convert to hours and minutes
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationMin = durationMs / (1000 * 60); // Duration in minutes
    const durationHours = Math.floor(durationMin / 60); // Calculate full hours
    const durationRemainingMinutes = Math.round(durationMin % 60); // Remaining minutes

    // Set the duration field in hours and minutes
    const totalDuration = `${durationHours} hours ${durationRemainingMinutes} minutes`;
    this.machineConfigForm.get("Duration").setValue(totalDuration);
  }




isFullDayMachine = false;

onMachineModeToggle(event: any): void {
  this.isFullDayMachine = event.target.checked;

  if (this.isFullDayMachine) {
    this.machineConfigForm.patchValue({
      MachineStartTime: { hour: 0, minute: 0 },
      MachineEndTime: { hour: 23, minute: 59 }
    });
  } else {
    this.machineConfigForm.patchValue({
      MachineStartTime: null,
      MachineEndTime: null
    });
  }

  this.calculateDuration(); 
}

}
