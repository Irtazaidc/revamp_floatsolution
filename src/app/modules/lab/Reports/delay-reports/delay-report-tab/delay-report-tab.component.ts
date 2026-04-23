// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-delay-report-tab',
  templateUrl: './delay-report-tab.component.html',
  styleUrls: ['./delay-report-tab.component.scss']
})
export class DelayReportTabComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  selectedTabIndex = 0; 

  onTabChanged(event): void {
    this.selectedTabIndex = event.index;
  }
}
