// @ts-nocheck
import { Component, OnInit, Renderer2, TemplateRef  } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { Conversions } from 'src/app/modules/shared/helpers/conversions';
import { SmsStatusService } from '../../service/sms-status.service';

@Component({
  standalone: false,

  selector: 'app-email-status',
  templateUrl: './email-status.component.html',
  styleUrls: ['./email-status.component.scss']
})
export class EmailStatusComponent implements OnInit {

  emailSendingDetails
  IsMasterDisable: boolean = true;
  masterSelected: boolean = false;
  isSubmitted = false;
  emailInfoList = []
  emailVisitsLists = []


  formForEmailstatus = this.formBuilder.group({
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
  });

  UserID

  TestProfileStatusList = []
  TestProfileList = []
  TestProfileListDB = []
  searchText = '';
  maxDate
  spinnerRefs = {
    emailInfo: 'emailInfo',
    tableList: 'tableList',
    DetailsInfo: 'DetailsInfo',
    visitTable: 'visitTable'
  }

  SearchForEmailstatus = this.formBuilder.group({
    PIN: ['', Validators.required],
  });

  getPatientDetailsForEmail = this.formBuilder.group({
    MRNO: [''],
    patientName: [''],
    AgeGender: [''],
    Contact: [''],
    Email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
    CC: ['', [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
  });

  getEmailStatusList = this.formBuilder.group({
    patientName: [''],
    Contact: [''],
    AgeGender: [''],
    Email: [''],
    CC: [''],
  });

  loggedInUser: UserModel;


  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private smsStatus: SmsStatusService,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

    setTimeout(() => {
      this.formForEmailstatus.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);

    this.maxDate = Conversions.getCurrentDateObject();
    this.loadLoggedInUserInfo();

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  isDisable = false;
  getReportDataViaPIN() {
    this.emailInfoList = [];
    if (this.SearchForEmailstatus.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      this.getPatientDetailsForEmail.reset();
      return;
    }

    let formValues = this.SearchForEmailstatus.getRawValue();
    formValues.PIN = (formValues.PIN || '').trim().toString().replace(/\D/g, '');
    let params = {
      VisitId: formValues.PIN || null,
    };
    this.getPatientDetailsForEmail.reset();
    this.spinner.show(this.spinnerRefs.emailInfo)
    this.smsStatus.GetEmailInfoByViistID(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.emailInfo)
      if (resp.StatusCode == 200 && resp.PayLoad) {

        this.emailInfoList = resp.PayLoad;
        this.getPatientDetailsForEmail.patchValue({
          MRNO: this.emailInfoList[0].MRNo || 'NA',
          patientName: this.emailInfoList[0].PatientName || 'NA',
          AgeGender: this.emailInfoList[0].AgeSex || 'NA',
          Contact: this.emailInfoList[0].Contact || 'NA',
          Email: this.emailInfoList[0].Email || 'NA',
        });

      }
    },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.emailInfo)
      }
    );
  }

  SelectedTPs: number[] = [];

  checkUncheckAll(checked: boolean) {
    this.emailInfoList.forEach(item => {
      if ((item.Balance === 0) && (item.StatusId === 9) || (item.StatusId === 12)) {
        item.checked = checked;
      }
    });
    this.getSelectedTPIds();
  }

  toggleSelection(item: any) {

    if (item.checked) {
      this.SelectedTPs.push(item.TPId);
    } else {
      const index = this.SelectedTPs.indexOf(item.TPId);
      if (index !== -1) {
        this.SelectedTPs.splice(index, 1);
      }
    }
    this.getSelectedTPIds();
  }


  getSelectedTPIds() {
    this.SelectedTPs = this.emailInfoList
      .filter((item) => item.checked).map((item) => item.TPId);
  }

  sendPatientReportViaEmail() {
    console.log('SendEmail')
    if (this.getPatientDetailsForEmail.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    let formValues = this.getPatientDetailsForEmail.getRawValue();

    if (this.SelectedTPs.length > 0) {

      let params = {
        EmailTo: formValues.Email || null,
        CC: formValues.CC || null,
        BCC: null,
        CreatedBy: this.loggedInUser.userid,

        tblSendEmail: this.SelectedTPs.map((tp) => ({
          VisitId: this.emailInfoList[0].VisitId || null,
          TPId: tp || null,
          ReportType: 1,
          TypeId: 1,
        })),
      };
      console.log('SendEmail___ >Params', params)
      this.spinner.show(this.spinnerRefs.emailInfo)
      this.smsStatus.SendEmail(params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.emailInfo)
        if (resp.StatusCode == 200 && resp.PayLoad) {
          const result = resp.PayLoad[0].RESULT;
          console.log(" resp.PayLoad[0].RESULT:", resp.PayLoad[0].RESULT)
          console.log("result:", result)
          if (result == 1) {
            this.toastr.success("Email has been sent");
            this.getPatientDetailsForEmail.reset();
            this.emailInfoList = []
          }
          else {
            this.toastr.error("Error sending email");
          }
        }
      },
        (err) => {
          console.log(err);
          this.toastr.error("Connection Error");
          this.spinner.hide(this.spinnerRefs.emailInfo)
        }
      );
    }
    else {
      this.toastr.warning('Please select test(s) first');
    }

  }

  rowIndex:number = null;
  selectedVisitID = null;
  getTestProfileInfo(item, index) {
    console.log("🚀getTestProfileInfo ~ event:", item);
    this.selectedVisitID = item.VisitId;  
    this.rowIndex = index;
    try {
      this.GetEmailDetailsBYVisitID(item.VisitId);
    } catch (error) {
      console.error('An error occurred:', error);
      this.toastr.error('An error occurred');
      this.spinner.hide(this.spinnerRefs.tableList)
    }
  }
showEmailCC: boolean = false;

GetEmailDetailsBYVisitID(VisitId) {
  this.showEmailCC = false
      let params = {
        VisitId: VisitId,
      };
      this.spinner.show(this.spinnerRefs.tableList)
      this.smsStatus.GetEmailDetailsByVisitID(params).subscribe((resp: any) => {
        this.spinner.hide(this.spinnerRefs.tableList)
        if (resp.StatusCode == 200 && resp.PayLoad) {
          this.TestProfileStatusList = resp.PayLoad;
         this.showEmailCC = this.TestProfileStatusList?.some(x => x.EmailCC && x.EmailCC.trim() !== '');
 
          this.getEmailStatusList.patchValue({
          patientName: this.TestProfileStatusList[0].PatientName || 'NA',
          AgeGender:  this.TestProfileStatusList[0].Age && this.TestProfileStatusList[0].Gender
            ? `${this.TestProfileStatusList[0].Age} (${this.TestProfileStatusList[0].Gender})`: 'NA',
          Contact: this.TestProfileStatusList[0].ContactNumber || 'NA',
        });
        }
      },
        (err) => {
          console.log(err);
          this.toastr.error("Connection Error");
          this.spinner.hide(this.spinnerRefs.tableList)
        }
      );
}
  tableData = [];
  getSendingEmailstatus() {
    this.searchText = '';
    this.rowIndex = null;
    this.TestProfileList = [];
    this.TestProfileStatusList = [];
    this.getEmailStatusList.reset();
    if (this.formForEmailstatus.invalid) {
      this.toastr.warning("Please Fill The Mandatory Fields");
      this.isSubmitted = true;
      return;
    }
    let formValues = this.formForEmailstatus.getRawValue();
    formValues.dateFrom = Conversions.formatDateObject(formValues.dateFrom);
    formValues.dateTo = Conversions.formatDateObject(formValues.dateTo);
    const dateFrom = new Date(formValues.dateFrom);
    const dateTo = new Date(formValues.dateTo);

    if (dateFrom.getMonth() !== dateTo.getMonth() || dateFrom.getFullYear() !== dateTo.getFullYear()) {
      this.toastr.error("Date range must be within the same month.");
      this.isSubmitted = true;
      return;
    }
    let params = {
      DateFrom: formValues.dateFrom,
      DateTo: formValues.dateTo,
    };
    this.spinner.show(this.spinnerRefs.visitTable)
    this.smsStatus.GetEmailInfoByDate(params).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.visitTable)
      if (resp.StatusCode == 200 && resp.PayLoad) {
        this.TestProfileListDB = resp.PayLoad;
        this.TestProfileList = resp.PayLoad;
        // this.tableData = resp.PayLoad
        // const data = resp.PayLoad;
        // this.filteredItems(data);
        setTimeout(() => {
        this.getTestProfileInfo(this.TestProfileList[0], 0);
        }, 200);
      }
    },
      (err) => {
        console.log(err);
        this.spinner.hide(this.spinnerRefs.visitTable)

      }
    );
  }

 
  filteredItems(data) {

    const uniqueVisitIds = new Set();
    const uniqueData = [];
  
    data.forEach((item) => {
      const visitId = item.VisitId;
      const tpId = item.TPId;
      const code = item.Code;
      const pin = item.PIN
  
      if (!uniqueVisitIds.has(visitId)) {
        uniqueVisitIds.add(visitId);
        uniqueData.push({
          VisitId: visitId,
          PIN : pin,
          TPIds: new Set([tpId]),
          Codes: [code],
        });
      } else {
        const existingItem = uniqueData.find((x) => x.VisitId === visitId);
        existingItem.TPIds.add(tpId);
        if (!existingItem.Codes.includes(code)) {
          existingItem.Codes.push(code);
        }
      }
    });
    uniqueData.forEach((item) => {
      item.TPIds = [...item.TPIds].join(', ');
      item.Codes = item.Codes.join(', ');
    });
    this.TestProfileList = uniqueData;
  }
  
   truncate(source, size) {
    return source && source.length > size ? source.slice(0, size - 1) + "…" : source;
  }

    selectedEmailBody: string = '';


  openEmailBodyPopup(content: TemplateRef<any>, body: string) {
    this.selectedEmailBody = body || 'NA';
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true
    });
  }

  getEmailPreview(body: string): string {
    if (!body) return 'NA';

    const plainText = body.replace(/<[^>]*>/g, '');
    return plainText.length > 65
      ? plainText.substring(0, 65) + '...'
      : plainText;
  }

}