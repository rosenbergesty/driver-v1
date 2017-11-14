import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { Stop } from '../../models/stop';

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

  public signature = '';
  public isDrawing = false;
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;

  public image: String;
  
  private signaturePadOptions: Object = {
    'canvasHeight': 200,
    'dotSize' : .01
  };
  public signatureImage: string;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public camera: Camera) {
    this.stop = new Stop();
    this.stop.address = '';

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

  save() {
    
  }
}
