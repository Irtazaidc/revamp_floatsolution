// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { VisitService } from 'src/app/modules/patient-booking/services/visit.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { HcSharedService } from '../../../services/hc-shared.service';

@Component({
  standalone: false,

  selector: 'app-hc-registration-details',
  templateUrl: './hc-registration-details.component.html',
  styleUrls: ['./hc-registration-details.component.scss']
})
export class HcRegistrationDetailsComponent implements OnInit {

  @Input() visitID: any;
  @Input() bookingid: number;
  @Input() requestid: number;
  @Input() multipleBookingIds: any = "";
  @Input() selBookingID: any = null;
  hcRegInfo: any = [];
  bookedTestNames: any = [];
  constructor(private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private shared: HcSharedService
  ) { }

  ngOnInit(): void {
    this.getRegDetailByBookingID()
  }

  getRegDetailByBookingID() {
    this.spinner.show();
    if (this.bookingid) {
      const params = {
        "HCBookingPatientID": this.selBookingID || this.bookingid || this.multipleBookingIds
      }
      this.shared.bookingDetailByBookingID(params).subscribe((resp: any) => {
        console.log("Data", resp);
        this.spinner.hide();
        if (resp.StatusCode == 200 && resp.PayLoadDS) {
          console.log(resp.PayLoadDS)
          this.hcRegInfo = resp.PayLoadDS.Table[0];
          this.bookedTestNames = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1.map(a => { return a.Code }).join(',') : null
        }
      }, (err) => {
        this.spinner.hide();
        this.toastr.show("Something Went Wrong");
        console.log(err);
      });
    }
    // else if (this.hcBookingInfoDT) {
    //   this.hcRegInfo = this.hcBookingInfoDT;
    // }
  }



}
