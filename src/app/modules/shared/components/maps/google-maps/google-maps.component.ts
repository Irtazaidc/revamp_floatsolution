// @ts-nocheck
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GmapsService } from '../../../services/gmaps.service';

@Component({
  standalone: false,

  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})
export class GoogleMapsComponent implements OnInit, AfterViewInit {
  map!: google.maps.Map;
  @Input() gMapsControls: any;
  @Input('latLngpostions') positionInfoIn: any;
  @Input() gMapInfoToDisplay: any;
  @Input() gMultipleMarlers: any;
  @Input() MapName: any;
  @Output() positionInfoOut = new EventEmitter<any>();


  buttonControlsPermissions = {
    showMarker: false,
    search: false,
    showCurrentLocation: false,
    dragableMarker: false,
    allowMultipleMarkers: false
  }
  markersPos: any = {
    position: {
      lat() { }, lng() { }
    },
    label: '',
    map: '',
    title: '',
    center: ''
  };
  GoogleAddressName: string;
  mar: google.maps.Marker;

  constructor(private gmapsService: GmapsService) { }

  ngOnInit(): void {
    if (this.gMapInfoToDisplay) {
      console.log("gMapsControls", this.gMapInfoToDisplay);
      console.log("gMapsControls", this.gMultipleMarlers);
      console.log("gMapsControls", this.MapName);
    } else {
      console.log("gMapsControlsfasdfasdfasdfasdf")
      this.Map();
    }



    this.CheckControlPermissions();
  }


  // this.buttonControlsPermissions.bookingBtn = this.buttonControls.find( a => (a || '').toString().toLowerCase().trim() == 'booking') ? true : false;
  CheckControlPermissions() {

    this.buttonControlsPermissions.showMarker = this.gMapsControls.find(a => (a || '').toString().toLowerCase().trim() == 'show-marker') ? true : false;
    this.buttonControlsPermissions.search = this.gMapsControls.find(a => (a || '').toString().toLowerCase().trim() == 'enable-serach') ? true : false;
    this.buttonControlsPermissions.showCurrentLocation = this.gMapsControls.find(a => (a || '').toString().toLowerCase().trim() == 'show-cur-location') ? true : false;
    this.buttonControlsPermissions.dragableMarker = this.gMapsControls.find(a => (a || '').toString().toLowerCase().trim() == 'draggable-marker') ? true : false;
    this.buttonControlsPermissions.allowMultipleMarkers = this.gMapsControls.find(a => (a || '').toString().toLowerCase().trim() == 'allow-multiple-markers') ? true : false;
  }
  ngAfterViewInit(): void {

    // let locationLatLng = { lat: -25.344, lng: 131.036 };
    this.Map();
  }


  Map() {
    if (this.buttonControlsPermissions.showCurrentLocation) {

      this.gmapsService.getPosition().then((pos: any) => {
        this.CreateMap(pos, this.MapName);
        if (this.buttonControlsPermissions.showMarker) {
          const isMarkerDragable = this.buttonControlsPermissions.dragableMarker ? true : false;
          if (this.buttonControlsPermissions.allowMultipleMarkers) {
            console.log("allowMultipleMarkers", pos);
            const markerArr = [];
            pos.forEach(i => {
              markerArr.push(pos[i]);
            });
            console.log(markerArr);
          }
          else {
              const markerSetting = {
                isMarkerDragable: isMarkerDragable,
                icontype: 'patient'
              }
            this.SetMarkers(new google.maps.LatLng(pos.lat, pos.lng), 'Coool', markerSetting);
          }
          this.AddInputBox();
        }
      });
    }
    else {

      if (this.buttonControlsPermissions.showMarker) {
        this.CreateMap(this.gMapInfoToDisplay, this.MapName);
        const isMarkerDragable = this.buttonControlsPermissions.dragableMarker ? true : false;
       
        if (this.buttonControlsPermissions.allowMultipleMarkers && this.gMultipleMarlers) {
          console.log("allowMultipleMarkers", this.gMapInfoToDisplay);
          console.log("allowMultipleMarkers", this.gMultipleMarlers);
          
          const markerArr = [];
          for (let i = 0; i <= this.gMultipleMarlers.length; i++) {      
            const markerSetting = {
              isMarkerDragable: isMarkerDragable,
              icontype:this.gMultipleMarlers[i].markerType
            }     
            this.SetMarkers(new google.maps.LatLng(this.gMultipleMarlers[i].lat, this.gMultipleMarlers[i].lng), 'Coool', markerSetting);
          }

          console.log(markerArr);
        }
        else {
          const markerSetting = {
            isMarkerDragable: isMarkerDragable,
            icontype: 'patient'
          }  
          this.SetMarkers(new google.maps.LatLng(this.gMapInfoToDisplay.lat, this.gMapInfoToDisplay.lng), 'Coool', markerSetting);

        }

        // this.AddInputBox();
      }
    }


  }
  AddInputBox() {
    const pacinput = document.createElement('input');
    pacinput.setAttribute("class", "controls");
    pacinput.setAttribute("id", "pac-input");
    pacinput.setAttribute("type", "text");
    pacinput.setAttribute("style", "background-color: #fff;border-radius: 2px;border: 1px solid transparent;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);box-sizing: border-box;font-family: Roboto;font-size: 15px;font-weight: 300;height: 29px;margin-left: 17px;margin-top: 10px;outline: none;padding: 0 11px 0 13px;text-overflow: ellipsis;width: 400px;");
    pacinput.setAttribute("placeholder", "Enter a location");
    document.getElementById("map").appendChild(pacinput);
    const input = document.getElementById("pac-input") as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", this.map);
    // Specify just the place data fields that you need.
    autocomplete.setFields(["place_id", "geometry", "formatted_address", "name"]);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete.addListener("place_changed", () => {
      this.ResetMarkers();
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        return;
      }
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);
      }
      this.GoogleAddressName = place.formatted_address;
      const placeinfo = {
        "place": place.name,
        "place_id": place.place_id!,
        "formatted_address": place.formatted_address!
      }
      const markerSetting = {
        isMarkerDragable: false,
        icontype: 'patient'
      }
      this.SetMarkers(place.geometry.location, "sa", markerSetting);
      console.log("marker pic", place.geometry.location)
    });
  }
  CreateMap(LatLng, mapName) {
    this.map = new google.maps.Map(
      document.getElementById(mapName) as HTMLElement,
      {
        zoom: 15,
        center: LatLng,
      }
    );

    // const directionsRenderer = new google.maps.DirectionsRenderer();
    // const directionsService = new google.maps.DirectionsService();
    // directionsRenderer.setMap(this.map);
    // this.calculateAndDisplayRoute(directionsService, directionsRenderer);
  }
  calculateAndDisplayRoute(directionsService, directionsRenderer) {


    directionsService
      .route({
        origin: { lat: 37.77, lng: -122.447 },
        destination: { lat: 37.768, lng: -122.511 },
        // Note that Javascript allows us to access the constant
        // using square brackets and a string value as its
        // "property."
        travelMode: google.maps.TravelMode["DRIVING"],
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert("Directions request failed due to " + status));
  }
  SetMarkers(latlng: google.maps.LatLng, title: string, markerSetting: any) {
    this.markersPos = new google.maps.Marker({});
    if (!this.buttonControlsPermissions.allowMultipleMarkers) {
      this.ResetMarkers();
    }
    const image = './assets/media/svg/motorcycle-icon-png-16.jpg';
    const iconRider = {
      url: "./assets/media/svg/motorcycle-icon-png-16.jpg", // url
      scaledSize: new google.maps.Size(40, 40), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    }
    const iconPatient = {
      url: './assets/media/svg/icons8-pharmacist-skin-type-2-96.png', // url
      scaledSize: new google.maps.Size(40, 40), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    }
    this.markersPos = new google.maps.Marker({
      position: latlng,
      map: this.map,
      draggable: markerSetting.isdraggable ? true : false,
      icon:  markerSetting.icontype == 'rider'? iconRider : iconPatient
    });
    // var geocoder = new google.maps.Geocoder;

    // let latitude = this.markersPos.getPosition().lat();
    // let longitude = this.markersPos.getPosition().lng();
    // let pos = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    // geocoder.geocode({ 'location': pos }, function (results, status) {
    //   if (status === google.maps.GeocoderStatus.OK) {
    //     if (results[1]) {
    //       console.log(results[1].place_id);
    //     } else {
    //       window.alert('No results found');
    //     }
    //   } else {
    //     window.alert('Geocoder failed due to: ' + status);
    //   }
    // });
    if (markerSetting.isdraggable) {
      this.markersPos.addListener('dragend', this.dragEndEventHandler);
    }
    if (this.buttonControlsPermissions.showCurrentLocation)
      this.positionInfoOut.emit(this.markersPos);
  }
  dragEndEventHandler(event: any) {
    console.log("Lat: " + event.latLng.lat() + ", Long: " + event.latLng.lng());
  }
  ResetMarkers() {
    this.markersPos.setMap(null);
  }
}
