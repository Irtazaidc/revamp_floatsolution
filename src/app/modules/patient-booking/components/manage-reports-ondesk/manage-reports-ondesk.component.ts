// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { BillingService } from 'src/app/modules/billing/services/billing.service';
import { DoctorShareService } from 'src/app/modules/ris/services/doctor-share.service';
import { QuestionnaireService } from 'src/app/modules/ris/services/questionnaire.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { LookupService } from '../../services/lookup.service';
import { VisitService } from '../../services/visit.service';

@Component({
  standalone: false,

  selector: 'app-manage-reports-ondesk',
  templateUrl: './manage-reports-ondesk.component.html',
  styleUrls: ['./manage-reports-ondesk.component.scss']
})
export class ManageReportsOndeskComponent implements OnInit {


  branchList = []
  screenIdentity = '';
  saleDocId = null;

  mainChk;
  PatientId = null;

  DocTypeId = 4;
  spinnerRefs = {
    searchTable: 'searchTable',
    searchViewTable: 'searchViewTable',
    saveSlipsForm: 'saveSlipsForm'
  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  loggedInUser: UserModel;
 
  loadedDocuments: any[];
  docDefault = true;
  maxDate
  selectedVisitID = null;

  // View Sales Slips

  isMainDissabledChk = true;
  isDissabledChk = true;

  visitDataList = [];
  searchedDataList = [];

  searchText = '';


  public slipsFields = {
    Date: ['', Validators.required],
    BranchId: [, Validators.required],
  };

  isSubmittedView = false;
  isSubmitted = false;
  searchForm: FormGroup = this.formBuilder.group(this.slipsFields)






  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private Billing: BillingService,
    private lookupService: LookupService,
    private visitService: VisitService,
  ) { }

  ngOnInit(): void {
    this.getLocationList();
    this.loadLoggedInUserInfo();
    setTimeout(() => {
      this.searchForm.patchValue({
        Date: Conversions.getCurrentDateObject(),
      });
    }, 200);

    this.maxDate = Conversions.getCurrentDateObject();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  receiveSelectedTest() {
    const checkedItems = this.visitDetails.filter(a => a.checked);
    console.log("checkedItems:", checkedItems)
    if (!checkedItems.length) {
      this.toastr.warning("Please select item(s) to update");
        return;
    }
    if (!this.selectedVisitID) {
      this.toastr.warning("VisitId isn't being provided");
        return;
    }
    const params = {
      VisitId: this.selectedVisitID,
      TPIds: checkedItems.map(tp => tp.TPId).join(","),
      CreatedBy: this.loggedInUser.userid || -1,
      SourceId: 1, // for WEB
      LocationId: this.loggedInUser.locationid || null,
     
    };
    console.log("receiveSelectedTest ~ params:", params)
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.UpdateStatusOnDeskByVisitTPId(params).subscribe((res: any) => {
      console.log("UpdateStatusOnDeskByVisitTPId ~ res:", res)
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200 && res.PayLoad.length) {
        if (res.PayLoad[0].Result == "Successfull") {
          this.toastr.success('Selected reports received on desk');
          this.getVisitDetails(this.selectedVisitID)
        }
        else {
          this.toastr.warning('Error!');
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

  // getLoadedDocs(event) {
  //   if (event) {
  //     this.docDefault = true;
  //     this.loadedDocuments = Array.isArray(event) ? event : [event]; // Ensure event is an array

  //     const latestDoc = this.loadedDocuments[this.loadedDocuments.length - 1]; // Get the latest loaded document

  //     if (latestDoc) {
  //       const base64String = latestDoc.data; // Your base64 image string
  //       const binaryData = base64String;
  //       const sizeInBytes = binaryData.length;
  //       const sizeInKB = sizeInBytes / 1024;
  //       if (sizeInKB > 200) {
  //         this.toastr.warning('Image size should be less than 200KB');
  //         this.clearLoadedDocs();
  //         return;
  //       }
  //     }
  //   }

  // }
  // formatUploadedDocsData() {
  //   let docs = [];
  //   this.loadedDocuments.filter(a => !a.docId).forEach(a => {
  //     let d = {
  //       DocId: null,
  //       Title: a.fileName,
  //       Remarks: '',
  //       Doc: null,
  //       CreatedBy: this.loggedInUser.userid,
  //       RefId: null,
  //       DocTypeId: 4,
  //       GDocBase64: a.data,
  //       GDocBase64Thumbnail: '',
  //       GDocFileType: a.fileType,
  //       DirPath: null
  //     };
  //     docs.push(d);
  //   })

  //   return docs;
  // }

  
  selectAllItems(checked: boolean) {
    this.visitDetails.forEach(sec => {
      if (sec.TestStatusId === 9) {
        sec.checked = checked; // Only set checked for items where TestStatusId is 9
      }
    });
  }

    onSelectedVisit(e){
      const checked:boolean = e.checked ;

    }
    getVisitData() {
    const formValues = this.searchForm.getRawValue();
    this.searchedDataList = [];

    if (this.searchForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmittedView = true;
      return;
    }

    const params = {
      DateFrom: Conversions.formatDateObject(formValues.Date) || null,
      DateTo: Conversions.formatDateObject(formValues.Date) || null,
      BranchIDs: formValues.BranchId.join(',') || null,
    };
    this.spinner.show(this.spinnerRefs.searchTable)
    this.Billing.getVisitIDByLocID(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.searchTable)
      if (res.StatusCode === 200) {
        if (res.PayLoad.length) {
          this.searchedDataList = res.PayLoad;
          this.searchedDataList[0].VisitID ? this.getTableData(this.searchedDataList[0],0):this.toastr.info('VisitId not found');
        }
        else {
          this.toastr.info('No record found');
          this.searchedDataList = [];
          this.visitDetails = null;
          this.selectedVisitID = null;
          this.PatientId = null;
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
    this.searchForm.patchValue({
      BranchId: this.branchList.map(a => a.LocId)
    });
  }
  onUnselectAllBranches() {
    this.searchForm.patchValue({
      BranchId: []
    });
  }

  // clearLoadedDocs() {
  //   this.loadedDocuments = [];
  //   this.getLoadedDocs(null);
  //   this.docDefault = false;
  //   this.saleDocId = null;
  //   this.DocTypeId = null;
  // }
  rowIndex = null;
  getTableData(event, index) {
    console.log("🚀 getTableData ~ event:", event);
    this.selectedVisitID = null;
    this.PatientId = null;
    setTimeout(() => {
      this.rowIndex = index;
      this.getVisitDetails(event.VisitID);
      this.selectedVisitID = event.VisitID;
      this.PatientId = event.PatientID
    }, 300);
  }

  visitDetails:any;
  VisitID=null;
  billingInfo = [];
  getVisitDetails(visitID) {
    const params = { VisitId: visitID };
     this.visitDetails = [];
     this.billingInfo = [];
     this.totalDifference = 0;
    if (params.VisitId) {
      this.spinner.show(this.spinnerRefs.saveSlipsForm);
      this.visitService.getVisitDetails(params).subscribe((res: any) => {
        this.spinner.hide(this.spinnerRefs.saveSlipsForm);
        console.log(res);
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          this.visitDetails = res.PayLoadDS.Table2.length ? res.PayLoadDS.Table2 : null; //{
          //   pateintInfo: res.PayLoadDS.Table.length ? res.PayLoadDS.Table[0] : null,
          //   visitInfo: res.PayLoadDS.Table1.length ? res.PayLoadDS.Table1[0] : null,
          //   // tpInfo: res.PayLoadDS.Table2 || [],
            this.billingInfo = res.PayLoadDS.Table3 || [],
            this.countDueBalance()
          //   // paymentInfo: res.PayLoadDS.Table4 || []
          // } 
          console.log("🚀this.visitDetails:", this.visitDetails)
        } 
      }, (err) => {
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide();
      })
    } else {
      this.toastr.warning('Invalid');
    }
  }
  totalDifference = 0;
  countDueBalance(){
    this.totalDifference = 0;
    // this.billingInfo.forEach((item) => {
    //   const paidAmount = item.ReceivedAmount != item.NetAmount ? Math.abs( (item.PaidAmount + item.ReceivedAmount)):item.PaidAmount;
    //   const DueBalance =  Math.abs((item.NetAmount - item.PaidAmount)-item.ReceivedAmount)
    //   this.totalDifference =  paidAmount != item.NetAmount ? DueBalance: 0;
    //   console.log(" this.totalDifference:", this.totalDifference)
     
    // });
    this.billingInfo.forEach((item) => {
      // const paidAmount = item.ReceivedAmount !== item.NetAmount ? item.PaidAmount + item.ReceivedAmount : item.PaidAmount;
      const dueBalance = (item.NetAmount || 0) - (item.ReceivedAmount || 0) - (item.AdjAmount || 0) - (item.RefundAmount || 0)
      this.totalDifference = dueBalance || 0; //item.ReceivedAmount !== item.NetAmount ? Math.abs(dueBalance) : 0;
      console.log("this.totalDifference:", this.totalDifference);
    });
  }

}

