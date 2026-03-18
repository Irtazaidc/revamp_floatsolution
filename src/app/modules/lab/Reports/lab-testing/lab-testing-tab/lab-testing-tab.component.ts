// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-lab-testing-tab',
  templateUrl: './lab-testing-tab.component.html',
  styleUrls: ['./lab-testing-tab.component.scss']
})
export class LabTestingTabComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  selectedTabIndex: number = 0; 

  onTabChanged(event): void {
    this.selectedTabIndex = event.index;
  }

}
