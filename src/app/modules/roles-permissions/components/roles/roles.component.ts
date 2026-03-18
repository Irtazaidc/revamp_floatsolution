// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output, TrackByFunction } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLinkWithHref } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { RoleService } from '../../services/role.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  standalone: false,

  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  @Input('ParentName') parentName: any;
  @Output() roleSelectedEvent = new EventEmitter<any>();

  showRoleForm = false;
  searchText = '';
  rolesList = [];
  CategoryOptions = [
    { label: "NORMAL", value: "NORMAL" },
    { label: "MANAGER", value: "MANAGER" },
    { label: "MO", value: "MO" },
    { label: "AGM", value: "AGM" },
    { label: "CLEVEL", value: "CLEVEL" },
  ];
  // selectedRole: any = {};
  // popoverTitle = 'Popover title';
  // popoverMessage = 'Popover description';
  // confirmClicked = false;
  // cancelClicked = false;
  spinnerRefs = {
    tableList: 'tableList',
    EditInfo: 'EditInfo',
    addRoleform:'addRoleform',
  }

  roleForm = this.fb.group({
    UserRoleID: [''],
    UserRoleTitle: ['', Validators.required],
    UserRoleDesc: [''],
    UserRoleCategory: ['NORMAL'],
    isDeleted: [0],
  });
  roleFormSubmitted = false;

  roleStatus = [
    {
      id: 0, title: 'Active'
    },
    {
      id: 1, title: 'Deleted',
    }
  ]

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
  
  constructor(
    // private storage: StorageService,
    private roleService: RoleService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // console.log(this.roleForm.value);
    this.getRoles();
    
    // console.log('sssssssssssssssssssssssss ', this.parentName);
  }
  showAddRoleForm(value) {
    if(value) {
      this.cancelRoleForm();
    }
    this.showRoleForm = value;
  }

  getRoles() {
    this.roleSelectedEvent.emit({});
    this.rolesList = [];
    let params = {};
    this.spinner.show(this.spinnerRefs.tableList)
    this.roleService.getRoles(params).subscribe( (res:any) => {
      setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.tableList)
      }, 300);
      if(res.StatusCode == 200) {
        this.rolesList = res.PayLoad || [];
        setTimeout(() => {
          this.viewPermissions(this.rolesList[0]);
          }, 300);
      }
      // console.log(res);
    }, (err: any) => {
      this.spinner.hide(this.spinnerRefs.tableList);
      console.log(err);
    })
  }

  getRoleCategoryClass(category: string) {
  switch (category) {
    case 'NORMAL':
      return 'badge-normal';
    case 'MANAGER':
      return 'badge-manager';
    case 'MO':
      return 'badge-mo';
    case 'AGM':
      return 'badge-agm';
    case 'CLEVEL':
      return 'badge-clevel';
    default:
      return 'badge-default';
  }
}

  submitRoleForm() {
    this.roleFormSubmitted = true;
    // console.log(this.roleForm);

    if(this.roleForm.valid) {
      this.insertUpdateRole(this.roleForm.value);
    } else {
      let invalidFieldNAmes = [];
      Object.keys(this.roleForm.controls).forEach((a,i) => {
        if(this.roleForm.controls[a].errors) {
             // console.log(a, this.roleForm.controls[a].errors, this.roleForm.controls[a]);
             invalidFieldNAmes.push(a);
             this.roleFormSubmitted=false;
        }
      })
      this.toastr.warning('Please enter ' + invalidFieldNAmes.join(', '));
    }
  }

  insertUpdateRole(values) {
    this.rolesList = [];
    let params = values;
    // {
    //   userRoleID: this.selectedRole.userRoleID || null,
    //   roleTitle: this.selectedRole.roleTitle || '',
    //   roleDesc: this.selectedRole.roleDesc || '',
    //   isDeleted: 0
    // };
    this.spinner.show(this.spinnerRefs.addRoleform);
    this.roleService.insertUpdateRole(params).subscribe( (res:any) => {
      // this.spinner.hide(this.spinnerRefs.addRoleform);
      if(res.StatusCode == 200) {
        this.toastr.success('Role Saved');
        this.cancelRoleForm();
        this.getRoles();
      } else {
        this.toastr.error('Error Saving Role');
      }
      this.roleSelectedEvent.emit({});
      // console.log(res);
    }, (err: any) => {
      // this.spinner.hide(this.spinnerRefs.addRoleform);
      console.log(err);
      this.roleSelectedEvent.emit({});
    })
  }

  editRole(role) {
  this.spinner.show(this.spinnerRefs.addRoleform);

  this.UserRoleID = role.UserRoleID;
  this.showAddRoleForm(true);

  this.roleForm.patchValue({
    UserRoleID: role.UserRoleID,
    UserRoleTitle: role.UserRoleTitle,
    UserRoleDesc: role.UserRoleDesc,
    UserRoleCategory: role.RoleCategory, // 👈 FIXED
    isDeleted: role.isDeleted ? 1 : 0
  });

  setTimeout(() => {
    this.spinner.hide(this.spinnerRefs.addRoleform);
  }, 200);
}

  removeRole(role) {
    // if(confirm('Are you sure, you want to proceed?')) {
      role.isDeleted = 1;
      this.insertUpdateRole(role);
    // }
  }

  cancelRoleForm() {
    // this.selectedRole = {};
    this.roleSelectedEvent.emit({});
    this.roleForm.reset();
    this.roleForm.patchValue({
      isDeleted: 0
    })
    // console.log(this.roleForm.value);
    this.roleFormSubmitted=false;
  }
  UserRoleID:number
  viewPermissions(role) {
    console.log("~ role:", role)
    this.UserRoleID=role.UserRoleID;
    this.showRoleForm=false;
    // this.selectedRole = {};
    // this.roleSelected.emit({});
    setTimeout(() => {
    // this.selectedRole = role;
    this.roleSelectedEvent.emit(role);
    }, 100);
    // const _url = ['roles-and-permissions/permissions'] || [];
    // this.updateUrlParams_navigateTo(_url, {p: btoa(JSON.stringify( role ))});
  }
  viewUsers(role){
     let Obj ={
      role:role,
      parentName:1,
     }
    this.UserRoleID=role.UserRoleID;
    this.showRoleForm=false;
    setTimeout(() => {
    this.roleSelectedEvent.emit(Obj);
    }, 100);
  }

  updateUrlParams_navigateTo(url, params = {}, settings = {}) {
    const _url = url || [];
    let _settings = { ...{
        // relativeTo: this.route,
        replaceUrl: true,
        queryParams: params,
        // queryParamsHandling: 'merge', // remove to replace all query params by provided
      }, ...settings};
    this.router.navigate(
      _url,
      _settings
      );
  }
  isAll = false;
  isMain = true;
  isMy = false;
  btnFilter(filter) {
    if (filter == 1) {
      this.isAll = false;
      this.isMain = true;
      this.isMy = false;
    }
    else if (filter == 2) {
      this.isAll = true;
      this.isMain = false;
      this.isMy = false;
    }

    else if (filter == 3) {
      this.isAll = false;
      this.isMain = false;
      this.isMy = true;
    }
    else {
      this.isAll = false;
      this.isMain = true;
      this.isMy = false;
    }
  }
}
