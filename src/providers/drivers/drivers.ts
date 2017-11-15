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

  saveDrop(id, time, date, containerNumber, comments, signature) {
    return this.http.post(this.baseUrl + `/save-drop.php`, {id: id, time: time, date: date, container: containerNumber, comments: comments, signature: signature});
  }
}
