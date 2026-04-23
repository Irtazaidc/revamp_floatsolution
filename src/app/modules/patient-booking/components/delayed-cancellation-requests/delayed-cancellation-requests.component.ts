// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, OnChanges } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';
import { LookupService } from '../../services/lookup.service';
import { VisitService } from '../../services/visit.service';

@Component({
  standalone: false,

  selector: 'app-delayed-cancellation-requests',
  templateUrl: './delayed-cancellation-requests.component.html',
  styleUrls: ['./delayed-cancellation-requests.component.scss']
})
export class DelayedCancellationRequestsComponent implements OnInit, OnChanges {

 @ViewChild("visitInfoArea") private visitInfoArea: ElementRef;

  @ViewChild("receiveInstallmentPopup") receiveInstallmentPopup;
  receiveInstallmentPopupRef: NgbModalRef;
  @ViewChild("tpCancellationPopup") tpCancellationPopup;
  tpCancellationPopupRef: NgbModalRef;

  @Input() removeCancellationLimit = false;
  loggedInUser: UserModel;
  CancelPeriod: number = null;
  AdvCancelPeriod: number = null;
  PanelType: number = null;
  PatientType: number = null;
  patientSearchParams = {
    PatientID: "",
    BookingID: "",
    PVNo: "",
    FirstName: "",
    LastName: "",
    CNIC: "",
    PassportNo: "",
    MobileNO: "",
  };
  searchResults = [{ Message: "No Record(s) Found" }];
  page = 1;
  pageSize = 5;
  collectionSize = 0;

  spinnerRefs = {
    testCancellation: 'testCancellation',
  }

  paymentModes = [];

  selectedVisit: any = null;
  visitDetails: any = {
    pateintInfo: null,
    visitInfo: null,
    tpInfo: [],
    billingInfo: [],
    paymentInfo: [],
  };

  tpStatusForCancellation = [1, 2, 6];
  tpStatusForRequestForCancellation = [3, 4, 5, 7, 8];
  tpListForCancellation = [];
  tpListForRequestForCancellation = [];

  confirmationPopoverConfig = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Confirmation Alert", // 'Are you sure?',
    popoverMessage: "Are you <b>sure</b> you want to proceed?",
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };

  visitInstallmentForm = this.fb.group({
    visitId: null,
    totalCharges: [0],
    alreadyReceivedAmount: [0],
    balance: [0],
    receivingAmount: [
      0,
      [
        Validators.required,
        Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero)),
      ],
    ],
    balanceAfterReceiving: [0],
    paymentMode: [
      1,
      [
        Validators.required,
        Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero)),
      ],
    ],
    CCNo: [""],
    InstOwner: [""],
    CCTNo: [""],
  });
  visitInstallmentFormSubmitted = false;

  tpCancellationForm = this.fb.group({
    refundAmount: [
      { value: 0, disabled: true },
      [
        Validators.required,
        Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero)),
      ],
    ],
    paymentMode: [
      1,
      [
        Validators.required,
        Validators.pattern(new RegExp(CONSTANTS.REGEX.greaterThanZero)),
      ],
    ],
    balance: [{ value: 0, disabled: true }],
    remarks: ["", [Validators.required, Validators.minLength(10)]],
    instNo: [null],
    instInvoiceNo: [null],
    CCNo: [""],
    InstOwner: [null],
    CCTNo: [""],
  });
  tpCancellationFormSubmitted = false;

  selectedTabIndex = 0;
  isCancellationNotPossible = false;
  goForAdvCancellation = false;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
    private appPopupService: AppPopupService,
    private fb: FormBuilder,
    private lookupService: LookupService,
    public helperService: HelperService,
    private visitService: VisitService,
    private multiApp: MultiAppService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    console.log("removeCancellationLimit___", this.removeCancellationLimit)
  }

  ngOnChanges() {
    this.cdr.detectChanges();
    console.log("removeCancellationLimit___", this.removeCancellationLimit)
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
      paymentmode: 1,
    });
    this.tpCancellationFormSubmitted = false;

    this.tpListForCancellation.forEach((element) => {
      element.checked = false;
    });
    this.tpListForRequestForCancellation.forEach((element) => {
      element.checked = false;
    });
    this.cancellationTPChecked();
  }

  getVisitDetails(visitID) {
    const params = { VisitId: visitID };
    this.CancelPeriod = null;
    this.AdvCancelPeriod = null;
    this.PanelType = null;
    this.visitDetails = {
      pateintInfo: null,
      visitInfo: null,
      tpInfo: [],
      billingInfo: [],
      paymentInfo: [],
    };
    if (params.VisitId) {
      this.spinner.show();
      this.visitService.GetVisitDetailsForAdvCancel(params).subscribe(
        (res: any) => {
          this.scrollToBottom();
          this.spinner.hide();
          console.log(res);
          if (res.StatusCode === 200 && res.PayLoadDS && (res.PayLoadDS.Table?.length && res.PayLoadDS.Table1?.length)) {
            // this.visitDetails = res.PayLoadDS;

            this.visitDetails = {
              pateintInfo: res.PayLoadDS.Table.length ? res.PayLoadDS.Table[0]: null,
              visitInfo: res.PayLoadDS.Table1.length ? res.PayLoadDS.Table1[0] : null,
              tpInfo: res.PayLoadDS.Table2 || [],
              billingInfo: res.PayLoadDS.Table3 || [],
              paymentInfo: res.PayLoadDS.Table4 || [],
            };
            // subtract Rewart Points amount
            this.CancelPeriod = !this.removeCancellationLimit ? this.visitDetails.pateintInfo.CancelPeriod : null;
            this.AdvCancelPeriod = !this.removeCancellationLimit ? this.visitDetails.pateintInfo.AdvCancelPeriod : null;
            this.PanelType = this.visitDetails.visitInfo.PanelType;
            this.PatientType = this.visitDetails.visitInfo.PatientType;

            if (this.visitDetails.billingInfo.length) {
              // this.visitDetails.billingInfo[0].ReceivedAmount = this.visitDetails.billingInfo[0].ReceivedAmount - this.visitDetails.paymentInfo.filter(a => a.ModeId == 5).map(a => a.Amount).reduce((acu, a) => {return acu+a;}, 0);
              this.visitDetails.billingInfo[0].RewardPointsAmount =
                this.visitDetails.paymentInfo
                  .filter((a) => a.ModeId == 5)
                  .map((a) => a.Amount)
                  .reduce((acu, a) => {
                    return acu + a;
                  }, 0);
            }

            this.visitDetails.tpInfo.forEach((a) => {
              a.DiscountedPrice = (a.Price || 0) - (a.Discount || 0);
            });
            this.checkCancellationStatus();
            //  Separate the parents and children
            const data = this.visitDetails.tpInfo;
            this.visitDetails.tpInfo = this.sortDataByParentChild(data);


            if (
              this.visitDetails.billingInfo &&
              this.visitDetails.billingInfo.length
            ) {
              this.visitInstallmentForm.patchValue({
                visitId: (visitID || "").toString().replaceAll("-", ""), // this.visitDetails.Table1.length ? (this.visitDetails.Table1[0].PIN) : null,
                totalCharges: this.visitDetails.billingInfo[0].NetAmount || 0,
                alreadyReceivedAmount:
                  this.visitDetails.billingInfo[0].ReceivedAmount || 0,
                balance:
                  (this.visitDetails.billingInfo[0].NetAmount || 0) -
                  (this.visitDetails.billingInfo[0].PaidAmount || 0) -
                  (this.visitDetails.billingInfo[0].AdjAmount || 0),
                receivingAmount: 0,
                balanceAfterReceiving: 0,
                paymentMode: 1,
                CCNo: "",
                InstOwner: "",
                CCTNo: "",
              });
              this.setCreditCardFieldsValidators(
                false,
                this.visitInstallmentForm
              );
            }
          } else {
           this.toastr.warning(
                "No record found, or this visit is not eligible for advance cancellation.",
                "Not Allowed");
          }
        },
        (err) => {
          this.scrollToBottom();
          this.toastr.error("Connection error");
          console.log(err);
          this.spinner.hide();
        }
      );
    } else {
      this.toastr.warning("Invalid");
    }
  }
  sortDataByParentChild(data) {
    const parentChildMap = new Map<number, any[]>();
    const otherItems = [];
    const addedTPIds = new Set<number>();

    // Group children by their parent TPId
    data.forEach((item) => {
      if (item.PackageId !== -1) {
        const parentId = item.PackageId;
        if (!parentChildMap.has(parentId)) {
          parentChildMap.set(parentId, []);
        }
        parentChildMap.get(parentId)?.push(item);
      } else {
        otherItems.push(item);
      }
    });

    // Create a sorted array
    const sortedData = [];

    // Add parent-child groups
    for (const [parentId, children] of parentChildMap) {
      const parentItem = data.find(
        (item) => item.TPId === parentId && item.PackageId === -1
      );
      if (parentItem && !addedTPIds.has(parentItem.TPId)) {
        sortedData.push(parentItem);
        addedTPIds.add(parentItem.TPId);
      }

      // Add children, ensuring no duplication
      children.forEach((child) => {
        if (!addedTPIds.has(child.TPId)) {
          sortedData.push(child);
          addedTPIds.add(child.TPId);
        }
      });
    }

    // Add remaining items (those without parent-child relationship)
    otherItems.forEach((item) => {
      if (!addedTPIds.has(item.TPId)) {
        sortedData.push(item);
        addedTPIds.add(item.TPId);
      }
    });

    return sortedData;
  }

  getPaymentModes(filter = null) {
    this.paymentModes = [];
    const params = { filter: filter };
    this.spinner.show();
    this.lookupService.getPaymentModes(params).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res && res.StatusCode == 200 && res.PayLoad) {
          this.paymentModes = res.PayLoad;
        } else {
          this.toastr.error("Error loading Payment Modes");
        }
      },
      (err) => {
        this.toastr.error("Connection error - payment modes");
        console.log(err);
        this.spinner.hide();
      }
    );
  }

  cancelVisit(visit) {
    return;
    console.log(visit);
    const params = {
      VisitID: visit.VisitID,
    };
    this.spinner.show();
    this.visitService.cancelVisit(params).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res && res.statusCode == 200) {
          this.toastr.success("Visit cancelled successfully");
          this.selectedVisit = null;
          // this.visitDetails = '';
        } else {
          this.toastr.error("Error cancelling visit.");
        }
      },
      (err) => {
        this.toastr.error("Error cancelling visit");
        this.spinner.hide();
      }
    );
  }
  cancelVaccineDose(vaccineDose) {
    console.log(vaccineDose);
  }

  selectVisit(visit) {
    console.log(visit);
    this.selectedVisit = visit;
    if (visit && visit.VisitID) {
      this.getVisitDetails(visit.VisitID);
    } else {
      this.toastr.warning("No record found");
    }
  }
  openCovidVaccineCard(visit) {
    // const url = window.location.href.split('#')[0] + '#/vaccine-card' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, patientID: visit.patientID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }

  newRegistration() {
    const _url = ["pat-reg/reg"] || [];
    this.helperService.updateUrlParams_navigateTo(_url);
  }

  patientSelected(patient) {
    const _url = ["pat-reg/reg"] || [];
    this.helperService.updateUrlParams_navigateTo(_url, {
      p: btoa(
        JSON.stringify({
          patientID: patient.patientID,
          orbitPatientID: patient.orbitPatientID,
        })
      ),
    });
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
    console.log("visit ", event);
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
    this.visitDetails.tpInfo.forEach((item) => {
      if (item.isChild == true && item.checked == true) {
        item.checked = false;
      }
    });
    setTimeout(() => {
      const checkedItems = this.visitDetails.tpInfo.filter(
        (item) => item.checked
      );
      const checkedTPIds = checkedItems.map((item) => item.TPId);
      this.visitDetails.tpInfo.forEach((item) => {
        if (checkedTPIds.includes(item.PackageId)) {
          item.checked = true;
        }
      });

      const totalDiscountedPrice = checkedItems
        .filter(item => item.checked)
        .reduce((sum, item) => sum + item.DiscountedPrice, 0);
      this.RwsPoints = 0;
      let amountToRefund = 0;
      const testsAmountAfterRefund = this.visitDetails.tpInfo
        .filter((a) => a.TestStatusId > 0)
        .filter((a) => !a.checked)
        .map((a) => a.DiscountedPrice || 0)
        .reduce((acu, a) => {
          return acu + a;
        }, 0);
      if (this.visitDetails.tpInfo.filter((a) => a.checked).length) {
        // subtract Rewart Points amount
        amountToRefund =
          testsAmountAfterRefund -
          (this.visitDetails.billingInfo[0].ReceivedAmount -
            this.visitDetails.billingInfo[0].RewardPointsAmount); // this.visitDetails.paymentInfo.filter(a => a.ModeId == 5).map(a => a.Amount).reduce((acu, a) => {return acu+a;}, 0));
        if (amountToRefund > 0) {
          amountToRefund = 0;
        }
      }
      console.log(
        "amountToRefund amountToRefund amountToRefund ",
        amountToRefund);

      this.tpCancellationForm.patchValue({
        refundAmount: amountToRefund, // arrayOfTests.filter( a => a.checked).map(a=>a.DiscountedPrice || 0).reduce((acu, a) => {return acu+a;}, 0)
        balance:
          this.visitDetails.tpInfo
            .filter((a) => a.TestStatusId > 0)
            .map((a) => a.DiscountedPrice || 0)
            .reduce((acu, a) => {
              return acu + a;
            }, 0) - this.visitDetails.billingInfo[0].ReceivedAmount,
      });
      // this.refundAmountValueChangeEvent();
      if (this.visitDetails.billingInfo[0].RewardPointsAmount) {
        const RwsPoints = this.calculateRewardPointsAmount(totalDiscountedPrice);
        this.RwsPoints = Math.abs(RwsPoints);
        // console.log("🚀 ~ setTimeout ~ RwsPoints:", this.RwsPoints)
      }
    }, 500);
  }
  RwsPoints = 0;
  cancellationTPChecked_All(checked) {
    // console.log('aaaaaaaaaaaaaaaaaaa =>>>>> ', checked);

    let arrayOfTests = this.visitDetails.tpInfo;
    // if (this.selectedTabIndex == 0) {
    //   arrayOfTests = this.tpListForCancellation;
    // } else if (this.selectedTabIndex == 1) {
      arrayOfTests = this.tpListForRequestForCancellation;
    // }
    arrayOfTests.forEach((element) => {
      if (element.IsCancelable && !element.isReset) {
        element.checked = checked;
      }
    });

    this.cancellationTPChecked();
  }

  openCancellationForm() {
    // if (this.visitDetails.visitInfo.PatientType == 8 && this.visitDetails.paymentInfo.find((a) => a.ModeId == 5)) {
    //   // Payment through Discount Card Reward points
    //   this.toastr.info(
    //     "Reason: <b>Payment through Reward Points</b> usage",
    //     "Cancellation not allowed",
    //     { enableHtml: true, timeOut: 5000 }
    //   );
    //   return;
    // }
    this.tpStatusForCancellation = [0];
    this.tpStatusForRequestForCancellation = [1, 2, 3, 4, 5, 6, 7, 8];

    this.PanelType == 2 ? this.verifiedCancellation = true : this.verifiedCancellation = false;
    this.OTPField = true;
    this.showOTPButtonWithoutSend = false;
    this.VerifyOTP = '';
    this.OTPAttempt = 0;
    // if(this.visitDetails.visitInfo.PatientType == 8) { // Booking on Discount Card
    //   this.toastr.info('Reason: <b>Booking on Discount Card</b>', 'Cancellation not allowed', {enableHtml: true, timeOut: 5000});
    //   return;
    // }
    // if(this.visitDetails.paymentInfo.find(a => a.ModeId == 5)) { // Discount Card
    //   this.toastr.info('Cancellation not allowed due to <b>Reward Points</b> usage', '', {enableHtml: true, timeOut: 5000});
    //   return;
    // }
    this.selectedTabIndex = 0;
    this.onTabChanged({ index: this.selectedTabIndex });
    this.getPaymentModes("visit-installment");
    this.tpCancellationForm.reset();
    this.tpCancellationForm.patchValue({
      paymentmode: 1,
      balance: 0,
    });

    // //  Filter items where PackageId matches any TPId
    // const validItems = this.visitDetails.tpInfo.filter((tp) =>
    //   this.visitDetails.tpInfo.some((item) => item.TPId === tp.PackageId)
    // );
    // // Apply parent-child logic only on the filtered items
    // validItems.forEach((tp) => {
    //   tp.isParent = validItems.some((child) => child.PackageId === tp.TPId);
    //   tp.isChild = !validItems.some((child) => child.PackageId === tp.TPId);
    // });

    // // Update the original list with valid parent-child status
    // this.visitDetails.tpInfo = this.visitDetails.tpInfo.map((tp) => {
    //   const validItem = validItems.find((item) => item.TPId === tp.TPId);
    //   return validItem ? validItem : tp;
    // });
    // console.log("🚀 ~ openCancellationForm ~ this.visitDetails.tpInfo :",this.visitDetails.tpInfo);
    // // Filter the list as per your existing flow
    // this.tpListForCancellation = (this.visitDetails.tpInfo || []).filter((a) =>
    //     this.tpStatusForCancellation.includes(a.TestStatusId) && !a.isCovidTestProfile);

    // this.tpListForRequestForCancellation = ( this.visitDetails.tpInfo || []).filter((a) =>
    //     this.tpStatusForRequestForCancellation.includes(a.TestStatusId) ||
    //     (a.isCovidTestProfile &&this.tpStatusForCancellation.includes(a.TestStatusId)));

    // Step 1: Identify valid parent-child relationships
    const validItems = this.visitDetails.tpInfo.filter((tp) =>
      this.visitDetails.tpInfo.some((item) => item.TPId === tp.PackageId)
    );

    validItems.forEach((tp) => {
      tp.isParent = validItems.some((child) => child.PackageId === tp.TPId);
      tp.isChild = !validItems.some((child) => child.PackageId === tp.TPId);
    });

    // Step 2: Update original list with valid parent-child statuses
    this.visitDetails.tpInfo = this.visitDetails.tpInfo.map((tp) => {
      const validItem = validItems.find((item) => item.TPId === tp.TPId);
      return validItem ? validItem : tp;
    });
    // console.log('this.visitDetails.tpInfo____________',this.visitDetails.tpInfo)
    // Step 3: Filter `tpListForCancellation` based on existing flow
    // this.tpListForCancellation = (this.visitDetails.tpInfo || []).filter((a) => 
    //   this.tpStatusForCancellation.includes(a.TestStatusId) && !a.isCovidTestProfile);

    // // Step 4: Filter `tpListForRequestForCancellation` based on existing flow
    // this.tpListForRequestForCancellation = (this.visitDetails.tpInfo || []).filter((a) =>
    //     this.tpStatusForRequestForCancellation.includes(a.TestStatusId || (a.DepartmentID == 1)) || (a.isCovidTestProfile &&
    //       this.tpStatusForCancellation.includes(a.TestStatusId)));

    const createdOnDate = new Date(this.visitDetails.visitInfo.CreatedOn); // Get the CreatedOn date
    const currentDate = new Date(); // Get the current system date
    const differenceInTime = currentDate.getTime() - createdOnDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    // console.log(" differenceInDays for requests:", differenceInDays)
    // Check if the difference is more than 30 days
    if (differenceInDays > this.AdvCancelPeriod || this.PatientType == 5) {
      this.tpStatusForCancellation = [0];
      this.tpStatusForRequestForCancellation = [1, 2, 3, 4, 5, 6, 7, 8];
    } 

  

    const excludedTPIds = new Set();
    this.visitDetails.tpInfo.forEach((parent) => {
      if (parent.TestStatusId >= 1 && parent.PackageId === -1) { // Ensure it's a parent
        const childItems = this.visitDetails.tpInfo.filter(
          (child) => child.PackageId === parent.TPId
        );
        if (childItems.some((child) => child.TestStatusId >= 9)) {
          excludedTPIds.add(parent.TPId); // Exclude parent
          childItems.forEach((child) => excludedTPIds.add(child.TPId)); // Exclude children
        }
      }
    });



    // Step 5: Move items to `tpListForRequestForCancellation` if their parent's `TestStatusId >= 4`
    // this.visitDetails.tpInfo.forEach((parent) => {
    //   if (parent.TestStatusId >= 4 && !excludedTPIds.has(parent.TPId)) { // Respect exclusion
    //     // Find all child items for the current parent
    //       const childItems = this.visitDetails.tpInfo.filter(
    //         (child) => child.PackageId === parent.TPId && !excludedTPIds.has(child.TPId)
    //       );

    //       // Move child items to tpListForRequestForCancellation
    //       childItems.forEach((child) => {
    //         // Remove from tpListForCancellation
    //         this.tpListForCancellation = this.tpListForCancellation.filter(
    //           (item) => item.TPId !== child.TPId
    //         );

    //         // Add to tpListForRequestForCancellation if not already present
    //         if (
    //           !this.tpListForRequestForCancellation.some(
    //             (item) => item.TPId === child.TPId)
    //         ) {
    //           this.tpListForRequestForCancellation.push(child);
    //         }
    //       });
    //     }
    //  });

    // this.tpListForCancellation = (this.visitDetails.tpInfo || []).filter((a) =>  (
    //     this.tpStatusForCancellation.includes(a.TestStatusId) && a.RISStatusID < 3 && !a.isAdvanceCancellation &&
    //     !(a.DepartmentID == 1 && a.TestStatusId == 6) && !a.isCovidTestProfile && !excludedTPIds.has(a.TPId)));
    //   console.log("TpListForCancellation:_________", this.tpListForCancellation)

    // this.tpListForRequestForCancellation = ( this.visitDetails.tpInfo || []).filter((a) =>  (
    //     this.tpStatusForRequestForCancellation.includes(a.TestStatusId) || ((a.DepartmentID == 1 || a.DepartmentID == 7) && a.TestStatusId == 6 && a.RISStatusID >= 3) || a.isAdvanceCancellation ||
    //     (a.isCovidTestProfile && !excludedTPIds.has(a.TPId) && a.IsCancelable && this.tpStatusForCancellation.includes(a.TestStatusId))));
    //   console.log("TpListForRequestForCancellation:__________", this.tpListForRequestForCancellation)

    // Step 1: First identify all problematic families (where any child has TestStatusId > 6)
    const problematicFamilies = new Set();
    this.visitDetails.tpInfo.forEach(item => {
      // Only consider statuses that exist in our defined arrays
      const isValidStatus = this.tpStatusForCancellation.concat(this.tpStatusForRequestForCancellation).includes(item.TestStatusId);

      if (isValidStatus && item.PackageId && !excludedTPIds.has(item.TPId)) {
        const isProblematicChild =
          (item.DepartmentID == 1 && item.TestStatusId > 2) ||
          (item.DepartmentID == 7 && item.TestStatusId > 6);

        if (isProblematicChild) {
          problematicFamilies.add(item.PackageId);
        }
      }
    });

    // Step 2: Build tpListForCancellation with strict status checks
    this.tpListForCancellation = (this.visitDetails.tpInfo || []).filter(a => {
      // Must have a valid cancellation status
      const hasValidStatus = this.tpStatusForCancellation.includes(a.TestStatusId);

      return hasValidStatus &&
        a.RISStatusID < 3 &&
        !a.isAdvanceCancellation &&
        !(a.DepartmentID == 1 && a.TestStatusId == 6) &&
        !a.isCovidTestProfile &&
        !excludedTPIds.has(a.TPId) &&
        !problematicFamilies.has(a.TPId) &&
        (!a.PackageId || !problematicFamilies.has(a.PackageId));
    });

    // Step 3: Build tpListForRequestForCancellation with strict status checks
    // this.tpListForRequestForCancellation = (this.visitDetails.tpInfo || []).filter(a => {
    //   if (excludedTPIds.has(a.TPId)) return false;

    //   // Check if it's a problematic family member
    //   const isProblematicFamily = problematicFamilies.has(a.TPId) || 
    //                             (a.PackageId && problematicFamilies.has(a.PackageId));

    //   const hasValidStatus = this.tpStatusForRequestForCancellation.includes(a.TestStatusId) ||
    //                       (isProblematicFamily && 
    //                         this.tpStatusForCancellation.concat(this.tpStatusForRequestForCancellation).includes(a.TestStatusId));

    //   return hasValidStatus && (
    //     // Original conditions
    //     this.tpStatusForRequestForCancellation.includes(a.TestStatusId) ||
    //     ((a.DepartmentID == 1 || a.DepartmentID == 7) && a.TestStatusId == 6 && a.RISStatusID >= 3) ||
    //     a.isAdvanceCancellation ||
    //     (a.isCovidTestProfile && a.IsCancelable && this.tpStatusForCancellation.includes(a.TestStatusId)) ||
    //     isProblematicFamily
    //   );
    // });

    this.tpListForRequestForCancellation = (this.visitDetails.tpInfo || []).filter(a => {
      if (excludedTPIds.has(a.TPId)) return false;
      const isProblematicFamily = problematicFamilies.has(a.TPId) ||
        (a.PackageId && problematicFamilies.has(a.PackageId));
      // If it's a problematic family, allow either status list
      if (isProblematicFamily) {
        return this.tpStatusForCancellation.concat(this.tpStatusForRequestForCancellation).includes(a.TestStatusId);
      }
      return (
          a.TestStatusId == 6 &&
          (a.DepartmentID == 1 || a.DepartmentID == 7) &&
          (a.RISStatusID == null || a.RISStatusID >= 3) &&
          a.isAdvanceCancellation ) || (this.tpStatusForRequestForCancellation.includes(a.TestStatusId))
         || ( a.isCovidTestProfile && a.IsCancelable && this.tpStatusForCancellation.includes(a.TestStatusId));
      });

    console.log("TpListForCancellation:_________", this.tpListForCancellation);
    console.log("TpListForRequestForCancellation:__________", this.tpListForRequestForCancellation);


    this.tpCancellationPopupRef = this.appPopupService.openModal(
      this.tpCancellationPopup,
      { size: "xl" }
    );
  }
  refundAmountValueChangeEvent() {
    let cancellationAmount = 0; // this.visitDetails.tpInfo.filter( a => a.checked).map(a=>a.DiscountedPrice || 0).reduce((acu, a) => {return acu+a;}, 0)
    let amountToRefund = 0;
    const testsAmountAfterRefund = this.visitDetails.tpInfo
      .filter((a) => a.TestStatusId > 0)
      .filter((a) => !a.checked)
      .map((a) => a.DiscountedPrice || 0)
      .reduce((acu, a) => {
        return acu + a;
      }, 0);
    if (this.visitDetails.tpInfo.filter((a) => a.checked).length) {
      amountToRefund =
        testsAmountAfterRefund -
        this.visitDetails.billingInfo[0].ReceivedAmount;
      if (amountToRefund > 0) {
        amountToRefund = 0;
      }
    }
    cancellationAmount = amountToRefund;
    if (
      this.tpCancellationForm.getRawValue().refundAmount > cancellationAmount
    ) {
      this.tpCancellationForm.patchValue({
        refundAmount: cancellationAmount,
      });
    }
    if (
      !(
        this.visitDetails.billingInfo &&
        this.visitDetails.billingInfo.length &&
        this.visitDetails.billingInfo[0].ReceivedAmount >= cancellationAmount
      )
    ) {
      // don't allow cancellation
      this.tpCancellationForm.patchValue({
        refundAmount: this.visitDetails.billingInfo[0].ReceivedAmount || 0,
      });
    }
  }
  normalCancellation() {
    this.saveCancellationPopup(-1);
  }
  reqForCancellation() {
    this.saveCancellationPopup(-3);
  }
  OTPAttempt = 0;
  detectMob() {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i,
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }


  calculateRewardPointsAmount(totalDiscountedPrice): number {

    const receivedAmount = this.visitDetails.billingInfo[0]?.ReceivedAmount || 0;
    const rewardPointsAmount = this.visitDetails.billingInfo[0]?.RewardPointsAmount || 0;
    const cashAmount = receivedAmount - rewardPointsAmount;
    const refundingAmount = totalDiscountedPrice;

    let cashRefund = 0;
    let pointsRefund = 0;

    // Scenario 1: Full cash refund
    if (refundingAmount <= cashAmount) {
      cashRefund = refundingAmount;
    }
    // Scenario 2: Partial cash + partial points
    else {
      cashRefund = cashAmount;
      pointsRefund = Math.min(refundingAmount - cashAmount, rewardPointsAmount);
    }
    this.tpCancellationForm.patchValue({
      refundAmount: cashRefund, // Only show cash refund in the main field
    });

    return -pointsRefund// Return points as negative value

  }


  saveCancellationPopup(cancellationStatusId) {
    this.tpCancellationFormSubmitted = true;

    if (!this.tpCancellationForm.valid) {
      this.toastr.warning("Please fill required fields");
      return;
    }
    if (!this.VerifyOTP && this.PanelType != 2) {
      this.toastr.warning("Please provide OTP");
      return;
    }

    let arrayOfTests = this.tpListForCancellation;
    if (cancellationStatusId == -3) {
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
    const cancellationFormValues = this.tpCancellationForm.getRawValue();

    const paymentArr = [];

    if (this.visitDetails.paymentInfo?.some(a => a.ModeId === 5)) {
      // Push reward points payment
      const rewardPointsAmount = this.calculateRewardPointsAmount(arrayOfTests.filter(item => item.checked).reduce((sum, item) => sum + item.DiscountedPrice, 0));

      if (typeof rewardPointsAmount === 'number' && rewardPointsAmount !== 0) {
        const rewardPayObj: Payment = {
          VisitID: this.selectedVisit.VisitID,
          Amount: rewardPointsAmount,
          ModeId: 5,
          InstNo: cancellationFormValues.CCNo || null,
          InstOwner: cancellationFormValues.InstOwner || null,
          Remarks: cancellationFormValues.remarks || "",
          TypeId: 1,
          ClosingId: 0,
          InstInvoiceNo: cancellationFormValues.CCTNo || null,
          LocId: this.loggedInUser.locationid,
          OnlinePaymentReferenceID: null,
        };
        paymentArr.push(rewardPayObj);
      }

      let refundAmount = this.tpCancellationForm.getRawValue().refundAmount
      if (refundAmount > 0) {
        refundAmount = -refundAmount;
      }
      // Push refund amount payment
      const refundPayObj: Payment = {
        VisitID: this.selectedVisit.VisitID,
        Amount: refundAmount || 0,
        ModeId: cancellationFormValues.paymentMode || 1,
        InstNo: cancellationFormValues.CCNo || null,
        InstOwner: cancellationFormValues.InstOwner || null,
        Remarks: cancellationFormValues.remarks || "",
        TypeId: 1,
        ClosingId: 0,
        InstInvoiceNo: cancellationFormValues.CCTNo || null,
        LocId: this.loggedInUser.locationid,
        OnlinePaymentReferenceID: null,
      };
      paymentArr.push(refundPayObj);
    } else {
      // Normal flow - push just the refund amount
      const payObj: Payment = {
        VisitID: this.selectedVisit.VisitID,
        Amount: this.tpCancellationForm.getRawValue().refundAmount || 0,
        ModeId: cancellationFormValues.paymentMode || 1,
        InstNo: cancellationFormValues.CCNo || null,
        InstOwner: cancellationFormValues.InstOwner || null,
        Remarks: cancellationFormValues.remarks || "",
        TypeId: 1,
        ClosingId: 0,
        InstInvoiceNo: cancellationFormValues.CCTNo || null,
        LocId: this.loggedInUser.locationid,
        OnlinePaymentReferenceID: null,
      };
      paymentArr.push(payObj);
    }


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
    const ismob = this.detectMob();
    const dataToPost = {
      createdBy: this.loggedInUser.userid,
      VisitID: this.selectedVisit.VisitID,
      Remarks: cancellationFormValues.remarks || "",
      StatusID: cancellationStatusId,
      CreatedBy: this.loggedInUser.userid,
      TPIDs: arrayOfTests
        .filter((a) => a.checked)
        .map((a) => a.TPId)
        .join(","),
      payment: paymentArr,
      FBRRequestData: null,
      MACAddress: this.loggedInUser.macAdr || "",
      BranchId: this.loggedInUser.locationid,
      BrowserTypeID: ismob ? 1 : 0,
      ProvinceID: this.loggedInUser.provinceID,
      CancelOTP: this.VerifyOTP,
      isSkipCancelOTP: this.PanelType == 2 ? 1 : 0,
    };
    console.log("Obj Params________",dataToPost)
    if (
      !dataToPost.payment.length ||
      !arrayOfTests.filter((a) => a.checked).length
    ) {
      this.toastr.warning("Please select atlease 1 test for cancellation");
      return;
    }

    const fbrRequestData: any = this.formatDataForFBR(arrayOfTests);
    if (
      fbrRequestData.TotalSaleValue ||
      fbrRequestData.TotalTaxCharged ||
      fbrRequestData.Discount ||
      fbrRequestData.TotalBillAmount
    ) {
      dataToPost.FBRRequestData = fbrRequestData;
    }

    console.log(
      "======================================================> ",
      dataToPost,
      fbrRequestData
    );

    if (!this.macAllowedForRegistration()) {
      return;
    }

    this.spinner.show(this.spinnerRefs.testCancellation);
    this.visitService.VisitAdvTPCancellation(dataToPost).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.testCancellation);
        console.log(res);
        if (res.StatusCode == 200) {
          if (res.PayLoad[0].Result == 1) {
            this.toastr.success("Test Cancelled");
            this.tpCancellationFormSubmitted = false;
            this.getVisitDetails(dataToPost.VisitID);
            this.tpCancellationPopupRef.close();
            this.tpCancellationForm.reset();
          }
          if (res.PayLoad[0].Result == 2) {
            this.toastr.error(
              "This test cannot be cancelled normally. Please refresh the page and try submitting the cancellation request again"
            );
          }
          if (res.PayLoad[0].Result == 3) {
            this.toastr.error("The OTP you entered is invalid.", "Incorrect OTP!"); //The OTP you entered is invalid or has expired. Please request a new one and try again.
            this.VerifyOTP = '';
            this.OTPAttempt = this.OTPAttempt + 1;
            if (this.OTPAttempt == 3) {
              this.verifiedCancellation = false;
              this.OTPField = true;
              this.showOTPButtonWithoutSend = false;
            }
          }
        } else {
          this.toastr.error("Error test cancellation, Reason: " + res.Message);
        }
      },
      (err) => {
        this.spinner.hide();
        let errorMsg = "";
        if (err && err.message) {
          errorMsg = err.message;
        }
        this.toastr.error(
          "Server Error: Test Cancellation. Reason: " + errorMsg
        );
      }
    );
  }

  /* start - FBR - function */
  formatDataForFBR(arrayOfTests) {
    const testsData = arrayOfTests.filter((a) => a.checked) || [];
    // let visitData = this.visitDetails.visitInfo.length ? this.visitDetails.visitInfo[0] : {};
    let paymentModeSelected = 1;
    const fbrPaymentModes = {
      cash: 1, // Cash
      card: 2, // Card
      giftVoucher: 3, // Gift Voucher
      loyaltyCard: 4, // Loyalty Card
      mixed: 5, // Mixes
      cheque: 6, // cheque
    };
    const cancellationFormVal = this.tpCancellationForm.getRawValue();

    switch (cancellationFormVal.paymentMode) {
      case 1:
      case "1":
        // Cash
        paymentModeSelected = fbrPaymentModes.cash;
        break;
      case 2:
      case "2":
        // Credit Card
        paymentModeSelected = fbrPaymentModes.card;
        break;
      case 3:
      case "3":
        // Cheque
        paymentModeSelected = fbrPaymentModes.cheque;
        break;

      case 4:
      case "4":
        // Demand Draft
        paymentModeSelected = fbrPaymentModes.cheque;
        break;
      case 5:
      case "5":
        // Reward Point
        paymentModeSelected = fbrPaymentModes.loyaltyCard;
        break;
    }
    // if(this.visitDetails.visitInfo.PanelType == 2) { // use Check as payment mode for Credit Panel
    //   paymentModeSelected = fbrPaymentModes.cheque;
    // }

    let cancelAmountWithoutDiscount = 0;
    let totalDiscount = 0;
    testsData.forEach((a) => {
      cancelAmountWithoutDiscount +=
        this.helperService.parseNumbericValues(a.Price || 0) -
        this.helperService.parseNumbericValues(a.Discount || 0);
      totalDiscount += this.helperService.parseNumbericValues(a.Discount || 0);
    });

    // tax calculation formula
    // (ValueWithTax * 100) / (TaxRate + 100)
    // (900 * 100) / (TaxRate + 100) = 769.2308

    let taxRate = 0;
    if (testsData && testsData.length) {
      taxRate = testsData[0].TaxRateFBR || 0;
    }
    const valueWithAndWithoutTax = this.helperService.calculateTaxValue(
      cancelAmountWithoutDiscount,
      taxRate
    );

    let calculatedTax = valueWithAndWithoutTax.taxValue;
    let totalSale =
      valueWithAndWithoutTax.fullValue - valueWithAndWithoutTax.taxValue;
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

    const params = {
      InvoiceNumber: "",
      POSID: 0, // 966130
      USIN: this.selectedVisit.VisitID, // VisitId
      // "RefUSIN": null,
      DateTime: new Date(),
      // "BuyerName": "Buyer Name",
      // "BuyerNTN": "1234567-8",
      // "BuyerCNIC": "12345-1234567-8",
      // "BuyerPhoneNumber": "0000-0000000",
      TotalSaleValue: 0, // this.helperService.formatDecimalValue(totalSale), // 1300 | 2600 - 0 - 1300 | totalamount - tax - discount
      TotalTaxCharged: 0, // this.helperService.formatDecimalValue(calculatedTax),
      TotalQuantity: arrayOfTests.filter((a) => a.checked).length,
      Discount: 0, // this.helperService.formatDecimalValue(totalDiscount || 0), // 1300 - 50% | discount
      // "FurtherTax": 0.0,
      TotalBillAmount: 0, // this.helperService.formatDecimalValue(totalBillAmount), // 1300 | 1300 + 0 | totalSale + tax
      PaymentMode: paymentModeSelected, // {1: Cash, 2: Card, 3: Gift Voucher, 4: Loyalty Card, 5: Mixed, 6: Cheque}
      InvoiceType: 3, // {1: New, 2: Debit, 3: Credit}
      Items: [],
    };
    testsData.forEach((tp) => {
      tp.TaxRate = tp.TaxRateFBR || 0;

      const tpValueWithAndWithoutTax = this.helperService.calculateTaxValue(
        (tp.Price || 0) - (tp.Discount || 0),
        tp.TaxRate
      );

      const taxCharged = tpValueWithAndWithoutTax.taxValue; // ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (visitData.AdjAmount || 0)) * 17 / 100;
      const saleAmount =
        tpValueWithAndWithoutTax.fullValue - tpValueWithAndWithoutTax.taxValue; // ((this.getTotal(this.getValidAddedTestsProfiles(), 'TestProfilePrice') || 0) - (calculatedTax || 0)) || 0; // - (visitData.AdjAmount || 0)) || 0;
      const totalAmount = tpValueWithAndWithoutTax.fullValue; // - (tp.Discount || 0); // (totalSale || 0) + (calculatedTax || 0) - (visitData.AdjAmount || 0);

      const item = {
        ItemCode: tp.TPId,
        ItemName: tp.Test,
        PCTCode: tp.PCTCode || "98160000", // {radiology: '98179000', lab: '98160000'} , // "98173000", // "11001010", https://download1.fbr.gov.pk/Docs/2021101313103753401chapte-98&99.pdf // page 4
        Quantity: 1,
        TaxRate: tp.TaxRateFBR || 0, // this.helperService.formatDecimalValue(tp.TaxRate),
        SaleValue: tp.SaleValueFBR || 0, // this.helperService.formatDecimalValue(saleAmount),
        Discount: tp.DiscountFBR || 0, // this.helperService.formatDecimalValue(tp.Discount || 0),
        // "FurtherTax": 0.0,
        TaxCharged: tp.TaxChargedFBR || 0, // this.helperService.formatDecimalValue(taxCharged),
        TotalAmount: tp.TotalAmountFBR || 0, // this.helperService.formatDecimalValue(totalAmount),
        InvoiceType: 3,
        // "RefUSIN": null
      };
      params.Items.push(item);
    });

    params.TotalSaleValue = 0;
    params.TotalTaxCharged = 0;
    params.Discount = 0;
    params.TotalBillAmount = 0;
    params.Items.forEach((a) => {
      params.TotalSaleValue += a.SaleValue;
      params.TotalTaxCharged += a.TaxCharged;
      params.Discount += a.Discount;
      params.TotalBillAmount += a.TotalAmount;
    });

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
    const obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href),
    };
    this.sendCommand({ command: "get-mac", userIdentity: JSON.stringify(obj) });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  macAllowedForRegistration() {
    return true;
    let allowed = true;
    if (!this.loggedInUser.macAdr) {
      this.toastr.warning(
        "You are not allowed for Registration. Reason: MAC Address limitation"
      );
      allowed = false;
    }
    return allowed;
  }
  /* end - FBR - function */

  getTotal(arr, key) {
    return arr
      .map((a) => a[key])
      .reduce(
        (a, b) => this.parseNumbericValues(a) + this.parseNumbericValues(b),
        0
      );
  }

  paymentModeChangedEvent(event, formName) {
    let _formRef = null;
    if (formName == "installment-form") {
      _formRef = this.visitInstallmentForm;
    } else if (formName == "cancellation-form") {
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
        CCNo: "",
        InstOwner: "",
        CCTNo: "",
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
    const res = {
      allowed: true,
      reason: [],
    };
    if (
      this.helperService.parseNumbericValues(
        (this.visitInstallmentForm.controls["balance"].value || "")
          .toString()
          .replaceAll(",", "")
      ) <= 0
    ) {
      res.allowed = false;
      res.reason.push("Balance is <b>0</b>");
    }
    if (
      this.visitDetails.visitInfo &&
      this.visitDetails.visitInfo.PatientType == 2 &&
      this.visitDetails.visitInfo.PanelType != 1
    ) {
      res.allowed = false;
      res.reason.push(
        "Installment not allowed on <b>" +
        this.visitDetails.visitInfo.PanelTypeTitle +
        "</b> Panel"
      );
    }
    if (
      this.visitDetails.visitInfo &&
      this.visitDetails.visitInfo.ShiftPanelType == 2
    ) {
      res.allowed = false;
      res.reason.push("Amount Refunded against panel security");
    }
    return res;
  }

  openInstallmentForm() {
    this.getPaymentModes("visit-installment");
    const totalDueAmount = this.visitDetails.tpInfo
      .filter((a) => a.TestStatusId > 0)
      .map((a) => a.DiscountedPrice || 0)
      .reduce((acu, a) => {
        return acu + a;
      }, 0);
    this.visitInstallmentForm.patchValue({
      totalCharges: totalDueAmount, // (this.visitDetails.billingInfo[0].NetAmount || 0),
      // alreadyReceivedAmount: this.visitDetails.billingInfo[0].ReceivedAmount || 0,
      balance:
        totalDueAmount - (this.visitDetails.billingInfo[0].ReceivedAmount || 0),
      receivingAmount: 0,
    });
    // let testsAmountAfterRefund = this.visitDetails.tpInfo.filter(a => a.TestStatusId > 0).filter( a => !a.checked).map(a=>a.DiscountedPrice || 0).reduce((acu, a) => {return acu+a;}, 0)

    const installmentAllowed = this.installmentAllowed();
    if (1) {
      // installmentAllowed.allowed) {
      this.visitInstallmentForm.controls.receivingAmount.enable();
      this.visitInstallmentForm.controls.paymentMode.enable();
      this.receiveInstallmentPopupRef = this.appPopupService.openModal(
        this.receiveInstallmentPopup,
        { size: "md" }
      );
    } else {
      this.toastr.warning(installmentAllowed.reason.join(", "), "Reason:", {
        enableHtml: true,
      });
      this.visitInstallmentForm.controls.receivingAmount.disable();
      this.visitInstallmentForm.controls.paymentMode.disable();
    }
  }
  isRecAmtValid = false;
  validateBalanceAndReceivingAmount(recVal, balVal) {
    if (recVal > balVal) this.isRecAmtValid = true;
    else this.isRecAmtValid = false;
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  saveReceiveInstallmentPopup() {
    if (!this.visitInstallmentForm.valid) {
      this.toastr.warning("Please fill required fields");
      return;
    }

    const formValues = this.visitInstallmentForm.getRawValue();
    if (formValues.receivingAmount > formValues.balance) {
      this.toastr.error(
        "Receiving amount shouldn't exceed the balance amount !",
        "Validation Error"
      );
      return;
    }

    const payObj = {
      VisitID: formValues.visitId,
      Amount: this.helperService.parseNumbericValues(
        formValues.receivingAmount || 0
      ),
      ModeId: formValues.paymentMode,
      InstNo: formValues.CCNo || null,
      InstOwner: formValues.InstOwner || null,
      Remarks: null,
      TypeId: 2,
      ClosingId: 0,
      InstInvoiceNo: formValues.CCTNo || null,
      LocId: this.loggedInUser.locationid || 0,
      OnlinePaymentReferenceID: null,
    };
    const paymentArr = [payObj];
    const dataToPost = {
      createdBy: this.loggedInUser.userid || -99,
      payment: paymentArr,
    };
    this.spinner.show();
    this.visitService.insertVisitInstallment(dataToPost).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.StatusCode == 200) {
          this.toastr.success("Installment Saved");
          this.receiveInstallmentPopupRef.close();
          this.getVisitDetails(formValues.visitId);
          this.visitInstallmentForm.reset();
        } else {
          this.toastr.error("Error saving Visit Installment");
        }
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error("Server error saving Visit Installment");
      }
    );
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
  truncate(source, size) {
    if (source) {
      return source.length > size
        ? source.slice(0, size - 1) +
        " <strong class='text-success font-weight-bolder' style='font-size: 14px !important;'>…</strong>"
        : source;
    } else {
      return "";
    }
  }

  checkCancellationStatus() {
    if (!this.CancelPeriod) {
      this.isCancellationNotPossible = false;
      return
    }
    this.isCancellationNotPossible = false;
    const createdOnDate = new Date(this.visitDetails.visitInfo.CreatedOn); // Get the CreatedOn date
    const currentDate = new Date(); // Get the current system date

    // Calculate the difference in milliseconds
    const differenceInTime = currentDate.getTime() - createdOnDate.getTime();

    // Convert milliseconds to days
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    // console.log(" differenceInDays:", differenceInDays)

    // Check if the difference is more than 60 days
    this.isCancellationNotPossible = differenceInDays > this.CancelPeriod;
    console.log(" this.isCancellationNotPossible:", this.isCancellationNotPossible)
  }

  //OTP Verification

  OTPField = true;
  VerifyOTP = "";
  showOTPButtonWithoutSend = false;
  showOTPRefreshButton = false;
  timeLeft = 30;
  interval;
  verifiedCancellation = false;
  confirmationPopoverConfigCell = {
    placements: ["top", "left", "right", "bottom"],
    popoverTitle: "Are you <b>sure</b> want to proceed?", // 'Are you sure?',
    popoverMessage: `<span class"p-line-height">OTP will be send to your registered phone # <strong> </strong>and email address</span>`, //+ (this.PhoneNo) +
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { },
  };
  generateOTP = false;
  verifyOTP() {

    //     if (!this.tpCancellationForm.valid) {
    //       this.toastr.warning("Please fill required fields");
    //       return;
    //     }

    //  let arrayOfTests = this.tpListForCancellation;
    //     if (cancellationStatusId == -2) {
    //       arrayOfTests = this.tpListForRequestForCancellation;
    //     }

    //  if ( !arrayOfTests.filter((a) => a.checked).length
    //     ) {
    //       this.toastr.warning("Please select atlease 1 test for cancellation");
    //       return;
    //     }


    const Obj = {
      VisitID: this.selectedVisit?.VisitID, // Avoid undefined error
      ModifiedBy: this.loggedInUser?.userid || -99,
    };
    // console.log("🚀 ~ verifyOTP ~ Obj:", Obj);
    this.generateOTP = true;
    this.spinner.show(this.spinnerRefs.testCancellation);

    this.visitService.GenerateCancelOTPByVisitID(Obj).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.testCancellation);

        // console.log(res);
        this.generateOTP = false;
        if (res?.StatusCode === 200) {
          if (res.PayLoad?.[0]?.Result === 1 && res.PayLoad?.[0]?.IsSMSSent === 1) {
            this.toastr.success(res.Message, "OTP Sent!");
            this.verifyOTPforCancellation();
          } else {
            this.toastr.warning(res.Message, "OTP Failed!");
          }
        } else {
          this.toastr.error(res.Message, "Error!");
        }
      },
      (err: any) => {
        this.spinner.hide();
        const errorMsg = err?.message || "Unknown error occurred.";
        this.toastr.error("Server Error: " + errorMsg);
      }
    );
  }

  resendOTPForVerification() {
    if (this.showOTPButtonWithoutSend) return; // Prevent multiple rapid requests
    this.OTPField = false;
    this.VerifyOTP = "";
    this.showOTPRefreshButton = false;
    this.verifyOTP();
    this.startTimer();
    this.verifiedCancellation = true;
  }

  verifyOTPforCancellation() {
    // if (!this.VerifyOTP) {
    //   this.toastr.warning("Please enter a valid OTP.");
    //   return;
    // }

    this.showOTPButtonWithoutSend = true;
    this.OTPField = false;
    this.startTimer();
    this.verifiedCancellation = true;
  }

  startTimer() {
    this.timeLeft = 30;
    this.showOTPButtonWithoutSend = true;

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 0;
        this.pauseTimer();
        this.showOTPButtonWithoutSend = false;
      }
    }, 1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.interval = null;
  }

}


interface Payment {
  VisitID: number;
  Amount: number;
  ModeId: number;
  InstNo: string;
  InstOwner: string;
  Remarks: string;
  TypeId: number;
  ClosingId: number;
  InstInvoiceNo: string;
  LocId: number;
  OnlinePaymentReferenceID: number;
}
