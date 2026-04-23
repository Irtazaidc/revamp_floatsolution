// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { HcCityAuthService } from '../../services/hc-city-auth.service';

@Component({
  standalone: false,

  selector: 'app-hc-config',
  templateUrl: './hc-config.component.html',
  styleUrls: ['./hc-config.component.scss']
})
export class HcConfigComponent implements OnInit {
  cardTitle = "Create City";
  actionLabel = "Save";
  searchInHCCity: any = "";
  hcCityConfigForm = this.fb.group({
    cityCode: ['', Validators.compose([Validators.required])],
    cityTitle: ['', Validators.compose([Validators.required])],
    cityDescription: ['', ''],
  });
  spinnerRefs = {
    hccityCofigDetailSection: 'hccityCofigDetailSection',
    hccityCofigFormSection: 'hccityCofigFormSection'
  }
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
  isSpinner = true;
  loggedInUser: UserModel;
  gcCitiesList: any = [];
  selHCCity: any = [];
  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private hccityAuth: HcCityAuthService) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getHCCities();
  }

  getHCCities() {
    this.gcCitiesList = [];
    this.spinner.show();
    this.hccityAuth.getHCCities().subscribe((res: any) => {
      this.spinner.hide();
      if (res.StatusCode == 200) {
        this.gcCitiesList = res.PayLoad || [];
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
    })
  }

  getSelHCCityDetails(selCity) {
    this.selHCCity = selCity.HCCityID ? this.gcCitiesList.filter(a => { return a.HCCityID == selCity.HCCityID }) : null;
    if (this.selHCCity.length) {
      this.hcCityConfigForm.patchValue({
        cityCode: this.selHCCity[0].Code ? this.selHCCity[0].Code : null,
        cityTitle: this.selHCCity[0].Title ? this.selHCCity[0].Title : null,
        cityDescription: this.selHCCity[0].Description ? this.selHCCity[0].Description : null,
        // userid: this.selHCCity[0].HCCityID ? this.selHCCity[0].HCCityID : '',        
      });
      this.cardTitle = "Update Zone";
      this.actionLabel = "Update";
    }
  }
  InsertUpdateHCCity() {
    const formDate = this.hcCityConfigForm.getRawValue();
    const params = {
      "HCHCityID": this.selHCCity && this.selHCCity.length? this.selHCCity[0].HCCityID : null,
      "HCCityCode": formDate.cityCode,
      "HCCityTitle": formDate.cityTitle,
      "HCCityDescription": formDate.cityDescription,
      "CreatedBy": this.loggedInUser.userid
    }
    this.isSpinner = false;
    this.spinner.show(this.spinnerRefs.hccityCofigDetailSection);
    this.hccityAuth.insertUpdateHCCity(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.hccityCofigDetailSection);
      console.log(resp);
      this.isSpinner = true;
      if (resp.StatusCode == 200) {
        this.selHCCity = [];
        this.toastr.success("City Created");
        this.getHCCities();
        this.clearForms();
      }
    }, (err) => {
      console.log("err in create HC city", err);
      this.spinner.hide(this.spinnerRefs.hccityCofigDetailSection);
      this.isSpinner = true;
    })
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  clearForms() {
    this.cardTitle = "Create City";
    this.actionLabel = "Save"
    setTimeout(() => {
      this.hcCityConfigForm.reset();
    }, 100);
  }
}
