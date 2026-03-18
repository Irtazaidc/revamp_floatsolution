// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PizzaPartyComponent } from 'src/app/modules/material/popups-and-modals/snackbar/pizza-party.component';
import { HcDashboardService } from '../../services/hc-dashboard.service';

@Component({
  standalone: false,

  selector: 'app-hcdashboard',
  templateUrl: './hcdashboard.component.html',
  styleUrls: ['./hcdashboard.component.scss']
})
export class HCDashboardComponent implements OnInit {
  RequestCounts: any = [];
  BookingSourceCounts: any = [];
  BookingSourceWhatsapCounts: any = 0;
  BookingSourceCallCenterCounts: any = 0;
  BookingSourceOnlineEmailCounts: any = 0;
  BookingSourceEmpReqCounts: any = 0;
  BookingSourceOtherCounts: any = 0;

  constructor(private HCService: HcDashboardService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getHCDashboardCounts();
  }

  getHCDashboardCounts() {
    this.HCService.getHCDashboardCounts().subscribe((resp: any) => {
      
      console.log(resp);
      if (resp.StatusCode == 200 && resp.PayLoadDS) {
        this.RequestCounts = resp.PayLoadDS.Table[0];
        this.BookingSourceCounts = resp.PayLoadDS.Table1;
        this.BookingSourceWhatsapCounts = resp.PayLoadDS.Table1.filter(a=> { return a.BookingSourceID==1 });
        this.BookingSourceCallCenterCounts = resp.PayLoadDS.Table1.filter(a=> { return a.BookingSourceID==2 });
        this.BookingSourceOnlineEmailCounts = resp.PayLoadDS.Table1.filter(a=> { return a.BookingSourceID==3 });
        this.BookingSourceEmpReqCounts = resp.PayLoadDS.Table1.filter(a=> {return a.BookingSourceID==4 });
        this.BookingSourceOtherCounts = resp.PayLoadDS.Table1.filter(a=> {return a.BookingSourceID==5 });
        console.log(this.BookingSourceCallCenterCounts);
      }
    }, (err) => { console.log(err) })
  }

}
