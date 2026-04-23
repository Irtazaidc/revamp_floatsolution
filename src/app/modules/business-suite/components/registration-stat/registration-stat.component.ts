// @ts-nocheck
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbDate, NgbCalendar, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Conversions } from '../../../../modules/shared/helpers/conversions';
import { BusinessSuiteService } from '../../business-suite.service';
import { LookupService } from 'src/app/modules/patient-booking/services/lookup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPopupService } from '../../../../modules/shared/helpers/app-popup.service';
import { TestProfileService } from '../../../../modules/patient-booking/services/test-profile.service'
import { ChartDataSets, ChartOptions } from 'chart.js';

import { ExcelService } from '../../excel.service';
import { title } from 'process';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

type Color = any;
type Label = any;

// import { ChartDataSets, ChartOptions } from 'chart.js';
// import { Color, Label } from 'ng2-charts';


@Component({
  standalone: false,

  selector: 'app-registration-stat',
  templateUrl: './registration-stat.component.html',
  styleUrls: ['./registration-stat.component.scss']
})
export class RegistrationStatComponent implements OnInit {
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
      id: 3, title: 'Week Wise',
    },
    {
      id: 2, title: 'Month Wise',
    }
  ]

  arrFilterBy = [
    {
      id: 1, title: 'Registration count'
    },
    {
      id: 2, title: 'Revenue',
    },
    {
      id: 3, title: 'Test count',
    }
  ]

  testRegCountList = [];
  regCountList = [];
  subSectionList = [];
  testProfileList = [];
  groupBy = 1;
  filterBy = 1;
  groupByName = "Day Wise";
  locIDs = "-1";
  branchName = "";
  labDeptID = -1;
  locationID = -1;
  sortOrder = 1;
  popupHeader = "";

  RegMonths
  monthSums = {};


  _object = Object;
  branchesList = [];
  branchIds = [];
  subSectionIDs = [];
  testProfileIDs = [];
  spinnerRefs = {
    // faqFormSection: 'faqFormSection',
    mainRegCount: 'mainRegCount',
    testRegCount: 'testRegCount'
  }
  chartType = 2;
  //Line Chart
  lineChartData: ChartDataSets[];
  lineChartLabels: Label[];
  lineChartOptions = {};
  lineChartColors: Color[] = [
    {
      borderColor: '#3699FF',
      backgroundColor: 'transparent',
    },
  ];
  lineChartLegend = true;
  lineChartPlugins = [
  ];
  lineChartType = 'line';
  // pieChartType = 'pie';

  //Bar Char
  barChartOptions: ChartOptions = {

  };
  barChartLabels: Label[];//= ['Apple', 'Banana', 'Kiwifruit', 'Blueberry', 'Orange', 'Grapes'];
  barChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];
  barChartColors: Color[] = [
    {
      // borderColor: '',
      backgroundColor: '#e5cb7d',
    },
  ];
  barChartData: ChartDataSets[

  ];
  //= [
  // { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits' }
  //];
  //pie chart
  pieChartOptions: ChartOptions = {
    legend: {
      display: true
    },
    hover: {
      animationDuration: 0
    },
    animation: {
      onComplete: function () {
        const chartInstance = this.chart,
          ctx = chartInstance.ctx;
        ctx.textAlign = "center"; // Center the labels
        ctx.textBaseline = "middle"; // Middle-align the labels
        const centerX = chartInstance.canvas.width / 2; // X-coordinate of the chart center
        const centerY = chartInstance.canvas.height / 2; // Y-coordinate of the chart center
        const radius = chartInstance.innerRadius + (chartInstance.outerRadius - chartInstance.innerRadius) / 2; // Radius for label placement

        this.data.datasets.forEach(function (dataset, i) {
          const meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function (element, index) {
            const angle = element.hidden ? 0 : element._model.startAngle + (element._model.endAngle - element._model.startAngle) / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const data = dataset.data[index];
            ctx.fillStyle = "#000";
            ctx.fillText(data, x, y);
          });
        });
      }
    },
    tooltips: {
      enabled: true
    },
    responsive: true,
  };

  pieChartLabels: Label[];//= [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  pieChartData = [];//[300, 500, 100];
  pieChartType = 'pie';
  pieChartLegend = true;
  pieChartPlugins = [];
  //
  countFrom = 0;
  //Excel download
  excel = [];

  constructor(
    private calendar: NgbCalendar, public formatter: NgbDateParserFormatter,
    private bussinesSuite: BusinessSuiteService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private appPopupService: AppPopupService,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private testProfileService: TestProfileService,
    private toastr: ToastrService
  ) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 0);
  }

  ngOnInit(): void {
    this.searchBranchWiseRegistrationCount();
    this.getBranches();
    this.getSubSection();
    this.getTestProfile();
    console.log("start regCountList", this.regCountList.length);
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
  showComparativeChart() {
    // this.getJobRequestByID(reqID);
    if (this.chartType != 2) {
      this.chartType = 2;
    }
    this.branchName = "- Comparative Graph";
    const filterBranches = this.regCountList.filter(aa => aa.isBranchSelected)
    console.log("length chart branch", filterBranches.length, filterBranches);
    if (filterBranches.length == 0) {
      this.toastr.show("No Branch Selected");
    }
    else
      if (filterBranches.length > 5) {
        this.toastr.show("Maximum 5 Branches allowed for Comparative Graph");
        return;
      }

    let arGraphData = JSON.parse(JSON.stringify(filterBranches));

    const newData = arGraphData.map(a => {
      const obja = Object.values(a);
      obja.shift();
      obja.shift();
      const nObj = { data: obja, label: a.BranchName }
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
    arGraphData = arGraphData.map(aa => {
      const newObj = aa
      delete newObj.isBranchSelected;
      return newObj;
    })

    console.log("arGraphData,", arGraphData);
    regCountListLabel = Object.keys(arGraphData[0]);
    regCountListLabel.shift();
    regCountListLabel.shift();
    // regCountListLocID = regCountListLocID.map( val => val.length)
    regCountListData = regCountListData.map(val => {
      return val === null ? 0 : val;
    })
    console.log("data row1,", newData);
    console.log("data key", regCountListLabel);

    this.lineChartData = newData;
    // this.lineChartData = [
    //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' },
    //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Product B' }
    // ];
    this.barChartData = newData;
    this.lineChartLabels = regCountListLabel;
    // this.lineChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    this.barChartLabels = regCountListLabel;
    // this.searchTestWiseRegistrationCount(locID)
    this.appPopupService.openModal(this.branchWiseRegChart);

    this.pieChartLabels = this.lineChartLabels
    this.pieChartData = regCountListData
  }

  showComparativeChartST() {
    // this.getJobRequestByID(reqID);
    if (this.chartType != 2) {
      this.chartType = 2;
    }
    this.branchName = "- Comparative Graph";
    const filterSectionTest = this.testRegCountList.filter(aa => aa.isTSSelected)
    // let filterSectionTest1 =  JSON.parse(JSON.stringify(filterSectionTest)) ;
    filterSectionTest.map(v => {
      delete v.isTSSelected;
    });

    // console.log("length chart Section Test1", filterSectionTest.length,filterSectionTest);
    if (filterSectionTest.length == 0) {
      this.toastr.show("No Section Test Selected");
      return;
    }
    else
      if (filterSectionTest.length > 15) {
        this.toastr.show("Maximum 15 Section/Tests allowed for Comparative Graph");
        return;
      }

    let arGraphData = JSON.parse(JSON.stringify(filterSectionTest));
    // console.log("length chart Section arGraphData", arGraphData);
    const newData = arGraphData.map(a => {
      const obja = Object.values(a);
      // console.log("length chart Section obja", obja);
      obja.shift();
      // obja.shift();
      const nObj = { data: obja, label: a.Section || a.TPCode }
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
    arGraphData = arGraphData.map(aa => {
      const newObj = aa
      delete newObj.isBranchSelected;
      return newObj;
    })

    // console.log("arGraphData,",arGraphData);
    regCountListLabel = Object.keys(arGraphData[0]);
    regCountListLabel.shift();
    // regCountListLabel.shift();
    // regCountListLocID = regCountListLocID.map( val => val.length)
    regCountListData = regCountListData.map(val => {
      return val === null ? 0 : val;
    })
    // console.log("data row1,",newData);
    // console.log("data key",regCountListLabel);

    this.lineChartData = newData;
    // this.lineChartData = [
    //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Product A' },
    //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Product B' }
    // ];
    this.barChartData = newData;
    this.lineChartLabels = regCountListLabel;
    // this.lineChartLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    this.barChartLabels = regCountListLabel;
    // this.searchTestWiseRegistrationCount(locID)
    this.appPopupService.openModal(this.branchWiseRegChart);

    this.pieChartLabels = this.lineChartLabels
    this.pieChartData = regCountListData
  }

  searchBranchWiseRegistrationCount() {

    const a = moment(this.fromDate);
    const b = moment(this.toDate);
    const totalYear = b.diff(a, 'years');
    const c = a.add(totalYear, 'year');
    const totalD = b.diff(c, 'd');
    console.log("totalYear", totalYear, c, totalD);
    if (totalYear >= 1) {
      if (totalD > 0) {
        this.toastr.show("Date range must be less than 1 Year.");
        return;
      }

    }
    this.spinner.show(this.spinnerRefs.mainRegCount);
    console.log("date moment", totalYear);
    // console.log("date moment",b.diff(a, 'years'), this.fromDate);
    let groupName
    groupName = this.arrGroupBy.filter(val => val.id == this.groupBy)[0].title
    // let groupByName = d[0].title

    // this.lineChartOptions = {
    //   legend: {
    //     display: false,
    //   },
    //   hover: {
    //     animationDuration: 0
    //   },
    //   animation: {
    //     onComplete: function() {
    //       const chartInstance = this.chart,
    //         ctx = chartInstance.ctx;
    //       ctx.textAlign = "center";
    //       ctx.textBaseline = "middle";
    //       this.data.datasets.forEach(function(dataset, i) {
    //         const meta = chartInstance.controller.getDatasetMeta(i);
    //         meta.data.forEach(function(bar, index) {
    //           const data = dataset.data[index];
    //           ctx.fillStyle = "#000";
    //           ctx.fillText(data, bar._model.x, bar._model.y - 2);
    //         });
    //       });
    //     }
    //   },
    //   tooltips: {
    //     enabled: true
    //   },
    //   responsive: true,
    //   scales: {
    //     yAxes: [
    //      {
    //       display: true,
    //       scaleLabel: {
    //        display: true,
    //        labelString: "Number of Registrations",
    //       },
    //       ticks: {
    //         beginAtZero: true,
    //         stepSize: 30, 
    //       }
    //      },
    //     ],
    //     xAxes: [
    //      {
    //       scaleLabel: {
    //        display: true,
    //        labelString: groupName,
    //       },
    //      },
    //     ],
    //    },
    // };  


    // this.barChartOptions = {
    //   legend: {
    //     display: false
    //   },
    //   hover: {
    //     animationDuration: 0
    //   },
    //   animation: {
    //     onComplete: function() {
    //       const chartInstance = this.chart,
    //         ctx = chartInstance.ctx;
    //       ctx.textAlign = "center";
    //       ctx.textBaseline = "middle";
    //       this.data.datasets.forEach(function(dataset, i) {
    //         const meta = chartInstance.controller.getDatasetMeta(i);
    //         meta.data.forEach(function(bar, index) {
    //           const data = dataset.data[index];
    //           ctx.fillStyle = "#000";
    //           ctx.fillText(data, bar._model.x, bar._model.y - 2);
    //         });
    //       });
    //     }
    //   },
    //   tooltips: {
    //     enabled: true
    //   },
    //   responsive: true,
    //   scales: {
    //     yAxes: [
    //      {
    //       display: true,
    //       scaleLabel: {
    //        display: true,
    //        labelString: "Number of Registrations",
    //       },
    //       ticks: {
    //         beginAtZero: true,
    //         stepSize: 30, 
    //       }
    //      },

    //     ],
    //     xAxes: [
    //      {
    //       display: true,
    //       scaleLabel: {
    //        display: true,
    //        labelString: groupName,
    //       },
    //      },
    //     ],
    //    },
    // };  
    this.lineChartOptions = {
      legend: {
        display: false,
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function () {
          const chartInstance = this.chart,
            ctx = chartInstance.ctx;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          this.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              ctx.fillStyle = "#000";
              const label = dataset.label.split('-')[0];
              ctx.fillText(data, bar._model.x, bar._model.y - 12);
              ctx.fillText(label, bar._model.x, bar._model.y - 24);
            });
          });
        }
      },
      tooltips: {
        enabled: true
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Number of Registrations",
            },
            ticks: {
              beginAtZero: true,
              stepSize: 30,
            }
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
    this.barChartOptions = {
      legend: {
        display: false
      },
      hover: {
        animationDuration: 0
      },
      animation: {
        onComplete: function () {
          const chartInstance = this.chart,
            ctx = chartInstance.ctx;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          this.data.datasets.forEach(function (dataset, i) {
            const meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
              const data = dataset.data[index];
              const label = dataset.label.split('-')[0];
              ctx.fillText(data, bar._model.x, bar._model.y - 12);
              ctx.fillText(label, bar._model.x, bar._model.y - 24);
            });
          });
        }
      },

      tooltips: {
        enabled: true
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: "Number of Registrations",
            },
            ticks: {
              beginAtZero: true,
              stepSize: 30,
            }
          },

        ],
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: groupName,
            },
          },
        ],
      },
    };

    if (this.branchIds.length == 0) {
      this.locIDs = '-1';
    }
    else {
      this.locIDs = this.branchIds.join(',');
    }

    console.log("this.locIDs", this.branchIds);
    // this.spinner.show(this.spinnerRefs.regStatListSection);

    this.regCountList = [];

    // let formValues = this.formSearchJob.getRawValue();
    const objParm = {
      DateFrom: Conversions.formatDateObject(this.fromDate),
      DateTo: Conversions.formatDateObject(this.toDate),
      GroupBy: this.groupBy,
      LocIDs: this.locIDs,
      TPIDs: this.testProfileIDs.join(","),
      SubSectionIDs: this.subSectionIDs.join(","),
      FilterBy: this.filterBy,
      LabDeptID: this.labDeptID
    }
    console.log("date obje", objParm, this.fromDate);
    this.bussinesSuite.getBranchWiseVisitCountAnalytics(objParm).subscribe((res: any) => {
      this.regCountList = [];
      const resRegCount = res.PayLoad || [];
      this.RegMonths = Object.keys(resRegCount[0]).filter(key => key !== 'LocID' && key !== 'BranchName' && key !== 'isBranchSelected');
      this.RegMonths.forEach(month => {
        const sum = resRegCount.reduce((acc, branch) => {
          const count = branch[month] || 0;
          return acc + count;
        }, 0);
        this.monthSums[month] = sum;
      });
      console.log("resRegCount: monthSums", resRegCount, this.monthSums)
      if (resRegCount.length && res.StatusCode == 200) {
        if (this.filterBy == 3) {
          this.regCountList = resRegCount || [];

          // console.log(" regCountList:", this.regCountList)

          this.regCountList.forEach((element, index) => {
            this.regCountList[index].BranchName = (element.TPCode || '').replace('Islamabad Diagnostic Centre', 'IDC ').replace('Islamabad Diagnostic Center', 'IDC ');
            this.regCountList[index].isBranchSelected = false;
            this.regCountList[index].LocID = 100;

            delete this.regCountList[index].TPCode;

          });
        }
        else {
          this.regCountList = resRegCount || [];
          this.regCountList.forEach((element, index) => {
            this.regCountList[index].BranchName = (element.BranchName || '').replace('Islamabad Diagnostic Centre', 'IDC ').replace('Islamabad Diagnostic Center', 'IDC ');
            this.regCountList[index].isBranchSelected = false;
          });
        }


      }
      console.log("regCountList", this.regCountList);
      this.spinner.hide(this.spinnerRefs.mainRegCount);
      // console.log("RegCount List",this.regCountList)
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.mainRegCount);
      this.toastr.error('Connection error');
    })
    // this.spinner.hide(this.spinnerRefs.regStatListSection);





  }
  monthSum
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

      this.toastr.error('Connection error');
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

      this.toastr.error('Connection error');
    })
  }

  getTestProfile() {
    const subSectIDs = this.subSectionIDs.join(",");
    this.testProfileList = [];
    const objParm = {
      TPID: null,
      TestProfileCode: null,
      TestProfileName: null,
      SubSectionID: subSectIDs ? subSectIDs : null,
      LabDeptID: this.labDeptID
    }
    console.log("objParm =", objParm);
    // this.spinner.show('GetBranches');
    this.testProfileService.getTestsProfileForAnalytics(objParm).subscribe((resp: any) => {
      // this.spinner.hide('GetBranches');
      const _response = resp.PayLoad;

      this.testProfileList = _response;
      // console.log("Test Profile List",this.testProfileList);
    }, (err) => {

      this.toastr.error('Connection error');
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

  showSectionWiseRegCount(rowSelect: any) {
    // this.getJobRequestByID(reqID);
    this.countFrom = 2;
    // this.subSectionIDs = [];
    // this.testProfileIDs = [];
    this.labDeptID = null;
    const locID = rowSelect.LocID;
    const vTPIDs = this.testProfileIDs;
    const vLabDeptID = -1;
    const vSubSectionIDs = this.subSectionIDs;

    this.branchName = "for " + rowSelect.BranchName;

    this.searchSectionWiseRegistrationCount(locID, vTPIDs, vLabDeptID, vSubSectionIDs)
    this.popupHeader = "Section"
    this.appPopupService.openModal(this.testWiseRegCount);
  }

  showTestWiseRegCount(rowSelect: any) {
    // this.getJobRequestByID(reqID);
    this.countFrom = 1;
    this.subSectionIDs = [];
    // this.testProfileIDs = [];
    this.labDeptID = null;
    const locID = rowSelect.LocID;
    const vTPIDs = this.testProfileIDs;
    const vLabDeptID = -1;
    const vSubSectionIDs = [];

    this.branchName = "for " + rowSelect.BranchName;

    this.searchTestWiseRegistrationCount(locID, vTPIDs, vLabDeptID, vSubSectionIDs)
    this.popupHeader = "Test";
    this.appPopupService.openModal(this.testWiseRegCount);
  }

  closeLoginModal() {
    this.modalService.dismissAll();
    this.spinner.hide();
    this.popupHeader = 'Branch';
  }

  searchRegistrationCount(locID, TPIDs, pLabDeptID, pSubSectionIDs) {

    if (this.countFrom == 1) {
      this.searchTestWiseRegistrationCount(locID, TPIDs, pLabDeptID, pSubSectionIDs);
    }
    else
      if (this.countFrom == 2) {
        this.searchSectionWiseRegistrationCount(locID, TPIDs, pLabDeptID, pSubSectionIDs);
      }
  }

  sortByHeader(tHeader) {
    const newRegCountList = this.regCountList;
    console.log("not sort Header", this.regCountList);
    if (this.sortOrder == 1) {
      if (tHeader == "BranchName") {

        newRegCountList.sort(function (a, b) {

          if (a[tHeader].toString().toLowerCase() < b[tHeader].toString().toLowerCase()) {
            return -1;
          }
          if (a[tHeader].toString().toLowerCase() > b[tHeader].toString().toLowerCase()) {
            return 1;
          }
          return 0;
        }); //people is now sorted by Branch name from a-z
      }
      else {
        newRegCountList.sort(function (a, b) {
          console.log("after sort Header", newRegCountList);
          return a[tHeader] - b[tHeader]

        }); // Sort youngest first
      }
      this.sortOrder = 2;
    }
    else {
      if (tHeader == "BranchName") {

        newRegCountList.sort(function (a, b) {

          if (a[tHeader].toString().toLowerCase() < b[tHeader].toString().toLowerCase()) {
            return 1;
          }
          if (a[tHeader].toString().toLowerCase() > b[tHeader].toString().toLowerCase()) {
            return -1;
          }
          return 0;
        }); //people is now sorted by first name from a-z
      }
      else {
        newRegCountList.sort(function (a, b) {
          console.log("after sort Header", newRegCountList);
          return b[tHeader] - a[tHeader]

        }); // Sort youngest first
      }
      this.sortOrder = 1;
    }



  }

  searchSectionWiseRegistrationCount(locID, TPIDs, pLabDeptID, pSubSectionIDs) {

    this.locationID = locID;
    console.log("this.TPIDs", TPIDs);
    this.spinner.show(this.spinnerRefs.testRegCount);

    this.testRegCountList = [];
    // let formValues = this.formSearchJob.getRawValue();
    const objParm = {
      DateFrom: Conversions.formatDateObject(this.fromDate),
      DateTo: Conversions.formatDateObject(this.toDate),
      GroupBy: this.groupBy,
      LocIDs: locID,
      TPIDs: TPIDs.join(','),
      LabDeptID: pLabDeptID,
      SubSectionIDs: pSubSectionIDs.join(","),
      FilterBy: this.filterBy
    }
    console.log("objParm", objParm);
    // console.log("date obje",this.branchIds.join(','));
    this.bussinesSuite.getSectionWiseVisitCountAnalyticsByLocID(objParm).subscribe((res: any) => {
      const resRegCount = res.PayLoad || [];

      if (resRegCount.length && res.StatusCode == 200) {
        this.testRegCountList = resRegCount || [];
      }
      console.log("SectionRegCount List", this.testRegCountList)
      this.spinner.hide(this.spinnerRefs.testRegCount);
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.testRegCount);
      this.toastr.error('Connection error');
    })


  }

  searchTestWiseRegistrationCount(locID, TPIDs, pLabDeptID, pSubSectionIDs) {
    this.locationID = locID;
    console.log("this.TPIDs", TPIDs);
    this.spinner.show(this.spinnerRefs.testRegCount);

    this.testRegCountList = [];
    // let formValues = this.formSearchJob.getRawValue();
    const objParm = {
      DateFrom: Conversions.formatDateObject(this.fromDate),
      DateTo: Conversions.formatDateObject(this.toDate),
      GroupBy: this.groupBy,
      LocIDs: locID,
      TPIDs: TPIDs.join(','),
      LabDeptID: pLabDeptID,
      SubSectionIDs: pSubSectionIDs.join(","),
      FilterBy: this.filterBy
    }
    console.log("objParm", objParm);
    // console.log("date obje",this.branchIds.join(','));
    this.bussinesSuite.getTPCodeWiseVisitCountAnalyticsByLocID(objParm).subscribe((res: any) => {
      const resRegCount = res.PayLoad || [];

      if (resRegCount.length && res.StatusCode == 200) {
        this.testRegCountList = resRegCount || [];
      }
      console.log("TestRegCount List", this.testRegCountList)
      this.spinner.hide(this.spinnerRefs.testRegCount);
    }, (err) => {
      console.log("loading search result error", err);
      this.spinner.hide(this.spinnerRefs.testRegCount);
      this.toastr.error('Connection error');
    })


  }

  showBranchWiseRegChart(rowSelect: any) {
    // this.getJobRequestByID(reqID);
    if (this.chartType != 2) {
      this.chartType = 2;
    }

    const arGraphData = JSON.parse(JSON.stringify(rowSelect));
    if (arGraphData["LocID"]) {
      const locID = arGraphData["LocID"];
      const arLocation = this.branchesList.filter(aa => aa.LocId == locID)

      this.branchName = "for " + arLocation[0]["Title"];
    }


    let regCountListData = []
    let regCountListLabel = []
    // let regCountListLocID1 = []

    delete arGraphData.LocID;
    delete arGraphData.BranchName;
    delete arGraphData.TPCode;
    delete arGraphData.Section;
    delete arGraphData.isBranchSelected;
    delete arGraphData.isTSSelected;

    regCountListData = Object.values(arGraphData);
    regCountListLabel = Object.keys(arGraphData);
    // regCountListLocID = regCountListLocID.map( val => val.length)
    regCountListData = regCountListData.map(val => {
      return val === null ? 0 : val;
    })

    console.log("data key1", regCountListLabel);

    this.lineChartData = [
      { data: regCountListData, label: 'Registrations' },
    ];

    this.barChartData = [
      {
        data: regCountListData,
        label: 'Registrations',
        borderWidth: 2,
      },
    ];
    this.lineChartLabels = regCountListLabel;
    this.barChartLabels = regCountListLabel;
    // this.searchTestWiseRegistrationCount(locID)
    this.appPopupService.openModal(this.branchWiseRegChart);

    this.pieChartLabels = this.lineChartLabels
    this.pieChartData = regCountListData
  }
  changeChart(chartNo) {
    console.log("chart no", chartNo);
    this.chartType = chartNo;
  }
  //Download excel
  exportAsXLSX(fileNo): void {
    console.log("download", fileNo);
    this.excel = [];
    if (fileNo == 2) {
      this.testRegCountList.forEach(row => {
        this.excel.push(row);
      });
      this.excel = this.excel.map(aa => {
        const objD = aa;
        delete objD.isBranchSelected;
        return objD;
      })
      console.log("excel", this.excel);
      this.excelService.exportAsExcelFile(this.excel,'Test Count List', 'sample');
    }
    else {
      this.regCountList.forEach(row => {
        this.excel.push(row);
      });
      this.excel = this.excel.map(aa => {
        const objD = aa;
        delete objD.isBranchSelected;
        return objD;
      })
      console.log("excel", this.excel);
      this.excelService.exportAsExcelFile(this.excel, 'Registration Count List', 'sample');
    }
  }
  exportChart(chartType) {
    const canvas: HTMLCanvasElement = document.querySelector('canvas'); // Get the original canvas element
    const tempCanvas = document.createElement('canvas'); // Create a temporary canvas element
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d'); // Get the 2D context of the temporary canvas
    tempCtx.fillStyle = 'white'; // Set white background
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); // Fill with white background
    tempCtx.drawImage(canvas, 0, 0); // Draw the original chart onto the temporary canvas
    const dataURL = tempCanvas.toDataURL('image/png'); // Convert temporary canvas to data URL
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'chart.png';
    link.click();
  }

}
