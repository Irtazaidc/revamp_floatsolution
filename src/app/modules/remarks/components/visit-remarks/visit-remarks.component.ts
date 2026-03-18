// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
// import { StorageService } from '../../../../shared/helpers/storage.service';
// import { User } from '../../../../models/user';
import { VisitRemarksService } from '../../services/visit-remarks.service';
import { AuthService, UserModel } from 'src/app/modules/auth';

@Component({
  standalone: false,

  selector: 'app-visit-remarks',
  templateUrl: './visit-remarks.component.html',
  styleUrls: ['./visit-remarks.component.scss']
})
export class VisitRemarksComponent implements OnInit {

  @Input('propVisitNo') propVisitNo = '';
  @Input('editing') editing = { save: false }; // {save: true}
  @Input('moduleName') moduleName = '';
  @Input('showRemarksPriority') showRemarksPriority = true; //Adding remarks field and button will show by default , will false for panel security conversion.

  loggedInUser: UserModel;

  visitRemarks = [];
  visitRemarksToSave = '';
  remarksPriority = '0';

  spinnerRefs = {
    visitRemarks: 'visitRemarks'
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

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private visitRemarksService: VisitRemarksService,
    private auth: AuthService
    // private storageService: StorageService
  ) { }

  ngOnInit(): void {
    // console.log('sdfsf asdf adsf adsf adsf');
    this.loadLoggedInUserInfo();
  }

  ngAfterViewInit() {
  }

  ngOnChanges(e) {
    this.getVisitRemarks();
  }


  loadLoggedInUserInfo() {
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;
  }


  getVisitRemarks() {
    this.visitRemarks = [{ Remarks: 'Fetching remarks...' }];
    let params = {
      visitId: this.propVisitNo,
    }
    if (!params.visitId) {
      this.visitRemarks = [{ Remarks: 'Please provide Visit Id' }];
      // this.toastr.warning('Please provide valid visit id');
      return;
    }
    this.spinner.show(this.spinnerRefs.visitRemarks);
    this.visitRemarksService.getVisitRemarks(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitRemarks);
      if (res && res.StatusCode == 200) {
        if (res.PayLoad && res.PayLoad.length) {
          this.visitRemarks = res.PayLoad;
          // console.log(this.visitRemarks);
        }else{
          this.visitRemarks = [{ Remarks: 'No remarks found' }];
        }
      }
    }, (err) => {
      this.visitRemarks = [{ Remarks: 'error loading remarks' }];
      this.spinner.hide(this.spinnerRefs.visitRemarks);
      console.log(err);
      this.toastr.error('Error loading Remarks');
    });
  }


  saveVisitRemarks() {
    let params = {
      VisitId: this.propVisitNo,
      ModuleName: this.moduleName || 'Receive Phlebotomy',
      Remarks: (this.visitRemarksToSave || '').toString().trim(),
      Priority: this.remarksPriority || 0,
      UserId: this.loggedInUser.userid,
    };
    if (!params.VisitId || !params.Remarks) {
      return;
    }
    this.spinner.show(this.spinnerRefs.visitRemarks);
    this.visitRemarksService.saveVisitRemarks(params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.visitRemarks);
      if (res && res.StatusCode == 200) {
        this.getVisitRemarks();
        this.visitRemarksToSave = '';
        this.remarksPriority = '1';
        this.toastr.success('Remarks saved successfully');
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.visitRemarks);
      console.log(err);
      this.toastr.error('Error Saving Remarks');
    });
  }

}
