// @ts-nocheck
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  constructor() { }
  hubConnection: signalR.HubConnection | undefined;
  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .withUrl('https://reports.idc.net.pk/RealtimeMetacubesData/booking-chat',{
      //   skipNegotiation:true,
      //   transport: signalR.HttpTransportType.WebSockets
      // })
      .withUrl('https://localhost:5003/booking-chat', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();
    this.hubConnection
      .start()
      .then(() => {
        // console.log('Hub Connection Started!');
      })
      .catch(err =>
         console.log('Error while starting connection : ' + err)
        )
  }
  askServer() {
    this.hubConnection?.invoke("askServer", "hey")
      .catch(err => console.error(err))
  }
  askServerListener() {
    this.hubConnection?.on("askServerResponse", (someText) => {
      console.log(someText);
    })
  }

  test(msg) {
    const Obj = {
      "BookingID": 96749237, "isRemarksForHCChatUrgent": 1,
      "RemarksForHCChat": "Call Me Back", "RiderID": 1, 
      "HCBookingStatusID": null, "HCChatRemarksBy": 508, "CreatedBy": 508, "HCDefaultRemarksID": 1
    }
    // "RemarksForHCChat": "Call Me Back", "RiderID": 1,"HCBookingStatusID": null, "HCChatRemarksBy": 508, "CreatedBy": 508, "HCDefaultRemarksID": 1

    this.hubConnection?.invoke("InsertHCBookingChat", Obj)
      .catch(err => console.error(err))
  }

  Gettest(msg) {
    const Obj = {
      "BookingID": 96749237
    }
    // "RemarksForHCChat": "Call Me Back", "RiderID": 1,"HCBookingStatusID": null, "HCChatRemarksBy": 508, "CreatedBy": 508, "HCDefaultRemarksID": 1

    this.hubConnection?.invoke("GetBookingRemarksForHCChat", Obj)
      .catch(err => console.error(err))
  }
}
