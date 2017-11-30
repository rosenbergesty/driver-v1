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
      .startInit("9f03606d-9cc7-46a9-8083-f25629aba6be", "608652425053")
      .handleNotificationOpened(notificationOpenedCallback)
      .endInit();

      window["plugins"].OneSignal.sendTag("driverId", "1");

      window["plugins"].OneSignal.getPermissionSubscriptionState(function(status) {
        storage.set("onesignal-id", status.subscriptionStatus.userId);
      });
    });
  }
}
