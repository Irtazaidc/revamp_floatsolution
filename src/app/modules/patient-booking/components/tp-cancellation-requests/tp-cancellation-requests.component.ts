// @ts-nocheck
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { environment } from 'src/environments/environment';
import { LookupService } from '../../services/lookup.service';
import { TestProfileService } from '../../services/test-profile.service';
import { VisitService } from '../../services/visit.service';

@Component({
  standalone: false,

  selector: 'app-tp-cancellation-requests',
  templateUrl: './tp-cancellation-requests.component.html',
  styleUrls: ['./tp-cancellation-requests.component.scss']
})
export class TPCancellationRequestsComponent implements OnInit {


  @Input() buttonControls = ['visits'];
  @ViewChild('cancellationPopup') cancellationPopup;
  cancellationPopupRef: NgbModalRef;

  selectedPatient:any = '';
  loggedInUser: UserModel;


  branchesList = [];
  cancellationRequests = [];
  screenPermissions = [];
  screenPermissionsObj:any = {};

  spinnerRefs = {
    visits: 'visit',
    tests: 'tests'
  } 
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
  
  invoiceCopyTypeEnum = [
    // {
    //   id: 0,
    //   name: 'Print Preview'
    // },
    {
      id: 1,
      name: 'Print Preview',
    },
    {
      id: 2,
      name: 'Print Patient & Lab Copy',
    },
    {
      id: 3,
      name: 'Print Patient Copy',
    },
    {
      id: 4,
      name: 'Print Lab Copy',
    },
    {
      id: 5,
      name: 'Print Account Copy',
    },
    {
      id: 6,
      name: 'Account Copy Preview'
    }
  ];
  invoiceCopyType = 1;


  searchVisitsForm = this.fb.group({
    branchIds: [[]],
    fromDate: [''],
    toDate: [''],
  });
  pinFilterString = '';
  selectedVisit: any = '';

  testsForApproval = [];

  cancellationApprovelRemarks = '';
  
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    // private appPopupService: AppPopupService,
    private visitService: VisitService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private tpService: TestProfileService,
    public helperSrv: HelperService
  ) { }


  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getPermissions();
    this.getBranches();
    
    setTimeout(() => {
      this.searchVisitsForm.patchValue({
        fromDate: Conversions.getCurrentDateObject(),
        toDate: Conversions.getCurrentDateObject()
      });
      this.getCancellationRequests();
    }, 100);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;// this.storageService.getLoggedInUserProfile();
  }

  getPermissions() {
    const _activatedroute = this.route.routeConfig.path;
    // this.screenPermissionsObj = this.storageService.getLoggedInUserProfilePermissionsObj(_activatedroute);
    console.log(this.screenPermissionsObj);
  }

  /* Lookups */
  getBranches() {
        this.branchesList = [];
    const param = {
      UserID: this.loggedInUser.userid || -99,
    };
    this.lookupService.getAllLocationByUserID(param).subscribe(
      (res: any) => {
        if (res && res.StatusCode == 200 && res.PayLoad) {
          let data = res.PayLoad;
          try {
            data  = res.PayLoad;
            data.forEach((element, index) => {
              data[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
            });
          } catch (ex) {}
          this.branchesList = data || [];

         setTimeout(() => {
          this.searchVisitsForm.patchValue({
            branchIds: [this.loggedInUser.locationid]
          });
          }, 100);
        }
      },
      (err) => {
        console.log(err);
      }
    );
    // this.branchesList = [];
    // // this.spinner.show('GetBranches');
    // this.lookupService.GetBranches().subscribe((resp: any) => {
    //   // this.spinner.hide('GetBranches');
    //   let _response = resp.PayLoad;
    //   _response.forEach((element, index) => {
    //     _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre (Pvt) Ltd', 'IDC ');
    //   });
    //   this.branchesList = _response;
    //   //this.selectedBranch = 0;
    //   setTimeout(() => {
    //     //this.selectedBranch = this.loggedInUser.locationid;
    //     this.searchVisitsForm.patchValue({
    //       branchIds: [this.loggedInUser.locationid]
    //     });
    //   }, 100);
    // }, (err) => {
    //   // this.spinner.hide('GetBranches');
    // })
  }
  /* Lookups */


  getCancellationRequests() {
    this.selectedVisit = null;
    this.cancellationRequests = [];
    const formValues = this.searchVisitsForm.getRawValue();
    const params = {
      locationIds: (formValues.branchIds || [this.loggedInUser.locationid]).join(','),
      fromDate: formValues.fromDate ? Conversions.formatDateObject(formValues.fromDate) : '',
      toDate: formValues.toDate ? Conversions.formatDateObject(formValues.toDate, 'end') : ''
    };
    let valid = true, invalidFields = [];
    Object.keys(this.searchVisitsForm.controls).forEach( (a) => {
      if(this.searchVisitsForm.controls[a].errors) {
        valid = false;
        invalidFields.push(a);
      }
    });
    if(!valid) {
      this.toastr.warning('Please enter <strong>' + invalidFields.join(', ') + '</strong>', '', {enableHtml:true});
      return;
    }

    this.spinner.show();
    this.visitService.getVisitsForCancellationApproval(params).subscribe( (res: any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200 && res.PayLoad && res.PayLoad.length) {
        this.cancellationRequests = res.PayLoad;
      } else {
        this.cancellationRequests = [];
      }
    }, (err) => {
      this.cancellationRequests = [];
      this.toastr.error('Connection error');
      console.log(err);
      this.spinner.hide();
    })
  }

  selectedVisits = null
  getTestsForCancellationApprovel(visit) {
    this.testsForApproval = [];
    this.selectedVisit = visit;
    this.cancellationApprovelRemarks = '';

    if(!visit || !visit.VisitId) {
      return;
    }
    const params = {
      visitId: visit.VisitId,
      CancellationRequestId: visit.RequestIDs
    };
    this.spinner.show();
    this.tpService.getTestsForCancellationApproval(params).subscribe( (res:any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200 && res.PayLoadDS) {
        let data = res.PayLoadDS || [];
        try {
          data = JSON.parse(data);
        } catch (ex) {}
        // console.log(data);
        /*
        data.forEach(element => {
          element.checked = true;
        });
        */
        this.testsForApproval = data.Table || [];
        this.selectedVisits = this.combineVisits(data.Table1) || null;
      }
    }, (err) => {
      this.toastr.error('Error loading Tests data');
      this.spinner.hide();
      console.log(err);
    });
  }


private combineVisits(visits: any[]): any {
  if (!visits || visits.length === 0) return null;
  
  // Create a base object with common properties from the first visit
  const combined = { ...visits[0] };
  
  // Initialize the new properties
  combined.RefundedAMountCash = 0;
  combined.RefundedAMountRewardPoints = 0;
  combined.TitleCash = '';
  combined.TitleRewardPoint = '';
  
  // Collect all RequestIds
  const requestIds: number[] = [];
  
  // Process each visit
  visits.forEach(visit => {
    if (visit.Title === 'Cash') {
      combined.RefundedAMountCash = visit.RefundedAMount;
      combined.TitleCash = visit.Title;
    } else if (visit.Title === 'Reward Point') {
      combined.RefundedAMountRewardPoints = visit.RefundedAMount;
      combined.TitleRewardPoint = visit.Title;
    }
    // Collect all RequestIds
    requestIds.push(visit.RequestId);
  });
  
  // Convert RequestIds array to comma-separated string
  combined.RequestId = requestIds.join(', ');
  
  return combined;
}

  approveCancellation() {
    if((this.cancellationApprovelRemarks || '').length < 10) {
      this.toastr.warning('Please enter remarks, minimum 10 characters');
      return;
    }
    else if((this.cancellationApprovelRemarks || '').length > 500) {
      this.toastr.warning('Please enter remarks, less than 500 characters');
      return;
    }
    /*
    if(!this.testsForApproval.filter(a => a.checked).length) {
      this.toastr.warning('Please select atleast one test for cancellation approvel');
      return;
    }
    */
    const params = {
      UserID: this.loggedInUser.userid,
      VisitID: this.selectedVisit.VisitId,
      CancellationRequestIDs: this.selectedVisits.RequestId,
      TPIDs: this.testsForApproval.map(a => a.TPId).join(','),
      ApprovalRemarks: this.cancellationApprovelRemarks,
      BranchID: this.loggedInUser.locationid
    }
    if(!params.UserID) {
      this.toastr.warning('UserId not provided');
      return;
    }
    if(!params.VisitID) {
      this.toastr.warning('VisitID not provided');
      return;
    }
    if(!params.CancellationRequestIDs) {
      this.toastr.warning('CancellationRequestIDs not provided');
      return;
    }
    if(!params.ApprovalRemarks) {
      this.toastr.warning('Approval Remarks not provided');
      return;
    }
    
    this.spinner.show();
    this.tpService.approveTestsCancellation(params).subscribe( (res: any) => {
      this.spinner.hide();
      if(res && res.StatusCode == 200) {
        this.toastr.success('Cancellation Approved');
        this.selectedVisit = null;
        // this.getTestsForCancellationApprovel(this.selectedVisit);
        this.getCancellationRequests();
      } else {
        this.toastr.error('Test Cancellation not Approved');
        this.toastr.error(res.Error);
      }
    }, (err) => {
      this.cancellationRequests = [];
      this.toastr.error('Error Approving Cancellation request');
      console.log(err);
      this.spinner.hide();
    })
  }
  
  visitSelectedEvent(visit) {
    this.getTestsForCancellationApprovel(visit);
  }
  /*
  selectAllTests(e) {
    // console.log('e.target.value ', e, e.target.checked);
    this.testsForApproval.forEach( a => {
      a.checked = false;
      // console.log('a.StatusId > 0 || a.StatusId < 8 ', a.StatusId, a.StatusId > 0, a.StatusId < 8);
      a.checked = e.target.checked;
    })
  }
  */

  onSelectAllBranches() {
    this.searchVisitsForm.patchValue({
      branchIds: this.branchesList.map(a => a.LocId)
    });
  }
  
  onUnselectAllBranches() {
    this.searchVisitsForm.patchValue({
      branchIds: []
    });
  }


  openInvoice(visit) {
    const url = environment.patientReportsPortalUrl + 'pat-reg-inv?p='+ btoa(JSON.stringify({visitID: visit.VisitID, loginName: this.loggedInUser.username, appName: 'WebMedicubes:search_pat', copyType: (this.invoiceCopyType || 0), timeStemp: +new Date()}));
    window.open(url.toString(), '_blank');
    // const url = window.location.href.split('#')[0] + '#/invoice/patient-visit-invoice' + '?p='+ btoa(JSON.stringify({visitID: visit.visitID, loginName: this.loggedInUser.username, timeStemp: +new Date()}));
    // window.open(url.toString(), '_blank');
  }




}


