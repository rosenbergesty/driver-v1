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

  testDriver(){
    return 'hey';
  }

  getStopsByDate(driverId, date) {
    return this.http.post(this.baseUrl + `/fetch-stops-by-date.php`, {id: driverId, date: date}); 
  }
}
