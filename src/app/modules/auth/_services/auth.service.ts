// @ts-nocheck
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { UserModel } from '../_models/user.model';
import { AuthModel } from '../_models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserPermissionsService } from './auth-http/user-permissions.service';
import { API_ROUTES } from '../../shared/helpers/api-routes';
import { CONSTANTS } from '../../shared/helpers/constants';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  private userLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}_user`;
  private userPermissionsLocalStorage = `${environment.appVersion}-${environment.USERDATA_KEY}_per`;
  private macAddressKeyLocalStorageKey = `${environment.appVersion}-${environment.USERDATA_KEY}_mac`
  private SysInfoLocalStorageKey = `${environment.appVersion}-${environment.USERDATA_KEY}_SysInfo`
  private webDeskVersionKeyLocalStorageKey = `${environment.appVersion}-${environment.USERDATA_KEY}_wd_v`


  // public fields
  currentUser$: Observable<UserModel>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserModel>;
  isLoadingSubject: BehaviorSubject<boolean>;


  get currentUserValue(): UserModel {
    if (this.currentUserSubject && this.currentUserSubject.value && !this.currentUserSubject.value.macAdr && this.getUserMACAddressFromStorage()) {
      this.currentUserSubject.value.macAdr = this.getUserMACAddressFromStorage();
      // this.currentUserSubject = new BehaviorSubject<UserModel>(this.currentUserValue);
    }
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserModel) {
    
    this.currentUserSubject.next(user);
  }


  constructor(
    private authHttpService: AuthHTTPService,
    private userPermissionsService: UserPermissionsService,
    private router: Router,
    private http: HttpClient,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserModel>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login_old(email: string, password: string): Observable<UserModel> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      map((auth: AuthModel) => {
        const result = this.setAuthInLocalStorage(auth);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.log('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  login(email: string, password: string, emailEnc: string, passwordEnc: string, reqEncPath: string): Observable<UserModel | undefined> {
    const baseUrl = window.location.origin.toLowerCase();

    let loginSourceId = 0;
    let loginSourceURL = baseUrl;

    if (baseUrl.includes('reports.idc.net.pk')) {
      loginSourceId = 1;
    }
    else if (baseUrl.includes('metacubes.net')) {
      loginSourceId = 2;
    }
    else {
      loginSourceId = 0; // unknown / dev
    }

    this.isLoadingSubject.next(true);
    let params = {
      username: email,
      usernameEnc: emailEnc,
      password: password,
      passwordEnc: passwordEnc,
      reqEncPath: reqEncPath,
      ActionLogObj: {
        ActionId: 4,
        FormName: "Float Solution (Metacubes) login",
        Description: "Float Solution (Metacubes) login, UserName: " + email + "",
        OldValues: "",
        MachineInfo: "UpdatedOn: " + moment(new Date()).format('D-MMM-YYYY hh:mm:ss'),
        // UserId: -1,
        // CreatedOn: "",
        IPAddress: "",
        IPLocation: "",
        SourceID: 1,
        SourceDetailID: 2,
        LoginSourceId: loginSourceId,
        LoginSourceURL: loginSourceURL,
        ActionRemarks: "",
        ActionRemarksJSON: "",
        PatientPortalUserID: -1,
        PanelUserID: -1
      }
    }
    return this.http.post(API_ROUTES.LOGIN, params).pipe(
      map((resp: any) => {
        console.log('FULL RESPONSE:', resp);
      
        const statusCode =
          resp?.statusCode ??
          resp?.StatusCode ??
          resp?.status ??
          resp?.Status;
      
        const payload =
          resp?.payLoad ??
          resp?.PayLoad ??
          resp?.payload ??
          resp?.Payload;
      
        console.log('Parsed:', { statusCode, payload });
      
        if (statusCode === 200 && Array.isArray(payload) && payload.length > 0) {
      
          const user = this.createUSerObj(payload[0]);
      
          this.setAuthInLocalStorage(this.createAuthObj(user));
          this.setUserInLocalStorage(user);
      
          return user;
        }
      
        console.warn('Login condition failed');
        return undefined;
      }),
      catchError((err) => {
        console.log('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  getAndUpdateUserPermissions(userId): Observable<any> {

    let params = {
      // RoleID: 1,
      UserID: userId
    };
    return this.userPermissionsService.getUserPermissions(params).pipe(
      tap(permissions => {
        this.setUserPermissionsInLocalStorage(permissions);
      })
    )
    // .pipe(
    //   map( (res:any ) => {
    //     this.setUserPermissionsInLocalStorage(res);
    //     return res;
    //   })
    // );
    // this.getUserPermissions(userId).subscribe( (res:any) => {
    //   console.log('this.permissionsService.getPermissions ', res);
    //   this.setUserPermissionsInLocalStorage(res);
    // }, (err) => {
    // })
  }

  verifyEmployeeLogin(params) {
    return this.http.post(API_ROUTES.LOGIN_EMPLOYEE_USER, params);
  }
  getUserDetails(params) {
    return this.http.post(API_ROUTES.LOGIN_USER_DETAILS, params);
  }
  updateUserDetailsFromDB(userId) {
    this.getUserDetails({ userId: userId }).subscribe((res: any) => {
      if (res && res.StatusCode == 200) {
        if (res.PayLoad && res.PayLoad.length) {

          // let data = res.PayLoad[0];
          if (this.currentUserValue && this.currentUserValue.userid) {
            res.PayLoad[0].macAdr = this.currentUserValue.macAdr || this.getUserMACAddressFromStorage();
            res.PayLoad[0].posId = this.currentUserValue.posId;
          }
          this.setUserInLocalStorage(this.createUSerObj(res.PayLoad[0]))
        } else {
        }
      } else {
      }
    });
  }
  updateUserPOSID(posid: string) {
    if (posid) {
      let user: UserModel = this.getUserFromLocalStorage();
      user.posId = posid;
      this.setUserInLocalStorage(user);
    }
  }
  updateUserMACAddress(macAddress: string) {
    if (macAddress) {
      let user: UserModel = this.getUserFromLocalStorage();
      user.macAdr = macAddress;
      this.setUserInLocalStorage(user);
      localStorage.setItem(this.macAddressKeyLocalStorageKey, btoa(encodeURIComponent(JSON.stringify(macAddress))));
    }
  }
  updateSysInfo(SysInfo: string) {

    if (SysInfo) {
      let user: UserModel = this.getUserFromLocalStorage();
      let info = JSON.parse(SysInfo);
      user.currentLocationID = info.loginLocId;
      user.currentLocation = info.loginLocCode;
      user.currentMachineName = info.machineName;
      user.currenUserName = info.userName;
      // this.setUserInLocalStorage(user);

      localStorage.setItem(this.SysInfoLocalStorageKey, btoa(encodeURIComponent(JSON.stringify(info))));
    }
  }
  getUserMACAddressFromStorage() {
    let macAddress = '';
    try {
      macAddress = JSON.parse(decodeURIComponent(atob(localStorage.getItem(this.macAddressKeyLocalStorageKey))));
    } catch (e) { }
    return macAddress;
  }
  getSystemInfoFromStorage() {
    let sysInfo = '';
    try {
      sysInfo = JSON.parse(decodeURIComponent(atob(localStorage.getItem(this.SysInfoLocalStorageKey))));
    } catch (e) { }
    return sysInfo;
  }
  updateWebDeskVersionInStorage(version: string) {
    if (version) {
      localStorage.setItem(this.webDeskVersionKeyLocalStorageKey, btoa(encodeURIComponent(JSON.stringify(version))));
    }
  }
  getWebDeskVersionFromStorage() {
    let version = '';
    try {
      version = JSON.parse(decodeURIComponent(atob(localStorage.getItem(this.webDeskVersionKeyLocalStorageKey))));
    } catch (e) { }
    return version;
  }

  updateUserDetails(key: string, value: string, removeIfNull: boolean = false) {
    if (key) {
      let user: UserModel = this.getUserFromLocalStorage();
      user[key] = value;
      if (removeIfNull) {
        this.setUserInLocalStorage(user);
      } else {
        if (value) {
          this.setUserInLocalStorage(user);
        }
      }
    }
  }
  logout(params) {
    // localStorage.removeItem(this.authLocalStorageToken);
    // localStorage.removeItem(this.userLocalStorageToken);
    // localStorage.removeItem(this.userPermissionsLocalStorage);
    // this.router.navigate(['/auth/login'], {
    //   queryParams: {},
    // });
    // setTimeout(() => {
    //   document.location.reload();
    // }, 100);
    // console.log('User Data is: ',this.loggedInUser,"UserName: ",this.loggedInUser.username);;return;

    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.removeItem(this.userLocalStorageToken);
    localStorage.removeItem(this.userPermissionsLocalStorage);
    localStorage.removeItem(this.SysInfoLocalStorageKey);
    document.cookie = "arytokendata=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // localStorage.clear();
    localStorage.removeItem('empUserPicture');

    // For MT info Cleaning
    localStorage.removeItem('VerifiedUserID');
    localStorage.removeItem('RegLocId');
    localStorage.removeItem('VerifiedUserName');
    localStorage.removeItem('isVPN');

    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
    return this.http.post(API_ROUTES.INSERT_ACTION_LOG, params, this.getServerCallOptions());


    // setTimeout(() => {
    //   document.location.reload();
    // }, 100);
  }

  logoutSession(params) {

    localStorage.removeItem(this.authLocalStorageToken);
    localStorage.removeItem(this.userLocalStorageToken);
    localStorage.removeItem(this.userPermissionsLocalStorage);
    localStorage.removeItem(this.SysInfoLocalStorageKey);
    // localStorage.clear();
    localStorage.removeItem('empUserPicture');
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
    return this.http.post(API_ROUTES.INSERT_ACTION_LOG, params, this.getServerCallOptions());

    // setTimeout(() => {
    //   document.location.reload();
    // }, 100);
  }

  getUserByToken(): Observable<UserModel> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserModel) => {
        if (user) {
          this.currentUserSubject = new BehaviorSubject<UserModel>(user);
        } else {
          this.logout('');
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.email, user.password, '', '', '')),
      catchError((err) => {
        console.log('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // forgotPassword(email: string): Observable<boolean> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService
  //     .forgotPassword(email)
  //     .pipe(finalize(() => this.isLoadingSubject.next(false)));
  // }

  isLoggedIn() {
    return this.currentUserValue;
  }

  // private methods
  private setAuthInLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  getAuthFromLocalStorage(): AuthModel {
    try {
      const authData = JSON.parse(localStorage.getItem(this.authLocalStorageToken));
      return authData;
    } catch (error) {
      console.log('err ', error);
      return undefined;
    }
  }

  //  private setUserInLocalStorage(user: UserModel): boolean {
  //   if (user && user.userid) {
  //     // merge RoleCategory if needed
  //     const storedUserData = { ...user };
  //     if (!storedUserData.RoleCategory && this.currentUserValue?.RoleCategory) {
  //       storedUserData.RoleCategory = this.currentUserValue.RoleCategory;
  //     }

  //     // create a proper UserModel instance
  //     const userModel = new UserModel();
  //     userModel.setUser(storedUserData); // sets all properties properly

  //     localStorage.setItem(
  //       this.userLocalStorageToken,
  //       btoa(encodeURIComponent(JSON.stringify(storedUserData)))
  //     );

  //     // update BehaviorSubject with UserModel instance
  //     this.currentUserSubject.next(userModel);

  //     return true;
  //   }
  //   return false;
  // }


  private setUserInLocalStorage(user: UserModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    this.currentUserSubject = new BehaviorSubject<UserModel>(user);
    if (user && user.userid) {
      localStorage.setItem(this.userLocalStorageToken, btoa(encodeURIComponent(JSON.stringify(user))));
      return true;
    }
    return false;
  }

  getUserFromLocalStorage(): UserModel {

    let data = localStorage.getItem(this.userLocalStorageToken);
    if (!data) {
      return undefined;
    }
    try {
      const userData = JSON.parse(decodeURIComponent(atob(localStorage.getItem(this.userLocalStorageToken))))
      return userData;
    } catch (error) {
      console.log('err ', error);
      return undefined;
    }
  }

  private createAuthObj(resp: UserModel): AuthModel {
    const auth: AuthModel = new AuthModel();
    auth.authToken = resp.token || '';
    auth.refreshToken = 'token_' + +new Date();
    auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
    return auth;
  }
  private createUSerObj(data): UserModel {
    let userData: UserModel = new UserModel();
    userData.setUser(data);
    return userData;
  }

  private setUserPermissionsInLocalStorage(permissions) {

    localStorage.setItem(this.userPermissionsLocalStorage, btoa(encodeURIComponent(JSON.stringify(permissions))));
  }

  public getUserPermissionsFromLocalStorage() {
    let data = localStorage.getItem(this.userPermissionsLocalStorage);
    if (!data) {
      return undefined;
    }
    try {
      const permissionsData = JSON.parse(decodeURIComponent(atob(data)));
      return permissionsData;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
  getLoggedInUserProfilePermissionsObj(screenKey): any {
    let data: any = this.getUserPermissionsFromLocalStorage();
    if (data) {
    } else {
      data = [];
    }
    if (screenKey) {
      data = (data || []).filter(a => a.state == screenKey);
    }
    let permissionsObj = {};
    data.forEach(a => {
      permissionsObj[a.key] = a.key;
    })
    return permissionsObj;
  }

  resetPassword(param) {
    return this.http.post(API_ROUTES.SEND_RESET_PASSWORD_URL, param, this.getServerCallOptions())
  }
  changePassword(param) {
    return this.http.post(API_ROUTES.RESET_CHANGE_PASSWORD, param, this.getServerCallOptions())
  }

  private apiUrl = 'https://api.exchangerate-api.com/v4';
  getExchangeRate(date: string): Observable<any> {
    const url = `${this.apiUrl}/${date}`;
    return this.http.get(url);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
  getServerCallOptions(): object {
    return {
      headers: this.getCommonHeaders(),
      responseType: "json"
    }
  }
  getCommonHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // "Authorization": "Basic jwt"
    })
  }
}
