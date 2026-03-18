// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
// import { AppPopupService } from 'src/app/modules/shared/helpers/app-popup.service';
import { AppPopupService } from '../../modules/shared/helpers/app-popup.service';



@Component({
  standalone: false,

  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

})
export class DashboardComponent implements OnInit {

  @ViewChild('expirCheck') expirCheck;

  lastChanged: Date = new Date();

  constructor(
    private appPopupService: AppPopupService,
    private router: Router,
  ) { }


  // CheckPasswordExpiration

  // checkExpiration(lastChanged: Date): boolean {
  //   const currentDate = new Date();
  //   const diffTime = Math.abs(currentDate.getTime() - lastChanged.getTime());
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays > 15;
  // }
  // checkExpiration(lastChanged: Date): boolean {
  //   const expirationPeriod = 10; // days
  //   const expirationDate = new Date(lastChanged);
  //   expirationDate.setDate(expirationDate.getDate() + expirationPeriod);
  //   return expirationDate > lastChanged; 
  // }
  ngOnInit(): void {
     
    // setTimeout(() => {
    //     if (this.checkExpiration(this.lastChanged)) {
    //       this.appPopupService.openModal(this.expirCheck);
    //     }    
    //   }, 200);
   
  }

    // changePassword(): void {
  //   this.router.navigate(['/emp-change-password']);
  // }
}