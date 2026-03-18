// @ts-nocheck
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-visit-tp-inventory',
  templateUrl: './visit-tp-inventory.component.html',
  styleUrls: ['./visit-tp-inventory.component.scss']
})
export class VisitTpInventoryComponent implements OnInit {
  spinnerRefs = {
    inventorySection: 'inventorySection'
  }
  confirmationPopoverConfigInventory = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> want to save inventory ?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  disabledButtonInventory: boolean = false;
  isSpinnerInventory: boolean = true;
  VisitID: any = null;
  TPID: any = null;
  StatusID: any = null;
  RISStatusID: any = null;
  VerifiedUserID: any = null;
  TPItemsList = [];
  @Input() ParamsPayLoad = {
    VisitID: null,
    TPID: null,
    StatusID: null,
    RISStatusID: null,
    VerifiedUserID: null
  };
  isFieldDisabled = false;
  searchText = "";
  buttonClicked = false;
  constructor(
    private spinner: NgxSpinnerService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private auth: AuthService

  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.VisitID = this.ParamsPayLoad.VisitID;
    this.TPID = this.ParamsPayLoad.TPID;
    this.StatusID = this.ParamsPayLoad.StatusID;
    this.RISStatusID = this.ParamsPayLoad.RISStatusID;
    setTimeout(() => {
      if (this.RISStatusID == 4 || this.RISStatusID == 5 || this.RISStatusID == 6) {
        this.isFieldDisabled = true;
      } else {
        this.isFieldDisabled = false;
      }
      this.getVisitTPInventory();
    }, 500);

  }
  ngOnChanges(changes: SimpleChanges) {
    this.VisitID = this.ParamsPayLoad.VisitID;
    this.TPID = this.ParamsPayLoad.TPID;
    this.StatusID = this.ParamsPayLoad.StatusID;
    this.RISStatusID = this.ParamsPayLoad.RISStatusID;
    this.VerifiedUserID = this.ParamsPayLoad.VerifiedUserID;
  }

  loggedInUser: UserModel;
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getVisitTPInventory() {
    this.TPItemsList = []
    let params = {
      VisitID: this.VisitID,
      TPID: this.TPID,
      StatusID: 7,
      RISStatusID: null
    };
    this.spinner.show(this.spinnerRefs.inventorySection);
    this.sharedService.getData(API_ROUTES.GET_VISIT_TP_INVENTORY, params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.inventorySection);
      if (res.StatusCode == 200) {
        this.TPItemsList = res.PayLoad || [];
        this.TPItemsList = this.TPItemsList.map(a => ({
          StoreItemID: a.StoreItemID,
          VisitTPInventoryID: a.VisitTPInventoryID,
          Code: a.Code ? a.Code : "",
          MeasuringUnit: a.MeasuringUnit,
          StoreItemFull: a.Code + "-" + a.StoreItemTitle + "[" + a.MeasuringUnit + "]",
          StoreItemId: a.StoreItemID,
          StoreItemTitle: a.StoreItem,
          RecQuantity: a.RecQuantity,
          ConsumedQuantity: a.ConsumedQuantity,
          DamagedQuantity: a.DamagedQuantity,
          StatusID: a.StatusID,
          RISStatusID: a.RISStatusID,
          Remarks: a.Remarks,
          checked: a.VisitTPInventoryID ? true : false
        }));
      } else {
        console.log('Something went wrong! Please contact administrator');
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.inventorySection);
    })
  }

  selectAllTPStoreItems(e) {
    this.TPItemsList.forEach(a => {
      a.checked = false;
      if (a.StoreItemID > 0) {
        a.checked = e.target.checked;
      }
    })
  }

  isDoneTPInventory = 0;
  isValidInventoryQty = false;
  insertUpdateVisitTPInventory(saveFrom) {
    this.isValidInventoryQty = false;
    let checkedItems = this.TPItemsList.filter(a => a.checked);
    if (!checkedItems.length) {
      if (saveFrom == 1) {
        this.toastr.warning("Please select store item(s) to save", "Warning");
        return;
      }

      this.isDoneTPInventory = 1;
      return;
    }
    this.buttonClicked = true;
    let isValidInventoryObj = false;
    let isDemageedItemsObj = false;
    // let isValidInventoryQty=false;
    checkedItems.forEach(a => {
      if (!a.ConsumedQuantity) {
        isValidInventoryObj = true;
      }
      if (a.ConsumedQuantity + (a.DamagedQuantity || 0) > a.RecQuantity) {
        this.isValidInventoryQty = true;
      }
      if (a.DamagedQuantity && !a.Remarks) {
        isDemageedItemsObj = true;
      }
    })

    if (isValidInventoryObj) {
      this.toastr.error("Please provide item quantity against selected Item!");
      this.isDoneTPInventory = 0;
      return;
    }else if (isDemageedItemsObj){
      this.toastr.error("Please provide remarks for damaged Item!");
      this.isDoneTPInventory = 0;
    } else if (this.isValidInventoryQty) {
      this.toastr.error("SUM of Consumed and Damaged Qty should be less then Max Allowed Qty", "Validation Error");
      this.isDoneTPInventory = 0;
      return
    } else {
      let objParam = {
        TPID: this.TPID,
        VisitID: Number(this.VisitID),
        CreatedBy: this.VerifiedUserID ? this.VerifiedUserID : this.loggedInUser.userid,
        tblVisitTPInventory: checkedItems.map(a => {
          return {
            VisitTPInventoryID: a.VisitTPInventoryID ? a.VisitTPInventoryID : null,
            Visit: Number(this.VisitID),
            TPID: this.TPID,
            StatusID: a.StatusID || null,
            RISStatusID: a.RISStatusID,
            StoreItemID: a.StoreItemId,
            ConsumedQuantity: a.ConsumedQuantity,
            DamagedQuantity: a.DamagedQuantity,
            Remarks: a.Remarks
          }
        })
      }
      this.disabledButtonInventory = true;
      this.isSpinnerInventory = false;
      this.sharedService.getData(API_ROUTES.INSERT_UPDATE_VISIT_TP_INVENTORY, objParam).subscribe((data: any) => {
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
        this.buttonClicked = false;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
            this.getVisitTPInventory()
            this.isSpinnerInventory = true;
            this.buttonClicked = false;
            // this.closeLoginModal();
            this.isDoneTPInventory = 1;
          } else {
            this.toastr.error('Something went wrong! Please contact system support.')
            this.disabledButtonInventory = false;
            this.isSpinnerInventory = true;
          }
        }
      }, (err) => {
        console.log(err);
        this.toastr.error('Connection error');
        this.disabledButtonInventory = false;
        this.isSpinnerInventory = true;
      })
    }

  }

}
