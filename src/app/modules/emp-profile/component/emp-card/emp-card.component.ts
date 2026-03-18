// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { HelperService } from 'src/app/modules/shared/helpers/helper.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: false,

  selector: 'app-emp-card',
  templateUrl: './emp-card.component.html',
  styleUrls: ['./emp-card.component.scss']
})
export class EmpCardComponent implements OnInit {
@Input('userId') userId:any;

  // FName="";
  // basicInfo=[];
  // Department="";
  // Designation="";
  // ENo="";
  // empContact:number;
  // empEmail:string;
  // Elocation:string;
  // empUserPicture=null;
    constructor(private empService: EmployeeService, private helper: HelperService) {}
  
  ngOnInit(): void {
    // this.getEmpBasicInfo(this.userId);
    // this.getEmpPicByUserId(this.userId)
  }
  // getEmpPicByUserId(id){
  //   let paramObj = {
  //     UserID:this.userId
  //   }
  //   this.empService.getEmpPicByUserId(paramObj).subscribe((resp: any) => {
  //     let empUserPic=resp.PayLoad || [];
  //     empUserPic=this.helper.formateImagesData( empUserPic,'EmployeePic');
  //     this.empUserPicture=empUserPic[0].EmployeePic;
  //   }, (err) => {
  //     console.log(err)
  //   })
  // }
  // getEmpBasicInfo(id) {
  //   let paramObj = {
  //     UserID:this.userId
  //   }
  //   this.empService.getEmpBasicInfo(paramObj).subscribe((resp: any) => {
  //     let empCardData=resp.PayLoad[0] || [];
  //     this.FName=empCardData.EmployeeName;
  //     this.Department=empCardData.DepartmentName;
  //     this.Designation=empCardData.Designation;
  //     this.ENo=empCardData.EmployeeNubmer;
  //     this.Elocation=empCardData.EmployeeLocation;
  //     this.empContact=empCardData.EmployeeContactNumber;
  //     this.empEmail=empCardData.EmployeeContactEmail;
  //   }, (err) => {
  //     console.log(err)
  //   })
  // }
}
