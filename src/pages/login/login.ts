import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';

import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [ DriversProvider ]
})
export class LoginPage {
  public user: Driver;
  public password: any;
  public email: any;
  public connected: boolean;
  public invalid = false;

  public unregisterBackButtonAction: any;ß

  constructor(public navCtrl: NavController, 
    public drivers: DriversProvider, public platform: Platform,
    public storage: Storage, 
    private network: Network, 
    public alertCtrl: AlertController){
    this.storage.get('user').then((val) => {
      console.log(val);
      if(val != null){
        this.navCtrl.push(TabsPage);
      }
    });
    this.checkNetwork();
  }

  ionViewDidLoad() {
  }

  // Stop Hardware back button
  ionViewDidEnter() {
    this.initializeBackButtonCustomHandler();
  }
  ionViewWillLeave() {
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }
  public initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
      this.customHandleBackButton();
    }, 10);
  }
  private customHandleBackButton(): void {

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

  login() {
    // login
    if(this.connected == true){   
      this.drivers.loginDriver(this.email, this.password).subscribe(
        data => {
          console.log('data returned');
          let resp = data.json();
          if(resp.code == 200){
            this.storage.set('user', resp.data[0]);
            this.storage.get('onesignal-id').then((val) => {
              this.drivers.registerDevice(resp.data[0].ID, val).subscribe(
                data => {
                  this.navCtrl.push(TabsPage);
                },
                err => {
                  console.log(err.json());
                },
                () => {

                });
            });
          } else if (resp.code == 300){
            this.invalid = true;
          } else if (resp.code == 400){
            this.invalid = true;
          }
        },
        err => {
          if( err.status == 404 ) {
            console.log('Not found');
          }
        },
        () => console.log('Login complete')
      );
    } else {
      // Display connection error
      this.presentAlert();
    }
  }

  presentAlert() {
    var alert = this.alertCtrl.create({
      title: 'Offline',
      subTitle: 'You seem to be offline. Please check your connection and try again.',
      buttons: ['dismiss']
    });
    alert.present();
  }
}