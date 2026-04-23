// @ts-nocheck
import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-dicom-button',
  templateUrl: './dicom-button.component.html',
  styleUrls: ['./dicom-button.component.scss']
})
export class DICOMButtonComponent implements OnInit, OnChanges {
  @Input() btnPayload: any;

  VisitID: any;
  TPID: any;
  styleClass: any;
  btnStyle: any;
  iconClass: any;
  btnText: any;
  breakIcon = false;

  disabledButtonDICOM = false;
  isSpinnerDICOM = true;
  screenIdentity = null;
  loggedInUser: UserModel;
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
    this.loadLoggedInUserInfo();
    this.TPID = this.btnPayload.TPID;
    this.VisitID = this.btnPayload.VisitID;
    this.styleClass = this.btnPayload.styleClass;
    // this.btnStyle = this.btnPayload.btnStyle;
    this.iconClass = this.btnPayload.iconClass;
    this.btnText = this.btnPayload.btnText;
    this.breakIcon = this.btnPayload.breakIcon;
    // Split the string by semicolon and trim each part
    const styleParts = (this.btnPayload.btnStyle || '').split(';').map(part => part.trim());

    // Create an object to hold the styles
    const styleObject = {};

    // Loop through each part and split by colon to get style name and value
    styleParts.forEach(part => {
      const [name, value] = part.split(':');
      // Add the style name and value to the object
      if (name && value) {
        styleObject[name] = value;
      }
    });

    // Assign the object to btnStyle
    this.btnStyle = styleObject;
    // console.log("btnPayload in onInit: ", this.btnPayload)
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.btnPayload) {
      this.TPID = this.btnPayload.TPID;
      this.VisitID = this.btnPayload.VisitID;
      this.styleClass = this.btnPayload.styleClass || 'btn btn-sm btn-danger pull-right mr-2'; // Default value for styleClass
      // this.btnStyle = this.btnPayload.btnStyle || ''; // Default value for styleClass
      this.iconClass = this.btnPayload.iconClass || 'fas fa-x-ray'; // Default value for iconClass
      this.btnText = this.btnPayload.btnText || 'DICOM'; // Default value for btnText

      // Split the string by semicolon and trim each part
      const styleParts = (this.btnPayload.btnStyle || '').split(';').map(part => part.trim());

      // Create an object to hold the styles
      const styleObject = {};

      // Loop through each part and split by colon to get style name and value
      styleParts.forEach(part => {
        const [name, value] = part.split(':');
        // Add the style name and value to the object
        if (name && value) {
          styleObject[name] = value;
        }
      });

      // Assign the object to btnStyle
      this.btnStyle = styleObject;
    }
    // console.log("btnPayload in onChange: ", this.btnPayload)
  }

  SysInfo: any = {};
  PACSServers = [];
  isVPN = false;
  getPACSServers() {
    this.SysInfo = this.auth.getSystemInfoFromStorage();
    this.isVPN = localStorage.getItem('isVPN') === 'true'; //  get from local storage
    const tblVisitTestDetail = [{
      VisitID: this.VisitID,
      TPID: this.TPID
    }];

    const objParams = {
      IsVPN: this.isVPN,
      LocID: this.loggedInUser.locationid,
      tblVisitTPID: tblVisitTestDetail
    };
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
