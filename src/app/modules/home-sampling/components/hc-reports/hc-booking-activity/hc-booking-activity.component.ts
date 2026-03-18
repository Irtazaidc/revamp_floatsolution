// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HcBookingInquiryService } from '../../../services/hc-booking-inquiry.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';

@Component({
  standalone: false,

  selector: 'app-hc-booking-activity',
  templateUrl: './hc-booking-activity.component.html',
  styleUrls: ['./hc-booking-activity.component.scss']
})
export class HcBookingActivityComponent implements OnInit {

   hcBookingDetailData: any = [];
   hcBookingAuditSummary: any = [];
   excelData: any = [];
   searchText = '';
   searchTextSUMMARY = ''

   isSubmitted = false;
   spinnerRefs = {
     hcRequesTable: 'hcRequesTable',
     hcRequesDetail: 'hcRequesDetail',
     hcRequesContainer: 'hcRequesContainer',
   };
 
 @ViewChild("BookingAuditDetails") BookingAuditDetailsPopup;
   filterForm = this.fb.group({
     dateFrom: ['', Validators.compose([Validators.required])],
     dateTo: ['', Validators.compose([Validators.required])],
   });
   
   constructor(private hcbookingInqServ: HcBookingInquiryService,
     private spinner: NgxSpinnerService,
     private fb: FormBuilder,
     private toastr: ToastrService,
     private excelService: ExcelService,
     private appPopupService: AppPopupService
   ) { }
 
   ngOnInit(): void {
     setTimeout(() => {
       this.filterForm.patchValue({
         dateFrom: Conversions.getPreviousDateObject(),
         dateTo: Conversions.getCurrentDateObject(),
       });
     }, 200);
   }
 
   getHCBookingAuditSummary() {
     this.hcBookingAuditSummary = [];
    if(this.filterForm.invalid){
      this.toastr.warning('Please fill the required Fields');
      this.isSubmitted = true;
      return;
    }

    let hcformData = this.filterForm.getRawValue();

    let formValues = this.filterForm.getRawValue();
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.warning("DateTo should be equal or greater than DateFrom");
      this.isSubmitted = false;
      return;
    }

    const maxDaysDifference = 14;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = "15 Days";
      this.toastr.warning(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }

     let params = {
       DateFrom: Conversions.formatDateObject(hcformData.dateFrom),
       DateTo: Conversions.formatDateObject(hcformData.dateTo),
     }
     this.spinner.show(this.spinnerRefs.hcRequesTable);
     this.hcbookingInqServ.GetHCBookingAuditSummary(params).subscribe((resp: any) => {
       this.spinner.hide(this.spinnerRefs.hcRequesTable);
       if (resp.StatusCode == 200 && resp.PayLoad.length) {
         this.hcBookingAuditSummary = resp.PayLoad;
       }
     }, (err) => {
       this.spinner.hide(this.spinnerRefs.hcRequesTable);
       console.log(err)
     })
   }

  getHCBookingDeatil(selectBPatientId) {
    if(!selectBPatientId){
      this.toastr.error('Please select a patient','Error');
      return
    }
     this.hcBookingDetailData = [];
     let params = {
       HCBookingPatientId: selectBPatientId,
     }
     this.spinner.show(this.spinnerRefs.hcRequesDetail);
     this.hcbookingInqServ.GetHCBookingAuditDetail(params).subscribe((resp: any) => {
       this.spinner.hide(this.spinnerRefs.hcRequesDetail);
       if (resp.StatusCode == 200 && resp.PayLoad.length) {
         this.hcBookingDetailData = resp.PayLoad;
         this.cleanBookingActivityData()
       }
     }, (err) => {
       this.spinner.hide(this.spinnerRefs.hcRequesDetail);
       console.log(err)
     })
   }

 cleanBookingActivityData() {
  if (!this.hcBookingDetailData) return;

  // STEP 1: Clean FieldName (remove ID suffix)
  const cleanedData = this.hcBookingDetailData.map((row: any) => {
    let cleanFieldName = row.FieldName;

    // Remove "ID" at the END only
    if (cleanFieldName.endsWith("ID")) {
      cleanFieldName = cleanFieldName.replace(/ID$/, "");
    }

    return {
      ...row,
      FieldName: cleanFieldName,
      OldValue: row.OldValue ?? "-",
      NewValue: row.NewValue ?? "-"
    };
  });

  // STEP 2: GROUP BY FieldName
  const grouped: any = {};

  cleanedData.forEach(item => {
    if (!grouped[item.FieldName]) {
      grouped[item.FieldName] = [];
    }
    grouped[item.FieldName].push(item);
  });

  // STEP 3: Sort each FieldName group by ModifiedOn (Newest → Oldest)
  const finalList: any[] = [];

  Object.keys(grouped).forEach(field => {
    const sorted = grouped[field].sort(
      (a, b) => new Date(b.ModifiedOn).getTime() - new Date(a.ModifiedOn).getTime()
    );

    // Merge sorted items into final array
    finalList.push(...sorted);
  });

  // STEP 4 — Assign to table datasource
  this.hcBookingDetailData = finalList;
}


    selectBPatientId = null;
    openAuditDetails(event) {
      this.selectBPatientId = event.PKValue;

       this.appPopupService.openModal(
        this.BookingAuditDetailsPopup,
        { size: "xl" }
      );
      this.getHCBookingDeatil(this.selectBPatientId);
    }
   exportAsXLSX(): void {
     this.excelData = [];
     if (this.hcBookingDetailData.length) {
       this.hcBookingDetailData.forEach(row => {
         this.excelData.push(row);
       });
       this.excelData = this.excelData.map(aa => {
         let objD = aa;
         delete objD.isBranchSelected;
         return objD;
       })
       this.excelService.exportAsExcelFile(this.excelData,  'HC Booking Detail Reprt' ,'HC Booking Detail Reprt');
     }
     else {
       this.toastr.warning("No Record Found");
     }
   }
}
