// @ts-nocheck
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../_models/user.model';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiAppService } from '../../shared/services/multi-app.service';
import { SharedService } from '../../shared/services/shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Input } from '@angular/core';
import { EmployeeService } from '../../emp-profile/services/employee.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { CONSTANTS } from '../../shared/helpers/constants';
import { LookupService } from '../../patient-booking/services/lookup.service';

@Component({
  standalone: false,

  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @Input('userId') userId: any;
  // KeenThemes mock, change it to:
  // defaultAuth = {
  //   email: '',
  //   password: '',
  // };
  defaultAuth: any = {
    username: '',
    password: '',
    passwordEnc: '',
    usernameEnc: '',
    reqEncPath: '',
  };
  // loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  queryParams: any = {};
  public Fields = {
    password: ['', ''],
    passwordEnc: ['', ''],
    username: ['', ''],
    usernameEnc: ['', ''],
    reqEncPath: ['', '']
  }
  loginForm!: FormGroup;

  isDisable:boolean = false;
  isLoading: boolean = false; 
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  IsAuthenticated: any = true;
  empUserPicture: null;
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  webDeskStatus: boolean = false;
  loggedInUser: UserModel;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private multiApp: MultiAppService,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private empService: EmployeeService,
    private helper: HelperService,
    private lookupService: LookupService,
    private auth: AuthService,
  ) {
    this.isLoading$ = this.authService.isLoading$;
    this.loginForm = this.fb.group(this.Fields);
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  // GetEmpPictureBy UserID


  ngOnInit(): void {
    this.queryParams = this.getUrlParams();
    if (this.queryParams.pw && this.queryParams.un && this.queryParams.path)
      this.verifyUserCredentials();
    this.initForm();
    // get return url from route parameters or default to '/'
    // this.returnUrl =
    //   this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    const preLogoutState = JSON.parse(localStorage.getItem('preLogoutState'));
    this.returnUrl = preLogoutState?.url || 
                    this.route.snapshot.queryParams['returnUrl'.toString()] ||  '/';
  }
  // GetEmpPictureBy UserID
  getEmpPicByUserId(id) {
    localStorage.setItem('empPic', this.defaultPatientPic);
    let paramObj = {
      UserID: id
    }
    this.empService.getEmpPicByUserId(paramObj).subscribe((resp: any) => {

      let empUserPic = resp.PayLoad || [];
      if (empUserPic.length) {
        empUserPic = this.helper.formateImagesData(empUserPic, 'EmployeePic');
        this.empUserPicture = empUserPic[0].EmployeePic;
        localStorage.setItem('empPic', this.empUserPicture);
      }
    }, (err) => {
      console.log(err)
    })
  }
  verifyUserCredentials() {

    let params = {
      UserName: decodeURIComponent(this.queryParams.un || '').replace(/\s/g, '+'),
      Password: decodeURIComponent(this.queryParams.pw || '').replace(/\s/g, '+'),
      SourceName: decodeURIComponent(this.queryParams.appName || '').replace(/\s/g, '+'),
      Path: decodeURIComponent(this.queryParams.path || '').replace(/\s/g, '+'),


    }

    let un = params.UserName;
    let pw = params.Password;
    let path = params.Path;

    this.loginForm.controls["usernameEnc"].patchValue(un);
    this.loginForm.controls["passwordEnc"].patchValue(pw);
    this.loginForm.controls["reqEncPath"].patchValue(path);

    this.submit();
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
    let hashes = encryptedQueryString.split('&'); // atob
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
      let graphicalParameter = (a == 'Graphical' || a == 'graphical' ? a : '');
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
  getnavigateUrlParams(navigateUrl) {
    const vars = {};
    let hash;
    let encryptedQueryString = '';
    if (!navigateUrl) {
      return vars;
    } else {
      encryptedQueryString = navigateUrl;
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
    let hashes = encryptedQueryString.split('&'); // atob
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
      let graphicalParameter = (a == 'Graphical' || a == 'graphical' ? a : '');
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

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: [
        this.defaultAuth.username,
        Validators.compose([
          Validators.required,
          // Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      usernameEnc: [''],
      passwordEnc: [''],
      reqEncPath: [''],
    });
  }

  submit() {
    
    this.hasError = false;
    this.isDisable = true;
    this.isLoading = true;
    const loginSubscr = this.authService
      .login(
        this.f['username'].value,
        this.f['password'].value,
        this.f['usernameEnc'] ? this.f['usernameEnc'].value : null,
        this.f['passwordEnc'] ? this.f['passwordEnc'].value : null,
        this.f['reqEncPath'] ? this.f['reqEncPath'].value : null
      )
      .pipe(first())
      .subscribe((user) => {
        if (user) {
          
          let _userObj = this.authService.getUserFromLocalStorage();
          this.authService.getAndUpdateUserPermissions(_userObj.userid).subscribe(res => {
            // setTimeout(() => { this.isDisable = false; this.isLoading = false;}, 1000);
            this.isDisable = false; this.isLoading = false;
            this.getEmpPicByUserId(_userObj.userid);
            this.GetLogoutSetting(_userObj.ProfileId);
           
             // Check for stored pre-logout state
          const preLogoutState = JSON.parse(localStorage.getItem('preLogoutState'));
          // If there's a stored path from inactivity logout, use that instead
          if (preLogoutState && !_userObj.ReqPath) {
            localStorage.removeItem('preLogoutState');         
            // Navigate to the stored URL with query params
            this.router.navigate([preLogoutState.url], {
              queryParams: preLogoutState.queryParams
            });
           } 
            // console.log('_userObj_________ data ', _userObj);
           else if (_userObj.ReqPath) {
              let path = _userObj.ReqPath.toString().split('?');
              // this.router.navigate([path[0]]);
              var navigateparams;
              console.log(this.queryParams);
              navigateparams = this.getnavigateUrlParams(path[1].toString());
              setTimeout(() => {
                this.router.navigate([path[0]], { queryParams: { 'refId': navigateparams.refId, 'docTypeId': navigateparams.docTypeId, 'docTypeIds': navigateparams.docTypeIds } });
                setTimeout(self.close, 1000);

              }, 2000);

            }

            else
              this.router.navigate([this.returnUrl]);
            
            this.loadLoggedInUserInfo();
            this.getMACAddress(this.authService.currentUserValue);
            setTimeout(() => {
              this.connectToMultiAppAndGetSysInfo();
            }, 2000);
            
          }, (err => {
            this.router.navigate([this.returnUrl]);
            this.isDisable = false; this.isLoading = false;
          }));
        } else {
          this.hasError = true;
          this.isDisable = false; this.isLoading = false;

        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  /***** WEB SOCKET - MULTI APP *****/
  getMACAddress(loggedInUser: UserModel) {
    let obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'get-mac', userIdentity: JSON.stringify(obj) });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }


  connectToMultiAppAndGetSysInfo() {
    // this.multiApp.connectToMultiApp();
    // this.multiApp.multiAppConnectionStatus.subscribe((status) => {
    //   this.webDeskStatus = status;
    //   console.log("🚀this.webDeskStatus:", this.webDeskStatus)
    // setTimeout(() => {
    // this.cd.detectChanges();
    this.getSystemInformation(this.loggedInUser);
    // }, 200);
    // })
  }
  getSystemInformation(loggedInUser: UserModel) {
    // setTimeout(() => {

    let obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'sys-info', userIdentity: JSON.stringify(obj) });
  }

  /***** WEB SOCKET - MULTI APP *****/

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }


  foPassword() {

  }

  logoutSettingList = [];
  GetLogoutSetting(ProfileId) {
    this.logoutSettingList = [];
    let objParm = {
      ProfileID: ProfileId || 1, 
    };
    this.lookupService.GetLogoutSettingByProfileID(objParm).subscribe(
      (resp: any) => {
        if (resp && resp.PayLoad) {  
          this.logoutSettingList = resp.PayLoad;
          // console.log("this.logoutSettingList:", this.logoutSettingList);
          let IdleTime = this.logoutSettingList.find(id => id.SettingID == 17)?.SettingValue;
          // let WarningTime = this.logoutSettingList.find(id => id.SettingID == 18)?.SettingValue;
          localStorage.setItem('IdleTime',IdleTime);
          // localStorage.setItem('WarningTime',WarningTime);
        } 
      },
      (err) => {
        console.log("error:", err);
      }
    );
  }







  showPassword: boolean = false;

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

}
