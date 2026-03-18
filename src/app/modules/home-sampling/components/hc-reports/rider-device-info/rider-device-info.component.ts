// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { HcDashboardService } from '../../../services/hc-dashboard.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ChartDataSets, ChartOptions } from 'chart.js';
@Component({
  standalone: false,

  selector: 'app-rider-device-info',
  templateUrl: './rider-device-info.component.html',
  styleUrls: ['./rider-device-info.component.scss']
})
export class RiderDeviceInfoComponent implements OnInit {

  loggedInUser: UserModel;
  isSubmitted = false;
  maxDate: any;
  RidersDetailListInParam = [];
  riderRoutinePic = null;
  ImageUrl = 'assets/images/brand/no-image.png';
  RiderDevieInfoList = []
  deviceSummary: any[] = [];
  spinnerRefs = {
    RiderTable: 'RiderTable',
  }

  public Fields = {
    dateFrom: ['', Validators.required],
    RiderId: [, Validators.required],
  };

  filterForm: FormGroup = this.formBuilder.group(this.Fields)

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private HCService: HcDashboardService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.filterForm.patchValue({ dateFrom: Conversions.getCurrentDateObject(), });
      this.RidersDetailF();
    }, 500);
    this.maxDate = Conversions.getCurrentDateObject()
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    console.log("loggedInUser", this.loggedInUser)
  }

  getRiderRoutineData() {
    this.riderRoutinePic = []
    this.ImageUrl = 'assets/images/brand/no-image.png';
    this.RiderDevieInfoList = []
    let formValues = this.filterForm.getRawValue();

    if (this.filterForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    let objParm = {
      DeviceDate: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      UserID: formValues.RiderId || -99, //10045,
    };
    // console.log("params:",objParm)

    this.spinner.show(this.spinnerRefs.RiderTable);
    this.HCService.GetRiderDeviceInfo(objParm).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.RiderTable)
      if (resp.StatusCode == 200 && resp.PayLoad?.length) {
        this.RiderDevieInfoList = resp.PayLoad || [];
        this.prepareCharts(this.RiderDevieInfoList);
      }
      else {
        this.toastr.warning('No Record Found');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.RiderTable);
      this.toastr.error('Connection Error');
      console.log(err)
    });
  }

  RidersDetailF() {

    let params = {
      RiderID: 0,
      LocID:null //this.loggedInUser.locationid || null,
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailListInParam = resp.PayLoad;
      // console.log("riders :",this.RidersDetailListInParam)

    }, (err) => { console.log(err) })
  }


  timelineLabels: string[] = [];

  timelineChartData: { data: number[]; label: string }[] = [
    {
      data: [],
      label: 'Battery %'
    }
  ];

  timelineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{ display: true }],
      yAxes: [{ ticks: { beginAtZero: true } }]
    }
  };

  prepareCharts(data: any[]) {

    const sorted = [...data].sort((a, b) =>
      new Date(b.CreatedOn).getTime() - new Date(a.CreatedOn).getTime()
    );

    // Device Summary (Latest record per device)
    const deviceMap = {};

    sorted.forEach(x => {
      if (!deviceMap[x.DeviceName]) {
        deviceMap[x.DeviceName] = x;
      }
    });

    this.deviceSummary = Object.values(deviceMap);


    // Timeline Chart
    const devices: string[] = [...new Set(sorted.map(x => x.DeviceName))];

    this.timelineLabels = sorted.map(x =>
      new Date(x.CreatedOn).toLocaleTimeString()
    );

    this.timelineChartData = devices.map((device: string) => {

      const deviceData: number[] = sorted
        .filter(x => x.DeviceName === device)
        .map(x => x.BatteryPercentage);

      return {
        data: deviceData,
        label: device
      };

    });

  }
}
