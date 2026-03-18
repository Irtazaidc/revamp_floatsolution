// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-due-report-tab',
  templateUrl: './due-report-tab.component.html',
  styleUrls: ['./due-report-tab.component.scss']
})
export class DueReportTabComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  selectedTabIndex: number = 0; 

  onTabChanged(event): void {
    this.selectedTabIndex = event.index;
  }

}
