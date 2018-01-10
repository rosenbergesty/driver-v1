import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { GoogleMaps, GoogleMap } from '@ionic-native/google-maps';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { MapsProvider } from '../../providers/maps/maps';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  providers: [ DriversProvider, MapsProvider ]
})
export class MapPage {

  public user: Driver;

  @ViewChild('map') mapElement;
  map: any;

  constructor( 
    public viewCtrl: ViewController,
    public params: NavParams, 
    public navCtrl: NavController, 
    public storage: Storage, 
    public drivers: DriversProvider, 
    public maps: MapsProvider,
    private geolocation: Geolocation) {

    this.storage.get('user').then((val) => {
      this.user = val;
    });
  }

  ionViewDidLoad(){
    this.initMap();
  }

  initMap() {
    let latLng = new google.maps.LatLng(40.7128, -74.0060);
    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.loadRoute();
  }

  loadRoute() {
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(this.map);

    this.geolocation.getCurrentPosition().then((resp) => {
      directionsService.route({
        origin: {lat: resp.coords.latitude, lng: resp.coords.longitude},
        destination: this.params.data.address,
        travelMode: google.maps.TravelMode['DRIVING']
      }, (res, status) => {
        if(status == google.maps.DirectionsStatus.OK){
          directionsDisplay.setDirections(res);
        } else {
          console.warn(status);
        }
      })
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
