import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { MapsProvider } from '../../providers/maps/maps';
import { StartPage } from '../start/start';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ DriversProvider, MapsProvider ]
})
export class HomePage {

  public user: Driver;
  public pendingStops = [];
  public completedStops = [];
  public stopStatus = 'pending';

  public showList = true;
  public showMap = false;

  public pendingMarkers = [];
  public completedMarkers = [];

  @ViewChild('map') mapElement;
  map: any;

  constructor( public modalCtrl: ModalController, public navCtrl: NavController, public storage: Storage, public drivers: DriversProvider, public maps: MapsProvider) {
    this.storage.get('user').then((val) => {
      this.user = val;
      this.fetchStops()
    });
  }

  public fetchStops(){
    var id = this.user.ID;
    var date = new Date();
    var today = (date.getDate() - 1) + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

    // Get today's stops
    this.drivers.getStopsByDate(id, today).subscribe(
      data => {
        console.log(data.json());
        var resp = data.json();
        if(resp == '0 results'){
          // No results
        } else {
          resp.forEach(stop =>{
            if(stop.status == 'pending'){
              this.pendingStops.push(stop);
              this.showStops();
            } else if (stop.status == 'completed'){
              this.completedStops.push(stop);
            }
          })
        }
      },
      err => {
        console.log(err);
      },
      () => {
        console.log('fetched stops');
      });
  }

  public toggleMap(){
    this.showList = !this.showList;
    this.showMap = !this.showMap;

    if(this.showMap){
      this.showStops();
    }
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
  }

  showStops() {
    if(this.showMap){
      if(this.stopStatus == 'pending'){
        for(var i = 0; i < this.completedMarkers.length; i++){
          this.completedMarkers[i].setMap(null);
        }
        this.completedMarkers = [];
        this.pendingStops.forEach(stop => {
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
            console.log('got Address');
          })
        })
      } else if(this.stopStatus == 'completed'){
        for(var i = 0; i < this.pendingMarkers.length; i++){
          this.pendingMarkers[i].setMap(null);
        }
        this.pendingMarkers = [];
        this.completedStops.forEach(stop => {
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
            console.log('got Address');
          })
        })
      }
    }
  }

  startTrip(stop){
    // let modal = this.modalCtrl.create(StartPage, stop);
    // modal.present();
    this.navCtrl.push(StartPage, stop);
  }

}
