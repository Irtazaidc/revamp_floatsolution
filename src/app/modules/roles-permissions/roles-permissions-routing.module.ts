// @ts-nocheck
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AuthGuard } from '../auth/_services/auth.guard';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
// import { AuthGuard } from '../../guards/auth.guard';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { RolesAndPermissionsComponent } from './components/roles-and-permissions/roles-and-permissions.component';
import { RolesComponent } from './components/roles/roles.component';
import { UserRoleAssignmentComponent } from './components/user-role-assignment/user-role-assignment.component';


const routes: Routes = [
  {
    path: '',
    // component: ,
    data: {
      title: 'Roles Permissions',
      breadcrumb: 'RolePermissions',
      breadcrumb_caption: 'Manage user Roles and Permissions',
      icon: 'icofont-home bg-c-pink',
      status: false
    },
    children: [
      {
        path: '',
        redirectTo: 'rolespermissions',
        pathMatch: 'full'
      },
      {
        path: 'rolespermissions',
        component: RolesAndPermissionsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Roles And Permissions',
          breadcrumb: 'Roles Permissions',
          breadcrumb_caption: 'User Roles and Permissions',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'manageuserspermission',
        component: ManageUsersComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Manage Users Roles',
          breadcrumb: 'Users Roles and Permission ',
          breadcrumb_caption: 'Manage Users Roles and Permissions',
          icon: 'icofont-home bg-c-pink',
          // status: false
        }
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Roles',
          breadcrumb: 'Roles',
          breadcrumb_caption: 'User Roles',
          icon: 'icofont-home bg-c-pink',
          status: false
        }
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Permissions',
          breadcrumb: 'Permissions',
          breadcrumb_caption: 'Role Permissions',
          icon: 'icofont-home bg-c-pink',
          status: false,
        },
      },
      {
        path: 'assign-user-role',
        component: UserRoleAssignmentComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'User Role Assignment',
          breadcrumb: 'User Role Assignment',
          breadcrumb_caption: 'User Role Assignment',
          icon: 'icofont-home bg-c-pink',
          status: false,
        },
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesPermissionsRoutingModule { }
