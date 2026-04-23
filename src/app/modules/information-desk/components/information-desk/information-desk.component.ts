// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/modules/auth';
import { ActivatedRoute } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TabsSwitchingService } from 'src/app/modules/doctors/services/tabs-switching.service';

@Component({
  standalone: false,

  selector: 'app-information-desk',
  templateUrl: './information-desk.component.html',
  styleUrls: ['./information-desk.component.scss']
})
export class InformationDeskComponent implements OnInit {
  screenPermissionsObj;
  selectedTabIndex = 0;
  inquiryReportPermission = false;
  tabIndex = 0;
  ParamID: any;


  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private Tabs : TabsSwitchingService,
    private cdr: ChangeDetectorRef

  ) { }
  
  ngOnInit(): void {
    this.getPermissions();
    this.Tabs.selectedTabIndex$.subscribe(({index, data }) => {
      this.selectedTabIndex = index;     
      this.tabIndex = index;     
    });
  }

  getPermissions() {
    this.screenPermissionsObj = this.auth.getUserPermissionsFromLocalStorage();
    const data = this.screenPermissionsObj.find(i=>i.state ==='inquiry-report');
    this.inquiryReportPermission = data ? true:false;
  }

  onTabChanged(event): void {
    this.selectedTabIndex = event.index;
    this.tabIndex = event.index;
    this.cdr.detectChanges();
  }


  getParamID(paramID){
  if(paramID && paramID.PID){ 
    this.ParamID = paramID;    
  } else {
    console.error("Invalid paramID:", paramID);
  }
  }

}
