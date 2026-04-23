// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { PhlebotomyService } from '../../services/phlebotomy.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';


@Component({
  standalone: false,

  selector: 'app-phlebotoy',
  templateUrl: './phlebotoy.component.html',
  styleUrls: ['./phlebotoy.component.scss']
})
export class PhlebotoyComponent implements OnInit {
  @ViewChild('visitQuestionnairePopup') visitQuestionnairePopup;
  visitQuestionnairePopupRef: NgbModalRef;

  screenPermissions = [];
  screenPermissionsObj: any = {};

  branchesList = [];
  branchRegions = [];
  testStatusList = [
    { StatusId: 2, Title: 'Phlebotomy' },
    { StatusId: 3, Title: 'Pending Phlebotomy' }
  ];
  visitsList = [];
  visitsListAll = [];
  visitSamplesList = [];
  visitQuestionnaire = [];
  visitDocs = [];

  searchVisitsForm = this.fb.group({
    branchIds: [0],
    fromDate: [''],
    toDate: [''],
    statusId: [2], 
    filtertype: [2] // records excluding home collection 
  });

  pinFilterString = '';
  selectedVisit: any = '';
  loggedInUser: UserModel;
  // patientBasicInfo = {};

  spinnerRefs = {
    patientInfoBar: 'patientInfoBar',
    visitSamples: 'visitSamples',
    pinsList: 'pinsList'
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
  VisitIdParam: any;



  constructor(
    private phlebotomyService: PhlebotomyService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    // private storageService: StorageService,
    // private patientService: PatientService,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private appPopupService: AppPopupService
  ) { }

  ngOnInit(): void {

    this.loadLoggedInUserInfo();

    this.getPermissions();

    this.getBranches();

    setTimeout(() => {
      this.searchVisitsForm.patchValue({
        fromDate: Conversions.getCurrentDateObject(),
        toDate: Conversions.getCurrentDateObject()
      });
      this.getVisitsList();
    }, 100);

  }


  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    // this.screenPermissionsObj = this.storageService.getLoggedInUserProfilePermissionsObj(_activatedroute);
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    // console.log(this.screenPermissionsObj);
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
    // console.log('this.loggedInUser', this.loggedInUser);
  }


  getVisitsList(visitid = '') {
    this.visitsList = [];
    this.visitsListAll = [];
    this.getVisitSamples(visitid);
    const formValues = this.searchVisitsForm.getRawValue();
    const params = {
      locationIds: (formValues.branchIds || [this.loggedInUser.locationid]).join(','),
      statusIds: formValues.statusId || "2", // 9 for report
      fromDate: formValues.fromDate ? Conversions.formatDateObject(formValues.fromDate) : '',
      toDate: formValues.toDate ? Conversions.formatDateObject(formValues.toDate, 'end') : '',
      filterBy : formValues.filtertype ? formValues.filtertype : 2
    };

    let valid = true, invalidFields = [];
    Object.keys(this.searchVisitsForm.controls).forEach((a) => {
      if (this.searchVisitsForm.controls[a].errors) {
        valid = false;
        invalidFields.push(a);
      }
    });
    // console.log('invalidFields ', invalidFields);
    if (!valid) {
      this.toastr.warning('Please enter <strong>' + invalidFields.join(', ') + '</strong>', '', { enableHtml: true });
      return;
    }
    this.spinner.show();
    this.spinner.show(this.spinnerRefs.pinsList);
    this.phlebotomyService.getVisitsForPhlebotomy(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.pinsList);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        data = data || [];

        // sort Urgent at top
        const normalVisit = data.filter(a => a.ProcessId != 2);
        const urgentVisit = data.filter(a => a.ProcessId == 2);
        data = [...urgentVisit, ...normalVisit];

        this.visitsList = data;
        this.visitsListAll = this.visitsList;
        // this.testStatusFilter();
        if (this.visitsList.length) {
          let _visit = this.visitsList[0];
          if (visitid) {
            if (this.visitsList.filter(a => a.VisitId == visitid).length) {
              _visit = this.visitsList.filter(a => a.VisitId == visitid)[0];
              this.getVisitSamples(_visit);
            }
          }
          // this.getVisitSamples(_visit);
        }
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error('Error loading Visits data');
      console.log(err);
    });
  }

  getVisitSamples(visit) {
    this.visitSamplesList = [];
    this.selectedVisit = visit;
    // this.getVisitRemarks();
    // this.patientBasicInfo = {};
    if (!visit || !visit.VisitId) {
      return;
    }
    this.VisitIdParam = visit.VisitId
    const formValues = this.searchVisitsForm.getRawValue();
    // this.searchPatient(visit.PatientId);
    const params = {
      visitId: visit.VisitId, // '201101056967', // '210301074271', //visit.VisitId,
      statusId: formValues.statusId //this.selectedVisit.StatusId || "2" // formValues.statusId ||
    };
    this.spinner.show(this.spinnerRefs.visitSamples);
    this.phlebotomyService.getVisitSamples(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitSamples);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad || [];
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        data.forEach(element => {
          element.checked = true;
          element.SCollectionId = !element.SCollectionId ? 1 : element.SCollectionId;
        });
        
        this.visitSamplesList = this.sortDataByParentChild(data) || [];

        // setTimeout(() => {
        //   this.selectAllSamples({target: {checked: true}});
        // }, 500);
      }
    }, (err) => {
      this.toastr.error('Error loading Tests data');
      this.spinner.hide(this.spinnerRefs.visitSamples);
      console.log(err);
    });
  }

  getVisitQuestionnaire() {
    this.visitQuestionnaire = [];
    this.visitQuestionnairePopupRef = this.appPopupService.openModal(this.visitQuestionnairePopup);
    const _checkedSampleTestIds = this.visitSamplesList.filter(a => a.checked).map(a => a.TPId).join(',');
    const params = {
      visitId: this.selectedVisit.VisitId,
      tpIds: _checkedSampleTestIds
    }
    if (!params.visitId || !params.tpIds) {
      return;
    }
    this.spinner.show();
    this.phlebotomyService.getVisitQuestionnaire(params).subscribe((res: any) => {
      this.visitQuestionnaire = [];
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        if (res.PayLoad && res.PayLoad.length) {
          res.PayLoad.forEach(a => {
            a.formattedOptions = a.Options ? (a.Options || '').toString().split(CONSTANTS.DELIMITER.ORBIT_OPTIONS_DELIMITER) : '';
            switch (a.AnsTypeId) {
              case 4: // Options & Text
              case '4': {
                a.formattedAnswer = ['', ''];
                const ans = (a.Answer || '').toString().split(':');
                a.formattedAnswer[0] = (ans[0] || '').toString().trim();
                if (ans.length == 2) {
                  a.formattedAnswer[1] = (ans[1] || '').toString().trim();
                }
                break;
              }
              case 5:  // Checkbox
              case '5': {
                if (a.Answer) {
                  a.Answer = (a.Answer || '').toString().toLowerCase() == 'yes' ? true : false;
                }
                break;
              }
              case 7:
              case '7': { // Min - Max
                a.formattedOptions = (a.Options || '').toString().split(CONSTANTS.DELIMITER.ORBIT_OPTIONS_DELIMITER);
                if (a.formattedOptions.length < 2) {
                  a.formattedOptions[1] = '';
                }
                break;
              }
              default: {
                // do nothing
              }
            }
          });
          this.visitQuestionnaire = res.PayLoad;
          // console.log(this.visitQuestionnaire);
        }
      }
    }, (err) => {
      this.visitQuestionnaire = [];
      this.spinner.hide();
      console.log(err);
      this.toastr.error('Error loading Questionnaire');
    });
  }

  saveVisitQuestionnaire() {
    const params = {
      // VisitId: '',
      // UserId: '',
      Questionnares: []
    };
    this.visitQuestionnaire.forEach(a => {
      let and = a.Answer || '';
      switch (a.AnsTypeId) {
        case 4: // Options & Text
        case '4': {
          and = a.formattedAnswer.join(':');
          break;
        }
        case 5:  // Checkbox
        case '5': {
          and = a.Answer ? 'Yes' : 'No';
          break;
        }
        case 7:
        case '7': { // Min - Max
          and = a.formattedAnswer.join(':');
          break;
        }
        default: {
          // do nothing
        }
      }
      const qObj = {
        VisitId: this.selectedVisit.VisitId,
        QId: a.QId,
        Answer: and || '',
        UserId: this.loggedInUser.userid
      };
      if (qObj.QId && qObj.VisitId) {
        params.Questionnares.push(qObj);
      }
    })
    if (!params.Questionnares.length) {
      return;
    }
    this.spinner.show();
    this.phlebotomyService.saveVisitQuestionnaire(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200) {
        this.toastr.success('Questionnaire saved successfully');
        this.visitQuestionnairePopupRef.close();
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      this.toastr.error('Error Saving Questionnaire');
    });
  }





  visitSelectedEvent(visit) {
    this.getVisitSamples(visit);
  }


  printBarcode() {
    const visitId = this.selectedVisit.VisitId;
    const _checkedSampleTestIds = this.visitSamplesList.filter(a => a.checked).map(a => a.TPId).join(',');
    if (visitId && _checkedSampleTestIds) {
      const url = environment.patientReportsPortalUrl + 'smp-bc?p=' + btoa(JSON.stringify({ visitId: visitId, tpIds: _checkedSampleTestIds, appName: 'WebMedicubes:phlebotomy', timeStemp: +new Date() }));
      window.open(url.toString(), '_blank');
    } else {
      this.toastr.info('Select sample to print barcode');
    }
  }

  statusUpdate(statusId) {
    const _checkedSamplesList = this.visitSamplesList.filter(a => a.checked);
    const sampleCollectionArr = [];
    if (!_checkedSamplesList.length || !statusId) {
      this.toastr.warning('Please select atleast one Test/Sample');
      return;
    }

    /*
    let _visitSamplesList = [];
    _checkedSamplesList.forEach( a => {
      _visitSamplesList.push({
        VisitId: a.VisitId,
        SampleId: '',
        TPId: a.TPId,
        StatusId: statusId
      });
    });
    let params = {
        PatientId: '',
        UserId: this.loggedInUser.userid,
        ModifiedDate: new Date(),
        VisitSamplesList: _visitSamplesList
    }
    */
    const _checkedSampleTestIds = _checkedSamplesList.map(a => a.TPId).join(',');
    _checkedSamplesList.forEach(a => {
      const testProfileObj = {
        VisitId: a.VisitId,
        TPId: a.TPId,
        SCollectionId: (a.SCollectionId || 1)       
      }
      sampleCollectionArr.push(testProfileObj);
    })
    const params = {
      visitId: _checkedSamplesList[0].VisitId,
      tpIds: _checkedSampleTestIds,
      statusId: statusId,
      userId: this.loggedInUser.userid,
      tpSampleCollection:sampleCollectionArr
    }

    this.spinner.show(this.spinnerRefs.patientInfoBar);
    this.phlebotomyService.updateVisitTestsStatus(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.patientInfoBar);
      if (res && res.StatusCode == 200) {
         this.toastr.success('Data Saved', 'Success'); // {positionClass: 'toast-top-center'}
        // this.visitSelectedEvent(this.selectedVisit);
        this.getVisitsList(this.selectedVisit);
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
      this.spinner.hide(this.spinnerRefs.patientInfoBar);
      console.log(err);
    });
  }



  selectAllSamples(e) {
    // console.log('e.target.value ', e, e.target.checked);
    this.visitSamplesList.forEach(a => {
      a.checked = false;
      // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
      a.checked = e.target.checked;
    })
  }

  testStatusFilter() {
    this.selectedVisit = '';
    this.visitSamplesList = [];
    // console.log('eeeeeeeeeeeee ', this.searchVisitsForm.value.statusId);
    if (this.searchVisitsForm.value.statusId == 0) {
      this.visitsList = this.visitsListAll;
      return;
    }
    const filterPipe = new FilterByKeyPipe();
    const filteredData: any = filterPipe.transform(this.visitsList, this.searchVisitsForm.value.statusId, ['StatusId'], this.visitsListAll);
    // console.log(this.visitsList, filteredData);
    this.visitsList = filteredData;
  }

  onSelectAllBranches() {
    this.searchVisitsForm.patchValue({
      branchIds: this.branchesList.map(a => a.LocId)
    });
  }
  onSelectRegionBranches(reg) {
    this.searchVisitsForm.patchValue({
      branchIds: this.branchesList.filter(a=>a.RegId == reg.RegId).map(a => a.LocId)
    });
  }
  groupBranchesByRegionFn = (item) => item.RegName;
  groupBranchesByRegionValueFn = (item) => { 
    return { RegName: this.branchesList.find(b=>b.RegName == item).RegName, RegCode: this.branchesList.find(b=>b.RegName == item).RegCode }
  };
  searchBranchesCustomFn(term, item) {
    term = term.toLowerCase();
    return (item.RegName || '').toLowerCase().indexOf(term) > -1 || (item.RegName || '').toLowerCase() === term
    || (item.Title || '').toLowerCase().indexOf(term) > -1 || (item.Title || '').toLowerCase() === term
    || (item.CityName || '').toLowerCase().indexOf(term) > -1 || (item.CityName || '').toLowerCase() === term
    || (item.RegCode || '').toLowerCase().indexOf(term) > -1 || (item.RegCode || '').toLowerCase() === term
    ;
}

  onUnselectAllBranches() {
    this.searchVisitsForm.patchValue({
      branchIds: []
    });
  }

  statusChangedEvent(e) {
    this.getVisitsList();
  }

  /* Lookups */
  getBranches() {
    this.branchesList = [];
    this.branchRegions = [];
    // this.spinner.show('GetBranches');
    this.lookupService.GetBranches().subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
      this.branchRegions = [...new Set(this.branchesList.filter(a => a.RegId).map(a => a.RegId))].map(a => { return {RegId: a, RegName: this.branchesList.find(b=>b.RegId == a).RegName, RegCode: this.branchesList.find(b=>b.RegId == a).RegCode} } )
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
  /* Lookups */




  onKeyUpPinFilter(event: any) {
    // console.log('event.target.value ', event.target.value);
    if (event && event.target && event.target.value) {
      if ((event.target.value || '').match(/\d/g) && (event.target.value || '').match(/\d/g).join('').length == 12) {
        this.getVisitsList((event.target.value || '').match(/\d/g) && (event.target.value || '').match(/\d/g).join(''));
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
    const obj = { days: 0, months: 0, years: 0 }
    if (!moment(birthday).isValid()) {
      return obj;
    }
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const bday: any = new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()); //(2021, 3, 2);
    const currentDate: any = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const diffDays = Math.round(Math.abs((currentDate - bday) / oneDay));
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


  getLoadedVisitDocs(e) {
    // console.log('doccccccccccccccccccccs ', e);
  }


  sortDataByParentChild(data: any[]): any[] {
    const parentChildMap = new Map<number, any[]>();
    const parentsMap = new Map<number, any>();
    const sortedData: any[] = [];
    const addedIds = new Set<number>();

    data.forEach((item) => {
      if (item.PackageId === -1) {
        parentsMap.set(item.TPId, item);
      } else {
        if (!parentChildMap.has(item.PackageId)) {
          parentChildMap.set(item.PackageId, []);
        }
        parentChildMap.get(item.PackageId)?.push(item);
      }
    });

    parentsMap.forEach((parentItem, parentId) => {
      if (!addedIds.has(parentItem.TPId)) {
        sortedData.push({...parentItem, isParent: true});
        addedIds.add(parentItem.TPId);
      }

      const children = parentChildMap.get(parentId) || [];
      children.forEach((child) => {
        if (!addedIds.has(child.TPId)) {
          sortedData.push(child);
          addedIds.add(child.TPId);
        }
      });

      parentChildMap.delete(parentId);
    });

    data.forEach((item) => {
      if (!addedIds.has(item.TPId)) {
        sortedData.push(item);
        addedIds.add(item.TPId);
      }
    });
    return sortedData;
  }

    openInvoice(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visit.VisitId, loginName: this.loggedInUser.username, appName: 'WebMedicubes:phlebotomy', copyType: 4, timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
  }
}
