// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { BillingService } from "../../services/billing.service";
import { LabConfigsService } from "src/app/modules/lab-configs/services/lab-configs.service";

@Component({
  standalone: false,

  selector: "app-manage-partner-config",
  templateUrl: "./manage-partner-config.component.html",
  styleUrls: ["./manage-partner-config.component.scss"],
})
export class ManagePartnerConfigComponent implements OnInit {
  paertnerDatiels = [];
  partnersDataList = [];

  //   [
  //     {
  //     "Username":"admin",
  //     "Password":"admin",
  //     "FullName":"Admin",
  //     "Cell":"0321456789",
  //     "Phone":"000000000",
  //     "Email":"admin@example.com",
  //   },
  //   {
  //     "Username":"sub.admin",
  //     "Password":"Subadmin",
  //     "FullName":"Sub Admin",
  //     "Cell":"0321456700",
  //     "Phone":"111111111",
  //     "Email":"Subadminn@example.com",
  //   },
  // ];

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Please Confirm...!", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> want to save ?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };

  searchText = "";
  searchMachineText = "";

  spinnerRefs = {
    searchTable: "searchTable",
    searchTable2: "searchTable2",
    insertForm: "insertForm",
    UsersCreateForm: "UsersCreateForm",
  };

  loggedInUser: UserModel;

  isSubmitted = false;
  showUpdateFields = false;
  toggleEditFields = true;
  toggleUsersEditFields = true;
  insertionForm: FormGroup;
  CreateUsersForm: FormGroup;
  rowIndex: number | null = null;
  isFormDisabled = true; // Fields disabled by default
  isUsersFormDisabled = true; // Fields disabled by default
  isEditing = false;
  isUsersEditing = false;
  isSaveEditing = false;
  isUsersSaveEditing = false;
  loadedDocuments: any[];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private Billing: BillingService,
    private labConfigs: LabConfigsService,
    private lookupService: LookupService
  ) {
    this.insertionForm = this.fb.group({
      PatnerName: [{ value: "", disabled: true }, Validators.required],
      PatnerContactNo: [{ value: "", disabled: true }, Validators.required],
      PatnerContactPerson: [{ value: "", disabled: true }, Validators.required,],
      PatnerAddress: [{ value: "", disabled: true }, Validators.required],
    });
    this.CreateUsersForm = this.fb.group({
       Username: [{ value: '', disabled: true }, Validators.required],
        Password: [{ value: '', disabled: true }, Validators.required],
        FullName: [{ value: '', disabled: true }, Validators.required],
        Cell: [{ value: '', disabled: true }],
        Phone: [{ value: '', disabled: true }],
        Email: [{ value: '', disabled: true }, [Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPartnersData();
    //  this.getRISMachine();

    this.getRISMachine();
    this.getLocationList();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getPartnersData() {
    this.partnersDataList = [];
    const params = {};
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.getAllPartners().subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.partnersDataList = res.PayLoad;
            this.getTableDate(this.partnersDataList[0], 0);
          } else {
            this.toastr.info("No record found");
          }
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


  hideTooltip() {
  this.tooltipVisible = false;
  this.hoveredMachineID = null;
}

   tooltipVisible = false;
  hoveredMachineID: number | null = null;
  tooltipBranchesMap: Record<number, string> = {};
  showTooltip(PID) {
    this.tooltipVisible = true;
    this.hoveredMachineID = PID;
    const params = {
      PartnerID: PID
    };
     this.tooltipBranchesMap[PID] = 'Loading...';
    this.Billing.getPartnerUserByID(params).subscribe(
      (res: any) => {
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
             const Username = res.PayLoad[0]?.Username || 'NA';
             this.tooltipBranchesMap[PID] = Username 
          }
          else {
            this.tooltipBranchesMap[PID] = 'NA';
          }
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

  partnerUsersDataList = [];
  searchTextUers = ''
  getPartnerUsersData() {
    this.partnerUsersDataList = [];
    this.partnerUsersDataList = [];
    const params = {};
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.GetPanelUsers(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.partnerUsersDataList = res.PayLoad;
          this.partnerUsersDataList = this.partnerUsersDataList.filter((item) => item.UserType !== 2 && item.UserType !== 1 && item.UserType != null);
          // this.getTableDate(this.panelUsersDataList[0], 0);
        }
        else {
          this.toastr.info('No record found');
        }
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.searchTable)
    })
  }

  RISMachines = [];
  ActualRISMachines = []
  RISMachineIDs: any = null;
  getRISMachine() {
    this.RISMachines = [];
    const params = {
      RISMachineID: null,
    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.labConfigs.getRISMachine(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          this.ActualRISMachines = res.PayLoadDS.Table || [];
          this.RISMachines = res.PayLoadDS.Table || [];
          this.RISMachines = this.RISMachines.map((item) => ({ ...item, MachinesnLocation: `${item.MachineName || ""} - ${item.BranchCode || ""}`,}));
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
  PatnerID = null;
  getPartnerUsersDetails() {
    this.paertnerDatiels = [];

    if (!this.PatnerID) {
      this.toastr.warning("Please Provide Partner ID");
      return;
    }

    const params = {
      PartnerID: this.PatnerID,
    };
    this.spinner.show(this.spinnerRefs.insertForm);
    this.Billing.getPartnersDetailsByID(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.insertForm);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.paertnerDatiels = res.PayLoad;
            //  this.insertionForm.patchValue(this.panelUsersDatiels[0]);
            const userDetails = { ...this.paertnerDatiels[0] };
            //  userDetails.Password = 'DummyPassword@123';
            this.insertionForm.patchValue(userDetails);
          } else {
            this.toastr.info("No record found");
          }
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.insertForm);
      }
    );
  }

  RISMachinesPatched = [];
    getPartnersRISMachineByID() {
    this.RISMachinesPatched = [];
     this.RISMachines.forEach(machine => {
      machine.checked = false;
      machine.SharePerc = null; 
    });
    
    if (!this.PatnerID) {
      this.toastr.warning("Please Provide Partner ID");
      return;
    }

    const params = {
      PartnerID: this.PatnerID,
    };
    this.spinner.show(this.spinnerRefs.insertForm);
    this.Billing.getPartnersRISMachineByID(params).subscribe(
      (res: any) => {
        this.editUser();
        this.spinner.hide(this.spinnerRefs.insertForm);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.RISMachinesPatched = res.PayLoad;
            this.patchRISMachines();
            this.cancelEdit();
          } 
        } else {
          this.toastr.error("Something Went Wrong");
        }
        this.cancelEdit();
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.insertForm);
      }
    );
  }

 patchRISMachines() {

  if (!this.RISMachinesPatched || !this.RISMachines) return;
  this.RISMachines.forEach(machine => {
    const matched = this.RISMachinesPatched.find(
      x => x.RISMachineID === machine.RISMachineID
    );
    if (matched) {
      machine.SharePerc = matched.SharePerc || 0;
      machine.checked = true;
    }
  });
  // Sort: checked first
  this.RISMachines.sort((a, b) => {
    return (b.checked === true ? 1 : 0) - (a.checked === true ? 1 : 0);
  });
}
  // DeletePanelUserByPanelUserId() {
  //   if (!this.PatnerID) {
  //     this.toastr.warning("Please Provide Panel UserId");
  //     return;
  //   }
  //   let params = {
  //     PanelUserId: this.PatnerID,
  //     IsDeleted: 1,
  //     CreatedBy: this.loggedInUser.userid || -1,
  //   };
  //   this.spinner.show(this.spinnerRefs.insertForm);
  //   this.Billing.DeletePanelUserByPanelUserId(params).subscribe(
  //     (res: any) => {
  //       this.spinner.hide(this.spinnerRefs.insertForm);
  //       if (res.StatusCode === 200) {
  //         this.toastr.success(res.Message, "Record deleted successfully");
  //         this.getPartnersData();
  //       } else {
  //         this.toastr.error(res.ErrorDetails);
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //       this.toastr.error("Connection error");
  //       this.spinner.hide(this.spinnerRefs.insertForm);
  //     }
  //   );
  // }

  InsertUpdatePartners() {
    const formValues = this.insertionForm.getRawValue();
    if (this.insertionForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    // if (this.RISMachineIDs && this.PatnerID) {
    //   this.InsertUpdatePartnersRISMachine();
    // }
    const params = {
      PartnerID: this.PatnerID || null,
      PartnerName: formValues.PatnerName || null,
      PartnerContactNo: formValues.PatnerContactNo || null,
      PartnerContactPerson: formValues.PatnerContactPerson || "",
      PartnerAddress: formValues.PatnerAddress || "",
      CreatedBy: this.loggedInUser.userid || -1,
    };
    console.log("🚀 Obj params:", params);
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.insertUpdatePartners(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          const data = res.PayLoad || [];
          if (data[0].Result == 1) {
            this.toastr.success(res.Message);
            this.cancelEdit();
            this.getPartnersData();
          } else {
            this.toastr.error(res.Message);
          }
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
  }

  InsertUpdatePartnerUsers() {
    const formValues = this.CreateUsersForm.getRawValue();
    if (this.CreateUsersForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

  
    // let params = {
    //   PartnerID: this.PatnerID || null,
    //   PatnerUserID: this.PatnerUserID || null,
    //   UserName: formValues.UserName || null,
    //   UserPassword: formValues.UserPassword || null,
    // };
    // console.log("🚀 Obj params:", params);
    // this.spinner.show(this.spinnerRefs.searchTable2);
    // this.Billing.InserUpdatePartnerUser(params).subscribe(
        const params = {
      PanelUserId:  this.PatnerUserID || null,
      Username: formValues.Username?.trim() || null,
      Password: formValues.Password || null,
      PasswordHash: formValues.Password || null,
      FullName: formValues.FullName || null,
      Cell: formValues.Cell || null,
      Phone: formValues.Phone || null,
      Email: formValues.Email || "",
      CreatedBy: this.loggedInUser.userid || -1,
      UserType: 3, //1=Panel User , 2= B2B User // 3 = Partner 
    };
    console.log("🚀 Obj params:", params)
    this.spinner.show(this.spinnerRefs.searchTable2)
    this.Billing.InsertUpdatePanelUser(params).subscribe((res: any) => {
      // (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable2);
         if (res.StatusCode === 200) {
        const data = JSON.parse(res.PayLoadStr) || [];
        if(data[0].Result == 0){
          this.toastr.error('User Already Exists', 'Error');
        }
        if (data[0].Result == 1) {
            this.toastr.success(res.Message);
            this.selectedPatnerUserID = data[0].PanelUserID;
            if (this.selectedPatnerUserID) {
                this.insertPanelUserForAssociation();
            }
            this.CreateUsersForm.reset();
            this.cancelUsersEdit();
            this.getPartnerUsersData();
          } else {
            this.toastr.error(res.Message);
          }
        } 
        else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable2);
      }
    );
  }

  InsertUpdatePartnersRISMachine() {
    const checkedItems = this.RISMachines.filter(a => a.checked);
    if (checkedItems?.length == 0) {
      this.toastr.warning("Please Provide MachinesIds");
      return;
    }
     if (checkedItems.some(a => a.SharePerc == null || a.SharePerc == '')) {
      this.toastr.warning("Please select values against checked Items");
      return;
    }

    console.log(" checkedItems:", checkedItems)
    const params = {
      PartnerID: this.PatnerID || null,
      CreatedBy: this.loggedInUser.userid || -1,
      tblPatnerMachine: checkedItems.map(a => {
          return {
            PartnerID: this.PatnerID,
            RISMachineID:  a.RISMachineID, 
            SharePerc: a.SharePerc
          }
        }),
    };

    console.log("🚀 Obj params:", params);
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.insertUpdatePartnersRISMachine(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200) {
          const data = res.PayLoad || [];
          if (data[0].Result == 1) {
            this.toastr.success(res.Message);
            this.cancelEdit();
            this.getPartnersData();
          } else {
            this.toastr.error(res.Message);
          }
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable);
      }
    );
  }
PartnerName = null
PartnerInformation = null;
  getTableDate(data: any, index: number): void {
    console.log("🚀 ~ ManagePanelUsersComponent ~ getTableDate ~ data:", data);
    this.PartnerInformation = data;
    this.RISMachineIDs = null;
    this.PartnerName = null
    this.cancelEdit();
    this.cancelUsersEdit(); // Reset any editing state
    this.rowIndex = index;
    this.PatnerID = data.PatnerID;
    console.log("🚀  this.PatnerID:", this.PatnerID)
    this.PartnerName = data.PatnerName;
    this.getPartnerUsersData();
    setTimeout(() => {
      this.getPartnerUsersDetails();
      this.getPartnersRISMachineByID();
    }, 100);
    // this.insertionForm.patchValue(data); // Populate the form
    this.isFormDisabled = true; // Keep fields disabled
    this.refreshUsersForm();
  }
  UserRowIndex = null;
  PatnerUserID:number = null
  getPartnerUserTableDate(data: any, index: number): void {
    console.log("🚀 ~ ManagePanelUsersComponent ~ getTableDate ~ data:", data);
   
    this.cancelUsersEdit(); // Reset any editing state
    this.UserRowIndex = index;
    this.PatnerUserID = data.PanelUserId;
    this.getPanelUsersDetails();
    
    this.isUsersFormDisabled = true; // Keep fields disabled
  }

  updateUser(): void {
    if (this.insertionForm.valid) {
      console.log("Updating user:", this.insertionForm.getRawValue());
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.isFormDisabled = true;
    this.isEditing = false;
    this.isSaveEditing = false;
    this.toggleEditFields = true;
    this.insertionForm.disable();
  }
  cancelUsersEdit(): void {
    this.isUsersFormDisabled = true;
    this.isUsersEditing = false;
    this.isUsersSaveEditing = false;
    this.toggleUsersEditFields = true;
    this.CreateUsersForm.disable();
  }

  refreshForm(): void {
    this.insertionForm.reset();
    this.PatnerID = null;
    this.PartnerInformation = null;
    this.isFormDisabled = true;
    this.rowIndex = null;
    this.RISMachineIDs = null;
  }
  refreshUsersForm(): void {
    this.CreateUsersForm.reset();
    this.PatnerUserID = null;
    this.isUsersFormDisabled = true;
    this.UserRowIndex = null;
    this.RISMachineIDs = null;

  }

  // deleteUser(): void {
  //   if (this.rowIndex !== null) {
  //     console.log("Deleting user:", this.partnerUsersDataList[this.rowIndex]);
  //     this.partnerUsersDataList.splice(this.rowIndex, 1);
  //     this.DeletePanelUserByPanelUserId();
  //     this.refreshForm();
  //   } else {
  //     this.toastr.warning("Please select user first");
  //   }
  // }

  editUser(): void {
    this.isFormDisabled = false; // Enable fields for editing
    this.insertionForm.enable();
    this.isEditing = true; // Mark as editing
    this.toggleEditFields = false;

  }

   editPartnerUser(): void {
    this.isUsersFormDisabled = false; // Enable fields for editing
    this.CreateUsersForm.enable();
    this.isUsersEditing = true; // Mark as editing
    this.toggleUsersEditFields = false;
    // this.getRISMachine();
  }
  hasFormControls(form: FormGroup): number {
    return Object.keys(form.controls).length;
  }
  // copyUser(): void {
  //   if (this.rowIndex === null) {
  //     this.toastr.warning("Please select a user to copy");
  //     return;
  //   }
  //   this.PatnerID = null;
  //   this.isFormDisabled = false;
  //   this.isEditing = false;
  //   this.isSaveEditing = true; // Change button to "Save"
  //   this.toggleEditFields = false;
  //   this.insertionForm.enable();
  //   const copiedData = {
  //     ...this.insertionForm.getRawValue(),
  //     Username: null,
  //     Password: null,
  //   }; // Clear sensitive fields
  //   setTimeout(() => {
  //     this.insertionForm.patchValue(copiedData);
  //   }, 100);
  // }

  createNewUser(): void {
    this.rowIndex = null;
    this.PatnerID = null;
    this.PartnerInformation = null;
    this.RISMachineIDs = null;
    this.isFormDisabled = false;
    this.isEditing = false;
    this.isSaveEditing = true; // Change button to "Save"
    this.toggleEditFields = false;
    setTimeout(() => {
      this.insertionForm.reset();
      this.insertionForm.enable();
    }, 200);
  }
  createNewPartnerUser(): void {
    this.UserRowIndex = null;
    this.PatnerUserID = null;
    this.isFormDisabled = false;
    this.isUsersEditing = false;
    this.isUsersSaveEditing = true; // Change button to "Save"
    this.toggleUsersEditFields = false;
    setTimeout(() => {
      this.CreateUsersForm.reset();
      this.CreateUsersForm.enable();
    }, 200);
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }


  getPanelUsersDetails() {
   

    if (!this.PatnerUserID) {
      this.toastr.warning("Please Provide Panel UserId");
      return;
    }

    const params = {
      PanelUserId: this.PatnerUserID
    };
    this.spinner.show(this.spinnerRefs.UsersCreateForm)
    this.Billing.GetPanelUserDetailByPanelUserID(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.UsersCreateForm)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          const panelUsersDatiels = res.PayLoad;
          //  this.userCreationForm.patchValue(this.panelUsersDatiels[0]);
          const userDetails = { ...panelUsersDatiels[0] };
          userDetails.Password = 'DummyPassword@123';
          this.CreateUsersForm.patchValue(userDetails);
        }
        else {
          this.toastr.info('No record found');
        }
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.UsersCreateForm)
    })
  }

  selectedPatnerUserID:number =null;
  insertPanelUserForAssociation() {
   
    if (!this.selectedPatnerUserID) {
      this.toastr.error("Partner UserId is required for association.");
      return;
    }
    if (!this.PatnerID) {
      this.toastr.error("Partner ID is required for association.");
      return;
    }

    const params = {
      PanelUserIDs: this.selectedPatnerUserID,
      PanelId: -1,
      B2BDoctorID: -1, // this.PatnerID
      PartnerID: this.PatnerID,
    };
    console.log("🚀 Obj params:", params);
    this.spinner.show(this.spinnerRefs.searchTable2);
    this.Billing.insertPanelUserForAssociation(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable2);
        if (res.StatusCode === 200) {
          this.toastr.success(`User associated successfully to partner: ${this.PartnerInformation.PatnerName}`); // Success message
              this.selectedPatnerUserID = null;
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.searchTable2);
      }
    );
  }

branchList = []
  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
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
    }, (err) => {
      console.log(err);
    });
  }

  SelectedlocID = null;
 BranchChange(values: any[]): void {
  console.log(values);

  const mappedMachines = this.ActualRISMachines.map(item => ({ ...item, MachinesnLocation: `${item.MachineName || ""} - ${item.BranchCode || ""}` }));

  if (values && values.length > 0) {
    const selectedLocIds = values.map(v => v.LocId);
    this.RISMachines = mappedMachines.filter(machine =>
      selectedLocIds.includes(machine.LocID)
    );
  } else {
    this.RISMachines = mappedMachines;
  }
}


 onSelectAllMachines(){
  this.RISMachineIDs = this.RISMachines.map(item => item.RISMachineID);
 }

 onUnselectAllMachines(){
  this.RISMachineIDs = null;  
}


hideToggle = false

onValueChange(sec: any) {
      const minVal = parseFloat(sec.SharePerc);
  
        if (!isNaN(minVal)) {
          if (minVal > 100) {
            sec.SharePerc = 0;
            this.toastr.info('Share should be less than 100%');
          } else {
            sec.SharePerc = minVal;
          }
        }
    }

 selectAllTestsSection(checked){
  console.log("🚀selectAllTestsSection ~ checked:", checked);
  this.RISMachines.forEach(sec => {
    sec.checked = checked;
  });
  }
   onSelectedSectionChange(e) {
    console.log("🚀 ~ RadiologistComponent ~ onSelectedSectionChange ~ e:", e)
    const checked:boolean = e.checked 
    if(checked == true ){
      
    } 
  }
}
