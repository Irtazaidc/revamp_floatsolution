// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { environment } from 'src/environments/environment';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from 'src/app/modules/patient-booking/services/patient.service';
import moment from 'moment';


@Component({
  selector: 'app-dashboard4',
  templateUrl: './dashboard4.component.html',
  standalone: false,
  styles: [`
    @media screen and (min-width: 768px) {
      .sample-tracking {
        margin-left: 12px;
      }
    }
    /* Default icon color */
.sample-tracking .ambulance-icon {
  color: #B5B5C3;
  transition: color 0.3s ease;
}

/* Change icon color when hovering the whole LI */
.sample-tracking:hover .ambulance-icon {
  color: #1BC5BD;
}
  `]
})
export class Dashboard4Component implements OnInit {
  disabled: boolean = true;
  appName: string = "";
  fdoSummaryPopupRef: NgbModalRef;
  loggedInUser: UserModel;
  selectedDate: '';


  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private auth: AuthService,
    private patientService: PatientService,

  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.auth.currentUserValue;
    this.disabled = true;
    // if (environment.production)
    this.appName = environment.deployedAppName;
  }


  fdoSummaryReport = [];


  @ViewChild('fdoSummaryModal') fdoSummaryModal;
  fdoSummaryProcess() {
    this.fdoSummaryPopupRef = this.appPopupService.openModal(this.fdoSummaryModal, { backdrop: 'static', size: 'xl' });
  
    setTimeout(() => {
      // Use selectedDate if available, otherwise use today's date
      const dateToUse = this.selectedDate || moment().format('DD-MMM-YYYY');
      this.getFDOSummaryReport(dateToUse);
    }, 1000);
  }
  
  getFDOSummaryReport(selectedDate: string) {
    if (!selectedDate) {
      console.warn('No date selected, using today\'s date');
      selectedDate = moment().format('DD-MMM-YYYY'); // Default to today's date
    }
  
    let params = {
      userId: this.loggedInUser.userid,
      date: moment(selectedDate, 'DD-MMM-YYYY').format('YYYY-MM-DDT00:00:00.000'),
    };
  
    this.fdoSummaryReport = [];
    this.spinner.show();
  
    this.patientService.getFDOSummaryReport(params).subscribe(
      (res: any) => {
        this.spinner.hide();
        console.log(res);
        if (res.StatusCode == 200) {
          this.fdoSummaryReport = res.PayLoad || [];
        } else {
          this.toastr.error(res.Message);
        }
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }
}
