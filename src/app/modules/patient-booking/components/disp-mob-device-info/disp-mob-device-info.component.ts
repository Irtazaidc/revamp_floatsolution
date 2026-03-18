// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from '../../services/lookup.service';

@Component({
  standalone: false,

  selector: 'app-disp-mob-device-info',
  templateUrl: './disp-mob-device-info.component.html',
  styleUrls: ['./disp-mob-device-info.component.scss']
})
export class DispMobDeviceInfoComponent implements OnInit {
  @Input('PatientId') patientId: number = null;
  @Input('PatientId') notificationnData: number = null;
  MobDeviceNotificationsList: any = [];

  constructor(private lookupSrv: LookupService, private toastr: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    if (this.patientId)
      this.getMobileDeviceTokenByPatientID();
  }

  getMobileDeviceTokenByPatientID() {
    let params = {
      "PatientID": this.patientId || 65239405
    }
    this.lookupSrv.getMobileDeviceTokensByPatientID(params).subscribe((resp: any) => {
      console.log("MobDeviceNotificationsList", resp);
      if (resp && resp.PayLoadDS && resp.StatusCode == 200) {
        this.MobDeviceNotificationsList = resp.PayLoadDS.Table
      }
    }, (err) => {
      console.log("err", err);
      this.toastr.error("Something Went Wrong")
    })
  }
}
