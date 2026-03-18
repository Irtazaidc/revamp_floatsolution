// @ts-nocheck
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { LookupService } from '../../../patient-booking/services/lookup.service';
import { environment } from '../../../../../environments/environment';

// import { VisitService } from '../../services/visit.service';
import { VisitService } from '../../../patient-booking/services/visit.service';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';

@Component({
  standalone: false,

  selector: 'app-inquiry-report-inner',
  templateUrl: './inquiry-report-inner.component.html',
  styleUrls: ['./inquiry-report-inner.component.scss']
})
export class InquiryReportInnerComponent implements OnInit {

  @Input('buttonControls') buttonControls = [''];

  @ViewChild('visitInfoArea') private visitInfoArea: ElementRef;

  @ViewChild('receiveInstallmentPopup') receiveInstallmentPopup;
  receiveInstallmentPopupRef: NgbModalRef;
  @ViewChild('tpCancellationPopup') tpCancellationPopup;
  tpCancellationPopupRef: NgbModalRef;

  loggedInUser: UserModel;

  patientSearchParams = {
    PatientID: '',
    BookingID: '',
    PVNo: '',
    FirstName: '',
    LastName: '',
    CNIC: '',
    PassportNo: '',
    MobileNO: ''
  }

  searchResults = [{ Message: 'No Record(s) Found' }];
  // filteredSearchResults = [];
  // paginatedSearchResults = [];
  page = 1;
  pageSize = 5;
  collectionSize = 0;

  paymentModes = [];

  selectedVisit: any = null;
  visitDetails: any = {
    pateintInfo: null,
    visitInfo: null,
    tpInfo: [],
    billingInfo: [],
    paymentInfo: []
  };

  tpStatusForCancellation = [1, 2, 3, 6];
  tpStatusForRequestForCancellation = [4, 5, 7, 8];

  // tpStatusForCancellation = [1, 2, 3, 4, 5];
  // tpStatusForCancellation_LAB = [1, 2, 3];
  // tpStatusForCancellation_RAD = [1, 2, 3, 4, 5];
  tpListForCancellation = [];

  // tpStatusForRequestForCancellation = [6, 7, 8];
  // tpStatusForRequestForCancellation_LAB = [4, 5, 6, 7, 8];
  // tpStatusForRequestForCancellation_RAD = [6, 7, 8];
  tpListForRequestForCancellation = [];





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

  visitInstallmentForm = this.fb.group({
    visitId: null,
    totalCharges: [0],
    alreadyReceivedAmount: [0],
    balance: [0],
    receivingAmount: [0, [Validators.required, Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero))]],
    balanceAfterReceiving: [0],
    paymentMode: [1, [Validators.required, Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero))]],
    CCNo: [''],
    InstOwner: [''],
    CCTNo: [''],
  });
  visitInstallmentFormSubmitted = false;

  tpCancellationForm = this.fb.group({
    refundAmount: [{ value: 0, disabled: true }, [Validators.required, Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero))]],
    paymentMode: [1, [Validators.required, Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero))]],
    balance: [{ value: 0, disabled: true }],
    remarks: ['', [Validators.required, Validators.minLength(10)]],
    instNo: [null],
    instInvoiceNo: [null],
    CCNo: [''],
    InstOwner: [null],
    CCTNo: [''],
  });
  tpCancellationFormSubmitted = false;


  selectedTabIndex = 0;
  invoiceCopyType = 1;
  constructor(
    // private patientService: PatientService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    // private modalService: NgbModal,
    // private route: ActivatedRoute,
    // private storageService: StorageService,
    private auth: AuthService,
    private appPopupService: AppPopupService,
    private fb: FormBuilder,
    private lookupService: LookupService,
    public helperService: HelperService,
    private visitService: VisitService,
    private multiApp: MultiAppService,
    private risSharedService: SharedService
  ) { }


  ngOnInit(): void {
    this.loadLoggedInUserInfo();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.getMACAddress(this.loggedInUser);
  }


  onTabChanged($event) {
    // let clickedIndex = $event.index;
    // console.log('onTabChanged ', $event, $event.index);

    this.tpCancellationForm.reset();
    this.tpCancellationForm.patchValue({
      paymentmode: 1
    });
    this.tpCancellationFormSubmitted = false;

    this.tpListForCancellation.forEach(element => {
      element.checked = false;
    });
    this.tpListForRequestForCancellation.forEach(element => {
      element.checked = false;
    });
    this.cancellationTPChecked();
  }

  VisitID=null;
  getVisitDetails(visitID) {
    let params = { VisitId: visitID };
    this.visitDetails = {
      pateintInfo: null,
      visitInfo: null,
      tpInfo: [],
      billingInfo: [],
      paymentInfo: []
    }
    if (params.VisitId) {
      this.spinner.show();
      this.visitService.getVisitDetails(params).subscribe((res: any) => {
        this.scrollToBottom();
        this.spinner.hide();
        // console.log(res);
        if (res && res.StatusCode == 200 && res.PayLoadDS) {
          // this.visitDetails = res.PayLoadDS;

          this.visitDetails = {
            pateintInfo: res.PayLoadDS.Table.length ? res.PayLoadDS.Table[0] : null,
            visitInfo: res.PayLoadDS.Table1.length ? res.PayLoadDS.Table1[0] : null,
            tpInfo: res.PayLoadDS.Table2 || [],
            billingInfo: res.PayLoadDS.Table3 || [],
            paymentInfo: res.PayLoadDS.Table4 || []
          }
          // subtract Rewart Points amount
          if (this.visitDetails.billingInfo.length) {
            // this.visitDetails.billingInfo[0].ReceivedAmount = this.visitDetails.billingInfo[0].ReceivedAmount - this.visitDetails.paymentInfo.filter(a => a.ModeId == 5).map(a => a.Amount).reduce((acu, a) => {return acu+a;}, 0);
            this.visitDetails.billingInfo[0].RewardPointsAmount = this.visitDetails.paymentInfo.filter(a => a.ModeId == 5).map(a => a.Amount).reduce((acu, a) => { return acu + a; }, 0);
          }
          this.visitDetails.tpInfo.forEach(a => { a.DiscountedPrice = (a.Price || 0) - (a.Discount || 0) });


          if (this.visitDetails.billingInfo && this.visitDetails.billingInfo.length) {
            this.visitInstallmentForm.patchValue({
              visitId: (visitID || '').toString().replaceAll('-', ''), // this.visitDetails.Table1.length ? (this.visitDetails.Table1[0].PIN) : null,
              totalCharges: (this.visitDetails.billingInfo[0].NetAmount || 0),
              alreadyReceivedAmount: this.visitDetails.billingInfo[0].ReceivedAmount || 0,
              balance: ((this.visitDetails.billingInfo[0].NetAmount || 0) - (this.visitDetails.billingInfo[0].PaidAmount || 0) - (this.visitDetails.billingInfo[0].AdjAmount || 0)),
              receivingAmount: 0,
              balanceAfterReceiving: 0,
              paymentMode: 1,
              CCNo: '',
              InstOwner: '',
              CCTNo: '',
            });
            this.setCreditCardFieldsValidators(false, this.visitInstallmentForm);
          }
        } else {
        }
        if(this.visitDetails.tpInfo.length){
          this.getVisitTestInquiry(this.visitDetails.tpInfo[0].TPId,0);
        }
      }, (err) => {
        this.scrollToBottom();
        this.toastr.error('Connection error');
        console.log(err);
        this.spinner.hide();
      })
    } else {
      this.toastr.warning('Invalid');
    }
  }

  spinnerRefs = {
    inquiryListSection: 'inquiryListSection'
  }

  rowIndex = null;
  inquiryList = [];
  TPID=null;
  getVisitTestInquiry(TPId,i){
    this.TPID = TPId;
    this.rowIndex = i;
    let objParams={
      VisitID:this.VisitID,
      TpIDs:TPId
    }
    this.spinner.show(this.spinnerRefs.inquiryListSection);
    this.risSharedService.getData(API_ROUTES.GET_VISIT_TEST_INQUIRY, objParams).subscribe((res: any) => {
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
  openInquiryReport(){
    const url = environment.patientReportsPortalUrl + 'inquiry-report?p=' + btoa(JSON.stringify({ VisitID: this.VisitID, TPID: this.TPID }));
    let winRef = window.open(url.toString(), '_blank');
  }

  getPaymentModes(filter = null) {
    this.paymentModes = [];
    let params = { filter: filter };
    this.spinner.show();
    this.lookupService.getPaymentModes(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.StatusCode == 200 && res.PayLoad) {
        this.paymentModes = res.PayLoad;
      } else {
        this.toastr.error('Error loading Payment Modes');
      }
    }, (err) => {
      this.toastr.error('Connection error - payment modes');
      console.log(err);
      this.spinner.hide();
    })
  }

  cancelVisit(visit) {
    return;
    // console.log(visit);
    let params = {
      VisitID: visit.VisitID
    }
    this.spinner.show();
    this.visitService.cancelVisit(params).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.statusCode == 200) {
        this.toastr.success('Visit cancelled successfully');
        this.selectedVisit = null;
        // this.visitDetails = '';
      } else {
        this.toastr.error('Error cancelling visit.');
      }
    }, (err) => {
      this.toastr.error('Error cancelling visit');
      this.spinner.hide();
    })
  }
  cancelVaccineDose(vaccineDose) {
    // console.log(vaccineDose);
  }


  selectVisit(visit) {
    this.VisitID = visit.VisitID||null;
    // console.log(visit);
    this.selectedVisit = visit;
    if (visit && visit.VisitID) {
      this.getVisitDetails(visit.VisitID);
    } else {
      this.toastr.warning('No record found');
    }
  }
  openCovidVaccineCard(visit) {
    // const url = window.location.href.split('#')[0] + '#/vaccine-card' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, patientID: visit.patientID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }

  newRegistration() {
    const _url = ['pat-reg/reg'] || [];
    this.helperService.updateUrlParams_navigateTo(_url);
  }

  patientSelected(patient) {
    const _url = ['pat-reg/reg'] || [];
    this.helperService.updateUrlParams_navigateTo(_url, { p: btoa(JSON.stringify({ patientID: patient.patientID, orbitPatientID: patient.orbitPatientID })) });
    // this.router.navigate(
    //   _url, {
    //     // relativeTo: this.route,
    //     replaceUrl: true,
    //     queryParams: {p: btoa(JSON.stringify( {patientID: patient.patientID} ))},
    //     // queryParamsHandling: 'merge', // remove to replace all query params by provided
    //   }
    // );

    // this.router.navigate(
    //   _url,
    //   {
    //     relativeTo: this.route,
    //     replaceUrl: true,

    //     // queryParamsHandling: 'merge', // remove to replace all query params by provided
    //   });
    // }

  }


  // refreshPagination() {
  //   this.collectionSize = this.filteredSearchResults.length;
  //   this.paginatedSearchResults = this.filteredSearchResults
  //     .map((item, i) => ({id: i + 1, ...item}))
  //     .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  // }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.visitInfoArea.nativeElement.scrollIntoView();
        // this.visitInfoArea.nativeElement.scroll({
        //   top: this.visitInfoArea.nativeElement.scrollHeight,
        //   left: 0,
        //   behavior: 'smooth'
        // });
      } catch (err) { }
    }, 500);
  }

  patientVisitEvent(event) {
    this.selectVisit(event);
    // this.getVisitDetails(event.VisitID);
  }

  cancellationTPChecked() {
    // console.log(e);

    let arrayOfTests = this.visitDetails.tpInfo;
    if (this.selectedTabIndex == 0) {
      arrayOfTests = this.tpListForCancellation;
    } else if (this.selectedTabIndex == 1) {
      arrayOfTests = this.tpListForRequestForCancellation;
    }

    setTimeout(() => {

      let amountToRefund = 0;
      let testsAmountAfterRefund = this.visitDetails.tpInfo.filter(a => a.TestStatusId > 0).filter(a => !a.checked).map(a => a.DiscountedPrice || 0).reduce((acu, a) => { return acu + a; }, 0);
      if (this.visitDetails.tpInfo.filter(a => a.checked).length) {
        // subtract Rewart Points amount
        amountToRefund = testsAmountAfterRefund - (this.visitDetails.billingInfo[0].ReceivedAmount - this.visitDetails.billingInfo[0].RewardPointsAmount); // this.visitDetails.paymentInfo.filter(a => a.ModeId == 5).map(a => a.Amount).reduce((acu, a) => {return acu+a;}, 0));
        if (amountToRefund > 0) {
          amountToRefund = 0;
        }
      }

      this.tpCancellationForm.patchValue({
        refundAmount: amountToRefund, // arrayOfTests.filter( a => a.checked).map(a=>a.DiscountedPrice || 0).reduce((acu, a) => {return acu+a;}, 0)
        balance: this.visitDetails.tpInfo.filter(a => a.TestStatusId > 0).map(a => a.DiscountedPrice || 0).reduce((acu, a) => { return acu + a; }, 0) - this.visitDetails.billingInfo[0].ReceivedAmount
      });
      // this.refundAmountValueChangeEvent();
    }, 500);
  }
  cancellationTPChecked_All(checked) {
    // console.log('aaaaaaaaaaaaaaaaaaa =>>>>> ', checked);

    let arrayOfTests = this.visitDetails.tpInfo;
    if (this.selectedTabIndex == 0) {
      arrayOfTests = this.tpListForCancellation;
    } else if (this.selectedTabIndex == 1) {
      arrayOfTests = this.tpListForRequestForCancellation;
    }
    arrayOfTests.forEach(element => {
      element.checked = checked;
    });

    this.cancellationTPChecked();
  }

  openCancellationForm() {
    if (this.visitDetails.paymentInfo.find(a => a.ModeId == 5)) { // Discount Card
      this.toastr.info('Cancellation not allowed due to <b>Reward Points</b> usage', '', { enableHtml: true, timeOut: 5000 });
      return;
    }
    this.selectedTabIndex = 0;
    this.onTabChanged({ index: this.selectedTabIndex });
    this.getPaymentModes('visit-installment');
    this.tpCancellationForm.reset();
    this.tpCancellationForm.patchValue({
      paymentmode: 1,
      balance: 0
    });
    this.tpListForCancellation = (this.visitDetails.tpInfo || []).filter(a => this.tpStatusForCancellation.includes(a.TestStatusId) && !a.isCovidTestProfile);
    this.tpListForRequestForCancellation = (this.visitDetails.tpInfo || []).filter(a => this.tpStatusForRequestForCancellation.includes(a.TestStatusId) || (a.isCovidTestProfile && this.tpStatusForCancellation.includes(a.TestStatusId)));
    this.tpCancellationPopupRef = this.appPopupService.openModal(this.tpCancellationPopup, { size: 'xl' });
  }
  refundAmountValueChangeEvent() {
    let cancellationAmount = 0; // this.visitDetails.tpInfo.filter( a => a.checked).map(a=>a.DiscountedPrice || 0).reduce((acu, a) => {return acu+a;}, 0)
    let amountToRefund = 0;
    let testsAmountAfterRefund = this.visitDetails.tpInfo.filter(a => a.TestStatusId > 0).filter(a => !a.checked).map(a => a.DiscountedPrice || 0).reduce((acu, a) => { return acu + a; }, 0)
    if (this.visitDetails.tpInfo.filter(a => a.checked).length) {
      amountToRefund = testsAmountAfterRefund - this.visitDetails.billingInfo[0].ReceivedAmount;
      if (amountToRefund > 0) {
        amountToRefund = 0;
      }
    }
    cancellationAmount = amountToRefund;
    if (this.tpCancellationForm.getRawValue().refundAmount > cancellationAmount) {
      this.tpCancellationForm.patchValue({
        refundAmount: cancellationAmount
      });
    }
    if (!(this.visitDetails.billingInfo && this.visitDetails.billingInfo.length && this.visitDetails.billingInfo[0].ReceivedAmount >= cancellationAmount)) {
      // don't allow cancellation
      this.tpCancellationForm.patchValue({
        refundAmount: (this.visitDetails.billingInfo[0].ReceivedAmount || 0)
      });
    }
  }
  normalCancellation() {
    this.saveCancellationPopup(-1);
  }
  reqForCancellation() {
    this.saveCancellationPopup(-2);
  }

  detectMob() {

    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }
  saveCancellationPopup(cancellationStatusId) {
    //here 

    var ismob = this.detectMob();

    this.tpCancellationFormSubmitted = true;

    if (!this.tpCancellationForm.valid) {
      this.toastr.warning('Please fill required fields');
      return;
    }

    let arrayOfTests = this.tpListForCancellation;
    if (cancellationStatusId == -2) {
      arrayOfTests = this.tpListForRequestForCancellation;
    }

    // this.tpCancellationPopupRef.close();

    // tpCancellationForm = this.fb.group({
    //   Amount: [0, [Validators.required, Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero))]],
    //   ModeId: [0, [Validators.required, Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero))]],
    //   Remarks: [null],
    //   InstNo: [null],
    //   InstOwner: [null],
    //   InstInvoiceNo: [null],
    //   TypeId: [1],
    //   ClosingId: [0]
    // });
    let cancellationFormValues = this.tpCancellationForm.getRawValue();

    let paymentArr = [];
    let payObj: Payment = {
      VisitID: this.selectedVisit.VisitID,
      Amount: this.tpCancellationForm.getRawValue().refundAmount || 0,
      ModeId: cancellationFormValues.paymentMode || 1,
      InstNo: cancellationFormValues.CCNo || null,
      InstOwner: cancellationFormValues.InstOwner || null,
      Remarks: cancellationFormValues.remarks || '',
      TypeId: 1,
      ClosingId: 0,
      InstInvoiceNo: cancellationFormValues.CCTNo || null,
      LocId: this.loggedInUser.locationid,
    }
    paymentArr.push(payObj);
    /*
    arrayOfTests.filter(a=>a.checked).forEach( a => {
      let _payObj = JSON.parse(JSON.stringify(payObj));
      _payObj.Amount = this.helperService.parseNumbericValues((a.DiscountedPrice || 0)) * -1;
      // _payObj.ModeId = a.ModeId || 0;
      // _payObj.InstNo = a.InstOwner || null,
      // _payObj.InstNo = a.CCNo || null,
      // _payObj.InstInvoiceNo = a.CCTNo || null
      paymentArr.push(_payObj);
    });
    */
    let dataToPost = {
      createdBy: this.loggedInUser.userid,
      VisitID: this.selectedVisit.VisitID,
      Remarks: cancellationFormValues.remarks || '',
      StatusID: cancellationStatusId,
      CreatedBy: this.loggedInUser.userid,
      TPIDs: arrayOfTests.filter(a => a.checked).map(a => a.TPId).join(','),
      payment: paymentArr,
      FBRRequestData: null,
      MACAddress: this.loggedInUser.macAdr || '',
      BranchId: this.loggedInUser.locationid,
      BrowserTypeID: ismob ? 1 : 0, 
      ProvinceID : this.loggedInUser.provinceID
    }

    if (!dataToPost.payment.length || !arrayOfTests.filter(a => a.checked).length) {
      this.toastr.warning('Please select atlease 1 test for cancellation');
      return;
    }

    let fbrRequestData: any = this.formatDataForFBR(arrayOfTests);
    if (fbrRequestData.TotalSaleValue
      || fbrRequestData.TotalTaxCharged
      || fbrRequestData.Discount
      || fbrRequestData.TotalBillAmount
    ) {
      dataToPost.FBRRequestData = fbrRequestData;
    }

    if (!this.macAllowedForRegistration()) {
      return;
    }


    this.spinner.show();
    this.visitService.cancelVisit(dataToPost).subscribe((res: any) => {
      this.spinner.hide();
      if (res.StatusCode == 200) {
        this.toastr.success('Test Cancelled');
        this.tpCancellationFormSubmitted = false;
        this.getVisitDetails(dataToPost.VisitID);
        this.tpCancellationPopupRef.close();
        this.tpCancellationForm.reset();
      } else {
        this.toastr.error('Error test cancellation, Reason: ' + res.Message);
      }
    }, (err) => {
      this.spinner.hide();
      let errorMsg = '';
      if (err && err.message) {
        errorMsg = err.message;
      }
      this.toastr.error('Server Error: Test Cancellation. Reason: ' + errorMsg);
    });
  }

  /* start - FBR - function */
  formatDataForFBR(arrayOfTests) {
    let testsData = arrayOfTests.filter(a => a.checked) || [];
    // let visitData = this.visitDetails.visitInfo.length ? this.visitDetails.visitInfo[0] : {};
    let paymentModeSelected = 1;
    let fbrPaymentModes = {
      cash: 1, // Cash
      card: 2, // Card
      giftVoucher: 3, // Gift Voucher
      loyaltyCard: 4, // Loyalty Card
      mixed: 5, // Mixes
      cheque: 6 // cheque
    }
    let cancellationFormVal = this.tpCancellationForm.getRawValue();

    switch (cancellationFormVal.paymentMode) {
      case 1:
      case '1':
        // Cash
        paymentModeSelected = fbrPaymentModes.cash;
        break;
      case 2:
      case '2':
        // Credit Card
        paymentModeSelected = fbrPaymentModes.card;
        break;
      case 3:
      case '3':
        // Cheque
        paymentModeSelected = fbrPaymentModes.cheque;
        break;

      case 4:
      case '4':
        // Demand Draft
        paymentModeSelected = fbrPaymentModes.cheque;
        break;
      case 5:
      case '5':
        // Reward Point
        paymentModeSelected = fbrPaymentModes.loyaltyCard;
        break;
    }
    // if(this.visitDetails.visitInfo.PanelType == 2) { // use Check as payment mode for Credit Panel
    //   paymentModeSelected = fbrPaymentModes.cheque;
    // }


    let cancelAmountWithoutDiscount = 0;
    let totalDiscount = 0;
    testsData.forEach(a => {
      cancelAmountWithoutDiscount += this.helperService.parseNumbericValues((a.Price || 0)) - this.helperService.parseNumbericValues((a.Discount || 0));
      totalDiscount += this.helperService.parseNumbericValues((a.Discount || 0));
    });

    // tax calculation formula
    // (ValueWithTax * 100) / (TaxRate + 100)
    // (900 * 100) / (TaxRate + 100) = 769.2308

    let taxRate = 0;
    if (testsData && testsData.length) {
      taxRate = (testsData[0].TaxRateFBR || 0);
    }
    let valueWithAndWithoutTax = this.helperService.calculateTaxValue(cancelAmountWithoutDiscount, taxRate);

    let calculatedTax = valueWithAndWithoutTax.taxValue;
    let totalSale = valueWithAndWithoutTax.fullValue - valueWithAndWithoutTax.taxValue;
    let totalBillAmount = valueWithAndWithoutTax.fullValue; // - (totalDiscount || 0);

    if (totalSale < 0) {
      totalSale = 0;
    }
    if (totalBillAmount < 0) {
      totalBillAmount = 0;
    }
    if (calculatedTax < 0) {
      calculatedTax = 0;
    }

    let params = {
      "InvoiceNumber": "",
      "POSID": 0, // 966130
      "USIN": this.selectedVisit.VisitID, // VisitId
      // "RefUSIN": null,
      "DateTime": new Date(),
      // "BuyerName": "Buyer Name",
      // "BuyerNTN": "1234567-8",
      // "BuyerCNIC": "12345-1234567-8",
      // "BuyerPhoneNumber": "0000-0000000",
      "TotalSaleValue": 0, // this.helperService.formatDecimalValue(totalSale), // 1300 | 2600 - 0 - 1300 | totalamount - tax - discount
      "TotalTaxCharged": 0, // this.helperService.formatDecimalValue(calculatedTax),
      "TotalQuantity": arrayOfTests.filter(a => a.checked).length,
      "Discount": 0, // this.helperService.formatDecimalValue(totalDiscount || 0), // 1300 - 50% | discount
      // "FurtherTax": 0.0,
      "TotalBillAmount": 0, // this.helperService.formatDecimalValue(totalBillAmount), // 1300 | 1300 + 0 | totalSale + tax
      "PaymentMode": paymentModeSelected, // {1: Cash, 2: Card, 3: Gift Voucher, 4: Loyalty Card, 5: Mixed, 6: Cheque}
      "InvoiceType": 3, // {1: New, 2: Debit, 3: Credit}
      "Items": []
    };
    testsData.forEach(tp => {
      tp.TaxRate = (tp.TaxRateFBR || 0);

      let tpValueWithAndWithoutTax = this.helperService.calculateTaxValue((tp.Price || 0) - (tp.Discount || 0), tp.TaxRate);

      let taxCharged = tpValueWithAndWithoutTax.taxValue;// ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (visitData.AdjAmount || 0)) * 17 / 100;
      let saleAmount = tpValueWithAndWithoutTax.fullValue - tpValueWithAndWithoutTax.taxValue; // ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (calculatedTax || 0)) || 0; // - (visitData.AdjAmount || 0)) || 0;
      let totalAmount = tpValueWithAndWithoutTax.fullValue; // - (tp.Discount || 0); // (totalSale || 0) + (calculatedTax || 0) - (visitData.AdjAmount || 0);

      let item = {
        "ItemCode": tp.TPId,
        "ItemName": tp.Test,
        "PCTCode": tp.PCTCode || '98160000', // {radiology: '98179000', lab: '98160000'} , // "98173000", // "11001010", https://download1.fbr.gov.pk/Docs/2021101313103753401chapte-98&99.pdf // page 4
        "Quantity": 1,
        "TaxRate": tp.TaxRateFBR || 0, // this.helperService.formatDecimalValue(tp.TaxRate),
        "SaleValue": tp.SaleValueFBR || 0, // this.helperService.formatDecimalValue(saleAmount),
        "Discount": tp.DiscountFBR || 0, // this.helperService.formatDecimalValue(tp.Discount || 0),
        // "FurtherTax": 0.0,
        "TaxCharged": tp.TaxChargedFBR || 0, // this.helperService.formatDecimalValue(taxCharged),
        "TotalAmount": tp.TotalAmountFBR || 0, // this.helperService.formatDecimalValue(totalAmount),
        "InvoiceType": 3
        // "RefUSIN": null
      }
      params.Items.push(item);
    });

    params.TotalSaleValue = 0;
    params.TotalTaxCharged = 0;
    params.Discount = 0;
    params.TotalBillAmount = 0;
    params.Items.forEach(a => {
      params.TotalSaleValue += a.SaleValue;
      params.TotalTaxCharged += a.TaxCharged;
      params.Discount += a.Discount;
      params.TotalBillAmount += a.TotalAmount;
    })

    return params;
  }
  parseNumbericValues(value) {
    let _value = value;
    if (!isNaN(value)) {
      _value = Number(_value);
      _value = Math.floor(_value);
    } else {
      _value = 0;
    }
    return _value;
  }
  formatNumericValues(value) {
    return value.toString(); // .replace(CONSTANTS.REGEX.nimericWithComma, ",");
  }

  getMACAddress(loggedInUser: UserModel) {
    let obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'get-mac', userIdentity: JSON.stringify(obj) });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  macAllowedForRegistration() {
    return true;
    let allowed = true;
    if (!this.loggedInUser.macAdr) {
      this.toastr.warning('You are not allowed for Registration. Reason: MAC Address limitation');
      allowed = false;
    }
    return allowed;
  }
  /* end - FBR - function */

  getTotal(arr, key) {
    return arr.map(a => a[key]).reduce((a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b), 0);
  }

  paymentModeChangedEvent(event, formName) {
    let _formRef = null;
    if (formName == 'installment-form') {
      _formRef = this.visitInstallmentForm;
    } else if (formName == 'cancellation-form') {
      _formRef = this.tpCancellationForm;
    }
    // console.log(event, event.target.value);
    if (event.target.value == 2) {
      this.setCreditCardFieldsValidators(true, _formRef);
    } else {
      this.setCreditCardFieldsValidators(false, _formRef);
    }
  }

  setCreditCardFieldsValidators(required, form) {
    if (required) {
      form.controls["CCNo"].setValidators([Validators.required]);
      form.controls["InstOwner"].setValidators([Validators.required]);
      form.controls["CCTNo"].setValidators([Validators.required]);
    } else {
      form.patchValue({
        CCNo: '',
        InstOwner: '',
        CCTNo: '',
      });
      form.controls["CCNo"].clearValidators();
      form.controls["InstOwner"].clearValidators();
      form.controls["CCTNo"].clearValidators();
    }
    form.controls["CCNo"].updateValueAndValidity();
    form.controls["InstOwner"].updateValueAndValidity();
    form.controls["CCTNo"].updateValueAndValidity();
  }

  installmentAllowed() {
    let res = {
      allowed: true,
      reason: []
    }
    if (this.helperService.parseNumbericValues((this.visitInstallmentForm.controls['balance'].value || '').toString().replaceAll(',', '')) <= 0) {
      res.allowed = false;
      res.reason.push('Balance is <b>0</b>');
    }
    if (this.visitDetails.visitInfo && this.visitDetails.visitInfo.PatientType == 2 && this.visitDetails.visitInfo.PanelType != 1) {
      res.allowed = false;
      res.reason.push('Installment not allowed on <b>' + this.visitDetails.visitInfo.PanelTypeTitle + '</b> Panel');
    }
    return res;
  }

  openInstallmentForm() {
    this.getPaymentModes('visit-installment');
    let totalDueAmount = this.visitDetails.tpInfo.filter(a => a.TestStatusId > 0).map(a => a.DiscountedPrice || 0).reduce((acu, a) => { return acu + a; }, 0)
    this.visitInstallmentForm.patchValue({
      totalCharges: totalDueAmount, // (this.visitDetails.billingInfo[0].NetAmount || 0),
      // alreadyReceivedAmount: this.visitDetails.billingInfo[0].ReceivedAmount || 0,
      balance: (totalDueAmount - (this.visitDetails.billingInfo[0].ReceivedAmount || 0)),
      receivingAmount: 0
    });
    // let testsAmountAfterRefund = this.visitDetails.tpInfo.filter(a => a.TestStatusId > 0).filter( a => !a.checked).map(a=>a.DiscountedPrice || 0).reduce((acu, a) => {return acu+a;}, 0)

    let installmentAllowed = this.installmentAllowed();
    if (1) {// installmentAllowed.allowed) {
      this.visitInstallmentForm.controls.receivingAmount.enable();
      this.visitInstallmentForm.controls.paymentMode.enable();
      this.receiveInstallmentPopupRef = this.appPopupService.openModal(this.receiveInstallmentPopup, { size: 'md' });
    } else {
      this.toastr.warning(installmentAllowed.reason.join(', '), 'Reason:', { enableHtml: true });
      this.visitInstallmentForm.controls.receivingAmount.disable();
      this.visitInstallmentForm.controls.paymentMode.disable();
    }
  }
  saveReceiveInstallmentPopup() {
    if (!this.visitInstallmentForm.valid) {
      this.toastr.warning('Please fill required fields');
      return;
    }

    let formValues = this.visitInstallmentForm.getRawValue();
    let payObj = {
      VisitID: formValues.visitId,
      Amount: this.helperService.parseNumbericValues(formValues.receivingAmount || 0),
      ModeId: formValues.paymentMode,
      InstNo: formValues.CCNo || null,
      InstOwner: formValues.InstOwner || null,
      Remarks: null,
      TypeId: 2,
      ClosingId: 0,
      InstInvoiceNo: formValues.CCTNo || null,
      LocId: this.loggedInUser.locationid || 0,
    }
    let paymentArr = [payObj];
    let dataToPost = {
      createdBy: this.loggedInUser.userid || -99,
      payment: paymentArr,
    }
    this.spinner.show();
    this.visitService.insertVisitInstallment(dataToPost).subscribe((res: any) => {
      this.spinner.hide();
      if (res.StatusCode == 200) {
        this.toastr.success('Installment Saved');
        this.receiveInstallmentPopupRef.close();
        this.getVisitDetails(formValues.visitId);
        this.visitInstallmentForm.reset();
      } else {
        this.toastr.error('Error saving Visit Installment');
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error('Server error saving Visit Installment');
    })
  }

  truncate(source, size) {
    if (source) {
      return source.length > size ? source.slice(0, size - 1) + " <strong class='text-success'>…</strong>" : source;
    } else {
      return '';
    }
  }

  openInvoice(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p=' + btoa(JSON.stringify({ visitID: visit.VisitId, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (this.invoiceCopyType || 0), timeStemp: +new Date() }));
    window.open(url.toString(), '_blank');
    // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }

  // updateUrlParams_navigateTo(url, params = {}, settings = {}) {
  //   const _url = url || [];
  //   let _settings = { ...{
  //       // relativeTo: this.route,
  //       replaceUrl: true,
  //       queryParams: params,
  //       // queryParamsHandling: 'merge', // remove to replace all query params by provided
  //     }, ...settings};
  //   this.router.navigate(
  //     _url,
  //     _settings
  //     );
  // }
  

}
interface Payment {
  VisitID: number,
  Amount: number,
  ModeId: number,
  InstNo: string,
  InstOwner: string,
  Remarks: string,
  TypeId: number,
  ClosingId: number,
  InstInvoiceNo: string,
  LocId: number
}