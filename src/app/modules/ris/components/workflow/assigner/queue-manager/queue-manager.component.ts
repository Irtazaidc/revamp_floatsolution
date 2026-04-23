// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-queue-manager',
  templateUrl: './queue-manager.component.html',
  styleUrls: ['./queue-manager.component.scss']
})
export class QueueManagerComponent implements OnInit {

  paramsValuesForWorkList: any;
  colNamesForMOScreen: any = ['StatusBadgeClass','VisitNo', 'PatientName', 'TPCode','TPName', 'TestStatus', 'BranchCode', 'PatientId', 'TPId', 'StatusId','RISWorkListID', 'Workflow Status','RISStatusID', 'PhoneNumber','ProcessId','MOBy','isMedicalOfficerIntervention','EmpId','RegistrationDate','DeliveryDate','isConsentRead','SubSectionId','InitializedBy','InitializedOn', 'InitByEmpID','DSByEmpID','isMetal','RadiologistID','isPreMedical'];
  // @Output() risParamsValuesForWorklist = new EventEmitter<any>();


  @ViewChild('questionnaireModal') questionnaireModal;
  @ViewChild('modalExistingAccountsList') modalExistingAccountsList;
  disabledButton = false; // Button Enabled / Disables [By default Enabled]
  isSpinner = true;//Hide Loader
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
