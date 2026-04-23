// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { DoctorShareService } from 'src/app/modules/ris/services/doctor-share.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { BillingService } from '../../services/billing.service';

@Component({
  standalone: false,

  selector: 'app-manage-panel-users',
  templateUrl: './manage-panel-users.component.html',
  styleUrls: ['./manage-panel-users.component.scss']
})
export class ManagePanelUsersComponent implements OnInit {

  panelUsersDatiels = [];
  panelUsersDataList = [];

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
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  searchText = '';

  spinnerRefs = {
    searchTable: 'searchTable',
    insertForm: 'insertForm',
  }



  loggedInUser: UserModel;

  isSubmitted = false;
  showUpdateFields = false;
  toggleEditFields = true;
  userCreationForm: FormGroup;
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
  ) {
    this.userCreationForm = this.fb.group({
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
    this.getPanelUsersData();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getPanelUsersData() {
    this.panelUsersDataList = [];
    const params = {};
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.GetPanelUsers(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.panelUsersDataList = res.PayLoad;
          this.panelUsersDataList = this.panelUsersDataList.filter((item) => item.UserType !== 2);
          this.getTableDate(this.panelUsersDataList[0], 0);
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
  PanelUserId = null;
  getPanelUsersDetails() {
    this.panelUsersDatiels = [];

    if (!this.PanelUserId) {
      this.toastr.warning("Please Provide Panel UserId");
      return;
    }

    const params = {
      PanelUserId: this.PanelUserId
    };
    this.spinner.show(this.spinnerRefs.insertForm)
    this.Billing.GetPanelUserDetailByPanelUserID(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.insertForm)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.panelUsersDatiels = res.PayLoad;
          //  this.userCreationForm.patchValue(this.panelUsersDatiels[0]);
          const userDetails = { ...this.panelUsersDatiels[0] };
          userDetails.Password = 'DummyPassword@123';
          this.userCreationForm.patchValue(userDetails);
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
      this.spinner.hide(this.spinnerRefs.insertForm)
    })
  }
  DeletePanelUserByPanelUserId() {
    if (!this.PanelUserId) {
      this.toastr.warning("Please Provide Panel UserId");
      return;
    }
    const params = {
      PanelUserId: this.PanelUserId,
      IsDeleted: 1,
      CreatedBy: this.loggedInUser.userid || -1,
    };
    this.spinner.show(this.spinnerRefs.insertForm)
    this.Billing.DeletePanelUserByPanelUserId(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.insertForm)
      if (res.StatusCode === 200) {
        this.toastr.success(res.Message,"Record deleted successfully");
        this.getPanelUsersData();
      }
      else {
        this.toastr.error(res.ErrorDetails);
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.insertForm)
    })
  }

  InsertUpdatePanelUser() {
   
    const formValues = this.userCreationForm.getRawValue();
    if (this.userCreationForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const params = {
      PanelUserId: this.PanelUserId || null,
      Username: formValues.Username || null,
      Password: formValues.Password || null,
      PasswordHash: formValues.Password || null,
      FullName: formValues.FullName || null,
      Cell: formValues.Cell || null,
      Phone: formValues.Phone || null,
      Email: formValues.Email || "",
      CreatedBy: this.loggedInUser.userid || -1,
      UserType: 1, //1=Panel User , 2= B2B User
    };
    console.log("🚀 Obj params:", params)
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.InsertUpdatePanelUser(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200) {
        const data = JSON.parse(res.PayLoadStr) || [];
        if (data[0].Result == 1) {
          this.toastr.success(res.Message);
          this.cancelEdit();
          this.getPanelUsersData();
        }
        else {
          this.toastr.error(res.Message);
        }
      }
      else {
        this.toastr.error(res.Message);
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.searchTable)
    })
  }

  getTableDate(data: any, index: number): void {
    console.log("🚀 ~ ManagePanelUsersComponent ~ getTableDate ~ data:", data)
    this.cancelEdit(); // Reset any editing state
    this.rowIndex = index;
    this.PanelUserId = data.PanelUserId;
    setTimeout(() => {
      this.getPanelUsersDetails();
    }, 100);
    // this.userCreationForm.patchValue(data); // Populate the form
    this.isFormDisabled = true; // Keep fields disabled
  }

  updateUser(): void {
    if (this.userCreationForm.valid) {
      console.log('Updating user:', this.userCreationForm.getRawValue());
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.isFormDisabled = true;
    this.isEditing = false;
    this.isSaveEditing = false;
    this.toggleEditFields = true;
    this.userCreationForm.disable();
  }

  refreshForm(): void {
    this.userCreationForm.reset();
    this.PanelUserId = null;
    this.isFormDisabled = true;
    this.rowIndex = null;
  }

  deleteUser(): void {
    if (this.rowIndex !== null) {
      console.log('Deleting user:', this.panelUsersDataList[this.rowIndex]);
      this.panelUsersDataList.splice(this.rowIndex, 1);
      this.DeletePanelUserByPanelUserId();
      this.refreshForm();
    }
    else{
      this.toastr.warning("Please select user first");
    }
  }

  editUser(): void {
    this.isFormDisabled = false; // Enable fields for editing
    this.userCreationForm.enable();
    this.isEditing = true; // Mark as editing
    this.toggleEditFields = false;
  }
  hasFormControls(form: FormGroup): number {
    return Object.keys(form.controls).length;
  }
  copyUser(): void {
    if (this.rowIndex === null) {
      this.toastr.warning('Please select a user to copy');
      return;
    }
    this.PanelUserId = null;
    this.isFormDisabled = false;
    this.isEditing = false;
    this.isSaveEditing = true; // Change button to "Save"
    this.toggleEditFields = false;
    this.userCreationForm.enable();
    const copiedData = { ...this.userCreationForm.getRawValue(), Username: null, Password: null }; // Clear sensitive fields
    setTimeout(() => {
    this.userCreationForm.patchValue(copiedData);
    }, 100);
    
  }

  createNewUser(): void {
    this.rowIndex = null;
    this.PanelUserId = null;
    this.isFormDisabled = false;
    this.isEditing = false;
    this.isSaveEditing = true; // Change button to "Save"
    this.toggleEditFields = false;
    setTimeout(() => {
      this.userCreationForm.reset();
      this.userCreationForm.enable();
      }, 200);
    
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
}
