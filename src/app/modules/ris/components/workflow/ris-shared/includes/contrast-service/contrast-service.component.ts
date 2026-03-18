// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-contrast-service',
  templateUrl: './contrast-service.component.html',
  styleUrls: ['./contrast-service.component.scss']
})
export class ContrastServiceComponent implements OnInit {
  VisitID: any = null;
  @Input() payload = {
    VisitID: null
  };
  constructor(
    private toastr: ToastrService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.VisitID = this.payload.VisitID;
    this.getRISServicesByVisitIDAll();
  }

  contrastServices = null;
  RISServices = []
  getRISServicesByVisitIDAll() {
    this.RISServices = [];
    let params = {
      VisitID: this.VisitID,
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

            })
          } else {
            re.push({
              TPID: o.TPID,
              TPCode: o.TPCode,
              TPName: o.TPName,
              StatusID: o.StatusID,
              RISStatusID: o.RISStatusID,
              SubSectionId: o.SubSectionId,
              services: [{
                StoreItemID: o.StoreItemID,
                Quantity: o.Quantity,
                ConsumedQuantity: o.Quantity,
                StoreItem: o.StoreItem
              }]
            })
          }
          return re
        }, []);
        this.RISServices = result;
        let contrasts = this.RISServices.length ? this.RISServices.filter(f => f.SubSectionId == 47) : null;
        this.contrastServices = (contrasts && contrasts.length) ? contrasts.map(service => service.TPName) : null;

      } else {
        this.RISServices = [];
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })
  }


}
