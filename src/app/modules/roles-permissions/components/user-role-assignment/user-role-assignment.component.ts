// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
// import { User } from '../../../../models/user';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { RoleService } from '../../services/role.service';
import { catchError } from 'rxjs/operators';
import { EmployeeService } from 'src/app/modules/emp-profile/services/employee.service';

@Component({
  standalone: false,

  selector: 'app-user-role-assignment',
  templateUrl: './user-role-assignment.component.html',
  styleUrls: ['./user-role-assignment.component.scss']
})
export class UserRoleAssignmentComponent implements OnInit {

  loggedInUser: UserModel;

  usersList = [];
  rolesList = [];
  roleAssignmentFormSubmitted = false;
  searchText = '';
  disableRoleAssignmentForm = true;

  defaultPassword="Abc@321";
  resetDisPassword:boolean=false;

  spinnerRefs = {
    tableList: 'tableList',
    EditInfo: 'EditInfo'
  }

  roleAssignmentForm = this.fb.group({
    userID: [''],
    userName: ['', Validators.required],
    employeeName: ['', Validators.required],
    password: ['', Validators.required],
    userRoleID: ['', Validators.required],
    modifyBy: [''],
  });

  config = {
    displayFn: (item: any) => { return item.userName; }, //to support flexible text displaying for each item
    displayKey: "UserID", //if objects array passed which key to be displayed defaults to description
    search: true, //true/false for the search functionlity defaults to false,
    // height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
    placeholder: '--select--', // text to be displayed when no item is selected defaults to Select,
    // customComparator: ()=>{}, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
    // limitTo: 0, // number thats limits the no of options displayed in the UI (if zero, options will not be limited)
    // moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
    // noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    // searchPlaceholder:'Search', // label thats displayed in search input,
    // searchOnKey: 'name', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
    clearOnSelection: false, // clears search criteria when an option is selected if set to true, default is false
    // inputDirection: 'ltr', // the direction of the search input can be rtl or ltr(default)
  }

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    // private storage: StorageService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private empService: EmployeeService,
  ) { }

  ngOnInit(): void {
    // this.loggedInUser = this.storage.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
    this.getUsers();
    this.getRoles();
  }
  userChanged() {
    let selectedUserID = this.roleAssignmentForm.value.userID;
    console.log(selectedUserID);
    let selectedUserObj = this.usersList.find(a => a.UserID == selectedUserID)
    if (selectedUserObj) {
      this.roleAssignmentForm.patchValue({
        userRoleID: selectedUserObj.UserRoleID || ''
      })
    }
  }
  /*
  selectionChanged(e){
    console.log(e)
    let selectedUserID = this.roleAssignmentForm.value.userID.appUserVIMSID; //this.roleAssignmentForm.value.userID;
    console.log(selectedUserID);
    let selectedUserObj = this.usersList.find(a=>a.UserID == selectedUserID)
    if(selectedUserObj) {
      this.roleAssignmentForm.patchValue({
        userRoleID: selectedUserObj.userRoleID || ''
      })
    }
  }
  */

  getUsers() {
    this.usersList = [];
    let params = {};
    this.spinner.show(this.spinnerRefs.tableList);
    this.roleService.getUsers(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.tableList);
      if (res && res.StatusCode == 200) {
        this.usersList = res.PayLoad;
        // console.log("🚀 this.roleService.getUsers ~ this.usersList:", this.usersList)
        setTimeout(() => {
          if (this.usersList) {
            // this.UserID = this.usersList[0].UserID;
            this.getUsersInfo(this.usersList[1]);
            this.roleAssignmentForm.get('userName').disable();
            this.roleAssignmentForm.get('employeeName').disable();
            this.roleAssignmentForm.get('password').disable();
            this.roleAssignmentForm.get('userRoleID').disable();
          }
        }, 300);
      }
    }, (err) => {
      console.error('err', err)
      this.spinner.hide(this.spinnerRefs.tableList);
    })
  }

  getRoles() {
    this.rolesList = [];
    let params = {};
    this.spinner.show();
    this.roleService.getRoles(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res.StatusCode == 200) {
        this.rolesList = res.PayLoad || [];
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
    })
  }

  assignUserRole() {
    this.roleAssignmentFormSubmitted = true;
    this.roleAssignmentForm.patchValue({
      modifyBy: this.loggedInUser.userid
    });
    if (!this.roleAssignmentForm.valid) {
      this.toastr.warning('Please select User and Role');
      return;
    }
    console.log(this.roleAssignmentForm, this.roleAssignmentForm.valid)
    let params = this.roleAssignmentForm.value;
    this.spinner.show();
    this.roleService.updateUserRole(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        this.toastr.success('Role assigned');
        this.resetroleAssignmentForm();
        this.getUsers();
      } else {
        this.toastr.error('Error assigning role');
      }
    }, (err) => {
      this.spinner.hide();
    })
  }
  showHideCancelButton = false;
  showHideEditButton = true;
  resetroleAssignmentForm() {
    // this.roleAssignmentForm.reset();
    // this.roleAssignmentForm.patchValue({
    //   userID: '',
    //   userRoleID: '',
    //   modifyBy: '',
    // });
    this.roleAssignmentFormSubmitted = false;
    this.showHideEditButton = true;
    this.showHideCancelButton = false;
    this.resetDisPassword = false;
    this.roleAssignmentForm.get('userName').disable();
    this.roleAssignmentForm.get('password').disable();
    this.roleAssignmentForm.get('userRoleID').disable();
  }
  EditAssignmentForm() {
    this.showHideCancelButton = true;
    this.showHideEditButton = false;
    this.resetDisPassword= true;
    // this.roleAssignmentForm.get('userName').enable();
    // this.roleAssignmentForm.get('password').enable();
    this.roleAssignmentForm.get('userRoleID').enable();
    this.disableRoleAssignmentForm = false;
  }

  UserID: number;
  getUsersInfo(event) {
    console.log("getUsersInfo/event:", event);
    this.UserID = null;
    this.showHideEditButton = true;
    this.showHideCancelButton = false;
    this.resetDisPassword = false;
    this.roleAssignmentForm.get('userName').disable();
    this.roleAssignmentForm.get('password').disable();
    this.roleAssignmentForm.get('userRoleID').disable();
    let UserName=event.UserName || ''
    const originalString = UserName.toString(); 
    const regex = /\s*\(.*\)/g;
    UserName = originalString.replace(regex, '');
    
    console.log(UserName);

    this.spinner.show(this.spinnerRefs.EditInfo);
    
      setTimeout(() => {
        this.roleAssignmentForm.patchValue({
          userID: event.UserID,
          userName: UserName ,
          userRoleID: event.UserRoleID,
          password: this.defaultPassword,
          employeeName: event.EmpName || 'NA',
        });
        this.UserID = event.UserID;
        this.spinner.hide(this.spinnerRefs.EditInfo);
      }, 500);
  }
  
  resetPassword() {
    // let paramOb = {
    //   UserID: this.user.userid,
    // }
    // this.empService.empPasswordPolicy(paramOb).subscribe((res: any) => {
    //   let policy = res.PayLoad[0].PasswordPolicy
    //   let retVal = this.validatePasswordPolicy(this.resetForm.value.password, policy);
    //   if (retVal === "") {
        // password is valid   
        let paramObj = {
          UserID: this.UserID,
          OldPassword: null,
          NewPassword: this.defaultPassword, 
        };
        console.log("this.empService.empPasswordPolicy ~ paramObj:", paramObj);
        // this.resetForm.markAllAsTouched();
        // if (this.resetForm.invalid) {
        //   this.spinner.hide(this.spinnerRefs.resetForm);
        //   this.toastr.warning('Please fill the required fields...!'); return false;
        // } else {
          this.spinner.show(this.spinnerRefs.EditInfo);
          this.empService.resetPassword(paramObj).pipe(catchError((error): any => {
            this.spinner.hide(this.spinnerRefs.EditInfo);
            console.log(error);
            // if (environment.production)
            //   this.toastr.error("Something Went Wrong")
            // else
            //   this.toastr.error(error)
          }))
            .subscribe((resp: any) => {
            this.spinner.hide(this.spinnerRefs.EditInfo);
              console.log("🚀.subscribe ~ resp:", resp)
              if (resp.StatusCode == 200 && resp.PayLoad[0].RESULT == 1) {
                this.toastr.success("Password Succesfully Reset");
                // this.resetForm.reset();
              } else if (resp.StatusCode == 200 && resp.PayLoad[0].RESULT == 0) {
                this.toastr.error("Incorrect Current Password")
              }
              else if (resp.StatusCode == 200 && resp.PayLoad[0].RESULT == 2) {
                this.toastr.error("You Cannot Update Existing Password")
              }
              else {
                this.toastr.error("Something went wrong! Please contact Administrator")
              }
            }, (err) => {
              console.log(err)
              this.spinner.hide(this.spinnerRefs.EditInfo);
            })
        }
      // } else {
      //   this.toastr.warning(retVal);
      // }
}
