// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { DoctorShareService } from '../../../services/doctor-share.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';

@Component({
  standalone: false,

  selector: 'app-assign-level',
  templateUrl: './assign-level.component.html',
  styleUrls: ['./assign-level.component.scss']
})
export class AssignLevelComponent implements OnInit {

  spinnerRefs = {
    radTable: 'radTable',
    searchTable: 'searchTable',
    drPic: 'drPic',
  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;

  public Fields = {
    radlevel: [, Validators.required],
    radID: [, Validators.required],
  };

  isSubmitted = false;
  doctorlevelList = [];
  DoctorList = [];
  searchText = '';
  radoiologistList = [];
  AssignedDataList = [];
  isDissabledChk = false;
  isFieldDisabled = false;
  assignForm: FormGroup = this.formBuilder.group(this.Fields)
  radiologistLevel:any = []

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private doctorShare: DoctorShareService,
    private questionnaireSrv: QuestionnaireService,
    private helper: HelperService,

  ) { }
  confirmationPopover = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  isSpinner = true;
  disabledButton = false;

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRadiologistInfoDetail();
    this.getLevelList();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getLevelList() {

    this.doctorlevelList = [];

    this.doctorShare.getDoctorLevel({}).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad.length) {
        this.doctorlevelList = res.PayLoad;
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

  updateDoctorLevel() {

    let formValues = this.assignForm.getRawValue();
    // if (this.assignForm.invalid) {
    //   this.toastr.warning("Please Fill The Mandatory Fields");
    //   this.isSubmitted = true;
    //   return;
    // };
    let checkedItems = this.radoiologistList.filter(a => a.checked);
    if (!checkedItems.length) {
        this.toastr.warning("Please select item(s) to update");
        return;
    }
    if (checkedItems.map(a => a.LevelID === null).some(isNull => isNull)) {
      this.toastr.warning("Please Select Level against checked Item");
      this.isSubmitted = true;
      return;
    }
    let objParams = {
      tblDoctorLevel: checkedItems.map(a => {
        return {
        LevelID:a.LevelID  || null,
        EmpID: a.EmpId || null,
        }
      }),
      CreatedBy: this.loggedInUser.userid || -99,
    };
    this.spinner.show(this.spinnerRefs.searchTable);
    this.doctorShare.updateDoctorLevel(objParams).subscribe((res: any) => {
      setTimeout(() => {this.spinner.hide(this.spinnerRefs.searchTable);}, 100);
      res.PayLoadStr = JSON.parse(res.PayLoadStr);
      if (res.StatusCode == 200 && res.PayLoadStr[0].Result == 1) {
        this.toastr.success('Doctors Levels Updated Successfully!');
        this.getRadiologistInfoDetail();
      }
      else{
      this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.searchTable);
      this.toastr.error('Connection error');
    })
  }
  getRadiologistInfoDetail() {
    let params = {
      EmpID: null
    };
    this.disabledButton = true;
    this.isSpinner = false;
    this.questionnaireSrv.getRadiologistInfoDetail(params).subscribe((res: any) => {
      this.disabledButton = false;
      this.isSpinner = true;
      if (res.StatusCode == 200) {
        this.radoiologistList = res.PayLoadDS['Table'] || [];
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      this.disabledButton = false;
      this.isSpinner = true;
      console.log(err);
      this.toastr.error('Connection error');
    })
    this.spinner.hide();
  }

  mainChk
  selectAllItems(checked){
  this.radoiologistList.forEach(sec => {
    sec.checked = checked;
  });
  }

  onSelectedDoctor(e){
    const checked:boolean = e.checked 
    if(checked == true ){
      this.isDissabledChk = false
    } 
  }

  
}
