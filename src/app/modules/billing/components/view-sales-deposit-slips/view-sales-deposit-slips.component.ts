// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { DoctorShareService } from 'src/app/modules/ris/services/doctor-share.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { BillingService } from '../../services/billing.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-view-sales-deposit-slips',
  templateUrl: './view-sales-deposit-slips.component.html',
  styleUrls: ['./view-sales-deposit-slips.component.scss']
})
export class ViewSalesDepositSlipsComponent implements OnInit {

  branchList = [];
  SalesSlipDataList = [];

  searchText = '';

  spinnerRefs = {
    searchTable: 'searchTable',
  }

  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;

  loggedInUser: UserModel;

  public Fields = {
    Salesdate: ['', Validators.required],
    BranchId: [, Validators.required],
  };

  isSubmitted = false;
  searchDepositSlipsForm: FormGroup = this.formBuilder.group(this.Fields)

  loadedDocuments: any[];
  docDefault = true;
  maxDate


  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private doctorShare: DoctorShareService,
    private questionnaireSrv: QuestionnaireService,
    private Billing: BillingService,
    private lookupService: LookupService,
  ) { }

  ngOnInit(): void {
    this.getLocationList();

    setTimeout(() => {
      this.searchDepositSlipsForm.patchValue({
        Salesdate: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }


  getSalesDepositSlipReportData(){
    let formValues = this.searchDepositSlipsForm.getRawValue();
    this.SalesSlipDataList = [];

    if (this.searchDepositSlipsForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }

    let params = {
      SaleDate: Conversions.formatDateObject(formValues.Salesdate) || null,
      LocIds: formValues.BranchId.join(',') || null,
    };
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.GetSalesDepositDocumentBySaleDate(params).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200) {
            if(res.PayLoad.length){
             this.SalesSlipDataList = res.PayLoad;
            }
            else{
              this.toastr.info('No record found');
              this.SalesSlipDataList = [];
            }
      }
      else {
        this.toastr.error('Something Went Wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
      this.spinner.hide(this.spinnerRefs.searchTable)
    })
  }



  getLocationList() {
    this.branchList = [];
    this.lookupService.GetBranches().subscribe((res: any) => {
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        this.branchList = data || [];
        this.branchList = this.branchList.sort((a, b) => {
          if (a.Code > b.Code) {
            return 1;
          } else if (a.Code < b.Code) {
            return -1;
          } else {
            return 0;
          }
        });

      }
    }, (err) => {
      console.log(err);
    });
  }
  onSelectAllBranches() {
    this.searchDepositSlipsForm.patchValue({
      BranchId: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.searchDepositSlipsForm.patchValue({
      BranchId: []
    });
  }

}
