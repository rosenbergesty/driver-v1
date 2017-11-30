import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, LoadingController, AlertController, ModalController } from 'ionic-angular';
import { GoogleMaps, GoogleMap } from '@ionic-native/google-maps';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { MapsProvider } from '../../providers/maps/maps';
import { MapPage } from '../map/map';

import { PickupPage } from '../pickup/pickup';
import { DropPage } from '../drop/drop';
import { SwitchPage } from '../switch/switch';
import { DirectionsPage } from '../directions/directions';

@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
  providers: [ DriversProvider, MapsProvider ]
})
export class StartPage {
  public duration: any;
  public loading: any;
  public durationValue: any;

  @ViewChild('map') mapElement;
  @ViewChild('directionsPanel') directionsPanel;
  public map: any;
  public directionsDisplay: any;
  public notStarted = true;
  public directions: any;
  public currentStop: any;
  public directionSteps: any;
  public curLocation: any;
  public counter: any;

  constructor( 
    public viewCtrl: ViewController,
    public params: NavParams, 
    public navCtrl: NavController, 
    public storage: Storage, 
    public drivers: DriversProvider, 
    public maps: MapsProvider,
    private geolocation: Geolocation,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController) {

  }

  ionViewDidLoad(){
    this.initMap();
  }

  /* Initialize Map */
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
    this.loadRoute();
  }

  // Load Route
  loadRoute() {
    let directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;

    this.directionsDisplay.setMap(this.map);

    this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((resp) => {
      this.curLocation = resp;
      console.log(resp);
      directionsService.route({
        origin: {lat: resp.coords.latitude, lng: resp.coords.longitude},
        destination: this.params.data.address,
        travelMode: google.maps.TravelMode['DRIVING']
      }, (res, status) => {
        this.loading.dismiss();
        if(status == google.maps.DirectionsStatus.OK){
          this.directions = res;
          this.duration = res.routes[0].legs[0].duration.text;
          this.durationValue = res.routes[0].legs[0].duration.value;
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

  /* Start Trip */
  startTrip() {
    // Save eta and start time
    var dateObj = Date.now();
    dateObj += 1000 * this.durationValue;
    var etaDate = new Date(dateObj);
    var eta = etaDate.getHours() + ':' + etaDate.getMinutes();

    var timeDate = new Date();
    var time = (timeDate.getHours()<10?'0':'') + timeDate.getHours() + ':' + (timeDate.getMinutes()<10?'0':'') + timeDate.getMinutes();

    this.drivers.startStop(this.params.data.ID, eta, time).subscribe(
      data => {
        console.log(data.json());
      },
      err => {
        console.log(err.json());
      },
      () => {
        console.log('started stops');
      }
    );

    this.notStarted = false;
    this.directionSteps = this.directions.routes[0].legs[0].steps;
    this.map.setCenter({lat: this.curLocation.coords.latitude, lng: this.curLocation.coords.longitude});
    this.map.setZoom(20);

    this.counter = setInterval(() => {
      this.refreshRoute();
    }, 3000);
  }

  listDirections() {
    let modal = this.modalCtrl.create(DirectionsPage, {steps: this.directionSteps});;
    modal.present();
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
        if(res.routes[0].legs[0].distance.value < 41){
          if(this.notStarted == false){
            clearInterval(this.counter);
            this.complete();
          }
        } else {
          this.directionsDisplay.setMap(null);
          if(status == google.maps.DirectionsStatus.OK){
            this.directions = res;
            this.directionSteps = res.routes[0].legs;
            this.duration = res.routes[0].legs[0].duration.text;
            this.directionsDisplay.setDirections(res);
          } else {
            console.warn(status);
          } 
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

  complete() {
    this.notStarted = true;
    var timeDate = new Date();
    var time =  (timeDate.getHours()<10?'0':'') + timeDate.getHours() + ':' + (timeDate.getMinutes()<10?'0':'') + timeDate.getMinutes();
    this.drivers.completeStop(this.params.data.ID, time).subscribe(
      data=>{
        console.log(data.json());
      }, err=>{
        console.log(err.json());
      }, ()=>{

      }
    );
    var type = this.params.data.type;
    var location: any;
    switch(type){
      case 'do':
        location = DropPage;
        break;
      case 'pu':
        location = PickupPage;
        break;
      case 'sw':
        location = SwitchPage;
        break;
    }
    this.navCtrl.push(location, this.params.data);
  }

  dismiss() {
    this.drivers.cancelStop(this.params.data.ID).subscribe(
      data => {
        console.log(data.json());
      },
      err => {
        console.log(err.json())
      },
      () => {
        console.log('cancelled stop');
      });
    this.viewCtrl.dismiss();
  }

}
