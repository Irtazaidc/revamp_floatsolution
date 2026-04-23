// @ts-nocheck
import { Component,Input,OnChanges,OnInit,ViewChild,ElementRef,} from "@angular/core";
// import { LabConfigsService } from '../../services/lab-configs.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { FormBuilder,  FormControl, FormGroup, Validators,} from "@angular/forms";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { AuthService, UserModel } from "src/app/modules/auth";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { RISCommonService } from "src/app/modules/ris/services/ris-common.service";
// import { RISCommonService } from '../../../services/ris-common.service';
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { LabConfigsService } from "src/app/modules/lab-configs/services/lab-configs.service";
import { SignalrService } from "src/app/modules/lab-configs/services/signalr.service";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { forkJoin } from 'rxjs';


@Component({
  standalone: false,

  selector: "app-machine-status-log",
  templateUrl: "./machine-status-log.component.html",
  styleUrls: ["./machine-status-log.component.scss"],
})
export class MachineStatusLogComponent implements OnInit, OnChanges {
  @Input() locationId: {};
  @Input() subsectionId: any = null;
  RISMachineID: any = null;
  MachineID: any = null;
  isOnOff: any = true;
  isOnOffRemarks: any = null;
  MachineLogList = [];
  LABMachineLogList = [];
  MachineList = [];
  newMachineList = [];
  newLabMachineList = [];
  LocId = [];
  searchText = "";
  MachineExistingRow = [];
  BranchesList: any = [];
  filteredMachines = [];
  filteredSearchResults = [];
  loggedInUser: UserModel;
  spinnerRefs = {
    listSection: "listSection",
    logSection: "logSection",
  };

  machineConfigForm: FormGroup = this.fb.group({
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
  });

  page = 1;
  pageSize = 5;
  collectionSize = 0;

  paginatedSearchResults = [];
  testList = [];
  MachineNameToShowOnCard: any = "Machine Log";
  subSectionList: any = [];
  multiple = true;
  validateBranch = false;
  techAudit = true;
  branchList: any = [];
  selectedStatus = "";
  selectedSectionId: any;
  selectedBranchId: any;
  previousSectionFilter: any;
  radoiologistTime: any;
  selectedLocation = '';
  machineLogPopupRef: NgbModalRef;
  selectedMachineType: any;
  

  constructor(
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private risCommonService: RISCommonService,
    private LabConfService: LabConfigsService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private auth: AuthService,
    private appPopupService: AppPopupService,

  ) {}

  rowIndex = null;

  ngOnInit(): void {
    // this.getRISMachine();
    this.getCombinedMachineLogs();
    this.getBranches();
    this.loadLoggedInUserInfo();
    this.getSubSection();

    this.machineConfigForm = new FormGroup({
      machineBranch: new FormControl(null),
    });
  }

  ngOnChanges() {

    if (this.locationId) {
      this.filterState.branchId = this.locationId;
    }
    if (this.subsectionId) {
      this.filterState.sectionId = this.subsectionId;
    }
    setTimeout(() => {
      this.machineConfigForm.patchValue({
        machineBranch: this.locationId,
        machineSubsection: this.subsectionId
      });
      this.applyFilters();
    }, 300);
    // Apply all filters
  }
  @ViewChild('machineLogModal') machineLogModal;

  machineLogProcess() { 
    if (this.machineLogModal) {
      this.machineLogPopupRef = this.appPopupService.openModal(this.machineLogModal, { backdrop: 'static', size: 'xl' });
    } else {
      console.error("machineLogModal not found");
    }
  }

  @ViewChild('labMachineLogModal') labMachineLogModal;

  labMachineLogProcess() { 
    if (this.labMachineLogModal) {
      this.machineLogPopupRef = this.appPopupService.openModal(this.labMachineLogModal, { backdrop: 'static', size: 'xl' });
    } else {
      console.error("labMachineLogModal not found");
    }
  }




  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  noRecMsg = "Please click any machine to view its log";


  // getRISMachineNew() {
  //   this.newMachineList = [];
  //   let params = {
  //     RISMachineID: this.RISMachineID || null,
  //     Location: null // Add location to the request
  //   };
  
  //   // Make the API call to fetch data
  //   this.risCommonService.getRISMachineLog(params).subscribe(
  //     (res: any) => {
  //       this.spinner.hide(this.spinnerRefs.listSection);
  
  //       if (res.StatusCode === 200) {
  //         this.newMachineList = res.PayLoadDS["Table"] || [];
  
  //         if (this.RISMachineID) {
  //           this.MachineLogList = res.PayLoadDS["Table1"] || [];
  //           if (!this.MachineLogList.length) {
  //             this.noRecMsg = "No log found";
  //           }
  //           this.MachineNameToShowOnCard =
  //             (this.newMachineList[0]?.MachineCode + " - " + this.newMachineList[0]?.MachineName) || "Machine Log";
  
  //           // Open the popup once data is fetched
  //           this.machineLogProcess();
  //         }
  //       } else {
  //         this.toastr.error("Something went wrong! Please contact administrator");
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //       this.toastr.error("Connection error");
  //       this.spinner.hide(this.spinnerRefs.listSection);
  //     }
  //   );
  // }
  //  getLabMachineNew() {
  //   this.newLabMachineList = [];
  //   let params = {
  //     MachineID: this.MachineID || null,
  //     Location: null // Add location to the request
  //   };
  
  //   // Make the API call to fetch data
  //   this.risCommonService.getRISMachineLog(params).subscribe(
  //     (res: any) => {
  //       this.spinner.hide(this.spinnerRefs.listSection);
  
  //       if (res.StatusCode === 200) {
  //         this.newLabMachineList = res.PayLoadDS["Table"] || [];
  
  //         if (this.MachineID) {
  //           this.LABMachineLogList = res.PayLoadDS["Table1"] || [];
  //           if (!this.LABMachineLogList.length) {
  //             this.noRecMsg = "No log found";
  //           }
  //           this.MachineNameToShowOnCard =
  //             (this.newLabMachineList[0]?.MachineCode + " - " + this.newLabMachineList[0]?.MachineName) || "Machine Log";
  
  //           // Open the popup once data is fetched
  //           this.machineLogProcess();
  //         }
  //       } else {
  //         this.toastr.error("Something went wrong! Please contact administrator");
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //       this.toastr.error("Connection error");
  //       this.spinner.hide(this.spinnerRefs.listSection);
  //     }
  //   );
  // }


 getMachineRowLog(item: any) {
  this.spinner.show(this.spinnerRefs.listSection);
  this.noRecMsg = '';
  this.MachineLogList = [];

  if (item.type === 'ris') {
    const params = {
      RISMachineID: item.RISMachineID || null, // Or use correct field
      Location: null
    };
    this.risCommonService.getRISMachineLog(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (res.StatusCode === 200) {
          this.MachineLogList = res.PayLoadDS?.Table1 || [];
          this.MachineNameToShowOnCard =
            (item.MachineCode + ' - ' + item.MachineName) || 'Machine Log';
          if (!this.MachineLogList.length) {
            this.noRecMsg = "No log found";
          }
          this.machineLogProcess(); // Opens the popup
        } else {
          this.toastr.error("Something went wrong!");
        }
      },
      err => {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error("Connection error");
      }
    );
  } else if (item.type === 'lab') {
    const params = {
      MachineID: item.MachineID || null,
      Location: null
    };
    this.risCommonService.getLabMachineLog(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection);
        if (res.StatusCode === 200) {
          this.MachineLogList = res.PayLoadDS?.Table1 || [];
          this.MachineNameToShowOnCard =
            (item.MachineCode + ' - ' + item.MachineName) || 'Machine Log';
          if (!this.MachineLogList.length) {
            this.noRecMsg = "No log found";
          }
          this.machineLogProcess(); // Opens the popup
        } else {
          this.toastr.error("Something went wrong!");
        }
      },
      err => {
        this.spinner.hide(this.spinnerRefs.listSection);
        this.toastr.error("Connection error");
      }
    );
  }
}

  getCombinedMachineLogs() {
  this.spinner.show(this.spinnerRefs.listSection); // Show spinner at the beginning
  this.MachineList = [];

  const labParams = {
    MachineID: null,
    LocID: this.selectedLocation || null,
  };

  const risParams = {
    RISMachineID: null,
    LocID: this.selectedLocation || null,
  };

  forkJoin({
    lab: this.risCommonService.getLabMachineLog(labParams),
    ris: this.risCommonService.getRISMachineLog(risParams)
  }).subscribe({
    next: ({ lab, ris }: { lab: any, ris: any }) => {
      this.spinner.hide(this.spinnerRefs.listSection);

      const labMachines = (lab?.PayLoadDS?.Table || []).map(m => ({ ...m, type: 'lab' }));
      const risMachines = (ris?.PayLoadDS?.Table || []).map(m => ({ ...m, type: 'ris' }));

      this.MachineList = [...labMachines, ...risMachines];

      this.applyFilters();

      if (!this.MachineList.length) {
        this.toastr.info("No record found.");
      } else {
        this.refreshPaginationRis();
      }

      // Handle machine logs if RISMachineID is present
      if (this.RISMachineID) {
        const labLogs = lab?.PayLoadDS?.Table1 || [];
        const risLogs = ris?.PayLoadDS?.Table1 || [];

        this.MachineLogList = [...labLogs, ...risLogs];

        if (!this.MachineLogList.length) {
          this.noRecMsg = "No log found";
        }

        const firstMachine = this.MachineList[0];
        if (firstMachine) {
          this.MachineNameToShowOnCard = `${firstMachine.MachineCode} - ${firstMachine.MachineName}`;
        } else {
          this.MachineNameToShowOnCard = "Machine Log";
        }
      }
    },
    error: (err) => {
      console.log(err);
      this.toastr.error("Connection error");
      this.spinner.hide(this.spinnerRefs.listSection);
    }
  });
}

  getLabMachine() {
    this.MachineList = [];
    const params = {
      MachineID:  null,
      LocID: this.selectedLocation || null
    };
  
    // Make the API call to fetch data
    this.risCommonService.getLabMachineLog(params).subscribe(
      (res: any) => {
        // Hide the spinner
        this.spinner.hide(this.spinnerRefs.listSection);
  
        if (res.StatusCode === 200) {
          // If there's no location filter, show all machines
          this.MachineList = res.PayLoadDS["Table"] || [];
          this.applyFilters();
  
          // If no data found, show a message
          if (!this.MachineList.length) {
            this.toastr.info("No record found.");
          } else {
            // Refresh pagination only if data is present
            this.refreshPaginationRis();
          }
  
          // If RISMachineID is set, handle the machine log
          if (this.RISMachineID) {
            this.MachineLogList = res.PayLoadDS["Table1"] || [];
            if (!this.MachineLogList.length) {
              this.noRecMsg = "No log found";
            }
            this.MachineNameToShowOnCard =
              this.MachineList["MachineCode"] + " - " + this.MachineList["MachineName"] || "Machine Log";
          }
  
        } else {
          this.toastr.error("Something went wrong! Please contact administrator");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.listSection);
      }
    );
  }
  getRISMachine() {
    this.MachineList = [];
    const params = {
      RISMachineID:  null,
      LocID: this.selectedLocation || null
    };
  
    // Make the API call to fetch data
    this.risCommonService.getRISMachineLog(params).subscribe(
      (res: any) => {
        // Hide the spinner
        this.spinner.hide(this.spinnerRefs.listSection);
  
        if (res.StatusCode === 200) {
          // If there's no location filter, show all machines
          this.MachineList = res.PayLoadDS["Table"] || [];
          this.applyFilters();
  
          // If no data found, show a message
          if (!this.MachineList.length) {
            this.toastr.info("No record found.");
          } else {
            // Refresh pagination only if data is present
            this.refreshPaginationRis();
          }
  
          // If RISMachineID is set, handle the machine log
          if (this.RISMachineID) {
            this.MachineLogList = res.PayLoadDS["Table1"] || [];
            if (!this.MachineLogList.length) {
              this.noRecMsg = "No log found";
            }
            this.MachineNameToShowOnCard =
              this.MachineList["MachineCode"] + " - " + this.MachineList["MachineName"] || "Machine Log";
          }
  
        } else {
          this.toastr.error("Something went wrong! Please contact administrator");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.listSection);
      }
    );
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

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
  }
  paginationRis = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };
  filterMachineListByLocation() {
    if (this.selectedLocation) {
        this.MachineList = this.MachineList.filter(
            item => item.Location === this.selectedLocation
        );
    }
}

  refreshPaginationRis() {
    this.filterMachineListByLocation();
    this.paginationRis.filteredSearchResults = this.MachineList;
    const dataToPaginate = this.paginationRis.filteredSearchResults;
    this.paginationRis.collectionSize = dataToPaginate.length;
    this.paginationRis.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.paginationRis.page - 1) * this.paginationRis.pageSize,
        (this.paginationRis.page - 1) * this.paginationRis.pageSize +
          this.paginationRis.pageSize
      );
  }

  getBranches() {
    this.BranchesList = [];
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        const _response = resp.PayLoad;
        _response.forEach((element, index) => {
          _response[index].Title = (element.Title || "").replace(
            "Islamabad Diagnostic Centre (Pvt) Ltd",
            "IDC "
          );
        });
        this.BranchesList = _response;
      },
      (err) => {}
    );
  }

  selectedIndex = 0;
  getDataForTestAssociation() {
    this.selectedIndex = 1;
  }

  // getRisRow(row, i) {
  //   this.MachineLogList = [];
  //   this.rowIndex = i;
  //   this.RISMachineID = row.RISMachineID;
      
  //   this.getRISMachineNew();
  // }

  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="subSectionIDs"] .ng-input input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = null;
    }
  }

  onSelectAllSections() {
    this.machineConfigForm.patchValue({
      subSectionIDs: this.subSectionList.map((a) => a.SubSectionId),
    });
    this.validateBranch = false;
  }

  onUnselectAllSections() {
    this.machineConfigForm.patchValue({
      subSectionIDs: [],
    });
  }

  getSubSection() {
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: -1,
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

  // Object to hold the current filter state for all filters
  filterState = {
    branchId: null, // ID for the selected branch
    sectionId: null, // ID for the selected section
    status: null, // Status (On/Off) filter
  };

  onStatusChange(event: any) {
    const selectedStatus = event.target.value;

    // Handle "Both" case directly
    if (selectedStatus === "") {
      this.filterState.status = "both"; // Special marker for "Both" status
    } else {
      // Otherwise, store the selected status ("On" or "Off")
      this.filterState.status = selectedStatus;
    }

    // Apply all filters
    this.applyFilters();
  }

  onSectionChange(event: any) {
    // Get the selected section ID
    const selectedSectionId = event ? event.SubSectionId : null;

    // Update filter state
    this.filterState.sectionId = selectedSectionId;

    // Apply all filters
    this.applyFilters();
  }

  onBranchChange(event: any) {
    // Get the selected branch ID
    const branchId = event ? event.LocId || event.locationid : null;

    // Update filter state
    this.filterState.branchId = branchId;

    // Apply all filters
    this.applyFilters();
  }

  applyFilters() {
    let filteredMachines = [...this.MachineList]; // Copy the full machine list
    // Apply branch filter if available
    if (this.filterState.branchId !== null) {
      filteredMachines = filteredMachines.filter((machine) => {
        return machine.LocID === this.filterState.branchId;
      });
    }

    // Apply section filter if available
    if (this.filterState.sectionId !== null) {
      filteredMachines = filteredMachines.filter((machine) => {
        return machine.TestSubSectionID === this.filterState.sectionId;
      });
    }

    // Apply status filter if available and not "Both"
    if (
      this.filterState.status !== null &&
      this.filterState.status !== "both"
    ) {
      filteredMachines = filteredMachines.filter((machine) => {
        const machineStatus =
          machine.isOnOff === true ? 1 : machine.isOnOff === null ? 0 : null;
        return machineStatus === parseInt(this.filterState.status, 10);
      });
    }

    // Update the paginated search results with the filtered machines
    this.pagination.paginatedSearchResults = filteredMachines;
  }

  formatTimeRange(startTime: string | null | undefined, endTime: string | null | undefined): string {
    if (!startTime && !endTime) return 'N/A'; // If both are missing, return single "N/A"
  
    const formatTime = (time: string | null | undefined): string => {
      if (!time) return '-'; // If one time is missing, show "-"
      
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return '-'; // Handle invalid format
  
      const suffix = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert 0 -> 12 for 12 AM
  
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
    };
  
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }

  getFormattedDetail(raw: string): string {
if (!raw) return '';
return raw.replace(/(?:\r\n|\r|\n)/g,'<br>');
}

}
