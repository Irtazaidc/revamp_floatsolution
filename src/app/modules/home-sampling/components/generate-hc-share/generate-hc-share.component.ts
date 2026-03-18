// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { SignalrService } from 'src/app/modules/lab-configs/services/signalr.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { HcShareService } from '../../services/hc-share.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,

  selector: 'app-generate-hc-share',
  templateUrl: './generate-hc-share.component.html',
  styleUrls: ['./generate-hc-share.component.scss']
})
export class GenerateHcShareComponent implements OnInit {
  loggedInUser: UserModel;
  _object = Object;
  public isCollapsed = false;
  visibleTab = 1;
  spinnerRefs = {
    processSection: 'processSection',
    recommendSection: 'recommendSection',
    approveSection: 'approveSection'
  }
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

  recommendedPercentage: any = 100;
  
  // pp: any = 100;
  // rr: any ;
  FinalShareStatus: any = {
    "RecommendStaus": 1,
    "ApprovedStatus": 2
  }
  RidersDetailList: any = [];
  unproccessedShareData: any = [];
  proccessedShareData: any = [];
  IsMasterDisable: boolean = false;
  masterSelected: boolean = false;
  ReqIDsMasterSelected: boolean = false;
  currFiscalYearData: any = [];
  UnproccessesShareSum: any = 0;
  seluproccessedData: any = [];
  selproccessedData: any = [];
  recommendedShareData: any = [];
  selRecommendedData: any = [];
  unproccessedSpecificRiderShareData: any = [];
  isDiscardShareBtnEnable: boolean = false;
  searchInUnprocessedShareData: any = ""
  searchInUnprocessedShareOfSelriderData: any = ""
  searchIprocessedShareData: any = "";
  searchInproccedShareOfSelriderData: any = "";
  masterSelectedApproved: any = false;
  isProcessed: any = false;
  isDiscard: any = false
  isProcess: boolean = false;
  discard: boolean = false;
  HCTestCountsOfAlRiders: any = [];
  HCTestCountsOfSelRider: any = [];
  constructor(private auth: AuthService,
    private toastr: ToastrService,
    private appPopupService: AppPopupService,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private signalrService: SignalrService,
    private HCService: HcDashboardService,
    private shareService: HcShareService,

  ) { }
  public unProcessFields = {
    dateFrom: ['', ''],
    dateTo: ['', ''],
    rider: ['', ''],
    periodMonthName: [{ disabled: true }, ''],
    isSelAllRiders: [{ toggle: false }, ''],
    isDiscard: [false, ''],
    isProcessed: [false, ''],
  };
  public ProcessedFields = {
    periodMonthName: [{ disabled: true }, '']
  };
  public RecemmendedFields = {
    periodMonthName: [{ disabled: true }, '']
  };
  unProcessShareform: FormGroup = this.formBuilder.group(this.unProcessFields)
  processedShareform: FormGroup = this.formBuilder.group(this.ProcessedFields)
  recemmendedShareform: FormGroup = this.formBuilder.group(this.RecemmendedFields)

  ngOnInit(): void {
    this.ClearSerchFilters();
    this.RidersDetail();
    this.getCurrFiscalYearData();
    this.loadLoggedInUserInfo();

    this.setFiscalDates(new Date());

    // setTimeout(() => {
    //   this.unProcessShareform.patchValue({
    //     dateFrom: [null],
    //     dateTo: [null],
    //   });
    // }, 500);
  }

    // Helper to set fiscal dates
  setFiscalDates(date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth(); // 0=Jan, 11=Dec

    // DateFrom = 26th of current month
    let dateFrom = new Date(year, month, 26);

    // DateTo = 25th of next month
    let dateTo = new Date(year, month + 1, 25);

    this.unProcessShareform.patchValue({
      dateFrom: this.toNgbDate(dateFrom),
      dateTo: this.toNgbDate(dateTo),
    });
  }

  // Convert JS Date → NgbDateStruct
  toNgbDate(jsDate: Date): NgbDateStruct {
    return {
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    };
  }

  // When user selects another month
  onMonthChange(event: any) {
    const selectedDate = new Date(event.year, event.month - 1, 1);
    this.setFiscalDates(selectedDate);
  }

  RidersDetail() {
    let params = {
      RiderID: null
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailList = resp.PayLoad;
    }, (err) => { console.log(err) })
  }

  OpenRequestDetailModal(hc) {

  }

  getCurrFiscalYearData() {
    this.shareService.getCurrFiscalYearDetail().subscribe((resp: any) => {
      if (resp && resp.PayLoad && resp.StatusCode == 200) {
        this.currFiscalYearData = resp.PayLoad[0];
      }
    }, (err) => { console.log("err", err) })
  }
  AddRemoveReqIDsToProcessedList(selunProcesseData) {
    this.isDiscardShareBtnEnable = true;

    console.log("selunProcesseData, this.seluproccessedData", selunProcesseData, this.seluproccessedData);
    this.unproccessedSpecificRiderShareData.filter(a => { return a.HCShareID == selunProcesseData.HCShareID }).map(a => ({ ...a, "isSelected": selunProcesseData.isSelected }));
    // this.getSumOfUnProcShare_SelRider(selunProcesseData);

  }
  isAllReqIDsMasterSelected() {
    // let istue =  this.unproccessedSpecificRiderShareData.every(function (item: any) {
    //   return item.isSelected == true;
    // });
  }
  SelUnSelReqIDsToProcessedList() {

    // // for (var i = 0; i < this.unproccessedSpecificRiderShareData.length; i++) {
    // //   this.unproccessedSpecificRiderShareData[i].isSelected = this.ReqIDsMasterSelected;
    // // }


  }
  ClearSerchFilters() {
    this.searchInUnprocessedShareData = "";
    this.searchInUnprocessedShareOfSelriderData = "";
    this.searchIprocessedShareData = "";
    this.searchInproccedShareOfSelriderData = "";
  }
  getUnProccessedShareData(riderinfo) {
    this.getHCTestCounts(riderinfo);
    let formData = this.unProcessShareform.getRawValue();
    this.ClearSerchFilters();
    console.log(this.RidersDetailList, "RidersDetailList")
    // if (!this.isGetRiderInfoOnce) {
    let formValues = this.unProcessShareform.getRawValue();
    this.spinner.show(this.spinnerRefs.processSection);
    let params = {};
    if (riderinfo) {
      params = {
        RiderID: riderinfo.RiderID,
        DateFrom: formData.dateFrom ? Conversions.formatDateObject(formData.dateFrom) : null,
        DateTo: formData.dateTo ? Conversions.formatDateObject(formData.dateTo) : null,
        isDiscard: this.isProcess ? formData.isDiscard : null,
        isProcessed: this.discard ? formData.isProcessed : null
      }
    }
    else {
      this.isProcess = formData.isDiscard;
      this.discard = formData.isProcessed;
      params = {
        RiderIDs: String(this.RidersDetailList.map(a => { return a.RiderID }).join(',')),
        DateFrom: formData.dateFrom ? Conversions.formatDateObject(formData.dateFrom) : null,
        DateTo: formData.dateTo ? Conversions.formatDateObject(formData.dateTo) : null,
        isDiscard: formData.isDiscard ? formData.isDiscard : null,
        isProcessed: formData.isProcessed ? formData.isProcessed : null
      }
    }
    this.UnproccessesShareSum = "";
    this.shareService.getUnProcessedShareData(params).subscribe((resp: any) => {

      this.spinner.hide(this.spinnerRefs.processSection);
      if (resp && resp.PayLoad && resp.StatusCode == 200) {
        console.log("resp.PayLoad", resp.PayLoad)
        if (riderinfo) {
          let find = "-"
          this.unproccessedSpecificRiderShareData = resp.PayLoad;
          this.unproccessedSpecificRiderShareData.map(a => {
            a.isSelected = false;
            // let reqid = 0
            if (a.ShareAmount.toString().includes(find)) {
              a.status = "Cancelled";
              let reqid = a.HCRequestID;
              this.unproccessedSpecificRiderShareData.map(b => {
                if (b.HCRequestID == reqid) {
                  b.status = "Cancelled"
                }
              })
            }


          });
          this.UnproccessesShareSum = this.unproccessedSpecificRiderShareData.reduce((prev, next) => { return prev + next.ShareAmount }, 0)
        }
        else {
          this.isDiscard = false;
          this.isProcessed = false;
          this.unproccessedShareData = resp.PayLoad;

        }
        if (!riderinfo.RiderID) {
          this.unproccessedShareData.map(a => a.isSelected = false);
        }
      }

    }, (err) => {
      this.spinner.hide(this.spinnerRefs.processSection);
      console.log(err)
    });
    // }
  }
  discardHCShare() {

    this.ClearSerchFilters();
    let aa = this.unproccessedSpecificRiderShareData.filter(a => { return a.isSelected == true });
    let shareIdsToDiscard = aa.map(a => { return a.HCShareID }).join(',');
    if (shareIdsToDiscard) {
      let params = {
        "RiderID": aa[0].RiderID,
        "HCShareIDs": shareIdsToDiscard, 
        "DiscardedBy": this.loggedInUser.userid
      }
      this.shareService.updHCShareToDiscard(params).subscribe((resp: any) => {
        console.log("resp", resp);
        if (resp.StatusCode == 200) {
          this.toastr.success("Discarded succesfully");
          this.getUnProccessedShareData('');
          this.getUnProccessedShareData({ RiderID: aa[0].RiderID });
        }
      }, (err) => { console.log("err", err) })
    }
    else {
      this.isDiscardShareBtnEnable = false;
      this.toastr.warning("Please select request ids to discard");
    }

  }


generateHCShareData() {
  this.spinner.show();
  this.ClearSerchFilters();

  let tblHCShareProcess  = this.unproccessedShareData
    .filter(a => a.isSelected).flatMap(a => {
      // Split if HCShareIDs is comma-separated
      return a.HCShareIDs.split(',').map(id => id.trim()).filter(id => id)
        .map(id => ({
          HCShareID: Number(id),
          OtherAllowance:  0
        }));
    });


    // 🔹 tblHCShareOtherAllowance → pick only ONE HCShareID from each row
  let tblHCShareOtherAllowance = this.unproccessedShareData
    .filter(a => a.isSelected)
    .map(a => {
      let firstId = a.HCShareIDs.split(',').map(id => id.trim()).filter(id => id)[0];
      return {
        HCShareID: Number(firstId),
        OtherAllowance: a.otherAllowance || 0
      };
    });
    
    console.log("tblHCShareProcess::: ",tblHCShareProcess)
    console.log("tblHCShareOtherAllowance::: ", tblHCShareOtherAllowance)
    
  let params = {
    PeriodID: this.currFiscalYearData.PeriodId,
    tblHCShareProcess: tblHCShareProcess , 
    tblHCShareOtherAllowance: tblHCShareOtherAllowance
  };
  console.log("insertion params::: ",params)

  this.shareService.updUnProcessedShareData(params).subscribe(
    (resp: any) => {
      this.spinner.hide();
      if (resp && resp.StatusCode === 200) {
        this.toastr.success("Share Processed");
        this.getUnProccessedShareData('');
      }
    },
    (err) => {
      this.spinner.hide();
      console.log(err);
    }
  );
}

  getProccessedShareData() {
    this.ClearSerchFilters();
    this.spinner.show(this.spinnerRefs.recommendSection)
    let params = {
      PeriodID: this.currFiscalYearData.PeriodId,
    }
    this.proccessedShareData = [];
    this.shareService.getProcessedShareData(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.recommendSection)
      if (resp && resp.PayLoad && resp.StatusCode == 200) {
        this.proccessedShareData = resp.PayLoad;        
        this.proccessedShareData.map(a => {
          a.isSelected = false;
          a.pRecommendedShareAmount = a.ShareAmount + a.OtherAllowance;
          a.recommendationRemarks = "";
          // this.RecommendedShareAmount = a.ShareAmount; 
          a.recommendedPercentage = 100
        });
        console.log("this.proccessedShareData", this.proccessedShareData);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.recommendSection)
      console.log(err)
    });

  }

  reccommendHCShareData() {
    this.ClearSerchFilters();
    let recommenedShare = [];
    this.selproccessedData.forEach(a => {
      let data = {
        HCFinalShareID: null,
        RiderID: a.RiderID,
        RiderUserID: null,
        PeriodID: this.currFiscalYearData.PeriodId,
        FiscalMonth: this.currFiscalYearData.FiscalMonth,
        FiscalYearID: this.currFiscalYearData.FiscalYearID ? this.currFiscalYearData.FiscalYearID : null,
        GeneratedShareAmount: a.ShareAmount,
        RecommendedShareAmount: a.pRecommendedShareAmount,
        // RecommendedShareAmount: a.recommendedPercentage, 
        ApprovedShareAmount: null,
        HCShareIDs: a.HCShareIDs,
        RecommendedSharePercent: Number(a.recommendedPercentage).toFixed(0),
        ApprovedSharePercent: null,
        RecommendedShareRemarks: a.recommendationRemarks,
        RiderAvgFeedbackPoints: a.RiderAvgFeedbackPoints
      }
      recommenedShare.push(data);
    })

    let params = {
      PeriodID: this.currFiscalYearData.PeriodId,
      HCShareStatus: this.FinalShareStatus.RecommendStaus,
      CreatedBy: this.loggedInUser.userid,
      tblHCFianlShare: recommenedShare,

    }
    this.shareService.updProcessedShareData(params).subscribe((resp: any) => {
      if (resp && resp.StatusCode == 200) {
        this.toastr.success("Share Recomended");
        this.getProccessedShareData();
      }
    }, (err) => { console.log(err) });

  }

  getReccomendedShareData() {
    this.ClearSerchFilters();
    this.recommendedShareData = [];
    this.spinner.show(this.spinnerRefs.approveSection)
    let params = {
      PeriodID: this.currFiscalYearData.PeriodId,
    }
    this.shareService.getRecemmendedShareData(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.approveSection);
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.recommendedShareData = resp.PayLoad;
        this.recommendedShareData.map(a => {
          a.isSelected = false;
          a.pApprovedShareAmount = a.RecommendedShareAmount;
          a.approvedPercentage = 100;
          a.approvedRemarks = "";
        });
      }

    }, (err) => {
      this.spinner.hide(this.spinnerRefs.approveSection)
      console.log(err)
    });
  }

  approveHCShareData() {
    this.ClearSerchFilters();
    let approveShare = [];
    this.spinner.show(this.spinnerRefs.approveSection)
    this.selRecommendedData.forEach(a => {
      let data = {
        HCFinalShareID: a.HCFinalShareID,
        RiderID: a.RiderID,
        RiderUserID: null,
        PeriodID: this.currFiscalYearData.PeriodId,
        FiscalMonth: this.currFiscalYearData.FiscalMonth,
        FiscalYearID: this.currFiscalYearData.FiscalYearID ? this.currFiscalYearData.FiscalYearID : null,
        GeneratedShareAmount: a.ShareAmount,
        RecommendedShareAmount: null,
        // RecommendedShareAmount: a.recommendedPercentage, 
        ApprovedShareAmount: a.pApprovedShareAmount,
        HCShareIDs: a.HCShareIDs,
        RecommendedSharePercent: null,
        ApprovedSharePercent: Number(a.approvedPercentage).toFixed(0),
        RecommendedShareRemarks: null,
        ApprovedShareRemarks: a.approvedRemarks,

      }
      approveShare.push(data);
    })

    let params = {
      PeriodID: this.currFiscalYearData.PeriodId,
      HCShareStatus: this.FinalShareStatus.ApprovedStatus,
      CreatedBy: this.loggedInUser.userid,
      tblHCFianlShare: approveShare,

    }
    this.shareService.updRecemmendedShareData(params).subscribe((resp: any) => {
      console.log("resp", resp);
      this.spinner.hide(this.spinnerRefs.approveSection);
      if (resp && resp.StatusCode == 200) {
        // this.unproccessedShareData = resp.PayLoad;
        this.getReccomendedShareData();
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.approveSection);
      console.log(err)
    });

  }

  recommendedPercentageChanged(selRidershareData) {
    let objIndex = this.proccessedShareData.findIndex((obj => obj.RiderID == selRidershareData.RiderID));
    let netPayable = selRidershareData.ShareAmount + (selRidershareData.OtherAllowance || 0);

    this.proccessedShareData[objIndex].pRecommendedShareAmount = (selRidershareData.recommendedPercentage / 100) * netPayable
    console.log(selRidershareData.ShareAmount);
  }

recommendedShareAmountChanged(selRidershareData) {
    let objIndex = this.proccessedShareData.findIndex((obj => obj.RiderID == selRidershareData.RiderID));
     let netPayable = selRidershareData.ShareAmount + (selRidershareData.OtherAllowance || 0);
    this.proccessedShareData[objIndex].recommendedPercentage = (selRidershareData.pRecommendedShareAmount / netPayable) * 100
    this.proccessedShareData[objIndex].pRecommendedShareAmount = selRidershareData.pRecommendedShareAmount;
    console.log(selRidershareData);
    // this.rr  = 100
  }

  approvedPercentageChanged(selRidershareData) {
    let objIndex = this.recommendedShareData.findIndex((obj => obj.RiderID == selRidershareData.RiderID));
    this.recommendedShareData[objIndex].pApprovedShareAmount = (selRidershareData.approvedPercentage / 100) * selRidershareData.GeneratedShareAmount
    console.log(selRidershareData.GeneratedShareAmount);
  }

  approvededShareAmountChanged(selRidershareData) {
    let objIndex = this.recommendedShareData.findIndex((obj => obj.RiderID == selRidershareData.RiderID));
    this.recommendedShareData[objIndex].approvedPercentage = (Number(selRidershareData.pApprovedShareAmount) / selRidershareData.GeneratedShareAmount) * 100
    console.log(selRidershareData.GeneratedShareAmount);
  }

  getSumOfUnProcShare_SelRider(selRider) {
    let selReqIDs = this.unproccessedSpecificRiderShareData.filter(a => { return a.isSelected == true });
    let ShareSum = selReqIDs.reduce((prev, next) => { return prev + next.ShareAmount }, 0)
    let objIndex = this.unproccessedShareData.findIndex((obj => obj.RiderID == selRider.RiderID));
    this.unproccessedShareData[objIndex].ShareAmount = ShareSum;
    this.unproccessedShareData[objIndex].HCShareIDs = this.unproccessedSpecificRiderShareData.filter(a => { return a.isSelected == true }).map(a => { return a.HCShareID }).join(',');
    console.log("UnproccessesShareSum", this.UnproccessesShareSum);
  }

  checkUncheckUproccessedAll() {
    console.log("Hehe");
    for (var i = 0; i < this.unproccessedShareData.length; i++) {
      this.unproccessedShareData[i].isSelected = this.masterSelected;
    }
    // this.getUpProccessedSelData()

    // this.getCheckedItemList()
  }

  getUpProccessedSelData() {
    this.seluproccessedData = this.unproccessedShareData.filter(a => { return a.isSelected == true });
    // this.UnproccessesShareSum = this.seluproccessedData.reduce((prev, next) => { return prev + next.ShareAmount }, 0)
    console.log("UnproccessesShareSum", this.UnproccessesShareSum);
  }

  getProccessedSelData() {
    this.selproccessedData = this.proccessedShareData.filter(a => { return a.isSelected == true });
    let aa = 0;
    console.log("UnproccessesShareSum", this.selproccessedData);
  }

  checkUncheckproccessedAll() {
    console.log("Hehe");
    for (var i = 0; i < this.proccessedShareData.length; i++) {
      this.proccessedShareData[i].isSelected = this.masterSelected;
    }
    this.getProccessedSelData()

    // this.getCheckedItemList()
  }

  getRecommendSelData() {
    this.selRecommendedData = this.recommendedShareData.filter(a => { return a.isSelected == true });
    console.log("UnproccessesShareSum", this.selRecommendedData);
  }


  getHCTestCounts(riderinfo) {
    let formData = this.unProcessShareform.getRawValue();
    let params = {
      RiderIDs: riderinfo ? riderinfo.RiderID : String(this.RidersDetailList.map(a => { return a.RiderID }).join(',')),
      DateFrom: Conversions.formatDateObject(formData.dateFrom),
      DateTo: Conversions.formatDateObject(formData.dateTo)
    }
    this.HCService.getDateAndRiderWiseHCTestCount(params).subscribe((resp: any) => {
      console.log("resp", resp);
      if (resp.StatusCode == 200 && resp && resp.PayLoad.length) {
        if (!riderinfo)
          this.HCTestCountsOfAlRiders = resp.PayLoad;
        else
          this.HCTestCountsOfSelRider = resp.PayLoad;

        console.log("this.HCTestCountsOfAlRiders ", this.HCTestCountsOfAlRiders);
      }
    }, (err) => {
      console.log(err);
    });
  }

  checkUncheckRecommendAll() {
    console.log("Hehe");
    for (var i = 0; i < this.recommendedShareData.length; i++) {
      this.recommendedShareData[i].isSelected = this.masterSelectedApproved;
    }
    this.getRecommendSelData();
    //    this.getReccomendedShareData();
    // this.getCheckedItemList()
  }

  tabChanged(tabid) {
    {
      this.visibleTab = tabid;

      if (tabid == 2) {
        this.getProccessedShareData();
      }
      else if (tabid == 3) {
        this.getReccomendedShareData();
      }
      else if (tabid == 1) {
        this.getUnProccessedShareData('');
      }
    }
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

updateNetPayable(hc: any) {
  const share = Number(hc.ShareAmount) || 0;
  const allowance = Number(hc.otherAllowance) || 0;
  hc.netPayable = share + allowance;
}



}