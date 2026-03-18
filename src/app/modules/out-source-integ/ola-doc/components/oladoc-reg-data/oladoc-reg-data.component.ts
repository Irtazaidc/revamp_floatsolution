// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-oladoc-reg-data',
  templateUrl: './oladoc-reg-data.component.html',
  styleUrls: ['./oladoc-reg-data.component.scss']
})
export class OladocRegDataComponent implements OnInit {

  @Input() formParams: object = {}
  OlaRptData: any = [];

  constructor(private sharedSrv: SharedService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    console.log("formParams", this.formParams);
    this.getOlaDocRegData(this.formParams);
  }
  getOlaDocRegData(formParams) {
    let params = {
      "DateFrom": Conversions.formatDateObject(formParams.dateFrom),
      "DateTo": Conversions.formatDateObject(formParams.dateTo),
      "MobileNo": formParams.mobileno ? formParams.mobileno : null,
      "RptType": 1
    }
    console.log(params);
    this.sharedSrv.getData(API_ROUTES.GET_OLADOC_DATA, params).subscribe({
      next: (resp: any) => {
        console.log(resp);
        if (resp && resp.StatusCode == 200) {
          this.OlaRptData = JSON.parse(resp.PayLoadStr);
        }
        else {

        }
      }, error: (err: any) => {

      }, complete: () => { }
    })
  }

}
