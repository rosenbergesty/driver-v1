import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Driver } from '../../models/driver';
import { DriversProvider } from '../../providers/drivers/drivers';
import { Storage } from '@ionic/storage';
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

  constructor(public navCtrl: NavController, public drivers: DriversProvider, public storage: Storage){

  }

  login() {
    // this.navCtrl.push(HomePage);

    // login
    this.drivers.loginDriver(this.email, this.password).subscribe(
      data => {
        let resp = data.json();
        if(resp.code == 200){
          this.storage.set('user', resp.data[0]);
          this.navCtrl.push(TabsPage);
        } else if (resp.code == 300){
          console.log('Wrong Password');
        } else if (resp.code == 400){
          console.log('Wrong username');
        }
      },
      err => {
        if( err.status == 404 ) {
          console.log('Not found');
        }
      },
      () => console.log('Login complete')
    );
    console.log('Email: ' + this.email + ' - Pass: ' + this.password);

  }
}