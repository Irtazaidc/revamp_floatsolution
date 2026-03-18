// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { th } from 'date-fns/locale';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { DoctorService } from '../../services/doctor.service';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { TabsSwitchingService } from '../../services/tabs-switching.service';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-ref-by-doctors',
  templateUrl: './ref-by-doctors.component.html',
  styleUrls: ['./ref-by-doctors.component.scss']
})
export class RefByDoctorsComponent implements OnInit {

  @ViewChild('refDrListModal') refDrListModal;
  loggedInUser: UserModel;
  showRefByDoctorsForm = false;
  searchText = '';
  refByDoctorsList = [];
  citiesList = [];
  medTypes = [
    {
      id: 'MED-SPL', title: 'MED-SPL'
    },
    {
      id: 'DEN-GP', title: 'DEN-GP'
    },
    {
      id: 'MED-GP', title: 'MED-GP'
    },
    {
      id: 'DEN-SPL', title: 'DEN-SPL'
    }
  ];
  optionalColumnsVisibility = false;
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize:  0,
    filteredSearchResults: [],
    paginatedSearchResults: []
  }  
  doctorFormSubmitted = false;
  doctorForm = this.fb.group({
    RefId: [null],
    RefByName: ['', Validators.required],
    PMDCRegNo: [''],
    RefByAddress: [''],
    City: ['', Validators.required], // [new Date(), Validators.required],
    MedType: [''],
    ContactNo: [''],
    EMail: ['',[Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    CreatedBy: ['', Validators.required],
    IsDeleted: [0]
  });

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
  
  refDrDataList = []
  maxDate:any
  public Fields = {
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    
  };
  getrefDrData: FormGroup = this.fb.group(this.Fields)

  constructor(
    private doctorService: DoctorService,
    private auth: AuthService,
    private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private Tabs : TabsSwitchingService,
    private excelService: ExcelService,
    private appPopupService: AppPopupService,
  ) { }


  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRefByDoctors();
    this.getCitiesList(168);

    setTimeout(() => {
      this.getrefDrData.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
    this.maxDate = Conversions.getCurrentDateObject();
    
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.auth.getUserFromLocalStorage();
    this.loggedInUser = this.auth.currentUserValue;
    this.doctorForm.patchValue({
      CreatedBy: this.loggedInUser.userid
    });

  }

  getCitiesList(countryId) {
    this.citiesList = [];
    this.lookupService.getCities({ CountryId: countryId }).subscribe((res: any) => {
      if (res && res.PayLoad && res.PayLoad.length) {
        this.citiesList = res.PayLoad;
      }
    }, (err) => {
      console.log(err);
    });
  }


  showAddRefByDoctorForm(value) {
    if(value) {
      this.resetForm();
    }
    this.showRefByDoctorsForm = value;
  }

  getRefByDoctors(refId = null) {
    this.refByDoctorsList = [];
    // this.pagination.filteredSearchResults = [];
    this.searchText = '';
    this.filterResults();
    let _params = {
      refId: refId
    };
    this.spinner.show();
    this.doctorService.getRefByList(_params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.refByDoctorsList = data || [];
        // this.pagination.filteredSearchResults = this.refByDoctorsList;
        this.filterResults();
      }
    }, (err) => {
      this.spinner.hide();
    });
  }
  // refByDocSelected(e) {
  //   // if(e?.item?.RefId)
  //   console.log(e?.item?.RefId);
  // }


  submitForm() {
    this.doctorFormSubmitted = true;

    if(this.doctorForm.valid) {
      this.insertUpdate(this.doctorForm.value);
    } else {
      let invalidFieldNames = [];
      Object.keys(this.doctorForm.controls).forEach((a,i) => {
        if(this.doctorForm.controls[a].errors) {
             invalidFieldNames.push(a);
        }
      })
      this.toastr.warning('Please enter ' + invalidFieldNames.join(', '));
    }
  }

  insertUpdate(values) {
    let params = values;
    this.spinner.show();
    this.doctorService.insertUpdateRefByDoctor(params).subscribe( (res:any) => {
      this.spinner.hide();
      if(
        res.StatusCode == 200
        && res.PayLoad
        && res.PayLoad.length
        && res.PayLoad[0].Result !== 0
        && res.PayLoad[0].Result !== '0'
      ) {
        this.toastr.success(res.PayLoad[0].Result || 'Doctor Saved');
        this.resetForm();
        this.getRefByDoctors();  
      } else {
        this.toastr.error('Error Saving Doctor Information');
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
    })
  }

  edit(doctor) {
    this.showAddRefByDoctorForm(true);
    doctor.IsDeleted = doctor.IsDeleted ? 1 : 0;
    this.doctorForm.patchValue(doctor);
  }

  delete(doctor) {
      doctor.IsDeleted = 1;
      let params = doctor;
      this.spinner.show();
      this.doctorService.deleteRefByDoctor(params).subscribe( (res:any) => {
        this.spinner.hide();
        if(res.StatusCode == 200) {
          this.toastr.success('Doctor removed');
          this.resetForm();
          this.getRefByDoctors();
        } else {
          this.toastr.error('Error removing Doctor');
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
      }) 
  }

  resetForm() {
    this.doctorFormSubmitted = false;
    this.doctorForm.reset();
    this.doctorForm.patchValue({
      RefId: null,
      CreatedBy: this.loggedInUser.userid,
      IsDeleted: 0
    })
  }


  // refreshPagination() {
  //   let dataToPaginate = this.refByDoctorsList;
  //   if(this.searchText && this.searchText.length > 4) {
  //     dataToPaginate = this.filterResults();
  //   }
  //   this.pagination.collectionSize = dataToPaginate.length;
  //   this.pagination.paginatedSearchResults = dataToPaginate
  //     .map((item, i) => ({ id: i + 1, ...item }))
  //     .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  // }

  // filterResults() {
  //   this.pagination.page = 1;
  //   let cols = ['RefByName']; //, 'PMDCRegNo', 'ContactNo', 'City', 'EMail'];
  //   let rr = this.transform(this.refByDoctorsList, this.searchText, cols, this.refByDoctorsList);
  //   console.log(rr.length);
  //   return rr;
  // }
  
  refreshPagination() {
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize);
  }

  filterResults() {
    this.pagination.page = 1;
    let cols = ['RefByName', 'PMDCRegNo', 'ContactNo', 'City', 'EMail'];
    let results:any = this.refByDoctorsList;
    if(this.searchText && this.searchText.length > 4) {
      let pipe_filterByKey = new FilterByKeyPipe();
      results = pipe_filterByKey.transform(this.refByDoctorsList, this.searchText, cols, this.refByDoctorsList);
    }
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }

  navigateToBtoBConfigPage(event): void {
    this.Tabs.setSelectedTabIndex(0,event);
}

validateNo(e): boolean {
  const charCode = e.which ? e.which : e.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false
  }
  return true
}


isSubmitted = false
exportAsXLSX(){
  const excelData = [];
  this.refDrDataList.forEach((dataItem, index) => {
        const row = {
          'Sr#': index+1,
          'Name': dataItem.Name || 'NA',
          'PMDC No': dataItem.PMDCRegNo || 'NA',
          'City/Address':dataItem.City || dataItem.Address || 'NA',
          'CreatedOn': dataItem.createdon || '-',
          'Location': dataItem.LOCATION || 'NA',
        };
        excelData.push(row);
      });
      this.excelService.exportAsExcelFile(excelData, 'Doctor Ref List' , 'Ref-List');
 }

openExcelPopUP(){
  this.appPopupService.openModal(this.refDrListModal, { backdrop: 'static', size: 'lg' });
  this.refDrDataList = [];
}

getrefDrDataList(){
  let formValues  = this.getrefDrData.getRawValue();
    
  if (this.getrefDrData.invalid) {
    this.toastr.warning("Please Fill The Mandatory Fields");
    this.isSubmitted = true;
    return;
  }
  this.refDrDataList = [];
  let objParams = {
    DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
    DateTo: Conversions.formatDateObject(formValues.dateTo) || null, 
  }
  this.doctorService.getB2BDoctorRefList(objParams).subscribe((res: any) => {
    console.log("res:", res)
    if (res.StatusCode == 200 && res.PayLoad.length) {
      this.refDrDataList  = res.PayLoad
    } 
    else{
    this.toastr.error('Something went wrong!');
    }
  }, (err) => {
    console.log(err);
    this.toastr.error('Connection error');
  })
}
}

