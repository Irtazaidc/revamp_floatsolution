// @ts-nocheck
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/modules/auth';
import { PrintReportService } from 'src/app/modules/print-reports/services/print-report.service';
import { API_ROUTES } from 'src/app/modules/shared/helpers/api-routes';
import { SharedService } from 'src/app/modules/shared/services/shared.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  standalone: false,

  selector: 'app-pacs',
  templateUrl: './pacs.component.html',
  styleUrls: ['./pacs.component.scss']
})
export class PacsComponent implements OnInit {
  spinnerRefs = {
    PACsStudiesList: 'PACsStudiesList'
  }

  @Input('PIN') PIN: any = {};
  constructor(
    private toastr: ToastrService,
    private printRptService: PrintReportService,
    private auth: AuthService,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService
  ) { }

  confirmationPopoverConfig = {
    placements: ['top', 'left', 'right', 'bottom'],
    popoverTitle: 'Confirmation Alert', // 'Are you sure?',
    popoverMessage: 'Are you <b>sure</b> you want to download?',
    confirmText: 'Yes <i class="fa fa-check"></i>',
    cancelText: 'No <i class="fa fa-times"></i>',
    confirmClicked: false,
    cancelClicked: false,
    confirmPopoverCancel: () => { }
  }

  ngOnInit(): void {
    if(this.PIN)
      this.getPACSStudies(this.PIN)
  }

  ngOnChanges(changes: SimpleChanges) {
    if(this.PIN)
      this.getPACSStudies(this.PIN)
  }

  spinnerText = "Loading..."
  PACSStudiesList: any = [];
  getPACSStudies(pin) {
    let params = {
      "visitno":  this.PIN //'2302-01-000072' //this.PIN// '2302-01-000072' //this.PIN //'2111-01-056227'//pin 2307-01-000055 2111-01-056227
    }
    this.spinner.show(this.spinnerRefs.PACsStudiesList);
    this.sharedService.getData(API_ROUTES.GET_PACS_STUDIES, params).subscribe((resp: any) => {
      setTimeout(() => {
        this.spinner.hide(this.spinnerRefs.PACsStudiesList);
      }, 200);
      if (resp && resp.StatusCode == 200) {
        let parserResp = JSON.parse(resp.PayLoadStr);
        this.PACSStudiesList = parserResp;
        // console.log("Studies list is : ", this.PACSStudiesList)
      }
    }, (err) => {
      console.log(err)
      this.spinner.hide(this.spinnerRefs.PACsStudiesList);
    })
  }
  replaceCarrotSymbols(input: string): string {
    return input.replace(/\^+/g, '');
  }

  selectedType: any = 0;
  downloadPACSconfirmBox(pin, UserID, SourceID, pacsStudiesData) {
    if (pin) {
      Swal.fire({
        title: '<b>Are you sure want to download radiology images?</b>',
        html: `<span style="text-align: justify;  line-height: 20px;">This download might take several minutes` +
          `depending upon your internet speed and size of the file,<b> so please tolerate with us.</b>` +
          `<br/>If you have any queries,` +
          `please contact our 24/7 support on UAN at 051-111-000-432, 03 111 000 432 (WhatsApp) for further support.</span> ` +
          `<div class="row mt-2" style="justify-content:center ;scroll:none !important"> <div  class="">` +
          `<select  id="selectedType"` +
          `class="form-control form-control-sm">` +
          `<option value="1">` +
          `JPEG` +
          ` </option>` +
          `<option value="2">` +
          `HQ Images` +
          `</option>` +
          `</select>` +
          `<button class="btn btn-danger btn-sm" id="shareButton">
          <i class="fa fa-share-alt-square"></i> Share Pacs with Doctor
        </button>`+
          `</div></div>`,
        // icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Download',
        cancelButtonText: 'Cancel',
        //   footer: `<button class="btn btn-light-danger btn-sm" id="shareButton">
        //   <i class="fa fa-share-alt-square"></i> Share Pacs with Doctor
        // </button>`,
        width: '50em',
        customClass: 'alert-text',

      }).then((result) => {
        if (result.value) {
          var e = document.getElementById("selectedType");
          let ee = $("#selectedType :selected").text();
          this.selectedType = $("#selectedType").val();
          let params = {
            pacsData: {
              "visitno": '2302-01-000072' // decodeURI(pin),
            },
            pacsStudiesData: {
              filepath: pacsStudiesData.filepath,
              pat_id: pacsStudiesData.pat_id,
              pat_name: pacsStudiesData.pat_name,
              study_datetime: pacsStudiesData.study_datetime,
              studyType: Number(this.selectedType)
            },
            actionLog: {
              ActionId: 4,
              FormName: "Packs Downloading",
              Description: "",
              OldValues: "",
              MachineInfo: "UpdatedOn:",
              UserId: -1,
              IPAddress: "",
              IPLocation: "",
              SourceIDStr: SourceID,
              SourceDetailID: 4,
              ActionRemarks: "",
              ActionRemarksJSON: "",
              PatientPortalUserIDStr: UserID || -100,
              PanelUserID: -1
            }
          }

          console.log('Params_____________', params)
          this.spinner.show();
          this.sharedService.getData(API_ROUTES.GET_PACS_STUDIES, params).subscribe((data: any) => {
            console.log(data);
            this.spinner.hide();

            // const blob = new Blob([data], {
            //   type: 'application/zip'
            // });
            // const url = window.URL.createObjectURL(blob);
            // window.open(url);
            if (data && data.byteLength) {
              var a = document.createElement('a');
              var blob = new Blob([data], { 'type': "application/octet-stream" });
              a.href = URL.createObjectURL(blob);
              // a.download = this.patient.PIN + ".zip";
              a.click();
              Swal.fire(
                'Thankyou',
                'File Downloaded',
              )

            } else {
              Swal.fire(
                'Please Try Again Later',
                'There might be some delay because of technical reasons. Please Try again 30 to 60 minutes. Thank you for bearing with us',
              )
            }

          }, (err) => {
            console.log(err);
            this.spinner.hide();
            Swal.fire(
              'Something Went Wrong!',
              'Check your internet connection and try again.<br/> If you still face any problem, please contact our 24/7 support on UAN at <b> 051-111-000-432, 03 111 000 432 (WhatsApp) </b> for further support',
            )
          })
        } else if (result.dismiss === Swal.DismissReason.cancel) {

        }
      });
      const shareButton = document.getElementById('shareButton');
      shareButton.addEventListener('click', () => {
        // this.sharePacswithDoc(this.patient.PIN);
      });
    }
    else {
      this.toastr.error("someting went wrong");
    }
  }

  downloadPacsData(pacsStudiesData, pin, type) {
    this.spinnerText = "We're preparing for your download. Thank you for your patience.";
    let params = {
      pacsData: {
        "visitno": pin //'2302-01-000072'
      },
      pacsStudiesData: {
        filepath: pacsStudiesData.filepath,
        pat_id: pacsStudiesData.pat_id,
        pat_name: pacsStudiesData.pat_name,
        study_datetime: pacsStudiesData.study_datetime,
        studyType: type
      },
      actionLog: {
        ActionId: 4,
        FormName: "Packs Downloading",
        Description: "",
        OldValues: "",
        MachineInfo: "UpdatedOn:",
        UserId: -1,
        IPAddress: "",
        IPLocation: "",
        // SourceIDStr: SourceID,
        SourceDetailID: 4,
        ActionRemarks: "",
        ActionRemarksJSON: "",
        // PatientPortalUserIDStr: UserID || -100,
        PanelUserID: -1
      }
    }
    console.log("objParam for download is: ", params)
    this.spinner.show(this.spinnerRefs.PACsStudiesList);
    this.sharedService.getDataArrayBuffer(API_ROUTES.DOWNLOAD_PACS_IMAGES, params).subscribe((data: any) => {
      console.log(data);
      this.spinner.hide(this.spinnerRefs.PACsStudiesList);
      // this.spinner.hide();
      // const blob = new Blob([data], {
      //   type: 'application/zip'
      // });
      // const url = window.URL.createObjectURL(blob);
      // window.open(url);
      if (data && data.byteLength) {
        var a = document.createElement('a');
        var blob = new Blob([data], { 'type': "application/octet-stream" });
        a.href = URL.createObjectURL(blob);
        a.download = "zip.zip";
         a.click();
        // Swal.fire(
        //   'Thankyou',
        //   'File Downloaded',
        // )
      } else {
        this.spinner.hide(this.spinnerRefs.PACsStudiesList);
        this.toastr.info("No data found, Try again...");
        // 'Please Try Again Later',
        // 'There might be some delay because of technical reasons. Please Try again 30 to 60 minutes. Thank you for bearing with us'
      }

    }, (err) => {
      console.log(err);
      this.spinner.hide(this.spinnerRefs.PACsStudiesList);
      this.toastr.info("Something went wrong");
      //catch code...
    })

  }


}
