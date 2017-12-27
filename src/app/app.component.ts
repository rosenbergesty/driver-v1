import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { StopsProvider } from '../providers/stops/stops';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(private platform: Platform, statusBar: StatusBar, 
    splashScreen: SplashScreen, private storage: Storage,
    private stopsPvdr: StopsProvider) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      // OneSignal
      var notificationOpenedCallback = function(jsonData) {
        storage.get('user').then((val) => {
          var id = val.ID;
          var date = new Date();
          var today = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
          stopsPvdr.load(true, id);
        })
      }

      window["plugins"].OneSignal
      .startInit("4c7e2b16-f59d-40cd-9691-6b22ee834474", "404437292662")
      .handleNotificationOpened(notificationOpenedCallback)
      .endInit();

      window["plugins"].OneSignal.sendTag("driverId", "1");

      window["plugins"].OneSignal.getPermissionSubscriptionState(function(status) {
        storage.set("onesignal-id", status.subscriptionStatus.userId);
        console.log('player id = ' + status.subscriptionStatus.userId);

        storage.get('onesignal-id').then((val) => {
          console.log('player id ' + val);
        });
      });
    });
  }
}
