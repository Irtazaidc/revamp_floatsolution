// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesComponent } from './components/roles/roles.component';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { RolesAndPermissionsComponent } from './components/roles-and-permissions/roles-and-permissions.component';
import { RolesPermissionsRoutingModule } from './roles-permissions-routing.module';
import { TreeviewModule } from 'ngx-treeview';
import { UserRoleAssignmentComponent } from './components/user-role-assignment/user-role-assignment.component';
import { SharedModule } from '../shared/shared.module';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { ComplaintsFeedbackModule } from '../complaints-feedback/complaints-feedback.module';
import { RolesAssignedUsersComponent } from './components/roles-assigned-users/roles-assigned-users.component';

@NgModule({
  declarations: [RolesComponent, PermissionsComponent, RolesAndPermissionsComponent, UserRoleAssignmentComponent, ManageUsersComponent, RolesAssignedUsersComponent],
  imports: [
    CommonModule,
    SharedModule,
    TreeviewModule,
    RolesPermissionsRoutingModule,
    MatTabsModule,
    MatCardModule,
    ComplaintsFeedbackModule
  ]
})
export class RolesPermissionsModule { }
