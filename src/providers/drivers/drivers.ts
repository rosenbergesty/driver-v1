import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
// import { NavController } from 'ionic-angular';
import 'rxjs/add/operator/map';

// import { LoginPage } from '../../pages/login/login';

/*
  Generated class for the DriversProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DriversProvider {
  private baseUrl = "http://estyrosenberg.com/guma/backend";
  public user: any;

  constructor(public http: Http, public storage: Storage) {
  }

  loginDriver(email, password) {
    this.user = this.http.post(this.baseUrl + `/login-driver.php`, {username: email, password: password});
    return this.user;
  }

  logout() {
    this.user = {};
  }

  load() {
    this.storage.get('user').then((val) => {
      this.user = val;
    })
  }

  loadDriver() {
    if (this.user) {
      return Promise.resolve(this.user);
    }
 
    return new Promise(resolve => {
      this.storage.get('user')
        .then(data => {
          if(data != null){
            this.user = data;
            resolve(this.user);            
          }
        });
    });
  }

  getDriver() {
    if(this.user){
      return this.user;
    } else {
      this.loadDriver().then(data => {
        return this.user;
      })
    }
  }

  startStop(id, eta, time){
    return this.http.post(this.baseUrl + `/start-stop.php`, {id: id, eta: eta, start: time});
  }

  cancelStop(id){
    return this.http.post(this.baseUrl + `/cancel-stop.php`, {id: id});
  }

  completeStop(id, time){
    return this.http.post(this.baseUrl + `/complete-stop.php`, {id: id, time: time});
  }

  saveDrop(id, time, date, containerNumber, comments, signature, driver, dropTicket, address) {
    return this.http.post(this.baseUrl + `/save-drop.php`, {id: id, time: time, date: date, container: containerNumber, comments: comments, signature: signature, driver: driver, dropTicket: dropTicket, address: address});
  }

  savePickup(id, time, date, containerNumber, pic) {
    return this.http.post(this.baseUrl + `/save-pickup.php`, {id: id, time: time, date: date, container: containerNumber, pic: pic});
  }

  saveSwitch(id, time, date, containerOne, containerTwo, comments, signature, pic, dropTicket, driver, address){
    return this.http.post(this.baseUrl + `/save-switch.php`, {id: id, time: time, date: date, container: containerOne, containerTwo: containerTwo, comments: comments, signature: signature, pic: pic, driver: driver, dropTicket: dropTicket, address: address});
  }

  registerDevice(id, deviceId){
    return this.http.post(this.baseUrl + `/add-device.php`, {id: id, device: deviceId}); 
  }

}
