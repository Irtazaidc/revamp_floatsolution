// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Input, Output, ViewChild } from '@angular/core';
import { AppPopupService } from '../../../../../modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-ris-services',
  templateUrl: './ris-services.component.html',
  styleUrls: ['./ris-services.component.scss']
})
export class RISServicesComponent implements OnInit {

  
  paramsValuesForWorkList: any;
  colNamesForMOScreen: any = ['StatusBadgeClass', 'VisitNo', 'PatientName', 'TPCode','TPName', 'BranchCode', 'PatientId', 'TPId', 'StatusId', 'PhoneNumber','ProcessId','MOBy','RegistrationDate','DeliveryDate','isConsentRead','isTechHistoryRequred','TestStatus','ServiceType'];
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
    console.log(event);
    this.cd.detectChanges();
    this.paramsValuesForWorkList = event;
    this.cd.detectChanges();

  }
  paramsValuesForWorkListHeader: any;
  getParamFormHeaderInfo(event) {
    this.paramsValuesForWorkListHeader = null;
    this.cd.detectChanges();
    this.paramsValuesForWorkListHeader = event;
    this.cd.detectChanges();
  }

}
