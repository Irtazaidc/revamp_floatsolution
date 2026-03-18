// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RisWorklistService } from 'src/app/modules/ris/services/ris-worklist.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,

  selector: 'app-mo-history',
  templateUrl: './mo-history.component.html',
  styleUrls: ['./mo-history.component.scss']
})
export class MoHistoryComponent implements OnInit {
  @Input() QuestionnairePayload = {
    TPID: null,
    VisitID: null,
    isShowVitalsCard:false,
    isMetal:false
  };

  TPID = null;
  VisitId = null;
  isMetal = false;
  listHistory= [];
  spinnerRefs = {
    historySection: 'historySection',
  }
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private worklistSrv: RisWorklistService,
    private auth: AuthService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.VisitId = this.QuestionnairePayload.VisitID;
    this.TPID = this.QuestionnairePayload.TPID;
    this.isMetal = this.QuestionnairePayload.isMetal;
    this.getRISMOHistory(this.QuestionnairePayload.TPID);
  }
  TPCodeName="";
  vitalsData = [];
  painSeverity="No Pain";
  BMI=null;
  SavedBy=null;
  SavedOn=null;
  getRISMOHistory(TPID) {
    let params = {
      TPID: TPID,
      QuestionGroupTypeID: 5,
      VisitID: this.VisitId
    };
    this.spinner.show(this.spinnerRefs.historySection);
    this.worklistSrv.getRISMOHistory(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.historySection);
      if (res.StatusCode == 200) {
        this.listHistory = res.PayLoadDS['Table'] || [];
        this.vitalsData = res.PayLoadDS['Table2'] || [];
        if(this.vitalsData.length){
          // if(this.vitalsData[0].PainSeverity && this.vitalsData[0].PainSeverity==1){
          //   this.painSeverity = "No Pain"
          // }else if(this.vitalsData[0].PainSeverity && this.vitalsData[0].PainSeverity==2){
          //   this.painSeverity = "Mild"
          // }else if(this.vitalsData[0].PainSeverity && this.vitalsData[0].PainSeverity==3){
          //   this.painSeverity = "Severe"
          // }else if(this.vitalsData[0].PainSeverity && this.vitalsData[0].PainSeverity==4){
          //   this.painSeverity = "Worst Pain"
          // }

          this.painSeverity = this.vitalsData[0].PainSeverit;
          this.BMI = this.vitalsData[0].BMI;
        }
        this.TPCodeName =  this.listHistory[0].TPCodeName;
        this.SavedBy = this.listHistory[0].SavedBy || null;
        this.SavedOn = this.listHistory[0].SavedOn || null;
        this.listHistory = this.listHistory.map((a)=>{
          return{
            Age:a.Age,
            AnsTypeID:a.AnsTypeID,
            // Answer:(a.AnsTypeID==7)? a.Answer.replace("^"," - ") :(a.AnsTypeID==4)? a.Answer.replace("^"," : "):a.Answer,
            Answer2: (a.ansTypeID == 5) ? this.setAnsVal(a.Answer, a.AnsTypeID) : (a.AnsTypeID == 7) ? this.setMinMaxAnsVal(a.Answer) : (a.AnsTypeID == 4) ? this.setTextAnsVal(a.Answer) : a.Answer,
            CreatedBy:a.CreatedBy,
            CreatedOn:a.CreatedOn,
            Gender: a.Gender,
            MRNo:a.MRNo,
            PatientName:a.PatientName,
            Question:a.Question,
            QuestionID:a.QuestionID,
            VisitID:a.VisitID
          }
        })
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.historySection);
    })
  }
  setAnsVal(answer, ansTypeID) {
    let ans = "";
    ans = (ansTypeID == 5 && answer == "true") ? "Yes" : (ansTypeID == 5 && answer == "false") ? "No" : answer;
    return ans
  }
  setMinMaxAnsVal(answer) {
    let ans = "";
    ans = answer.replace("^", "-");
    return ans
  }
  setTextAnsVal(answer) {
    let ans = "";
    ans = answer ? answer.replace("^", " : "): "";
    return ans
  }
}
