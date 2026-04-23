// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { first } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal, { SweetAlertResult } from 'sweetalert2';


enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  standalone: false,

  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  
  // forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private toasrt: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {

  }

  // submit() {
  //   this.errorState = ErrorStates.NotSubmitted;
  //   const forgotPasswordSubscr = this.authService
  //     .forgotPassword(this.f.email.value)
  //     .pipe(first())
  //     .subscribe((result: boolean) => {
  //       this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
  //     });
  //   this.unsubscribe.push(forgotPasswordSubscr);
  // }

  isActive = null;
  UserName: any = "";
  Email: any = "";
  PhoneNumber: any = "";
  EmpNo: any = "";
  isUseCell: any = 2;
  inputLableVal = '<i class="fa fa-mobile fa-color" aria-hidden="true"></i> Phone Number';
  inputLableValUrdu = 'پاس ورڈ دوبارہ ترتیب دینے کے لیے، براہ کرم اپنا رجسٹرڈ موبائل نمبر درج کریں۔';
  inputPlace = "Enter cell number / اپنا فون نمبر درج کریں";
  ShowInfoText = false
  isSpinner = true;//Hide Loader
  router: any;
  isEmailValid = true;



  setIsCell(isCell) {
    this.accountList = [];
    this.isCellDetail = false;
    this.ShowInfoText = false;
    this.UserName = ""
    this.isUseCell = isCell;
    if (this.isUseCell == 0) {
      this.inputLableVal = '<i class="fa fa-user fa-color" aria-hidden="true"></i> Username';
      this.inputLableValUrdu = 'پاس ورڈ دوبارہ ترتیب دینے کے لیے، براہ کرم اپنا رجسٹرڈ یوزر نیم درج کریں۔';
      this.inputPlace = "Enter username / اپنا یوزرنیم درج کریں";
    } else if (this.isUseCell == 1) {
      this.inputLableVal = '<i class="fa fa-envelope fa-color" aria-hidden="true"></i> Email';
      this.inputLableValUrdu = 'پاس ورڈ دوبارہ ترتیب دینے کے لیے، براہ کرم اپنا رجسٹرڈ ای میل درج کریں۔';
      this.inputPlace = "Enter email / اپنا ای میل درج کریں";
    } else if (this.isUseCell == 2) {
      this.inputLableVal = '<i class="fa flaticon2-phone fa-color" aria-hidden="true"></i> Phone Number';
      this.inputLableValUrdu = 'پاس ورڈ دوبارہ ترتیب دینے کے لیے، براہ کرم اپنا رجسٹرڈ موبائل نمبر درج کریں۔';
      this.inputPlace = "Enter cell number / اپنا فون نمبر درج کریں";
    } else if (this.isUseCell == 3) {
      this.inputLableVal = '<i class="fa fa-user fa-color" aria-hidden="true"></i> Employee Number';
      this.inputLableValUrdu = 'پاس ورڈ دوبارہ ترتیب دینے کے لیے، براہ کرم اپنا عمپلائ نمبر درج کریں۔';
      this.inputPlace = "Enter employee number / اپناعمپلائ نمبر درج کریں";
    } else {
      this.inputLableVal = '<i class="fa flaticon2-phone fa-color" aria-hidden="true"></i> Phone Number';
      this.inputLableValUrdu = 'پاس ورڈ دوبارہ ترتیب دینے کے لیے، براہ کرم اپنا رجسٹرڈ موبائل نمبر درج کریں۔';
      this.inputPlace = "Enter cell number / اپنا فون نمبر درج کریں";
    }
  }
  
  setResetData(emailEnc, patientPortalUserIDEnc, isActive) {
    this.isActive = isActive;
    this.emailEnc = emailEnc;
    this.isUseCell = 1;
    this.isEmailValid = false;
  }

  isCellDetail = false;
  accountList = [];
  emailEnc = null;
  isChecked = true;
  ResetPassword(data, formId) {
    console.log("🚀 ~ ForgotPasswordComponent ~ ResetPassword ~ data:", data)
    data.isUseCell = this.isUseCell;
    data.emailEnc = this.emailEnc;
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (this.isUseCell == 1 && (!data.email.match(validRegex))) {
      this.Email = "";
      this.toasrt.error("Please provide a valid email address");
      return false;
    }
    if (!formId.form.valid) {
      let invalidMessage = "Enter cell number / اپنا نمبر درج کریں";
      if (this.isUseCell == 0) {
        invalidMessage = "Enter username / اپنا یوزرنیم درج کریں";
      } else if (this.isUseCell == 1) {
        invalidMessage = "Enter email / اپنا ای میل درج کریں";
      } else if (this.isUseCell == 2) {
        invalidMessage = "Enter cell number / اپنا نمبر درج کریں";
      }
      else if (this.isUseCell == 3) {
        invalidMessage = "Enter employee number / اپناعمپلائ نمبر درج کریں";
      }
      this.toasrt.error(invalidMessage);
    } 
    else {
      this.auth.resetPassword(data).subscribe((resp: any) => {
        console.log("🚀 ~ ForgotPasswordComponent ~ this.auth.resetPassword ~ resp:", resp)
        this.isEmailValid = true;
        this.isSpinner = true;
        if (resp.StatusCode == 200) {
          if (resp.PayLoad.length) {
            const parsedData = resp.PayLoad;
            this.accountList = parsedData;
            this.isActive = null;
            this.isEmailValid = true;
            this.isChecked = false;
            Swal.fire({
              icon: 'success',
              title: `Request Sent Successfully`,
              html: '<span class="custom-title">A link to reset your password has been sent to your registered email and phone number. Please check your inbox and messages:</span>',
              showCloseButton: true,
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK',
              showConfirmButton: true,
            });
            this.ShowInfoText = true
            this.isCellDetail = false;
            this.emailEnc = null;
            this.UserName = null;
            this.Email = null;
            this.PhoneNumber = null;
            this.EmpNo = null;
            this.isUseCell = 2;
            setTimeout(() => {
            this.isChecked = true;
            }, 500);
          }
          else{
            this.toasrt.warning(resp.Message);
          }
         
        } else if (resp.StatusCode == 403 || resp.StatusCode == 500) {
          this.toasrt.warning(resp.Message);
        }
        else {
          this.toasrt.error(resp.Message);
        }
      }, (err) => {
        console.log(err);
      });
    }
  }

  clearForm() {
    this.accountList = [];
    this.ShowInfoText = false;
    this.isCellDetail = false;
    this.emailEnc = null;
    this.UserName = null;
    this.isActive = null;
    this.isUseCell = 2;
  }

  freshList() {
    if ((this.Email.length || this.EmpNo.length || this.PhoneNumber.length || this.UserName.length) <= 0) {
      this.isCellDetail = false;
      this.accountList = []
    }
  }

  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
    }
    return true
  }

  validateNumber(e) {
    const chekVale = parseInt(e)
    if (this.isEmailValid && !Number.isInteger(chekVale)) {
      this.PhoneNumber = "";
      this.toasrt.error("Please provide a valid cell number");
    }
  }

  validateEmail(input) {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (this.isEmailValid && !input.match(validRegex)) {
      this.Email = "";
      this.toasrt.error("Please provide a valid email address");
    }

  }




  

}
