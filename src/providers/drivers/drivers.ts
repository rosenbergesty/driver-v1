import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the DriversProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DriversProvider {
  baseUrl = "http://estyrosenberg.com/guma/backend";

  constructor(public http: Http) {
  }

  loginDriver(email, password) {
    let user = this.http.post(this.baseUrl + `/login-driver.php`, {username: email, password: password});
    return user;
  }

  getStopsByDate(driverId, date) {
    return this.http.post(this.baseUrl + `/fetch-stops-by-date.php`, {id: driverId, date: date}); 
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
