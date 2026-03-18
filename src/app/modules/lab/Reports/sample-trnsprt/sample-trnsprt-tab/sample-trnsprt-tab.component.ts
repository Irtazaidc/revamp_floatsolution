// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-sample-trnsprt-tab',
  templateUrl: './sample-trnsprt-tab.component.html',
  styleUrls: ['./sample-trnsprt-tab.component.scss']
})
export class SampleTrnsprtTabComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  
  selectedTabIndex: number = 0; 

  onTabChanged(event): void {
    this.selectedTabIndex = event.index;
  }
}
