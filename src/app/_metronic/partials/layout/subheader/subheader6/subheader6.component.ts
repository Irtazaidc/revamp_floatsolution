// @ts-nocheck
import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbItemModel } from '../_models/breadcrumb-item.model';
import { LayoutService } from '../../../../core';
import { SubheaderService } from '../_services/subheader.service';
import { AuthService, UserModel } from 'src/app/modules/auth';
import moment from 'moment';
import { Router } from '@angular/router';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';
import { EmployeeService } from 'src/app/modules/emp-profile/services/employee.service';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { MultiAppService } from 'src/app/modules/shared/services/multi-app.service';


@Component({
  selector: 'app-subheader6',
  templateUrl: './subheader6.component.html',
  styleUrls: ['./subheader6.component.scss'],
  // styles: [`

  //  `
  // ]
  standalone: false,
})

export class Subheader6Component implements OnInit {
  isVPN = false
  @ViewChild('dropdown') dropdown: ElementRef;
  showDropdown = false;
  // @HostListener('document:click', ['$event.target'])
  // onClick(targetElement) {
  //   const clickedInside = this.dropdown.nativeElement.contains(targetElement);
  //   if (!clickedInside) {
  //     this.showDropdown = false;
  //   }
  // }
  // empUserPic:any
  subheaderCSSClasses = '';
  subheaderContainerCSSClasses = '';
  subheaderMobileToggle = false;
  subheaderDisplayDesc = false;
  subheaderDisplayDaterangepicker = false;
  loggedInUser: UserModel;
  title$: Observable<string>;
  breadcrumbs$: Observable<BreadcrumbItemModel[]>;
  description$: Observable<string>;
  user$: Observable<UserModel>;
  menuBtnClick = false;
  webDeskStatus = false;

  constructor(
    private layout: LayoutService,
    private subheader: SubheaderService,
    private auth: AuthService,
    private router: Router,
    private renderer: Renderer2,
    private empService: EmployeeService,
    private helper: HelperService,
    private multiApp: MultiAppService,
    private cd: ChangeDetectorRef,
  ) {
    this.title$ = this.subheader.titleSubject.asObservable();
    this.breadcrumbs$ = this.subheader.breadCrumbsSubject.asObservable();
    this.description$ = this.subheader.descriptionSubject.asObservable();


    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.menuBtnClick) {
        this.showDropdown = false;
      }
      this.menuBtnClick = false;
    });


  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;


  ngOnInit() {
    const savedVPN = localStorage.getItem('isVPN');
    this.isVPN = savedVPN === 'true'; // convert string to boolean

    this.subheaderCSSClasses = this.layout.getStringCSSClasses('subheader');
    this.subheaderContainerCSSClasses = this.layout.getStringCSSClasses(
      'subheader_container'
    );
    this.subheaderMobileToggle = this.layout.getProp('subheader.mobileToggle');
    this.subheaderDisplayDesc = this.layout.getProp('subheader.displayDesc');
    this.subheaderDisplayDaterangepicker = this.layout.getProp(
      'subheader.displayDaterangepicker'
    );
    
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.loadLoggedInUserInfo();
    // this.getEmpPicByUserId();
    // setTimeout(() => {
    this.connectToMultiApp();
    // }, 50000);
    // let data = this.auth.getUserFromLocalStorage();
    // console.log("datadatadatadata", data)
    setTimeout(() => {
      this.empUserPicture = localStorage.getItem('empPic');
    }, 5000);

    // this.subheader.startConnection()
    // setTimeout(() => {
    //   this.subheader.askServer();
    //   this.subheader.askServerListener();
    // }, 2000);
  }
  setVPNStatus(event: any): void {
    // ✅ Save value whenever checkbox changes
    localStorage.setItem('isVPN', this.isVPN.toString());
  }
  connectToMultiApp() {
    // this.multiApp.connectToMultiApp();
    this.multiApp.multiAppConnectionStatus.subscribe((status) => {
      this.webDeskStatus = status;
      setTimeout(() => {
        this.cd.detectChanges();
        // this.getSystemInformation(this.loggedInUser);
      }, 200);
    })

  }
  getSystemInformation(loggedInUser: UserModel) {
    // setTimeout(() => {
    const obj = {
      user: loggedInUser,
      timestamp: +new Date(),
      screen: encodeURIComponent(window.location.href)
    }
    this.sendCommand({ command: 'sys-info', userIdentity: JSON.stringify(obj) });
  }
  sendCommand(cmd) {
    this.multiApp.sendCommand(cmd);
  }
  loadLoggedInUserInfo() {
    
    this.loggedInUser = this.auth.currentUserValue;
  }
  preventCloseOnClick() {
    this.menuBtnClick = true;
  }
  toggleDropdown() {
    // e.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }


  myProfile(path: string) {
    this.router.navigate([path]);
  }

  signOut() {
    // this.auth.logout();
    // document.location.reload();
    this.loadLoggedInUserInfo();
    const params = {
      ActionLogObj: {
        ActionId: 4,
        FormName: "Float Solution (Metacubes) logout",
        Description: "Float Solution (Metacubes) logout, UserName: " + this.loggedInUser.username ? this.loggedInUser.username : '',
        OldValues: "",
        MachineInfo: "UpdatedOn: " + moment(new Date()).format('D-MMM-YYYY hh:mm:ss'),
        UserId: this.loggedInUser.userid || -1,
        // CreatedOn: "",
        IPAddress: "",
        IPLocation: "",
        SourceID: 1,
        SourceDetailID: 3,
        ActionRemarks: "",
        ActionRemarksJSON: "",
        PatientPortalUserID: -1,
        PanelUserID: -1
      }
    }

    this.auth.logout(params).subscribe((resp: any) => {


    }, (err) => {
      console.log(err);
    })
    document.location.reload();
  }
  empUserPicture: string;
  UserPicture: string;
  getEmpPicByUserId() {
    const paramObj = {
      UserID: this.loggedInUser.userid,
    }
    this.empService.getEmpPicByUserId(paramObj).subscribe(
      (resp: any) => {
        let empUserPic = resp.PayLoad || [];
        empUserPic = this.helper.formateImagesData(empUserPic, 'EmployeePic');
        if (empUserPic.length) {
          this.empUserPicture = empUserPic[0].EmployeePic;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

}


