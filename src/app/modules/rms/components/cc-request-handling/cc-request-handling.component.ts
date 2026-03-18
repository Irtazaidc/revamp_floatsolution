// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { Observable } from 'rxjs';

@Component({
  standalone: false,

  selector: 'app-cc-request-handling',
  templateUrl: './cc-request-handling.component.html',
  styleUrls: ['./cc-request-handling.component.scss']
})
export class CCRequestHandlingComponent implements OnInit {

  user$: Observable<UserModel>;
  loggedInUser: UserModel;
  screenTypeSelection: FormGroup;
  
  showHomeSamplingForm = false;
  showFeedbackComponent = false;
  showComplaintComponent = true;
  RequestCounts: any;
  spinnerRefs = {
    hcRequesTable: 'hcRequesTable',
    hcRequesDetail: 'hcRequesDetail',
  }
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {
    this.screenTypeSelection = this.fb.group({
      screenType: ['1'],
    });

  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
  }

  ngOnInit(): void {
    this.loadLoggedInUserInfo();
  }
  onScreenTypeChange(screenType: string) {
    this.showHomeSamplingForm = (screenType === '3');
    this.showFeedbackComponent = (screenType === '2');
    this.showComplaintComponent = (screenType === '1');
  }
}
