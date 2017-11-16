import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import * as firebase from 'firebase';
import { environment } from '../../environments/environment';

import { Stop } from '../../models/stop';
import { DriversProvider } from '../../providers/drivers/drivers';


/**
 * Generated class for the PickupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pickup',
  templateUrl: 'pickup.html',
})
export class PickupPage {
  public stop: Stop;
  public image: String;
  public containerNumber: any;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, public camera: Camera, 
    public drivers: DriversProvider) {
    this.stop = new Stop();
    this.stop.address = '';
    firebase.initializeApp(environment.firebase);
  }

  ionViewDidLoad() {
    this.stop = this.navParams.data;
  }

  takePicture(){
    const options: CameraOptions = {
      quality: 100, 
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      this.image = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      console.log(err);
    })
  }

  dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++){
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }

  save() {
    // Signature
    let img = this.dataURItoBlob(this.image);
    var uploadTask = firebase.storage().ref().child('images/img-'+this.stop.ID+'.png').put(img);
    uploadTask.then(this.onSuccess, this.onError);

    // Save Stop
    var timeDate = new Date();
    var time = (timeDate.getHours()<10?'0':'') + timeDate.getHours() + ':' + (timeDate.getMinutes()<10?'0':'') + timeDate.getMinutes();
    var date = timeDate.getDate() + '/' + timeDate.getMonth() + '/' + timeDate.getFullYear();

    this.drivers.savePickup(this.stop.ID, time, date, this.containerNumber, 'images/img-'+this.stop.ID+'.png').subscribe(
      data => {
        // console.log(data.json());
        console.log('successful save');
      }, err => {
        console.log(JSON.stringify(err));
        console.log('error save');
      }, () => {
        console.log('saved.');
      });
  }

  onSuccess = (snapshot) => {
    console.log(snapshot);
  }
  onError = (error) => {
    console.log('error', error);
  }


}
