// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { UserModel, AuthService } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { BillingService } from "../../services/billing.service";
import { TabsSwitchingService } from "src/app/modules/doctors/services/tabs-switching.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";

@Component({
  standalone: false,

  selector: "app-manage-panel",
  templateUrl: "./manage-panel.component.html",
  styleUrls: ["./manage-panel.component.scss"],
})
export class ManagePanelComponent implements OnInit {
  panelDataList = [];
  panelUsersDataList = [];
  panelDetailsList = [];
  panelLocationList = [];
  panelUsersList = [];

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {},
  };

  searchText = "";
  searchTextUsers = "";
  searchTextfrLocation = "";

  spinnerRefs = {
    searchTable: "searchTable",
    generalSection: "generalSection",
    TestSection: "TestSection",
    LocationTable: "LocationTable",
    ParentSection: "ParentSection",
  };

  selectedTabIndex = 0;
  tabIndex = 0;

  loggedInUser: UserModel;

  isSubmitted = false;
  showUpdateFields = false;
  toggleEditFields = true;

  // Reactive Form
  userCreationForm: FormGroup;
  testDetailsForm: FormGroup = this.fb.group({
    DepartmentId: [{ value: "", disabled: true }],
    ShowRates: [{ value: "", disabled: true }, Validators.required],
    RateListId: [{ value: "", disabled: true }, Validators.required],
    BillTypeId: [{ value: "", disabled: true }, Validators.required],
  });

  rowIndex: number | null = null;
  isFormDisabled = true; // Fields disabled by default
  isEditing = false;
  isSaveEditing = false;
  loadedDocuments: any[];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private Billing: BillingService,
    private lookupService: LookupService,
    private Tabs: TabsSwitchingService,
    private testProfileService: TestProfileService
  ) {
    this.userCreationForm = this.fb.group({
      Code: [{ value: "", disabled: true }, Validators.required],
      Name: [{ value: "", disabled: true }, Validators.required],
      PanelType: [{ value: "", disabled: true }, Validators.required],
      ReceiptPrefix: [{ value: "", disabled: true }],
      Company: [{ value: "", disabled: true }, Validators.required],
      CompanyAddress: [{ value: "", disabled: true }, Validators.required],
      BillingAddress: [{ value: "", disabled: true }, Validators.required],
      Protocol: [{ value: "", disabled: true }],
      NTN: [{ value: "", disabled: true }, Validators.required],
      CreditLimit: [{ value: "", disabled: true }],
      CreditUtil: [{ value: "", disabled: true }],
      ContactPerson: [{ value: "", disabled: true }, Validators.required],
      CpMobile: [{ value: "", disabled: true }, Validators.required],
      CpPhone: [{ value: "", disabled: true }, Validators.required],
      EmailReport: [{ value: "", disabled: true }],
      CpEmail: [
        { value: "", disabled: true },
        [Validators.required, Validators.email],
      ],
      EmailTo: [{ value: "", disabled: true }, [Validators.email]],
      EmailCC: [{ value: "", disabled: true }, [Validators.email]],
      MaxDiscount: [{ value: "", disabled: true }],
      LabSharePercent: [{ value: "", disabled: true }],
      RadioSharePercent: [{ value: "", disabled: true }],
      COAId: [{ value: "", disabled: true }],
      AccountNo: [{ value: "", disabled: true }],
      Title: [{ value: "", disabled: true }],
      DebitCredit: [{ value: "", disabled: true }],
      RegistrationAllowed: [{ value: "", disabled: true }],
      BiometircVerification: [{ value: "", disabled: true }],
      SMSAlert: [{ value: "", disabled: true }],
      ShowOnlineRpt: [{ value: "", disabled: true }],
    });
  }

  ngOnInit(): void {
    // this.getTestProfileList();
    this.loadLoggedInUserInfo();
    this.getPanelDataList();
    this.getPanelType();
    this.GetChartOfAccount();
    this.GetIPanelBIlling();
    this.GetTestProfileProfileList();
    this.GetIPanelRateDisplay();
    this.GetLabDepartment();

    this.Tabs.selectedTabIndex$.subscribe(({ index, data }) => {
      this.selectedTabIndex = index;
      this.tabIndex = index;
    });
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  onTabChanged(event): void {
    this.selectedTabIndex = event.index;
    this.tabIndex = event.index;
  }

  InsertUpdatePanel(): void {
    const formValues = this.userCreationForm.getRawValue();
    const TestDetailsForm = this.testDetailsForm.getRawValue();
    if (this.userCreationForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    if (this.testDetailsForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    const checkedTestItems = this.filteredTestList.filter((a) => a.Allow);
    if(!checkedTestItems.length){
      this.toastr.warning("Please select test(s)");
      return
    }
    const checkedLocationItems = this.panelLocationList.filter((a) => a.Allow);
    if(!checkedLocationItems.length){
      this.toastr.warning("Please select location(s)");
      return
    }
    const checkedUserItems = this.panelUsersList.filter((a) => a.PanelUserId);

    const params = {
      PanelID: this.selectedPanelId || null,
      Code: formValues.Code || null,
      Name: formValues.Name || null,
      Company: formValues.Company || null,
      BillTypeId: TestDetailsForm.BillTypeId || null,
      CreditLimit: formValues.CreditLimit || 0,
      CreditUtil: formValues.CreditUtil || 0,
      ShowRates: TestDetailsForm.ShowRates || null,
      ReceiptPrefix: formValues.ReceiptPrefix || "",
      RateListId: TestDetailsForm.RateListId || null,
      Discount: this.panelDetailsList ? this.panelDetailsList[0].Discount : 0,
      EmailReport: formValues.EmailReport ? 1 : 0,
      EmailTo: formValues.EmailTo || "",
      EmailCC: formValues.EmailCC || "",
      Protocol: formValues.Protocol || "",
      Modified: this.panelDetailsList
        ? this.panelDetailsList[0].Modified
        : null,
      CompanyAddress: formValues.CompanyAddress || null,
      BillingAddress: formValues.BillingAddress || null,
      ContactPerson: formValues.ContactPerson || null,
      CpMobile: formValues.CpMobile || null,
      CpPhone: formValues.CpPhone || null,
      CpEmail: formValues.CpEmail || null,
      PanelType: formValues.PanelType || null,
      NTN: formValues.NTN || null,
      SMSAlert: formValues.SMSAlert ? 1 : 0,
      ShowOnlineRpt: formValues.ShowOnlineRpt ? 1 : 0,
      BiometricVerification: formValues.BiometircVerification ? 1 : 0,
      RegistrationAllowed: formValues.RegistrationAllowed ? 1 : 0,
      AccId: this.panelDetailsList ? this.panelDetailsList[0].AccId : -1,
      DebitCredit: formValues.DebitCredit || "",
      MaxDiscount: formValues.MaxDiscount || 0,
      LabShareAmount: this.panelDetailsList
        ? this.panelDetailsList[0].LabShareAmount
        : 0,
      RadioShareAmount: this.panelDetailsList
        ? this.panelDetailsList[0].RadioShareAmount
        : 0,
      LabSharePercent: formValues.LabSharePercent || 0,
      RadioSharePercent: formValues.RadioSharePercent || 0,
      CreatedBy: this.loggedInUser.userid || -1,
      tblPanelDetail: checkedTestItems.map((a) => {
        return {
          TPId: a.TPId,
          NetPrice: a.NetPrice ,
          CashToReceive: a.CashToReceive,
        };
      }),
      tblPanelUserDetail: checkedUserItems.length ? checkedUserItems.map((a) => ({  PanelUserId: a.PanelUserId, }))
        : [{ PanelUserId: -1 }],
      tblPanelLocations: checkedLocationItems.map((a) => {
        return {
          LocId: a.LocId,
        };
      }),
    };
    console.log("InsertUpdatePanel ~ params:", params);

    this.spinner.show(this.spinnerRefs.ParentSection);
    this.Billing.InsertUpdatePanel(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.ParentSection);
        if (res.StatusCode === 200) {
          if (res.PayLoad[0].Result == 1) {
            this.toastr.success("Data saved successfully");
            this.getPanelDataList();
          } else {
            this.toastr.error("Unable to save data");
          }

          this.cancelEdit();
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.ParentSection);
      }
    );
  }

  getPanelDataList() {
    this.panelDataList = [];
    this.searchText = "";
    this.spinner.show(this.spinnerRefs.searchTable);
    this.Billing.GetPanelList().subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.searchTable);
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.panelDataList = res.PayLoad;
          this.getTableDate(this.panelDataList[0], 0);
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
  panelType = [];
  getPanelType() {
    this.panelType = [];
    this.Billing.GetIPanelType().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.panelType = res.PayLoad;
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
  COAData = [];
  GetChartOfAccount() {
    this.COAData = [];
    this.Billing.GetChartOfAccount().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.COAData = res.PayLoad;
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
  accountTypeData = [];
  panelBillType = [];
  GetAccountType() {
    this.accountTypeData = [];
    this.Billing.GetChartOfAccount().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.accountTypeData = res.PayLoad;
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
  GetIPanelBIlling() {
    // this.panelBillType = [];
    this.Billing.GetIPanelBIlling().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.panelBillType = res.PayLoad;
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
  panelRateList = [];
  GetIPanelRateDisplay() {
    this.panelRateList = [];
    this.Billing.GetIPanelRateDisplay().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.panelRateList = res.PayLoad;
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
  labDepartmentList = [];
  GetLabDepartment() {
    this.labDepartmentList = [];
    this.Billing.GetLabDepartment().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.labDepartmentList = res.PayLoad;
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
  testPriceList = [];
  GetTestProfileProfileList() {
    this.testPriceList = [];
    this.Billing.GetTestProfileProfileList().subscribe(
      (res: any) => {
        if (res.StatusCode === 200 && res.PayLoad.length) {
          this.testPriceList = res.PayLoad;
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

  savePanelUsersData() {
    this.panelUsersDataList = [];
    const formValues = this.userCreationForm.getRawValue();
    if (this.userCreationForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const params = {
      Username: formValues.Username || null,
      Password: formValues.Password || null,
      FullName: formValues.FullName || null,
      Cell: formValues.Cell || null,
      Phone: formValues.Phone || null,
      Email: formValues.Email || null,
    };
    this.spinner.show(this.spinnerRefs.generalSection);
    this.Billing.GetSalesDepositDocumentBySaleDate(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.generalSection);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.panelUsersDataList = res.PayLoad;
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
        this.spinner.hide(this.spinnerRefs.generalSection);
      }
    );
  }
  selectedPanelId = null;
  getTableDate(data: any, index: number): void {
    console.log("🚀 ~ ManagePanelComponent ~ getTableDate ~ data:", data);
    this.cancelEdit(); // Reset any editing state
    this.rowIndex = index;
    this.getPanelDetailsByPanelID(data.PanelId);
    this.getPanelLocationsByPanelId(data.PanelId);
    this.GetPanelUserDetailByPanelId(data.PanelId);
    this.selectedPanelId = data.PanelId;
    this.isFormDisabled = true; // Keep fields disabled
  }

  getPanelDetailsByPanelID(PanelId) {
    this.panelDetailsList = [];
    if (!PanelId) {
      this.toastr.warning("PanelId isn't being passed");
      return;
    }
    const params = {
      PanelId: PanelId,
    };
    this.spinner.show(this.spinnerRefs.generalSection);
    this.Billing.GetPanelDetailsByPanelId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.generalSection);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.panelDetailsList = res.PayLoad;
            console.log("🚀 this.panelDetailsList:", this.panelDetailsList);
            this.userCreationForm.patchValue(this.panelDetailsList[0]);
            this.testDetailsForm.patchValue(this.panelDetailsList[0]);
            this.GetAllTestsByPanelIDPriceListId();
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
        this.spinner.hide(this.spinnerRefs.generalSection);
      }
    );
  }
  allTestsByPanelIdRateId = [];
  GetAllTestsByPanelIDPriceListId() {
    const formValues = this.testDetailsForm.getRawValue();
    this.filteredTestList = [];
    this.filteredTestListOriginal = [];
    this.testList = [];
    // if (!PanelId && !PriceListId) {
    //   this.toastr.warning("PanelId or PriceListId isn't being passed");
    //   return;
    // }
    const params = {
      PanelId: this.selectedPanelId || null,
      PriceListId: formValues.RateListId || 1,
    };
    this.spinner.show(this.spinnerRefs.generalSection);
    this.Billing.GetAllTestsByPanelIDPriceListId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.generalSection);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.testList = res.PayLoad;
            this.testList = this.testList.map(test => {
              if (test.IsDiscountable) {
                return {
                  ...test,
                  Discount: test.NetPrice != 0 || null ? test.Price - test.NetPrice : 0,
                };
              }
              return test;
            });
            // console.log("🚀 this.allTestsByPanelIdRateId:", this.testList);
            this.onStatusChange(1);
            this.getTotalCount();
          }
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.generalSection);
      }
    );
  }

  // onEnterKey(event: KeyboardEvent): void {
  //   if (event.key === "Enter") {
  //     this.GetAccMaintenaceByCOAId();
  //   }
  // }
  validateNo(e: KeyboardEvent): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    return charCode >= 48 && charCode <= 57;
  }

  TitleByCOAId = [];
  GetAccMaintenaceByCOAId() {
    const formValues = this.userCreationForm.getRawValue();
    this.TitleByCOAId = [];
    // if(this.userCreationForm.invalid){
    //   this.toastr.warning("Please Fill The Mandatory Fields");
    //   this.isSubmitted = true;
    //   return;
    // }
    if (this.userCreationForm.get("ChartOAccount")?.value === null) {
      this.toastr.warning("Please fill Chart of Account field");
      this.isSubmitted = true;
      return;
    }
    const params = {
      AccountNo: formValues.AccNo,
      COAId: formValues.ChartOAccount,
    };
    this.spinner.show(this.spinnerRefs.generalSection);
    this.Billing.GetAccMaintenaceByCOAId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.generalSection);
        if (res.StatusCode === 200) {
          if (!res.PayLoad.length) {
            this.toastr.warning("No record found");
            return;
          }
          this.TitleByCOAId = res.PayLoad;
          console.log("🚀 this.TitleByCOAId:", this.TitleByCOAId);
          setTimeout(() => {
            this.userCreationForm.patchValue({
              Title: this.TitleByCOAId[0].Title || "No Title Found",
            });
          }, 300);
        } else {
          this.toastr.error("Something Went Wrong");
          setTimeout(() => {
            this.userCreationForm.patchValue({
              Title: "No Title Found",
            });
          }, 300);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.generalSection);
      }
    );
  }

  isDissabledChk = true;
  isFieldDisabled = true;
  mainChk;
  onSelectedLocation(e) {
    const Allow: boolean = e.Allow;
    if (Allow == true) {
      // this.isDissabledChk = false
    }
  }
  onSelectedProfileTests(e) {
    const Allow: boolean = e.Allow;
    if (Allow == true) {
      // this.isDissabledChk = false
    }
  }
  selectAllItems(checked) {
    this.panelLocationList.forEach((sec) => {
      sec.Allow = checked;
    });
  }
  mainChkTests;
  isTestsFieldDisabled = false;
  selectAllTestsProfile(checked) {
    this.filteredTestList.forEach((sec) => {
      sec.Allow = checked;
    });
  }
  getPanelLocationsByPanelId(PanelId) {
    this.panelLocationList = [];
    if (!PanelId) {
      this.toastr.warning("PanelId isn't being passed");
      return;
    }
    const params = {
      PanelId: PanelId,
    };
    this.spinner.show(this.spinnerRefs.LocationTable);
    this.Billing.GetLocationsByPanelId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.LocationTable);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.panelLocationList = res.PayLoad;
            //  console.log("🚀 this.panelDetailsList:", this.panelLocationList)
          }
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.LocationTable);
      }
    );
  }

  GetPanelUserDetailByPanelId(PanelId) {
    this.panelUsersList = [];
    if (!PanelId) {
      this.toastr.warning("PanelId isn't being passed");
      return;
    }
    const params = {
      PanelId: PanelId,
    };
    this.spinner.show(this.spinnerRefs.LocationTable);
    this.Billing.GetPanelUserDetailByPanelId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.LocationTable);
        if (res.StatusCode === 200) {
          if (res.PayLoad.length) {
            this.panelUsersList = res.PayLoad;
            //  console.log("🚀 this.panelUsersList:", this.panelUsersList)
          }
        } else {
          this.toastr.error("Something Went Wrong");
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.LocationTable);
      }
    );
  }

  getPanelUsersByPanelId() {}

  cancelEdit(): void {
    this.isFormDisabled = true;
    this.isEditing = false;
    this.isSaveEditing = false;
    this.toggleEditFields = true;
    this.isDissabledChk = false;
    this.isFieldDisabled = false;
    this.AddnRemove = false;
    this.userCreationForm.disable();
    this.testDetailsForm.disable();
  }

  refreshForm(): void {
    this.userCreationForm.reset();
    this.testDetailsForm.reset();
    this.isFormDisabled = true;
    this.rowIndex = null;
    this.isEditing = false;
    this.isSaveEditing = false;
    this.toggleEditFields = true;
    this.isDissabledChk = false;
    this.isFieldDisabled = false;
    this.AddnRemove = false;
    this.userCreationForm.disable();
    this.testDetailsForm.disable();
  }

  deleteUser(): void {
    if (this.rowIndex !== null) {
      console.log("Deleting user:", this.panelUsersDataList[this.rowIndex]);
      this.panelUsersDataList.splice(this.rowIndex, 1);
      this.DeletePanelUserByPanelUserId();
    }
  }

  DeletePanelUserByPanelUserId() {
    if (!this.selectedPanelId) {
      this.toastr.warning("Please Provide PanelId");
      return;
    }
    const params = {
      PanelId: this.selectedPanelId,
      CreatedBy: this.loggedInUser.userid || -1,
    };
    this.spinner.show(this.spinnerRefs.ParentSection);
    this.Billing.DeletePanelByPanelId(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.ParentSection);
        if (res.StatusCode === 200) {
          this.toastr.success(res.Message, "Record deleted successfully");
          this.getPanelDataList();
        } else {
          this.toastr.error(res.ErrorDetails);
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.ParentSection);
      }
    );
  }

  editUser(): void {
    this.isFormDisabled = false; // Enable fields for editing
    this.isDissabledChk = false;
    this.isFieldDisabled = false;
    this.userCreationForm.enable();
    this.testDetailsForm.enable();
    this.isEditing = true; // Mark as editing
    this.toggleEditFields = false;
  }
  hasFormControls(form: FormGroup): number {
    return Object.keys(form.controls).length;
  }
  copyUser(): void {
    if (this.rowIndex === null) {
      this.toastr.warning("Please select a user to copy");
      return;
    }
    this.isFormDisabled = false;
    this.isDissabledChk = false;
    this.isFieldDisabled = false;
    this.isEditing = false;
    this.isSaveEditing = true; // Change button to "Save"
    this.toggleEditFields = false;
    this.userCreationForm.enable();
    this.testDetailsForm.enable();
    this.selectedPanelId = null;
    const copiedData = {
      ...this.userCreationForm.getRawValue(),
      Code: null,
      Name: null,
    };
    this.userCreationForm.patchValue(copiedData);
    this.testDetailsForm.patchValue(this.panelDetailsList[0]);
  }

  createNewPanel(): void {
    this.selectedPanelId = null;
    this.isFormDisabled = false;
    this.isEditing = false;
    this.isDissabledChk = false;
    this.isFieldDisabled = false;
    this.isSaveEditing = true; // Change button to "Save"
    this.toggleEditFields = false;
    this.rowIndex = null;
    this.panelUsersList = [];
    this.userCreationForm.reset();
    this.testDetailsForm.reset();
    this.userCreationForm.enable();
    this.testDetailsForm.enable();
    console.log("Creating a new user");
    const TestDetailsForm = this.testDetailsForm.getRawValue();
    this.GetAllTestsByPanelIDPriceListId();
    this.AddnRemove = true;
  }

  AddnRemove = false;
  SelectAll = false;
  DiscountCount = 0;
  DiscountType  = 1;
  labDeptID = -1;
  testList = null;
  active = null;
  filteredTestList = null;
  filteredTestListOriginal = null;
  searchedText = "";
  PackagesCounts = null;
  ProfilesCounts = null;
  TestsCounts = null;

  getTestProfileList() {
    this.testList = [];
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
        this.testList = data || [];
        this.onStatusChange(1);
        this.getTotalCount();
        // console.log("panel test data", this.testList)
      }
    });
  }
  statusEvent = null;
  onStatusChange(event: number) {
    this.statusEvent = event;
    this.active = event;
    if (!this.AddnRemove) {
      this.filteredTestList = this.testList.filter(
        (item) => item.TypeId === event && item.Allow === true
      );
    } else {
      this.filteredTestList = this.testList.filter(
        (item) => item.TypeId === event
      );
    }
    this.filteredTestListOriginal = this.testList.filter(
      (item) => item.TypeId === event
    );
  }
  getTotalCount() {
    this.TestsCounts = this.testList.filter(
      (item) => item.TypeId === 1 && item.Allow === true
    ).length;
    this.ProfilesCounts = this.testList.filter(
      (item) => item.TypeId === 2 && item.Allow === true
    ).length;
    this.PackagesCounts = this.testList.filter(
      (item) => item.TypeId === 3 && item.Allow === true
    ).length;
  }
  addnRemoveChange(event) {
    console.log("🚀 ~ ManagePanelComponent ~ addnRemoveChange ~ event:", event);
    if (event) {
      this.AddnRemove = true;
      this.filteredTestList = this.filteredTestListOriginal.filter(
        (item) => item.TypeId === this.statusEvent
      );
    } else {
      this.AddnRemove = false;
      this.filteredTestList = this.testList.filter(
        (item) => item.TypeId === this.statusEvent && item.Allow === true
      );
    }
  }

  applyDiscountCritrea() {
    console.log("DiscountType", this.DiscountType);
   
    if (this.DiscountType == 1 && this.DiscountCount >= 0) {
      this.filteredTestList = this.testList.map(test => {
        if (test.IsDiscountable) {
          const discountAmount = (test.Price * this.DiscountCount) / 100;
          return {
            ...test,
            Discount: discountAmount,
            NetPrice: test.Price - discountAmount
          };
        }
        return test;
      });
      console.log("this.filteredTestList:", this.filteredTestList)
    }
    if (this.DiscountType == 2 && this.DiscountCount >= 0) {
      this.filteredTestList = this.testList.map(test => {
        if (test.IsDiscountable) {
          const discountAmount = this.DiscountCount;
          return {
            ...test,
            Discount: discountAmount,
            NetPrice: test.Price - discountAmount
          };
        }
        return test;
      });
    }
    if (this.DiscountType == 3 && this.DiscountCount >= 0) {
      this.filteredTestList = this.testList.map(test => {
        if (test.IsDiscountable) {
          const discountAmount = this.DiscountCount;
          return {
            ...test,
            Discount: test.Price - discountAmount,
            NetPrice: discountAmount
          };
        }
        return test;
      });
    }
  }
  
}
