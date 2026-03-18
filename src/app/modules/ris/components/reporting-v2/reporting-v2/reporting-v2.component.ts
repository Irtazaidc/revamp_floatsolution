// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TabsSwitchingService } from 'src/app/modules/doctors/services/tabs-switching.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-reporting-v2',
  templateUrl: './reporting-v2.component.html',
  styleUrls: ['./reporting-v2.component.scss']
})
export class ReportingV2Component implements OnInit {

  paramsValuesForWorkList: any;
  colNamesForMOScreen: any = ['StatusBadgeClass','VisitNo', 'PatientName', 'TPCode','TPName','TestStatus', 'BranchCode', 'PatientId', 'TPId', 'StatusId','RISWorkListID','RISStatusID', 'PhoneNumber','ProcessId','MOBy','isMedicalOfficerIntervention','RegistrationDate','DeliveryDate','RemainingTime (hh:mm)','isConsentRead','InitializedBy','InitializedOn','TranscribedBy','ReportDelayTime','EditExpiryTime','tempDSDateTime','isMetal','InitByEmpID','DSByEmpID','LocId','SubSectionId','IsAIAssistEnable','RISRequestAIID','isPreMedical','isCompareStudy'];
  // @Output() risParamsValuesForWorklist = new EventEmitter<any>();


  @ViewChild('questionnaireModal') questionnaireModal;
  @ViewChild('modalExistingAccountsList') modalExistingAccountsList;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader

  constructor(
    private appPopupService: AppPopupService, 
    private cd: ChangeDetectorRef,
    private Tabs : TabsSwitchingService,
    private cdr: ChangeDetectorRef
  ) { }

  // selectedTabIndex = 0
  ngOnInit(): void {
    // this.Tabs.selectedTabIndex$.subscribe(({index, data }) => {
    //   this.selectedTabIndex = index;     
    // });
  }


  // onTabChanged(event): void {
  //   this.selectedTabIndex = event.index;
  //   this.cdr.detectChanges();
  // }

  risParamsReceived(event) {
    this.paramsValuesForWorkList = null;
    // console.log(event);
    this.cd.detectChanges();
    this.paramsValuesForWorkList = event;
    this.cd.detectChanges();

  }
  
  openQuestionnaireModal() {
    this.appPopupService.openModal(this.questionnaireModal);
  }

  paramsValuesForWorkListHeader: any;
  getParamFormHeaderInfo(event) {
    this.paramsValuesForWorkListHeader = null;
    this.cd.detectChanges();
    this.paramsValuesForWorkListHeader = event;
    this.cd.detectChanges();

  }

}
