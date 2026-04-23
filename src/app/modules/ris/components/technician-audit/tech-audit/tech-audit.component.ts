// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Input, Output, ViewChild } from '@angular/core';
import { AppPopupService } from '../../../../../modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-tech-audit',
  templateUrl: './tech-audit.component.html',
  styleUrls: ['./tech-audit.component.scss']
})
export class TechAuditComponent implements OnInit {

  paramsValuesForWorkList: any;
  colNamesForMOScreen: any = ['StatusBadgeClass', 'VisitNo', 'PatientName', 'TPCode','TPName', 'BranchCode', 'PatientId', 'TPId', 'StatusId','RISWorkListID', 'Workflow Status','RISStatusID', 'PhoneNumber','ProcessId','MOBy','isMedicalOfficerIntervention','RegistrationDate','DeliveryDate','isConsentRead','InitializedBy','isTechHistoryRequred','TestStatus','InitBy','InitializedOn','TechnologistVisitTPAuditID','AuditStatusID','TechRemarks','FeedBackBy','FeedBackOn','FeedBackRemarks','FeedBackDetailRemarks','FBHLocCode','isMetal','isPreMedical'];
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
    // this.paramsValuesForWorkList = [];
    console.log(event);
    this.cd.detectChanges();
    this.paramsValuesForWorkList = event;
    // console.log("this.paramsValuesForWorkList+++++++++++++++TECHNICIAN++++++++++++",this.paramsValuesForWorkList)
    // this.risParamsValuesForWorklist.emit(this.paramsValuesForWorkList)
    this.cd.detectChanges();

  }
  // cardHeaderColor="#FFA800";
  // cardHeaderColorRec(colorValue) {
  //   this.cardHeaderColor=colorValue;
  //   console.log("cardHeaderColor_________", colorValue )
  // }

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
  checkDoctorFeedback = false;
  getFeedbackValue(event){
    this.checkDoctorFeedback = event == true?true:false;
  }

}
