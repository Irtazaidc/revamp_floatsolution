// @ts-nocheck
import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { ComplaintDashboardService } from '../../services/complaint-dashboard.service';

@Component({
  standalone: false,

  selector: 'app-cms-request-details',
  templateUrl: './cms-request-details.component.html',
  styleUrls: ['./cms-request-details.component.scss']
})
export class CmsRequestDetailsComponent implements OnInit {

  @Input() getCMSrequestID:number;
  
  constructor(
    private complaintDashboardService: ComplaintDashboardService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    this.selectedComplaintDetails();
  }
  RequestID=null
  StatusID=null
  complaintDetailsList;
  selectedComplaintDetails() {
  
    const objParm = {
      CMSRequestID: this.getCMSrequestID,
    };
    this.complaintDashboardService.getCMSRequest(objParm).subscribe((resp: any) => {
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.complaintDetailsList = resp.PayLoad[0];
        console.log("🚀 this.complaintDashboardService.getCMSRequest ~ this.complaintDetailsList:", this.complaintDetailsList)
        this.RequestID=this.complaintDetailsList.CMSRequestID;
        this.StatusID=this.complaintDetailsList.CMSStatus;
      } else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error(err);
    });
  }
}
