// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { TestProfileService } from 'src/app/modules/patient-booking/services/test-profile.service';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { DatePipe } from '@angular/common';
import { AuthService, UserModel } from '../../../../modules/auth';

@Component({
  standalone: false,

  selector: 'app-telephone-directory',
  templateUrl: './telephone-directory.component.html',
  styleUrls: ['./telephone-directory.component.scss']
})
export class TelephoneDirectoryComponent implements OnInit {

  loggedInUser: UserModel;
  extensionList = [];
  branchesList = [];
  departmentsList = [];
  FilterString='';
  ExtensionID=null;
  SubDepartmentID=null;
  LocID = null;

  constructor(
  private lookupService: LookupService,
    private testProfileService: TestProfileService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private auth: AuthService,
    ) { }
    spinnerRefs = {
      listSection: 'listSection'
    }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getBranches();
    this.getSubDepartment();
    this.getExtension();
    

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  getExtension() {
    this.spinner.show(this.spinnerRefs.listSection);
    this.extensionList = [];
    let _params = {
      ExtensionID: this.ExtensionID,
      SubDepartmentID: this.SubDepartmentID,
      LocID: this.LocID

    }
    this.lookupService.getExtension(_params).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.listSection);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }

        this.extensionList = data || [];
      }
    }, (err) => {
      // this.spinner.hide(this.spinnerRefs.panelsDropdown);
      console.log(err);
    });
  }

  getBranches() {
    this.branchesList = [];
    this.lookupService.GetBranches().subscribe((resp: any) => {
      let _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
      });
      this.branchesList = _response;
    }, (err) => {
      console.log(err);
    })
  }

  getSubDepartment() {
    this.departmentsList = []
    this.lookupService.GetSubDepartments().subscribe((resp: any) => {
      this.departmentsList = resp.PayLoad;
      if(!this.departmentsList.length){
        console.log('No Recored found');
      }
    }, (err) => {
      console.log(err);
    })
  }

}
