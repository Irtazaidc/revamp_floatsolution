// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { BranchConfigService } from '../../services/branch-config.service';

@Component({
  standalone: false,

  selector: 'app-branch-config',
  templateUrl: './branch-config.component.html',
  styleUrls: ['./branch-config.component.scss']
})
export class BranchConfigComponent implements OnInit {
  IsAuthenticated = false;
  userCredentials: { UserName: string; Password: string; SourceName: string; };
  queryParams: any = {};
  branchTypesList: any = {};
  branchList: any = {};
  isSpinner = true;
  disabledButton = false; // Button Enabled / Disables [By default Enabled] for modal

  branchConfigForm = this.fb.group({
    branchType: ['', Validators.compose([Validators.required])],
    parentBranch: ['', Validators.compose([Validators.required])],
    sampleTravelTime: ['', ''],
    clockHourIDs: [ ,Validators.compose([Validators.required])],
  });
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
  selBranchID: any = 0;
  clockHrsList: any = [];
  UserID: any;
  existingBranch: any=[];
  spinnerRefs = {
    formSection: 'formSection'
  }
  selectedHours: any = [];
  constructor(private spinner: NgxSpinnerService,
    private branchService: BranchConfigService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.queryParams = this.getUrlParams();
    this.verifyUserCredentials();
    this.getBranchTypes();
    // this.getBranches();
    this.getClockHour();
  }

  verifyUserCredentials() {
    const params = {
      UserName: decodeURIComponent(this.queryParams.un || '').replace(/\s/g, '+'),
      Password: decodeURIComponent(this.queryParams.pw || '').replace(/\s/g, '+'),
      SourceName: decodeURIComponent(this.queryParams.appName || '').replace(/\s/g, '+'),
      BranchID: decodeURIComponent(this.queryParams.bID || '').replace(/\s/g, '+')
    }

    this.sharedService.verifyIDCEmpCredentials(params).subscribe((resp: any) => {
      this.sharedService.getUserID(params).subscribe((data: any) => {
        if(resp.StatusCode == 200) {
          if (data.PayLoad && data.PayLoad.length) {
            this.UserID = data.PayLoad[0].UserId;
          }
        } 
      });
      if (resp.StatusCode == 200) {
        // if (resp.payLoadArr && resp.payLoadArr.length) {
        this.IsAuthenticated = true
        if (resp.PayLoad && resp.PayLoad.length) {
          this.selBranchID = resp.PayLoad[0].BranchID;
          this.getBranches(this.selBranchID);

        }
      } else if (resp.StatusCode == 202) {
        this.IsAuthenticated = false
      } else {
        this.IsAuthenticated = false
      }
      this.spinner.hide();
    }, (err) => {
      console.log(err);
    });

  }

  getBranchTypes() {
    this.branchService.getBranchTypes().subscribe((resp: any) => {
      this.branchTypesList = resp.PayLoad;
    }, (err) => {
      console.log(err);
    });
  }
  getBranches(branchID) {
    const params = {
      "BranchID": branchID
    }
    this.branchService.getBranches(params).subscribe((resp: any) => {
      this.branchList = resp.PayLoadDS["Table"];
      this.selectedHours = resp.PayLoadDS["Table1"];
      this.existingBranch = this.branchList[0];
      console.log('Branch Data___________: ',this.branchList)
      this.branchConfigForm.patchValue({
        branchType: this.existingBranch["LocTypeId"],
        parentBranch: this.existingBranch["ParentLocID"],
        sampleTravelTime: this.existingBranch["SampleTravelTimeMin"],
        clockHourIDs: this.selectedHours.map((val:any) =>  val.ClockHourID),
      })
    }, (err) => {
      console.log(err);
    });
  }

  updateBranch() {
    this.isSpinner = false;
    this.disabledButton = true;
    const formValues = this.branchConfigForm.getRawValue();
    this.branchConfigForm.markAllAsTouched();
    this.spinner.show(this.spinnerRefs.formSection);

    if(this.branchConfigForm.invalid) {
      this.toastr.warning("Please fill the required information...!");
      this.isSpinner = true;
      this.spinner.hide(this.spinnerRefs.formSection); 
      this.disabledButton = false;
      return false;
    } else {
      const params = {
        BranchID: this.selBranchID,
        SampleTravelTime: formValues.sampleTravelTime,
        ParentBranchID: formValues.parentBranch,
        BranchIDTypeID: formValues.branchType,
        ClockHourIDs: formValues.clockHourIDs.join(','),
      }
      
      this.branchService.updateBranch(params).subscribe((resp: any) => {
        this.disabledButton = false;
        this.spinner.hide(this.spinnerRefs.formSection); 
        if (resp.StatusCode == 200) {
          this.toastr.success("Branch has been updated successfully");
          this.isSpinner = true;
          this.disabledButton = false;
        }
        else {
          this.toastr.error("Something Went Wrong");
          this.isSpinner = true;
          this.spinner.hide(this.spinnerRefs.formSection); 
          this.disabledButton = false;
        }

      }, (err) => {
        console.log("err", err);
        this.spinner.hide(this.spinnerRefs.formSection); 
        this.isSpinner = true;
        this.disabledButton = false;
        this.toastr.error("Something Went Wrong");

      });
    }

  }

  getUrlParams() {
    const vars = {};
    let hash;
    let encryptedQueryString = '';
    if (window.location.href.indexOf('?') === -1) {
      return vars;
    } else {
      encryptedQueryString = window.location.href.slice(window.location.href.indexOf('?') + 1);
    }
    try {
      encryptedQueryString = decodeURIComponent(encryptedQueryString);
    } catch (err) { }
    try {
      encryptedQueryString = atob(encryptedQueryString);
    } catch (err) {
      try {
        encryptedQueryString = atob(encryptedQueryString + '=');
      } catch (err) {
        try {
          encryptedQueryString = atob(encryptedQueryString + '==');
        } catch (err) {
          try {
            encryptedQueryString = atob(encryptedQueryString.split('=').filter(a => a).join('='));
          } catch (err) {
            // console.log(err);
          }
        }
      }
    }
    const hashes = encryptedQueryString.split('&'); // atob
    for (let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split(/=(.+)/); //.split('=');
      //vars.push(hash[0]);
      vars[hash[0]] = hash[1];
      // console.log("hash", hash);
    }
    Object.keys(vars).forEach(a => {
      // console.log(a, vars[a])
      if (a == 'VisitId_MC') {
        //vars.push('MCApp');
        vars['MCApp'] = 1;
      }
      if (a == 'SectionId') {
        //vars.push('secId');
        vars['secId'] = vars['SectionId'];
      }
      if (a == 'VisitNo') {
        //vars.push('accNo');
        vars['accNo'] = vars['VisitNo'];
      }
      const graphicalParameter = (a == 'Graphical' || a == 'graphical' ? a : '');
      if (a == graphicalParameter) {
        if (vars[graphicalParameter] != 'false' && vars[graphicalParameter] != false && vars[graphicalParameter] != 0 && vars[graphicalParameter] != '0') {
          //vars.push('rpty');
          vars['rpty'] = 'grf'; // vars['Graph'];
          //vars.push('graphical');
          vars['graphical'] = vars[graphicalParameter];
        }
      }
    })
    return vars;
  }

  getClockHour() {
    this.branchService.getClockHour().subscribe((resp: any) => {
      this.clockHrsList = resp.PayLoad;
    }, (err) => {
      console.log(err);
    });
  }

  onSelectAllHours(){
    this.branchConfigForm.patchValue({
      clockHourIDs:this.clockHrsList.map(a =>a.ClockHourID)
    })
  }
  onUnselectAllHours() {
    this.branchConfigForm.patchValue({
      clockHourIDs: []
    });
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }


  
}
