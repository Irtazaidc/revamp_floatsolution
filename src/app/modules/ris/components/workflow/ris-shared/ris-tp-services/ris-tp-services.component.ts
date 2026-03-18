// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-ris-tp-services',
  templateUrl: './ris-tp-services.component.html',
  styleUrls: ['./ris-tp-services.component.scss']
})
export class RisTpServicesComponent implements OnInit {
  @Input() VisitId=null;
  constructor(
    private sharedService: SharedService,
    private toastr: ToastrService
  ) { }
    VisitID = null;
  ngOnInit(): void {
    this.VisitID = this.VisitId;
    this.getRISServicesByVisitIDAll();
  }

  RISServices = []
  getRISServicesByVisitIDAll() {
    this.RISServices = [];
    let params = {
      VisitID: this.VisitId,
      isShowAllService:1
    };
    this.sharedService.getData(API_ROUTES.GET_RISSERVICES_BY_VISITID, params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        let services = res.PayLoad || [];
        let result = services.reduce((re, o) => {
          let existObj = re.find(
            obj => obj.TPID === o.TPID
          )

          if (existObj) {
            existObj.services.push({
              StoreItemID: o.StoreItemID,
              Quantity: o.Quantity,
              ConsumedQuantity: o.Quantity,
              StoreItem: o.StoreItem
              // ,MeasurintUnit: o.MeasurintUnit

            })
          } else {
            re.push({
              TPID: o.TPID,
              TPCode: o.TPCode,
              TPName: o.TPName,
              StatusID: o.StatusID,
              RISStatusID: o.RISStatusID,
              services: [{
                StoreItemID: o.StoreItemID,
                Quantity: o.Quantity,
                ConsumedQuantity: o.Quantity,
                StoreItem: o.StoreItem
                // ,MeasurintUnit: o.MeasurintUnit
              }]
            })
          }
          return re
        }, []);
        this.RISServices = result;
        // console.log("this.RISServicesAll__________", this.RISServices)

      } else {
        this.RISServices = [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }

}
