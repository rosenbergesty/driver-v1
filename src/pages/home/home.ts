import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';

import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { StopsProvider } from '../../providers/stops/stops';
import { MapsProvider } from '../../providers/maps/maps';
import { StartPage } from '../start/start';
import { DropPage } from '../drop/drop';
import { PickupPage } from '../pickup/pickup';
import { SwitchPage } from '../switch/switch';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ MapsProvider ]
})
export class HomePage {

  public user: Driver;
  public stopStatus = 'pending';

  public showList = true;
  public showMap = false;

  public pendingMarkers = [];
  public completedMarkers = [];

  @ViewChild('map') mapElement;
  map: any;

  constructor( public modalCtrl: ModalController, public stopsPvdr: StopsProvider,
    public navCtrl: NavController, public storage: Storage, 
    public drivers: DriversProvider, public maps: MapsProvider,
    public alertCtrl: AlertController) {
  }

  ionViewDidLoad(){
    this.initMap();

    // Get driver and load stops
    this.storage.get('user').then((val) => {
      if(val != null){
        this.user = val;
        this.drivers.user = val;
        this.fetchStops(true);

        this.storage.get('onesignal-id').then((deviceId) => {
          this.drivers.registerDevice(val.ID, deviceId).subscribe((data) => {
            console.log('registered');
            console.log(JSON.stringify(data.json()));
          }, (err) => {
            console.log('failed');
            console.log(err);
          }, () => {

          })
        })
      } else {
        this.navCtrl.push(LoginPage);
      }
    });
  }

  /* Get Today's Stops */
  public fetchStops(reload){
    var id = this.user.ID;
    this.stopsPvdr.load(reload, id);
  }

  /* Initialize Google Map */
  initMap() {
    let latLng = new google.maps.LatLng(40.7128, -74.0060);
    let mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  /* Toggle Map View */
  public toggleMap(){
    this.showList = !this.showList;
    this.showMap = !this.showMap;

    if(this.showMap){
      this.showStops();
    }
  }

  /* Show Stop Markers */
  showStops() {
    if(this.showMap){
      if(this.stopStatus == 'pending'){
        for(var i = 0; i < this.completedMarkers.length; i++){
          this.completedMarkers[i].setMap(null);
        }
        this.completedMarkers = [];
        this.stopsPvdr.stops.pending.forEach(stop => {
          this.maps.getCode(stop.address).subscribe(val=>{
            var latLng = val.json().results[0].geometry.location;
            var marker = new google.maps.Marker({
              position: latLng,
              map: this.map
            });
            this.pendingMarkers.push(marker);
          }, 
          err => { console.log(err)}, 
          () => {

          })
        })
      } else if(this.stopStatus == 'completed'){
        for(var i = 0; i < this.pendingMarkers.length; i++){
          this.pendingMarkers[i].setMap(null);
        }
        this.pendingMarkers = [];
        this.stopsPvdr.stops.completed.forEach(stop => {
          this.maps.getCode(stop.address).subscribe(val=>{
            var latLng = val.json().results[0].geometry.location;
            var marker = new google.maps.Marker({
              position: latLng,
              map: this.map
            });
            this.completedMarkers.push(marker);
          }, 
          err => { console.log(err)}, 
          () => {
            
          })
        })
      }
    }
  }

  /* Show Comment */
  showComment(comment){
    let alert = this.alertCtrl.create({
      title: 'Comment',
      subTitle: comment,
      buttons: ['OK']
    });
    alert.present();
  }


  /* Start Trip */
  startTrip(stop){
    this.navCtrl.push(StartPage, stop);
  }

  /* Complete Trip */
  complete(stop){
    var location: any;
    switch(stop.type){
      case 'dp': 
        location = DropPage;
        break;
      case 'pu':
        location = PickupPage;
        break;
      case 'sw':
        location = SwitchPage;
        break;
    }
    this.navCtrl.push(location, stop);
  }

  // Pull to refresh 
  refresh(event){
    this.fetchStops(true);
    event.complete();
  }

}
