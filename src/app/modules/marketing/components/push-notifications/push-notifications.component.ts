// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { PushNotificationsService } from '../../services/push-notifications.service';

@Component({
  standalone: false,

  selector: 'app-push-notifications',
  templateUrl: './push-notifications.component.html',
  styleUrls: ['./push-notifications.component.scss']
})
export class PushNotificationsComponent implements OnInit {
  @ViewChild('authenticateAdmin') authenticateAdmin;
  username: any = "";
  password: any = "";
  isSpinner: boolean = true;//Hide Button Spinner
  pushNotificationsList = [];
  selectedNotification: any = '';
  pushNotificationTokens_generic = [];
  pushNotificationTokens_specific = [];

  showSpecificUsersNotificationsArea = true;

  notificationForms: any = {
    new: {
      title: '',
      subtitle: '',
      body: '',
      data: ''
    },
    generic: {
      title: '',
      subtitle: '',
      body: '',
      data: '',
      badge: 0,
      to: []
    },

    specific: {
      title: '',
      subtitle: '',
      body: '',
      data: '',
      badge: 0,
      to: []
    }
  }

  loadingDataRow = [{
    Message: 'Loading...'
  }];
  noRecordDataRow = [{
    Message: 'no record found'
  }];
  errorDataRow = [{
    Message: 'Server error'
  }];
  spinnerRefs = {
    pushNotification_specific: 'pushNotification_specific',
    pushNotification_generic: 'pushNotification_generic',
    pushNotificationsList: 'pushNotificationsList',
  }
  obserbableSubscriptionsArr: Subscription[] = [];
  IsValidUser: any = null;
  disabledButtonModal = false;

  searchText = '';

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


  constructor(
    private pushNotificationsService: PushNotificationsService,
    private spinner: NgxSpinnerService,
    // private notification: NotificationsService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private auth: AuthService
    // private storageService: StorageService,
    // private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    if (this.auth.currentUserValue) { // this.cookieService.get('isLoggedIn') || this.storageService.isLoggedIn()
      this.IsValidUser = 1
      this.getPushNotificationsList();
      this.getPushNotificationTokens_generic();
      this.showSpecificUsersNotificationsArea ? this.getPushNotificationTokens_specific() : '';
    } else {
      this.IsValidUser = null;
      setTimeout(() => {
        this.modalService.open(this.authenticateAdmin, { size: 'md', scrollable: true })
      }, 500);
    }
  }

  getPushNotificationsList() {
    this.pushNotificationsList = [];
    let params = {
    }
    this.showSpinner(this.spinnerRefs.pushNotificationsList);
    this.pushNotificationsService.getPushNotificationsList(params).subscribe((res: any) => {
      this.pushNotificationsList = res.payLoadDT || [];
      this.hideSpinner(this.spinnerRefs.pushNotificationsList);
    }, (err) => {
      this.pushNotificationsList = [];
      this.hideSpinner(this.spinnerRefs.pushNotificationsList);
      console.log(err);
    })
  }
  getPushNotificationTokens_generic() {
    this.pushNotificationTokens_generic = [];
    let params = {
      "notificationType": 1
    }
    this.showSpinner(this.spinnerRefs.pushNotification_generic);
    this.pushNotificationsService.getPushNotificationTokens(params).subscribe((res: any) => {
      this.pushNotificationTokens_generic = res.PayLoadDT || [];
      this.hideSpinner(this.spinnerRefs.pushNotification_generic);
      // console.log(res);
    }, (err) => {
      this.pushNotificationTokens_generic = [];
      this.hideSpinner(this.spinnerRefs.pushNotification_generic);
      console.log(err);
    })
  }
  getPushNotificationTokens_specific() {
    this.pushNotificationTokens_specific = [];
    let params = {
      "notificationType": 2
    }
    this.showSpinner(this.spinnerRefs.pushNotification_specific);
    this.pushNotificationsService.getPushNotificationTokens(params).subscribe((res: any) => {

      this.pushNotificationTokens_specific = res.PayLoadDT || [];
      this.hideSpinner(this.spinnerRefs.pushNotification_specific);
      // console.log(res);
    }, (err) => {
      this.pushNotificationTokens_specific = [];
      this.hideSpinner(this.spinnerRefs.pushNotification_specific);
      console.log(err);
    })
  }

  saveNotification(notificationType, spinnerRef) {
    let params = {
      mobileNotificationID: null,
      notificationType: notificationType || 1,
      notificationTitle: this.notificationForms.new.title || '',
      notificationSubTitle: this.notificationForms.new.subtitle || '',
      notificationBody: this.notificationForms.new.body || '',
      notificationData: this.notificationForms.new.data || '',
      createdBy: 1
    }
    if (!params.notificationTitle || !params.notificationBody) {
      this.toastr.warning('please enter title and body', 'Warning');
      return;
    }
    this.showSpinner(spinnerRef);
    this.pushNotificationsService.savePushNotification(params).subscribe((res: any) => {
      this.hideSpinner(spinnerRef);
      this.getPushNotificationsList();
    }, (err) => {
      this.hideSpinner(spinnerRef);
      console.log(err);
    })
  }

  sendNotifications(action) {
    let params = {
      notificationsData: [],
      notificationSettingsData: {
        mobileNotificationID: this.selectedNotification.mobileNotificationID || null,
        notificationStatus: 1, // {unread | read}
        notificationType: 1, // {generic | specific}
        createdBy: 1
      }
    };
    switch (action) {
      case 'generic': {
        params.notificationSettingsData.notificationType = 1;
        this.pushNotificationTokens_generic.forEach(a => {
          let obj: PushNotificationObj = {
            to: [a.DeviceToken],
            title: this.notificationForms.generic.title || '',
            subtitle: this.notificationForms.generic.subtitle || '',
            body: this.notificationForms.generic.body || '',
            data: ({ ...(this.notificationForms.generic.data ? { data: this.notificationForms.generic.data } : {}), ...{ MobileDeviceNotificationID: a.MobileDeviceNotificationID } }),
            badge: ((a.unReadNotificationCount || 0) + 1),
            sound: 'default',
            mobileDeviceNotificationID: a.MobileDeviceNotificationID
            // channelId: 1
          }
          params.notificationsData.push(obj);
        });
        break;
      }
      case 'specific': {

        params.notificationSettingsData.notificationType = 2;
        this.pushNotificationTokens_specific.filter(a => a.checked).forEach(a => {
          let obj: PushNotificationObj = {
            to: [a.DeviceToken],
            title: this.notificationForms.specific.title || '',
            subtitle: this.notificationForms.specific.subtitle || '',
            body: this.notificationForms.specific.body || '',
            data: ({ ...(this.notificationForms.specific.data ? { data: this.notificationForms.specific.data } : {}), ...{ MobileDeviceNotificationID: a.MobileDeviceNotificationID } }),
            badge: ((a.unReadNotificationCount || 0) + 1),
            sound: 'default',
            mobileDeviceNotificationID: a.MobileDeviceNotificationID
            // channelId: 1
          }
          params.notificationsData.push(obj);
        });
        break;
      }
    }

    if (this.selectedNotification) {
      params.notificationsData.forEach(a => {
        this.selectedNotification.notificationTitle ? a.title = this.selectedNotification.notificationTitle : null;
        this.selectedNotification.notificationTitle ? a.subtitle = this.selectedNotification.notificationTitle : null;
        this.selectedNotification.notificationBody ? a.body = this.selectedNotification.notificationBody : null;
        this.selectedNotification.notificationData ? a.data = this.selectedNotification.notificationData : null;
      });
    }


    if (action == 'generic') {
      this.showSpinner();
      let parm = {
        "notificationType": 1
      }
      this.pushNotificationsService.getPushNotificationTokens(parm).subscribe((res: any) => {
        this.hideSpinner();
        this.pushNotificationTokens_generic = res.PayLoadDT || [];
        params.notificationsData = [];
        this.pushNotificationTokens_generic.forEach(a => {
          let obj: PushNotificationObj = {
            to: [a.DeviceToken],
            title: this.notificationForms.generic.title || '',
            subtitle: this.notificationForms.generic.subtitle || '',
            body: this.notificationForms.generic.body || '',
            data: ({ ...(this.notificationForms.generic.data ? { data: this.notificationForms.generic.data } : {}), ...{ MobileDeviceNotificationID: a.MobileDeviceNotificationID } }),
            badge: ((a.UnReadNotificationCount || 0) + 1),
            sound: 'default',
            mobileDeviceNotificationID: a.MobileDeviceNotificationID
            // channelId: 1
          }
          params.notificationsData.push(obj);
        });
        if (!params.notificationsData.length) {
          this.toastr.info('No data to send', 'Information');
          return;
        }
        if (!params.notificationsData[0].title || !params.notificationsData[0].body) {
          this.toastr.info('please enter title and body OR select notification from list', 'Information');
          return;
        }
        if (!params.notificationsData.map(a => a.to).length) {
          //this.notification.notify({title: 'Warning', message: 'please select atleast one user to send', type: 'info'});
          this.toastr.info('No User to send notification', 'Information');
          return;
        }
        console.log('data to post => ', params);

        if (res.PayLoadDT && res.PayLoadDT.length)
          this.sendNotifications_post_in_chunk(params);
        //this.sendNotifications_post(params);

      }, (err) => {
        console.log(err);
        this.hideSpinner();
      })
    } else {
      if (!params.notificationsData.length) {
        this.toastr.info('No data to send', 'Information');
        return;
      }
      if (!params.notificationsData[0].title || !params.notificationsData[0].body) {
        this.toastr.info('please enter Title & Body OR select notification from List', 'Information');
        return;
      }
      if (!params.notificationsData.map(a => a.to).length) {
        //this.notification.notify({title: 'Warning', message: 'please select atleast one user to send', type: 'info'});
        this.toastr.info('No User to send notification', 'Warning');
        return;
      }
      console.log('data to post => ', params);
      // this.sendNotifications_post_in_chunk(params);
      this.sendNotifications_post(params);
    }
  }

  sendNotifications_post_in_chunk(params) {
    let requestObj = JSON.parse(JSON.stringify(params)); requestObj.notificationsData = [];
    let chunksArr = [];
    let chunkNumber = 0, countsize = 50;
    for (let i = 0; i < Math.ceil(params.notificationsData.length / countsize); i++) {
      let currentChunk = params.notificationsData.slice(chunkNumber, chunkNumber + countsize);
      let obj = JSON.parse(JSON.stringify(requestObj));
      obj.notificationsData = currentChunk;
      chunksArr.push(obj);
      chunkNumber += countsize;
    }
    let reqArr = [];
    chunksArr.forEach(req => {
      reqArr.push(this.pushNotificationsService.sendPushNotifications(req).subscribe((resp: any) => { }, (err) => { }));
    })
    this.showSpinner();
    Promise.all(reqArr).then(resp => {
      this.hideSpinner();
      this.toastr.success('Push Notifications Sent', 'Success');
      // this.sendNotifications('generic')
    }, err => {
      this.toastr.error('Error sending Push Notifications', 'Error');
      this.hideSpinner();
    });
  }

  sendNotifications_post(params) {
    console.log('=============> ', params);

    this.showSpinner();
    this.pushNotificationsService.sendPushNotifications(params).subscribe((res) => {
      this.hideSpinner();
      this.toastr.success('Push Notifications Sent', 'Success');
      // this.sendNotifications('generic')
    }, (err) => {
      this.toastr.error('Error sending Push Notifications', 'Error');
      this.hideSpinner();
    });
  }
  checkAll(event, action) {

    switch (action) {
      case 'generic': {
        this.pushNotificationTokens_generic.forEach((a) => {
          a['checked'] = !!event.target.checked;
        })
        break;
      }
      case 'specific': {
        this.pushNotificationTokens_specific.forEach((a) => {
          a['checked'] = !!event.target.checked;
        })
        break;
      }
    }
  }


  showSpinner(name = '') {
    if (name) {
      this.spinner.show(name);
    } else {
      this.spinner.show();
    }
  }
  hideSpinner(name = '') {
    if (name) {
      this.spinner.hide(name);
    } else {
      this.spinner.hide();
    }
  }



  openLoginModal() {
    this.modalService.open(this.authenticateAdmin, { size: 'md', scrollable: true })
  }
  Login() {
    this.isSpinner = false;//Show Submit Button Loader
    if (this.username == 'admin@idcmarketting' && this.password == 'Admin@idcmkt!') {
      setTimeout(() => {
        this.isSpinner = true;//Hide Submit Button Loader
      }, 1000);
      const dateNow = new Date();
      dateNow.setMinutes(dateNow.getMinutes() + 5);
      // this.cookieService.set('isLoggedIn', 'true', dateNow);
      this.getPushNotificationsList();
      this.getPushNotificationTokens_generic();
      this.showSpecificUsersNotificationsArea ? this.getPushNotificationTokens_specific() : '';
      this.IsValidUser = 1;
      this.modalService.dismissAll();
    }
    else {
      setTimeout(() => {
        this.isSpinner = true;//Hide Submit Button Loader
      }, 1000);
      this.toastr.error('Invalid Username Or Password', 'Error');
    }

  }

  closeImageModal() {
    this.modalService.dismissAll();
  }
}



interface PushNotificationObj {
  to: any, //'List<string> PushTo',
  data?: any, //JSON.stringify({type: 'visit', data: {a: '123456789', b: 'some text'}}), //PushData
  title: string, // PushTitle,
  body: string, // PushBody,
  // ttl: 5000, // PushTTL,
  // expiration: 10000, // PushExpiration,
  // priority: 'high', // PushPriority,
  subtitle?: string, // PushSubTitle,
  sound?: string, // PushSound,
  badge?: number, // PushBadgeCount,
  channelId?: number // PushChannelId
  mobileDeviceNotificationID: number // not for pushnotification sdk - for personal use
}