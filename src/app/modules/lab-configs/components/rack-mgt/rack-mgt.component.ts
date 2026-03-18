// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { environment } from 'src/environments/environment';
import { RackMgtService } from '../../services/rack-mgt.service';

@Component({
  standalone: false,

  selector: 'app-rack-mgt',
  templateUrl: './rack-mgt.component.html',
  styleUrls: ['./rack-mgt.component.scss']
})
export class RackMgtComponent implements OnInit {
  BranchesList: any = [];
  RacksDetailList: any = [];
  rackForm = this.fb.group({
    rackCode: ['', ''],
    rackDesc: ['', Validators.compose([Validators.required])],
    rackCapacity: ['', Validators.compose([Validators.required])],
    rackType: ['', Validators.compose([Validators.required])],
    noOfRacks: ['', Validators.compose([Validators.required, Validators.pattern("^[0-9]*$")])],
    rackBranch: ['', [Validators.required]]
  });
  rackTypesList: any = [];
  loggedInUser: any;

  spinnerRefs = {
    rackDetailSection: 'rackDetailSection',
    rackFormSection: 'rackFormSection'
  }
  cardTitle: string = "Add Rack";
  actionLabel: string = "Save";
  isSpinner: boolean = true;
  racksDetailData: any = [];
  rackDetailDisplayedColumns = ['RackCode', 'RackType', 'Status', 'LockedIn'];

  rackBranhID: any = 1;
  event: string = "create";
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
  selrackDetail: any;
  RackID: any = null;
  constructor(private lookupService: LookupService,
    private rackSerice: RackMgtService,
    private fb: FormBuilder,
    private toastr: ToastrService, private auth: AuthService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRacksDetail('');
    this.getRackTypes();
    this.getBranches();
  }

  createRack() {
    this.spinner.show(this.spinnerRefs.rackFormSection);
    let values = this.rackForm.getRawValue();
    this.rackForm.markAllAsTouched();
    if (this.rackForm.invalid) {
      this.spinner.hide(this.spinnerRefs.rackFormSection);
      this.toastr.warning('Please fill the required fields');
      return false;
    } else {
      let params = {
        "RackBranchID": values.rackBranch,
        "RackDescription": values.rackDesc,
        "RackCapacity": values.rackCapacity,
        "RackTypeID": values.rackType,
        "NoOfRacks": values.noOfRacks,
        "CreatedBy": this.loggedInUser.userid
      }
      this.rackSerice.createRack(params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.rackFormSection);
        if (resp.StatusCode == 200) {
          // if (resp.PayLoad.length) {
            this.toastr.success("Rack(s) has been added successfully")
            this.clearForms();
            this.getRacksDetail('');
          // }
        }
      }, (err) => {
        console.log("err", err);
        this.spinner.hide(this.spinnerRefs.rackFormSection);
      })
    }
  }

  updateRack() {
    this.spinner.show(this.spinnerRefs.rackFormSection);
    let values = this.rackForm.getRawValue();
    let params = {
      "RackID" : this.RackID,
      "RackBranchID": values.rackBranch,
      "RackDescription": values.rackDesc,
      "RackCapacity": values.rackCapacity,
      "RackTypeID": values.rackType
    }
    console.log('Update Rack data: ',params)
    this.rackSerice.updateRack(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.rackFormSection);
      if (resp.StatusCode == 200) {
        this.toastr.success(resp.Message);
        this.clearForms();
        this.getRacksDetail('');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.rackFormSection);
    })
  }
  printBarcode(){
    let rackNo  = this.selrackDetail[0].RackNo;
    if(rackNo) {
      const url = environment.EmailServiceUrl + 'smp-bc/gen-barcode?p='+ btoa(JSON.stringify({BarCode: rackNo, appName: 'WebMedicubes:rackManagment', timeStemp: +new Date()}));
      window.open(url.toString(), '_blank');
    } else {
      this.toastr.info('');
    }
  }
  getRacksDetail(rackno) {
    if (rackno) {
      this.event = "update";
      this.actionLabel = "Update";
      this.selrackDetail = this.racksDetailData.filter(a => { return a.RackNo == rackno });
      if (this.selrackDetail.length) {
        this.rackForm.patchValue({
          rackCode: this.selrackDetail[0].RackNo,
          rackDesc: this.selrackDetail[0].RackDesc,
          rackCapacity: this.selrackDetail[0].Capacity,
          rackType: this.selrackDetail[0].RackTypeID,
          rackBranch: this.selrackDetail[0].LocID,
        });
        this.cardTitle = "Update Rack ["+this.selrackDetail[0].RackNo+"]";
        this.RackID = this.selrackDetail[0].RackID
      }
      // this.rackForm.disable();
    } else {
      this.racksDetailData = [];
      let params = {
        "rackBranchID": this.rackBranhID
      }
      this.rackSerice.getRacksDetail(params).subscribe((resp: any) => {
        console.log("err", resp);
        if (resp.StatusCode == 200) {
          if (resp.PayLoad.length) {
            this.racksDetailData = resp.PayLoad;
          }
        }
        else {

        }
      }, (err) => {
        console.log("err", err);
      });
    }
  }

  //#region dropdowns

  getRackTypes() {
    this.rackSerice.getRacksTypes().subscribe((resp: any) => {
      console.log("resp", resp);
      if (resp.StatusCode == 200) {
        if (resp.PayLoad.length) {
          this.rackTypesList = resp.PayLoad;
        }
      }
    }, (err) => { console.log("err", err) })
  }

  getBranches() {
    this.lookupService.GetBranches().subscribe((resp: any) => {
      console.log("Branches resp", resp);
      if (resp.StatusCode == 200) {
        console.log("BranchesList", this.BranchesList);
        this.BranchesList = resp.PayLoad;
      }
      else {
        this.toastr.error("Something Went Wrong");
      }
    }, (err) => { console.log("err", err) })
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  //#endregion

  clearForms() {
    this.RackID=null;
    this.cardTitle = "Add Rack";
    this.actionLabel = "Save";
    this.event = "create";
    setTimeout(() => {
      this.rackForm.reset();
    }, 100);
  }

}
