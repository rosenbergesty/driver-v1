import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(private platform: Platform, statusBar: StatusBar, 
    splashScreen: SplashScreen, private storage: Storage) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();

      // OneSignal
      window["plugins"].OneSignal.setLogLevel({logLevel: 6, visualLevel: 0});

      var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCalback: ' + JSON.stringify(jsonData));
      }

      window["plugins"].OneSignal
      .startInit("9f03606d-9cc7-46a9-8083-f25629aba6be", "608652425053")
      .handleNotificationOpened(notificationOpenedCallback)
      .endInit();

      window["plugins"].OneSignal.sendTag("driverId", "1");

      window["plugins"].OneSignal.getPermissionSubscriptionState(function(status) {
        storage.set("onesignal-id", status.subscriptionStatus.userId);
      });

      // console.log('start');
      // this.oneSignal.setLogLevel({logLevel: 6, visualLevel: 0});
      // this.oneSignal.startInit('9f03606d-9cc7-46a9-8083-f25629aba6be', '608652425053');
      // this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
      // this.oneSignal.handleNotificationReceived().subscribe(() => {
      //  // do something when notification is received
      //   console.log('notification recieved');
      // });
      // this.oneSignal.handleNotificationOpened().subscribe(() => {
      //   // do something when a notification is opened
      //   console.log('notification opened');
      // });

      // this.oneSignal.endInit();
      // console.log('end');

    });
  }
}
