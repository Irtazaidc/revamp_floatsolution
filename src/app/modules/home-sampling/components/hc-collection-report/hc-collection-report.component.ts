// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { RiderService } from '../../services/rider.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';


@Component({
  standalone: false,

  selector: 'app-hc-collection-report',
  templateUrl: './hc-collection-report.component.html',
  styleUrls: ['./hc-collection-report.component.scss']
})
export class HcCollectionReportComponent implements OnInit {


  isSpinner = true;
  disabledButton = false;

  sampleCollectionReportForm: FormGroup;
  sampleCollectionList: any = [];
  requestComparison: any = [];
  isSubmitted = false;
  searchText = '';
  loggedInUser: UserModel;
  maxDate: any;
  today : NgbDate = this.calendar.getToday();
  oneDayEarlier : NgbDate = this.calendar.getPrev(this.today, 'd', 1);
  noComparisonDataMessage = 'Please select user';
  HomeCollectionCites: any = [];
  disableSearchButton = true;

  hczones: any = 0;
  hcCity: any = 0;
  ZonesList: any = [];
  RiderList = [];
  RidersDetailListInParam: any = [];
  showRiderSchedule = false;
  isDisable = false;

  SelRider: any = {
    "selRiderID": '',
    "selRiderName": '',
    "selRiderContactNumber": '',
  };

  spinnerRefs = {
    SampleCollectionSection: "SampleCollectionSection",
    listSection: 'listSection', 
  }
  

  constructor(
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private calendar: NgbCalendar,
    private lookupService: LookupService,
    private HCService: HcDashboardService,
    private riderService: RiderService,
  ) { }

  ngOnInit(): void {
    this. RidersDetailF();
    this.homeCollectionCites();

    this.sampleCollectionReportForm = this.formBuilder.group({
      dateFrom: [this.oneDayEarlier, Validators.required ],
      dateTo: [this.today,  Validators.required],
      rider: [null, ''],

    });
    this.maxDate = Conversions.getCurrentDateObject();

  }



  private formatDate(ngbDate: NgbDateStruct): string {
    if (!ngbDate) return "";
    const { year, month, day } = ngbDate;
    return `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
  }


  getSampleCollectionReport() {

    const formValues = this.sampleCollectionReportForm.getRawValue();
formValues.dateFrom = formValues.dateFrom
  ? Conversions.formatDateObject(formValues.dateFrom)
  : null;
formValues.dateTo = formValues.dateTo
  ? Conversions.formatDateObject(formValues.dateTo)
  : null;

if (this.sampleCollectionReportForm.invalid) {
  this.toastr.warning("Please Fill The Mandatory Fields");
  this.sampleCollectionList = [];
  this.isSubmitted = true;
  return;
}

if (formValues.dateFrom && formValues.dateTo) {
  const dateFrom = new Date(formValues.dateFrom);
  const dateTo = new Date(formValues.dateTo);

  // Check if DateTo is earlier than DateFrom
  if (dateTo < dateFrom) {
    this.toastr.error("DateTo should be equal or greater than DateFrom");
    this.sampleCollectionList = [];
    this.isSubmitted = true;
    return;
  }

  // Check if the selected date range exceeds one month
  const oneMonthLimit = new Date(dateFrom);
  oneMonthLimit.setMonth(dateFrom.getMonth() + 1);

  if (dateTo > oneMonthLimit) {
    this.toastr.warning(
      "You can only fetch data for up to one month. Please adjust your date range."
    );
    this.sampleCollectionList = [];
    this.isSubmitted = true;
    return;
  }

  this.isDisable = true;
}


    const objParm = {
      DateFrom: formValues.dateFrom,    
      DateTo: formValues.dateTo,
      RiderID: formValues.rider !== ""  ? formValues.rider : null  
    };
    this.isSpinner = true;
    this.spinner.show();
    

    this.HCService.GetRiderNotCollectedSamples(objParm).subscribe((resp: any) => {
      this.isDisable = false;
      this.spinner.hide(this.spinnerRefs.SampleCollectionSection)
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.sampleCollectionList = resp.PayLoad;
        this.isSpinner = false;
        this.spinner.hide();
      }
      else{
        this.toastr.warning('No Record Found');
        this.sampleCollectionList = [ ];
        this.isSpinner = false;
        this.spinner.hide();
      }
    }, (err) => {
      this.isSpinner = false;
      this.spinner.hide();
      console.log(err)
    });
  }




  homeCollectionCites() {
    this.HCService.getHCCities().subscribe((resp: any) => {
      this.HomeCollectionCites = resp.PayLoad;
    }, (err) => {
      console.log(err);
    })
  }
  currentCityID= null
  getCityId(event){
event ? this.currentCityID = event.HCCityID:null
  }

  RidersDetailF() {

    const params = {
      RiderID: 0,
      LocID: this.currentCityID
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailListInParam = resp.PayLoad;

    }, (err) => { console.log(err) })
  }

  isDateInvalid(dateControlName: string): boolean {
    const control = this.sampleCollectionReportForm.get(dateControlName);
    if (control && control.value) {
      const selectedDate = new Date(Conversions.formatDateObject(control.value));
      const maxValidDate = new Date();
  
      if (selectedDate > maxValidDate) {
        return true;
      }
    }
    return false;
  }


}
