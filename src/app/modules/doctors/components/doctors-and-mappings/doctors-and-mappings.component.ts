// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { TabsSwitchingService } from '../../services/tabs-switching.service';

@Component({
  standalone: false,

  selector: 'app-doctors-and-mappings',
  templateUrl: './doctors-and-mappings.component.html',
  styleUrls: ['./doctors-and-mappings.component.scss']
})
export class DoctorsAndMappingsComponent implements OnInit {

  selectedTabIndex: number;
  tabData: any;

    constructor(
    private Tabs : TabsSwitchingService,
    ) { }

    ngOnInit() {
      // Subscribe to the selectedTabIndex$ observable to update the selectedTabIndex
      this.Tabs.selectedTabIndex$.subscribe(({index, data }) => {
        this.selectedTabIndex = index;
        this.tabData = data;     
      });
    }

  onTabChanged($event) {
    // let clickedIndex = $event.index;
    console.log('onTabChanged ', $event, $event.index);
    switch($event.index) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      default:
        console.log('default');
    }
  }

}
