// @ts-nocheck
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabsSwitchingService {

  private selectedTabIndexSubject = new BehaviorSubject<{ index: number; data: any }>({ index: 0, data: null });
  selectedTabIndex$ = this.selectedTabIndexSubject.asObservable();

  setSelectedTabIndex(index: number, data: any) {
    this.selectedTabIndexSubject.next({ index, data });
  }
}
