// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
// import { PatientService } from '../../../../pages/patient-booking/services/patient.service';
// import { User } from '../../../../models/user';
// import { StorageService } from '../../../../shared/helpers/storage.service';
import { VisitResultService } from '../../services/visit-result.service';
import moment from 'moment';
// import { CONSTANTS } from '../../../../shared/helpers/constants';
// import { Conversions } from '../../../../shared/helpers/conversions';
// import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
// import { LookupService } from '../../../../pages/patient-booking/services/lookup.service';
import { FormBuilder } from '@angular/forms';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { PatientService } from 'src/app/modules/patient-booking/services/patient.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
// import { FilterByKeyPipe } from '../../../../pipes/filter-by-key.pipe';

@Component({
  standalone: false,

  selector: 'app-visit-result-entry',
  templateUrl: './visit-result-entry.component.html',
  styleUrls: ['./visit-result-entry.component.scss']
})
export class VisitResultEntryComponent implements OnInit {

  screenPermissions = [];
  screenPermissionsObj:any = {};

  branchesList = [];
  testStatusList = [];
  visitsList = [];
  visitsListAll = [];
  visitTestsList = [];
  testResults = [
    {id: 'Negative', name: 'Negative'},
    {id: 'Positive', name: 'Positive'}
  ];
  testResults_pcr = [
    {id: 'Detected', name: 'Detected'},
    {id: 'Not Detected', name: 'Not Detected'}
  ];

  // testStatusList = [
  //   {StatusId: -2, StatusTitle: "Cancel Req."},
  //   {StatusId: -1, StatusTitle: "Cancelled"},
  //   {StatusId: 1, StatusTitle: "Registration"},
  //   {StatusId: 2, StatusTitle: "Phlebotomy"},
  //   {StatusId: 3, StatusTitle: "Pending Phlebotomy"},
  //   {StatusId: 4, StatusTitle: "Accession"},
  //   {StatusId: 5, StatusTitle: "Pending Accession"},
  //   {StatusId: 6, StatusTitle: "Analysis"},
  //   {StatusId: 7, StatusTitle: "Initialized"},
  //   {StatusId: 8, StatusTitle: "Reported"},
  //   {StatusId: 9, StatusTitle: "Final"},
  //   {StatusId: 10, StatusTitle: "Pending Final"},
  //   {StatusId: 11, StatusTitle: "On Desk"},
  //   {StatusId: 12, StatusTitle: "Delivered"}
  // ];


  searchVisitsForm = this.fb.group({
    branchIds: [0],
    fromDate: [''],
    toDate: [''],
    statusId: [0]
  });


  pinFilterString = '';
  selectedVisit: any = '';
  loggedInUser: UserModel;
  patientBasicInfo = {};
  // fromDate: NgbDateStruct;
  // toDate: NgbDateStruct;
  // selectedBranch = 0;


  spinnerRefs = {
    patientInfoBar: 'patientInfoBar',
    visitResults: 'visitResults'
  }


  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }



  constructor(
    private visitResultsService: VisitResultService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    // private storageService: StorageService,
    private patientService: PatientService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private fb: FormBuilder
    ) { }

  ngOnInit(): void {


    this.searchVisitsForm.patchValue({
      fromDate: Conversions.getCurrentDateObject(),
      toDate: Conversions.getCurrentDateObject()
    });

    this.loadLoggedInUserInfo();

    this.getPermissions();

    this.getTestStatus();
    this.getBranches();

    this.getVisitsForResultEntry();
  }


  getPermissions() {
    let _activatedroute = this.route.routeConfig.path;
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log(this.screenPermissionsObj);
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
  }


  searchPatient(patientId) {
    // patientId = 65201868;
    let patientSearchParams = {
      PatientID: patientId,
    }
    if( patientSearchParams.PatientID ) {
      this.spinner.show(this.spinnerRefs.patientInfoBar);
      //this.patientService.searchPatient
      this.patientService.searchPatient(patientSearchParams).subscribe( (res: any) => {
        this.spinner.hide(this.spinnerRefs.patientInfoBar);
        // console.log(res);
        if(res && res.StatusCode == 200) {
          if(res.PayLoad && res.PayLoad.length) {
            //this.searchResults = res.payLoad;
            this.populatePatientFields(res.PayLoad[0]);
          } else {
            this.toastr.warning('Patient record not found');
          }
        } else {
          this.toastr.error('Error: Loading patient data');
        }
      },  (err) => {
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
    if(data.DateOfBirth) {
      let _ageObj:any = data.DateOfBirth ? this.calculateAge(new Date(data.DateOfBirth)) : {};
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
      BranchID: this.loggedInUser.locationid ||  '',
      BloodGroup: data.BloodGroup || '',
      MaritalStatus: data.MaritalStatus || '',
    };
  }


  getVisitsForResultEntry(visitid = '') {
    this.visitsList = [];
    this.visitsListAll = [];
    this.getVisitTestsByVisitId('');
    let formValues = this.searchVisitsForm.getRawValue();
    let params = {
      locationIds: (formValues.branchIds || [this.loggedInUser.locationid]).join(','),
      statusIds: formValues.statusId || "", // 9 for report
      fromDate: formValues.fromDate ? Conversions.formatDateObject(formValues.fromDate) : '',
      toDate: formValues.toDate ? Conversions.formatDateObject(formValues.toDate, 'end') : ''
    };

    let valid = true, invalidFields = [];
    Object.keys(this.searchVisitsForm.controls).forEach( (a) => {
      if(this.searchVisitsForm.controls[a].errors) {
        valid = false;
        invalidFields.push(a);
      }
    });
    console.log('invalidFields ', invalidFields);
    if(!valid) {
      this.toastr.warning('Please enter <strong>' + invalidFields.join(', ') + '</strong>', '', {enableHtml:true});
      return;
    }
    this.spinner.show();
    this.visitResultsService.getVisitsFroResultsEntry(params).subscribe( (res:any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) {}
        // console.log(data);
        this.visitsList = data || [];
        this.visitsListAll = this.visitsList;
        // this.testStatusFilter();
        if(this.visitsList.length) {
          let _visit = this.visitsList[0];
          if(visitid) {
            if(this.visitsList.filter( a=> a.VisitId == visitid ).length) {
              _visit = this.visitsList.filter( a=> a.VisitId == visitid)[0];
              this.getVisitTestsByVisitId(_visit);
            }
          }
          // this.getVisitTestsByVisitId(_visit);
        }
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error('Error loading Visits data');
      console.log(err);
    });
  }

  getVisitTestsByVisitId(visit) {
    this.visitTestsList = [];
    this.selectedVisit = visit;
    this.patientBasicInfo = {};
    this.cd.detectChanges();
    if(!visit || !visit.VisitId) {
      return;
    }
    this.searchPatient(visit.PatientId);
    let params = {
      visitId: visit.VisitId, // '201101056967', // '210301074271', //visit.VisitId,
      tpId: '2153,2177,2233'
    };
    this.spinner.show(this.spinnerRefs.visitResults);
    this.visitResultsService.getVisitTestsByVisitId(params).subscribe( (res:any) => {
      this.spinner.hide(this.spinnerRefs.visitResults);
      if(res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) {}
        // console.log(data);
        this.visitTestsList = data || [];
        if(this.visitTestsList.length == 1) {
          setTimeout(() => {
            this.selectAllTestResults({target: {checked: true}});
          }, 100);
        }
      }
    }, (err) => {
      this.toastr.error('Error loading Tests data');
      this.spinner.hide(this.spinnerRefs.visitResults);
      console.log(err);
    });
  }

  visitSelectedEvent(visit) {
    this.getVisitTestsByVisitId(visit);
  }

  resultChangedEvent(tp, event, value) {
    // console.log('tp, event, value ', tp, event, value);
    // this.visitTestsList.forEach( a => {
    //   if(a.TPID == tp.TPID) {
    //     a.Result = value;
    //   }
    // });
  }



  saveVisitTestResults() {
    console.log('this.selectedVisit ', this.selectedVisit);
    if(!this.selectedVisit || !this.selectedVisit.VisitId) {
      return;
    }
    let testResultsToSave = [];
    this.visitTestsList.forEach( a => {
      let _obj = { ...a };
      if(_obj.checked) {
        testResultsToSave.push(_obj);
      }
    });

    if(!testResultsToSave.length) {
      this.toastr.warning('Please select atleat one test');
      return;
    }

    if(testResultsToSave.find( a => !a.Result)) {
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
      TPId: 0,
      Result: '',
      TestResults: []
    }
    testResultsToSave.forEach( tp => {
      let _obj = {
        VisitID: this.selectedVisit.VisitId,
        TestID: tp.TPID,
        ParamID: tp.ParamID,
        Result: tp.Result
        // StatusID: 9
      }
      if(tp.checked) {
        _params.TestResults.push(_obj);
      }
    });

    this.spinner.show();
    this.visitResultsService.insertPatientVisitTestResult(_params).subscribe( (res:any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200) {
        // this.toastr.success('Data Saved', 'Success', {positionClass: 'toast-top-center'});
        this.visitSelectedEvent(this.selectedVisit);

        // let _selectedVisitTemp = this.selectedVisit;
        // this.selectedVisit = '';
        // this.cd.detectChanges();
        // setTimeout(() => {
        //   this.selectedVisit = _selectedVisitTemp;
        //   this.cd.detectChanges();
        //   this.visitSelectedEvent(_selectedVisitTemp);
        //   this.getVisitTestsByVisitId(_selectedVisitTemp);
        // }, 100);
        // console.log(data);
      } else {
        this.toastr.error('error saving data');
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
    });
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

    if(!this.selectedVisit || !this.selectedVisit.VisitId) {
      return;
    }
    let testResultsToSave = [];
    this.visitTestsList.forEach( a => {
      let _obj = { ...a };
      if(_obj.checked) {
        testResultsToSave.push(_obj);
      }
    });

    if(!testResultsToSave.length) {
      this.toastr.warning('Please select atleat one test');
      return;
    }

    if(testResultsToSave.find( a => !a.Result)) {
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
      TPId: 0,
      Result: '',
      TestResults: []
    }
    testResultsToSave.forEach( tp => {
      let _obj = {
        VisitID: this.selectedVisit.VisitId,
        TestID: tp.TPID,
        ParamID: tp.ParamID,
        Result: tp.Result
        // StatusID: 9
      }
      if(tp.checked) {
        _params.TestResults.push(_obj);
      }
    });

    this.spinner.show();
    this.visitResultsService.updatePatientVisitTestStatus(_params).subscribe( (res:any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200) {
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

  openReport() {
    // this.toastr.success('Report opened', 'Success', {positionClass: 'toast-top-center'});
    const url = environment.patientReportsPortalUrl + 'pr?'+ btoa(`VisitId_MC=${this.selectedVisit.VisitId}&LoginName_MC=${this.loggedInUser.username}&appName='WebMedicubes:results_entry'&ts_cache=${+new Date()}`);
    window.open(url.toString(), '_blank');
  }


  selectAllTestResults(e) {
    console.log('e.target.value ', e, e.target.checked);
    this.visitTestsList.forEach( a=> {
      a.checked = false;
      // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
      if(a.StatusId > 0 && a.StatusId <= 8) {
        a.checked = e.target.checked;
      }
    })
  }

  testStatusFilter() {
    this.selectedVisit = '';
    this.visitTestsList = [];
    // console.log('eeeeeeeeeeeee ', this.searchVisitsForm.value.statusId);
    if(this.searchVisitsForm.value.statusId == 0) {
      this.visitsList = this.visitsListAll;
      return;
    }
    const filterPipe = new FilterByKeyPipe();
    let filteredData:any = filterPipe.transform(this.visitsList, this.searchVisitsForm.value.statusId, ['StatusId'], this.visitsListAll);
    console.log(this.visitsList, filteredData);
    this.visitsList = filteredData;
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


  /* Lookups */
  getBranches() {
    this.branchesList = [];
    // this.spinner.show('GetBranches');
    this.lookupService.GetBranches().subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      let _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
      //this.selectedBranch = 0;
      setTimeout(() => {
        //this.selectedBranch = this.loggedInUser.locationid;
        this.searchVisitsForm.patchValue({
          branchIds: [this.loggedInUser.locationid]
        });
      }, 100);
    }, (err) => {
      // this.spinner.hide('GetBranches');
    })
  }
  getTestStatus() {
    this.testStatusList = [];
    this.lookupService.getTestStatus({testCategory: 1}).subscribe((resp: any) => {
      let _response = resp.PayLoad || [];
      this.testStatusList = _response;
    }, (err) => {
    })
  }
  /* Lookups */




  onKeyUpPinFilter(event: any) {
    console.log('event.target.value ', event.target.value);
    if(event && event.target && event.target.value) {
      if((event.target.value || '').match( /\d/g) && (event.target.value || '').match( /\d/g).join('').length == 12) {
        this.getVisitsForResultEntry((event.target.value || '').match( /\d/g) && (event.target.value || '').match( /\d/g).join(''));
      }
      // if((event.target.value || '').replaceAll('-', '').length == 12) {
      // }
    }
  }

  
  calculateAge(birthday) { // birthday is a date
    // birthday = new Date(birthday)
    // var ageDifMs = Date.now() - birthday.getTime();
    // var ageDate = new Date(ageDifMs); // miliseconds from epoch
    // return Math.abs(ageDate.getUTCFullYear() - 1970);
    let obj = {days: 0, months: 0, years: 0}
    if(!moment(birthday).isValid()) {
      return obj;
    }
    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    let bday:any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    let currentDate:any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    let diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
    if(diffDays > 364){
        obj.years = Math.floor(diffDays/364);
    } else if(diffDays >= 30){
        obj.months = Math.floor(diffDays/30);
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




}
