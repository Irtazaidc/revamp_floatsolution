// @ts-nocheck
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { PermissionsService } from '../../services/permissions.service';
import { RoleService } from '../../services/role.service';

@Component({
  standalone: false,

  selector: 'app-roles-assigned-users',
  templateUrl: './roles-assigned-users.component.html',
  styleUrls: ['./roles-assigned-users.component.scss']
})
export class RolesAssignedUsersComponent implements OnInit, OnChanges {
  @Input() UserRole: any;
  @Input('ParentName') parentName: any;
  
  searchText='';
  selectedRole;
  roleAssignedToUsersList= [];
  // [
  //   {username:'Asad',fullName:"Asad Ali"},
  //   {username:'Israr ',fullName:"Israr ahmed"},
  //   {username:'Umer',fullName:"Umer Chadda"},
  //   {username:'Rizwan',fullName:"Haji Rizwan"},
  // ];
  spinnerRefs = {
    usersList: 'usersList',
  }
  constructor(
    private route: ActivatedRoute,
    private permissions: PermissionsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private roleService: RoleService,
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges() {
      this.selectedRole = this.UserRole.role;
    if(this.selectedRole && this.selectedRole.UserRoleID) {
      this.GetUsersByRoleID(this.selectedRole.UserRoleID);
    };
  }

  GetUsersByRoleID(UserRoleID) {
    this.roleAssignedToUsersList = [];
    const params = 
    {
      RoleID: UserRoleID || null,
    };
    this.spinner.show(this.spinnerRefs.usersList);
    this.roleService.getUsersByRoleID(params).subscribe( (res:any) => {
      this.spinner.hide(this.spinnerRefs.usersList);
      if(res.StatusCode == 200) {
        res.PayLoadStr=JSON.parse(res.PayLoadStr);
        this.roleAssignedToUsersList=res.PayLoadStr.Table;
      } else {
        this.toastr.error('Something went wrong');
      }
    }, (err: any) => {
      this.spinner.hide(this.spinnerRefs.usersList);
      this.toastr.error('Connection Error');
      console.log(err);
    })
  }
}
