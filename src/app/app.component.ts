// @ts-nocheck
import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  HostListener,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subscription, fromEvent } from "rxjs";
import { TranslationService } from "./modules/i18n/translation.service";
// language list
import { locale as enLang } from "./modules/i18n/vocabs/en";
import { locale as chLang } from "./modules/i18n/vocabs/ch";
import { locale as esLang } from "./modules/i18n/vocabs/es";
import { locale as jpLang } from "./modules/i18n/vocabs/jp";
import { locale as deLang } from "./modules/i18n/vocabs/de";
import { locale as frLang } from "./modules/i18n/vocabs/fr";
import { SplashScreenService } from "./_metronic/partials/layout/splash-screen/splash-screen.service";
import { TableExtendedService } from "./_metronic/shared/crud-table";
import { environment } from "src/environments/environment";
import { CONSTANTS } from "./modules/shared/helpers/constants";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AppPopupService } from "./modules/shared/helpers/app-popup.service";
import { HelperService } from "./modules/shared/helpers/helper.service";
import { NgxSpinnerService } from "ngx-spinner";
import { LookupService } from "./modules/patient-booking/services/lookup.service";
import { PrintReportsService } from "./print-reports.service";
import { AuthService } from "./modules/auth/_services/auth.service";
import { UserModel } from "./modules/auth";
import moment from "moment";
import {} from "rxjs";
import { debounceTime } from "rxjs/operators";
import { SharedService } from "./modules/shared/services/shared.service";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
@Component({
   selector: "body[root]",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  showTestingBadge = false;
  appVersion = CONSTANTS.APP_VERSION || { version: "v0.0.0", versionId: 0 };
  appVersion_new = CONSTANTS.APP_VERSION || { version: "v0.0.0", versionId: 0 };

  appUpdatesPopupBody = "";

  @ViewChild("appVersionUpdatesPopup") appVersionUpdatesPopup;
  @ViewChild("inactivityWarningPopup") inactivityWarningPopup;
  inactivityWarningPopupRef: NgbModalRef;
  private userActivitySubscriptions: Subscription[] = [];
  private inactivityTimeout: any;
  private countdownInterval: any;
  private warningTimeout: any;

  locationInfo: any;
  error: string | null = null;

  inactivityDuration = 20; // Default to 20 minutes
  warningDuration = 1; // Default to 1 minute
  countdown = 60;

  appVersionUpdatesPopupRef: NgbModalRef;
  LogOutSettings = null;
  spinnerRefs = {
    appVersionLoading: "appVersionLoading",
  };

  loggedInUser: UserModel;
  /**/
  @HostListener("contextmenu", ["$event"])
  onRightClick(event) {
    if (environment.production) {
      event.preventDefault();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if(environment.production) {
      if (event.key === 'F12') {
        event.preventDefault();
      }
    }
  }

  @HostListener("document:mousemove", ["$event"])
  @HostListener("document:keypress", ["$event"])
  @HostListener("document:click", ["$event"])
  @HostListener("window:keydown", ["$event"])
  onUserActivity(event?: KeyboardEvent) {
    if (event) {
      this.resetInactivityTimer(true);
    }
  }

  private activityChannel: BroadcastChannel;
  private lastActivityTimestamp: number = Date.now();
  private ACTIVITY_CHECK_INTERVAL = 1000 * 10; // every 10 seconds

  // @HostListener('window:mousemove') refreshUserState() {
  //   this.storageService.resetSessionTimeout();
  // }

  constructor(
    private translationService: TranslationService,
    private splashScreenService: SplashScreenService,
    private router: Router,
    private tableService: TableExtendedService,
    private appPopupService: AppPopupService,
    private helperService: HelperService,
    private spinner: NgxSpinnerService,
    private lookupService: LookupService,
    private printReportsService: PrintReportsService,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService,
  ) {
    // register translations
    this.translationService.loadTranslations(
      enLang,
      chLang,
      esLang,
      jpLang,
      deLang,
      frLang
    );

    this.appVersion = CONSTANTS.APP_VERSION || {
      version: "v0.0.0",
      versionId: 0,
    };
    this.appVersion_new = this.appVersion;
  }

  ngOnInit() {
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // clear filtration paginations and others
        this.tableService.setDefaults();
        // hide splash screen
        this.splashScreenService.hide();

        // scroll to top on every route change
        window.scrollTo(0, 0);

        // to display back the body content
        setTimeout(() => {
          document.body.classList.add("page-loaded");
        }, 500);

        // Restart inactivity timer only if not on login route
      }
    });
    this.unsubscribe.push(routerSubscription);

    if (environment.testingEnv) {
      this.showTestingBadge = true;
    }

    // Trigger after initial change detection to avoid NG0100 in dev mode.
    setTimeout(() => {
      this.getAppVersion();
    }, 1000);

    this.setupActivityBroadcast();
    this.userActivitySubscription();
    this.loadIdleSettings();
    this.startActivityMonitor();
    this.initGoogleKeyAndLoadMap();

  }

  setupActivityBroadcast() {
    if ("BroadcastChannel" in window) {
      this.activityChannel = new BroadcastChannel("user-activity");
      this.activityChannel.onmessage = (event) => {
        if (event.data && event.data.type === "USER_ACTIVE") {
          this.handleUserActivityFromOtherTab();
        }
      };
    } else {
      // fallback: use localStorage event
      (window as Window).addEventListener("storage", (event) => {
        if (event.key === "user-activity-event") {
          this.handleUserActivityFromOtherTab();
        }
      });
    }
  }

  broadcastUserActivity() {
    const payload = { type: "USER_ACTIVE", timestamp: Date.now() };
    if (this.activityChannel) {
      this.activityChannel.postMessage(payload);
    } else {
      localStorage.setItem("user-activity-event", JSON.stringify(payload));
      localStorage.removeItem("user-activity-event"); // So next event triggers again
    }
  }

  handleUserActivityFromOtherTab() {
    this.lastActivityTimestamp = Date.now();
    this.resetInactivityTimer(false); // Resets the inactivity timer
  }

  ngOnChange() {
    this.userActivitySubscription();
    this.getAppVersion();
    this.cd.detectChanges();
  }

  // getAppVersion(openingSource = "") {
  //   this.spinner.show(this.spinnerRefs.appVersionLoading);
  //   this.lookupService.getAppVersion({}).subscribe(
  //     (res: any) => {
  //       // Defer UI mutations to the next tick to avoid NG0100 when API resolves synchronously.
  //       setTimeout(() => {
  //         this.spinner.hide(this.spinnerRefs.appVersionLoading);
  //         if (res && res.StatusCode == 200) {
  //           if (res.PayLoad && res.PayLoad.length) {
  //             this.appVersion_new = {
  //               version: res.PayLoad[0].AppVersion,
  //               versionId: res.PayLoad[0].AppVersionID,
  //             };
  //             if (this.appVersion.versionId < this.appVersion_new.versionId) {
  //               const versionClass =
  //                 this.appVersion.version == this.appVersion_new.version
  //                   ? "text-primary"
  //                   : "text-danger";
  //               this.appVersionUpdatesPopupRef = this.appPopupService.openModal(
  //                 this.appVersionUpdatesPopup,
  //                 { backdrop: "static", keyboard: false, size: "md" }
  //               );
  //               this.appUpdatesPopupBody = `<div>Application Updates are available</div>
  //             <br>
  //             <div>
  //               Current Version: <strong class="${versionClass}">${this.appVersion.version}</strong>
  //               <br>
  //               New Version: <strong class="${versionClass}">${this.appVersion_new.version}</strong>
  //               <br>
  //               <br>
  //               Note: you can check for update any time by clicking at version number at bottom right corner of the screen, or you can press <strong class="text-danger"> Ctrl + Shift + R </strong> for latest update Or if you are using mobile please clear mobile browser caches for updates.
  //             </div>`;
  //             } else if (openingSource == "user-click") {
  //               this.appVersionUpdatesPopupRef = this.appPopupService.openModal(
  //                 this.appVersionUpdatesPopup,
  //                 { size: "md" }
  //               );
  //               this.appUpdatesPopupBody =
  //                 this.getAppVersionPopupDefaultMessage();
  //             }
  //           } else if (openingSource == "user-click") {
  //             this.appVersionUpdatesPopupRef = this.appPopupService.openModal(
  //               this.appVersionUpdatesPopup,
  //               { size: "md" }
  //             );
  //             this.appUpdatesPopupBody =
  //               this.getAppVersionPopupDefaultMessage();
  //           }
  //         } else if (openingSource == "user-click") {
  //           this.appVersionUpdatesPopupRef = this.appPopupService.openModal(
  //             this.appVersionUpdatesPopup,
  //             { size: "md" }
  //           );
  //           this.appUpdatesPopupBody = this.getAppVersionPopupDefaultMessage();
  //         }
  //         this.cd.detectChanges();
  //       });
  //     },
  //     (err) => {
  //       this.spinner.hide(this.spinnerRefs.appVersionLoading);
  //       if (openingSource == "user-click") {
  //         this.appVersionUpdatesPopupRef = this.appPopupService.openModal(
  //           this.appVersionUpdatesPopup,
  //           { size: "md" }
  //         );
  //         this.appUpdatesPopupBody = this.getAppVersionPopupDefaultMessage();
  //       }
  //     }
  //   );
  // }
  getAppVersionPopupDefaultMessage() {
    return `<div>Application is Up to Date</div>
    <br>
    <div>
      Current Version: <strong>${this.appVersion.version}</strong>
      <br>
      New Version: <strong>${this.appVersion_new.version}</strong>
      <br>
      <br>
      Note: you can check for update any time by clicking at version number at bottom right corner of the screen, or you can press <strong> Ctrl + Shift + R </strong> for latest update.
    </div>`;
  }
  openAppVersionUpdatePopup() {
    this.getAppVersion("user-click");
  }

  updateVersion() {
    this.windowRefresh();
    try {
      this.appPopupService.closeModal(this.appVersionUpdatesPopupRef);
    } catch (e) {}
  }
  windowRefresh() {
    try {
      this.helperService.updateUrlParams_navigateTo("", { ver: +new Date() }, { queryParamsHandling: "merge" });
      setTimeout(() => {
        // this.appVersion = {
        //   version: this.appVersion.version,
        //   versionId: this.appVersion.versionId
        //  }
         const url = window.location.origin + window.location.pathname;
         window.location.href = `${url}?nocache=${new Date().getTime()}`;
      }, 500);
    } catch (e) {}

    //  try {
    //   this.helperService.updateUrlParams_navigateTo('', {ver: (+new Date())}, {queryParamsHandling: 'merge'});
    //   setTimeout(() => {
    //     window.location.reload();
    //   }, 500);
    // } catch (e) {}
    
  }


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.userActivitySubscriptions.forEach((sub) => sub.unsubscribe());
    clearTimeout(this.inactivityTimeout);
    clearTimeout(this.warningTimeout);
    clearInterval(this.countdownInterval);
  }

  loadIdleSettings() {
    const idleTime = localStorage.getItem("IdleTime");
    // const warningTime = localStorage.getItem('WarningTime');

    this.inactivityDuration = idleTime ? parseInt(idleTime, 10) : 20;
    // this.warningDuration = warningTime ? parseInt(warningTime, 10) : 1;
    this.warningDuration = 60; // 60 seconds for warning
  }

  userActivitySubscription() {
    const events = ["click", "keypress", "keydown", "mousemove", "touchstart"];
    events.forEach((event) => {
      this.userActivitySubscriptions.push(
        fromEvent(document, event)
          .pipe(debounceTime(500))
          .subscribe(() => this.resetInactivityTimer(null))
      );
    });
    this.startInactivityTimer();
  }

  startInactivityTimer() {
    if (this.router.url === "/auth/login") return;
 
    this.loadIdleSettings();
    this.inactivityTimeout = setTimeout(() => {
      this.showInactivityWarning();
    }, this.inactivityDuration * 60 * 1000);
  }

  showInactivityWarning() {
    this.warningDuration = 60;
    if (this.router.url === "/auth/login") return;

    this.countdown = this.warningDuration;
    this.inactivityWarningPopupRef = this.appPopupService.openModal(
      this.inactivityWarningPopup,
      {
        backdrop: "static",
        keyboard: false,
        size: "md",
      }
    );

    this.startCountdown();
    this.warningTimeout = setTimeout(
      () => this.logout(),
      this.warningDuration * 1000
    );
  }

  resetInactivityTimer(isTrue) {
    // console.log("Reset Timer__");
    clearTimeout(this.inactivityTimeout);
    clearTimeout(this.warningTimeout);
    clearInterval(this.countdownInterval);

    this.startInactivityTimer();

    if (isTrue) {
      this.broadcastUserActivity();
    }

    if (this.inactivityWarningPopupRef) {
      this.appPopupService.closeModal(this.inactivityWarningPopupRef);
    }
  }

  startActivityMonitor() {
    setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - this.lastActivityTimestamp;
      // console.log("🚀 timeSinceLastActivity:>", timeSinceLastActivity, this.inactivityDuration * 60 * 1000)

      // if (timeSinceLastActivity > this.inactivityDuration * 60 * 1000) {
      //   this.showInactivityWarning();
      // }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  startCountdown() {
    this.warningDuration = 60; // Convert minutes to seconds

    this.countdownInterval = setInterval(() => {
      if (this.warningDuration > 0) {
        this.warningDuration--; // Decrease countdown
      } else {
        clearInterval(this.countdownInterval); // Stop interval when countdown reaches 0
        this.logout(); // Logout when countdown reaches 0
      }
    }, 1000); // Update every 1 second (1000ms)
  }

  logout() {
    this.loadLoggedInUserInfo();

    const urlWithoutParams = this.router.url.split('?')[0]; 

    const currentState = {
      url: urlWithoutParams,
      timestamp: new Date().getTime(),
    };

    localStorage.setItem("preLogoutState", JSON.stringify(currentState));

    const params = {
      ActionLogObj: {
        ActionId: 4,
        FormName: "Auto Logout",
        Description: `Auto Logout, UserName: ${
          this.loggedInUser?.username || ""
        }`,
        OldValues: "",
        MachineInfo: `UpdatedOn: ${moment(new Date()).format(
          "D-MMM-YYYY hh:mm:ss"
        )}`,
        UserId: this.loggedInUser?.userid || -1,
        IPAddress: "",
        IPLocation: "",
        SourceID: 1,
        SourceDetailID: 3,
        ActionRemarks: "",
        ActionRemarksJSON: "",
        PatientPortalUserID: -1,
        PanelUserID: -1,
      },
    };

    this.auth.logoutSession(params).subscribe(
      () => document.location.reload(),
      (err) => console.error("Logout error:", err)
    );
  }

  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  initGoogleKeyAndLoadMap() {
  let key = localStorage.getItem('GoogleAPIKEY');

  if (key) {
    this.sharedService.loadGoogleMap(key);
    return;
  }

  // Fetch from API only if not in localStorage
  const objParm = { AppKeyID: 1 };
  this.sharedService.GoogleAPIKEYString(objParm).subscribe(
    (resp: any) => {
      if (resp && resp.payLoad) {
        const data = JSON.parse(resp.payLoad);
        key = data[0].AppKey;
        localStorage.setItem('GoogleAPIKEY', key);

        this.sharedService.loadGoogleMap(key);
      }
    },
    (err) => console.log(err)
  );
}
}
