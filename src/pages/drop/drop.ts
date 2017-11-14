import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

import { Stop } from '../../models/stop';

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

  public signature = '';
  public isDrawing = false;
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  
  private signaturePadOptions: Object = {
    'canvasHeight': 200,
    'dotSize' : .01
  };
  public signatureImage: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.stop = new Stop();
    this.stop.address = '';

  }

  ionViewDidLoad() {
    this.stop = this.navParams.data;
  }

  ngAfterViewInit() {
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }

  save() {
    
  }

}
