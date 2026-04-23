// @ts-nocheck
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel, AuthService, ConfirmPasswordValidator } from 'src/app/modules/auth';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  standalone: false,

  selector: 'app-security-key-generator',
  templateUrl: './security-key-generator.component.html',
  styleUrls: ['./security-key-generator.component.scss']
})
export class SecurityKeyGeneratorComponent implements OnInit, OnDestroy {
  isSubmitted = false;
  showpin = false;
  showpinOld = false;
  showpinConfirm = false;
  user: UserModel;
  firstUserState: UserModel;
  subscriptions: Subscription[] = [];
  isLoading$: Observable<boolean>;
  disabledButton = false;
  disabledButtonDelete = false;
  isSpinner = true;
  isSpinnerDelete = true;
  spinnerRefs = {
    securityForm: 'securityForm'
  }
  isUpdate = false;

  constructor(
    private userService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private risSharedService: SharedService,
    private router: Router
  ) {
    this.isLoading$ = this.userService.isLoadingSubject.asObservable();
  }

  securityForm = this.fb.group({
    currentpin: [''],
    pin: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    cpin: ['', Validators.required]
  }, {
    validator: ConfirmPasswordValidator.MatchSecurityPIN
  });
  cleartFormFields() {
    this.securityForm.reset({
      currentpin: '',
      pin: '',
      cpin: ''
    });
  }
  async deleteSecurityKey() {
    const realValue: string[] = [];

    const { isConfirmed } = await Swal.fire({
      title: 'Confirm Deletion',
      html: `
      <form id="swal-form" autocomplete="off" onsubmit="return false">
      <p>Please enter your security key to delete your key.</p>

      <div class="position-relative mt-2">
        <input
          type="text"
          id="delete-key-input"
          class="form-control form-control-lg pr-5"
          style="border: 1px solid #5ea5a2 !important; font-family: 'password'"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Enter your 6-digit security key"
          autocomplete="off"
          maxlength="6">

        <button
          type="button"
          id="toggle-eye-btn"
          class="btn btn-sm position-absolute"
          style="top: 50%; right: 10px; transform: translateY(-50%); background: transparent;">
          <i class="ti-eye"></i>
        </button>
      </div>
    </form>
    `,
      showCancelButton: true,
      confirmButtonText: '&nbsp;&nbsp;<i class="ti-check text-white"></i> Delete &nbsp;&nbsp;',
      cancelButtonText: '<i class="ti-close text-white"></i> Cancel',
      allowOutsideClick: false,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'swal2-cancel btn btn-secondary'
      },
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton() as HTMLElement;
        if (confirmBtn) {
          confirmBtn.style.backgroundColor = '#dc3545';
          confirmBtn.style.borderColor = '#dc3545';
          confirmBtn.style.color = '#fff';
        }
        const input = document.getElementById('delete-key-input') as HTMLInputElement;

        let isVisible = false;
          const eyeBtn = document.getElementById('toggle-eye-btn') as HTMLButtonElement;
          const eyeIcon = eyeBtn?.querySelector('i');

          if (eyeBtn && input) {
            eyeBtn.addEventListener('click', () => {
              isVisible = !isVisible;

              // Toggle icon
              if (eyeIcon) {
                eyeIcon.className = isVisible ? 'ti-eye-off' : 'ti-eye';
              }

              // Preserve cursor position
              const cursorPos = input.selectionStart || 0;

              // Toggle value display
              input.value = isVisible
                ? realValue.join('')
                : '*'.repeat(realValue.length);

              // Restore cursor
              input.setSelectionRange(cursorPos, cursorPos);
              input.focus();
            });
          }

        if (input) {
          input.focus();
          input.addEventListener('keydown', (e) => {
            const navigationKeys = [
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End', 'Tab', 'Shift', 'Control', 'Meta', 'Alt'
            ];

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') return;
            if (navigationKeys.includes(e.key)) return;

            const selectionStart = input.selectionStart || 0;
            const selectionEnd = input.selectionEnd || 0;

            let newCursorPos = selectionStart;

            if (e.key === 'Backspace' || e.key === 'Delete') {
              if (selectionStart !== selectionEnd) {
                // Delete selected range
                realValue.splice(selectionStart, selectionEnd - selectionStart);
                newCursorPos = selectionStart;
              } else if (e.key === 'Backspace' && selectionStart > 0) {
                realValue.splice(selectionStart - 1, 1);
                newCursorPos = selectionStart - 1;
              } else if (e.key === 'Delete' && selectionStart < realValue.length) {
                realValue.splice(selectionStart, 1);
                newCursorPos = selectionStart;
              }
            } else if (/[0-9]/.test(e.key)) {
              if (realValue.length >= 6 && selectionStart === selectionEnd) {
                e.preventDefault();
                return;
              }

              if (selectionStart !== selectionEnd) {
                realValue.splice(selectionStart, selectionEnd - selectionStart, e.key);
                newCursorPos = selectionStart + 1;
              } else {
                realValue.splice(selectionStart, 0, e.key);
                newCursorPos = selectionStart + 1;
              }
            } else if (e.key === 'Enter') {
              e.preventDefault();
              (Swal.getConfirmButton() as HTMLElement).click();
              return;
            } else {
              e.preventDefault();
              return;
            }

            e.preventDefault();
            realValue.splice(6); // Ensure max 6 digits
            input.value = isVisible
              ? realValue.join('')
              : '*'.repeat(realValue.length);

            // Clamp position between 0 and realValue.length
            newCursorPos = Math.max(0, Math.min(newCursorPos, realValue.length));
            input.setSelectionRange(newCursorPos, newCursorPos);
          });
        }
      },
      preConfirm: () => {
        const realPIN: string = realValue.join('');

        if (realPIN.length !== 6) {
          Swal.showValidationMessage('Please enter a valid 6-digit Key.');
          return false; // Keep Swal open & buttons enabled
        }

        // Trigger your own spinner / disable main button outside Swal
        this.spinner.show(this.spinnerRefs.securityForm);
        this.disabledButtonDelete = true;

        // Return a promise that **never disables the Swal buttons**.
        return this.risSharedService.getData(API_ROUTES.EMP_DELETE_APP_USER_SCREEN_PIN, {
          ScreenPINID: 1,
          UserID: this.user.userid,
          OldPIN: realPIN,
          PIN: -1,
          isUpdate: 1
        }).toPromise().then((data: any) => {
          this.disabledButtonDelete = false;
          const response = JSON.parse(data.PayLoadStr);
          if (data.StatusCode === 200 && response[0].Result === 1) {
            this.toastr.success("Your security key has been deleted successfully", "Success");
            // this.cancel();
            // this.cleartFormFields();
            this.getScreenPINByUserID();
            return true; // Close Swal
          } else if (data.StatusCode === 200 && response[0].Result === 2) {
            this.toastr.error("You provide a wrong security key.");
            return false; // Close Swal
          } else {
            Swal.showValidationMessage(data.Message || 'Failed to delete.');
            return false; // Keep Swal open
          }
        }).catch((err) => {
          console.error(err);
          this.spinner.hide(this.spinnerRefs.securityForm);
          this.disabledButtonDelete = false;
          Swal.showValidationMessage('Connection error. Please try again.');
          return false; // Keep Swal open
        });
      }
    });

    if (isConfirmed) {
      this.getScreenPINByUserID();
      Swal.fire('Deleted!', 'Your security key has been deleted.', 'success');
    }
  }





  ngOnInit(): void {
    const sb = this.userService.currentUserSubject.asObservable().pipe(
      first(user => !!user)
    ).subscribe(user => {
      this.user = Object.assign({}, user);
      this.firstUserState = Object.assign({}, user);
      this.getScreenPINByUserID();
    });
    this.subscriptions.push(sb);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  updateValidators(): void {
    const currentPinControl = this.securityForm.get('currentpin');
    if (this.isUpdate) {
      currentPinControl?.setValidators([Validators.required]);
    } else {
      currentPinControl?.clearValidators();
    }
    currentPinControl?.updateValueAndValidity();

    const pinControl = this.securityForm.get('pin');
    if (this.isUpdate) {
      pinControl?.setValidators([Validators.minLength(6), Validators.maxLength(6)]);
    } else {
      pinControl?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
    }
    pinControl?.updateValueAndValidity();

    this.securityForm.get('cpin')?.setValidators([Validators.required]);
    this.securityForm.get('cpin')?.updateValueAndValidity();
  }

  insertUpdateAppUserScreenPIN() {
    this.isSubmitted = true;
    this.spinner.show(this.spinnerRefs.securityForm);
    if (this.securityForm.invalid) {
      this.spinner.hide(this.spinnerRefs.securityForm);
      this.securityForm.markAllAsTouched();
      return false;
    }
    this.disabledButton = true;
    this.isSpinner = false;
    const paramObj = {
      ScreenPINID: 1,
      UserID: this.user.userid,
      OldPIN: this.securityForm.value.currentpin,
      PIN: this.securityForm.value.cpin,
      isUpdate: this.isUpdate
    }
    this.risSharedService.getData(API_ROUTES.EMP_INSERT_UPDATE_APP_USER_SCREEN_PIN, paramObj).subscribe((data: any) => {
      const response = JSON.parse(data.PayLoadStr);
      if (data.StatusCode == 200) {
        this.spinner.hide(this.spinnerRefs.securityForm);
        if (response[0].Result == 1) {
          this.toastr.success(data.Message);
          // this.cancel();
          // this.cleartFormFields();
          this.getScreenPINByUserID();
          this.router.navigate(['billing/my-services-share']);

        } else {
          this.toastr.error(data.Message);
        }
        this.disabledButton = false;
        this.isSpinner = true;
      } else {
        this.spinner.hide(this.spinnerRefs.securityForm);
        this.toastr.error("Something went wrong");
        this.disabledButton = false;
        this.isSpinner = true;
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.securityForm);
      this.toastr.error('Connection error');
      this.disabledButton = false;
      this.isSpinner = true;
    });
    return true;
  }

  saveButtonText = 'Save Changes';
  cardTitleText = 'Generate';
  cardTitleDescText = 'Generate a';
  getScreenPINByUserID() {
    const paramObj = {
      UserID: this.user.userid
    }
    this.risSharedService.getData(API_ROUTES.GET_SCREEN_PIN_BY_USER_ID, paramObj).subscribe((data: any) => {
      const response = data.PayLoad;
      this.isUpdate = response.some(item => item.AppUserScreenPINID);
      this.saveButtonText = this.isUpdate ? 'Reset' : 'Save Changes';
      this.cardTitleText = this.isUpdate ? 'Reset' : 'Generate';
      this.cardTitleDescText = this.isUpdate ? 'Reset your' : 'Generate a';
      this.updateValidators();
    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.securityForm);
      this.toastr.error('Connection error');
    });
  }

  cancel() {
    this.user = Object.assign({}, this.firstUserState);
    this.securityForm.reset();
  }
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}