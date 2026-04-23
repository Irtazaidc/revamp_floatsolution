// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../../../core';
import { Observable } from 'rxjs';
import { UserModel } from '../../../../../../modules/auth/_models/user.model';
import { AuthService } from '../../../../../../modules/auth/_services/auth.service';
import { Router } from '@angular/router'
import moment from 'moment';

@Component({
  selector: 'app-user-offcanvas',
  templateUrl: './user-offcanvas.component.html',
  styleUrls: ['./user-offcanvas.component.scss'],
  standalone: false,
})
export class UserOffcanvasComponent implements OnInit {
  extrasUserOffcanvasDirection = 'offcanvas-right';
  user$: Observable<UserModel>;
  macAddress: '';
  toggleMACEntryField = true;
  un: '';
  pw: '';
  requiredNoOfClicks = 5;
  userClicks = 0;
  loggedInUser: UserModel;
  UserLocalInfo: any;

  constructor(private layout: LayoutService, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.extrasUserOffcanvasDirection = `offcanvas-${this.layout.getProp(
      'extras.user.offcanvas.direction'
    )}`;
    
    this.user$ = this.auth.currentUserSubject.asObservable();
    setTimeout(() => {
      // this.UserLocalInfo = this.auth.getSystemInfoFromStorage();
    }, 2000);
    // console.log("UserLocalInfoUserLocalInfoUserLocalInfoUserLocalInfo", this.UserLocalInfo)
  }
  loadLoggedInUserInfo() {
    
    this.loggedInUser = this.auth.currentUserValue;;
  }
  logout() {
    // this.auth.logout();
    // document.location.reload();
    this.loadLoggedInUserInfo();

    const params = {
      ActionLogObj: {
        ActionId: 4,
        FormName: "Float Solution (Metacubes) logout",
        Description: "Float Solution (Metacubes) logout, UserName: " + this.loggedInUser.username ? this.loggedInUser.username : '',
        OldValues: "",
        MachineInfo: "UpdatedOn: " + moment(new Date()).format('D-MMM-YYYY hh:mm:ss'),
        UserId: this.loggedInUser.userid || -1,
        // CreatedOn: "",
        IPAddress: "",
        IPLocation: "",
        SourceID: 1,
        SourceDetailID: 3,
        ActionRemarks: "",
        ActionRemarksJSON: "",
        PatientPortalUserID: -1,
        PanelUserID: -1
      }
    }

    this.auth.logout(params).subscribe((resp: any) => {


    }, (err) => { })
    document.location.reload();
  }
  myProfile(path: string) {
    this.router.navigate([path]);
  }
  updateMACManually() {
    if (this.macAddress) {
      this.auth.updateUserMACAddress(this.macAddress);
    }
    this.cancelMACClick();
  }




  clickedOnMACAddress() {
    this.userClicks++;
    console.log('uc ', this.userClicks);
    if (this.userClicks >= this.requiredNoOfClicks) {
      this.userClicks = 0;
      this.toggleMACEntryField = false;
    }
    // let tout = setTimeout(()=> {
    //   console.log('timer end', this.userClicks);
    //   if(this.userClicks < this.requiredNoOfClicks) {
    //     this.cancelMACClick();
    //   }
    // },5000);
    // clearTimeout(tout);
  }
  cancelMACClick() {
    this.toggleMACEntryField = true;
    this.userClicks = 0;
  }



}
