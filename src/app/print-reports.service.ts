// @ts-nocheck
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrintReportsService {
  private apiKey = 'acef997a1b704e5eb511c771e2a08563';
  private apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${this.apiKey}`;

    constructor(
    private http: HttpClient,

    ) { }
    
    getLocationInfo(): Observable<any> { 
      return this.http.get(this.apiUrl);
    }
}
