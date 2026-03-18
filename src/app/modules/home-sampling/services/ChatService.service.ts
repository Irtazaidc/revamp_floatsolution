// @ts-nocheck

import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
    private hub: signalR.HubConnection;
    private joinedBookings: string[] = [];

    // Start SignalR connection
    startConnection() {

        if (this.hub) return; // prevent duplicate connections


        this.hub = new signalR.HubConnectionBuilder()
            .withUrl(environment.RealtimeMetacubesUrl + '/chatHub', {
                // .withUrl("http://localhost:5003/" + 'ChatHub', {
                withCredentials: true
            })
            .configureLogging(signalR.LogLevel.Debug)
            .withAutomaticReconnect([0, 2000, 5000])
            .build();

        this.hub.onreconnecting(() => {
            console.warn('SignalR reconnecting...');
        });
        this.hub.onreconnected(async () => {
            console.warn('SignalR reconnected');
            // REJOIN GROUPS
            for (let id of this.joinedBookings) {
                await this.joinBooking(id);
            }
        });
        this.hub.start()
            .then(() => console.log('SignalR Connected'))
            .catch(err => console.error(err));
    }

    // Join a booking room
    joinBooking(bookingId: string) {
        if (!this.joinedBookings.includes(bookingId)) {
            this.joinedBookings.push(bookingId);
        }
        this.hub.invoke('JoinBooking', bookingId);
    }

    // Send message
    sendMessage(bookingId: string, sender: string, msg: string) {
        this.hub.invoke('SendMessage', bookingId, sender, msg).catch(err => console.error("Error sending message",err));
    }

    public addReceiveMessageListner(callback:(bookingId: string, sender: string, msg: string) => void){
        this.hub.on('ReceiveMessage', callback)
    }

    async DisconnectMe() {
        if (this.hub) {
            await this.hub.stop();
            console.log('SignalR disconnected');
        }
    }

    // Send to all users
    sendToAll(sender: string, msg: string) {
        this.hub.invoke('SendToAll', sender, msg);
    }
    // Listen for incoming messages
    onMessage(callback: (bookingId, sender, msg) => void) {
        this.hub.on('ReceiveMessage', callback);
    }

    // Receive from all users
    onMessageAll(callback: (sender: string, msg: string) => void) {
        this.hub.on('ReceiveMessageAll', (sender, msg) => {
            console.log('ReceivedAll:', sender, msg);
            callback(sender, msg);
        });
    }
    onMessageOff() {
        this.hub.off('ReceiveMessage');
    }

    // Receive from all users
    onMessageAllOff() {
        this.hub.off('ReceiveMessageAll');
    }
}

