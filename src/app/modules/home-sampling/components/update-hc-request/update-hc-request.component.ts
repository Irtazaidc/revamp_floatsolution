// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { UpdateHcReqService } from '../../services/update-hc-req.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,

  selector: 'app-update-hc-request',
  templateUrl: './update-hc-request.component.html',
  styleUrls: ['./update-hc-request.component.scss']
})
export class UpdateHcRequestComponent implements OnInit {
  @Input('bookingID') bookingIDInput: any;
  minDate_hcdatetime_bs = { day: moment(new Date()).get('date'), month: (moment(new Date()).get('month') + 1), year: moment(new Date()).get('year') };
  mapName: string = "";
  salutationsList: any = [];
  testProfileList: any = [];
  loggedInUser: UserModel;

  // HCDateTime: any;
  // HCtime: any;
  InvalidHCTime: boolean = false;

  meridian = true;

  dmyEnum = [];

  updateBookingForm = this.fb.group({
    Salutation: ['', ''],
    FirstName: ['', ''],
    LastName: ['', ''],
    HCDateTime: ['', ''],
    PhoneNo: ['', ''],
    MobileOperator: ['', ''],
    HcTime: ['', ''],
    HCRemarks: ['', ''],
    HCPatAddrress: ['', ''],
    Gender: ['', ''],
    DateOfBirth: ['', ''],
    CNIC: ['', ''],
    dmy: [{ value: '3', disabled: false }, ''],
    Age: ['', ''],
    hcCity: ['', '']
  });
  mobileOperatorList: any = [];
  queryParams: any = {};
  bookingID: any = "";
  HCRequestData: any = [];
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Update Booking Details', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  ngbSearchTP2 = (text$: Observable<any>) =>
    text$.pipe(
      // debounceTime(300),
      distinctUntilChanged(),
      map((term) => {
        if (term.length < 1) {
          return this.testProfileList;
        }
        let colKeyToFilter = 'TestProfileCode'; // { TestProfileCode, TestProfileName }
        if (this.searchByCodeNameRadio == 'name') {
          colKeyToFilter = 'TestProfileName';
          return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20);
        } else {
          colKeyToFilter = 'TestProfileCode';
          term = (term || '').trim();

          // return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase() == term.toLowerCase()).slice(0, 20);

          return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase().indexOf(term.toLowerCase()) == 0).slice(0, 20);
        }
        // return this.testProfileList.filter(v => v[colKeyToFilter].toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20);
      })
    )
  selectedTestProfiles: any = [];
  selectedTPItem: string;
  ngbFormatterTP_input = (x: any) => x ? (x.TestProfileCode + ' - ' + x.TestProfileName) : '';
  ngbFormatterTP_output = (x: any) => x ? (`${x.TestProfileCode} - ${x.TestProfileName} (${this.parseNumbericValues(x.TestProfilePrice)})`) : '';
  searchByCodeNameRadio = 'code';
  chkSearchByExactMatch = false;
  tpParametersForPopover: any = [];
  HCBookedTPDetail: any = [];
  RidersDetailList: any = [];
  gendersList: any = [];
  HCCitiesList: any = [];
  screenIdentity =  null;

  constructor(private tpService: TestProfileService, private auth: AuthService,
    private HCService: HcDashboardService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private updBooking: UpdateHcReqService, private spinner: NgxSpinnerService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getTestProfileList('');
    this.queryParams = this.getUrlParams();
    this.bookingID = this.queryParams.BID ? atob(this.queryParams.BID) : null;
    this.mapName = "map";
    if (this.bookingID || this.bookingIDInput)
      this.getBookingDetailByBookingID(this.bookingID || this.bookingIDInput);
    this.getSalutationList();
    this.getMobileOperator();
    console.log("bookingIDInput", this.bookingIDInput);
    this.getGendersList();
    this.dmyEnum = [{ id: 1, name: 'day(s)' },
    { id: 2, name: 'mon(s)' },
    { id: 3, name: 'yr(s)' }]
    this.HCCities();
    this.hourHandlerChange();
    // this.screenIdentity = this.route.routeConfig.path;
    // if(this.screenIdentity == 'hc-requests')
    // setTimeout(() => {
    //   this.updateBookingForm.patchValue({
    //     // HCDateTime: Conversions.getCurrentDateObject(),
    //     HcTime: Conversions.getCurrentTime(),
    //   });
    // }, 200);
  }
  ngOnChanges() {
    this.loadLoggedInUserInfo();
    this.getTestProfileList('');
    console.log("bookingIDInput", this.bookingIDInput);
  }
  public ageFromDateOfBirthday(dateOfBirth: any): number {
    return moment().diff(dateOfBirth, 'years');
  }
  tpFilterType(value) {
    // console.log(value);
    this.searchByCodeNameRadio = value;
  }
  parseNumbericValues(value) {
    let _value = value;
    if (!isNaN(value)) {
      _value = Number(_value);
      _value = Math.floor(_value);
    } else {
      _value = 0;
    }
    return _value;
  }
  getTestProfileList(tpname) {
    this.testProfileList = [];
    let _params = {
      tpids: null,
      code: (this.searchByCodeNameRadio == 'code' ? tpname : null),
      desc: (this.searchByCodeNameRadio == 'name' ? tpname : null),
      branchId: this.loggedInUser.locationid,
      // panelId: (this.selectedPanel || '') // this.selectedPanel ? this.selectedPanel.PanelId : '' //this.patientBasicInfo.value.corporateClientID || '',
    }
    if (!this.loggedInUser.locationid) {
      this.toastr.warning('Branch ID not found');
      return;
    }
    // this.spinner.show(this.spinnerRefs.testProfilesDropdown);
    this.tpService.getTestsByName(_params).subscribe((res: any) => {
      // this.spinner.hide(this.spinnerRefs.testProfilesDropdown);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        if (data.length) {
          data.forEach(element => {
            element.TestProfileCodeDesc = `${element.TestProfileCode} - ${element.TestProfileName} (${element.TestProfilePrice})`;
          });
        }
        this.testProfileList = data || [];
      }
    }, (err) => {
      // this.spinner.hide(this.spinnerRefs.testProfilesDropdown);
      console.log(err);
    });
  }
  selectEventngbTP(event, eventType) {
    // event && event.item
    let selectedObj = (event && event.item ? event.item : '');


    if (selectedObj) {

      if (selectedObj.TypeId == 3) {
        let _params = {
          packageId: selectedObj.TPId,
          branchId: this.loggedInUser.locationid,
          // panelId: (this.selectedPanel || '') // this.selectedPanel ? this.selectedPanel.PaselectEventngbTPnelId : '' //this.patientBasicInfo.value.corporateClientID || '',
        }
        this.spinner.show();
        this.tpService.getPackageTestsProfiles(_params).subscribe((res: any) => {
          this.spinner.hide();
          if (res && res.StatusCode == 200 && res.PayLoad) {
            let data = res.PayLoad;
            try {
              data = JSON.parse(data);
            } catch (ex) { }
            if (data.length) {
              data.forEach(element => {
                element.ProcessId = 1;
                element.forPkg = selectedObj.TPId;

                element.TaxRate = selectedObj.TaxRate || 0
              });

              let sameTestProfiles = data.forEach(a => { // if test/profile is in package then remove already added test/profile and use test/profile that is part of package
                let exist = this.selectedTestProfiles.find(b => b.TPId == a.TPId);
                if (exist) {
                  this.selectedTestProfiles = this.selectedTestProfiles.filter(b => b.TPId != a.TPId);
                }
              });

              this.selectedTestProfiles = [...this.selectedTestProfiles, ...data];

            }
          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);

          let errorMsg = '';
          if (err && err.message) {
            errorMsg = err.message;
          }
          this.toastr.error('Delete tests and ReSelect. <br><br> Reason: ' + errorMsg, 'Package Tests not fetched', { enableHtml: true });
          this.selectedTestProfiles.forEach(a => {
            if (a.TPId == selectedObj.TPId) {
              a.allowForReg = false;
            }
          })


        });
      }
      if (!this.selectedTestProfiles.find(a => a.TPId == selectedObj.TPId)) {
        let aa = JSON.parse(JSON.stringify(selectedObj));
        aa.ProcessId = 1;
        this.selectedTestProfiles.push(aa);

        if (aa.TypeId == 1 || aa.TypeId == 3) {
          let profilesIds = this.selectedTestProfiles.filter(a => a.TypeId == 2).map(a => a.TPId).join(',');
          this.checkIfTestAlreadyAddedInProfile(profilesIds);
        } else if (aa.TypeId == 2) {
          this.checkIfTestAlreadyAddedInProfile(aa.TPId);
        }

      } else {
        this.toastr.info('Already selected');
      }
    }
    setTimeout(() => {
      this.selectedTPItem = '';
    }, 100);
  }
  HCCities() {
    this.HCService.getHCCities().subscribe((resp: any) => {
      this.HCCitiesList = resp.PayLoad;
    }, (err) => {
      console.log(err);
    })
  }
  checkIfTestAlreadyAddedInProfile(profileIds) {
    let _profileIds = profileIds;
    if (!_profileIds) {
      return;
    }
    let params = {
      profileIds: _profileIds
    }
    this.tpService.getTestsByProfileId(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        let testsAlreadyInProfile = [];
        this.selectedTestProfiles.filter(a => a.TypeId == 1).forEach(a => {
          if (res.PayLoad.find(b => b.TestId == a.TPId)) {
            testsAlreadyInProfile.push(a);
          }
        });
        if (testsAlreadyInProfile.length) {
          this.toastr.info('<b>' + testsAlreadyInProfile.map(a => a.TestProfileCode).join('</b>, <b>') + '</b> already added as part of Profile(s)', 'Already Added', { enableHtml: true });
          testsAlreadyInProfile.forEach(tp => {
            this.removeSelectedTestProfile(tp);
          });
        }
      }
    }, err => {
      console.log(err);
    })
  }

  removeSelectedTestProfile(tp) {


    this.selectedTestProfiles = this.selectedTestProfiles.filter(a => {
      return tp.TPId != a.TPId;
    })
    this.selectedTestProfiles = this.selectedTestProfiles.filter(a => { // for package test profiles
      return tp.TPId != a.forPkg;
    })

  }
  getBookingDetailByBookingID(bookingID) {
    let params = {
      BookingID: bookingID,
      UserId: this.loggedInUser.userid,
      BranchID: this.loggedInUser.locationid
    }
    this.spinner.show();
    this.updBooking.searchDataByBookingID(params).subscribe((resp: any) => {
      this.spinner.hide();

      console.log("HCRequestData, ", resp);
      if (resp.StatusCode == 200 && resp.PayLoadDS.Table.length) {

        this.HCRequestData = resp.PayLoadDS.Table[0];
        let formatedDatetime = this.HCRequestData.HCDateTime.split('T');
        let formateddate = { day: moment(formatedDatetime[0]).get('date'), month: (moment(formatedDatetime[0]).get('month') + 1), year: moment(formatedDatetime[0]).get('year') };
        let formatedTime = { hour: moment(this.HCRequestData.HCDateTime).get('hour'), minute: (moment(this.HCRequestData.HCDateTime).get('minute')) };
        console.log("HCRequestData/, ", this.HCRequestData);
        // if (this.HCRequestData.length) {
        this.updateBookingForm.patchValue({
          Salutation: this.HCRequestData.SalutationTitle,
          FirstName: this.HCRequestData.FirstName,
          LastName: this.HCRequestData.LastName,
          HCDateTime: formateddate,
          PhoneNo: this.HCRequestData.MobileNO,
          MobileOperator: this.HCRequestData.MobileOperatorID,
          HcTime: formatedTime,
          HCRemarks: this.HCRequestData.HCRemarks,
          HCPatAddrress: this.HCRequestData.PatientAddress,
          Gender: this.HCRequestData.Gender,
          CNIC: this.HCRequestData.CNIC,
          hcCity: this.HCRequestData.HCCityID,
          Age: this.ageFromDateOfBirthday(this.HCRequestData.DateOfBirth),
          DateOfBirth: { day: moment(this.HCRequestData.DateOfBirth).get('date'), month: (moment(this.HCRequestData.DateOfBirth).get('month') + 1), year: moment(this.HCRequestData.DateOfBirth).get('year') }
        });
        this.addTestsFromBooking(resp.PayLoadDS.Table3)
      }
    }, (err) => {
      this.spinner.hide();


    })
  }
  addTestsFromBooking(testsData) {

    testsData.forEach(element => {
      this.selectEventngbTP({ item: element }, 'FrombookingID');

    });
  }
  _getBookingDetailByBookingID(bookingID) {
    let params = {
      BookingID: bookingID,
      UserId: this.loggedInUser.userid
    }
    this.spinner.show();
    this.HCService.GetHCRequests(params).subscribe((resp: any) => {
      console.log("HCRequestData, ", resp);
      // if (resp.PayLoad[0].length) {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.HCRequestData = resp.PayLoad[0];
        let formatedDatetime = this.HCRequestData.HCDateTime.split('T');
        let formateddate = { day: moment(formatedDatetime[0]).get('date'), month: (moment(formatedDatetime[0]).get('month') + 1), year: moment(formatedDatetime[0]).get('year') };
        let formatedTime = { hour: moment(this.HCRequestData.HCDateTime).get('hour'), minute: (moment(this.HCRequestData.HCDateTime).get('minute')) };
        console.log("HCRequestData/, ", this.HCRequestData);
        // if (this.HCRequestData.length) {
        this.updateBookingForm.patchValue({
          Salutation: this.HCRequestData.PatientSalutationTitle,
          FirstName: this.HCRequestData.FirstName,
          LastName: this.HCRequestData.LastName,
          HCDateTime: formateddate,
          PhoneNo: this.HCRequestData.MobileNO,
          MobileOperator: this.HCRequestData.PatientMobileOperatorID,
          HcTime: formatedTime,
          HCRemarks: this.HCRequestData.HCRemarks,
          HCPatAddrress: this.HCRequestData.PatientAddress,
        });
      }
      else {
        this.toastr.error("Something Went Wrong");
      }
      // }
      // else {

      // }
      // { day: moment(formatedDatetime[0]).get('date'), month: (moment(formatedDatetime[0]).get('month') + 1), year: moment(formatedDatetime[0]).get('year') },
      this.spinner.hide();

    }, (err) => {
      console.log(err);
      this.spinner.hide();
    })

  }

  updateBookingRequest() {
    let formData = this.updateBookingForm.getRawValue();
    let selhcdatetime = formData.HCDateTime.year + '-' + formData.HCDateTime.month + '-' + formData.HCDateTime.day + ' ' + formData.HcTime.hour + ':' + formData.HcTime.minute
    let testProfileArr = [];
    this.getValidAddedTestsProfiles().forEach(a => {
      //let _discountedValue = a.IsDiscountable && this.discountPercentage ? (((a.TestProfilePrice || 0) * this.discountPercentage) / 100) : 0;
      //_discountedValue = Math.round(_discountedValue);
      //totalCalculatedDiscount += _discountedValue;
      let testProfileObj = {
        VisitId: null,
        TPId: a.TPId,
        Price: (a.TestProfilePrice || 0),
        Remarks: null,
        StatusId: (a.TPStatusID || 1),
        ProcessId: 1, // { 1: normal, 2: urgent }
        SCollectionId: null,
        DeliveryDate: a.DeliveryDate || null,
        // InitBy: null,
        // InitDateTime: null,
        // FinalEditor: null,
        Title: (a.TestProfileName || '').trim(),
        RegLock: 1, // _branchId,
        PackageId: a.forPkg || -1,
        Discount: 0,
        isHomeSamplingTestProfile: a.isHomeSamplingTestProfile || 0,
        PCTCode: a.PCTCode || '',
        TaxRateFBR: null,
        SaleValueFBR: null,
        DiscountFBR: null,
        TaxChargedFBR: null,
        TotalAmountFBR: null,
      }
      testProfileArr.push(testProfileObj);
    });
    let params = {
      "BookingID": this.queryParams.BID ? atob(this.queryParams.BID) : this.bookingIDInput,
      "PatientFirstName": formData.FirstName,
      "PatientLastName": formData.LastName,
      "PatientMobileNumber": formData.PhoneNo,
      "PatientMobileOperatorID": formData.MobileOperator,
      "Gender": formData.Gender,
      "DOB": moment(new Date(formData.DateOfBirth.year, formData.DateOfBirth.month, formData.DateOfBirth.day)).format(),
      "CNIC": formData.CNIC,
      "PatientAddress": formData.HCPatAddrress,
      "GoogleAddress": "",
      "HCRemarks": formData.HCRemarks,
      "PatientSalutaionTitle": formData.Salutation,
      "PatientSalutaionID": null,
      "Latitude": null,
      "Longitude": null,
      "HCBookingDateTime": selhcdatetime,// formData.HcDateTime,
      "ModifiedBy": this.loggedInUser.userid,
      "HCBookingSourceID": null,
      "HCBookingPanelID": null,
      "HCBookingDiscountPercentage": null,
      "HCBookingTotalAmount": null,
      "HCBookingDiscAmount": null,
      "HCBookingDiscountedBy": null,
      "HomeCollectionCity": formData.hcCity,
      "OnlineBookedTPData": testProfileArr
    }
    this.spinner.show();
    this.updBooking.updatePatientBooking(params).subscribe((resp: any) => {
      this.spinner.hide()
      if (resp.StatusCode == 200) {
        this.toastr.success("Succesfully Updated");
        this.getBookingDetailByBookingID(this.bookingID);
      }
      console.log("Update Booking ", resp)
    }, (err) => {
      console.log(err);
      this.spinner.hide()
    })

  }

  //#region DateTime Checks
  CheckHCTime(event) {

    let selhcdate = this.updateBookingForm.controls["HCDateTime"].value;
    let selhctime = this.updateBookingForm.controls["HcTime"].value;
    let SelHCDateTime = selhcdate.year + "-" + selhcdate.month + "-" + selhcdate.day; + ' ' + selhctime.hour + ':' + selhctime.minute;
    let outputDate = new Date(SelHCDateTime);

    outputDate.setHours(event.hour || selhctime.hour);
    outputDate.setMinutes(event.minute || selhctime.minute);
    outputDate.setSeconds(event.second || selhctime.second);


    // if current mode is AM then
    if (selhctime.hour <= 0 && selhctime.hour < 12) {
      //save value as is in 24h format(no correction needed)
    }
    else if (selhctime.hour > 12) {//entered value is 12 then
      // store it as 0 in 24h format(in current implementation we add 12 to it and then`mod 24` transform it to 0)
    }
    if (outputDate.getTime() > new Date().getTime()) {
      this.InvalidHCTime = false;
    } else {
      this.toastr.warning("Please select available time");
      this.InvalidHCTime = true;
    }
    console.log("outputDate", outputDate);
  }
  //#endregion

  //#region LookUp
  getSalutationList() {
    this.salutationsList = [];
    this.lookupService.getSalutationList().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.salutationsList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  getMobileOperator() {
    this.mobileOperatorList = [];
    this.lookupService.getMobileOperator().subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.mobileOperatorList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  //#endregion LookUp

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getUrlParams() {
    const vars = {};
    let hash;
    let encryptedQueryString = '';
    if (window.location.href.indexOf('?') === -1) {
      return vars;
    } else {
      encryptedQueryString = window.location.href.slice(window.location.href.indexOf('?') + 1);
    }
    try {
      encryptedQueryString = decodeURIComponent(encryptedQueryString);
    } catch (err) { }
    try {
      encryptedQueryString = atob(encryptedQueryString);
    } catch (err) {
      try {
        encryptedQueryString = atob(encryptedQueryString + '=');
      } catch (err) {
        try {
          encryptedQueryString = atob(encryptedQueryString + '==');
        } catch (err) {
          try {
            encryptedQueryString = atob(encryptedQueryString.split('=').filter(a => a).join('='));
          } catch (err) {
            // console.log(err);
          }
        }
      }
    }
    let hashes = encryptedQueryString.split('&'); // atob
    for (let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split(/=(.+)/); //.split('=');
      //vars.push(hash[0]);
      vars[hash[0]] = hash[1];
      // console.log("hash", hash);
    }
    Object.keys(vars).forEach(a => {
      // console.log(a, vars[a])
      if (a == 'VisitId_MC') {
        //vars.push('MCApp');
        vars['MCApp'] = 1;
      }
      if (a == 'SectionId') {
        //vars.push('secId');
        vars['secId'] = vars['SectionId'];
      }
      if (a == 'VisitNo') {
        //vars.push('accNo');
        vars['accNo'] = vars['VisitNo'];
      }
      let graphicalParameter = (a == 'Graphical' || a == 'graphical' ? a : '');
      if (a == graphicalParameter) {
        if (vars[graphicalParameter] != 'false' && vars[graphicalParameter] != false && vars[graphicalParameter] != 0 && vars[graphicalParameter] != '0') {
          //vars.push('rpty');
          vars['rpty'] = 'grf'; // vars['Graph'];
          //vars.push('graphical');
          vars['graphical'] = vars[graphicalParameter];
        }
      }
    })
    return vars;
  }
  getTotal(arr, key) {
    return arr.map(a => a[key]).reduce((a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b), 0);
  }
  formatNumericValues(value) {
    return value.toString(); //.replace(CONSTANTS.REGEX.nimericWithComma, ",");
  }
  getValidAddedTestsProfiles() {
    return this.selectedTestProfiles.filter(a => a.allowForReg != false);
  }
  RidersDetail() {
    let params = {
      RiderID: 0
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailList = resp.PayLoad;
      let aa = this.RidersDetailList.filter(a => { return a.RiderStatusID == 1 });

    }, (err) => { console.log(err) })
  }
  showTPParameters(tp) {
    this.tpParametersForPopover = [];
    let params = {
      profileIds: tp.TPId
    }
    this.tpParametersForPopover = [{ Code: 'Loading...', Name: '' }];
    this.tpService.getTestsByProfileId(params).subscribe((res: any) => {
      if (res.StatusCode == 200 && res.PayLoad) {
        console.table(res.PayLoad);
        this.tpParametersForPopover = res.PayLoad;
      }
    }, err => {
      this.tpParametersForPopover = [{ Code: 'server error', Name: '' }];
      console.log(err);
    })
  }
  getGendersList() {
    this.gendersList = [];
    this.lookupService.getGendersList().subscribe((res: any) => {
      // console.log(res);
      if (res && res.PayLoad && res.PayLoad.length) {
        this.gendersList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }
  ageChange(value) {
    if (value == 0) {
      this.updateBookingForm.patchValue({
        DateOfBirth: '', // moment(dob).format(this.dateFormat)
      });
    }
    else {
      let _calculatedDob = this.calculateDOB(value, this.updateBookingForm.value.dmy);
      this.updateBookingForm.patchValue({
        DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
      });
    }
  }
  calculateDOB(number, dmy) {

    let dob: any = new Date();
    dmy = dmy || '3';
    if (dmy == '1') {
      dob = moment(dob).subtract(number, 'days')
    } else if (dmy == '2') {
      dob = moment(dob).subtract(number, 'months')
    } else if (dmy == '3') {
      dob = moment(dob).subtract(number, 'years')
    }
    let calculatedDob = { day: moment(dob).get('date'), month: (moment(dob).get('month') + 1), year: moment(dob).get('year') };
    /*
    this.patientBasicInfo.patchValue({
      DateOfBirth: calculatedDob, // moment(dob).format(this.dateFormat)
    });
    */
    return calculatedDob;
  }
  dmyChange(value) {

    if ((value == 2 || value == 3) && !this.updateBookingForm.value.Age) {
      this.updateBookingForm.patchValue({
        Age: 1
      });
    }
    let _calculatedDob = this.calculateDOB(this.updateBookingForm.value.Age, value);
    this.updateBookingForm.patchValue({
      DateOfBirth: _calculatedDob, // moment(dob).format(this.dateFormat)
    });
  }

  handleHourKeyup: () => void;
  handleMinuteKeyup: () => void;
  hourHandlerChange() {
    const hourElement: HTMLInputElement = document.querySelector(
      '[formcontrolname="HcTime"] .ngb-tp-hour input'
    ) as HTMLInputElement;

    const minuteElement: HTMLInputElement = document.querySelector(
      '[formcontrolname="HcTime"] .ngb-tp-minute input'
    ) as HTMLInputElement;

    hourElement.removeEventListener('keyup', this.handleHourKeyup);
    this.handleHourKeyup = () => {
      if (((hourElement.value)).toString().length === 2) {
        minuteElement.focus();
      }
    };
    hourElement.addEventListener('keyup', this.handleHourKeyup);

    minuteElement.removeEventListener('keyup', this.handleMinuteKeyup);
    this.handleMinuteKeyup = () => {
      if (minuteElement.value.length === 0) {
        hourElement.focus();
      }
    };
    minuteElement.addEventListener('keyup', this.handleMinuteKeyup);
  }

}
