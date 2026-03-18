// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { HcCityAuthService } from '../../services/hc-city-auth.service';
import { HcShareService } from '../../services/hc-share.service';
import { ZoneConfigService } from '../../services/zone-config.service';
import { HCCityAuthComponent } from '../hccity-auth/hccity-auth.component';

@Component({
  standalone: false,

  selector: 'app-zone-config',
  templateUrl: './zone-config.component.html',
  styleUrls: ['./zone-config.component.scss']
})
export class ZoneConfigComponent implements OnInit {
  ZonesList: any = [];
  cardTitle: string = "Create Zone";
  actionLabel: string = "Save";
  spinnerRefs = {
    hcZoneDetailSection: 'hcZoneDetailSection',
    hcZoneDetailFormSection: 'hcZoneDetailFormSection'
  }
  isSpinner: boolean = true;
  loggedInUser: UserModel;
  hcZoneConfigForm = this.fb.group({
    zoneCode: ['', Validators.compose([Validators.required])],
    zoneTitle: ['', Validators.compose([Validators.required])],
    zoneDescription: ['', ''],
    hcCityID: ['', Validators.compose([Validators.required])],
    LocId: ['', Validators.compose([Validators.required])],
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
  HCCities: any = [];
  branchList: any = [];
  selZoneDetail: any = [];
  searchInHCZone: any = "";
  constructor(private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private hcCityService: HcCityAuthService,
    private hcZoneService: ZoneConfigService,
    private lookupService: LookupService) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getHCCities();
    this.getBranches();
    this.getHCZones();
  }
  getHCCities() {
    this.ZonesList = []
    this.spinner.show(this.spinnerRefs.hcZoneDetailSection);
    this.hcCityService.getHCCities().subscribe((resp: any) => {
      console.log("resp", resp);
      this.spinner.hide(this.spinnerRefs.hcZoneDetailSection);
      if (resp && resp.PayLoad && resp.StatusCode == 200) {
        this.HCCities = resp.PayLoad;
        // HCCityID
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.hcZoneDetailSection);
    })
  }
  getBranches() {
    this.branchList = []

    this.lookupService.GetBranches().subscribe((resp: any) => {
      console.log("resp", resp);

      if (resp && resp.PayLoad && resp.StatusCode == 200) {
        this.branchList = resp.PayLoad;
        // HCCityID
      }
    }, (err) => {

    })
  }
  getHCZones() {
    this.ZonesList = []
    this.spinner.show(this.spinnerRefs.hcZoneDetailSection);
    this.hcZoneService.getZones().subscribe((resp: any) => {
      console.log("resp", resp);
      this.spinner.hide(this.spinnerRefs.hcZoneDetailSection);
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.ZonesList = resp.PayLoad;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.hcZoneDetailSection);
    })
  }
  getSelZoneDetail(zoneDet) {
    this.selZoneDetail = zoneDet.HCZoneID ? this.ZonesList.filter(a => { return a.HCZoneID == zoneDet.HCZoneID }) : null;
    if (this.selZoneDetail.length) {
      this.hcZoneConfigForm.patchValue({
        zoneCode: this.selZoneDetail[0].HCZoneCode ? this.selZoneDetail[0].HCZoneCode : null,
        zoneTitle: this.selZoneDetail[0].ZoneName ? this.selZoneDetail[0].ZoneName : null,
        zoneDescription: this.selZoneDetail[0].HCZoneDesc ? this.selZoneDetail[0].HCZoneDesc : null,
        hcCityID: this.selZoneDetail[0].HCCityID ? this.selZoneDetail[0].HCCityID : '',
        LocId: this.selZoneDetail[0].LocationIDs ? this.selZoneDetail[0].LocationIDs.split(',').map(Number) : '',
      });
      // this.hcZoneConfigForm.updateValueAndValidity();
      this.cardTitle = "Update Zone";
      this.actionLabel = "Update";

      // this.hcCityAuthForm.patchValue({
      //   hcCityID: authCityIds
      // })
      //     <ng-select   [multiple]="true" style="width: 100%;" formControlName="hcCityID" [items]="gcCitiesList"
      //     tabindex="2" bindLabel="Code" bindValue="HCCityID"
      //     [ngClass]="{'invalid': hcCityAuthForm.get('hcCityID').errors, 'invalid-highlighted': hcCityAuthForm.get('hcCityID').errors }"
      //     required>
      // </ng-select>

    }
  }
  InsertUpdateHCZone(zoneDet) {
    this.isSpinner = false;
    this.spinner.show(this.spinnerRefs.hcZoneDetailFormSection);
    let formValues = this.hcZoneConfigForm.getRawValue();
    let params = {
      HCZoneID: this.selZoneDetail.length ? this.selZoneDetail[0].HCZoneID : null,
      ZoneName: formValues.zoneTitle,
      HCZoneCode: formValues.zoneCode,
      HCZoneDesc: formValues.zoneDescription,
      HCCityID: formValues.hcCityID,
      LocIDs: String(formValues.LocId),
      CreatedBy: this.loggedInUser.userid
    }

    this.hcZoneService.insertUpdateHCZones(params).subscribe((resp: any) => {
      this.isSpinner = true;
      this.spinner.hide(this.spinnerRefs.hcZoneDetailFormSection);
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.toastr.success("Zone Successfully Added");
        this.getHCZones();
        if (!this.selZoneDetail.length)
          this.clearForms();
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.hcZoneDetailFormSection);
      this.isSpinner = false;
      console.log(err);
      this.toastr.error("Something Went Wrong")
    })

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  clearForms() {
    this.cardTitle = "Create City";
    this.actionLabel = "Save"
    setTimeout(() => {
      this.hcZoneConfigForm.reset();
    }, 100);
  }
}
