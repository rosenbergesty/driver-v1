import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { StopsProvider } from '../../providers/stops/stops';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  constructor(public navCtrl: NavController, 
    public stopsPvdr: StopsProvider,
    public storage: Storage) {

  }

  ionViewDidLoad() {
    this.storage.get('user').then((val) => {
      this.stopsPvdr.fetchSomeStops(val, 10);
    });
  }

  doInfinite(infiniteScroll) {
    this.storage.get('user').then((val) => {
      this.stopsPvdr.fetchMoreStops(val, 10);
    }); 
    infiniteScroll.complete();
  }

}
