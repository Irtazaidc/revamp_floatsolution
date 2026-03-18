// @ts-nocheck
import { T } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { UserModel } from 'src/app/modules/auth/_models/user.model';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { FbrService } from 'src/app/modules/shared/services/fbr/fbr.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { VisitService } from '../../services/visit.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { from } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';

@Component({
  standalone: false,

  selector: 'app-fbr-invoice-reposting',
  templateUrl: './fbr-invoice-reposting-new.component.html',
  styleUrls: ['./fbr-invoice-reposting.component.scss']
})
export class FbrInvoiceRepostingComponent implements OnInit {
  collectionSize: number = 0;
  paginatedfbrSearchResults: any = [];
  page: number = 1;
  pageSize: number = 10;
  visitDetailPopupRef: NgbModalRef;


  isSpinner: boolean = true;
  unPostedInvoiceList: any;
  unPostedVisitDetails: any;
  selectedVisit = { VisitID: null };
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  loggedInUser: UserModel;
  maxDate: any;


  spinnerRefs = {
    patientInfoBar: 'patientInfoBar',
    visitSamples: 'visitSamples',
    pinsList: 'pinsList'
  }

  searchText = "";


  MACAndPOSAlert = {
    POS: '',
    POSID: '',
    MAC: ''
  };


  fbrRepostingForm = this.fb.group({
    dateFrom: ['', ''],
    dateTo: ['', ''],
  });

  constructor(
    private fbrService: FbrService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private visitService: VisitService,
    private multiApp: MultiAppService,
    private helperSrv: HelperService,
    private fb: FormBuilder,
    private appPopupService: AppPopupService,

  ) { }


  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getUnpostedInvoices();

    setTimeout(() => {
      this.fbrRepostingForm.patchValue({
        dateFrom: Conversions.getCurrentDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
      this.maxDate = Conversions.getCurrentDateObject();
    }, 200);
  }

  @ViewChild("visitDetailModal") visitDetailModal;
  visitDetailProcess(visitId: number) {
    this.getUnPotsedFBRVisitDetails(visitId);
    this.visitDetailPopupRef = this.appPopupService.openModal(
      this.visitDetailModal,
      { backdrop: "static", size: "xl" }
    );
  }





  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    this.getMACAddress(this.loggedInUser);
  }

  isSubmitted = false;

  getUnpostedInvoices() {
    this.unPostedInvoiceList = [];
    this.unPostedVisitDetails = {};
    this.selectedVisit = { VisitID: null };

    let formValues = this.fbrRepostingForm.getRawValue()
    const dateFrom = formValues.dateFrom;
    const dateTo = formValues.dateTo;
    const fromDate: any = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day);
    const toDate: any = new Date(dateTo.year, dateTo.month - 1, dateTo.day);

    // Check if DateTo is earlier than DateFrom
    if (toDate < fromDate) {
      this.toastr.error('DateTo should be equal or greater than DateFrom');
      this.isSubmitted = false;
      return;
    }

    // Set the allowed range based on screenIdentity
    const maxDaysDifference = 30;
    const daysDifference = Math.abs((toDate - fromDate) / (1000 * 3600 * 24));

    if (daysDifference > maxDaysDifference) {
      const period = '1 month';
      this.toastr.error(`The difference between dates should not exceed ${period}`);
      this.isSubmitted = false;
      return;
    }

    if (this.fbrRepostingForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }



    let param = {
      DateFrom: formValues.dateFrom ? Conversions.formatDateObject(formValues.dateFrom) : null,
      DateTo: formValues.dateTo ? Conversions.formatDateObject(formValues.dateTo) : null
    }
    this.spinner.show(this.spinnerRefs.pinsList);
    this.fbrService.getUnPostedFBRInvoices(param).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.pinsList);
      this.unPostedInvoiceList = resp.PayLoad;
      if (this.unPostedInvoiceList && this.unPostedInvoiceList.length) {

        this.unPostedInvoiceList.forEach(item => {
          try {
            item.ResponseJSON = JSON.parse(item.ResponseJSON);
            item.RequestJSON = JSON.parse(item.RequestJSON);
          } catch (e) { }
        });
      }

    }, (err) => {
      console.log("err", err);
      this.spinner.hide(this.spinnerRefs.pinsList);
    })
  }
  refreshPagination() {
    this.collectionSize = this.unPostedInvoiceList.length;
    this.paginatedfbrSearchResults = this.unPostedInvoiceList
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  getUnPotsedFBRVisitDetails(_visitId) {
    this.unPostedVisitDetails = {};
    this.selectedVisit = { VisitID: null };
    this.spinner.show(this.spinnerRefs.visitSamples);
    this.fbrService.getUnPotsedFBRVisitDetails({ VisitId: _visitId }).subscribe((resp: any) => {
      // console.log('Actual Data.............................', resp);
      this.spinner.hide(this.spinnerRefs.visitSamples);
      this.unPostedVisitDetails = resp.PayLoadDS;
      this.selectedVisit = { VisitID: _visitId };
      if (this.unPostedVisitDetails && this.unPostedVisitDetails.Table2 && this.unPostedVisitDetails.Table2.length) {
        // this.selectedVisit = this.unPostedVisitDetails.Table2;
        this.unPostedVisitDetails.Table2.forEach(item => {
          try {
            item.RequestJSON = JSON.parse(item.RequestJSON);
            // item.RequestJSON.InvoiceTypeText = CONSTANTS.INVOICE_TYPES[item.RequestJSON.InvoiceType];
            // item.RequestJSON.PaymentModeText = CONSTANTS.PAYMENT_MODES[item.RequestJSON.PaymentMode];
            //   item.RequestJSON.Items.forEach(element => {
            //   element.InvoiceTypeText = CONSTANTS.INVOICE_TYPES[element.InvoiceType]; 
            // });
          } catch (e) { }
          try {
            item.ResponseJSON = JSON.parse(item.ResponseJSON);
            try {
              item.ResponseJSON.PayLoadStr = JSON.parse(item.ResponseJSON.PayLoadStr || '');
            } catch (e) { }
          } catch (e) { }
        });
      }
    }, (err) => {
      console.log("err", err);
      this.spinner.hide(this.spinnerRefs.visitSamples);
    })
  }
  repostFBRInvoice(visit) {
    this.spinner.show();
    if (visit && visit.VisitID && visit.FBRRequestID && this.unPostedVisitDetails.Table2 && this.unPostedVisitDetails.Table2.length && this.unPostedVisitDetails.Table2.find(a => a.FBRRequestID == visit.FBRRequestID)) {
      // if(this.unPostedVisitDetails && this.unPostedVisitDetails.Table2 && this.unPostedVisitDetails.Table2.length && this.unPostedVisitDetails.Table2[0].RequestJSON) {
      let regModule = '3';
      let userWithoutPic: UserModel = JSON.parse(JSON.stringify(this.loggedInUser));
      userWithoutPic.pic = '';
      let details = {
        appVersion: CONSTANTS.APP_VERSION,
        webDeskVersion: this.auth.getWebDeskVersionFromStorage(),
        user: userWithoutPic
      };

      let params = {
        CreatedBy: this.loggedInUser.userid,
        BranchId: this.loggedInUser.locationid,
        MACAddress: this.loggedInUser.macAdr,
        FBRTransID: 0,

        // FBR
        FBRRequestData: (this.unPostedVisitDetails.Table2.find(a => a.FBRRequestID == visit.FBRRequestID).RequestJSON), // JSON.parse(this.unPostedVisitDetails.Table2[0].RequestJSON),

        Module: regModule,
        Remarks: '',
        SystemDetails: JSON.stringify(details),
      }
      this.fbrService.reportFBRVisitData(params).subscribe((resp: any) => {
        this.spinner.hide();
        if (resp && resp.StatusCode == 200) {
          this.toastr.success('FBR Data Posted');
        } else {
          let apiErrorMsg = "";
          if (resp && resp.Error) {
            apiErrorMsg = resp.Error;
          }
          this.toastr.error('Error Reposting FBR Data. ' + apiErrorMsg);
        }
        this.getUnpostedInvoices();
      }, (err) => {
        this.spinner.hide();
        console.log(err);
        let errorMsg = '';
        if (err && err.message) {
          errorMsg = err.message;
        }
        this.toastr.error('Error Reposting FBR Data. Reason: ' + errorMsg);
      })
    }
  }

  isBatchSpinner = false;
  isPosting = false;
  visitPostStatus: { [visitId: number]: 'success' | 'fail' | 'skipped' | 'loading' } = {};


  async repostSelectedVisits() {
    if (this.selectedVisits.length === 0) {
      this.toastr.warning('Please select at least one visit to repost.');
      return;
    }

    this.isBatchSpinner = true;

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    const regModule = '3';
    const userWithoutPic: UserModel = JSON.parse(JSON.stringify(this.loggedInUser));
    userWithoutPic.pic = '';

    const details = {
      appVersion: CONSTANTS.APP_VERSION,
      webDeskVersion: this.auth.getWebDeskVersionFromStorage(),
      user: userWithoutPic
    };
    for (const visitId of this.selectedVisits) {
      const visit = this.unPostedInvoiceList.find(v => v.VisitID === visitId);
      const fbrTransId = visit?.FBRTransID;

      // Skip if visit or FBRTransID or ResponseJSON is missing
      if (!visit || !fbrTransId || !visit.RequestJSON) {
        this.visitPostStatus[visitId] = 'skipped';
        skippedCount++;
        continue;
      } 
      const params = {
        CreatedBy: this.loggedInUser.userid,
        VisitId: visitId,
        BranchId: this.loggedInUser.locationid,
        MACAddress: this.loggedInUser.macAdr,
        FBRTransID: fbrTransId,
        FBRRequestData: visit.RequestJSON, // assuming ResponseJSON contains RequestJSON
        Module: regModule,
        Remarks: '',
        SystemDetails: JSON.stringify(details)
      };

      this.visitPostStatus[visitId] = 'loading'; // start spinner

      const res: any = await this.fbrService.reportFBRVisitData(params).toPromise();

      if (res?.StatusCode === 200) {
        successCount++;
        this.visitPostStatus[visitId] = 'success';
      } else {
        failCount++;
        this.visitPostStatus[visitId] = 'fail';

        const errorMsg = res?.Message || 'Failed to repost visit due to an unknown server response.';
        this.toastr.error(`Visit ${visitId}: ${errorMsg}`);
        console.warn(`Reposting failed for Visit ${visitId} with status ${res?.StatusCode}: ${errorMsg}`, res);
      }
    }

    this.isBatchSpinner = false;
    this.selectedVisits = [];
    this.getUnpostedInvoices(); // refresh data

    // Toastr notifications
    if (successCount > 0) {
      this.toastr.success(`${successCount} invoice(s) reposted successfully.`);
    }
    if (failCount > 0) {
      this.toastr.error(`${failCount} invoice(s) failed to repost.`);
    }
    if (skippedCount > 0) {
      this.toastr.warning(`${skippedCount} invoice(s) were skipped due to missing data.`);
    }
  }


  getFinalDataSet() {
    let regModule = '3';

    let userWithoutPic: UserModel = JSON.parse(JSON.stringify(this.loggedInUser));
    userWithoutPic.pic = '';
    let details = {
      appVersion: CONSTANTS.APP_VERSION,
      webDeskVersion: this.auth.getWebDeskVersionFromStorage(),
      user: userWithoutPic
    };

    let RegistrationModel: any = {
      CreatedBy: this.loggedInUser.userid,
      BranchId: this.loggedInUser.locationid,
      MACAddress: this.loggedInUser.macAdr || '',
      FBRTransID: 0,

      FBRRequestData: '',

      Module: regModule,
      Remarks: '',
      SystemDetails: JSON.stringify(details),
    }
    RegistrationModel.FBRRequestData = this.formatDataForFBR(this.unPostedVisitDetails);
    return RegistrationModel;
  }

  formatDataForFBR(data) {
    let testsData = data.Table1 || [];
    let visitData = data.Table.length ? data.Table[0] : {};

    // tax calculation formula
    // (ActualPrice * TaxRate/100) + (ActualValue) = ValueWithTax
    // (ActualValue * 17 + ActualValue * 100) / 100
    // ActualValue(17 + 100)
    // (ValueWithTax * 100) / (TaxRate + 100)
    // (900 * 100) / (TaxRate + 100) = 769.2308

    let params = {
      "InvoiceNumber": "",
      "POSID": visitData.POSID, // 966130
      "USIN": visitData.VisitID, // VisitId
      // "RefUSIN": null,
      "DateTime": new Date(),
      // "BuyerName": "Buyer Name",
      // "BuyerNTN": "1234567-8",
      // "BuyerCNIC": "12345-1234567-8",
      // "BuyerPhoneNumber": "0000-0000000",
      "TotalSaleValue": visitData.TotalSaleValue,
      "TotalTaxCharged": visitData.TotalTaxCharged,
      "TotalQuantity": visitData.TotalQuantity,
      "Discount": visitData.Discount,
      // "FurtherTax": 0.0,
      "TotalBillAmount": visitData.TotalBillAmount,
      "PaymentMode": visitData.PaymentMode, // {1: Cash, 2: Card, 3: Gift Voucher, 4: Loyalty Card, 5: Mixed, 6: Cheque}
      "InvoiceType": visitData.InvoiceType, // {1: New, 2: Debit, 3: Credit}
      "Items": []
    };
    testsData.forEach(tp => {
      let item = {
        "ItemCode": tp.ItemCode,
        "ItemName": tp.ItemName,
        "PCTCode": tp.PCTCode || '98160000', // {radiology: '98179000', lab: '98160000'} , // "98173000", // "11001010", https://download1.fbr.gov.pk/Docs/2021101313103753401chapte-98&99.pdf // page 4
        "Quantity": tp.Quantity || 1,
        "TaxRate": tp.TaxRate,
        "SaleValue": tp.SaleValue,
        "Discount": tp.Discount,
        // "FurtherTax": 0.0,
        "TaxCharged": tp.TaxCharged,
        "TotalAmount": tp.TotalAmount,
        "InvoiceType": tp.InvoiceType
        // "RefUSIN": null
      }
      params.Items.push(item);
    });


    return params;
  }

  getInvoiceTypeText(invoiceTypeId) {
    return CONSTANTS.INVOICE_TYPES[invoiceTypeId] || '';
  }
  getPaymentModeText(paymentModeId) {
    return CONSTANTS.PAYMENT_MODES[paymentModeId] || '';
  }

  getMACAddress(loggedInUser: UserModel) {
    // setTimeout(() => {
    let obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'get-mac', userIdentity: JSON.stringify(obj) });
    // this.sendCommand({ command: 'get-version', userIdentity: JSON.stringify(obj) });
    // }, 5000);

    setTimeout(() => {
      if (!this.loggedInUser.macAdr) {
        this.MACAndPOSAlert.MAC = 'MAC not found, Registrations will be blocked on this PC';
      }
      this.getPOSID();
    }, 5000);
    this.getPOSID();
  }
  getPOSID() {
    let params = {
      macAddress: this.loggedInUser.macAdr,
      branchId: this.loggedInUser.locationid,
      userId: this.loggedInUser.userid
    }

    this.spinner.show();
    this.visitService.getPOSID(params).subscribe((res: any) => {
      this.spinner.hide();
      // console.log(res);
      if (res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
        // res.PayLoad[0].POSID = '123123';
        if (res.PayLoad[0].POSID && res.PayLoad[0].POSID != '0') {
          this.MACAndPOSAlert.POSID = res.PayLoad[0].POSID
          this.MACAndPOSAlert.POS = ''; // `(${'POSID: ' +  res.PayLoad[0].POSID})`;
          this.auth.updateUserDetails('posId', res.PayLoad[0].POSID, false);
        } else {
          this.MACAndPOSAlert.POSID = '';
          this.MACAndPOSAlert.POS = `POSID not found, Registrations will be blocked on this PC (${'POSID: ' + res.PayLoad[0].POSID})`;
        }
      } else {
        this.MACAndPOSAlert.POS = 'POSID not found, Registrations will be blocked on this PC';
        let apiErrorMsg = "";
        if (res && res.Error) {
          apiErrorMsg = res.Error;
        }
        this.toastr.error('Error, Error Getting POSID. ' + apiErrorMsg);
      }
    }, (err) => {
      this.spinner.hide();
      console.log(err);
      let errorMsg = '';
      if (err && err.message) {
        errorMsg = err.message;
      }
      this.toastr.error('Error Error Getting POSID: ' + errorMsg);
      this.MACAndPOSAlert.POS = 'POSID not found, Registrations will be blocked on this PC';
    });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }


  selectedVisits: any[] = [];
  selectAll: boolean = false;

  toggleAllCheckboxes() {
    if (this.selectAll) {
      this.selectedVisits = [...this.unPostedInvoiceList.map(v => v.VisitID)];
    } else {
      this.selectedVisits = [];
    }
  }

  toggleVisitSelection(visitId: any) {
    const index = this.selectedVisits.indexOf(visitId);
    if (index > -1) {
      this.selectedVisits.splice(index, 1);
    } else {
      this.selectedVisits.push(visitId);
    }

    // Update "Check All" checkbox based on selection
    this.selectAll = this.selectedVisits.length === this.unPostedInvoiceList.length;
  }


}