import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class MapsProvider {
  baseUrl = "https://maps.googleapis.com/maps/api/geocode/";
  key = "AIzaSyAax1vQZ0zrLSHuOFgfKfaql60P6Z_20xU";
  routeUrl = "https://api.openrouteservice.org/directions?api_key=58d904a497c67e00015b45fc1f7bfba8571d498ab941e848f17b7771";

  constructor(public http: Http) {
  }

  getCode(address) {
    let user = this.http.get(this.baseUrl + `json?address=` + address + `&key=` + this.key);
    return user;
  }
  getDirections(coords) {
    let route = this.http.get(this.routeUrl + `&coordinates=` + coords + `&profile=driving-hgv&instructions_format=html&units=mi&options=%7B"vehicle_type":"hgv","profile_params":%7B"length":30,"width":10%7D%7D`);
    return route;
  }
}
