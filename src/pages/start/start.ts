import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { GoogleMaps, GoogleMap } from '@ionic-native/google-maps';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { MapsProvider } from '../../providers/maps/maps';
import { MapPage } from '../map/map';

@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
  providers: [ DriversProvider, MapsProvider ]
})
export class StartPage {

  public user: Driver;
  public duration: any;
  public loading: any;

  @ViewChild('map') mapElement;
  @ViewChild('directionsPanel') directionsPanel;
  public map: any;
  public directionsDisplay: any;
  public notStarted = true;
  public directions: any;
  public currentStop: any;
  public directionSteps: any;
  public curLocation: any;

  constructor( 
    public viewCtrl: ViewController,
    public params: NavParams, 
    public navCtrl: NavController, 
    public storage: Storage, 
    public drivers: DriversProvider, 
    public maps: MapsProvider,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController) {

    this.storage.get('user').then((val) => {
      this.user = val;
    });
  }

  ionViewDidLoad(){
    this.initMap();
  }

  initMap() {
    // display loader 
    this.loading = this.loadingCtrl.create({
      content: 'Loading route...'
    });
    this.loading.present();

    let latLng = new google.maps.LatLng(40.7128, -74.0060);
    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    console.log(this.params.data);

    this.loadRoute();
  }

  loadRoute() {
    let directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;

    this.directionsDisplay.setMap(this.map);

    this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((resp) => {
      this.curLocation = resp;
      directionsService.route({
        origin: {lat: resp.coords.latitude, lng: resp.coords.longitude},
        destination: this.params.data.address,
        travelMode: google.maps.TravelMode['DRIVING']
      }, (res, status) => {
        this.loading.dismiss();
        if(status == google.maps.DirectionsStatus.OK){
          this.directions = res;
          this.duration = res.routes[0].legs[0].duration.text;
          this.directionsDisplay.setDirections(res);
        } else {
          console.warn(status);
        }
      })
    }).catch((error) => {
      console.log('Error getting location', error);
      this.loading.dismiss();
      this.viewCtrl.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Location Error',
        subTitle: 'Can\'t get current location. Check your location services and app permissions.',
        buttons: ['Dismiss']
      });
      alert.present();
    });
  }

  startTrip() {
    // start interval counter
    // show directions on bottom
    this.notStarted = false;
    this.directionSteps = this.directions.routes[0].legs[0].steps;
    this.map.setCenter({lat: this.curLocation.coords.latitude, lng: this.curLocation.coords.longitude});
    this.map.setZoom(20);

    let counter = setInterval(() => {
      // this.checkLocation();
      this.refreshRoute();
    }, 5000);
  }

  refreshRoute() {
    let directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(this.map);

    this.geolocation.getCurrentPosition().then((resp) => {
      this.curLocation = resp;
      directionsService.route({
        origin: {lat: resp.coords.latitude, lng: resp.coords.longitude},
        destination: this.params.data.address,
        travelMode: google.maps.TravelMode['DRIVING']
      }, (res, status) => {
        this.loading.dismiss();
        console.log(res);
        this.directionsDisplay.setMap(null);
        if(status == google.maps.DirectionsStatus.OK){
          this.directions = res;
          this.duration = res.routes[0].legs[0].duration.text;
          this.directionsDisplay.setDirections(res);
        } else {
          console.warn(status);
        }
      })
    }).catch((error) => {
      this.loading.dismiss();
      this.viewCtrl.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Location Error',
        subTitle: 'Can\'t get current location. Check your location services and app permissions.',
        buttons: ['Dismiss']
      });
      alert.present();

    });

    this.directionSteps = this.directions.routes[0].legs[0].steps;
    this.map.setCenter({lat: this.curLocation.coords.latitude, lng: this.curLocation.coords.longitude});
    this.map.setZoom(20);
  }

  // checkLocation(){
  //   this.geolocation.getCurrentPosition().then((resp) => {
  //     var curLatLng = resp.coords;

  //     this.maps.getCode(this.params.data.address).subscribe(val=>{
  //       var latLng = val.json().results[0].geometry.location;
  //       var distance = this.distance(curLatLng.latitude, curLatLng.longitude, latLng.lat, latLng.lng);
  //       console.log(distance);
  //     }, 
  //     err => { console.log(err)}, 
  //     () => {
  //     })

  //   }).catch((error) => {
  //     this.viewCtrl.dismiss();
  //     let alert = this.alertCtrl.create({
  //       title: 'Location Error',
  //       subTitle: 'Can\'t get current location. Check your location services and app permissions.',
  //       buttons: ['Dismiss']
  //     });
  //     alert.present();
  //   });
  // }

  // distance(lat1, lon1, lat2, lon2) {
  //   var radlat1 = Math.PI * lat1/180;
  //   var radlat2 = Math.PI * lat2/180;
  //   var theta = lon1-lon2;
  //   var radtheta = Math.PI * theta/180;
  //   var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);;
  //   dist = Math.acos(dist);
  //   dist = dist * 180/Math.PI;
  //   dist = dist * 60 * 1.1515;
  //   return dist;
  // }

  dismiss() {
   this.viewCtrl.dismiss();
  }

}
