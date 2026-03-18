// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  
  groupList
  
  constructor() { }

  ngOnInit(): void {
  }

}
