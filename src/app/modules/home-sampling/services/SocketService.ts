// @ts-nocheck
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;
    private myId: string;
    
    // A Subject acts as both an observer and an observable
    private messageSub = new Subject<string>();
    public message$ = this.messageSub.asObservable();
    constructor() {
        // Connect to the Node.js server URL
        // this.socket = io('http://localhost:3000', {
            this.socket = io('https://stgrmc.metacubes.net', {
            transports: ['websocket'], // Skip polling entirely
            upgrade: false,
            withCredentials: true
        });
        // Listen once, and push data to the Subject
        // Handle incoming messages
        this.socket.on('message_from_server', (data) => {
            this.messageSub.next(data);
        });
    }

    sendMessage(msg: string) {
        this.socket.emit('message_from_client', { text: msg });
    }
    // Method to listen for data
    receiveMessages() {
        return new Observable((observer) => {
            this.socket.on('message_from_server', (data) => {
                observer.next(data);
            });
        });
    }
}