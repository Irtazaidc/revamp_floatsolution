// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";

@Component({
  standalone: false,

  selector: "app-kbs-branches-config",
  templateUrl: "./kbs-branches-config.component.html",
  styleUrls: ["./kbs-branches-config.component.scss"],
})
export class KbsBranchesConfigComponent implements OnInit {
  isSpinner: boolean = true; //Hide Loader
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  Branch: any;
  BranchServicesList: any;
  searchBranchText = "";
  searchServiceText = "";
  ActionLabel = "Save";
  selectedBranch: any = null;
  loggedInUser: UserModel;
  spinnerRefs = {
    dataTable: "dataTable",
  };

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

  editForm!: FormGroup;
  kbsBranchServicesForm!: FormGroup;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadLoggedInUserInfo();
    this.getAssignedBranches();
  }

  onContentChange(data: any, field: string, event: FocusEvent) {
    const element = event.target as HTMLElement;
    data[field] = element.innerHTML.trim();
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  insertUpdateKBSBranchServices() {
    if (!this.BranchServicesList || this.BranchServicesList.length === 0) {
      this.toastr.warning("No services found to save.");
      return;
    }
    this.spinner.show(this.spinnerRefs.dataTable);

    // Filter only checked rows
    const allowedServices = this.BranchServicesList.filter(
      (item) => item.Allowed === 1,
    );

    if (allowedServices.length === 0) {
      this.toastr.warning("Please check at least one service before saving.");
      return;
    }

    // Validate checked rows
    for (let i = 0; i < allowedServices.length; i++) {
      const item = allowedServices[i];

      if (
        !item.Extension ||
        !item.OptTiming ||
        !item.ServiceDetail ||
        !item.SpecialRemarks
      ) {
        this.toastr.warning(`Please fill all fields for the allowed service.`);
        return;
      }
    }

    this.disabledButton = true;
    this.isSpinner = true;

    // Prepare an array for typDKBSBranches
    const tblKBSBranchServices = allowedServices.map((fv) => ({
      LocID: this.selectedBranch.LocId,
      DKBSServiceID: fv.DKBSServicesID,
      IsActive: fv.IsActive,
      Extension: fv.Extension,
      OptTiming: fv.OptTiming,
      ServiceDetail: fv.ServiceDetail,
      SpecialRemarks: fv.SpecialRemarks,
    }));

    const params = {
      UserID: this.loggedInUser.userid,
      ServiceOrLocID: this.selectedBranch.LocId,
      IsServiceOrLoc: "L",
      tblKBSBranchServices,
    };

    console.log(params);

    this.lookupService.insertUpdateKBSBranchServices(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.dataTable);
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Configuration saved successfully!");
          this.selectedBranch = null;
          this.getKBSBranch();
          this.getKBSBranchServicesByLocID();
          this.clearSelection();
        } else {
          this.toastr.error("Failed to add branch");
        }
      },
      (err) => {
        console.error(err);
        this.toastr.error("Connection error");
      },
    );
  }

  initializeForm() {
    this.editForm = this.fb.group({
      location: [""],
      managerName: [""],
      address: [""],
      managerExt: [""],
      cityCode: [""],
      ReceiptionistName: [""],
      ReceiptionistExt: [""],
    });
  }

  onSelectBranch(branch: any) {
    this.selectedBranch = branch;
    this.isEditing = true;

    this.selectedLocID = branch.LocId; // <-- FIXED

    if (!this.selectedLocID) {
      this.toastr.error("LocId missing in selected branch");
      return;
    }

    this.editForm.patchValue({
      location: branch.LocCode,
      managerName: branch.ManagerName,
      address: branch.Address,
      managerExt: branch.ManagerExt,
      cityCode: branch.CityCode,
      operationalTiming: branch.OperationalTiming,
      ReceiptionistName: branch.ReceiptionistName,
      ReceiptionistExt: branch.ReceiptionistExt,
    });

    // Disable non-editable fields
    this.editForm.get("location")?.disable();
    this.editForm.get("address")?.disable();
    this.editForm.get("cityCode")?.disable();

    this.getKBSBranchServicesByLocID();
  }

  selectedLocID: number | null = null;
  getKBSBranch() {
    if (!this.branchesList || this.branchesList.length === 0) {
      console.warn("branchesList is empty, skipping KBS call");
      return;
    }

    const branches = this.branchesList.map((b) => b.LocId).join(",");
    console.log("Assigned Branches LocIDs:", branches);

    const params = {
      LocIDs: branches,
    };

    this.isSpinner = false;
    this.disabledButton = true;

    this.lookupService.getKBSBranche(params).subscribe(
      (res: any) => {
        this.disabledButton = false;
        this.isSpinner = true;

        if (res.StatusCode === 200) {
          this.Branch = res.PayLoad;
        } else {
          this.toastr.error("Something went wrong");
        }
      },
      (err) => {
        this.isSpinner = true;
        this.disabledButton = false;
        console.log(err);
        this.toastr.error("Connection error");
      },
    );
  }
  branchesList = [];

  getAssignedBranches() {
    this.branchesList = [];

    // Determine UserID parameter
    let userIdParam =
      this.loggedInUser?.userid === 2674 || this.loggedInUser?.userid === 2616
        ? 1
        : this.loggedInUser?.userid || -99;

    let param = {
      UserID: userIdParam,
    };

    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;

          try {
            data.forEach((element, index) => {
              data[index].Title = (element.Title || "").replace(
                "Islamabad Diagnostic Centre (Pvt) Ltd",
                "IDC ",
              );
            });
          } catch (ex) {}

          this.branchesList = data || [];

          // ✅ CALL HERE (after data arrives)
          if (this.branchesList.length > 0) {
            this.getKBSBranch();
          } else {
            console.warn("No assigned branches found");
          }
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  getKBSBranchServicesByLocID() {
    this.BranchServicesList = [];
    if (!this.selectedBranch?.LocId) return;

    this.isSpinner = true;
    const params = { LocID: this.selectedBranch.LocId };

    this.lookupService.getKBSBranchServicesByLocID(params).subscribe(
      (res: any) => {
        this.isSpinner = false;
        this.disabledButton = false;

        if (res.StatusCode === 200 && res.PayLoad) {
          // Store API response exactly as received
          this.BranchServicesList = res.PayLoad.map((item) => ({
            ...item,
            isEditorLoadedSpecialRemarks: false,
            isEditorLoadedServiceDetail: false,
            Allowed: item.Allowed || 0, // default if not set
            IsActive: item.IsActive ? 1 : 0, // convert boolean to number if needed
            isEditableAllowed: item.Allowed !== 1, // only editable if not pre-checked from API
            isEditableStatus: item.Allowed !== 1, // same for status
          }));
        } else {
          this.BranchServicesList = [];
          this.toastr.error("Something went wrong");
        }
      },
      (err) => {
        this.isSpinner = false;
        console.error(err);
        this.toastr.error("Connection error");
      },
    );
  }

  clearSelection() {
    this.selectedBranch = null;
    this.isEditing = false;
    this.editForm.reset();

    // Enable all fields
    Object.keys(this.editForm.controls).forEach((key) => {
      this.editForm.get(key)?.enable();
    });
    this.BranchServicesList = [];
  }

  updateBranch() {
    console.log(this.selectedBranch);
    if (!this.selectedBranch) return;

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched(); // mark all fields to show validation errors
      this.toastr.warning("Please fill out all required fields");
      return;
    }

    const formValues = this.editForm.getRawValue();
    // Prepare an array for typDKBSBranches
    const tblDKBSBranches = [formValues].map((fv) => ({
      LocID: this.selectedLocID,
      ManagerName: fv.managerName || "",
      ManagerExt: fv.managerExt || "",
      ReceiptionistName: fv.ReceiptionistName || "", // if you have this field
      ReceiptionistExt: fv.ReceiptionistExt || "",
      IsDeleted: 0,
    }));

    const params = {
      UserID: this.loggedInUser.userid,
      tblDKBSBranches,
    };
    console.log("tblDKBSBranches::::", params);

    this.lookupService.insertUpdateDKBSBranch(params).subscribe(
      (res: any) => {
        if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
          this.toastr.success("Branch updated successfully");
          this.getKBSBranch();
          this.clearSelection();
        } else {
          this.toastr.error("Failed to update branch");
        }
      },
      (err) => {
        console.error(err);
        this.toastr.error("Connection error");
      },
    );
  }

  // deleteBranch() {
  //   if (!this.selectedBranch) return;

  //   // Prepare an array for typDKBSBranches
  //   const tblDKBSBranches = [this.selectedBranch].map((fv) => ({
  //     LocID: this.selectedLocID,
  //     ManagerName: fv.managerName || "",
  //     ManagerExt: fv.managerExt || "",
  //     ReceiptionistName: fv.receptionistName || "", // if you have this field
  //     ReceiptionistExt: fv.receptionistExt || "",
  //     IsDeleted: 0,
  //   }));

  //   const params = {
  //     UserID: this.loggedInUser.userid,
  //     tblDKBSBranches,
  //   };

  //   this.lookupService.insertUpdateDKBSBranch(params).subscribe(
  //     (res: any) => {
  //       if (res?.StatusCode === 200 && res?.PayLoad[0].Result === 1) {
  //         this.toastr.success("Branch deleted successfully");
  //         this.getKBSBranch();
  //         this.clearSelection();
  //       } else {
  //         this.toastr.error("Failed to delete branch");
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.toastr.error("Connection error");
  //     }
  //   );
  // }
}
