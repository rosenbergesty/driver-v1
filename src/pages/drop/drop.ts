import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase';
import { environment } from '../../environments/environment';

import { Stop } from '../../models/stop';
import { DriversProvider } from '../../providers/drivers/drivers';
import { StopsProvider } from '../../providers/stops/stops';

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
    public loadingCtrl: LoadingController, public stopsPvdr: StopsProvider,
    public navParams: NavParams, public drivers: DriversProvider,
    public alertCtrl: AlertController, public storage: Storage) {
    this.stop = new Stop();
    this.stop.address = '';
    try {
      firebase.initializeApp(environment.firebase);
    } catch (err) {
      // we skip the "already exists" message which is
      // not an actual error when we're hot-reloading
      if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack)
      }
    }
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

  dataURItoBlobPDF(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++){
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'application/pdf'});
  }

  save() {
    // Loader 
    let loading = this.loadingCtrl.create({
      content: 'Saving drop...'
    });
    loading.present();

    // Signature
    this.signature = this.signaturePad.toDataURL();
    let sign = this.dataURItoBlob(this.signature);
    var uploadTask = firebase.storage().ref().child('signatures/signature-'+this.stop.ID+'.png').put(sign);
    uploadTask.then(this.onSuccess, this.onError);

    // Save Stop
    var timeDate = new Date();
    var time = (timeDate.getHours()<10?'0':'') + timeDate.getHours() + ':' + (timeDate.getMinutes()<10?'0':'') + timeDate.getMinutes();
    var date = timeDate.getDate() + '/' + timeDate.getMonth() + '/' + timeDate.getFullYear();

    this.storage.get('user').then((val) => {
      var name = val.name;
      this.drivers.saveDrop(this.stop.ID, time, date, this.containerNumber, this.comments, 'signatures/signature-'+this.stop.ID+'.png', name, 'drop-tickets/drop-'+this.stop.ID+'.pdf', this.stop.address).subscribe(
        data => {
          if(data.json().code == '200'){
            var context = this;
            var pdf = data.json().message;
            firebase.storage().ref().child('drop-tickets/drop-'+this.stop.ID+'.pdf').putString(pdf, 'base64').then(function(snapshot){
              if(context.drivers.user){
                    context.stopsPvdr.load(true, context.drivers.user.ID);
                    loading.dismiss();
                    context.navCtrl.popToRoot();            
                } else {
                  context.drivers.loadDriver().then((val) => {
                    context.stopsPvdr.load(true, val.ID);
                    loading.dismiss();
                    context.navCtrl.popToRoot();
                  }); 
                }
            });
          } else {
            // Alert that error
            loading.dismiss();
            let alert = this.alertCtrl.create({
              title: 'Error Saving Drop',
              subTitle: 'Please try again or contact support',
              buttons: ['Dismiss']
            });
            alert.present();
          }

        }, err => {
          console.log(JSON.stringify(err));
        }, () => {
          
        });
    })
  }

  onSuccess = (snapshot) => {
    console.log(snapshot);
  }
  onError = (error) => {
    console.log('error', error);
  }

  goToHome(){
    this.navCtrl.popToRoot();
  }

}
