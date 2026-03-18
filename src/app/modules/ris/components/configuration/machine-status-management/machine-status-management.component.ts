// @ts-nocheck
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-machine-status-management',
  templateUrl: './machine-status-management.component.html',
  styleUrls: ['./machine-status-management.component.scss']
})
export class MachineStatusManagementComponent implements OnInit {
  spinnerRefs = {
    machineStatusSection: 'machineStatusSection'
  }
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to update ?',
    popoverTitleTests: 'Are you <b>sure</b> want to save ?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  constructor(
    private auth: AuthService,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }
  loggedInUser: UserModel;
  RISMachineID: any = null;
  isOnOff: any = true;
  isOnOffRemarks: any = null;
  @Input() ParamsPayLoad = {
    RISMachineID: null,
    isOnOff: null,
    isOnOffRemarks: null
  };
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.RISMachineID = this.ParamsPayLoad.RISMachineID;
    this.isOnOff = this.ParamsPayLoad.isOnOff||false;
    this.isOnOffRemarks = this.ParamsPayLoad.isOnOffRemarks;
  }
  ngOnChanges(changes: SimpleChanges) {
    this.RISMachineID = this.ParamsPayLoad.RISMachineID;
    this.isOnOff = this.ParamsPayLoad.isOnOff;
    this.isOnOffRemarks = this.ParamsPayLoad.isOnOffRemarks;
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  isSpinner = true;
  disabledButton = false;
  updateMachineStatus() {
    let formData = {
      RISMachineID: this.RISMachineID,
      isOnOff: this.isOnOff||false,
      isOnOffRemarks: this.isOnOffRemarks,
      CreatedBy: this.loggedInUser.userid || -99,
    };
    
    if (!formData.isOnOffRemarks) {
      this.toastr.error("Please provide remarks", "Validation Error!");
      return
    } else {
      this.spinner.show(this.spinnerRefs.machineStatusSection);
      this.disabledButton = true;
      this.isSpinner = false;
      this.sharedService.insertUpdateData(API_ROUTES.INSERT_UPDATE_RIS_MACHINE_ON_OFF_LOG, formData).subscribe((data: any) => {
        this.spinner.hide(this.spinnerRefs.machineStatusSection);
        this.disabledButton = false;
        this.isSpinner = true;
        if (JSON.parse(data.PayLoadStr).length) {
          if (data.StatusCode == 200) {
            this.toastr.success(data.Message);
          } else {
            this.toastr.error(data.Message)
          }
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.machineStatusSection);
        this.disabledButton = false;
        this.isSpinner = true;
        this.toastr.error('Connection error');
      })
    }



  }

}
