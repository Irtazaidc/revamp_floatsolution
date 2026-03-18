// @ts-nocheck
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_ROUTES } from '../../shared/helpers/api-routes';

@Injectable({
  providedIn: 'root'
})
export class HcDashboardService {

  constructor(private http: HttpClient) { }
  private hcBookingChatResp$ = new BehaviorSubject({});
  hcBookingChatResp = this.hcBookingChatResp$.asObservable();
  private hcRiderUpdateLocationResp$ = new BehaviorSubject({});
  hcRiderUpdateLocationResp = this.hcRiderUpdateLocationResp$.asObservable();
  //#region  Signal R
  hubConnection: signalR.HubConnection | undefined;

  //#region  Signal R Connection 
  startConnection = () => {
    // this.hubConnection = new signalR.HubConnectionBuilder()
    //   // .withUrl('https://reports.idc.net.pk/RealtimeMetacubesData/booking-chat',{
    //   //   skipNegotiation:true,
    //   //   transport: signalR.HttpTransportType.WebSockets
    //   // })
    //   // .withUrl('http://localhost:5003/booking-chat', {
    //   .withUrl(environment.RealtimeMetacubesUrl + 'booking-chat', {
    //     skipNegotiation: true,
    //     transport: signalR.HttpTransportType.WebSockets
    //   }).build();

    this.hubConnection = new signalR.HubConnectionBuilder().withUrl(environment.RealtimeMetacubesUrl + '/BookingChatHub', {
        withCredentials: false,
        skipNegotiation:true,
        transport: signalR.HttpTransportType.WebSockets
      }).withAutomaticReconnect().build();

    this.hubConnection.start().then(() => {
        console.log('Hub Connection Started!');
      }).catch(err => console.log('Error while starting connection : ' + err))
  }
  startConnectionForRider = (HCRequestID) => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .withUrl('https://reports.idc.net.pk/RealtimeMetacubesData/booking-chat',{
      //   skipNegotiation:true,
      //   transport: signalR.HttpTransportType.WebSockets
      // })
      //.withUrl('http://localhost:5003/rider-location?ReqID= ' + HCRequestID, {
      .withUrl(environment.RealtimeMetacubesUrl + 'rider-location?ReqID= ' + HCRequestID, {

        // .withUrl('https://reports.idc.net.pk/RealtimeMetacubes/rider-location', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        logMessageContent: true
      })
      .build();
    this.hubConnection
      .start()
      .then(() => {
        console.log('Hub Connection Started!');
      })

      .catch(err => console.log('Error while starting connection : ' + err))
  }

  askServer() {
    this.hubConnection?.invoke("askServer", "hey")
      .catch(err => console.error(err))
  }
  askServerListener() {
    this.hubConnection?.on("ReceiveMessage", (someText) => {
      console.log("Hi  i am your one and only response ", someText);
      this.hcBookingChatResp$.next(someText || {});
    })
  }
  askRiderServerListener() {
    this.hubConnection?.on("AskMetaComForRiderLocation", (someText) => {
      console.log("Hi  i am your one and only response ", someText);
      this.hcRiderUpdateLocationResp$.next(someText || {});
    })
  }
  //#endregion Signal R Connection 

  //#region  HC Booking 

  Gettest(msg) {
    let Obj = {
      "BookingID": 96749237
    }
    // "RemarksForHCChat": "Call Me Back", "RiderID": 1,"HCBookingStatusID": null, "HCChatRemarksBy": 508, "CreatedBy": 508, "HCDefaultRemarksID": 1

    this.hubConnection?.invoke("GetBookingRemarksForHCChat", Obj)
      .catch(err => console.error(err))
  }
  updateHCBookingRemarks(params) {
      let Obj = {
      BookingID: String(params.BookingID || ""),
      HCRequestID: params.HCRequestID || null,
      isRemarksForHCChatUrgent: params.isUrgent != null ? Boolean(params.isUrgent) : false,
      RemarksForHCChat: params.Remarks || "",
      HCBookingStatusID: params.HCBookingStatusID || null,
      UserType: params.UserType || 2,
      CreatedBy: params.CreatedBy || 0,
      RiderID: params.RiderID || null,
      HCDefaultRemarksID: params.HCDefaultRemarksID || null
    };

    if (this.startConnection) {
     this.hubConnection?.invoke("InsertHCBookingChat", Obj)
      .catch(err => console.error(err));
    }
    else {
      this.startConnection();
    }

  }
  //#endregion HC Booking Chat

  //#endregion Signal R 

  getHCCities() {
    return this.http.post(API_ROUTES.GET_HC_CITIES, '', this.getServerCallOptions())
  }
  getHCServices() {
    return this.http.post(API_ROUTES.GET_HC_SERVICES, '', this.getServerCallOptions())
  }

  getRegTPDetailByHCReqID(params) {
    return this.http.post(API_ROUTES.HC_REG_TP_DETAIL_BY_HCREQ_ID, params, this.getServerCallOptions())
  }

  GetHCRequests(params) {
    return this.http.post(API_ROUTES.GET_HOMECOLLECTION_REQ, params, this.getServerCallOptions())
  }

  GetHCRequestsOnline(params) {
    return this.http.post(API_ROUTES.GET_ONLINE_HOMECOLLECTION_REQ, params, this.getServerCallOptions())
  }
  GetRiders(params) {
    return this.http.post(API_ROUTES.GET_RIDERS_DETAIL, params, this.getServerCallOptions())
  }
  GetBookingComparison(params) {
    return this.http.post(API_ROUTES.GET_BOOKING_COMPARISON, params, this.getServerCallOptions())
  }
  GetRiderQAnswerRoutinePic(params) {
    return this.http.post(API_ROUTES.HC_RIDER_Routine_QPIC, params, this.getServerCallOptions())
  }
  GetRiderDeviceInfo(params) {
    return this.http.post(API_ROUTES.HC_RIDER_DEVICE_INFO, params, this.getServerCallOptions())
  }
  GetRiderNotCollectedSamples(params) {
    return this.http.post(API_ROUTES.GET_RIDER_NOT_COLLECTED_SAMPLES , params, this.getServerCallOptions())
  }
  GetHCRiderShareReport(params) {
    return this.http.post(API_ROUTES.GET_HC_RIDER_SHARE_REPORT , params, this.getServerCallOptions())
  }
  GetHCPortableServicesShareReport(params) {
    return this.http.post(API_ROUTES.GET_HC_PORTABLE_SERVICES_SHARE_REPORT, params, this.getServerCallOptions())
  }
  GetZonesByHCCityID(params) {
    return this.http.post(API_ROUTES.HC_ZONES_BY_HCCITY, params, this.getServerCallOptions())
  }
  HomeCollectionBranches() {
    return this.http.post(API_ROUTES.HOME_COLLECTION_BRANCHES, '', this.getServerCallOptions())
  }
  Branches() {
    return this.http.post(API_ROUTES.LOOKUP_GET_BRANCHES, '', this.getServerCallOptions())
  }
  HomeCollectionZones() {
    return this.http.post(API_ROUTES.HOME_COLLECTION_ZONES, '', this.getServerCallOptions())
  }
  GetHCBookingStatuses() {
    return this.http.post(API_ROUTES.HC_BOOKING_STATUSES, '', this.getServerCallOptions())
  }
  GetRiderByZoneID(param) {
    return this.http.post(API_ROUTES.HC_RIDERS_BY_ZONEID, param, this.getServerCallOptions())
  }
  CloseHCReq(params) {
    return this.http.post(API_ROUTES.UPDATE_REQUEST_STATUS, params, this.getServerCallOptions())
  }
  GetRiderScheduleByRiderID(params) {
    return this.http.post(API_ROUTES.RIDER_TASK_SCHEDULE, params, this.getServerCallOptions());
  }
  AssignRider(params) {
    return this.http.post(API_ROUTES.ASSIGN_RIDER, params, this.getServerCallOptions())
  }
  SendNotificationToBranchRider(params) {
    return this.http.post(API_ROUTES.SEND_NOTIFICATION_TO_BRANCH_RIDERS, params, this.getServerCallOptions())
  }
  GetCities() {
    return this.http.post(API_ROUTES.HOME_COLLECTION_CITIES, this.getServerCallOptions())
  }
  GetRiderStatuses() {
    return this.http.post(API_ROUTES.GET_RIDERS_STATUSES, this.getServerCallOptions())
  }
  UpdateRiderStatus(params) {
    return this.http.post(API_ROUTES.UPDATE_RIDERS_STATUSE, params, this.getServerCallOptions())
  }
  getHCDashboardCounts() {
    return this.http.post(API_ROUTES.GET_HC_DASHBOARD_COUNTS, this.getServerCallOptions())
  }
  getHCAdminDashboardCounts(params) {
    return this.http.post(API_ROUTES.GET_HC_ADMIN_DASHBOARD_COUNTS, params, this.getServerCallOptions())
  }
  getHCBookingDefRemarks() {
    return this.http.post(API_ROUTES.HC_DEFAULT_CHAT_REMARKS, '', this.getServerCallOptions())
  }
  getHCBookingMessages(params) {
    return this.http.post(API_ROUTES.HC_BOOKING_MESSAGES, params, this.getServerCallOptions())
  }

  getPendingVisits() {
    return this.http.post(API_ROUTES.VISITS_FOR_HC_BOOKING, '', this.getServerCallOptions())
  }

  getVisitDetailByVisitID(params) {
    return this.http.post(API_ROUTES.VISIT_DETAIL_BY_VISITID, params, this.getServerCallOptions())
  }
  getDateAndRiderWiseHCTestCount(params) {
    return this.http.post(API_ROUTES.GET_HC_TEST_COUNTS, params, this.getServerCallOptions())
  }
  // updateHCBookingRemarks(params) {
  //   return this.http.post(API_ROUTES.UPD_HC__BOOKING_REMARKS, params, this.getServerCallOptions())
  // }

  registredTestDetailByBookingID(params) {
    return this.http.post(API_ROUTES.REG_TEST_DET_BY_BOOKING_ID, params, this.getServerCallOptions())
  }

  //Rider Message Box Service

  insertRiderMessageBox(params) {
    return this.http.post(API_ROUTES.INSERT_RIDER_MESSAGE_BOX, params, this.getServerCallOptions())
  }

  getServerCallOptions(): object {
    return {
      headers: this.getCommonHeaders(),
      responseType: "json"
    }
  }
  getCommonHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    })
  }
}
