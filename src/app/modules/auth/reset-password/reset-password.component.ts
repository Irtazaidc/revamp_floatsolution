// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,

  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {


  showOldPassword = false;
  Password = '';
  ConfrimPassword = '';
  loggedInUserID: any = "";
  OldPassword: any = "";
  isSpinner = true;//Hide Loader
  isDisabled = false;  //[By default Enabled]
  showResetForm = true;
  isSubmitted = false;
  userIdEncryptes =  null;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    
    
      const Bdata = {
        UserID: decodeURI(this.route.snapshot.paramMap.get('id')),
        ResetDateTime: decodeURI(this.route.snapshot.paramMap.get('datetime'))
      }
      console.log("🚀 ~ ResetPasswordComponent ~ ngOnInit ~ Bdata:", Bdata)
      this.userIdEncryptes = Bdata
    
    // https://reports.idc.net.pk/metacubes/#/auth/reset-password/knbOjeyfm5adfK40EQW%2b9A%3d%3d/D80xvDWXpx1PaP%2fhYtjYPcv%2fiqCk5NM%2boN37IRysxDk%3d

  }


  // resetPassword(data) {

    // //Decrypt base64 
    // data.PatientPortalUserID = parseInt(atob(this.route.snapshot.paramMap.get('id')))  || this.loggedInUserID;

    // data.AppName = 'OnlinePatientPortal_Web';
    // /** Change Password (from application) Case */
    // if (!this.showOldPassword) {

    //   data.PatientPortalUserID = decodeURI(this.route.snapshot.paramMap.get('id'));
    //   data.ResetDateTime = decodeURI(this.route.snapshot.paramMap.get('datetime'));

    //   data.ResetType = "ForgotPassword";
    // }
    // /** Reset password (from reset link) Case */
    // else if (this.showOldPassword) {
    //   data.PatientPortalUserID = this.loggedInUserID;
    //   data.ResetType = "";
    // }
  //}

  passwordMatchError: string;
  validatePasswords() {
    if (this.Password !== this.ConfrimPassword) {
      this.passwordMatchError = 'Passsword and Confirm Password not matched';
    }
    else{
      this.passwordMatchError = '';
    }
  }

  resetPassword() {
    if(!this.ConfrimPassword){
      this.toastr.error("Please fill the mandatory field.");
      this.isSubmitted = true;
      return
    }
    if(!this.userIdEncryptes){
      this.toastr.error("Missing UserID!");
      return
    }
    if (this.Password !== this.ConfrimPassword) {
      this.passwordMatchError = "Passsword and Confirm Password doesn't matched";
      this.toastr.error("Passsword and Confirm Password doesn't matched");
      return
    }

    const paramObj = {
      UserIDEnc: this.userIdEncryptes.UserID,
      OldPassword:null,
      NewPassword: this.ConfrimPassword || null,
    };
    console.log("🚀 ~ ResetPasswordComponent ~ resetPassword ~ paramObj:", paramObj)
    this.auth.changePassword(paramObj).subscribe((resp: any) => {
      console.log("🚀 ~ ResetPasswordComponent ~ this.auth.changePassword ~ resp:", resp)
      if (resp.PayLoad[0].RESULT == 1) {
        this.toastr.success("Password Succesfully Changed");
      }
      else if (resp.PayLoad[0].RESULT == 2) {
        this.toastr.error("You Cannot Update Existing Password")
      }
      else {
        this.toastr.error("Something went wrong Please contact Administrator")
      }
    }, (err) => {
      console.log(err)
    })
  }



  ActionsIfResetLinkExpired() {
    this.showResetForm = false
  }


}
