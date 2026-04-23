// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import {NgbModal, NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { Conversions } from '../../../../modules/shared/helpers/conversions';
import { BusinessSuiteService } from '../../business-suite.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { TestProfileService } from '../../../../modules/patient-booking/services/test-profile.service'

import { ChartDataSets, ChartOptions } from 'chart.js';

import { ExcelService } from '../../excel.service';

type Color = any;
type Label = any;


@Component({
  standalone: false,

  selector: 'app-reg-section-stat',
  templateUrl: './reg-section-stat.component.html',
  styleUrls: ['./reg-section-stat.component.scss']
})


export class RegSectionStatComponent implements OnInit {
  @ViewChild('testWiseRegCount') testWiseRegCount;
  @ViewChild('branchWiseRegChart') branchWiseRegChart;
  
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;

  arrGroupBy = [
    {
      id: 1, title: 'Day Wise'
    },
    {
      id: 2, title: 'Month Wise',
    },
    {
      id: 3, title: 'Week Wise',
    }
    ,
    {
      id: 4, title: 'Quarter wise',
    }
    ,
    {
      id: 5, title: 'Year wise',
    }
  ]

  testRegCountList = [];
  regCountList = [];
  subSectionList = [];
  testProfileList = [];
  groupBy = 1;
  groupByName = "Day Wise";
  locIDs = "-1";
  branchName = "";
  labDeptID = -1;
  locationID = -1;

  _object = Object;
  branchesList = [];
  branchIds = [];
  subSectionIDs = [];
  testProfileIDs = [];
  spinnerRefs = {
    // faqFormSection: 'faqFormSection',
    mainRegCount:'mainRegCount',
    testRegCount:'testRegCount'
  }
  chartType = 1;
  //Line Chart
  lineChartData: ChartDataSets[] ;
  lineChartLabels: Label[] ;
  lineChartOptions = {};
  lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(39, 187, 245, 0.8)',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';
  // pieChartType = 'pie';

  //Bar Char
  barChartOptions: ChartOptions = {
    //responsive: true,
  };
  barChartLabels: Label[] ;//= ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
  barChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  barChartData: ChartDataSets[] ;
  //= [
   // { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits' }
  //];
//pie chart
public pieChartOptions: ChartOptions = {
  responsive: true,
};
pieChartLabels: Label[] ;//= [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
pieChartData = [];//[300, 500, 100];
pieChartType = 'pie';
pieChartLegend = true;
pieChartPlugins = [];
//
  //Excel download
  excel = [];

  constructor(
    private calendar: NgbCalendar, public formatter: NgbDateParserFormatter,
    private bussinesSuite: BusinessSuiteService,
    private lookupService: LookupService,
    private spinner : NgxSpinnerService,    
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private testProfileService: TestProfileService
    ) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 0);
  }

  ngOnInit(): void {
    this.searchBranchWiseRegistrationCount();
    this.getBranches();
    this.getSubSection();
    this.getTestProfile();
    
  }

  // Date Picker Logic Start   
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  //Date Picker Logic End
//Bussiness Suit Logic 


  searchBranchWiseRegistrationCount(){  
    this.spinner.show(this.spinnerRefs.mainRegCount);
    
    let groupName 
    groupName = this.arrGroupBy.filter( val =>  val.id == this.groupBy)[0].title
    // let groupByName = d[0].title
    
    this.lineChartOptions = {
      responsive: true,
      scales: {
        yAxes: [
         {
          display: true,
          scaleLabel: {
           display: true,
           labelString: "Number of Registrations",
          },
         },
        ],
        xAxes: [
         {
          scaleLabel: {
           display: true,
           labelString: groupName,
          },
         },
        ],
       },
    };  

    if (this.branchIds.length == 0){
      this.locIDs = '-1';
    }
    else {
      this.locIDs = this.branchIds.join(',');
    }
    
    console.log("this.locIDs",this.branchIds);
    // this.spinner.show(this.spinnerRefs.regStatListSection);
    
    this.regCountList =[];
    // let formValues = this.formSearchJob.getRawValue();
    const objParm = {
      DateFrom: Conversions.formatDateObject(this.fromDate)  ,
      DateTo:  Conversions.formatDateObject(this.toDate),
      GroupBy:  this.groupBy,
      LocIDs: this.locIDs
    }
    console.log("date obje",objParm,this.fromDate);
    this.bussinesSuite.getBranchWiseVisitCountAnalytics(objParm).subscribe((res:any)=>{
      this.regCountList = [];
      const resRegCount = res.PayLoad || [];
     
      if(resRegCount.length && res.StatusCode==200){
        this.regCountList = resRegCount||[];
        this.regCountList.forEach((element, index) => {
          this.regCountList[index].BranchName = (element.BranchName || '').replace('Islamabad Diagnostic Centre', 'IDC ').replace('Islamabad Diagnostic Center', 'IDC ');
        });
      }

      this.spinner.hide(this.spinnerRefs.mainRegCount);
      // console.log("RegCount List",this.regCountList)
    },(err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.mainRegCount);
      // this.toastr.error('Connection error');
    })
    // this.spinner.hide(this.spinnerRefs.regStatListSection);
    
      
    
   
    
  }

  getBranches() {
    this.branchesList = [];
    // this.spinner.show('GetBranches');
    this.lookupService.GetBranches().subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;
      _response.forEach((element, index) => {
        _response[index].Title = (element.Title || '').replace('Islamabad Diagnostic Centre', 'IDC ');
      });
      this.branchesList = _response;
      
      //this.selectedBranch = 0;
      // setTimeout(() => {
      //   //this.selectedBranch = this.loggedInUser.locationid;
      //   this.notificationConfiForm.patchValue({
      //     branchIds: [this.loggedInUser.locationid]
      //   });
      // }, 100);
    }, (err) => {
      // this.spinner.hide('GetBranches');
    })
  }
 
  getSubSection() {
    
    this.subSectionList = [];
    const objParm = {
      SectionID: -1,
      LabDeptID: this.labDeptID
    }    
    // this.spinner.show('GetBranches');
    this.lookupService.GetSubSectionBySectionID(objParm).subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;
     
      this.subSectionList = _response;
      
    }, (err) => {
      
    })
  }

  getTestProfile() {
    const subSectIDs = this.subSectionIDs.join(",");
    this.testProfileList = [];
    const objParm = {
      TPID: null,
      TestProfileCode: null,
      TestProfileName: null,
      SubSectionID: subSectIDs ? subSectIDs: null ,
      LabDeptID: this.labDeptID
    }    
    console.log("objParm =",objParm);
    // this.spinner.show('GetBranches');
    this.testProfileService.getTestsProfileForAnalytics(objParm).subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;
     
      this.testProfileList = _response;
      // console.log("Test Profile List",this.testProfileList);
    }, (err) => {
      
    })
  }

  onSelectAllBranches() {
    
      this.branchIds = this.branchesList.map(a => a.LocId)
    
  }
  onSelectAllSubSections() {
    
    this.subSectionIDs = this.subSectionList.map(a => a.SubSectionId)
    this.getTestProfile();
}
  onUnselectAllBranches() {
    this.branchIds = []
    // this.notificationConfiForm.get('formbranchIds').patchValue([]);
    this.getTestProfile();
  }

  onUnselectAllSubSections() {
    this.subSectionIDs = []
    // this.notificationConfiForm.get('formbranchIds').patchValue([]);
  }
  onUnselectAllTestProfile() {
    this.testProfileIDs = []
    // this.notificationConfiForm.get('formbranchIds').patchValue([]);
  }
  onSelectAllTestProfile() {
    
    this.testProfileIDs = this.testProfileList.map(a => a.TPID)
  
}

  showTestWiseRegCount(rowSelect:any){
    // this.getJobRequestByID(reqID);
    this.subSectionIDs = [];
    this.testProfileIDs = [];
    this.labDeptID = null;
    const locID = rowSelect.LocID;
    const vTPIDs = [];
    const vLabDeptID = -1;
    const vSubSectionIDs = [];
    
    this.branchName = rowSelect.BranchName;

    this.searchTestWiseRegistrationCount(locID,vTPIDs,vLabDeptID,vSubSectionIDs)
    this.appPopupService.openModal(this.testWiseRegCount);    
  }
  
  showSectionWiseRegCount(rowSelect:any){
    // this.getJobRequestByID(reqID);
    this.subSectionIDs = [];
    this.testProfileIDs = [];
    this.labDeptID = null;
    const locID = rowSelect.LocID;
    const vTPIDs = [];
    const vLabDeptID = -1;
    const vSubSectionIDs = [];
    
    this.branchName = rowSelect.BranchName;

    this.searchSectionWiseRegistrationCount(locID,vTPIDs,vLabDeptID,vSubSectionIDs)
    this.appPopupService.openModal(this.testWiseRegCount);    
  }

  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
  }

  
  searchTestWiseRegistrationCount(locID, TPIDs, pLabDeptID,pSubSectionIDs){    
    this.locationID = locID;
    console.log("this.TPIDs",TPIDs);
    this.spinner.show(this.spinnerRefs.testRegCount);
    
    this.testRegCountList =[];
    // let formValues = this.formSearchJob.getRawValue();
    const objParm = {
      DateFrom: Conversions.formatDateObject(this.fromDate)  ,
      DateTo:  Conversions.formatDateObject(this.toDate),
      GroupBy:  this.groupBy,
      LocIDs: locID,
      TPIDs: TPIDs.join(','),
      LabDeptID: pLabDeptID ,
      SubSectionIDs: pSubSectionIDs.join(",")
    }
    console.log("objParm",objParm);
    // console.log("date obje",this.branchIds.join(','));
    this.bussinesSuite.getTPCodeWiseVisitCountAnalyticsByLocID(objParm).subscribe((res:any)=>{
      const resRegCount = res.PayLoad || [];
     
      if(resRegCount.length && res.StatusCode==200){
        this.testRegCountList = resRegCount||[];
      }
      console.log("TestRegCount List",this.testRegCountList)
      this.spinner.hide(this.spinnerRefs.testRegCount);
    },(err) => {
      console.log("loading search result error", err);
    })
    
    
  }
  
  searchSectionWiseRegistrationCount(locID, TPIDs, pLabDeptID,pSubSectionIDs){    
    this.locationID = locID;
    console.log("this.TPIDs",TPIDs);
    this.spinner.show(this.spinnerRefs.testRegCount);
    
    this.testRegCountList =[];
    // let formValues = this.formSearchJob.getRawValue();
    const objParm = {
      DateFrom: Conversions.formatDateObject(this.fromDate)  ,
      DateTo:  Conversions.formatDateObject(this.toDate),
      GroupBy:  this.groupBy,
      LocIDs: locID,
      TPIDs: TPIDs.join(','),
      LabDeptID: pLabDeptID ,
      SubSectionIDs: pSubSectionIDs.join(",")
    }
    console.log("objParm",objParm);
    // console.log("date obje",this.branchIds.join(','));
    this.bussinesSuite.getSectionWiseVisitCountAnalyticsByLocID(objParm).subscribe((res:any)=>{
      const resRegCount = res.PayLoad || [];
     
      if(resRegCount.length && res.StatusCode==200){
        this.testRegCountList = resRegCount||[];
      }
      console.log("SectionRegCount List",this.testRegCountList)
      this.spinner.hide(this.spinnerRefs.testRegCount);
    },(err) => {
      console.log("loading search result error", err);
    })
    
    
  }

  showComparativeChart(){
    // this.getJobRequestByID(reqID);
    
    
    const arGraphData =  JSON.parse(JSON.stringify(this.regCountList)) ;  
    // delete arGraphData.LocID;

    const newData = arGraphData.map( a=> {
      const obja = Object.values(a);
      obja.shift();
      obja.shift();
      const nObj = { data: obja   , label: a.BranchName}
      return nObj;
      })

    // let locID = arGraphData["LocID"];
    // this.branchName = arGraphData["BranchName"];
    let regCountListData = []
    let regCountListLabel = []
    // regCountListData = newData;
    // let regCountListLocID1 = []
    
    
    // delete arGraphData.BranchName;
    // delete arGraphData.TPCode;

    // regCountListData = Object.values(arGraphData);
    
    regCountListLabel = Object.keys(arGraphData[0]);
    regCountListLabel.shift();
    regCountListLabel.shift();
    // regCountListLocID = regCountListLocID.map( val => val.length)
    regCountListData = regCountListData.map(val => {
      return val === null? 0 : val;
    })
    console.log("data row1,",newData);
    console.log("data key",regCountListLabel);
    
    this.lineChartData =  newData;
    // this.lineChartData = [
    //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' },
    //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Product B' }
    // ];
    this.barChartData =  [
      { data: regCountListData, label: 'Registrations' },
    ];
    this.lineChartLabels =  regCountListLabel;
    // this.lineChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    this.barChartLabels =  regCountListLabel;
    // this.searchTestWiseRegistrationCount(locID)
    this.appPopupService.openModal(this.branchWiseRegChart);    

    this.pieChartLabels = this.lineChartLabels
    this.pieChartData = regCountListData
  }
  showBranchWiseRegChart(rowSelect:any){
    // this.getJobRequestByID(reqID);
    if (!rowSelect.length){
      console.log("row  null",rowSelect);
    }
    
    const arGraphData =  JSON.parse(JSON.stringify(rowSelect)) ;   
    const locID = arGraphData["LocID"];
    this.branchName = arGraphData["BranchName"];
    let regCountListData = []
    let regCountListLabel = []
    // let regCountListLocID1 = []
    
    delete arGraphData.LocID;
    delete arGraphData.BranchName;
    delete arGraphData.TPCode;

    regCountListData = Object.values(arGraphData);
    
    regCountListLabel = Object.keys(arGraphData);
    
    // regCountListLocID = regCountListLocID.map( val => val.length)
    regCountListData = regCountListData.map(val => {
      return val === null? 0 : val;
    })
    console.log("data row1,",regCountListData,this.regCountList);
    console.log("data key",regCountListLabel);
    
    this.lineChartData =  [
      { data: regCountListData, label: 'Registrations' },
    ];
    // this.lineChartData = [
    //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' },
    //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Product B' }
    // ];
    this.barChartData =  [
      { data: regCountListData, label: 'Registrations' },
    ];
    this.lineChartLabels =  regCountListLabel;
    // this.lineChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    this.barChartLabels =  regCountListLabel;
    // this.searchTestWiseRegistrationCount(locID)
    this.appPopupService.openModal(this.branchWiseRegChart);    

    this.pieChartLabels = this.lineChartLabels
    this.pieChartData = regCountListData
  }
  changeChart(chartNo){
    console.log("chart no",chartNo);
    this.chartType = chartNo;
  }
  //Download excel
  exportAsXLSX(fileNo):void {  
    console.log("download",fileNo);
    this.excel = [];
    if (fileNo ==2) {
      this.testRegCountList.forEach(row => {  
        this.excel.push(row);  
      });
      this.excelService.exportAsExcelFile(this.excel,'Test Count List', 'sample');
    }
    else
    {
      this.regCountList.forEach(row => {  
        this.excel.push(row);  
      });
      this.excelService.exportAsExcelFile(this.excel,'Registration Count List', 'sample');
    }

    
  
 }

}