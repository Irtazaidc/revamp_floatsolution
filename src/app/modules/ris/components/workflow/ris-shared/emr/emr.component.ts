// @ts-nocheck
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  standalone: false,

  selector: 'app-emr',
  templateUrl: './emr.component.html',
  styleUrls: ['./emr.component.scss']
})
export class EmrComponent implements OnInit, OnChanges {
  @Input() visitInfo = {};
  selVisit: any = "";
  selPIN: any = "";
  cusselpin: any = "";

  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    // console.log("emr visitInfo", this.visitInfo);
  }
  ngOnChanges(): void {
    // console.log("emr visitInfo", this.visitInfo);
  }

  selVisitRecieved(selVisit) {
    // console.log("selVisit", selVisit);
    this.selVisit = selVisit
  }
  selPINRecieved(selPIN) {
    this.selPIN = selPIN;
    this.cusselpin = this.selPIN.replaceAll('-', '')
  }

}
