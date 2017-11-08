import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class MapsProvider {
  baseUrl = "https://maps.googleapis.com/maps/api/geocode/";
  key = "AIzaSyAax1vQZ0zrLSHuOFgfKfaql60P6Z_20xU";

  constructor(public http: Http) {
  }

  getCode(address) {
    let user = this.http.get(this.baseUrl + `json?address=` + address + `&key=` + this.key);
    return user;
  }
}
