// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PanelConversionService } from '../../services/panel-conversion.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { FilterByKeyPipe } from 'src/app/modules/shared/pipes/filter-by-key.pipe';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { VisitService } from '../../services/visit.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { FbrService } from 'src/app/modules/shared/services/fbr/fbr.service';

@Component({
  standalone: false,

  selector: 'app-panel-conversion',
  templateUrl: './panel-conversion.component.html',
  styleUrls: ['./panel-conversion.component.scss']
})
export class PanelConversionComponent implements OnInit {

  @ViewChild('visitQuestionnairePopup') visitQuestionnairePopup;
  visitQuestionnairePopupRef: NgbModalRef;

  screenPermissions = [];
  screenPermissionsObj: any = {};

  branchesList = [];
  branchRegions = [];
  testStatusList = [
    { StatusId: 2, Title: 'Phlebotomy' },
    { StatusId: 3, Title: 'Pending Phlebotomy' }
  ];
  visitsList = [];
  visitsListAll = [];
  visitSamplesList = [];
  visitQuestionnaire = [];
  visitDocs = [];

  searchVisitsForm  = this.fb.group({
    branchIds: [null,0],
    fromDate: [''],
    toDate: [''],
    // statusId: [2]
  });

  pinFilterString = '';
  selectedVisit: any = '';
  loggedInUser: UserModel;
  // patientBasicInfo = {};
  PanelType = 2;
  spinnerRefs = {
    patientInfoBar: 'patientInfoBar',
    visitSamples: 'visitSamples',
    pinsList: 'pinsList'
  }

  confirmationPopoverConfig_ = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverTitleTests: 'Are you <b>sure</b> want to save ?', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  panelList: any[];
  testPaymentList: any[];
  totalRefund: any = 0;
  visitDetailForPanel: any[];
  VisitID: any = null;
  IsAllowedCheck:boolean=false;
  PanelCode: any= "";
  PanelID: any = null;
  PanelIDChk: any = null;
  UserLocationId: number=-99;
  remarksToSave:string = "";
  
  disabledButtonVisits: boolean = false; // Button Enabled / Disables [By default Enabled]
  disabledButton: boolean = false; // Button Enabled / Disables [By default Enabled]
  
  isSpinner: boolean = true;//Hide Loader
  isSpinnerVisits: boolean = true;//Hide Loader
  VisitRegLoc=""
  VisitRegDate=""
  minDate:any;
  MACAndPOSAlert = {
    POS: '',
    POSID: '',
    MAC: ''
  };

  constructor(
    private panelConversionService: PanelConversionService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private appPopupService: AppPopupService,
    private helperSrv: HelperService,
    private visitService: VisitService,
    private multiApp: MultiAppService,
    private fbrService: FbrService
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPermissions();
    this.getBranches();
    this.getPanelByPanelType(this.PanelType);
    setTimeout(() => {
      this.searchVisitsForm.patchValue({
        fromDate: Conversions.getCurrentDateObject(),
        toDate: Conversions.getCurrentDateObject(),
      });
      this.getVisitsForSecurityRefund();
    }, 100);

  }


  getPermissions() {
    let _activatedroute = this.route.routeConfig.path;
    // this.screenPermissionsObj = this.storageService.getLoggedInUserProfilePermissionsObj(_activatedroute);
    this.screenPermissionsObj = this.auth.getLoggedInUserProfilePermissionsObj(_activatedroute);
    // console.log(this.screenPermissionsObj);
  }

  loadLoggedInUserInfo() {
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
    this.UserLocationId = this.loggedInUser.locationid;
    // console.log('this.loggedInUser', this.loggedInUser);

    this.getMACAddress(this.loggedInUser);
  }
  showInfoMessage(){
    this.toastr.info('For Security Refund you can only select visit(s) of previous 7 days only...!');
  }

  getVisitsForSecurityRefund(visitid = '') {
    this.IsAllowedCheck=false;
    this.PanelCode='';
    this.PanelID=null;
    this.PanelIDChk=null;
    this.visitsList = [];
    this.visitsListAll = [];
    this.getVisitDetailsForSecurityRefund(visitid);
    let formValues = this.searchVisitsForm.getRawValue();
    let x = 7;
    // let currentDate = moment(new Date).format("YYYY-MM-DD");
    let fromeDate =  moment(Conversions.formatDateObject(formValues.fromDate)).format("YYYY-MM-DD");
    let currentDate =new Date();
    let currentMinusx  = currentDate.setDate(currentDate.getDate() - x);
    let currentDateFinal = moment(currentMinusx).format("YYYY-MM-DD");
   
    this.minDate = Conversions.getDateObjectByGivenDate(currentDateFinal);
    console.log('min is: ',this.minDate)
    if(fromeDate < currentDateFinal){
      this.toastr.info('For Security Refund you can only select visit(s) of previous 7 days only...!');
      return
    }
 
    let params = { 
      locationIds:formValues.branchIds,
      fromDate: formValues.fromDate ? Conversions.formatDateObject(formValues.fromDate) : '',
      toDate: formValues.toDate ? Conversions.formatDateObject(formValues.toDate, 'end') : ''
    }; 
    let valid = true, invalidFields = [];
    Object.keys(this.searchVisitsForm.controls).forEach((a) => {
      if (this.searchVisitsForm.controls[a].errors) {
        valid = false;
        invalidFields.push(a);
      }
    });
    // console.log('invalidFields ', invalidFields);
    if (!valid) {
      this.toastr.warning('Please enter <strong>' + invalidFields.join(', ') + '</strong>', '', { enableHtml: true });
      return;
    }
    this.spinner.show(this.spinnerRefs.pinsList);
    this.disabledButtonVisits = true; 
    this.isSpinnerVisits = false;
    this.panelConversionService.getVisitsForSecurityRefund(params).subscribe((res: any) => {
      this.disabledButtonVisits = false; 
      this.isSpinnerVisits = true; 
      this.spinner.hide(this.spinnerRefs.pinsList);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        data = data || [];
        console.log('data is: ',data);
        // sort Urgent at top
        let normalVisit = data.filter(a => a.ProcessId != 2);
        let urgentVisit = data.filter(a => a.ProcessId == 2);
        data = [...urgentVisit, ...normalVisit];

        this.visitsList = data;
        this.visitsListAll = this.visitsList;
        // this.testStatusFilter();
        if (this.visitsList.length) {
          let _visit = this.visitsList[0];
          if (visitid) {
            if (this.visitsList.filter(a => a.VisitId == visitid).length) {
              _visit = this.visitsList.filter(a => a.VisitId == visitid)[0];
              this.getVisitDetailsForSecurityRefund(_visit);
            }
          }
          // this.getVisitDetailsForSecurityRefund(_visit);
        }
      }
    }, (err) => {
      this.disabledButtonVisits = false; 
      this.isSpinnerVisits = true; 
      this.spinner.hide(this.spinnerRefs.pinsList);
      this.spinner.hide();
      this.toastr.error('Error loading Visits data');
      console.log(err);
    });
  }
  
  getVisitDetailsForSecurityRefund(visit) {
    this.VisitRegLoc= visit.LocationName?visit.LocationName:"";
    this.VisitRegDate= visit.RegistrationDate?moment(visit.RegistrationDate).format("DD-MMM-YYYY hh:mm:ss A"):"";
    this.disabledButton = false;
    this.isSpinner = true;
    this.IsAllowedCheck=false;
    this.PanelCode='';
    this.PanelID=null;
    this.PanelIDChk=null;
    this.VisitID = visit.VisitId;
    this.visitSamplesList = [];
    this.testPaymentList = [];
    this.selectedVisit = visit;
    if (!visit || !visit.VisitId) {
      return;
    }
    let formValues = this.searchVisitsForm.getRawValue();
    // this.searchPatient(visit.PatientId);
    //////////////
    this.getVisitDetialsForSecurityRefundSrv(visit.VisitId)
    /////////////////
  }
  getVisitDetialsForSecurityRefundSrv(visitID){
    this.PanelIDChk = null;
    let params = {
      visitId: visitID
    };
    this.spinner.show(this.spinnerRefs.visitSamples);
    this.panelConversionService.getVisitDetailsForSecurityRefund(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitSamples);
      if (res && res.StatusCode == 200 && res.PayLoadDS["Table"]) {
        this.visitSamplesList = res.PayLoadDS["Table"]
        this.PanelIDChk = this.visitSamplesList[0].PanelID;
        if(this.PanelIDChk){
          this.getVisitDetailForPanelConversion(this.visitSamplesList[0])
        }
        this.testPaymentList= res.PayLoadDS["Table1"]
        this.totalRefund = this.testPaymentList.reduce((accumulator, obj) => {
          return accumulator + obj.Amount;
        }, 0);
      }
    }, (err) => {
      this.toastr.error('Error loading Tests data');
      this.spinner.hide(this.spinnerRefs.visitSamples);
      console.log(err);
    });
  }


  visitSelectedEvent(visit) {
    this.getVisitDetailsForSecurityRefund(visit);
  }


  /* Lookups */
  getBranches() {
    this.branchesList = [];
    this.branchRegions = [];
    this.lookupService.GetBranches().subscribe((resp: any) => {
      let _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
      this.branchRegions = [...new Set(this.branchesList.filter(a => a.RegId).map(a => a.RegId))].map(a => { return {RegId: a, RegName: this.branchesList.find(b=>b.RegId == a).RegName, RegCode: this.branchesList.find(b=>b.RegId == a).RegCode} } )
      setTimeout(() => {
        this.searchVisitsForm.patchValue({
          branchIds: this.loggedInUser.locationid
        });
      }, 100);
    }, (err) => {
    })
  }
  getPanelByPanelType(panelType) {
    this.panelList = [];
    let objParam = {
      PanelType:panelType
    }
    this.lookupService.getPanelByPanelType(objParam).subscribe((resp: any) => {
      this.panelList = resp.PayLoad||[];
    }, (err) => {
      console.log(err);
    })
  }
  /* Lookups */




  onKeyUpPinFilter(event: any) {
    // console.log('event.target.value ', event.target.value);
    if (event && event.target && event.target.value) {
      if ((event.target.value || '').match(/\d/g) && (event.target.value || '').match(/\d/g).join('').length == 12) {
        this.getVisitsForSecurityRefund((event.target.value || '').match(/\d/g) && (event.target.value || '').match(/\d/g).join(''));
      }
      // if((event.target.value || '').replaceAll('-', '').length == 12) {
      // }
    }
  }


 
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }
  getVisitDetailForPanelConversion(event){
    if(event && (event.PanelId || event.PanelID)){
      this.PanelID = event.PanelId || event.PanelID;
      this.PanelIDChk = event.PanelId || event.PanelID;
      this.PanelCode = event.Code;
      this.visitSamplesList = [];
      let objParam = {
        VisitID : this.VisitID,
        PanelID : event.PanelId || event.PanelID,
      }
      this.panelConversionService.getVisitDetailForPanelConversion(objParam).subscribe((resp: any) => {
        this.visitSamplesList = resp.PayLoad||[];
        let chekUnAvailableTest = this.visitSamplesList.find(e=> !e.IsAllowed);
        this.IsAllowedCheck = (chekUnAvailableTest)?this.IsAllowedCheck=true:this.IsAllowedCheck=false;
      }, (err) => {
        console.log(err);
      })
    } else{
      this.PanelIDChk = null;
      this.IsAllowedCheck = false;
      this.PanelCode = '';
      this.PanelID = null;
      this.PanelIDChk = null;
      this.getVisitDetialsForSecurityRefundSrv(this.VisitID)
    }
  }

  insertVisitPanelShifting(){
    if(!this.macAndPOSIDAllowedForPanelConversion()) {
      return;
    }
    if(!this.PanelIDChk || this.PanelIDChk == null) {
      this.toastr.warning('Please select a panel...!'); return;
    }
      this.disabledButton = true;
      this.isSpinner = false;
      this.spinner.show(this.spinnerRefs.visitSamples); 
    // let ii=1;
    // if(ii==2) {
      // this.spinner.hide(this.spinnerRefs.visitSamples);
      // this.toastr.warning('Please fill the required fields...!'); return false;
    // } else {
      // this.disabledButton = true; // Lock the button after for submit to wait till process is completed and respone is send
      // this.isSpinner = false; // Button Spinner show
      let objParam = {
        VisitID : this.VisitID,
        RefundAmount: this.totalRefund,
        ModeID: 1,
        Remarks: this.remarksToSave, 
        LocID:   this.UserLocationId,
        PanelToID: this.PanelIDChk,
        CreatedBy : this.loggedInUser.userid || -99,
        tblVisitTestPanelShifting: this.visitSamplesList.map(a => {
          return {
            VisitID: a.VisitID,
            TPId: a.TPId,
            PackageID: a.PackageId || -1,
            Price: /\d/.test(a.PanelPrice) ? a.PanelPrice : 0, //a.Price
          }
        })
      }
      this.panelConversionService.insertVisitPanelShifting(objParam).subscribe((data: any) => {
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(data.PayLoadStr).length) {
          this.spinner.hide(this.spinnerRefs.visitSamples);
          if (data.StatusCode == 200) {
            this.postFBRData();
            this.toastr.success(data.Message);
          } else {
            this.spinner.hide(this.spinnerRefs.visitSamples);
            this.toastr.error(data.Message)
          }
          this.disabledButton = false;
          this.isSpinner = true;
          this.PanelIDChk = null;
          this.remarksToSave = "";
          this.totalRefund = 0;
          this.getVisitsForSecurityRefund();
        }
      },(err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.visitSamples);
        this.disabledButton = false; 
        this.isSpinner = true; 
        this.toastr.error('Connection error');
      })
    // }
  }


  /* start - FBR Posting */
  /*
  repostFBRInvoice2(FBRTransID) {
    this.spinner.show();

    let params = this.getFinalDataSet();

    this.fbrService.reportFBRVisitData(params).subscribe((resp: any) => {
      this.spinner.hide();
      // this.getUnpostedInvoices();
      if (resp && resp.StatusCode == 200) {
        this.toastr.success('FBR Data Posted');
        // this.getUnpostedInvoices();
      } else {
        let apiErrorMsg = "";
        if (resp && resp.Error) {
          apiErrorMsg = resp.Error;
        }
        this.toastr.error('Error Reposting FBR Data. ' + apiErrorMsg);
      }
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
  */

  postFBRData() {
    this.disabledButton = true;
    this.isSpinner = false;
    if(!this.macAndPOSIDAllowedForPanelConversion()) {
      return;
    }
    this.spinner.show();

    let params = this.getFinalDataSet();
    console.log(params);

    this.fbrService.postFBRDataForPanelConversion(params).subscribe((resp: any) => {
      this.disabledButton = false;
      this.isSpinner = true;
      this.spinner.hide();
      // this.getUnpostedInvoices();
      if (resp && resp.StatusCode == 200) {
        // this.toastr.success('FBR Data Posted');
        // this.getUnpostedInvoices();
      } else {
        let apiErrorMsg = "";
        if (resp && resp.Error) {
          apiErrorMsg = resp.Error;
        }
        this.toastr.error('Error Reposting FBR Data. ' + apiErrorMsg);
      }
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

  
  getFinalDataSet() {
    let regModule = '4';

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
      // FBRTransID: 0,

      FBRRequestData: '',

      Module: regModule,
      Remarks: this.remarksToSave || '',
      SystemDetails: JSON.stringify(details),
    }
    
    RegistrationModel.FBRRequestData = this.formatDataForFBR();
    return RegistrationModel;
  }

  formatDataForFBR() {
    // let testsData = data.Table1 || [];
    // let visitData = data.Table.length ? data.Table[0] : {};

    let testsData = this.visitSamplesList;
    console.log("🚀 ~ PanelConversionComponent ~ formatDataForFBR ~ testsData:", testsData)
    let visitData = {VisitID: this.selectedVisit.VisitId, AdjAmount: 0};

    let taxRate = 0;
    if (this.visitSamplesList && this.visitSamplesList.length) {
      taxRate = (this.visitSamplesList[0].TaxRate || 0);
    }

    let totalPrice = +this.helperSrv.getTotal(this.visitSamplesList, 'Price') - +this.helperSrv.getTotal(this.visitSamplesList, 'PanelPrice')
    let valueWithAndWithoutTax = this.helperSrv.calculateTaxValue(totalPrice - (visitData.AdjAmount || 0), taxRate);

    let calculatedTax = valueWithAndWithoutTax.taxValue;
    let totalSale = valueWithAndWithoutTax.fullValue - valueWithAndWithoutTax.taxValue;
    let totalBillAmount = valueWithAndWithoutTax.fullValue;

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
      "POSID": this.loggedInUser.posId || this.MACAndPOSAlert.POSID, // 966130
      "USIN": visitData.VisitID, // VisitId
      // "RefUSIN": null,
      "DateTime": new Date(),
      // "BuyerName": "Buyer Name",
      // "BuyerNTN": "1234567-8",
      // "BuyerCNIC": "12345-1234567-8",
      // "BuyerPhoneNumber": "0000-0000000",
      "TotalSaleValue": 0, // this.helperSrv.formatDecimalValue(totalSale),
      "TotalTaxCharged": 0, // this.helperSrv.formatDecimalValue(calculatedTax),
      "TotalQuantity": testsData.length,
      "Discount": 0, // this.helperSrv.formatDecimalValue(visitData.AdjAmount || 0),
      // "FurtherTax": 0.0,
      "TotalBillAmount": 0, // this.helperSrv.formatDecimalValue(totalBillAmount),
      "PaymentMode": 1, // {1: Cash, 2: Card, 3: Gift Voucher, 4: Loyalty Card, 5: Mixed, 6: Cheque}
      "InvoiceType": 3, // {1: New, 2: Debit, 3: Credit}
      "Items": []
    };
    testsData.forEach(tp => {
      tp.TaxRate = tp.TaxRate || 0;
      let _tpPrice = (tp.Price || 0) - (tp.PanelPrice || 0);
      let tpValueWithAndWithoutTax = this.helperSrv.calculateTaxValue(_tpPrice - (tp.Discount || 0), tp.TaxRate);

      let taxCharged = tpValueWithAndWithoutTax.taxValue;
      let saleAmount = tpValueWithAndWithoutTax.fullValue - tpValueWithAndWithoutTax.taxValue;
      let totalAmount = tpValueWithAndWithoutTax.fullValue;

      let item = {
        "ItemCode": tp.TPId,
        "ItemName": tp.Title || tp.TPCode,
        "PCTCode": tp.PCTCode || '98160000', // {radiology: '98179000', lab: '98160000'} , // "98173000", // "11001010", https://download1.fbr.gov.pk/Docs/2021101313103753401chapte-98&99.pdf // page 4
        "Quantity": 1,
        "TaxRate": this.helperSrv.formatDecimalValue(tp.TaxRate || 0),
        "SaleValue": this.helperSrv.formatDecimalValue(saleAmount || 0),
        "Discount": this.helperSrv.formatDecimalValue(tp.Discount || 0),
        // "FurtherTax": 0.0,
        "TaxCharged": this.helperSrv.formatDecimalValue(taxCharged || 0),
        "TotalAmount": this.helperSrv.formatDecimalValue(totalAmount || 0),
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
      params.TotalSaleValue += a.SaleValue || 0;
      params.TotalTaxCharged += a.TaxCharged || 0;
      params.Discount += a.Discount || 0;
      params.TotalBillAmount += a.TotalAmount || 0;
    })

    return params;
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
          this.MACAndPOSAlert.POS = `POSID not found, FBR data will not be posted (${'POSID: ' + res.PayLoad[0].POSID})`;
        }
      } else {
        this.MACAndPOSAlert.POS = 'POSID not found, FBR data will not be posted';
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
      this.MACAndPOSAlert.POS = 'POSID not found, FBR data will not be posted';
    });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  macAndPOSIDAllowedForPanelConversion() {
    let allowed = true;
    if (!this.loggedInUser.macAdr && environment.production) {
      this.toastr.warning('Not Allowed. Reason: MAC Address limitation');
      allowed = false;
    }
    if (!this.loggedInUser.posId && !this.MACAndPOSAlert.POSID) {
      this.toastr.warning('Not Allowed. Reason: POSID not found');
      allowed = false;
    }
    return allowed;
  }
  /* end   - FBR Posting */

}
