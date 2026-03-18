// @ts-nocheck
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PatientService } from 'src/app/modules/patient-booking/services/patient.service';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { NgxSpinnerService } from 'ngx-spinner';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';

@Component({
  standalone: false,

  selector: 'app-visit-list',
  templateUrl: './visit-list.component.html',
  styleUrls: ['./visit-list.component.scss']
})
export class VisitListComponent implements OnInit {
  @Input('visitInfo') visitInfo: any = {};
  @Output() selVisit = new EventEmitter<any>();
  @Output() selPIN = new EventEmitter<any>();

  VisitsList: any = [];
  collectionSize: any = 0;
  internalPhoneNumber: any = '';
  internalVisitID: any = '';
  selTps: any = '';
  paginatedVisitResults: any = [];
  page: number = 1;
  pageSize: number = 5;
  paginatedVisitsList: any;
  PatientID = null;
  spinnerRefs = {
    visitListSection: 'visitListSection',
  }
  TPList: any = [];
  constructor(
    private patientService: PatientService,
    private tpService: TestProfileService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private helper: HelperService
  ) { }

  ngOnInit(): void {
    this.PatientID = this.visitInfo.patientID;
    this.getTestProfileByCellNo();
  }
  ngOnChanges(): void {
    this.PatientID = this.visitInfo.patientID;
    // console.log("vist list visitInfo", this.visitInfo);
    this.searchPatientVisit();
    this.getTestProfileByCellNo()

  }
  getTestProfileByCellNo() {
    let params = {
      PatientCellNo: this.internalPhoneNumber || this.visitInfo.phoneNumber,
      PatientID: this.isThisPatient?this.PatientID:null
    }
    this.tpService.getTestProfileByCellNo(params).subscribe((resp: any) => {

      console.log(resp);
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        let tests = resp.PayLoad
        this.TPList =  tests.map(a => {
          return {
            TPId: a.TPId,
            TestProfileName: a.TestProfileName,
            TPName: a.TPName,
            TPFullName : a.TestProfileName +' - '+a.TPName
          }
        })
      }

    }, (err) => { console.log(err) })

  }
  VisitIdActive = false;
  visitRowClick(selVisit,i=null) {
    this.rowIndex = i;
    // console.log("selectd visit row is: ", selVisit);
    this.VisitIdActive = selVisit.VisitId
    // this.selVisit.emit(selVisit.VisitId);
    this.selVisit.emit(selVisit.EncVisitID);
    this.selPIN.emit(selVisit.PIN);
  }
  searchText = "";
  changeTPs() {
    if (!this.selTps.length) {
      this.SearchPatientVisitByCellAndVisit();
    }
  }
  searchPatientVisit() {
    if (this.selTps.length)
      this.getPatientVisitsByTPIDs();
    else
      this.SearchPatientVisitByCellAndVisit();
  }
  refreshVisits() {
    this.internalVisitID = null;
    this.internalPhoneNumber = null;
    this.SearchPatientVisitByCellAndVisit();
  }
  isThisPatient = true;
  SearchPatientVisitByCellAndVisit() {
    if (this.internalPhoneNumber && this.internalPhoneNumber.length < 7) {
      this.toastr.warning("Please enter atleast 7 digits");
      return
    }
    
    this.searchText = '';
    this.filterResults();
    this.VisitsList = [];
    let params = {
      VisitId: this.internalVisitID ? this.internalVisitID.replaceAll('-', '') : null,  //this.visitInfo.visitID,
      MobileNO: this.internalPhoneNumber || this.visitInfo.phoneNumber,
      PatientID: this.isThisPatient?this.PatientID:null
    }
    this.spinner.show(this.spinnerRefs.visitListSection);
    this.patientService.searchPatientVisits(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitListSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        this.selTps = "";
        this.VisitsList = res.PayLoad;
        this.VisitIdActive = this.VisitsList[0].VisitId;
        this.filterResults();
        // console.log("this.VisitsList[0].VisitId", this.VisitsList[0].VisitId);
        this.selVisit.emit(this.VisitsList[0].VisitId);
        this.selPIN.emit(this.VisitsList[0].PIN);
        // console.log("wer are here and this.VisitsList[0].PIN___",this.VisitsList[0].PIN)
        this.getTestProfileByCellNo();
      }
      else {
        this.filterResults();
      }
    },
      (err) => { })
    this.filterResults();
  }
  getPatientVisitsByTPIDs() {
    this.spinner.show(this.spinnerRefs.visitListSection);
    this.searchText = '';
    this.filterResults();
    this.VisitsList = [];
    let params = {
      TPIds: this.selTps.join(','),
      PatientCellNo: this.internalPhoneNumber || this.visitInfo.phoneNumber,  //this.visitInfo.visitID,  
      PatientID: this.isThisPatient?this.PatientID:null
    }
    this.patientService.getPatientVisitsByTPIDs(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitListSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        this.VisitsList = res.PayLoad;
        this.VisitIdActive = this.VisitsList[0].VisitId;
        this.filterResults();
        // console.log("this.VisitsList[0].VisitId", this.VisitsList[0].VisitId);
        this.selVisit.emit(this.VisitsList[0].VisitId);
        this.selPIN.emit(this.VisitsList[0].PIN);
        // this.selTps = "";
      }
      else {
        this.filterResults();
      }
    },
      (err) => {
        this.spinner.hide(this.spinnerRefs.visitListSection);
      })
    this.filterResults();
  }
  searchFieldsChange(fieldName) {
    switch (fieldName) {
      case 'internalPhoneNumber':
        this.internalVisitID = "";
        break;
      case 'internalVisitID':
        this.internalPhoneNumber = "";
        break;
    }
  }


  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }
  refreshPagination() {
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      // .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
      setTimeout(() => {
       if(this.pagination.paginatedSearchResults.length){
        this.visitRowClick(this.pagination.paginatedSearchResults[0],0);
       }
      }, 500);
      
  }

  filterResults() {
    this.pagination.page = 1;
    let cols = ['VisitId', 'PatientName', 'PIN'];
    let results: any = this.VisitsList;
    if (this.searchText && this.searchText.length > 2) {
      let pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.VisitsList, this.searchText, cols, this.VisitsList);
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }

  rowIndex = null;
  rowIndexCpy = null;
  returnCopyClasses(i) {
    let styleClass = 'ti-files'
    if (this.rowIndex == i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle text-white';
    } else if (this.rowIndex == i && this.rowIndexCpy != i) {
      styleClass = 'ti-files text-white';
    } else if (this.rowIndex == !i && this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else if (this.rowIndexCpy == i) {
      styleClass = 'fa fa-check-circle';
    } else {
      styleClass = 'ti-files';
    }
    return styleClass;
  }

  isCoppied = null;
  copyText(text: any, i = null) {
    this.rowIndexCpy = i;
    let pin = text
    this.helper.copyMessage(pin);
    this.isCoppied = true;
    setTimeout(() => {
      this.isCoppied = false;
      this.rowIndexCpy = null;
    }, 3000);
  }

}
