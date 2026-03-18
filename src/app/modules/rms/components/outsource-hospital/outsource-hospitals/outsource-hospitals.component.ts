// @ts-nocheck
import { Component, EventEmitter, Input, OnInit,Output,ViewChild  } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { SharedService } from "src/app/modules/shared/services/shared.service";
import { OutsourceHospitalDetailsComponent } from "../../outsource-hospital-details/outsource-hospital-details/outsource-hospital-details.component";

@Component({
  standalone: false,

  selector: "app-outsource-hospitals",
  templateUrl: "./outsource-hospitals.component.html",
  styleUrls: ["./outsource-hospitals.component.scss"],
})

export class OutsourceHospitalsComponent implements OnInit {
  @ViewChild(OutsourceHospitalDetailsComponent) 
  outsourceHospitalDetailsComponent: OutsourceHospitalDetailsComponent;
  
  @Output() outSourceHospitalVal = new EventEmitter<string>();
  Object:any = {};
  
  spinnerRefs = {
    listSection: "listSection",
    logSection: "logSection",
  };
  OutSourceHospitalID: any = null;
  selectedIndex = 0;
  HospitalDetailList = [];
  filteredHospitalDetail = [];
  searchText = "";
  rowIndex = null;
  HospitalNameToShowOnCard: any = "Add New Hospital";
  HospitalDetailExistingRow = [];
  page = 1;
  pageSize = 5;
  collectionSize = 0;
  paginatedSearchResults = [];
  testList = [];
  row : any; 

  constructor(
    private spinner: NgxSpinnerService,
    private sharedservice: SharedService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getHospitalDetail();
  }
  noRecMsg = "Please click any Hospital to view its Detail";

  getHospitalDetail() {
    this.HospitalDetailExistingRow = [];
    let params = {
      OutSourceHospitalID:  null,
    };
    this.spinner.show(this.spinnerRefs.listSection)
    this.sharedservice.getOutSourceHospitalsDetail(params).subscribe(
      (res: any) => {
        this.spinner.hide(this.spinnerRefs.listSection)
        if (res.StatusCode == 200) {
          let dataset = JSON.parse(res.PayLoadStr || "[]");
          this.HospitalDetailExistingRow = dataset["Table"] || [];
          this.HospitalDetailExistingRow=this.HospitalDetailExistingRow.reverse();
          this.refreshPagination();
          console.log(
            "this.HospitalDetailExistingRow",
            this.HospitalDetailExistingRow
          );
          this.OutSourceHospitalID =
            this.HospitalDetailExistingRow["OutSourceHospitalID"];
          this.refreshPagination();
          if (!this.HospitalDetailList.length) {
            this.noRecMsg = "No log found";
          }
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error("Connection error");
        this.spinner.hide(this.spinnerRefs.listSection)
      }
    );
    this.spinner.hide();
  }

  pagination = {
    page: 1,
    pageSize: 10,
    collectionSize: 0,
    filteredSearchResults: [],
    paginatedSearchResults: [],
  };

  refreshPagination() {
    this.pagination.filteredSearchResults = this.HospitalDetailExistingRow;
    let dataToPaginate = this.pagination.filteredSearchResults;
    this.pagination.collectionSize = dataToPaginate.length;
    this.pagination.paginatedSearchResults = dataToPaginate
      .map((item, i) => ({ id: i + 1, ...item }))
      .slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        (this.pagination.page - 1) * this.pagination.pageSize +
          this.pagination.pageSize
      );
  }

  getRow(row: any, i: number) {
    this.Object = row;
    this.rowIndex = i;
    if (this.outsourceHospitalDetailsComponent) {
      this.outsourceHospitalDetailsComponent.loadHospitalDetails(row);
    }
  }

  refreshPag(val){
    console.log('val')
    if(val==1)
    {
      this.getHospitalDetail()
    }
  }
}
