// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { DoctorShareService } from 'src/app/modules/ris/services/doctor-share.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { BillingService } from '../../services/billing.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';

@Component({
  standalone: false,

  selector: 'app-manage-sales-deposit-slips',
  templateUrl: './manage-sales-deposit-slips.component.html',
  styleUrls: ['./manage-sales-deposit-slips.component.scss']
})
export class ManageSalesDepositSlipsComponent implements OnInit {

  branchList = []
  screenIdentity = '';
  saleDocId = null;
  DocTypeId = 4;
  spinnerRefs = {
    searchTable: 'searchTable',
    searchViewTable: 'searchViewTable',
    saveSlipsForm: 'saveSlipsForm'
  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;
  public Fields = {
    Salesdate: ['', Validators.required],
    BranchId: [, Validators.required],
    Title: ['', Validators.required],
    Remarks: ['', Validators.required],
  };

  isSubmitted = false;
  SaveDepositSlipsForm: FormGroup = this.formBuilder.group(this.Fields)

  loadedDocuments: any[];
  docDefault = true;
  maxDate


  // View Sales Slips


  SalesSlipDataList = [];

  searchText = '';


  public slipsFields = {
    Date: ['', Validators.required],
    BranchId: [, Validators.required],
  };

  isSubmittedView = false;
  searchDepositSlipsForm: FormGroup = this.formBuilder.group(this.slipsFields)





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
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.SaveDepositSlipsForm.patchValue({
        Salesdate: Conversions.getCurrentDateObject(),
      });
    }, 200);

    setTimeout(() => {
      this.searchDepositSlipsForm.patchValue({
        Date: Conversions.getCurrentDateObject(),
      });
    }, 200);

    this.maxDate = Conversions.getCurrentDateObject();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    console.log("this.loggedInUser:", this.loggedInUser)
  }

  saveSalesDepositSlipsDate() {
    let formValues = this.SaveDepositSlipsForm.getRawValue();
    let docsToSave = this.formatUploadedDocsData().filter(a => !a.docId || a.docId) || [];
    console.log("saveSalesDepositSlipsDate ~ docsToSave:", docsToSave)
    if (this.SaveDepositSlipsForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    let params = {
      SaleDate: Conversions.formatDateObject(formValues.Salesdate) || null,
      LocId: formValues.BranchId || null,
      Title: formValues.Title || '',
      Remarks: formValues.Remarks || '',
      CreatedBy: this.loggedInUser.userid || -1,
      SaleDocId: this.saleDocId || null,
      Docs: docsToSave,
    };
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.InsertSaleDepositDocument(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200 && res.PayLoad.length) {
        if (res.PayLoad[0].Result == 1) {
          this.toastr.success('Saved deposit slip Successfully');
          this.getSalesDepositSlipReportData();
          this.clearLoadedDocs();
        }
        else {
          this.toastr.warning('Error saving document slip');
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

  getLoadedDocs(event) {
    if (event) {
      this.docDefault = true;
      this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array

      const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document

      if (latestDoc) {
        const base64String = latestDoc.data; // Your base64 image string
        const binaryData = base64String;
        const sizeInBytes = binaryData.length;
        const sizeInKB = sizeInBytes / 1024;
        if (sizeInKB > 200) {
          this.toastr.warning('Image size should be less than 200KB');
          this.clearLoadedDocs();
          return;
        }
      }
    }

  }
  formatUploadedDocsData() {
    let docs = [];
    this.loadedDocuments.filter(a => !a.docId || a.docId).forEach(a => {
      let d = {
        DocId: null,
        Title: a.fileName,
        Remarks: '',
        Doc: null,
        CreatedBy: this.loggedInUser.userid,
        RefId: null,
        DocTypeId: 4,
        GDocBase64: a.data,
        GDocBase64Thumbnail: '',
        GDocFileType: a.fileType,
        DirPath: null
      };
      docs.push(d);
    })

    return docs;
  }


  getSalesDepositSlipReportData() {
    let formValues = this.searchDepositSlipsForm.getRawValue();
    this.SalesSlipDataList = [];

    if (this.searchDepositSlipsForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmittedView = true;
      return;
    }

    let params = {
      SaleDate: Conversions.formatDateObject(formValues.Date) || null,
      LocIds: formValues.BranchId.join(',') || null,
    };
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.GetSalesDepositDocumentBySaleDate(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.SalesSlipDataList = res.PayLoad;
        }
        else {
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

  clearLoadedDocs() {
    this.SaveDepositSlipsForm.reset();
    this.loadedDocuments = [];
    this.getLoadedDocs(null);
    this.docDefault = false;
    this.saleDocId = null;
    this.DocTypeId = null;
  }
  rowIndex = null;
  getTableData(event, index) {
    this.screenIdentity = 'Sales';
    this.rowIndex = index
    console.log("🚀 getTableData ~ event:", event);
    this.spinner.show(this.spinnerRefs.saveSlipsForm)
    setTimeout(() => {
      this.SaveDepositSlipsForm.patchValue({
        Salesdate: Conversions.getCurrentDateObject(),
        BranchId: event.LocId,
        Title: event.Title,
        Remarks: event.Remarks,
      });
      this.spinner.hide(this.spinnerRefs.saveSlipsForm);
      this.saleDocId = event.SaleDocId;
      this.DocTypeId = 4;
    }, 500);
  }

}
