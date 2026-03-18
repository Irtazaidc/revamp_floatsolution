// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  today: Date = new Date();

  constructor() { }

  ngOnInit(): void {
  }

}
