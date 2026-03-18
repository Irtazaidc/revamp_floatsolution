// @ts-nocheck
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-dicom-dropdown-button',
  templateUrl: './dicom-dropdown-button.component.html',
  styleUrls: ['./dicom-dropdown-button.component.scss']
})
export class DICOMDropdownButtonComponent implements OnInit {

  @Input() btnPayload: any;

  VisitID: any;
  TPID: any;
  styleClass: any;
  iconClass: any;
  btnText: any;
  breakIcon = false;

  disabledButtonDICOM = false;
  isSpinnerDICOM = true;
  screenIdentity = null;

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Please Confirm...!', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> open DICOM?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }
  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.screenIdentity = this.route.routeConfig.path;
    this.TPID = this.btnPayload.TPID;
    this.VisitID = this.btnPayload.VisitID.replaceAll("-", "");;
    this.styleClass = this.btnPayload.styleClass;
    this.iconClass = this.btnPayload.iconClass;
    this.btnText = this.btnPayload.btnText;
    this.breakIcon = this.btnPayload.breakIcon;
    // console.log("btnPayload in onInit: ",this.btnPayload)
    this.loadLoggedInUserInfo();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.btnPayload) {
      this.TPID = this.btnPayload.TPID;
      this.VisitID = this.btnPayload.VisitID.replaceAll("-", "");;
      this.styleClass = this.btnPayload.styleClass || 'dropdown-item'; // Default value for styleClass
      this.iconClass = this.btnPayload.iconClass || 'fas fa-x-ray text-primary cursor-pointer'; // Default value for iconClass
      this.btnText = this.btnPayload.btnText || 'DICOM'; // Default value for btnText
    }
    // console.log("btnPayload in onChange: ",this.btnPayload)
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  loggedInUser: UserModel;
  SysInfo: any = {};
  PACSServers = [];
  isVPN = false; 
  getPACSServers() {
    this.SysInfo = this.auth.getSystemInfoFromStorage();
    let objParams_ = {
      VisitId: this.VisitID,
      TPId: this.TPID,
      LocID: this.loggedInUser.locationid// this.SysInfo.loginLocId
    }
    this.isVPN = localStorage.getItem('isVPN') === 'true'; //  get from local storage
    const tblVisitTestDetail = [{
      VisitID: this.VisitID,
      TPID: this.TPID
    }];
    let objParams = {
      IsVPN: this.isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail
    };
    // console.log("objParams: ", objParams)
    this.disabledButtonDICOM = true;
    this.isSpinnerDICOM = false;
    this.sharedService.getData(API_ROUTES.GET_PACS_SERVERS_LOC_AND_VISITS_V2, objParams).subscribe((resp: any) => {
      this.disabledButtonDICOM = false;
      this.isSpinnerDICOM = true;
      if (resp.StatusCode == 200 && resp.PayLoad.length) {
        this.PACSServers = resp.PayLoad || [];
        // Dynamic handling for any number of servers
        if (this.PACSServers.length > 0) {
          // Create the URL dynamically for any number of servers
          let url = 'radiant://?n=f';

          // Add each server path to the URL
          this.PACSServers.forEach((server, index) => {
            let sanitizedPath = server.BackupServer;

            // Remove trailing slash if present
            if (sanitizedPath.endsWith('\\')) {
              sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
            }

            // Replace backslashes with URL encoding
            sanitizedPath = sanitizedPath.replace(/\\/g, '%5C');

            // Add to URL with proper parameter name
            url += `&v=%22${sanitizedPath}%22`;
          });

          // Open the URL
          window.open(url, '_blank');
        } else {
          this.disabledButtonDICOM = false;
          this.isSpinnerDICOM = true;
          this.toastr.warning("No PACS Servers Available");
        }
      } else if (resp.StatusCode == 200 && !resp.PayLoad.length) {
        this.toastr.warning("No Record Found");
        this.disabledButtonDICOM = false;
        this.isSpinnerDICOM = true;
      }
    }, (err) => {
      console.log(err);
      this.disabledButtonDICOM = false;
      this.isSpinnerDICOM = true;
      this.toastr.error("Error fetching PACS servers");
    });
  }

}
