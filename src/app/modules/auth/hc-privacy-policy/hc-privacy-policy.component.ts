// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-hc-privacy-policy',
  templateUrl: './hc-privacy-policy.component.html',
  styleUrls: ['./hc-privacy-policy.component.scss']
})
export class HcPrivacyPolicyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // this.HCPrivacyPolicy();  
  }

  // HCPrivacyPolicy() {
  //   let param = {
  //     policyId: 1
  //   }
  //   this.updHCReq.updatePatientBooking(param).subscribe((resp: any) => {
  //     console.log(resp);
  //   }, (err) => {
  //     console.log("err", err)
  //   })
  // }

}
