// @ts-nocheck
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { HcDashboardService } from '../../services/hc-dashboard.service';
import moment from 'moment';

@Component({
  standalone: false,

  selector: 'app-online-hc-requests',
  templateUrl: './online-hc-requests.component.html',
  styleUrls: ['./online-hc-requests.component.scss']
})
export class OnlineHcRequestsComponent implements OnInit {
  SelOnlineBookkings: any[];
  SelBookingData: any[];
  HCOnlineRequestList: any = [];
  HCRequestList: any = [];
  HCUrgentRequestList: any;
  HCRadioSrvList: any;

  constructor(private spinner: NgxSpinnerService, private formBuilder: FormBuilder,
    private HCService: HcDashboardService,
  ) { }

  ngOnInit(): void {
    this.OnlineHCRequests();
  }
  OnlineHCRequests() {
    this.SelOnlineBookkings = [];
    this.SelBookingData = [];

    let params = {

    }
    // this.spinner.show(this.spinnerRep.fileterspinner);

    this.HCService.GetHCRequestsOnline(params).subscribe((resp: any) => {
      resp.PayLoad.map(a => a.isSelected = false);
      // resp.PayLoad.map(a => a.commaseptpIds = a.TPIDS).join(',');
      this.OnlineFormatHCRequestsData(resp);
    }, (err) => {
      console.log(" while getting Requests", err)
    });


  }
  OnlineFormatHCRequestsData(resp) {
    const result = resp.PayLoad.reduce((acc, d) => {
      const found = acc.find(a => a.BookingPatientID === d.BookingPatientID);
      const value = {
        TPName: d.TPName,
        TPCode: d.TPCode,
        TestTubeColor: d.TestTubeColor,
        SampleQuantity: d.SampleQuantity,
        Protocol: d.Protocol,
        VisitNo: d.PIN,
        BookingSourceID: d.BookingSourceID,
        BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A'
      };
      if (!found) {
        acc.push({
          HCCityName: d.HCCityName,
          HCCityCode: d.HCCityCode,
          BookingSourceID: d.BookingSourceID,
          RiderDeviceToken: d.RiderDeviceToken,
          BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedBy: d.BookingCompletedBy,
          BookingCompletedRemarks: d.BookingCompletedRemarks,
          SampleSubBranchTitle: d.SampleSubBranchTitle,
          SampleSubEmpName: d.SampleSubEmpName,
          NetAmount: d.NetAmount,
          GrossAmount: d.GrossAmount,
          DiscountPerc: d.DiscountPerc,
          RiderID: d.RiderID,
          BookingCanceledBy: d.BookingCanceledBy,
          BookingCanceledAt: d.BookingCanceledAt,
          PatientFullName: d.PatientFullName,
          RiderEmail: d.RiderEMail,
          PatientMobileNumber: d.PatientMobileNO,
          PatientMobileOperatorID: d.PatientMobileOperatorID,
          BookingAssignedByEmpName: d.BookingAssignedByEmpName,
          BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          isUrgentBooking: d.isUrgentBooking,
          BookedByEmpName: d.BookedByEmpName,
          RiderName: d.RiderName,
          RiderLatitude: d.RiderLatitude,
          RiderLongitude: d.RiderLongitude,
          RiderCell: d.RiderCell ? d.RiderCell.replaceAll('-', '') : d.RiderCell,
          HCDateTime: d.HCDateTime ? moment(d.HCDateTime).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          HCBookingStatusID: d.HCBookingStatusID,
          HCBookingStatus: d.HCBookingStatus,
          BookingPatientID: d.BookingPatientID,
          PatientEmailAddress: d.PatientEmailAddress,
          FirstName: d.FirstName,
          Gender: d.Gender,
          GoogleAddressName: d.GoogleAddressName,
          HCRequestID: d.HCRequestID,
          Latitude: d.Latitude,
          Longitude: d.Longitude,
          MobileNO: d.MobileNO,
          PatientAddress: d.PatientAddress,
          BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
          BookingCanceledRemarks: d.BookingCanceledRemarks,
          VisitNo: d.PIN,
          TPDetail: [value],
          HCCityID: d.HCCityID,
          IsHCRadioSrv: d.IsHCRadioSrv,
          BookingSlot: d.BookingSlot
        });
      }
      else {
        found.TPDetail.push(value);
      };
      return acc;
    }, []);
    result.forEach((a, i) => {
      let _obj = JSON.parse(JSON.stringify(a));
      _obj.CSTP = _obj.TPDetail.map(a => { return a.TPName }).join(',');
      result[i].CM = _obj.TPDetail.map(a => { return a.TPName }).join(',');
      result[i].tpCodes = _obj.TPDetail.map(a => { return a.TPCode }).join(',');

    });

    this.HCOnlineRequestList = result.filter(a => {
      return ((a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID == 7)
    }
    ).map(a => ({ ...a, "SelRiderName": "" }));

    this.HCRequestList = result.filter(a => {
      return (a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID != 7
    }).map(a => ({ ...a, "SelRiderName": "" }));; //resp.PayLoad.filter(a => { return a.HCBookingStatusID == 1 || a.HCBookingStatusID == 2 }).map(a => ({ ...a, "SelRiderName": "" }));
    this.HCRequestList = this.HCRequestList.map(a => ({ ...a, "chatNoticount": 0 }));
    console.log("this.HCRequestList", this.HCRequestList);
    this.HCRequestList.map(a => { a.TPDetail.map(b => { }) })
    this.HCUrgentRequestList = this.HCRequestList.filter(a => { return a.isUrgentBooking == 1 });

    // this.HCCancelledRequestList = result.filter(a => { return a.HCBookingStatusID == 16 });

    this.HCRadioSrvList = result.filter(a => {
      return (a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID != 7 && a.IsHCRadioSrv == 1
    }).map(a => ({ ...a, "SelRiderName": "" }));

    const InProgressPreFormatedData = resp.PayLoad.reduce((acc, d) => {
      const found = acc.find(a => a.HCRequestID === d.HCRequestID);

      const value = {
        HCCityName: d.HCCityName,
        HCCityCode: d.HCCityCode,
        RiderDeviceToken: d.RiderDeviceToken,
        BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
        PatientEmailAddress: d.PatientEmailAddress,
        RiderID: d.RiderID,
        PatientAddress: d.PatientAddress,
        PatientMobileNumber: d.PatientMobileNO,
        PatientMobileOperatorID: d.PatientMobileOperatorID,
        PatientFullName: d.PatientFullName,
        BookedByEmpName: d.BookedByEmpName,
        BookingPatientID: d.BookingPatientID,
        TPName: d.TPName,
        PatientName: d.FirstName + " " + d.LastName,
        SampleType: d.SampleType,
        Latitude: d.Latitude,
        Longitude: d.Longitude,
        BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
        BookingCompletedBy: d.BookingCompletedBy,
        BookingCompletedRemarks: d.BookingCompletedRemarks,
        BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
        SampleSubBranchTitle: d.SampleSubBranchTitle,
        SampleSubEmpName: d.SampleSubEmpName,
        NetAmount: d.NetAmount,
        GrossAmount: d.GrossAmount,
        DiscountPerc: d.DiscountPerc,
        BookingAssignedByEmpName: d.BookingAssignedByEmpName,
        BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
        BookingCanceledBy: d.BookingCanceledBy,
        BookingCanceledAt: d.BookingCanceledAt,
        BookingCanceledRemarks: d.BookingCanceledRemarks,
        VisitNo: d.PIN,
        IsHCRadioSrv: d.IsHCRadioSrv
      };
      if (!found) {
        acc.push({
          HCCityID: d.HCCityID,
          HCCityName: d.HCCityName,
          HCCityCode: d.HCCityCode,
          RiderDeviceToken: d.RiderDeviceToken,
          BookingInitiatedAt: d.BookingInitiatedAt ? moment(d.BookingInitiatedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          RiderID: d.RiderID,
          BookingPatientID: d.BookingPatientID,
          BookedByEmpName: d.BookedByEmpName,
          PatientEmailAddress: d.PatientEmailAddress,
          PatientMobileNumber: d.PatientMobileNO,
          PatientMobileOperatorID: d.PatientMobileOperatorID,
          PatientFullName: d.PatientFullName,
          PatientName: d.FirstName + " " + d.LastName,
          RiderName: d.RiderName,
          RiderCell: d.RiderCell ? d.RiderCell.replaceAll('-', '') : d.RiderCell,
          HCDateTime: d.HCDateTime ? moment(d.HCDateTime).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          HCRequestID: d.HCRequestID,
          HCBookingStatusID: d.HCBookingStatusID,
          Latitude: d.Latitude,
          Longitude: d.Longitude,
          HCBookingStatus: d.HCBookingStatus,
          RiderLatitude: d.RiderLatitude,
          RiderLongitude: d.RiderLongitude,
          bookingDetail: [value],
          BookingCompletedAt: d.BookingCompletedAt ? moment(d.BookingCompletedAt).format('D MMM YYYY h:mm:ss a') : 'N/A',
          BookingCompletedBy: d.BookingCompletedBy,
          BookingCompletedRemarks: d.BookingCompletedRemarks,
          SampleSubBranchTitle: d.SampleSubBranchTitle,
          SampleSubEmpName: d.SampleSubEmpName,
          NetAmount: d.NetAmount,
          GrossAmount: d.GrossAmount,
          DiscountPerc: d.DiscountPerc,
          BookingAssignedByEmpName: d.BookingAssignedByEmpName,
          BookingAssignedAt: d.BookingAssignedAt ? moment(d.BookingAssignedAt).format('D MMM YYYY h:mm:ss a') : 'Not Assigned Yet',
          BookingCanceledBy: d.BookingCanceledBy,
          BookingCanceledAt: d.BookingCanceledAt,
          PatientAddress: d.PatientAddress,
          BookingCompletedHCStaffRemarks: d.BookingCompletedStaffRemarks,
          BookingCanceledRemarks: d.BookingCanceledRemarks,
          VisitNo: d.PIN,
          IsHCRadioSrv: d.IsHCRadioSrv
        })
      }
      else {

        found.bookingDetail.push(value)
      }
      return acc;
    }, []);

    console.log("HCRadioSrvList", this.HCRadioSrvList);

    InProgressPreFormatedData.forEach((a, i) => {

      let finalResult = [];
      a.bookingDetail.forEach((b, ti) => {
        let _obj = JSON.parse(JSON.stringify(b));
        let tpObj = { TPName: b.TPName, SampleType: b.SampleType }
        let idx = finalResult.findIndex((c, ii) => { return c.BookingPatientID == b.BookingPatientID });
        a.CommSepTP = Array.prototype.map.call(InProgressPreFormatedData[i].bookingDetail, function (item) { return item.TPName; }).join(",");
        a.commSepBIDs = Array.prototype.map.call(InProgressPreFormatedData[i].bookingDetail, function (item) { return item.BookingPatientID; }).join(",");
        a.commSepBIDs = a.commSepBIDs.split(',')
        if (idx > -1) {
          finalResult[idx].TP.push(tpObj);

        } else {
          _obj.TP = [tpObj]; a.CommSepTP = _obj.TPName; a.commSepBIDs = _obj.BookingPatientID
          finalResult.push(_obj);
        }
        _obj.cotp = Array.prototype.map.call(InProgressPreFormatedData[i].bookingDetail, function (item) { return item.TPName; }).join(",")
      });
      a.bookingDetail = finalResult;
      a.BC = a.bookingDetail.length;
    });
    
    this.HCOnlineRequestList = result.filter(a => {
      return ((a.HCBookingStatusID == 15 ||
        a.HCBookingStatusID == 1 ||
        a.HCBookingStatusID == 2 ||
        a.HCBookingStatusID == 3 ||
        a.HCBookingStatusID == 8)
        && a.BookingSourceID == 7)
    }
    ).map(a => ({ ...a, "SelRiderName": "" }));

  }
}
