// @ts-nocheck
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor() { }

  private notificationSubject = new Subject<boolean>();

  sendNotification(changeOccurred: boolean) {
    console.log("sendNotification~ changeOccurred:", changeOccurred)
    
    this.notificationSubject.next(changeOccurred);
  }

  getNotification() {
    console.log("getNotification~ changeOccurred:")
    return this.notificationSubject.asObservable();
  }

}
