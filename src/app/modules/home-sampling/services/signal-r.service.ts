// @ts-nocheck
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AnyCnameRecord } from 'dns';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private hubConnection!: signalR.HubConnection;
  public messageReceived = new BehaviorSubject<string | null>(null);
  public notifications = new BehaviorSubject<NotificationModel[]>([]);

  constructor() { }

  // public startConnection(bookingId?: string) {


  //   // this.hubConnection = new signalR.HubConnectionBuilder().withUrl(environment.RealtimeMetacubesUrl + '/booking-chat', {
  //   //   withCredentials: false,
  //   //   skipNegotiation: true,
  //   //   transport: signalR.HttpTransportType.WebSockets,

  //   // }).withAutomaticReconnect().build();

  //   // this.hubConnection = new signalR.HubConnectionBuilder()
  //   //   .withUrl('https://stgapi.metacubes.net/rmc/booking-chat', {
  //   //     skipNegotiation: false,
  //   //     withCredentials: true  // Important for CORS with credentials
  //   //   })
  //   //   .configureLogging(signalR.LogLevel.Debug)
  //   //   .withAutomaticReconnect()
  //   //   .build();
  //   // this.hubConnection = new signalR.HubConnectionBuilder()
  //   //   .withUrl(environment.RealtimeMetacubesUrl + '/booking-chat', {
  //   //     withCredentials: true,  
  //   //     skipNegotiation: false, 
  //   //   })
  //   //   .withAutomaticReconnect()
  //   //   .build();


  //   // For production (through Nginx proxy)
  //   // this.hubConnection = new signalR.HubConnectionBuilder()
  //     // .withUrl('https://stgapi.metacubes.net/rmc/booking-chat', {
  //      this.hubConnection = new signalR.HubConnectionBuilder().withUrl(environment.RealtimeMetacubesUrl + '/booking-chat', {

  //       withCredentials: true,
  //       skipNegotiation: false,
  //       transport: signalR.HttpTransportType.LongPolling // Force LongPolling for testing

  //     })
  //     .configureLogging(signalR.LogLevel.Debug) // Helpful for debugging
  //     .withAutomaticReconnect()
  //     .build();

  //   this.hubConnection.start().then(() => {
  //     console.log('Hub Connection Started!');
  //   }).catch(err => console.log('Error while starting connection : ' + err))

  //   // Listen to messages
  //   debugger
  //   this.hubConnection.on('ReceiveMessage', (response: any) => {
  //     console.log('Message from server1:', response);
  //     this.messageReceived.next(response);
  //     if (response?.hubStatusCode === 1 && response?.hubPayLoadStr) {
  //       const notification: NotificationModel = {
  //         bookingID: response.hubPayLoadStr.BookingID,
  //         message: response.hubPayLoadStr.Message,
  //         userType: response.hubPayLoadStr.UserType,
  //         riderDeviceToken: response.hubPayLoadStr.RiderDeviceToken,
  //         isRead: false

  //       };
  //       const current = this.notifications.value;
  //       this.notifications.next([notification, ...current]);
  //     }
  //   });
  // }

  // public sendMessageToRider(bookingId: string, message: string, RiderDeviceToken: string) {
  //   const payload = {
  //     BookingID: bookingId,
  //     Message: message,
  //     UserType: 2,
  //     RiderDeviceToken
  //   };
  //   if (this.hubConnection) {
  //     this.hubConnection.invoke('InsertHCBookingChat', payload)
  //       .catch(err => console.error(err));
  //   }
  // }



  public startConnection(bookingId?: string) {
    // // Prevent multiple connections
    // if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
    //   return;
    // }

    // this.hubConnection = new signalR.HubConnectionBuilder()
    //   .withUrl(environment.RealtimeMetacubesUrl + '/booking-chat', {
    //     withCredentials: true,
    //     skipNegotiation: false,
    //     transport: signalR.HttpTransportType.LongPolling // Force LongPolling
    //   })
    //   .configureLogging(signalR.LogLevel.Debug)
    //   .withAutomaticReconnect()
    //   .build();
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .withUrl('https://stgapi.metacubes.net/rmc/booking-chat', {
      // .withUrl(environment.RealtimeMetacubesUrl + '/booking-chat', {
      .withUrl(environment.RealtimeMetacubesUrl + '/chatHub', {
        withCredentials: true
      })
      .configureLogging(signalR.LogLevel.Debug)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('Hub Connection Started!'))
      .catch(err => console.log('Error while starting connection : ' + err));

    // Listen to messages
    this.hubConnection.on('ReceiveMessage', (response: any) => {
      console.log('Message from server1:', response);
      this.messageReceived.next(response);

      if (response?.hubStatusCode === 1 && response?.hubPayLoadStr) {
        const notification: NotificationModel = {
          bookingID: response.hubPayLoadStr.BookingID,
          message: response.hubPayLoadStr.Message,
          userType: response.hubPayLoadStr.UserType,
          riderDeviceToken: response.hubPayLoadStr.RiderDeviceToken,
          isRead: false
        };
        const current = this.notifications.value;
        this.notifications.next([notification, ...current]);
      }
    });

  }

  public sendMessageToRider(bookingId: string, message: string, RiderDeviceToken: string) {
    const payload = {
      BookingID: bookingId,
      Message: message,
      UserType: 2,
      RiderDeviceToken
    };

    if (this.hubConnection) {
      this.hubConnection.invoke('InsertHCBookingChat', payload)
        .catch(err => console.error(err));
    }
  }


}


export interface NotificationModel {
  bookingID: string;
  message: string;
  userType: number;
  riderDeviceToken: string;
  isRead?: boolean;
}