// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-rider-messagebox',
  templateUrl: './rider-messagebox.component.html',
  styleUrls: ['./rider-messagebox.component.scss']
})
export class RiderMessageboxComponent implements OnInit {

  notificationForms: any = {
    Title: '',
    Riders: [],
    MessageBody: '',
  }

  spinnerRefs = {
    pushNotification_specific: 'pushNotification_specific',
    pushNotification_generic: 'pushNotification_generic',
    pushNotificationsList: 'pushNotificationsList',
  }

  isSubmitted = false;
  loggedInUser: UserModel;
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
  constructor(private HCService: HcDashboardService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.RidersDetail();
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  sendNotifications() {
    this.isSubmitted = true;

    const title = this.notificationForms.Title?.trim() || '';
    const message = this.notificationForms.MessageBody?.trim() || '';

    if (title.length < 15 || message.length < 15 || !this.notificationForms.Riders?.length) {
      this.toastr.error("Title and Message must be at least 15 characters long");
      return;
    }
    let params = {
      Title: title,
      MessageBody: message,
      CreatedBy: this.loggedInUser?.userid || -99,
      isRead: 0,
      ReadBy: this.notificationForms?.Riders?.length ? this.notificationForms.Riders.join(',') : this.RidersDetailList.map(x => x.UserID).join(','),
    }
    this.spinner.show(this.spinnerRefs.pushNotification_generic);
    this.HCService.insertRiderMessageBox(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.pushNotification_generic);
      if (resp?.StatusCode === 200 && resp.PayLoad[0].Result === 1) {
        this.toastr.success("Notification Sent Successfully");
        this.notificationForms = { Title: '', Riders: [], MessageBody: '' };
        this.isSubmitted = false;
      } else {
        this.toastr.error("Error in sending notification");
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.pushNotification_generic);
      this.toastr.error("Something Went Wrong")
    })
  }

  RidersDetailList = [];
  RidersDetail() {
    let params = {
      RiderID: 0,
      // LocID:-1,
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailList = resp.PayLoad;
      console.log("this.RidersDetailList", this.RidersDetailList);
    },
      (err) => { console.log(err) })
  }

  onSelectAllRiders() {
    this.notificationForms.Riders = this.RidersDetailList.map(x => x.UserID);
  }
  onUnselectAllRiders() {
    this.notificationForms.Riders = [];
  }
}
