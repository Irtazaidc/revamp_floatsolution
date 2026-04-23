// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { ExcelService } from 'src/app/modules/business-suite/excel.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HcRptsService } from '../../../services/hc-rpts.service';

@Component({
  standalone: false,

  selector: 'app-hc-status-wise-rpt',
  templateUrl: './hc-status-wise-rpt.component.html',
  styleUrls: ['./hc-status-wise-rpt.component.scss']
})
export class HcStatusWiseRptComponent implements OnInit {

  BookingStatusList: any = [];
  hcStatusWiseRptList= [];
  searchInHCStatusWiseRpt: any = "";
  isDiscardEnable = false;

  isSubmitted = false

  excel = [];
  loggedInUser: UserModel;
  constructor(private hcRpts: HcRptsService, private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder, private toastr: ToastrService,
    private excelService: ExcelService,private auth: AuthService
    ) { }


  public Fields = {
    dateFrom: ['',Validators.required],
    dateTo: ['',Validators.required],
    hcStatus: [,Validators.required],
  };
  HCStatusWiseRptForm: FormGroup = this.formBuilder.group(this.Fields);

  ngOnInit(): void {
    this.HCBookingStatuses();
    this.loadLoggedInUserInfo()

    setTimeout(() => {
      this.HCStatusWiseRptForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 200);
  }
  getHCStatusWiseRpt() {

    if (this.HCStatusWiseRptForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    this.spinner.show();
    const formData = this.HCStatusWiseRptForm.getRawValue();
    const params = {
      HCBookingStatusID: formData.hcStatus,
      DateFrom: Conversions.formatDateObject(formData.dateFrom),
      DateTo: Conversions.formatDateObject(formData.dateTo)
    };
    this.hcRpts.getHCStatusWiseRpt(params).subscribe((resp: any) => {
      this.spinner.hide();
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.hcStatusWiseRptList = resp.PayLoad;
        if (formData.hcStatus == 10) {
          this.isDiscardEnable = true;
        }
      }
    }, (err) => {
      this.spinner.hide();
    })

  }
  HCBookingStatuses() {
    this.hcRpts.GetHCBookingStatuses().subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200 && resp.PayLoad.length) {
        this.BookingStatusList = resp.PayLoad;
      }
    }, (err) => { console.log(err) })
  }

  discardHCShare(data) {
    if (data) {
      const params = {
        "RiderID": data.RiderID,
        "HCShareIDs": data.HCShareID, 
        "DiscardedBy": this.loggedInUser.userid
      }
      this.hcRpts.updHCShareToDiscard(params).subscribe((resp: any) => {
        if (resp.StatusCode == 200) {
          this.toastr.success("Discarded succesfully");
        }
      }, (err) => { console.log("err", err) })
    }
    else {
      this.toastr.warning("Please select request ids to discard");
    }

  }

  
  exportAsXLSX(): void {
    this.excel = []
    if (this.hcStatusWiseRptList.length) {
      this.hcStatusWiseRptList.forEach(row => {
        this.excel.push(row);
      });      
      const formData = this.HCStatusWiseRptForm.getRawValue();
      this.excelService.exportAsExcelFile(this.excel,'Share Report', 'Share Report' + formData.dateFrom ? Conversions.formatDateObject(formData.dateFrom) : '' + '-' + formData.dateFrom ? Conversions.formatDateObject(formData.dateTo) : null);
    }
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
}
