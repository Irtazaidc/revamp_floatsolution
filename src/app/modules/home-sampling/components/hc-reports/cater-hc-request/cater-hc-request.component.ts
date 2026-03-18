// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { HcSharedService } from '../../../services/hc-shared.service';

@Component({
  standalone: false,

  selector: 'app-cater-hc-request',
  templateUrl: './cater-hc-request.component.html',
  styleUrls: ['./cater-hc-request.component.scss']
})
export class CaterHcRequestComponent implements OnInit {
  bookingDetailsList:any;
  constructor(
    private HcReqSharedService: HcSharedService,
  ) {
   }

  ngOnInit(): void {
    this.getHCBookingDeatil();
  }

  truncate(source, size) {
    return source.length > size ? source.slice(0, size - 1) + "…" : source;
  }
  getActionDetails(rowData){
  console.log("🚀CaterHcRequestComponent ~ getActionDetails ~ rowData:", rowData)

  }
  getHCBookingDeatil() {
    // let params = {
    //   DateFrom: 'F',
    //   DateTo: 'T',
    // }
    this.HcReqSharedService.getHCBookingRequestsByCCR().subscribe((resp: any) => {
      console.log(resp);
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.bookingDetailsList = resp.PayLoad;
      }

    }, (err) => {
      console.log(err)
    })


  }
}
