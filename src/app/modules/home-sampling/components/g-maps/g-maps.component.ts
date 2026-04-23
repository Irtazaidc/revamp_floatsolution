// @ts-nocheck
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { GoogleLocationService } from '../../services/google-location.service';
import { HcDashboardService } from '../../services/hc-dashboard.service';


@Component({
  standalone: false,

  selector: 'app-g-maps',
  templateUrl: './g-maps.component.html',
  styleUrls: ['./g-maps.component.scss']
})
export class GMapsComponent implements OnInit, AfterViewInit {
  map!: google.maps.Map;
  @ViewChild('mapElement') mapElement: any;
  options: google.maps.MapOptions = {
    center: { lat: 64.48113363780652, lng: 16.33826752001327 },
    zoom: 16,
  };
  RidersDetailList: any = [];

  constructor(private locationService: GoogleLocationService, private HCService: HcDashboardService) { }

  ngOnInit(): void {
    // this.locationService.getPosition().then((pos: any) => {
    //   this.addMarker(new google.maps.LatLng(pos.lat, pos.lng), "sa", this.map, true);

    // });
    this.RidersDetail();

  }

  ngAfterViewInit(): void {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 33.71123565924633, lng: 73.04165572921339 },
      zoom: 16
    });
    this.locationService.getPosition().then((pos: any) => {
      
      this.addMarker(new google.maps.LatLng(pos.lat, pos.lng), "sa", this.map, true);
      // this.markersPos = 
    });

    // const locations = this.ri
  }
  addMarker(latlng: google.maps.LatLng, title: string, map: google.maps.Map, draggable: boolean) {

    
    // const locations = []; 
    const locations = this.RidersDetailList.map(a => ({ lat: a.Latitude, lng: a.Longitude }))

    // var addressMarker = new google.maps.Marker({
    //   position: latlng,
    //   map: map,
    //   title: title,
    //   draggable: draggable
    // });

    const markers = locations.map((location, i) => {
      return new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        draggable: draggable
      });
    });
    // new MarkerClusterer({ map, markers  });

    //     // Add some markers to the map.
    // const markers = locations.map((location, i) => {
    //   return new google.maps.Marker({
    //     position: location,
    //     label: labels[i % labels.length],
    //   });
    // });

    
    this.map.setCenter(markers.getPosition());

    if (draggable) {
      markers.addListener('dragend', this.dragEndEventHandler);
    }
  }
  dragEndEventHandler(event: any) {
    console.log("Lat: " + event.latLng.lat() + ", Long: " + event.latLng.lng());
  }
  RidersDetail() {
    const params = {
      RiderID: 0
    }
    this.HCService.GetRiders(params).subscribe((resp: any) => {
      this.RidersDetailList = resp.PayLoad;
      console.log(this.RidersDetailList);
    }, (err) => { console.log(err) })
  }
  AssignRider(hcReq, rider) {
    
    const params = {
      "BookingID": hcReq.BookingPatientID,
      "RiderID": rider.RiderID,
      "ModifiedBy": 0
    }
    this.HCService.AssignRider(params).subscribe((resp: any) => {
      console.log(resp)
    }, (err) => {
      console.log(err)
    })
  }

}
