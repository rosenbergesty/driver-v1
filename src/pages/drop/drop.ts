import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

import * as firebase from 'firebase';
import { environment } from '../../environments/environment';

import { Stop } from '../../models/stop';
import { DriversProvider } from '../../providers/drivers/drivers';

/**
 * Generated class for the DropPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-drop',
  templateUrl: 'drop.html',
})
export class DropPage {
  public stop: Stop;

  public containerNumber: any;
  public comments: any;

  public signature = '';
  public isDrawing = false;
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  
  private signaturePadOptions: Object = {
    'canvasHeight': 200,
    'dotSize' : .01
  };
  public signatureImage: string;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, public drivers: DriversProvider) {
    this.stop = new Stop();
    this.stop.address = '';
    firebase.initializeApp(environment.firebase);
  }

  ionViewDidLoad() {
    this.stop = this.navParams.data;
  }

  ngAfterViewInit() {
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
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
    this.signature = this.signaturePad.toDataURL();
    let sign = this.dataURItoBlob(this.signature);
    var uploadTask = firebase.storage().ref().child('signatures/signature-'+this.stop.ID+'.png').put(sign);
    uploadTask.then(this.onSuccess, this.onError);

    // Save Stop
    var timeDate = new Date();
    var time = (timeDate.getHours()<10?'0':'') + timeDate.getHours() + ':' + (timeDate.getMinutes()<10?'0':'') + timeDate.getMinutes();
    var date = timeDate.getDate() + '/' + timeDate.getMonth() + '/' + timeDate.getFullYear();

    this.drivers.saveDrop(this.stop.ID, time, date, this.containerNumber, this.comments, 'signatures/signature-'+this.stop.ID+'.png').subscribe(
      data => {
        console.log(data.json());
      }, err => {
        console.log(err);
      }, () => {
        
      });
  }

  onSuccess = (snapshot) => {
    console.log(snapshot);
  }
  onError = (error) => {
    console.log('error', error);
  }

}
