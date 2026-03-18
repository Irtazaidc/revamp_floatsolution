// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Input, Output, ViewChild } from '@angular/core';
import { AppPopupService } from '../../../../shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-reporting-worklist',
  templateUrl: './reporting-worklist.component.html',
  styleUrls: ['./reporting-worklist.component.scss']
})
export class ReportingWorklistComponent implements OnInit {

  paramsValuesForWorkList: any;
  colNamesForMOScreen: any = ['StatusBadgeClass','VisitNo', 'PatientName', 'TPCode','TPName','TestStatus', 'BranchCode', 'PatientId', 'TPId', 'StatusId','RISWorkListID','RISStatusID', 'PhoneNumber','ProcessId','MOBy','isMedicalOfficerIntervention','RegistrationDate','DeliveryDate','RemainingTime (hh:mm)','isConsentRead','InitializedBy','InitializedOn','TranscribedBy','ReportDelayTime','EditExpiryTime','tempDSDateTime','isMetal','EmpId','IsAIAssistEnable','LocId','SubSectionId','IsAIAssistEnable','RISRequestAIID','isPreMedical'];
  // @Output() risParamsValuesForWorklist = new EventEmitter<any>();


  @ViewChild('questionnaireModal') questionnaireModal;
  @ViewChild('modalExistingAccountsList') modalExistingAccountsList;
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  isSpinner: boolean = true;//Hide Loader
  constructor(
    private appPopupService: AppPopupService, private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

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
