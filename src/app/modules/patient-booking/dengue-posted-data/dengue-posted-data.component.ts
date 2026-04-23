// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { DengueService } from '../services/dengue.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Conversions } from '../../shared/helpers/conversions';

@Component({
  standalone: false,

  selector: 'app-dengue-posted-data',
  templateUrl: './dengue-posted-data.component.html',
  styleUrls: ['./dengue-posted-data.component.scss']
})
export class DenguePostedDataComponent implements OnInit {
  denguePostedData: any = [];
  public Fields = {
    dateFrom: ['', ''],
    dateTo: ['', ''],
    locID: ['', ''],
    PIN: ['', ''],
  };
  DenForm: FormGroup = this.formBuilder.group(this.Fields)
  searchText: any = "";
  constructor(private deng: DengueService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.DenForm.patchValue({
        dateFrom: Conversions.getPreviousDateObject(),
        dateTo: Conversions.getCurrentDateObject(),
      });
    }, 100);
  }
  getDenguePostedData() {
    const formValues = this.DenForm.getRawValue();
    const params = {
      "DateFrom": Conversions.formatDateObjectToString(formValues.dateFrom),
      "DateTo": Conversions.formatDateObjectToString(formValues.dateTo),
      "LocID": formValues.locID || null, 
      "PIN": formValues.PIN || null,
    }
    this.deng.getDenguePostedData(params).subscribe((resp: any) => {
      console.log(resp);
      if (resp && resp.PayLoad.length && resp.StatusCode == 200) {
        this.denguePostedData = resp.PayLoad;
      }

    }, (err) => { console.log(err) })
  }
}
