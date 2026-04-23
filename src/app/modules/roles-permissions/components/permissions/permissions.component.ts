// @ts-nocheck
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { AuthService, UserModel } from 'src/app/modules/auth';
// import { User } from '../../../../models//user';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  standalone: false,

  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnChanges, OnInit {

  @Input() Role: any;
  @Input('ParentName') parentName: any;
  @Output() roleSelectedEvent = new EventEmitter<any>();
  selectedRole: any;

  loggedInUser: UserModel;
  permissionsList = [];
  searchText = '';
  items: TreeviewItem[];
  values: number[];
  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 400
  });
  permissionsTreeViewRef: any = '';
  checkedPermissionIDs: any = [];

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }
  spinnerRefs = {
    screenCheckBox: 'screenCheckBox',
  }

  constructor(
    private route: ActivatedRoute,
    private permissions: PermissionsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService
    // private storage: StorageService,
    ) { }


  ngOnChanges() {
    // console.log(this.Role);
    this.selectedRole = this.Role;
    if(this.selectedRole && this.selectedRole.UserRoleID) {
      this.loadRolePermissions(this.selectedRole.UserRoleID);
    };
  }
  
  ngOnInit(): void {
    // console.log('Role => ', this.Role);
    this.loadPermissions();

    // this.route.queryParams.subscribe(params => {
    //   if(params.p) {
    //     let allParams:any = atob(params.p);
    //     allParams = JSON.parse(allParams);
    //     //console.log(allParams);
    //   }
    // });

    this.items = [];
    // this.loggedInUser = this.storage.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
  }


  loadPermissions() {
    const params = {};
    this.spinner.show(this.spinnerRefs.screenCheckBox);
    this.permissions.getPermissions(params).subscribe( (res:any) => {
      this.spinner.hide(this.spinnerRefs.screenCheckBox);
      // console.log('Permissions ===> ', res);
      if(res && res.PayLoad) {
        this.permissionsList = res.PayLoad.map( a=> {
          return {...a, ...{ScreenID: a.ScreenID, Name: (a.ScreenTitle), ScreenDetailID: a.ScreenDetailID, Permission: a.ScreenDetailTitle, State: a.ScreenKey}}
        });
        this.permissionsList.forEach((element,i) => {
          element['Checked'] = false;
        });
        const allPermissions = JSON.parse(JSON.stringify(this.permissionsList));
        this.items = this.formatTreeData(allPermissions);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.screenCheckBox);
    })
    // this.permissionsList = [
    //   {allowed: 1, name: 'Search Patient',              state: 'search'},
    //   {allowed: 1, name: 'Register Patient',            state: 'reg'},
    //   {allowed: 1, name: 'Fdo Sales',                   state: 'fdo-sales'},
    //   {allowed: 1, name: 'Vaccination Worklist',        state: 'worklist'},
    //   {allowed: 1, name: 'Vaccine Checked In',          state: 'checked-in'},
    //   {allowed: 1, name: 'Vaccine Checked Out',         state: 'checked-out'},
    //   {allowed: 1, name: 'Vaccine Card',                state: 'vaccine-card'},
    //   {allowed: 1, name: 'User Roles and Permissions',  state: 'rolespermissions'},
    //   {allowed: 1, name: 'User Roles',                  state: 'roles'},
    //   {allowed: 1, name: 'Roles Permissions',           state: 'permissions'},
    // ];
  }
  loadRolePermissions(roleId) {
    const params = {
      RoleID: roleId
    };
    this.spinner.show(this.spinnerRefs.screenCheckBox);
    this.permissions.getPermissions(params).subscribe( (res:any) => {
      this.spinner.hide(this.spinnerRefs.screenCheckBox);
      // console.log('Role Permissions ===> ', res);
      if(res && res.PayLoad) {
        const allPermissions = JSON.parse(JSON.stringify(this.permissionsList));
        allPermissions.forEach(element => {
          element['Checked'] = false;
        });
        allPermissions.forEach((element,i) => {
          element['Checked'] = !!res.PayLoad.find(a=>a.ScreenDetailID == element.ScreenDetailID);
        });
        this.items = this.formatTreeData(allPermissions);
      }
    }, (err) => {
      console.error(err)
      this.spinner.hide(this.spinnerRefs.screenCheckBox);
    })
  }

  checkAllPermission(e) {
    this.permissionsList.forEach( a => {
      a.allowed = e.target.Checked;
    })
  }

  saveRolePermissions() {
    const params = {
      RoleID: this.selectedRole.UserRoleID,
      PermissionIDs: this.checkedPermissionIDs.join(','),
      CreatedBy: this.loggedInUser.userid,
      CreatedOn: moment(new Date).format(),
      ModifyBy: this.loggedInUser.userid,
      ModifyOn: moment(new Date).format()
    }
    console.log(params);
    this.spinner.show();
    this.permissions.updateRolePermissions(params).subscribe( (res:any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200) {
        this.toastr.success('Successfully saved');
      } else {
        this.toastr.error('Error: not saved');
      }
      console.log(res);
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    })
  }

  onSelectedChange(e) {
    // console.log('onSelectedChange => ', e);
    this.checkedPermissionIDs = e;
    // console.log(this.checkedPermissionIDs);
  }
  onFilterChange(value: string): void {
    console.log('filter:', value);
  }

  formatTreeData(data): TreeviewItem[] {
    const allowedScreenIDs = [...new Set(data.map( (a,i)=> {
      return a.ScreenID;
    }))];
    const c = [];
    allowedScreenIDs.forEach( (a,i)=> {
      const currentScreenPermission = data.filter(b=>b.ScreenID == a).map(a => {
        return {
          text: a.ScreenDetailTitle,
          value: a.ScreenDetailID,
          screenTitle: a.ScreenTitle,
          screenID: a.ScreenID,
          screenDetailID: a.ScreenDetailID,
          checked: a.Checked
        }
        });
        const obj = {
            text: currentScreenPermission[0].screenTitle,
            value: (a + '_' + i), // (+new Date() + i),
            children: currentScreenPermission
        }
        c.push(obj);
    })
    this.permissionsTreeViewRef = new TreeviewItem({
      text: 'Select All', value: -1, children: c
    });
    return [this.permissionsTreeViewRef];
  }

}
