// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { DiscountCardService } from '../../services/discount-card.service';
import { LookupService } from '../../services/lookup.service';
import { PatientService } from '../../services/patient.service';

@Component({
  standalone: false,

  selector: 'app-update-visit-info',
  templateUrl: './update-visit-info.component.html',
  styleUrls: ['./update-visit-info.component.scss']
})
export class UpdateVisitInfoComponent implements OnInit {


  loggedInUser: UserModel;

  spinnerRefs = {
    loadForm: 'loadForm',
  }

  isSubmitted = false;

  searchText = '';
  getRefNo:any = "";
  visitId:number;

  updateForm: FormGroup = this.fb.group({
    RefNo: ['', [Validators.required, Validators.maxLength(55)]],
  });


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


  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private patientService: PatientService,
  ) {  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();

 
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  getVisitNo(visit: any) {
    if(visit){
      this.visitId = null;
      this.updateForm.reset();
        this.visitId = visit.VisitID;
        setTimeout(() => {
          this.getVisitInfoByVisitID(this.visitId);
          this.spinner.hide(this.spinnerRefs.loadForm);
        }, 500);
    }
    else{ this.visitId = null; }
  }

  updateVisit(){
    const formValues  = this.updateForm.getRawValue();
    if (this.updateForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    const objParams = {
      VisitID : this.visitId || null,
      RefNo : formValues.RefNo || null,
      ModifiedBy: this.loggedInUser.userid, 
    }
    this.spinner.show(this.spinnerRefs.loadForm);
    this.patientService.updateVisitInfo(objParams).subscribe((res: any) => {
    this.spinner.hide(this.spinnerRefs.loadForm);
      if (res.StatusCode == 200 ) {
        this.toastr.success('Successfully updated');
        this.visitId = null;
      } else {
        this.toastr.warning('Something went wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    this.spinner.hide(this.spinnerRefs.loadForm);
    })

  }

  getVisitInfoByVisitID(VisitID){
    const Params = {
      VisitID : VisitID || null,
    }
    this.patientService.getVisitInfoByVisitID(Params).subscribe((res: any) => {
      if (res.StatusCode == 200 ) {
        const data = JSON.parse(res.PayLoadStr);
        this.getRefNo = data[0].RefNo || null;
      } else {
        this.toastr.warning('Something went wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })

  }
}

