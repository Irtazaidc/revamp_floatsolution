// @ts-nocheck
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { PatientService } from '../../services/patient.service';
import { LookupService } from '../../services/lookup.service';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';


@Component({
  standalone: false,

  selector: 'app-update-ref-by',
  templateUrl: './update-ref-by.component.html',
  styleUrls: ['./update-ref-by.component.scss']
})
export class UpdateRefByComponent implements OnInit {


  loggedInUser: UserModel;

  spinnerRefs = {
    loadForm: 'loadForm',
    refByDocField: 'refByDocField',
  }

  isSubmitted = false;
  isVisitIdAvailable = false;

  searchText = '';
  getRefBy = "";
  visitId = null;
  refByDocList = [];
  RefByDocID = null;
  getVisitId = null

  updateForm: FormGroup = this.fb.group({
    RefDoc: ['', [Validators.required]],
  });

  VisitInfoForm: FormGroup = this.fb.group({
    VisitID: ['', [Validators.required]],
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
  patientBasicInforFormSubmitted = false;

  ngbFormatterRefBy_input = (x: any) => x ? x.Name : ''; // will be displayed input field when value is selected
  ngbFormatterRefBy_output = (x: any) => x ? x.Name : '';
  ngbSearchRefBy = (text$: Observable<any>) => // used to bind data to dropdown
    text$.pipe(
      // debounceTime(300),
      distinctUntilChanged(),
      map(term => term.length < 2 ? [{ Name: 'Self' }]
        : this.refByDocList.filter(v => v.Name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
    )

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private auth: AuthService,
    private patientService: PatientService,
    private lookupService: LookupService,
  ) { }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.getRefByDoctors();
  }
  
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  
  getRefByviaVisitID() {
    this.visitId = null;
    this.isVisitIdAvailable = true;
    this.getVisitId = null;
    this.spinner.show(this.spinnerRefs.loadForm);
    if (this.VisitInfoForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      this.spinner.hide(this.spinnerRefs.loadForm);
      this.isVisitIdAvailable = false;
      return;
    }
  
    try {
      const formValue = this.VisitInfoForm.getRawValue();
      this.visitId = formValue.VisitID;
    } catch (error) {
      console.error("Error during search:", error);
      this.toastr.error("Failed to fetch visit information");
    }
    setTimeout(() => {
      this.spinner.hide(this.spinnerRefs.loadForm);
    }, 500);
  }
  
  updateRefByViaVisitId() {
    if (this.updateForm.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.patientBasicInforFormSubmitted = true;
      return;
    }
  
    const formValues = this.updateForm.getRawValue();
    const refByDoc = formValues.RefDoc?.Name;
  
    if (!refByDoc) {
      this.toastr.warning("Invalid Doctor Name");
      this.patientBasicInforFormSubmitted = true;
      return;
    }
    if(!this.visitId){
      this.toastr.warning("VisitId not found");
      return;
    }
  
    const objParams = {
      VisitID: this.visitId,
      RefBy: refByDoc,
      ModifiedBy: this.loggedInUser?.userid,
    };
  
    this.spinner.show(this.spinnerRefs.loadForm);
    
    this.patientService.updateRefbyViaVisitId(objParams).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.loadForm);
        if (res.StatusCode === 200) {
          const data = JSON.parse(res.PayLoadStr);
          if (data[0].Result === 1) {
            this.toastr.success(res.Message);
            // this.updateForm.reset();
            this.updateForm.patchValue({RefDoc: '',});
            this.VisitInfoForm.patchValue({VisitID: '',});
            this.getVisitId = null;
            this.visitId = null;
            this.isVisitIdAvailable = false;

          } else {
            this.toastr.error(res.Message);
            this.visitId = null;
            this.isVisitIdAvailable = false;
            this.getVisitId = null;
          }
        } else {
          this.toastr.error('Something went wrong');
          this.visitId = null;
          this.isVisitIdAvailable = false;
          this.getVisitId = null;
        }
      },
      (err) => {
        console.error("Error updating:", err);
        this.toastr.error('Connection error');
        this.spinner.hide(this.spinnerRefs.loadForm);
      }
    );
  }
  
  getRefByDoctors() {
    this.refByDocList = [{ Name: 'Self' }];
    const _params = {};
    this.spinner.show(this.spinnerRefs.refByDocField);
    this.lookupService.getRefByDoctors(_params).subscribe((res: any) => {
      this.spinner.hide(this.spinnerRefs.refByDocField);
      if (res && res.StatusCode == 200 && res.PayLoad) {
        let data = res.PayLoad;
        try {
          data = JSON.parse(data);
        } catch (ex) { }
        // console.log(data);
        this.refByDocList = data || [{ Name: 'Self' }];

        // console.log("this.refByDocList", this.refByDocList);
      }
    }, (err) => {
      this.spinner.hide(this.spinnerRefs.refByDocField);
      console.log(err);
    });
  }
  
  // refByDocSelected(e) {
  //   this.RefByDocID = e?.item?.RefId || null;
  // }
  
  validateNo(e: KeyboardEvent): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    return charCode >= 48 && charCode <= 57;
  }
  
  getCardValue(event) {
    if (event && event.VisitID) {
        this.getVisitId = event.VisitID.replace(/-/g, '');
        this.visitId = this.getVisitId;
    }
    else{
      this.toastr.warning('No Record Found');
    }
  }
  

  getVisitInfoByVisitID(VisitID) {
    const Params = {
      VisitID: VisitID || null,
    }
    this.patientService.getVisitInfoByVisitID(Params).subscribe((res: any) => {
      if (res.StatusCode == 200) {
        const data = JSON.parse(res.PayLoadStr);
        // this.getRefNo = data[0].RefNo || null;
        this.getRefBy = data[0].RefBy || null;

      } else {
        this.toastr.warning('Something went wrong');
      }
    }, (err) => {
      console.log(err);
      this.toastr.error('Connection error');
    })

  }
}
