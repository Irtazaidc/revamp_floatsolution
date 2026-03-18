// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-sms-cancellation-status',
  templateUrl: './sms-cancellation-status.component.html',
  styleUrls: ['./sms-cancellation-status.component.scss']
})
export class SmsCancellationStatusComponent implements OnInit {

  constructor() { }
  isCancellationScreen: boolean;
  
  ngOnInit(): void {
    this.isCancellationScreen = true;
  }

}
