// @ts-nocheck
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel, AuthService } from 'src/app/modules/auth';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: false,

  selector: 'app-emp-personal-info',
  templateUrl: './emp-personal-info.component.html',
  styleUrls: ['./emp-personal-info.component.scss']
})
export class EmpPersonalInfoComponent implements OnInit, OnDestroy {

  isReadonly = true;
  loggedInUser: UserModel;
  formGroup: FormGroup;
  user: UserModel;
  firstUserState: UserModel;
  subscriptions: Subscription[] = [];
  avatarPic = 'none';
  isLoading$: Observable<boolean>;

  FName: string;
  Department: string;
  Designation: string;
  Elocation: string;
  empContact: any;
  empEmail: string;
  empJobTitle: any;
  empBloodGroup: any;
  empCNIC: any;
  empDateOfJoining: any;
  empFatherName: string;
  empMaritalStatus: string;
  empPostalAddress: string;
  empBirthDate: any;
  empAge: any;

  constructor(private userService: AuthService, private fb: FormBuilder,  private empService: EmployeeService ) {
    // this.isLoading$ = this.userService.isLoadingSubject.asObservable();
  }

  ngOnInit(): void {
    const sb = this.userService.currentUserSubject.asObservable().pipe(
      first(user => !!user)
    ).subscribe(user => {
      this.user = Object.assign({}, user);
      this.firstUserState = Object.assign({}, user);
     
      // this.loadForm();
    });
    this.subscriptions.push(sb);
    this.getEmpBasicInfo(this.user.userid);
   
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
  getEmpBasicInfo(id) {
    const paramObj = {
      UserID:this.user.userid
    }
    this.empService.getEmpBasicInfo(paramObj).subscribe((resp: any) => {
      // console.log("API Response", resp)
      const empCardData=resp.PayLoad[0] || [];
      console.log("🚀EmpPersonalInfoComponent");
      this.FName=empCardData.EmployeeName;
      this.Department=empCardData.DepartmentName;
      this.empBirthDate=empCardData.DOB;
      const birthdate = new Date(this.empBirthDate);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      const m = today.getMonth() - birthdate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
          age--;
      }
      this.empAge = age;
      this.empBirthDate= birthdate.toLocaleDateString("default", {year: "numeric", month: "short", day: "numeric"});
      this.empJobTitle=empCardData.JobTitle;
      this.Elocation=empCardData.EmployeeLocation;
      this.empContact=empCardData.EmployeeContactNumber;
      this.empEmail=empCardData.EmployeeContactEmail;
      this.empBloodGroup=empCardData.BloodGroup;
      this.empCNIC=empCardData.CNIC;
      this.empDateOfJoining=empCardData.DateOfJoining;
      const joining = new Date(this.empDateOfJoining);
      this.empDateOfJoining=joining.toLocaleDateString("default", {year: "numeric", month: "short", day: "numeric"});
      this.empFatherName=empCardData.FatherName;
      this.empMaritalStatus=empCardData.MaritalStatus;
      this.empPostalAddress=empCardData.PostalAddress;

    }, (err) => {
      console.log(err)
    })
  }

  // loadForm() {
  //   this.formGroup = this.fb.group({
  //     pic: [this.user.pic],
  //     firstname: [this.user.firstname, Validators.required],
  //     lastname: [this.user.lastname, Validators.required],
  //     companyName: [this.user.companyName, Validators.required],
  //     phone: [this.user.phone, Validators.required],
  //     email: [this.user.email, Validators.compose([Validators.required, Validators.email])],
  //     website: [this.user.website, Validators.required]
  //   });
  // }

  // save() {
  //   this.formGroup.markAllAsTouched();
  //   if (!this.formGroup.valid) {
  //     return;
  //   }

  //   const formValues = this.formGroup.value;
  //   this.user = Object.assign(this.user, formValues);

  //   // Do request to your server for user update, we just imitate user update there
  //   this.userService.isLoadingSubject.next(true);
  //   setTimeout(() => {
  //     this.userService.currentUserSubject.next(Object.assign({}, this.user));
  //     this.userService.isLoadingSubject.next(false);
  //   }, 2000);
  // }

  // cancel() {
  //   this.user = Object.assign({}, this.firstUserState);
  //   this.loadForm();
  // }

  // getPic() {
  //   if (!this.user.pic) {
  //     return 'none';
  //   }

  //   return `url('${this.user.pic}')`;
  // }

  // deletePic() {
  //   this.user.pic = '';
  // }

  // helpers for View
  // isControlValid(controlName: string): boolean {
  //   const control = this.formGroup.controls[controlName];
  //   return control.valid && (control.dirty || control.touched);
  // }

  // isControlInvalid(controlName: string): boolean {
  //   const control = this.formGroup.controls[controlName];
  //   return control.invalid && (control.dirty || control.touched);
  // }
}
