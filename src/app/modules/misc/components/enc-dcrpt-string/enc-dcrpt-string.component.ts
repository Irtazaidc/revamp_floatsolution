// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from 'src/app/modules/shared/services/shared.service';

@Component({
  standalone: false,

  selector: 'app-enc-dcrpt-string',
  templateUrl: './enc-dcrpt-string.component.html',
  styleUrls: ['./enc-dcrpt-string.component.scss']
})
export class EncDcrptStringComponent implements OnInit {
  encDecform = this.fb.group({
    string: ['', Validators.compose([Validators.required])],
  });
  encryptedString: any = "";
  decryptedString: any = "";

  constructor(private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private shared: SharedService) { }

  ngOnInit(): void {
  }

  encryptString() {
    const formData = this.encDecform.getRawValue();
    const param = {
      "stringToEncrypt": formData.string
    }
    this.spinner.show();
    this.shared.encryptString(param).subscribe((resp: any) => {
      console.log("resp", resp);
      this.spinner.hide();
      this.decryptedString = "";
      if (resp.StatusCode == 200 && resp.PayLoadStr != "") {
        this.encryptedString = resp.PayLoadStr;
        console.log(this.encryptedString);
      }
    }, (err) => {
      this.spinner.hide();
      console.log("err", err)
    })

  }
  decryptString() {
    this.spinner.show();
    const formData = this.encDecform.getRawValue();
    const param = {
      "stringToDecrypt": formData.string
    }
    this.shared.decryptString(param).subscribe((resp: any) => {
      this.spinner.hide();
      console.log("resp", resp);
      this.encryptedString = "";
      if (resp.StatusCode == 200 && resp.PayLoadStr != "") {
        this.decryptedString = resp.PayLoadStr;
        console.log(this.decryptedString);
      }
    }, (err) => {
      this.spinner.hide();
      console.log("err", err)
    })

  }

}
