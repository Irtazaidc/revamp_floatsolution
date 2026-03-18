// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss']
})
export class RolesAndPermissionsComponent implements OnInit {

  selectedRole: any = {};
  parentName = 'roles-and-permissions';

  constructor() { }

  ngOnInit(): void {
  }

  roleSelectedFn(val) {
    // console.log(val);
    this.selectedRole = val;    
  }

}
