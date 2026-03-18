// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { RiderService } from '../../services/rider.service';

@Component({
  standalone: false,

  selector: 'app-hc-rider-dashboard',
  templateUrl: './hc-rider-dashboard.component.html',
  styleUrls: ['./hc-rider-dashboard.component.scss']
})
export class HcRiderDashboardComponent implements OnInit {

  //  parent = document.querySelector(".custom-container") as HTMLElement | null;
  // parent = document.getElementsByClassName(
  //   'custom-container',
  // ) as HTMLCollectionOf<HTMLElement>;
  startX: any;
  startY: any;
  scrollTop: any;
  isDown: any;
  RidersDetailList: any = [];
  @ViewChild('RiderCheckListModal') RiderCheckListModal;
  @ViewChild('riderPicModal') riderPicModal;
  spinnerRefs = {
    RiderDashboardSpinner: 'RiderDashboardSpinner',
    RiderCheckListSpinner: 'RiderCheckListSpinner',
  }
  RiderDashboardInfo: any = [];
  RiderCheckList: any = [];
  ZonesList: any = [];
  hczones: any = 0;
  hcCity: any = 0;
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
  HomeCollectionCites: any = [];
  selRiderImage: any = "";

  constructor(private riderSrv: RiderService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private HCService: HcDashboardService) { }

  ngOnInit(): void {
    this.homeCollectionCites();

    this.getRiderDashboardInfo();
  }
  ngAfterViewInit() {
  }
  onMouseMove(e) {
    if (parent != null) {
      console.log("mouse enter");
      const y = e.pageY - document.querySelector<HTMLElement>(".custom-container").offsetTop;
      const walkY = (y - this.startY) * 5;
      document.querySelector<HTMLElement>(".custom-container").scrollTop = this.scrollTop - walkY;
    }
  }
  hcCitychange() {
    this.hczones = "";
    this.getZonesByHCCityId(this.hcCity);
  }
  homeCollectionCites() {
    this.HCService.getHCCities().subscribe((resp: any) => {
      this.HomeCollectionCites = resp.PayLoad;
    }, (err) => {
      console.log(err);
    })
  }

  onMouseDown(e) {
    console.log("mouse down");
    this.isDown = true;
    this.startY = e.pageY - document.querySelector<HTMLElement>(".custom-container").offsetTop;
    this.scrollTop = document.querySelector<HTMLElement>(".custom-container").scrollTop
  }

  getRiderDashboardInfo() {
    this.RiderDashboardInfo = [];
    this.spinner.show(this.spinnerRefs.RiderDashboardSpinner);
    let params = {
      HCZoneID: this.hczones ? this.hczones.join(',') : "1",
      RiderID: null,
      HCCityIds: this.hcCity ? this.hcCity.join(',') : null
    }
    this.riderSrv.getRiderDashboardInfo(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.RiderDashboardSpinner);
      console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoadDS.Table.length) {
        this.RiderDashboardInfo = resp.PayLoadDS.Table;
      }
      this.RiderDashboardInfo = resp.PayLoadDS.Table.map((item, i) => Object.assign({}, resp.PayLoadDS.Table1[i], item ))
      console.log("mergedata", this.RiderDashboardInfo);
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.RiderDashboardSpinner);
      this.toastr.error("something went wrong")
      console.log(err)
    })
  }

  getZonesByHCCityId(hccity) {
    if (this.hcCity) {
      let params = {
        HCCityIDs: this.hcCity.join(',')
      }
      this.HCService.GetZonesByHCCityID(params).subscribe((resp: any) => {
        console.log("Zones by city ID ", resp);
        if (resp && resp.PayLoad && resp.StatusCode) {
          this.ZonesList = resp.PayLoad;
        }
        else {

        }
      }, (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong")
      })
    }
    else {
      this.toastr.error("Please Select City First")
    }
  }
  getRiderQCheckList(riderid) {
    this.spinner.show(this.spinnerRefs.RiderDashboardSpinner);

    let params = {
      RiderID: riderid,
      CurrentDate: moment().format('YYYY/MM/DD')
    }
    console.log(params);

    this.riderSrv.getRiderQCheckList(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.RiderDashboardSpinner);
      console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.RiderCheckList = resp.PayLoad;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.RiderDashboardSpinner);
      this.toastr.error("something went wrong")
      console.log(err)
    })
  }


  OpenRiderCheckList(riderId) {    
    this.getRiderQCheckList(riderId)
    this.appPopupService.openModal(this.RiderCheckListModal), { size: 'md' };
  }

  closeLoginModal() {
    this.appPopupService.closeModal();
  }

  OpenRiderFullImage(selRider) {
    this.selRiderImage = selRider.RiderPicBase64
    this.appPopupService.openModal(this.riderPicModal), { size: 'sm' };
  }

}
