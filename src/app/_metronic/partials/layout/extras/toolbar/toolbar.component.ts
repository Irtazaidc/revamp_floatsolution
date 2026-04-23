// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { StorageService } from 'src/app/modules/shared/helpers/storage.service';
import { TokenService } from 'src/app/modules/shared/services/token.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: false,
})
export class ToolbarComponent implements OnInit {

  @ViewChild('qMaticTokenPopup') qMaticTokenPopup;
  qMaticTokenPopupRef: NgbModalRef;

  loggedInUser: UserModel;

  countersForQTokenList:any = [
    {id: '', name: '-- select counter --'}
    // {id: 1, name: 'Counter 1'},
    // {id: 2, name: 'Counter 2'},
    // {id: 3, name: 'Counter 3'},
    // {id: 4, name: 'Counter 4'},
    // {id: 5, name: 'Counter 5'},
    // {id: 6, name: 'Counter 6'},
    // {id: 7, name: 'Counter 7'},
    // {id: 8, name: 'Counter 8'},
    // {id: 9, name: 'Counter 9'},
    // {id: 10, name: 'Counter 10'}
  ];
  selectedQTokenCounter = '';
  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to proceed?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => {}
  }
  qTokenNo = '';
  screenPermissionsObjForPatReg:any = {};

  constructor(
    private router: Router,
    private storageService: StorageService,
    private auth: AuthService,
    private tokenService: TokenService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private appPopupService: AppPopupService
    ) {
      this.fillQMaticCounterList();
      this.selectedQTokenCounter = (this.storageService.getQManagementCounterNo() || '');
    }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();

    this.storageService.qMgmtTokenForPatReg.subscribe(token => {
      this.qTokenNo = this.storageService.getParseQMgmtToken(token);
    });
    this.qTokenNo = this.storageService.getParseQMgmtToken();
  }


  loadLoggedInUserInfo() {

    // this.storageService.setQMgmtToken('BarCode=4=3=003004 210828183350');
    
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
    // console.log('this.loggedInUser', this.loggedInUser);
  }




  /* start - qMatic */
  fillQMaticCounterList() {
    this.countersForQTokenList = [{id: '', name: '-- select counter --'}];
    for(let i = 1; i<= 25; i++)  {
      this.countersForQTokenList.push({id: i, name: 'Counter ' + i});
    }
  }
  qTokenCounterNoChangedEvent(event) {
    // console.log(event, ' ddddddddddddddddddddddddddddddddddddddd ', event.target.value, this.selectedQTokenCounter);
    this.storageService.setQManagementCounterNo(event.target.value);
  }
  callForToken() {
    const params = {
      branchId: this.loggedInUser.locationid,
      counterNo: this.selectedQTokenCounter || ''
    }
    if(!params.counterNo){
      this.toastr.warning('Please select counter number');
      return;
    }
    this.spinner.show();
    this.tokenService.tokenCall(params).subscribe( (res:any) => {
      this.storageService.setQMgmtToken(null);
      this.spinner.hide();
      console.log('success callForToken => ', res);
      if(res && res.StatusCode == 200) {
        try {
          // "\"BarCode=4=3=003004 210828183350\""
          res.PayLoadStr = JSON.parse(res.PayLoadStr);
          this.storageService.setQMgmtToken(res.PayLoadStr);
          // let qMgmtTokenDetails = (res.PayLoadStr || '').split('=');
          // if(qMgmtTokenDetails.length) {
          //   qMgmtTokenDetails[1]; // Token Number
          // }
        } catch (e) {
        }
      }
    }, (err) => {
      this.storageService.setQMgmtToken(null);
      this.spinner.hide();
      console.log('Error callForToken => ', err);
      this.toastr.error('Error Calling For Token');
    })
  }
  attendToken() {
    const params = {
      branchId: this.loggedInUser.locationid,
      counterNo: this.selectedQTokenCounter || ''
    }
    if(!params.counterNo){
      this.toastr.warning('Please select counter number');
      return;
    }
    this.spinner.show();
    this.tokenService.tokenAttend(params).subscribe( res => {
      // this.storageService.setQMgmtToken(null);
      this.removeQMgmtToken();
      this.spinner.hide();
      console.log('success attendToken => ', res);
    }, (err) => {
      // this.storageService.setQMgmtToken(null);
      this.removeQMgmtToken();
      this.spinner.hide();
      console.log('Error attendToken => ', err);
      this.toastr.error('Error Attending Token');
    })    
  }

  removeQMgmtToken() {
    this.storageService.setQMgmtToken('');
    this.qTokenNo = '';
  }
  getPermissionsForPatReg() {
    this.screenPermissionsObjForPatReg = this.auth.getLoggedInUserProfilePermissionsObj('reg');
  }
  openQMaticPopup() {
    this.qMaticTokenPopupRef = this.appPopupService.openModal(this.qMaticTokenPopup, {size: 'xs'});
  }
  closeQMaticPopup() {
    this.qMaticTokenPopupRef.close();
  }
  /* end  - qMatic */




  navigateToBuilder() {
    this.router.navigate(['/builder']);
  }
}
