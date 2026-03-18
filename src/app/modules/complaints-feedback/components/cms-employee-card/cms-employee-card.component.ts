// @ts-nocheck
import { Component, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { RiderService } from 'src/app/modules/home-sampling/services/rider.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { PatientService } from 'src/app/modules/patient-booking/services/patient.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ComplaintDashboardService } from '../../services/complaint-dashboard.service';
import { EmployeeService } from 'src/app/modules/emp-profile/services/employee.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-cms-employee-card',
  templateUrl: './cms-employee-card.component.html',
  styleUrls: ['./cms-employee-card.component.scss']
})
export class CmsEmployeeCardComponent implements OnInit  {

  @Input('PatientData') patientData: any = {};
  @Input('UserID') UserID: number;

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  empList: any = [];

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
    employeesLoadingSection: 'employeesLoadingSection',
    empPic:'empPic',
  }

  constructor(
    private spinner: NgxSpinnerService,
    private complaintService: ComplaintDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private empService: EmployeeService, 
    private helper: HelperService, 
  ) {
  }

  ngOnInit(): void {
    this.getEmployeeData(this.UserID);
    this.getEmpPicByUserId(this.UserID);
    // this.getRider(0);
  }

  getEmployeeData(UserID) {
    // this.spinner.show(this.spinnerRefs.listSection);
    this.empList = [];
    let objParm = {
      UserID: UserID
    }
    this.complaintService.getEmplyoyeeCardInfo(objParm).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        this.empList = res.PayLoad[0];
        console.log("Employee Card Component this.empListt:", this.empList);
      }
    }, (err) => {
      console.log("err", err);
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
  empUserPicture
  getEmpPicByUserId(UserID){
    this.spinner.show(this.spinnerRefs.empPic);
    let paramObj = {
      UserID:UserID
    }
    this.empService.getEmpPicByUserId(paramObj).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.empPic);
      let empUserPic=resp.PayLoad || [];
      empUserPic=this.helper.formateImagesData( empUserPic,'EmployeePic');
      this.empUserPicture=empUserPic[0].EmployeePic;
    }, (err) => {
      console.log(err)
    })
  }

}
