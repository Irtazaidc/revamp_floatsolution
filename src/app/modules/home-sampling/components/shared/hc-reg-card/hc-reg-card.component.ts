// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HcSharedService } from '../../../services/hc-shared.service';

@Component({
  standalone: false,

  selector: 'app-hc-reg-card',
  templateUrl: './hc-reg-card.component.html',
  styleUrls: ['./hc-reg-card.component.scss']
})
export class HcRegCardComponent implements OnInit {


  @Input('bookingid') bookingid: number;
  @Input('requestid') requestid: number;
  hcRegDetail: any;
  constructor(private spinner: NgxSpinnerService,
    private shared: HcSharedService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.gethcRegDetail();
    console.log(" ngOnInit bookingid at hc reg card", this.bookingid);
  }

  gethcRegDetail() {
    this.spinner.show();
    let params = {
      "BookingID": this.bookingid
    }
    this.shared.hcRegDetail(params).subscribe((resp: any) => {
      console.log("Data", resp);
      this.spinner.hide();
      if (resp.StatusCode == 200 && resp.PayLoad) {
        console.log(resp.PayLoad)
        this.hcRegDetail = resp.PayLoad[0];
        console.log(" this.hcRegDetail", this.hcRegDetail);
        // this.bookedTestNames = resp.PayLoadDS.Table1.length ? resp.PayLoadDS.Table1.map(a => { return a.Code }).join(',') : null
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.show("Something Went Wrong");
      console.log(err);
    });

  }


}
