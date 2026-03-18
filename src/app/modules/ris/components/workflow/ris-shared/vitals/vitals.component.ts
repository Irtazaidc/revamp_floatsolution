// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { VitalsService } from 'src/app/modules/ris/services/vitals.service';
// import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { AppPopupService } from '../../../../../shared/helpers/app-popup.service';
@Component({
  standalone: false,

  selector: 'app-vitals',
  templateUrl: './vitals.component.html',
  styleUrls: ['./vitals.component.scss']
})
export class VitalsComponent implements OnInit {
  @Input('visitInfo') visitInfo: any = {};
  @Input('vitalSectionShow') vitalSectionShow: any = {};
  @Output() isStatusChanged = new EventEmitter<any>();
  @Output() isSaved = new EventEmitter<any>();
  vitalsForm = this.fb.group({
    height: [''],
    weight: [''],
    bpUpperValue: [''],
    bpLowerValue: [''],
    heartRate: [''],
    painSeverity: [''],
    bmi: [''],
    temprature: [''],
    breathing: [''],
    heightUnit: ['ft']
  });

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  painSeverityList: any = [];
  loggedInUser: UserModel;
  showClrBtn: boolean = false;
  VisitVitalID = null;
  heightincm: number;
  tempHeightUnit: string;
  constructor(private http: HttpClient,
    private fb: FormBuilder,
    private vitalsSrv: VitalsService,
    private toastr: ToastrService,
    private auth: AuthService,
    private modalService: NgbModal,
    private appPopupService: AppPopupService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // console.log("visitInfo___________________________", this.visitInfo);
    // console.log("vitalSectionShow________________", this.vitalSectionShow);
    this.loadLoggedInUserInfo();
    this.getPainSeverity();
    if (this.visitInfo.visitID && this.visitInfo.tpId)
      this.getVitals();
  }
  ngOnChanges(): void {
    if (this.visitInfo.visitID && this.visitInfo.tpId)
      this.getVitals();
  }

  insertUpdVisitVitals() {
    let formValues = this.vitalsForm.getRawValue();
    let params = {
      "VisitVitalID": this.VisitVitalID,
      "VisitID": this.visitInfo.visitID,
      "PatientID": this.visitInfo.patientID,
      "TPID": this.visitInfo.tpId,
      "Height": formValues.heightUnit == 'ft' ? String(this.heightincm) : formValues.height,
      "Weight": formValues.weight,
      "BPUpperValue": formValues.bpUpperValue,
      "BPLowerValue": formValues.bpLowerValue,
      "HearRate": formValues.heartRate,
      "Breathing": formValues.breathing,
      "PainSeverity": formValues.painSeverity,
      "BMI": Number(formValues.bmi),
      "Temprature": formValues.temprature,
      "CreatedBy": this.loggedInUser.userid
    }
    this.vitalsSrv.insertUpdateVisitVitals(params).subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.toastr.success(resp.Message);
        this.isStatusChanged.emit(1);
        this.isSaved.emit(1);
        this.actionButtonLable = "Save";
        this.actionButtonIconclass = "ti-save";
        setTimeout(() => {
          this.getVitals();
        }, 200);
      } else {
        this.toastr.error(resp.Message);
      }
    }, (err) => { console.log(err) })
  }
  getPainSeverity() {
    this.vitalsSrv.getPainSeverity().subscribe((resp: any) => {
      console.log("resp", resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.painSeverityList = resp.PayLoad;
      }
      else {
      }
    }, (err) => { console.log(err, "err") })
  }

  actionButtonLable = "Save";
  actionButtonIconclass = "ti-save";

  TPCode = "";
  TPName = "";
  bpLowerValue = null;
  bpUpperValue = null;
  breathing = null;
  heartRate = null;
  height = null;
  patWeight = null;
  temprature = null;
  painSeverity = null;
  painSeverityName = null;
  BMI = null;
  getVitals() {
    
    if (this.visitInfo.visitID && this.visitInfo.tpId) {
      let params = {
        VisitID: this.visitInfo.visitID,
        TPID: this.visitInfo.tpId
      }
      this.vitalsSrv.getVitals(params).subscribe((resp: any) => {
        // console.log("vital resp", resp);
        if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
          //Vitals Card////
          let vitalsData = resp.PayLoad[0];
          this.bpLowerValue = vitalsData.BPLowerValue;
          this.bpUpperValue = vitalsData.BPUpperValue;
          this.breathing = vitalsData.Breathing;
          this.heartRate = vitalsData.HearRate;
          this.height = vitalsData.Height;
          this.patWeight = vitalsData.PatWeight;
          this.BMI = vitalsData.BMI;
          this.temprature = vitalsData.Temprature;
          this.painSeverity = vitalsData.PainSeverity;
          this.painSeverityName = vitalsData.PainSeverityName;
          this.TPCode = vitalsData.TPCode;
          this.TPName = vitalsData.TPName;
          //Vitals Card////
          // console.log("kucchhhhhhh", this.patWeight)

          this.VisitVitalID = resp.PayLoad[0].VisitVitalID;
          if (this.VisitVitalID) {
            this.actionButtonLable = "Update";
            this.actionButtonIconclass = "ti-pencil-alt";
          } else {
            this.actionButtonLable = "Save";
            this.actionButtonIconclass = "ti-save";
          }
          this.vitalsForm.patchValue({
            bmi: resp.PayLoad[0].BMI,
            bpUpperValue: resp.PayLoad[0].BPUpperValue,
            bpLowerValue: resp.PayLoad[0].BPLowerValue,
            heartRate: resp.PayLoad[0].HearRate,
            temprature: resp.PayLoad[0].Temprature?resp.PayLoad[0].Temprature.toFixed(2):null,
            weight: resp.PayLoad[0].PatWeight,
            height: resp.PayLoad[0].Height,
            breathing: resp.PayLoad[0].Breathing,
            painSeverity: resp.PayLoad[0].PainSeverity,
            heightUnit: resp.PayLoad[0].Height ? 'cm' : 'ft'
          })
          this.showClrBtn = true;
          this.tempHeightUnit = resp.PayLoad[0].Height ? 'cm' : 'ft'
          // for (var control in this.vitalsForm.controls) {
          //   this.vitalsForm.controls[control].disable();
          // }
        }


      }, (err) => { console.log("err", err) })
    }
  }
  resetForm() {
    this.actionButtonLable = "Save";
    this.actionButtonIconclass = "ti-save";
  }
  calBMI() {
    let formValues = this.vitalsForm.getRawValue();
    if (formValues.height && formValues.weight) {
      // formValues.height = 165;
      // formValues.weight = 68;
      let bmi = "";
      if (formValues.heightUnit == 'cm') {
        this.tempHeightUnit = 'cm';
        bmi = Math.round(formValues.weight / Math.pow((formValues.height * 0.01), 2)).toFixed(2)
      }
      else {
        this.tempHeightUnit = 'ft';
        let cm = formValues.height.toString().split('.')[1] ?
          (((((Number(formValues.height.toString().split('.')[0]) * 12) + Number(formValues.height.toString().split('.')[1])))) * 0.0254) :
          (((((Number(formValues.height.toString()) * 12)
          ))) * 0.0254)
        bmi = Math.round(formValues.weight / Math.pow(cm, 2)).toFixed();
        // this.heightincm = Number(formValues.height.toString().split('.')[0]) * 30.48 + Number(formValues.height.toString().split('.')[1]) * 2.54
        this.heightincm = formValues.height.toString().split('.')[1] ?
          Number(formValues.height.toString().split('.')[0]) * 30.48 + Number(formValues.height.toString().split('.')[1]) * 2.54 :
          Number(formValues.height.toString()) * 30.48
      }
      this.vitalsForm.patchValue({
        bmi: bmi
      })
      console.log(bmi);
    }
    else {
      this.vitalsForm.patchValue({
        bmi: ""
      })
    }
    if (formValues.heightUnit == 'cm')
      this.tempHeightUnit = 'cm';
    else
      this.tempHeightUnit = 'ft';

    this.heightUnitChange();
  }
  heightUnitChange() {
    let formValues = this.vitalsForm.getRawValue();
    if (formValues.heightUnit == 'cm' && this.tempHeightUnit == 'ft' && formValues.height) {
      this.tempHeightUnit = 'cm';
      let ftVal = Number(formValues.height.toString().split('.')[0]) ? Number(formValues.height.toString().split('.')[0]) : 0;
      let inchesVal = Number(formValues.height.toString().split('.')[1]) ? Number(formValues.height.toString().split('.')[1]) : 0;
      let heightincm = ftVal * 30.48 + inchesVal * 2.54;
      this.vitalsForm.patchValue({
        height: heightincm
      });
    }
    else if (formValues.heightUnit == 'ft' && this.tempHeightUnit == 'cm' && formValues.height) {
      var realFeet = ((formValues.height * 0.393700) / 12);
      var feet = Math.floor(realFeet);
      var inches = Math.round((realFeet - feet) * 12);
      this.vitalsForm.patchValue({
        height: feet + '.' + inches
      });
      this.tempHeightUnit = 'ft'
    }
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
}

