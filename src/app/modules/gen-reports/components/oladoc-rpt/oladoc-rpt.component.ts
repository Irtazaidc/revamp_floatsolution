// @ts-nocheck
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  standalone: false,

  selector: 'app-oladoc-rpt',
  templateUrl: './oladoc-rpt.component.html',
  styles: [
  ]
})
export class OladocRptComponent implements OnInit {

  public Fields = {
    dateFrom: ['', ''],
    dateTo: ['', ''],
    mobileno: ['', null],
    rptType: [1, '']
  };
  rptForm: FormGroup = this.formBuilder.group(this.Fields)
  formData: any;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  getRptData() {
    this.formData = this.rptForm.getRawValue();
  }


}
