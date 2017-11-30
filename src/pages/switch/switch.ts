import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';

import * as firebase from 'firebase';
import { environment } from '../../environments/environment';

import { Stop } from '../../models/stop';
import { DriversProvider } from '../../providers/drivers/drivers';
import { StopsProvider } from '../../providers/stops/stops';

/**
 * Generated class for the SwitchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-switch',
  templateUrl: 'switch.html',
})
export class SwitchPage {

  public stop: Stop;
  public containerOne: any;
  public containerTwo: any;
  public comments: any;
  public image: String;

  public signature = '';
  public isDrawing = false;
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  private signaturePadOptions: Object = {
    'canvasHeight': 200,
    'dotSize' : .01
  };
  public signatureImage: string;

  constructor(public navCtrl: NavController, public storage: Storage,
    public navParams: NavParams, public alertCtrl: AlertController,
    public camera: Camera, public loadingCtrl: LoadingController,
    public drivers: DriversProvider, public stopsPvdr: StopsProvider) {
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

  dataURItoBlobPDF(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++){
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'application/pdf'});
  }

  save() {
    console.log(this.containerTwo);
    if (this.containerOne && this.image && this.containerTwo){
      // Loader 
      let loading = this.loadingCtrl.create({
        content: 'Saving switch...'
      });
      loading.present();

      // Image
      let img = this.dataURItoBlob(this.image);
      var uploadTask = firebase.storage().ref().child('images/img-'+this.stop.ID+'.png').put(img);
      uploadTask.then(this.onSuccess, this.onError);

      // Signature
      this.signature = this.signaturePad.toDataURL();
      let sign = this.dataURItoBlob(this.signature);
      var uploadTask2 = firebase.storage().ref().child('signatures/signature-'+this.stop.ID+'.png').put(sign);
      uploadTask2.then(this.onSuccess, this.onError);

      // Save Stop
      var timeDate = new Date();
      var time = (timeDate.getHours()<10?'0':'') + timeDate.getHours() + ':' + (timeDate.getMinutes()<10?'0':'') + timeDate.getMinutes();
      var date = timeDate.getDate() + '/' + timeDate.getMonth() + '/' + timeDate.getFullYear();

      this.storage.get('user').then((val) => {
        var name = val.name;
        this.drivers.saveSwitch(this.stop.ID, time, date, this.containerOne, this.containerTwo, this.comments, 'signatures/signature-'+this.stop.ID+'.png', 'images/img-'+this.stop.ID+'.png', name, 'drop-tickets/drop-'+this.stop.ID+'.pdf', this.stop.address).subscribe(
          data => {
            console.log('Completed Drop');
            console.log(JSON.stringify(data));
            console.log(data.json());

            if(data.json().code == '200'){
              var context = this;
              var pdf = data.json().message;
              firebase.storage().ref().child('drop-tickets/drop-'+this.stop.ID+'.pdf').putString(pdf, 'base64').then(function(snapshot){
                console.log('Uploaded file');
                if(context.drivers.user){
                  console.log('hey');
                    context.stopsPvdr.load(true, context.drivers.user.ID);
                    loading.dismiss();
                    context.navCtrl.popToRoot();            
                } else {
                  console.log('hey2');
                  context.drivers.loadDriver().then((val) => {
                    console.log('hey3');
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
    
  }


  onSuccess = (snapshot) => {
    console.log(snapshot);
  }
  onError = (error) => {
    console.log('error', error);
  }
}
