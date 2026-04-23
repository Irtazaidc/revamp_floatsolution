// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { LabTatsService } from 'src/app/modules/lab/services/lab-tats.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { HcDashboardService } from '../../../services/hc-dashboard.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-hc-rider-checklist',
  templateUrl: './hc-rider-checklist.component.html',
  styleUrls: ['./hc-rider-checklist.component.scss']
})
export class HcRiderChecklistComponent implements OnInit {

  @ViewChild('RiderPIcture') RiderPIcture;

  loggedInUser: UserModel;
  isSubmitted = false;
  maxDate: any;
  RidersDetailListInParam = [];
  riderRoutinePic = null;
  ImageUrl = 'assets/images/brand/no-image.png';
  RiderCheckList = []

  spinnerRefs = {
    RiderTable: 'RiderTable',
  }

  public Fields = {
    dateFrom: ['', Validators.required],
    // dateTo: ['', Validators.required],
    RiderId: [, Validators.required],
  };

  filterForm: FormGroup = this.formBuilder.group(this.Fields)

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private lookupService: LookupService,
    private HCService: HcDashboardService,
    private appPopupService: AppPopupService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
   
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
      });
      this.RidersDetailF();
    }, 500);
    this.maxDate =  Conversions.getCurrentDateObject()
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    // console.log("loggedInUser", this.loggedInUser)
  }

  getRiderRoutineData() {
    this.riderRoutinePic = []
    this.ImageUrl = 'assets/images/brand/no-image.png';
    this.RiderCheckList = []
    const formValues = this.filterForm.getRawValue();

    if (this.filterForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const objParm = {
      DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,    
      DateTo: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,   
      RiderID: formValues.RiderId  
    };
    // console.log("params:",objParm)
    
    this.spinner.show(this.spinnerRefs.RiderTable);
    this.HCService.GetRiderQAnswerRoutinePic(objParm).subscribe((resp: any) => {
      // console.log("API response: ",resp)
      this.spinner.hide(this.spinnerRefs.RiderTable)
      if (resp.StatusCode == 200 && resp.PayLoadDS['Table'].length || resp.PayLoadDS['Table1'].length) {
        this.RiderCheckList = resp.PayLoadDS['Table'];
        this.riderRoutinePic = resp.PayLoadDS['Table1'];
        this.ImageUrl = this.riderRoutinePic[0].RiderPicBase64 || null; 
        // console.log("this.riderRoutineReportDataList:", this.riderRoutinePic)
      }
      else{
        this.toastr.warning('No Record Found');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.RiderTable);
      this.toastr.error('Connection Error');
      console.log(err)
    });
  }

  RidersDetailF() {

    const params = {
      RiderID: 0,
      LocID:this.loggedInUser.locationid,
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailListInParam = resp.PayLoad;
      // console.log("riders :",this.RidersDetailListInParam)

    }, (err) => { console.log(err) })
  }

  OpenRiderFullImage(riderData){
    this.appPopupService.openModal(this.RiderPIcture), { size: 'sm' };
  }
}
