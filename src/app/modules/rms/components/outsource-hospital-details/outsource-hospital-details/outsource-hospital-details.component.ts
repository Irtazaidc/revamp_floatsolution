// @ts-nocheck
import { Component,EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { ToastrService } from "ngx-toastr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { OutsourceHospitalsComponent } from "../../outsource-hospital/outsource-hospitals/outsource-hospitals.component";
import { API_ROUTES } from "src/app/modules/shared/helpers/api-routes";

@Component({
  standalone: false,

  selector: "app-outsource-hospital-details",
  templateUrl: "./outsource-hospital-details.component.html",
  styleUrls: ["./outsource-hospital-details.component.scss"],
})
export class OutsourceHospitalDetailsComponent implements OnInit {
  
  @Output() updatedFormSubmitted = new EventEmitter<string>();

  @Input() outSourceHospitalVal : any = null;

  HospitalDetailsForm: FormGroup = this.fb.group({
    OutSourceHospitalID: [null],
    OutSourceHospitalName: ["", Validators.required],
    HospitalAddress: ["", Validators.required],
    ContactNo: [
      "",
      [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)],
    ],
    ContactEmail: ["", [Validators.required, Validators.email]],
    ContactPerson: ["", Validators.required],
  });
  OutSourceHospitalID = null
  errorMessage: string = "";
  isSubmitted = false;
  isSpinner = true;
  disabledButton = false;
  ActionLabel ="Save";
  disabledButtonTests: boolean = false; 
  CardTitle ="Add Hospital";
  HospitalNameToShowOnCard: any='';




  spinnerRefs = {
    hospitalDetailSection: 'hospitalDetailSection'
    
  }

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Are you <b>sure</b> want to update ?',
    popoverTitleTests: 'Are you <b>sure</b> want to save ?',
    popoverMessage: '',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    
   if(this.outSourceHospitalVal){
    this.loadHospitalDetails(this.outSourceHospitalVal)
   }
  }

  get formControls() {
    return this.HospitalDetailsForm.controls;
  }

  // Function for Api call for insertcase on onSubmit click

  onSubmit() {
    let formValues = this.HospitalDetailsForm.getRawValue();
    if (this.HospitalDetailsForm.invalid) {
      this.toastr.error("Please fill in all required fields correctly.");
      this.isSubmitted = true;
      return;
    }

    const params = {
      OutSourceHospitalID: this.OutSourceHospitalID || null,
      OutSourceHospitalName: formValues.OutSourceHospitalName,
      HospitalAddress: formValues.HospitalAddress,
      ContactNo: formValues.ContactNo,
      ContactEmail: formValues.ContactEmail,
      ContactPerson: formValues.ContactPerson,
    };

    this.sharedService.insertUpdateOutSourceHospital(params).subscribe(
      (res: any) => {
        console.log("hospital Data to insert", res);

        if (res.StatusCode === 200) {
          this.toastr.success("Hospital details saved successfully.");
          this.HospitalDetailsForm.reset();
          this.isSubmitted = false;
          this.updatedFormSubmitted.emit('1');
        } else {
          this.toastr.warning("Something Went Wrong");
        }
      },
      (err) => {
        this.spinner.hide();
        this.toastr.error("Something Went Wrong");
        console.log(err);
      }
    );
  }

  loadHospitalDetails(val) {
  console.log('get outousrce Hospital data:', val); 
  this.OutSourceHospitalID = val.id;
    this.HospitalDetailsForm.patchValue({
      OutSourceHospitalID: val.id || null,
      OutSourceHospitalName: val.OutSourceHospitalName || '',
      HospitalAddress: val.HospitalAddress || '',
      ContactNo: val.ContactNo || '',
      ContactEmail: val.ContactEmail || '',
      ContactPerson: val.ContactPerson || '',
    });
  }
  clearformValues(){
    this.OutSourceHospitalID = null;
    this.HospitalDetailsForm.reset();
  }
}
