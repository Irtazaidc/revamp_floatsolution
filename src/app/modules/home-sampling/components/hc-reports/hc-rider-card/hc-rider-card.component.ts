// @ts-nocheck
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PatientService } from 'src/app/modules/patient-booking/services/patient.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { RiderService } from '../../../services/rider.service';

@Component({
  standalone: false,

  selector: 'app-hc-rider-card',
  templateUrl: './hc-rider-card.component.html',
  styleUrls: ['./hc-rider-card.component.scss']
})
export class HcRiderCardComponent implements OnInit {

  @Input('PatientData') patientData: any = {};
  @Input('riderId') riderId: number;

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  RiderList: any = [];

  FullName: string;
  EmpNo: number;
  Cell: string
  Status: number;
  CNIC: any;
  RiderCell: any;
  Email: any;

  spinnerRefs = {
    formSection: 'formSection',
    listSection: 'listSection',
    employeesLoadingSection: 'employeesLoadingSection'
  }

  constructor(
    private spinner: NgxSpinnerService,
    private riderService: RiderService,
  ) {
  }

  ngOnInit(): void {
    /// console.log('sdfsfdsfd ', this.patientData);
    this.getRider(this.riderId);
    // this.getRider(0);
  }

  getRider(riderId) {
    // this.spinner.show(this.spinnerRefs.listSection);
    this.RiderList = [];
    let objParm = {
      RiderID: riderId
    }
    this.riderService.getRider(objParm).subscribe((res: any) => {

      if (res.StatusCode == 200) {
        this.RiderList = res.PayLoadDS.Table[0] || [];
        console.log("HcRiderCardComponent this.RiderList:", this.RiderList);

        // this.FullName = this.RiderList[0].RiderFullName;
        // this.EmpNo = this.RiderList[0].RiderEmpNo;
        // this.Cell = this.RiderList[0].RiderCell;
        // this.Status = this.RiderList[0].RiderStatusID;
        // this.CNIC = this.RiderList[0].CNIC;
        // this.RiderCell = this.RiderList[0].RiderCell;
        // this.Email = this.RiderList[0].Email;

      }
    }, (err) => {
      console.log("loading search result error", err);
    })
    // this.spinner.hide(this.spinnerRefs.listSection);
  }

  calculateAge(birthday) { // birthday is a date
    // birthday = new Date(birthday)
    // var ageDifMs = Date.now() - birthday.getTime();
    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
    // return Math.abs(ageDate.getUTCFullYear() - 1970);
    let obj = { days: 0, months: 0, years: 0 }
    if (!moment(birthday).isValid()) {
      return obj;
    }
    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    let bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    let currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if (diffDays > 364) {
      obj.years = Math.floor(diffDays / 364);
    } else if (diffDays >= 30) {
      obj.months = Math.floor(diffDays / 30);
      // if(obj.months >= 12) {obj.months = 0; obj.years = 1}
    } else {
      obj.days = diffDays;
    }
    // console.log(diffDays, obj);
    /*
    this.patientBasicInfo.patchValue({
      //Age: obj.years ? (obj.years + ' years') : obj.months ? (obj.months + ' months') : (obj.days + 'days')
      Age: obj.years ? obj.years : obj.months ? obj.months : obj.days
    });
    this.patientBasicInfo.patchValue({
      dmy: obj.years ? '3' : obj.months ? '2': '1'
    });
    */
    return obj;
  }

  convertDate(date) {
    /// console.log('ccccc ', date);
    let dateToReturn = '';
    if (!date) {
      return dateToReturn;
    }
    if (typeof (date) === 'string') {
      dateToReturn = moment(date).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
    } else if (typeof (date) === 'object') {
      dateToReturn = moment(Conversions.formatDateObjectToString(date), 'MM/DD/YYYY HH:mm:ss').format(CONSTANTS.DATE_TIME_FORMAT.DATE);
      // dateToReturn = moment(Conversions.formatDateObjectToString(date)).format(CONSTANTS.DATE_TIME_FORMAT.DATE);
    }
    if (dateToReturn == 'Invalid date') {
      dateToReturn = date;
    }
    return dateToReturn;
    // console.log('dateeeeeee ', moment(date).format(CONSTANTS.DATE_TIME_FORMAT.DATE));
    // console.log('dateeeeeee ', moment(Conversions.formatDateObjectToString(date)).format(CONSTANTS.DATE_TIME_FORMAT.DATE));
    // return date.day + '-' + date.month + '-' + date.year;
  }

}
