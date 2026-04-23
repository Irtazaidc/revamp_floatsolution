// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/modules/auth/_models/user.model';
import { AuthService } from 'src/app/modules/auth';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { EmployeeService } from '../../services/employee.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CONSTANTS } from 'src/app/modules/shared/helpers/constants';

@Component({
  standalone: false,

  selector: 'app-emp-profile',
  templateUrl: './emp-profile.component.html',
  styleUrls: ['./emp-profile.component.scss']
})
export class EmpProfileComponent implements OnInit {

  loggedInUser: UserModel;
  FullName='';
  userId= null;
  empCardData:any;

  spinnerRefs = {
    empPic: "empPic"
  }
  
  FName="";
  basicInfo=[];
  Department="";
  Designation="";
  ENo="";
  empContact:number;
  empEmail:string;
  Elocation:string;
  empUserPicture=null;
 
  constructor(   
    private auth: AuthService, 
    private empService: EmployeeService, 
    private helper: HelperService, 
    private spinner : NgxSpinnerService,
    ) {
    
  }
  ngOnInit(): void {
    this.loadLoggedInUserInfo();
    this.userId=this.loggedInUser.userid;
    this.getEmpBasicInfo(this.userId);
    this.getEmpPicByUserId(this.userId)

  }
  defaultPatientPic = CONSTANTS.USER_IMAGE.UNSPECIFIED;
  getEmpPicByUserId(id){
    this.spinner.show(this.spinnerRefs.empPic);
    const paramObj = {
      UserID:this.userId
    }
    this.empService.getEmpPicByUserId(paramObj).subscribe((resp: any) => {
      this.spinner.hide(this.spinnerRefs.empPic);
      let empUserPic=resp.PayLoad || [];
      empUserPic=this.helper.formateImagesData( empUserPic,'EmployeePic');
      this.empUserPicture=empUserPic[0].EmployeePic;
    }, (err) => {
      console.log(err)
    })
  }
  getEmpBasicInfo(id) {
   
    const paramObj = {
      UserID:this.userId
    }
    this.empService.getEmpBasicInfo(paramObj).subscribe((resp: any) => {
      // console.log("API Response", resp)
      
      const empCardData=resp.PayLoad[0] || [];
      // console.log("🚀 ~ file: emp-profile.component.ts:61 ~ EmpProfileComponent ~ this.empService.getEmpBasicInfo ~ empCardData", empCardData);
      this.FName=empCardData.EmployeeName;
      this.Department=empCardData.DepartmentName;
      this.Designation=empCardData.Designation;
      this.ENo=empCardData.EmployeeNubmer;
      this.Elocation=empCardData.EmployeeLocation;
      this.empContact=empCardData.EmployeeContactNumber;
      this.empEmail=empCardData.EmployeeContactEmail;
    }, (err) => {
      console.log(err)
    })
  }
  loadLoggedInUserInfo() {
    this.loggedInUser = this.auth.currentUserValue;
 
  }
}
