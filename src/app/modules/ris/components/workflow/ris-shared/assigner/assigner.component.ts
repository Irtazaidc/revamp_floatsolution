// @ts-nocheck
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Input, Output, ViewChild, OnChanges } from '@angular/core';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { AppPopupService } from '../../../../../shared/helpers/app-popup.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { VitalsService } from 'src/app/modules/ris/services/vitals.service';

@Component({
  standalone: false,

  selector: 'app-assigner',
  templateUrl: './assigner.component.html',
  styleUrls: ['./assigner.component.scss']
})
export class AssignerComponent implements OnInit, OnChanges {
  @Input() ComponentPayload = {
    TPID: null,
    VisitID: null,
    PatientID: null,
    TPCode: null,
    TPName: null,
    PatientName: null,
    RISWorkListID: null,
    RISStatusID: null,
    MOBy: null,
    // PhoneNumber:null,
    isShowVitalsCard:null,
    rowIndex:null
  };

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to assign ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  isSpinnerAssign = true;//Hide Loader
  disabledButtonAssign = false; // Button Enabled / Disables [By default Enabled]
  spinnerRefs = {
    listSection: 'listSection',
    drPic: "drPic"
  }
 
  constructor(
    private appPopupService: AppPopupService, 
    private cd: ChangeDetectorRef,
    private questionnaireSrv : QuestionnaireService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private helper: HelperService,
    private vitalsSrv: VitalsService,
  ) { }
  EmpID=null;
  ngOnInit(): void {
    this.getRadiologistInfo(this.EmpID);
    this.rowIndex = this.ComponentPayload.rowIndex;
    this.TPId = this.ComponentPayload.TPID;
    this.VisitID = this.ComponentPayload.VisitID?this.ComponentPayload.VisitID.replaceAll("-", ""):this.ComponentPayload.VisitID;
    this.TPCode = this.ComponentPayload.TPCode;
    this.TPName = this.ComponentPayload.TPName;
    this.PatientName = this.ComponentPayload.PatientName;
    this.PatientId = this.ComponentPayload.PatientID;
    this.VisitId = this.ComponentPayload.VisitID?this.ComponentPayload.VisitID.replaceAll("-", ""):null;
    this.RISStatusID = this.ComponentPayload.RISStatusID;
    // this.PatientPhoneNumber = this.ComponentPayload.PhoneNumber;
    this.RISWorkListID = this.ComponentPayload.RISWorkListID;
    this.MOBy = this.ComponentPayload.MOBy;
    this.assignTest();
  }
  ngOnChanges(): void {
    this.rowIndex = this.ComponentPayload.rowIndex;
    this.TPId = this.ComponentPayload.TPID;
    this.VisitID = this.ComponentPayload.VisitID?this.ComponentPayload.VisitID.replaceAll("-", ""):this.ComponentPayload.VisitID;
    this.TPCode = this.ComponentPayload.TPCode;
    this.TPName = this.ComponentPayload.TPName;
    this.PatientName = this.ComponentPayload.PatientName;
    this.PatientId = this.ComponentPayload.PatientID;
    this.VisitId = this.ComponentPayload.VisitID?this.ComponentPayload.VisitID.replaceAll("-", ""):this.ComponentPayload.VisitID;
    this.RISStatusID = this.ComponentPayload.RISStatusID;
    // this.PatientPhoneNumber = this.ComponentPayload.PhoneNumber;
    this.RISWorkListID = this.ComponentPayload.RISWorkListID;
    this.MOBy = this.ComponentPayload.MOBy;
    this.assignTest();
  }

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  radiologistPic =null;
  radoiologistList=[];
  radiologiestSections=[];
  radoiologistListTests=[];
  radoiologistListTestsSelected=[];
  radoiologistRow:any={};
  getRadiologistInfoByID(event){
    this.EmpID = event.EmpId
    if(event.EmpId){
      this.getRadiologistInfo(event.EmpId);
    }
  }
  getRadiologistInfo(EmpID){
    const params = {
      EmpID: EmpID
    };

    this.questionnaireSrv.getRadiologistInfo(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        if(params.EmpID){
          this.radoiologistRow = res.PayLoadDS['Table'][0] || [];
          // console.log("this.radoiologistRow",this.radoiologistRow)
          this.EmpID = this.radoiologistRow.EmpId;
          // this.radiologiestSections =  res.PayLoadDS['Table1'] || [];
          // this.radoiologistListTests =  res.PayLoadDS['Table2'] || [];
          // this.radoiologistListTestsSelected =  this.radoiologistListTests.filter(a=> a.isAssigned==1);
          // console.log("radiologiestSections list is: ",this.radiologiestSections)
          // console.log("radoiologistListTests list is: ",this.radoiologistListTests)
          // console.log("radoiologistListTestsSelected list is: ",this.radoiologistListTestsSelected)
          // console.log("radoiologistRow list is: ",this.radoiologistRow)
          this.getEmployeePic(params.EmpID)
          if(!this.radoiologistList.length){
            this.toastr.info('No record found.');
          }
        }else{
          this.radoiologistList =  res.PayLoadDS['Table'] || [];
          // console.log("this.radoiologistList__________",this.radoiologistList)
          setTimeout(() => {
            this.getRadiologistInfo(this.radoiologistList[0].EmpId);
            this.getEmployeePic(this.radoiologistList[0].EmpId);
          }, 200);
        }

      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      // this.spinner.hide(this.spinnerRefs.listSection);
      // this.spinner.hide(this.spinnerRefs.formSection);
    })
    this.spinner.hide();
  }
  getEmployeePic(EmpID){
    this.spinner.show(this.spinnerRefs.drPic);
    const params = {
      EmpID:EmpID
    }
    this.questionnaireSrv.getEmployeePic(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.drPic);
      if (res.StatusCode == 200) {
        if(res.PayLoad.length && res.PayLoad[0].EmployeePic){
          const resp = this.helper.formateImagesData(res.PayLoad,'EmployeePic');
          this.radiologistPic = resp[0].EmployeePic;
        }else{
          this.radiologistPic=null;
        }
      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.drPic);
    })
  }

  VisitId=null;
  
  TPId = null;
  VisitID = null;
  PatientName = null;
  TPCode = null;
  TPName = null;
  PatientId = null;
  RISWorkListID = null;
  RISStatusID = null;
  MOBy = null;
  rowIndex = null;
  PatientPhoneNumber: any = "";
  visitInfo: any = {};
  assignTest() {
    // console.log("row al linfor is: ", row)
    // this.rowIndex = index;
    // this.TPId = row.TPId;
    // this.VisitID = row.VisitNo.replaceAll("-", "");
    // this.TPCode = row.TPCode;
    // this.TPName = row.TPName;
    // this.PatientName = row.PatientName;
    // this.PatientId = row.PatientId;
    // this.VisitId = row.VisitNo.replaceAll("-", "");
    // this.RISStatusID = row.RISStatusID;
    // this.PatientPhoneNumber = row.PhoneNumber;
    // this.RISWorkListID = row.RISWorkListID;
    // this.MOBy = row.MOBy;
    this.visitInfo = { tpId: this.TPId, visitID: this.VisitID, patientID: this.PatientId, phoneNumber: this.PatientPhoneNumber }
    this.getVitals()
    this.getMOInterventionTPByVisitID(this.VisitID);
  }
  isShowVitalsCard = false;
  getVitals() {
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      const params = {
        VisitID: this.VisitID,
        TPID: this.TPId
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        if (resp.PayLoad.length) {
          this.isShowVitalsCard = true;
        } else {
          this.isShowVitalsCard = false;
        }
      }, (err) => { console.log("err", err) })
    }
  }

  visitTests = []
  getMOInterventionTPByVisitID(VisitID) {
    this.visitTests = []
    const params = {
      VisitID: VisitID
    };
    this.questionnaireSrv.getMOInterventionTPByVisitID(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.visitTests = res.PayLoad || [];
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
    })
  }
  assignTestToDoctor(){
    this.toastr.info("Comming Soon","Under Developement")
  }

}
