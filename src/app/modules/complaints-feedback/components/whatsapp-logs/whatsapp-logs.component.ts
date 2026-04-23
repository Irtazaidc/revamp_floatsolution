// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { ComplaintDashboardService } from '../../services/complaint-dashboard.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,

  selector: 'app-whatsapp-logs',
  templateUrl: './whatsapp-logs.component.html',
  styleUrls: ['./whatsapp-logs.component.scss']
})
export class WhatsappLogsComponent implements OnInit {
  @ViewChild('showSearchPatient') showSearchPatient;
  PopupRef: NgbModalRef;
  whatsAppLogList = [];
  maxDate;

  logsCount:any = null;
  TotalCount = 0;

  isSubmitted = false;
  searchText = '';
  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  spinnerRefs = {
    logsTable: "logsTable",
    logsCount: "logsCount",
  };

  loggedInUser: UserModel;
  filterForm = this.formBuilder.group({
    dateFrom: ['',Validators.required],
    dateTo: ['',Validators.required],
    byContact: [''],
    byPIN: ['', [Validators.minLength(12), Validators.maxLength(15)]],
  });

  constructor(
    private cms: ComplaintDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.filterForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 300);
    this.maxDate = Conversions.getCurrentDateObject();
    this.loadLoggedInUserInfo();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  serachWhatsAppLogs(){
    this.getWhatsappLogsDeatil();
    this.getWhatsappLogsCounts();
  }

  getWhatsappLogsDeatil(){
    const formValues = this.filterForm.getRawValue();
    this.whatsAppLogList = [];
    this.searchText = ''; // Reset search text
    if(this.filterForm.invalid){
      this.toastr.warning("Please fill the mandatory field / PIN must consist 12 digits");
      this.isSubmitted = true;
      return
    }

    const objParm = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo:Conversions.formatDateObject(formValues.dateTo) || null,
      CellNo: formValues.byContact || null,
      VisitID: formValues.byPIN || null,
    };
    this.spinner.show(this.spinnerRefs.logsTable)
    this.cms.GetWhatsAppLogs(objParm).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.logsTable)
      if (resp.StatusCode == 200) {
        this.whatsAppLogList = resp.PayLoad;
        this.filterResults(); // Call filterResults after data loads
      } else {
        this.toastr.error("Something Went Wrong");
      }
    },
      (err) => {
        console.log(err);
        this.toastr.error("Something Went Wrong");
        this.spinner.hide(this.spinnerRefs.logsTable)
      }
    );
  }

  getWhatsappLogsCounts(){
    const formValues = this.filterForm.getRawValue();
    this.logsCount = [];
    if(this.filterForm.invalid){
      this.toastr.warning("Please fill the mandatory field");
      this.isSubmitted = true
    }

    const objParm = {
      DateFrom: Conversions.formatDateObject(formValues.dateFrom) || null,
      DateTo:Conversions.formatDateObject(formValues.dateTo) || null,
      CellNo: formValues.byContact || null,
    };
    this.spinner.show(this.spinnerRefs.logsCount)
    this.cms.GetWhatsAppLogsSummary(objParm).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.logsCount)
      if (resp.StatusCode == 200) {
        this.logsCount = resp.PayLoad;
      } else {
        this.toastr.error("Something Went Wrong");
      }
    },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.logsCount)
        this.toastr.error("Something Went Wrong");
      }
    );
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  refreshPagination() {
    if (this.pagination.filteredSearchResults.length) {
      const dataToPaginate = this.pagination.filteredSearchResults;
      this.pagination.collectionSize = dataToPaginate.length;
      
      // Calculate start and end indices for pagination
      const startIndex = (this.pagination.page - 1) * this.pagination.pageSize;
      const endIndex = Math.min(startIndex + this.pagination.pageSize, dataToPaginate.length);
      
      this.pagination.paginatedSearchResults = dataToPaginate.slice(startIndex, endIndex);
    } else {
      this.pagination.paginatedSearchResults = [];
      this.pagination.collectionSize = 0;
    }
  }

  openSearchPatientPopUp(){
    setTimeout(() => {
      this.PopupRef = this.appPopupService.openModal(this.showSearchPatient, {
        backdrop: "static",
        size: "xl",
      });
    }, 200);
  }

  onPINInput() {
    const pinControl = this.filterForm.get('byPIN');
    if (pinControl?.value) {
      pinControl.setValue(
        pinControl.value.replace(/\D/g, ''),
        { emitEvent: false }
      );
    }
  }

  filterResults() {
    this.pagination.page = 1;

    const cols = [
      'VisitNo',
      'SentToNumber',
      'CreatedOn',
      'Status',
      'WhatsapText',
      'PatientName',
    ];

    let results = this.whatsAppLogList;

    if (this.searchText && this.searchText.trim().length > 0) {
      const normalizedSearchText = this.searchText
        .replace(/-/g, '')
        .toLowerCase()
        .trim();

      results = this.whatsAppLogList.filter(item => {
        // Check if any column matches the search text
        return cols.some(col => {
          if (!item[col]) return false;
          
          // Handle different data types
          const value = item[col];
          if (typeof value === 'string') {
            return value.replace(/-/g, '')
              .toLowerCase()
              .includes(normalizedSearchText);
          } else if (value instanceof Date) {
            return value.toString().toLowerCase().includes(normalizedSearchText);
          } else {
            return value.toString().toLowerCase().includes(normalizedSearchText);
          }
        });
      });
    }

    // Update pagination with filtered results
    this.pagination.filteredSearchResults = results;
    this.refreshPagination();
  }
}