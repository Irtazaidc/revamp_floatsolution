// @ts-nocheck
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxSpinnerService } from "ngx-spinner";
import { AuthService, UserModel } from "src/app/modules/auth";
import { LookupService } from "src/app/modules/patient-booking/services/lookup.service";
import { TestProfileService } from "src/app/modules/patient-booking/services/test-profile.service";
import { AppPopupService } from "src/app/modules/shared/helpers/app-popup.service";
import { AppointmentService } from "../../services/appointment.service";



@Component({
  standalone: false,

  selector: 'app-pat-appointments',
  templateUrl: './pat-appointments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./pat-appointments.component.scss']
})

export class PatAppointmentsComponent implements OnInit {
  @ViewChild('bookAppointmentPopup') bookAppointmentPopup;

  public getAppointmnetFields = {
    branch: [null, [Validators.required]],
    section: ['', ''],
    modality: [null, [Validators.required]],
  };
  public bookAppointFields = {
    patientName: [null, [Validators.required]],
    patientContactNumber: [null, ''],
    appointmentDate: [null, ''],
    appointmentTimeFrom: [null, ''],
    appointmentTimeTo: [null, ''],
    appointmentType: [null, ''],
    appointmentTest: [null, ''],
    appointmentRadiologist: [null, ''],
    appointmentRemarks: [null, ''],
    appointmentReason: [null, ''],
  };

  appointmentForm!: FormGroup;
  bookAppointmentForm!: FormGroup;

  branchList: any = [];
  modalityList: any = [];
  sectionList: any = [];
  appointmentTypeList: any = [];
  appointmentStatusList: any = [];
  appointmentReasonList: any = [];
  ModalityWiseTestList: any = [];

  viewDate = new Date();


  ModalityWiseDoctorsList: any = [];
  isShowBookAppointment = false;
  loggedInUser: UserModel;
  SelPatientData: any;


  constructor(private modal: NgbModal,
    private testProfileService: TestProfileService,
    private formBuilder: FormBuilder,
    private lookupSrv: LookupService,
    private appPopupService: AppPopupService,
    private appointmentSrv: AppointmentService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef // 2. Inject it
  ) {
    this.appointmentForm = this.formBuilder.group(this.getAppointmnetFields);
    this.bookAppointmentForm = this.formBuilder.group(this.bookAppointFields);
  }
  messages = [];

  ngOnInit(): void {
    this.socketService.receiveMessages().subscribe((msg: any) => {
      // Ensure we handle both string and object cases
      const content = typeof msg === 'object' ? msg.text : msg;
      this.messages.push(content);
      this.cdr.detectChanges();
      console.log("New message:", content);
    });
    console.log("Socket messages", this.messages);
  }
  newMessage = '';
  sendData() {
    if (this.newMessage.trim()) {
      this.socketService.sendMessage(this.newMessage);
      this.newMessage = ''; // Clear the input after sending
    }
  }

 
}
