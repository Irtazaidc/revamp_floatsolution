// @ts-nocheck
import { AbstractControl, ValidationErrors } from '@angular/forms';

export class ConfirmPasswordValidator {
  /**
   * Check matching password with confirm password
   * @param control AbstractControl
   */
  static MatchPassword(control: AbstractControl) {
    const password = control.get('password').value;

    const confirmPassword = control.get('cPassword').value;

    if (password !== confirmPassword) {
      control.get('cPassword').setErrors({ ConfirmPassword: true });
    } else {
      return null;
    }
  }
  static MatchSecurityPIN(control: AbstractControl): ValidationErrors | null {
    const pin = control.get('pin')?.value;
    const confirmpin = control.get('cpin')?.value;

    if (pin !== confirmpin) {
      return { MatchSecurityPIN: true }; // Set form-level error
    } else {
      return null; // No error when values match
    }
  }
}
