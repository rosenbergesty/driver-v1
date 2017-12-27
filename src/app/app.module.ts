import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Camera } from '@ionic-native/camera';
// import { OneSignal } from '@ionic-native/onesignal';

import { SignaturePadModule } from 'angular2-signaturepad';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { StartPage } from '../pages/start/start';
import { MapPage } from '../pages/map/map';
import { DropPage } from '../pages/drop/drop';
import { PickupPage } from '../pages/pickup/pickup';
import { SwitchPage } from '../pages/switch/switch';
import { DirectionsPage } from '../pages/directions/directions';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DriversProvider } from '../providers/drivers/drivers';
import { StopsProvider } from '../providers/stops/stops';

import { DropPageModule } from '../pages/drop/drop.module';
import { PickupPageModule } from '../pages/pickup/pickup.module';
import { SwitchPageModule } from '../pages/switch/switch.module';

import { SecondsPipe } from '../pipes/seconds/seconds';
import { MilesPipe } from '../pipes/miles/miles';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    StartPage,
    MapPage,
    DirectionsPage,
    // DropPage,
    // PickupPage,
    // SwitchPage,
    SecondsPipe,
    MilesPipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true
    }),
    IonicStorageModule.forRoot(),
    HttpModule,
    DropPageModule,
    PickupPageModule,
    SwitchPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    StartPage,
    MapPage,
    DropPage,
    PickupPage,
    SwitchPage,
    DirectionsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DriversProvider,
    Geolocation,
    Network, 
    Camera,
    DriversProvider,
    StopsProvider,
    // OneSignal
  ]
})
export class AppModule {}
