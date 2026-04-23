// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { RoleService } from 'src/app/modules/roles-permissions/services/role.service';
import { HcCityAuthService } from '../../services/hc-city-auth.service';

@Component({
  standalone: false,

  selector: 'app-hccity-auth',
  templateUrl: './hccity-auth.component.html',
  styleUrls: ['./hccity-auth.component.scss']
})
export class HCCityAuthComponent implements OnInit {

  hcCityAuthForm = this.fb.group({
    userID: ['', Validators.required],
    hcCityID: ['', Validators.required],
    modifyBy: [''],
  });

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
  usersList: any[];
  rolesList: any[];
  gcCitiesList: any[];
  loggedInUser: UserModel;
  constructor(private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private roleService: RoleService,
    private hccityAuth: HcCityAuthService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getUsers();
    this.getHCCities();
    this.loadLoggedInUserInfo();
  }

  getUsers() {
    this.usersList = [];
    const params = {};
    this.spinner.show();
    this.roleService.getUsers(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        this.usersList = res.PayLoad;
      }
    }, (err) => {
      this.spinner.hide();
    })
  }

  getHCCities() {
    this.gcCitiesList = [];
    this.spinner.show();
    this.hccityAuth.getHCCities().subscribe((res: any) => {
      this.spinner.hide();
      if (res.StatusCode == 200) {
        this.gcCitiesList = res.PayLoad || [];
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
    })
  }

  getRoles() {
    this.rolesList = [];
    const params = {};
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

  assignHCCityToHCStaff() {
  
    const formValues = this.hcCityAuthForm.getRawValue();
    console.log(formValues);
    const params = {
      UserId: formValues.userID,
      CityIDs: formValues.hcCityID.join(','),
      CreatedBy: this.loggedInUser.userid
    }
    this.hccityAuth.updateUserCityAuth(params).subscribe((resp: any) => {
      console.log(resp);
      if (resp.StatusCode == 200) {
        this.toastr.success("Successfully Assigned");
        this.getAuthorizedCitiesByUser();
      }
    }, (err) => { console.log(err) })
  }

  getAuthorizedCitiesByUser() {
    const formValues = this.hcCityAuthForm.getRawValue();
    const params = {
      "UserId": formValues.userID
    }
    this.hccityAuth.getAuthorizedCitiesByUserId(params).subscribe((resp: any) => {
      console.log(resp);
      if (resp.StatusCode == 200) {
        const authCityIds = resp.PayLoad.map(a => { return Number(a.CityID) }); //.join(",").split(',')
        console.log(authCityIds);
        if (authCityIds.length) {
          this.hcCityAuthForm.patchValue({
            hcCityID: authCityIds
          })
        }
        else {
          this.hcCityAuthForm.patchValue({
            hcCityID: ''
          })
        }
      }
      else {

      }
    }, (err) => { console.log(err) })
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  resethcCityAuthForm() {
    this.hcCityAuthForm.reset();
    this.hcCityAuthForm.patchValue({
      userID: '',
      hcCityID: '',
      modifyBy: '',
    });
    // this.roleAssignmentFormSubmitted = false;
  }
}
