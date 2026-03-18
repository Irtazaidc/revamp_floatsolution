// @ts-nocheck
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-radiologist-infov2',
  templateUrl: './radiologist-infov2.component.html',
  styleUrls: ['./radiologist-infov2.component.scss']
})
export class RadiologistInfov2Component implements OnInit {

 @Input('paramPayload') paramPayload: any;
  @Input('selectedValueChange') selectedValueChange: any;
  constructor(
    private spinner: NgxSpinnerService,
    private questionnaireSrv : QuestionnaireService,
    private helper: HelperService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) { }

  spinnerRefs = {
    drPic: "drPic"
  }
  EmpID = null;
  dateFrom = null;
  dateTo = null;
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  radiologistPic =null;
  radoiologistRow:any={};
  ngOnInit(): void {
    // this.cd.detectChanges();
    this.EmpID = null;
    this.dateFrom = null;
    this.dateTo = null;

    this.EmpID = this.paramPayload.EmpID;
    this.dateFrom = this.paramPayload.dateFrom;
    this.dateTo = this.paramPayload.dateTo;

    this.getRadiologistInfo(this.EmpID)
    this.cd.detectChanges();
    
  }
  ngOnChanges(): void {
    // this.cd.detectChanges();
    this.EmpID = null;
    this.dateFrom = null;
    this.dateTo = null;

    this.EmpID = this.paramPayload.EmpID;
    this.dateFrom = this.paramPayload.dateFrom;
    this.dateTo = this.paramPayload.dateTo;

    this.getRadiologistInfo(this.EmpID)
    this.cd.detectChanges();
  }
  getRadiologistInfo(EmpID){
    let params = {
      EmpID: EmpID,
      // DateFrom :this.dateFrom,
      // DateTo: this.dateTo
    };
    // console.log("Radiologist params are: ",params); //return;

    this.questionnaireSrv.getRadiologistInfo(params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.radoiologistRow = res.PayLoadDS['Table'][0] || [];
        // this.EmpID = this.radoiologistRow.EmpId;
        if(params.EmpID)
          this.getEmployeePic(params.EmpID)

      } else {
        this.toastr.error('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }
  getEmployeePic(EmpID){
    this.spinner.show(this.spinnerRefs.drPic);
    let params = {
      EmpID:EmpID
    }
    this.questionnaireSrv.getEmployeePic(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.drPic);
      if (res.StatusCode == 200) {
        if(res.PayLoad.length && res.PayLoad[0].EmployeePic){
          let resp = this.helper.formateImagesData(res.PayLoad,'EmployeePic');
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
}
