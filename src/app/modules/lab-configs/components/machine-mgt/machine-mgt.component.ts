// @ts-nocheck
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { LabConfigsService } from "../../services/lab-configs.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AuthService, UserModel } from "src/app/modules/auth";
// import * as signalR from '@microsoft/signalr';
import { SignalrService } from "../../services/signalr.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { NgbModalRef, NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { DoctorShareService } from "src/app/modules/ris/services/doctor-share.service";
import { ChangeDetectorRef, NgZone, OnDestroy } from "@angular/core";
import { Conversions } from "src/app/modules/shared/helpers/conversions";

@Component({
  standalone: false,

  selector: "app-machine-mgt",
  templateUrl: "./machine-mgt.component.html",
  styleUrls: ["./machine-mgt.component.scss"],
})
export class MachineMgtComponent implements OnInit, OnDestroy {
  @ViewChild("videoElement") videoElement: ElementRef;
  @ViewChild("showbranchSelectionModal") showbranchSelectionModal;
  branchPopupRef: NgbModalRef;
  MachineID: any = null;
  isOnOff: any = true;
  isOnOffRemarks: any = null;
  MachineList = [];
  SectionList = [];
  SubSectionList = [];
  searchText = "";
  searchTextMachine = "";
  MachineExistingRow = [];
  BranchesList: any = [];
  multiBranchesList: any = [];
  LabDeptID = -1;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonTests = false; // Button Enabled / Disables [By default Enabled]
  disabledButtonParams = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true; //Hide Loader
  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    paramsListSection: "paramsListSection",
    machineFormSection: "machineFormSection",
  };

  ActionLabel = "Save";
  CardTitle = "Add Machine";
  machineConfigForm = this.fb.group({
    MachineName: ["", Validators.compose([Validators.required])],
    MachineCode: ["", Validators.compose([Validators.required])],
    MachineDetail: [""],
    Abbreviation: ["", Validators.compose([Validators.required])],
    Capacity: ["", Validators.compose([Validators.required])],
    isManual: [0],
    isOperational: [0],
    TestSectionID: ["", Validators.compose([Validators.required])],
    TestSubSectionID: [""],
    MachineDesc: [""],
    machineBranch: [""],
    MachineStartTime: [""],
    MachineEndTime: [""],
    Duration: [""],
    // machineBranch: ['', [Validators.required]]
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
  testList: any[];
  MachineNameToShowOnCard: any = "";
  MachineTestID: any = null;
  ExistingSelectedTests: any = [];

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

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
    private LabConfService: LabConfigsService,
    private auth: AuthService,
    private signalrService: SignalrService,
    private testProfileService: TestProfileService,
    private appPopupService: AppPopupService,
    private doctorShare: DoctorShareService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  rowIndex = null;
  ngOnInit(): void {
    this.getTestProfileList();
    // this.signalrService.startConnection();
    this.getBranches();
    // setTimeout(() => {
    //   this.signalrService.askServerListener();
    //   this.signalrService.askServer();
    // }, 2000);

    // setTimeout(() => {
    //   this.signalrService.askServerListener();
    //   this.signalrService.test('there we go')
    // }, 3000);

    this.loadLoggedInUserInfo();
    this.getMachine(this.MachineID, null);
    this.getSection();
  }
  getTestProfileList() {
    this.spinner.show(this.spinnerRefs.testListSection);
    this.testList = [];
    const _param = {
      BranchID: 1,
      isRadiologyTests: 0,
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
  allParamsList = [];
  machineBranchId = null;

  GetAllParamMappingByMachineIdLocId(event) {
    console.log("event:", event);
    if (!event) {
      this.allParamsList = [];
      return;
    }
    this.spinner.show(this.spinnerRefs.paramsListSection);
    this.allParamsList = [];
    if (!this.machineBranchId) {
      this.toastr.warning("Please select branch first");
      return;
    }
    if (!this.MachineID) {
      this.toastr.warning("Please select Machine first");
      return;
    }
    const _param = {
      MachineID: this.MachineID,
      LocID: this.machineBranchId,
    };
    this.LabConfService.GetAllParamMappingByMachineIdLocId(_param).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.paramsListSection);
        if (res && res.StatusCode == 200 && res.PayLoad) {
          const data = res.PayLoad;
          this.allParamsList = data || [];
        }
      },
      (err) => {
        console.log("err:", err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.paramsListSection);
      }
    );
  }

  ngOnDestroy() {
    this.signalrService.hubConnection?.off("askServerResponse");
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getSection() {
    this.SectionList = [];
    const objParm = {
      SectionID: -1,
    };
    this.lookupService.getSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        this.SectionList = _response.filter((a) => a.SectionId != 7);
      },
      (err) => {
        this.toastr.error("Connection error");
      }
    );
  }

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
        MachineID: this.MachineID,
        MachineName: formValues.MachineName,
        MachineCode: formValues.MachineCode,
        Abbreviation: formValues.Abbreviation,
        Capacity: formValues.Capacity,
        isManual: formValues.isManual == true ? 1 : 0,
        isOperational: formValues.isOperational == true ? 1 : 0,
        TestSectionID: formValues.TestSectionID,
        TestSubSectionID:
          formValues.TestSubSectionID == ""
            ? null
            : formValues.TestSubSectionID,
        LocID: formValues.machineBranch,
        MachineDetail: formValues.MachineDetail,
        MachineDesc: formValues.MachineDesc,
        MachineStartTime: formValues.MachineStartTime? Conversions.formatTimeObject(formValues.MachineStartTime): null,
        MachineEndTime: formValues.MachineEndTime ? Conversions.formatTimeObject(formValues.MachineEndTime): null,
        CreatedBy: this.loggedInUser.userid || -99,
      };
      this.LabConfService.insertUpdateMachine(formData).subscribe(
        (data: any) => {
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.spinner.hide(this.spinnerRefs.machineFormSection);
              this.toastr.success(data.Message);
              this.clearForm();
              this.getMachine(this.MachineID, null);
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

  getMachine(MachineID, i) {
    this.rowIndex = i;
    this.machineBranchId = null;
    this.allParamsList = [];
    this.testList.forEach((element, index) => {
      element.checked = false;
      element.PerformingTime = "";
      element.MachineTestID = null;
    });
    this.MachineExistingRow = [];
    this.ExistingSelectedTests = [];
    this.MachineID = MachineID;
    if (MachineID) {
      this.ActionLabel = "Update";
      this.CardTitle = "Update Machine";
      this.confirmationPopoverConfig["popoverTitle"] =
        "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?";
      this.spinner.show(this.spinnerRefs.machineFormSection);
    } else {
      this.ActionLabel = "Save";
      this.CardTitle = "Add Machine";
      this.confirmationPopoverConfig["popoverTitle"] =
        "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?";
      this.spinner.show(this.spinnerRefs.listSection);
    }

    const params = {
      MachineID: MachineID,
    };
    this.LabConfService.getMachine(params).subscribe(
      (res: any) => {
        this.MachineID
          ? this.spinner.hide(this.spinnerRefs.machineFormSection)
          : this.spinner.hide(this.spinnerRefs.listSection);
        if (res.StatusCode == 200) {
          if (params.MachineID) {
            this.disabledButtonTests = false;
            this.MachineExistingRow = res.PayLoadDS["Table"][0] || [];
            this.ExistingSelectedTests = res.PayLoadDS["Table1"] || [];
            if (this.ExistingSelectedTests.length) {
              this.testList.forEach((element, index) => {
                const matchedTests = this.ExistingSelectedTests.find(
                  (a) => a.TPId == element.TPId
                );
                if (matchedTests) {
                  element.checked = true;
                  element.PerformingTime = this.ExistingSelectedTests.find(
                    (a) => a.TPId == element.TPId
                  ).PerformingTime;
                  element.MachineTestID = this.ExistingSelectedTests.find(
                    (a) => a.TPId == element.TPId
                  ).MachineTestID;
                }
              });
            }
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
            });
            this.MachineNameToShowOnCard =
              this.MachineExistingRow["MachineName"];
            this.isOnOff = this.MachineExistingRow["isOnOff"];
            this.isOnOffRemarks =
              this.MachineExistingRow["isOnOffRemarks"] || null;
          } else {
            this.clearForm();
            this.MachineList = res.PayLoadDS["Table"] || [];
            this.refreshPagination();
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
        this.MachineID
          ? this.spinner.hide(this.spinnerRefs.machineFormSection)
          : this.spinner.hide(this.spinnerRefs.listSection);
      }
    );
    this.spinner.hide();
  }
  selectedTabIndex = 0;
  clearForm() {
    this.rowIndex = null;
    this.selectedTabIndex = 0;
    this.MachineNameToShowOnCard = "";
    this.MachineID = null;
    this.ActionLabel = "Save";
    this.disabledButtonTests = true;
    this.confirmationPopoverConfig["popoverTitle"] =
      "Are you <b>sure</b> want to " + this.ActionLabel.toLowerCase() + " ?";
    this.CardTitle = "Add Machine";
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
        this.multiBranchesList = _response;
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
          MachineID: this.MachineID,
          CreatedBy: this.loggedInUser.userid || -99,
          tblMachineTest: selectedTests.map((a) => {
            return {
              MachineTestID: a.MachineTestID,
              MachineID: this.MachineID,
              TPID: a.TPId,
              PerformingTime: a.PerformingTime,
              MachinePriority: null,
            };
          }),
        };
        this.LabConfService.insertUpdateMachineTest(objParam).subscribe(
          (data: any) => {
            this.spinner.hide(this.spinnerRefs.testListSection);
            this.disabledButtonTests = false;
            this.isSpinner = true;
            if (JSON.parse(data.PayLoadStr).length) {
              if (data.StatusCode == 200) {
                this.toastr.success(data.Message);
                this.getMachine(this.MachineID, null);
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

  associateParamss() {
    this.disabledButtonParams = true;
    this.isSpinner = false;
    const selectedParams = this.allParamsList.filter((a) => a.Allow);
    console.log("selectedParams:", selectedParams);
    let isValid = true;

    selectedParams.forEach((a) => {
      if (!a.AssayCode?.trim() || !a.MachineCode?.trim()) {
        isValid = false;
      }
    });

    if (!isValid) {
      this.toastr.warning(
        "Please provide mandatory fields for Assay Code and Machine Code."
      );
      this.disabledButtonParams = false;
      this.isSpinner = true;
      return;
    } else {
      // if (selectedParams.length) {
      const objParam = {
        MachineID: this.MachineID,
        LocID: this.machineBranchId,
        CreatedBy: this.loggedInUser.userid || -99,
        tblParamMachineAssayCode: selectedParams.map((a) => {
          return {
            ParamMachineAssayCodeID: a.ParamMachineAssayCodeID || -1,
            ParamID: a.PId,
            AssayCode: a.AssayCode,
            MachineCode: a.MachineCode,
          };
        }),
      };
      this.spinner.show(this.spinnerRefs.paramsListSection);
      this.LabConfService.insertUpdateMachineParams(objParam).subscribe(
        (data: any) => {
          this.spinner.hide(this.spinnerRefs.paramsListSection);
          this.disabledButtonParams = false;
          this.isSpinner = true;
          if (JSON.parse(data.PayLoadStr).length) {
            if (data.StatusCode == 200) {
              this.searchText = "";
              this.toastr.success(data.Message);
              this.GetAllParamMappingByMachineIdLocId(this.machineBranchId);
            } else {
              this.toastr.error(data.Message);
            }
          }
        },
        (err) => {
          console.log(err);
          this.spinner.hide(this.spinnerRefs.paramsListSection);
          this.toastr.error("Connection error");
          this.disabledButtonParams = false;
          this.isSpinner = true;
        }
      );
      // }
      // else {
      //   this.toastr.warning("Please select test(s) first");
      //   this.spinner.hide(this.spinnerRefs.paramsListSection);
      //   this.disabledButtonParams = false;
      //   this.isSpinner = true;
      // }
    }
  }

  showBranchSelectionModal() {
    // Reset selectedBranchId
    if (!this.machineBranchId) {
      this.toastr.warning("Please select branch first");
      this.isBranchSubmitted = true;
      return;
    }
    this.selectedBranchId = null;
    this.multiBranchesList = this.BranchesList.filter(
      (b) => b.LocId !== this.machineBranchId
    );
    // Show the modal (requires Bootstrap or equivalent modal handling)
    setTimeout(() => {
      this.branchPopupRef = this.appPopupService.openModal(
        this.showbranchSelectionModal,
        {
          backdrop: "static",
          size: "lg",
        }
      );
    }, 200);
  }

  confirmBranchSelection() {
    if (!this.selectedBranchId) {
      this.toastr.warning("Please select a branch");
      return;
    }

    // Proceed with copying data
    this.copyDataToSelectedBranch();
    this.branchPopupRef.close();
  }
  selectedBranchId = null; // Holds the selected branch ID
  isBranchSubmitted = false;
  copyDataToSelectedBranch() {
    const selectedParams = this.allParamsList.filter((a) => a.Allow);

    if (!selectedParams.length) {
      this.toastr.warning("Please select params(s) first");
      return;
    }
    if (!this.selectedBranchId) {
      this.toastr.warning("Please select branch first");
      this.isBranchSubmitted = true;
      return;
    }
    const objParam = {
      MachineID: this.MachineID,
      SourceLocID: this.machineBranchId, // Use selected branch ID
      TargetLocIDs: this.selectedBranchId.join(","), // Use Targetted branch ID
      CreatedBy: this.loggedInUser.userid || -99,
    };
    console.log("copyDataToSelectedBranch ~ objParam:", objParam);
    this.spinner.show(this.spinnerRefs.paramsListSection);
    this.LabConfService.CopyParamMachineAssayCodeToBranches(objParam).subscribe(
      (data: any) => {
        this.spinner.hide(this.spinnerRefs.paramsListSection);
        if (data.StatusCode === 200 && data.PayLoad[0].Result === 1) {
          this.toastr.success("Data copied successfully");
          this.machineBranchId = null;
          this.GetAllParamMappingByMachineIdLocId(null);
        } else {
          this.toastr.error(data.Message);
        }
      },
      (err) => {
        console.error(err);
        this.spinner.hide(this.spinnerRefs.paramsListSection);
        this.toastr.error("Connection error");
      }
    );
  }
  selectAllTests(e) {
    this.testList.forEach((a) => {
      a.checked = false;
      if (a.TPId > 0) {
        a.checked = e.target.checked;
      }
    });
  }

  selectAllParams(e) {
    this.spinner.show(this.spinnerRefs.paramsListSection);

    // Run the heavy loop outside Angular to improve performance
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const isChecked = e.target.checked;
        this.allParamsList = this.allParamsList.map((a) => ({
          ...a,
          Allow: isChecked,
        }));

        // Run change detection inside Angular zone
        this.ngZone.run(() => {
          this.spinner.hide(this.spinnerRefs.paramsListSection);
          this.cdr.detectChanges();
        });
      }, 0);
    });
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  refreshPagination() {
    this.pagination.filteredSearchResults = this.MachineList;
    const dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize
      );
    // console.log("🚀 this.pagination.paginatedSearchResults:", this.pagination.paginatedSearchResults)
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

  allParamsCheckbox = false;
  clearAllCheckedCheckbox() {
    // if (this.searchText.length > 0) {
    //   this.allParamsCheckbox = false;
    //   this.allParamsList.forEach((a) => {
    //     a.Allow = false;
    //   });
    // }
  }

tooltipVisible = false;
hoveredMachineID: number | null = null;
tooltipBranchesMap: Record<number, string> = {};

showTooltip(machineId: number) {
  this.hoveredMachineID = machineId;
  this.tooltipVisible = true;

  // Only fetch if not already fetched
  if (!this.tooltipBranchesMap[machineId]) {
    this.tooltipBranchesMap[machineId] = 'Loading...';
    const _param = { MachineID: machineId };

    this.LabConfService.GetLocationsByMachineID(_param).subscribe(
      (res: any) => {
        if (res?.StatusCode === 200 && res.PayLoad) {
          const branches = res.PayLoad[0]?.Branches || 'NA';
          this.tooltipBranchesMap[machineId] = branches 
        } else {
          this.tooltipBranchesMap[machineId] = 'No data';
        }
      },
      (err) => {
        this.tooltipBranchesMap[machineId] = 'Error loading';
      }
    );
  }
}

hideTooltip() {
  this.tooltipVisible = false;
  this.hoveredMachineID = null;
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
