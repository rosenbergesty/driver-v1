import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Driver } from '../../models/driver';
import { Stop } from '../../models/stop';
import { DriversProvider } from '../../providers/drivers/drivers';

import { GoogleMaps, GoogleMap } from '@ionic-native/google-maps';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ DriversProvider ]
})
export class HomePage {

  public user: Driver;
  public pendingStops = [];
  public completedStops = [];
  public stopStatus = 'pending';

  public showList = true;
  public showMap = false;

  constructor(private backgroundGeolocation: BackgroundGeolocation, public navCtrl: NavController, public storage: Storage, public drivers: DriversProvider) {

    this.storage.get('user').then((val) => {
      this.user = val;
      this.fetchStops()
    });

    this.getLocation();
  }

  public fetchStops(){
    var id = this.user.ID;
    var date = new Date();
    var today = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

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
  }


  getLocation(){ 
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 20,
      distanceFilter: 30,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };
    this.backgroundGeolocation.configure(config).subscribe(
      (location: BackgroundGeolocationResponse) => {
        console.log('location: ' + location);
        this.backgroundGeolocation.finish();
      }
    ); 

    // start recording location
    this.backgroundGeolocation.start();

    // If you wish to turn OFF background-tracking, call the #stop method.
    this.backgroundGeolocation.stop();
  } 
}
