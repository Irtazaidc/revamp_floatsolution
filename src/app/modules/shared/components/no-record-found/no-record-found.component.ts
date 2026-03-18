// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-no-record-found',
  templateUrl: './no-record-found.component.html',
  styleUrls: ['./no-record-found.component.scss']
})
export class NoRecordFoundComponent implements OnInit {
  @Input() infoMessageParam:any="No Record Found";
  @Input() pyClassParam:any = "py-10";
  infoMessage = 'No Record Found';
  pyClass = 'py-10';
  constructor() { }

  ngOnInit(): void {
    this.infoMessage = this.infoMessageParam;
    this.pyClass = this.pyClassParam;
  }

}
