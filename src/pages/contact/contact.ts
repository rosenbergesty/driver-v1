import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { DriversProvider } from '../../providers/drivers/drivers';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController, 
    public drivers: DriversProvider,
    public storage: Storage ) {

  }

  ionViewDidLoad() {
    this.drivers.load();
  }

  logout() {
    this.drivers.logout();
    this.storage.remove('user');
    this.navCtrl.push(LoginPage);
  }
}
