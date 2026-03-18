// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first, catchError } from 'rxjs/operators';
import { UserModel, AuthService, ConfirmPasswordValidator } from 'src/app/modules/auth';
import { EmployeeService } from '../../services/employee.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';


@Component({
  standalone: false,

  selector: 'app-change-user-password',
  templateUrl: './change-user-password.component.html',
  styleUrls: ['./change-user-password.component.scss']
})
export class ChangeUserPasswordComponent implements OnInit {

  public validatePasswordPolicy(password: string, policy: string): any {
    var retVal = "";

    // const [minLength, numUpper, numLower, numNumbers, numSpecial] = policy.split('').map(Number);

    const minLength = parseInt(policy.substring(0, 2), 10);
    const numUpper = parseInt(policy.substring(2, 3), 10);
    const numLower = parseInt(policy.substring(3, 4), 10);
    const numNumbers = parseInt(policy.substring(4, 5), 10);
    const numSpecial = parseInt(policy.substring(5, 6), 10);

    const upper = new RegExp('[A-Z]');
    const lower = new RegExp('[a-z]');
    const number = new RegExp('[0-9]');
    const special = new RegExp('[^a-zA-Z0-9]');

    if (password.length < minLength) {
      retVal += `- Minimum length of password is ${minLength} character(s).`;
    }
    if (!/[A-Z]/.test(password) || password.match(upper).length < numUpper) {
      retVal += `- At least ${numUpper} CAPITAL letter(s) is required.`;
    }
    if (!/[a-z]/.test(password) || password.match(lower).length < numLower) {
      retVal += `- At least ${numLower} lower letter(s) is required.`;
    }
    if (!/\d/.test(password) || password.match(number).length < numNumbers) {
      retVal += `- At least ${numNumbers} number(s) is required.`;
    }
    if (!/[^a-zA-Z0-9]/.test(password) || password.match(special).length < numSpecial) {
      retVal += `- At least ${numSpecial} special character(s) [like @ # $ % *] is required.`;
    }

    return retVal;

  }
  isSubmitted=false;
  showPassword = false;
  // hidePassword = false;
  user: UserModel;
  firstUserState: UserModel;
  subscriptions: Subscription[] = [];
  isLoading$: Observable<boolean>;
  spinnerRefs = {
    resetForm: 'resetForm'
  }
  constructor(
    private userService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private empService: EmployeeService,
  ) {
    this.isLoading$ = this.userService.isLoadingSubject.asObservable();
  }
  ngOnInit(): void {
    const sb = this.userService.currentUserSubject.asObservable().pipe(
      first(user => !!user)
    ).subscribe(user => {
      this.user = Object.assign({}, user);
      this.firstUserState = Object.assign({}, user);
    });
    this.subscriptions.push(sb);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  resetForm = this.fb.group({
    currentPassword: ['', Validators.compose([Validators.required])],
    // password: ['', Validators.compose([Validators.required])],
    password: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=.])[a-zA-Z0-9@#$%^&+=.]+$')])],
    cPassword: ['', Validators.required]
  }, {
    validator: ConfirmPasswordValidator.MatchPassword
  });

  resetPassword() {
    this.isSubmitted=true;
    let paramOb = {
      UserID: this.user.userid,
    }
    this.empService.empPasswordPolicy(paramOb).subscribe((res: any) => {
      let policy = res.PayLoad[0].PasswordPolicy
      let retVal = this.validatePasswordPolicy(this.resetForm.value.password, policy);
      if (retVal === "") {
        // password is valid   
        let paramObj = {
          UserID: this.user.userid,
          OldPassword: this.resetForm.value.currentPassword,
          NewPassword: this.resetForm.value.password,
        }
        this.resetForm.markAllAsTouched();
        if (this.resetForm.invalid) {
          this.spinner.hide(this.spinnerRefs.resetForm);
          this.toastr.warning('Please fill the required fields...!'); return false;
        } else {
          this.empService.resetPassword(paramObj).pipe(catchError((error): any => {
            this.spinner.hide(this.spinnerRefs.resetForm);
            console.log(error);
            if (environment.production)
              this.toastr.error("Something Went Wrong")
            else
              this.toastr.error(error)
          }))
            .subscribe((resp: any) => {
              if (resp.PayLoad[0].RESULT == 1) {
                this.toastr.success("Password Succesfully Changed");
                // this.resetForm.reset();
              } else if (resp.PayLoad[0].RESULT == 0) {
                this.toastr.error("Incorrect Current Password")
                this.spinner.hide(this.spinnerRefs.resetForm);
              }
              else if (resp.PayLoad[0].RESULT == 2) {
                this.toastr.error("You Cannot Update Existing Password")
                this.spinner.hide(this.spinnerRefs.resetForm);
              }
              else {
                this.toastr.error("Something went wrong Please contact Administrator")
                this.spinner.hide(this.spinnerRefs.resetForm);
              }
            }, (err) => {
              console.log(err)
            })
          this.resetForm.reset();
        }
      } else {
        this.toastr.warning(retVal);
      }
    })
  }

  cancel() {
    this.user = Object.assign({}, this.firstUserState);
    this.resetForm;
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.resetForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.resetForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.resetForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.resetForm.controls[controlName];
    return control.dirty || control.touched;
  }




  // loadForm() {
  //   this.formGroup = this.fb.group({
  //     currentPassword: [this.user.password, Validators.required],
  //     password: ['', Validators.required],
  //     cPassword: ['', Validators.required]
  //   }, {
  //     validator: Validators.compose([Validators.required, Validators.minLength(8), Validators.pattern('^(?=.[a-z])(?=.[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])
  //   });

  // }
  // save() {
  //   this.resetForm.markAllAsTouched();
  //   if (!this.resetForm.valid) {
  //     return;  
  //   }
  //   let resetformValues = this.resetForm.getRawValue();
  //   console.log("🚀ChangeUserPasswordComponent ~ save ~ formValues", resetformValues)
  //   this.user.password = this.resetForm.value.password;
  //   this.userService.isLoadingSubject.next(true);
  //   setTimeout(() => {
  //     this.userService.currentUserSubject.next(Object.assign({}, this.user));
  //     this.userService.isLoadingSubject.next(false);
  //   }, 2000);
  // }

}
