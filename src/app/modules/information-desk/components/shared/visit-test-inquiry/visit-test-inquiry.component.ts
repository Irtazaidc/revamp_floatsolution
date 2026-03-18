// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-visit-test-inquiry',
  templateUrl: './visit-test-inquiry.component.html',
  styleUrls: ['./visit-test-inquiry.component.scss']
})
export class VisitTestInquiryComponent implements OnInit {
  inquiryList = [];
  VisitID = null;
  TPID = null;
  @Input() ParamsPayload = {
      TPID: null,
      VisitID: null
    };
  spinnerRefs = {
    inquiryListSection: 'inquiryListSection'
  }
  constructor(
    private spinner: NgxSpinnerService,
    private sharedService: SharedService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.VisitID = this.ParamsPayload.VisitID;
    this.TPID = this.ParamsPayload.TPID;

    this.getVisitTPInquiry(this.VisitID,this.TPID)
  }
   
  getVisitTPInquiry(visitID, TPID) {
      let objParams = {
        VisitID: visitID,
        TpIDs: TPID
      }
      this.spinner.show(this.spinnerRefs.inquiryListSection);
      this.sharedService.getData(API_ROUTES.GET_VISIT_TEST_INQUIRY, objParams).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.inquiryListSection);
        if (res.StatusCode == 200) {
          this.inquiryList = res.PayLoadDS['Table'] || [];
        } else {
          this.inquiryList = [];
          this.toastr.error('Something went wrong! Please contact system support team');
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.inquiryListSection);
        this.toastr.error('Connection error');
      })
    }

}
