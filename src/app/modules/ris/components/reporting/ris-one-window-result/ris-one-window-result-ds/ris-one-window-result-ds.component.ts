// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { PatientService } from 'src/app/modules/patient-booking/services/patient.service';
import { RisReportingService } from 'src/app/modules/ris/services/ris-reporting.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { VisitResultService } from 'src/app/modules/visit-result-entry/services/visit-result.service';
import { environment } from 'src/environments/environment';

@Component({
  standalone: false,

  selector: 'app-ris-one-window-result-ds',
  templateUrl: './ris-one-window-result-ds.component.html',
  styleUrls: ['./ris-one-window-result-ds.component.scss']
})
export class RisOneWindowResultDsComponent implements OnInit {

  loggedInUser: UserModel;

  searchVisitsForm = this.fb.group({
    branchIds: [0],
    fromDate: [''],
    toDate: [''],
    statusId: [0]
  });
  spinnerRefs = {
    patientInfoBar: 'patientInfoBar',
    visitResults: 'visitResults',
    patientRecord: 'patientRecord'
  }


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
  testStatusList: any = [];
  branchesList: any = [];
  visitTestsList: any = [];
  visitsList: any = [];
  selectedVisit: any = '';
  pinFilterString: any;
  patientBasicInfo: any = {};
  screenPermissionsObj: any = {};
  result: any = null;
  tpid: any = null;
  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private reporting: RisReportingService,
    private patientService: PatientService,
    private visitResultsService: VisitResultService,
  ) { }

  ngOnInit(): void {
    this.searchVisitsForm.patchValue({
      fromDate: Conversions.getCurrentDateObject(),
      toDate: Conversions.getCurrentDateObject()
    });
    this.loadLoggedInUserInfo();
    this.getTestStatus();
    this.getBranches();
  }

  getVisitsForResultEntry(visitid = '') {
    let formValues = this.searchVisitsForm.getRawValue();
    let params = {
      locationIds: (formValues.branchIds || [this.loggedInUser.locationid]).join(','),
      statusIds: formValues.statusId || "", // 9 for report
      fromDate: formValues.fromDate ? Conversions.formatDateObject(formValues.fromDate) : '',
      toDate: formValues.toDate ? Conversions.formatDateObject(formValues.toDate, 'end') : ''
    };
    this.spinner.show(this.spinnerRefs.patientRecord);
    this.reporting.GetVisitForImagingOneWindow(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.patientRecord);
      console.log(resp);
      if (resp.StatusCode == 200 && resp && resp.PayLoad.length) {
        this.visitsList = resp.PayLoad;
        this.selectedVisit = resp.PayLoad[0];
        this.visitSelectedEvent(this.selectedVisit);
      }

    }, (err) => {
      console.log('err', err)
      this.toastr.error("Someting Went Wrong")
      this.spinner.hide(this.spinnerRefs.patientRecord);
    })
  }
  visitSelectedEvent(selVisit) {
    this.selectedVisit = selVisit;
    this.getVisitTestsByVisitId(selVisit);
  }

  getVisitTestsByVisitId(visit) {
    this.visitTestsList = [];
    this.selectedVisit = visit;
    this.patientBasicInfo = {};
    this.cd.detectChanges();
    if (!visit || !visit.VisitId) {
      return;
    }
    this.searchPatient(visit.PatientId);
    let params = {
      visitId: visit.VisitId, // '201101056967', // '210301074271', //visit.VisitId,
      tpId: '1215'
    };
    this.spinner.show(this.spinnerRefs.visitResults);
    this.visitResultsService.getVisitTestsByVisitId(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitResults);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        console.log(data);
        this.visitTestsList = data || [];
        console.log("visitTestsList", this.visitTestsList);
        if (this.visitTestsList.length == 1) {
          setTimeout(() => {
            this.selectAllTestResults({ target: { checked: true } });
          }, 100);
          this.result = this.visitTestsList[0].Result ? this.visitTestsList[0].Result : this.visitTestsList[0].Answer ? this.visitTestsList[0].Answer.replace(/ mg\/dL/g, '') : null;
          this.tpid = this.visitTestsList[0].TPID
        }
      }
    }, (err) => {
      this.toastr.error('Error loading Tests data');
      this.spinner.hide(this.spinnerRefs.visitResults);
      console.log(err);
    });
  }

  openReport() {
    // this.toastr.success('Report opened', 'Success', {positionClass: 'toast-top-center'});
    const url = environment.patientReportsPortalUrl + 'pr?' + btoa(`VisitId_MC=${this.selectedVisit.VisitId}&LoginName_MC=${this.loggedInUser.username}&appName='WebMedicubes:results_entry'&ts_cache=${+new Date()}`);
    window.open(url.toString(), '_blank');
  }

  selectAllTestResults(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.visitTestsList.forEach(a => {
      a.checked = false;
      // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
      if (a.StatusId > 0 && a.StatusId <= 8) {
        a.checked = e.target.checked;
      }
    })
  }


  saveFinalResult() {
    console.log('this.selectedVisit ', this.selectedVisit);
    // if(!this.selectedVisit || !this.selectedVisit.VisitId) {
    //   return;
    // }
    // if(!this.visitTestsList.length || this.visitTestsList.find( a => !a.Result)) {
    //   // alert('Please enter result(s)');
    //   this.toastr.warning('Please enter result(s)');
    //   return;
    // }
    // let params = {
    //   visitId: this.selectedVisit.VisitId,
    //   tpId: 2177,
    //   userId: this.loggedInUser.userid,
    //   statusId: 9
    // };

    if (!this.selectedVisit || !this.selectedVisit.VisitId) {
      return;
    }
    let testResultsToSave = [];
    this.visitTestsList.forEach(a => {
      let _obj = { ...a };

      if (_obj.checked) {
        testResultsToSave.push(_obj);
      }
      testResultsToSave[0].Result = this.result;
    });

    if (!testResultsToSave.length) {
      this.toastr.warning('Please select atleat one test');
      return;
    }

    if (testResultsToSave.find(a => !a.Result)) {
      // alert('Please enter result(s)');
      this.toastr.warning('Please enter result(s)');
      return;
    }
    // let params = {
    //   visitId: this.selectedVisit.VisitId,
    //   tpId: 2177,
    //   userId: this.loggedInUser.userid,
    //   result: testResultsToSave[0].Result
    // };
    let _params = {
      UserId: this.loggedInUser.userid,
      VisitId: this.selectedVisit.VisitId,
      TPId: this.tpid,
      Result: '',
      TestResults: []
    }
    testResultsToSave.forEach(tp => {
      let _obj = {
        VisitID: this.selectedVisit.VisitId,
        TestID: tp.TPID,
        ParamID: tp.ParamID,
        Result: tp.Result
        // StatusID: 9
      }
      if (tp.checked) {
        _params.TestResults.push(_obj);
      }
    });
    this.spinner.show();
    this.visitResultsService.updatePatientVisitTestStatusFoRIS(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        let result = JSON.parse(res.PayLoadStr)
        if (result[0].Result == 1) {
          this.toastr.success(res.Message);
        }
        else if (result[0].Result == 2) {
          this.toastr.error(res.Message);
        }
        else {
          this.toastr.error(res.Message);
        }
        // this.toastr.success('Data Saved', 'Success', {positionClass: 'toast-top-center'});
        this.visitSelectedEvent(this.selectedVisit);
        // let _selectedVisitTemp = this.selectedVisit;
        // this.selectedVisit = '';
        // this.cd.detectChanges();
        // setTimeout(() => {
        //   this.selectedVisit = _selectedVisitTemp;
        //   this.cd.detectChanges();
        //   this.getVisitTestsByVisitId(_selectedVisitTemp);
        // }, 100);
      } else {
        this.toastr.error('error saving data');
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });
  }

  searchPatient(patientId) {
    let patientSearchParams = {
      PatientID: patientId, //65201868
    }
    if (patientSearchParams.PatientID) {
      this.spinner.show(this.spinnerRefs.patientInfoBar);
      this.patientService.searchPatient(patientSearchParams).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.patientInfoBar);
        if (res && res.StatusCode == 200) {
          if (res.PayLoad && res.PayLoad.length) {
            this.populatePatientFields(res.PayLoad[0]);
          } else {
            this.toastr.warning('Patient record not found');
          }
        } else {
          this.toastr.error('Error: Loading patient data');
        }
      }, (err) => {
        this.toastr.error('Error loading Patient data');
        console.log(err);
        this.spinner.hide(this.spinnerRefs.patientInfoBar);
      })
    }
  }

  populatePatientFields(data) {
    let _patPic = (data.OrbitPatientPic || data.PatientPic || '');
    let _formattedPic = _patPic ? ((_patPic.indexOf('data:image/') == -1) ? (CONSTANTS.IMAGE_PREFIX.PNG + _patPic) : _patPic) : '';
    // let _formattedDob = {day:moment(data.DateOfBirth).get('date'),month:(moment(data.DateOfBirth).get('month')),year:moment(data.DateOfBirth).get('year')};
    let _formattedAge = '';
    if (data.DateOfBirth) {
      let _ageObj: any = data.DateOfBirth ? this.calculateAge(new Date(data.DateOfBirth)) : {};
      _formattedAge = _ageObj.years ? (_ageObj.years + ' yr(s)') : (_ageObj.months + ' mon') ? _ageObj.months : (_ageObj.days + ' day(s)');
    }
    // console.log('populatePatientFields ', _formattedDob);
    data.MobileOperatorID = (data.MobileOperatorID || '') == -1 ? '' : (data.MobileOperatorID || '');
    this.patientBasicInfo = {
      PatientID: data.OrbitPatientID || '',
      MRNo: data.OrbitMRNo || '',
      // Salutation: this.getSalutationByTitle(data.Salutation || data.SalutationTitle || ''),
      FirstName: data.FirstName || '',
      LastName: data.LastName || '',
      CNIC: data.CNIC || '',
      PassportNo: data.PassportNo || '',
      Gender: data.Gender || '',
      DateOfBirth: data.DateOfBirth || '', // data.dateOfBirth ? moment(data.dateOfBirth).format(this.dateFormat) : '',
      Age: _formattedAge || '',
      FatherName: data.FatherName || '',
      HomeAddress: data.HomeAddress || '',
      PhoneNO: data.PhoneNO || '',
      MobileOperatorID: data.MobileOperatorID || '',
      MobileNO: data.MobileNO || '',
      ModifyBy: this.loggedInUser.userid || '',
      PatientPic: _formattedPic,
      Emails: data.Email || '',
      BranchID: this.loggedInUser.locationid || '',
      BloodGroup: data.BloodGroup || '',
      MaritalStatus: data.MaritalStatus || '',
    };
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
  onSelectAllBranches() {
    this.searchVisitsForm.patchValue({
      branchIds: this.branchesList.map(a => a.LocId)
    });
  }

  onUnselectAllBranches() {
    this.searchVisitsForm.patchValue({
      branchIds: []
    });
  }

  onKeyUpPinFilter(event: any) {
    console.log('event.target.value ', event.target.value);
    if (event && event.target && event.target.value) {
      if ((event.target.value || '').match(/\d/g) && (event.target.value || '').match(/\d/g).join('').length == 12) {
        this.getVisitsForResultEntry((event.target.value || '').match(/\d/g) && (event.target.value || '').match(/\d/g).join(''));
      }
      // if((event.target.value || '').replaceAll('-', '').length == 12) {
      // }
    }
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({ testCategory: 1 }).subscribe((resp: any) => {
      let _response = resp.PayLoad || [];
      this.testStatusList = _response;
    }, (err) => {
    })
  }
  getBranches() {
    this.branchesList = [];
    this.lookupService.GetBranches().subscribe((resp: any) => {
      let _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
      setTimeout(() => {
        this.searchVisitsForm.patchValue({
          branchIds: [this.loggedInUser.locationid]
        });
      }, 100);
    }, (err) => { })
  }
  getPermissions() {
    let _activatedroute = this.route.routeConfig.path;
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log(this.screenPermissionsObj);
  }


  ////////// begin::Creaatinine value validation /////////////
  // Key handling: allow typing, validate on Enter, keep only 1 dot, cap to 2 decimals while typing
  handleCreatinineKeyDown(e: KeyboardEvent) {
    const el = e.target as HTMLInputElement;
    const key = e.key;
    const ctrlOrCmd = e.ctrlKey || e.metaKey;

    // Allow navigation & control keys
    const navKeys = ['Backspace', 'Tab', 'Escape', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (navKeys.includes(key)) return;

    // Validate immediately on Enter and block submit
    if (key === 'Enter') {
      e.preventDefault();
      this.validateCreatinineValueSingle();
      return;
    }

    // Allow shortcuts
    if (ctrlOrCmd && ['a', 'c', 'v', 'x', 'z', 'y', 'A', 'C', 'V', 'X', 'Z', 'Y'].includes(key)) return;

    // Accept digits and decimal
    const isDigit = key >= '0' && key <= '9';
    const isDot = key === '.' || key === 'Decimal';
    if (!isDigit && !isDot) {
      e.preventDefault();
      return;
    }

    // Only one decimal
    if (isDot && el.value.includes('.')) {
      e.preventDefault();
      return;
    }

    // Simulate new value
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const insertChar = isDot ? '.' : key;
    const proposed = el.value.slice(0, start) + insertChar + el.value.slice(end);

    // Decimal length limit
    const dotIndex = proposed.indexOf('.');
    if (dotIndex !== -1) {
      const decLen = proposed.length - dotIndex - 1;
      if (decLen > 2) {
        e.preventDefault();
        return;
      }
    }

    // Range check only if it's a complete number (no trailing dot, not just "0")
    if (!proposed.endsWith('.') && proposed !== '' && proposed !== '0' && proposed !== '0.') {
      const numVal = parseFloat(proposed);
      if (!isNaN(numVal) && (numVal < 0.1 || numVal > 20)) {
        e.preventDefault();
        this.toastr.error('Creatinine value must be between 0.1 and 20 mg/dL.', 'Invalid Range');
        return;
      }
    }
  }



  // Paste handler (same rules you used)
  onCreatininePasteSingle(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') || '';
    const cleanValue = pasteData.replace(/[^0-9.]/g, '');

    if ((cleanValue.match(/\./g) || []).length > 1) {
      event.preventDefault();
      this.toastr.error('Only one decimal point is allowed.', 'Invalid Format');
      return;
    }

    const value = parseFloat(cleanValue);
    if (isNaN(value)) {
      event.preventDefault();
      this.toastr.error('Creatinine value must be a number.', 'Invalid Input');
      return;
    }

    if (cleanValue.includes('.') && cleanValue.split('.')[1].length > 2) {
      event.preventDefault();
      this.toastr.error('Creatinine value can have a maximum of 2 decimal places.', 'Invalid Format');
      return;
    }

    if (value < 0.1 || value > 20) {
      event.preventDefault();
      this.toastr.error('Creatinine value must be between 0.1 and 20 mg/dL.', 'Invalid Range');
      return;
    }

    // Accept paste but normalize formatting
    event.preventDefault();
    this.result = value % 1 === 0
      ? value.toString()
      : value.toFixed(2).replace(/\.?0+$/, '');
  }

  // Blur/Enter validation (clears invalid so it can’t be submitted)
  validateCreatinineValueSingle() {
  if (this.result !== null && this.result !== undefined && this.result !== '') {
    let s = this.result.toString().trim().replace(/[^0-9.]/g, '');

    const decimalCount = (s.match(/\./g) || []).length;
    if (decimalCount > 1) {
      this.toastr.error('Only one decimal point is allowed.', 'Invalid Format');
      this.result = '';
      return;
    }

    const value = parseFloat(s);
    if (isNaN(value)) {
      this.toastr.error('Creatinine value must be a number.', 'Invalid Input');
      this.result = '';
      return;
    }

    if (s.includes('.') && s.split('.')[1].length > 2) {
      this.toastr.error('Creatinine value can have a maximum of 2 decimal places.', 'Invalid Format');
      this.result = '';
      return;
    }

    // Range check (inclusive for 0.1 and 20)
    if (value < 0.1 || value > 20) {
      this.toastr.error('Creatinine value must be between 0.1 and 20 mg/dL.', 'Invalid Range');
      this.result = '';
      return;
    }

    // Normalize formatting
    if (Number.isInteger(value)) {
      // If it was like "20." → make it "20" (or "20.0" if you prefer)
      this.result = value.toString();
    } else {
      // Keep up to 2 decimals, strip trailing zeros
      this.result = value.toFixed(2).replace(/\.?0+$/, '');
    }
  }
}

  ////////// end::Creaatinine value validation /////////////

}
