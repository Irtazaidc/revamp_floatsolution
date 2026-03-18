// @ts-nocheck
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { QuestionnaireService } from "src/app/modules/ris/services/questionnaire.service";

@Component({
  standalone: false,

  selector: "app-radiologist-availability",
  templateUrl: "./radiologist-availability.component.html",
  styleUrls: ["./radiologist-availability.component.scss"],
})
export class RadiologistAvailabilityComponent implements OnInit {
  @Input() doctorslocationId: any;

  isSpinner: boolean = true; //Hide Loader
  radoiologistList: any[] = [];
  doctorsList: any[] = [];
  filteredRadiologistList: any[] = [];
  radoiologistTime: any;
  radoiologistWorkWeek: any;
  ActionLabel = "Save";
  BranchesList: any = [];
  searchText = "";
  isDissabledChk = false;
  isFieldDisabled = false;
  subSectionList: any = [];
  validateBranch = false;
  isSubmitted = false;

  spinnerRefs = {
    listSection: "listSection",
    testListSection: "testListSection",
    machineFormSection: "machineFormSection",
    tableFormSection: "tableFormSection",
  };

  filterCriteria = {
    location: null,
    doctor: null,
    workWeek: null,
  };
  filteredTableData = [];
  tableData = [];

  selectedIndex = 0;

  filterState = {
    branchId: null, // ID for the selected branch
    sectionId: null, // ID for the selected section
  };

  radiologistAvlForm = this.fb.group({
    LocIDs: [ , Validators.required],
    EmpID: [null],
    WorkWeekID: [null],
    Gender: [null],
    SubSectionIDs: [],
    GeneralShiftID: [null],
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
  http: any;
  gendersList = [];
  labDeptID = -1;

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private auth: AuthService,
    private questionnaireSrv: QuestionnaireService
  ) {}

  ngOnInit(): void {
    this.getBranches();
    this.getGendersList();
    this.getSubSection();
    this.getRadiologistTime();
    this.getRadiologistWorkWeek();

    setTimeout(() => {
      this.getRadiologistsByLocIDs();
    }, 500);

    console.log(
      "Child component initialized with doctorslocationId:",
      this.doctorslocationId
    );
    this.radiologistAvlForm.get("LocIDs")?.valueChanges.subscribe((value) => {
      if (!value || value.length === 0) {
        // Clear the table data when location is cleared
        this.clearTableData();
      }
    });
  }

  ngOnChanges() {
    console.log("ngOnChanges locationid: ", this.doctorslocationId);
    if (this.doctorslocationId) {
      setTimeout(() => {
        this.radiologistAvlForm.patchValue({
          LocIDs: [this.doctorslocationId],
        });
        this.getRadiologistInfoDetail();
      }, 500);
    }
  }

  getRadiologistWorkWeek() {
    let params = {};
    this.isSpinner = false;
    this.lookupService.getWorkWeek(params).subscribe(
      (res: any) => {
        if (res.StatusCode == 200) {
          this.radoiologistWorkWeek = res.PayLoad;
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

  getRadiologistInfoDetail() {
    this.filteredTableData = [];
    let formValues = this.radiologistAvlForm.getRawValue();

    if (
      this.radiologistAvlForm.invalid ||
      !formValues.LocIDs ||
      formValues.LocIDs.length === 0
    ) {
      this.toastr.warning("Please select Location");
      this.isSubmitted = true;
      this.clearTableData();
      return;
    }

    let params = {
      EmpID: formValues.EmpID || null,
      LocIDs: formValues.LocIDs.join(","),
      WorkWeekID: formValues.WorkWeekID || null,
      Gender: formValues.Gender || null,
      SubSectionIDs: formValues.SubSectionIDs?.length > 0 
        ? formValues.SubSectionIDs.join(",") 
        : null,
      GeneralShiftID: formValues.GeneralShiftID || null, // Ensure this resets properly
    };

    // Ensure empty filters don't send incorrect values
    Object.keys(params).forEach(
      (key) => (params[key] === "" ? (params[key] = null) : params[key])
    );

    this.isSpinner = true; // Ensure spinner starts before API call

    this.questionnaireSrv.RadiologistAvailability(params).subscribe(
      (res: any) => {
        this.isSpinner = false; // Stop spinner after API response

        if (res.StatusCode === 200 && res.PayLoad?.length > 0) {
          this.doctorsList = res.PayLoad;
          this.filteredRadiologistList = [...this.doctorsList];
          this.tableData = this.doctorsList;
          this.filteredTableData = this.doctorsList;
        } else {
          this.clearTableData();
          this.toastr.warning("No records found for the selected filters");
        }
      },
      (err) => {
        console.error(err);
        this.toastr.error("Connection error");
        this.clearTableData();
        this.isSpinner = false;
      }
    );
  }



  selectedBranchIDs: any;
  radoiologistList2: any;

  getRadiologistsByLocIDs() {
  // Prepare parameters
  let params = {
    LocIDs: this.selectedBranchIDs?.length
      ? this.selectedBranchIDs.join(",") // Use selected branch IDs
      : this.BranchesList.map((b) => b.LocId).join(","), // Default to all branch IDs if none selected
  };

  // Show spinner while fetching data
  this.isSpinner = true;

  this.questionnaireSrv.getRadiologistByLocIDs(params).subscribe(
    (res: any) => {
      this.isSpinner = false;
      if (res.StatusCode === 200) {
        this.radoiologistList = res.PayLoad; // Store full list of doctors
        this.filteredRadiologistList = [...this.radoiologistList]; // Default filtered list
      } else {
        this.radoiologistList = [];
        this.filteredRadiologistList = [];
        this.toastr.error("No data available for the selected location.");
      }
    },
    (err) => {
      this.isSpinner = false;
      console.error(err);
      this.toastr.error("Connection error. Please try again.");
    }
  );

  // Hide spinner after request
  this.spinner.hide();
}

// Method to filter doctors based on selected doctor
filterDoctorsBySelectedDoctor(selectedDoctor: any) {
  if (!selectedDoctor) {
    // Reset filter if no doctor is selected
    this.filteredRadiologistList = [...this.radoiologistList];
    return;
  }

  // Get the selected doctor's location ID
  let selectedDoctorLocID = selectedDoctor.LocId;

  // Filter doctors who belong to the same location
  this.filteredRadiologistList = this.radoiologistList.filter(
    (doctor) => doctor.LocId === selectedDoctorLocID
  );
}


  filterRadiologistsByLocation() {
    this.filteredRadiologistList = this.radoiologistList.filter(
      (radiologist) =>
        radiologist.LocationFromIorgLoc === this.doctorslocationId
    );
  }

  onBranchChange(event: any) {

    // Extract LocId(s) from event
    if (Array.isArray(event) && event.length > 0) {
      this.selectedBranchIDs = event.map((branch) => branch.LocId);
    } else if (event?.LocId) {
      this.selectedBranchIDs = [event.LocId];
    } else {
      this.selectedBranchIDs = [];
    }

    // Update location filter based on the first selected LocId
    this.filterCriteria.location = this.selectedBranchIDs.length
      ? this.selectedBranchIDs[0]
      : null;

    // Fetch radiologists for the selected branch IDs
    this.getRadiologistsByLocIDs();

    // Filter table data based on the updated location
    if (this.filterCriteria.location !== null) {
      this.filteredTableData = this.tableData.filter(
        (item) => item.LocId == this.filterCriteria.location
      );
    } else {
      this.filteredTableData = [...this.tableData]; // Reset to full table data if no location is selected
    }
  }

  onDoctorChange(event: any) {
    if (!event) {
      // Reset radiologist list to the original list
      this.radoiologistList = this.radoiologistList2;
      // Clear the location field
      this.radiologistAvlForm.patchValue({
        LocIDs: [], // Clear all locations
      });
    } else {
      // Automatically select all locations if a doctor is chosen
      this.radiologistAvlForm.patchValue({
        LocIDs: this.BranchesList.map((branch) => branch.LocId), // Select all locations
      });
    }
  }
  onWorkWeekChange(event: any) {
    this.filterCriteria.workWeek = event ? event.WorkWeekID : null;
    this.applyFilters();
  }
  applyFilters() {
    this.filteredTableData = this.tableData.filter((item) => {
      const matchesLocation = item.LocId == this.filterCriteria.location; // Use loose equality for testing
      const matchesDoctor =
        !this.filterCriteria.doctor ||
        item.EmploymentStatusID == this.filterCriteria.doctor;
      const matchesWorkWeek =
        !this.filterCriteria.workWeek ||
        item.WorkWeekID == this.filterCriteria.workWeek;
      return matchesLocation && matchesDoctor && matchesWorkWeek;
    });
  }

  getBranches() {
    this.BranchesList = [];
    this.lookupService.GetBranches().subscribe(
      (resp: any) => {
        let _response = resp.PayLoad;
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

  clearSearchedvalue() {
    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="subSectionIDs"] .ng-input input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = null;
    }
  }

  checkBranch(e) {
    let visitID = this.radiologistAvlForm.getRawValue().visitID;
    if (!e.length && visitID) this.validateBranch = true;
    else this.validateBranch = false;

    const searchInput: HTMLInputElement = document.querySelector(
      '[formcontrolname="branch"] .ng-input input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = null;
    }
  }
  getRadiologistTime() {
    let params = {};
    this.isSpinner = false;
    this.lookupService.getDHRMGeneralShift(params).subscribe(
      (res: any) => {
        this.isSpinner = true;
        if (res.StatusCode == 200) {
          this.radoiologistTime = res.PayLoad;
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

  onSelectAllBranches() {
    setTimeout(() => {
      this.radiologistAvlForm.patchValue({
        LocIDs: this.BranchesList.map((a) => a.LocId),
      });
    }, 300);
  }
  onUnselectAllBranches() {
    setTimeout(() => {
      this.radiologistAvlForm.patchValue({
        LocIDs: [],
      });
    }, 300);
  }

  clearTableData() {
    this.radoiologistList = [];
    this.filteredRadiologistList = [];
    this.tableData = [];
    this.filteredTableData = [];
  }

  onClearDoctorDropdown() {
    if (Array.isArray(this.radoiologistList2)) {
      this.radoiologistList = [...this.radoiologistList2]; // Reset to original list
    } else {
      console.error(
        "radoiologistList2 is not an array:",
        this.radoiologistList2
      );
      this.radoiologistList = []; // Reset to an empty list to avoid further issues
    }
  }

  getGendersList() {
    this.gendersList = [];
    this.lookupService.getGendersList().subscribe(
      (res: any) => {
        if (res && res.PayLoad && res.PayLoad.length) {
          this.gendersList = res.PayLoad;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getSubSection() {
    this.subSectionList = [];
    let objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID,
    };
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe(
      (resp: any) => {
        let _response = resp.PayLoad;
        this.subSectionList = _response;
      },
      (err) => {
        this.toastr.error("Connection error");
      }
    );
  }
}
