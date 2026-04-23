// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { HcBookingInquiryService } from '../../../services/hc-booking-inquiry.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import moment from 'moment';
@Component({
  standalone: false,

  selector: 'app-exp-hcbooking-rpt',
  templateUrl: './exp-hcbooking-rpt.component.html',
  styleUrls: ['./exp-hcbooking-rpt.component.scss']
})
export class ExpHcbookingRptComponent implements OnInit {
  moment = moment; 
  hcBookingDetailData: any = [];
  excelData: any = [];

  spinnerRefs = {
    hcRequesTable: 'hcRequesTable',
    hcRequesDetail: 'hcRequesDetail',
    hcRequesContainer: 'hcRequesContainer',
  };


  hcBookingDetailForm = this.fb.group({
    dateFrom: ['', Validators.compose([Validators.required])],
    dateTo: ['', Validators.compose([Validators.required])],
  });
  
  constructor(private hcbookingInqServ: HcBookingInquiryService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private excelService: ExcelService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.hcBookingDetailForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 200);
  }

  getHCBookingDeatil() {
    this.hcBookingDetailData = [];
    const hcformData = this.hcBookingDetailForm.getRawValue();
    // let F = `${this.hcBookingDetailForm.controls["dateFrom"].value.year}-${this.hcBookingDetailForm.controls["dateFrom"].value.month}-${this.hcBookingDetailForm.controls["dateFrom"].value.day}`;
    // let T = `${this.hcBookingDetailForm.controls["dateTo"].value.year}-${this.hcBookingDetailForm.controls["dateTo"].value.month}-${this.hcBookingDetailForm.controls["dateTo"].value.day}`;
    const params = {
      DateFrom: Conversions.formatDateObject(hcformData.dateFrom),
      DateTo: Conversions.formatDateObject(hcformData.dateTo),
      // "DateFrom": F,
      // "DateTo": T
    }
    this.spinner.show(this.spinnerRefs.hcRequesDetail);
    this.hcbookingInqServ.getHCBookingDetailforExpRpt(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.hcRequesDetail);
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.hcBookingDetailData = resp.PayLoad;
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.hcRequesDetail);
      console.log(err)
    })


  }
  exportAsXLSX(): void {
    this.excelData = [];
    if (this.hcBookingDetailData.length) {
      this.hcBookingDetailData.forEach(row => {
        this.excelData.push(row);
      });
      this.excelData = this.excelData.map(aa => {
        const objD = aa;
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
