import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, NavParams, ViewController, LoadingController, AlertController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';

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
  public routeCoords: any;
  public poly: any;
  public route: any;
  public startMarker: any;
  public endMarker: any;
  public curMarker: any;
  public endLoc: any;
  public connected = false;

  public locationError = 0;

  constructor( 
    public viewCtrl: ViewController,
    public params: NavParams, 
    public navCtrl: NavController, 
    public storage: Storage, 
    public drivers: DriversProvider, 
    public maps: MapsProvider,
    private geolocation: Geolocation,
    private network: Network, 
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public platform: Platform) {

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

    this.platform.ready().then((src) => {

      this.geolocation.getCurrentPosition({timeout: 50000, enableHighAccuracy: true}).then((resp) => {
        this.curLocation = resp;

        var start = resp.coords.longitude + ',' + resp.coords.latitude;
        this.maps.getCode(this.params.data.address).subscribe(
          data => {
            this.endLoc = data.json().results[0].geometry.location.lng + ',' + data.json().results[0].geometry.location.lat;
            var dest = start+'|'+this.endLoc;
            this.maps.getDirections(dest).subscribe(
              data => {
                this.route = data.json().routes[0];
                this.duration = this.route.summary.duration;
                this.routeCoords = google.maps.geometry.encoding.decodePath(this.route.geometry);
                var coordArray = [];

                var start = {"lat": this.routeCoords[0].lat(), "lng": this.routeCoords[0].lng()};
                var end = {"lat": this.routeCoords[this.routeCoords.length - 1].lat(), "lng": this.routeCoords[this.routeCoords.length - 1].lng()};

                this.startMarker = new google.maps.Marker({
                  position: start,
                  map: this.map,
                  label: 'A'
                });
                this.endMarker = new google.maps.Marker({
                  position: end,
                  map: this.map,
                  label: 'B'
                })

                this.routeCoords.forEach(function(routeItem){
                  var coordPair = {};
                  coordPair["lat"] = routeItem.lat();
                  coordPair["lng"] = routeItem.lng();
                  coordArray.push(coordPair);
                });

                this.poly = new google.maps.Polyline({
                  strokeColor: '#007aff',
                  strokeOpacity: 1,
                  strokeWeight: 3,
                  map: this.map,
                  path: coordArray
                });

                this.loading.dismiss();
              }, 
              err => {
                console.log(JSON.stringify(err.json()));
              },
              () => {
                console.log('fetched.');
              });
          }, 
          err => {
            console.log(err);
          },
          () => {

          });
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
    })
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
        
      },
      err => {
        console.log(err.json());
      },
      () => {
        console.log('started stops');
      }
    );

    this.notStarted = false;
    this.directionSteps = this.route.segments[0].steps;
    this.map.setCenter({lat: this.curLocation.coords.latitude, lng: this.curLocation.coords.longitude});
    this.map.setZoom(20);
    var image = {
      url: 'http://estyrosenberg.com/guma/location-icon.png',
      size: new google.maps.Size(200, 200),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(75, 75)};
    var curPos = {"lat": this.routeCoords[0].lat(), "lng": this.routeCoords[0].lng()};
    this.curMarker = new google.maps.Marker({
      position: curPos,
      map: this.map,
      icon: image
    });
    this.startMarker.setMap(null);

    this.counter = setInterval(() => {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.checkNetwork();

        // Check didn't arrive yet
        if((this.getDistance(resp.coords.latitude, resp.coords.longitude, this.routeCoords[this.routeCoords.length - 1].lat(), this.routeCoords[this.routeCoords.length - 1].lng(), 'M') * 5280) <= 100){
          clearInterval(this.counter);
          this.complete();
        }

        // Check if moved more than 20 feet
        if(this.connected){
          if((this.getDistance(this.curLocation.coords.latitude, this.curLocation.coords.longitude, resp.coords.latitude, resp.coords.longitude, 'M') * 2580) > 20){
            this.curLocation = resp;
            this.refreshRoute();
          }          
        } 
      }).catch((error) => {
        this.locationError ++;
        if(this.locationError > 5){
          this.loading.dismiss();
          this.viewCtrl.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Location Error',
            subTitle: 'Can\'t get current location. Check your location services and app permissions.',
            buttons: ['Dismiss']
          });
          alert.present();          
        }

      });
    }, 3000);
  }

  getDistance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
  }

  checkNetwork() {
    if(this.network.type != 'none' && this.network.type != 'unknown'){
      this.connected = true;
    }
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.connected = false;
    });

    let connectSubscription = this.network.onConnect().subscribe(() => {
      setTimeout(() => {
        if(this.network.type != 'none'){
          this.connected = true;
        }
      }, 3000);
    });
  }


  listDirections() {
    let modal = this.modalCtrl.create(DirectionsPage, {steps: this.directionSteps});;
    modal.present();
  }

  refreshRoute() {

    var start = this.curLocation.coords.longitude + ',' + this.curLocation.coords.latitude;
    var dest = start+'|'+this.endLoc;
    this.maps.getDirections(dest).subscribe(
      data => {
        this.route = data.json().routes[0];
        this.routeCoords = google.maps.geometry.encoding.decodePath(this.route.geometry);
        var coordArray = [];

        this.routeCoords.forEach(function(routeItem){
          var coordPair = {};
          coordPair["lat"] = routeItem.lat();
          coordPair["lng"] = routeItem.lng();
          coordArray.push(coordPair);
        });

        this.poly.setPath(coordArray);

        var curPos = {"lat": this.routeCoords[0].lat(), "lng": this.routeCoords[0].lng()};
        this.curMarker.setPosition(curPos);

        if((this.getDistance(this.curLocation.coords.latitude, this.curLocation.coords.longitude, coordArray[coordArray.length - 1][0], coordArray[coordArray.length - 1][0], 'M') * 5280) < 100){
          this.complete();
        }
      }, 
      err => { console.log(err); },
      () => {}
    );

    this.directionSteps = this.route.segments[0].steps;
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
