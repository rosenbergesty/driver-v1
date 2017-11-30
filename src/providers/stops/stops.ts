import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the StopsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StopsProvider {
  baseUrl = "http://estyrosenberg.com/guma/backend";
  stops = {pending: [], completed: []};
  allStops = [];

  constructor(public http: Http) {

  }

  /* Load Stops */
  load(reload, driverId) {    
    var date = new Date();
    var today = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

    if(reload){
      this.http.post(this.baseUrl + `/fetch-stops-by-date.php`, {id: driverId, date: today})
        .map(res => res.json())
        .subscribe(data => {
          console.log(data);
          this.stops.pending = [];
          this.stops.completed = [];
          if(data != '0 results'){
            data.forEach(stop =>{
              if(stop.status == 'pending'){
                this.stops.pending.push(stop);
              } else if (stop.status == 'completed'){
                this.stops.completed.push(stop);
              }
            });
          }
        }); 

    }
  }

  fetchSomeStops(driver, count) {
    this.http.post(this.baseUrl + '/fetch-some-stops.php', {driverID: driver.ID, count: count, total: this.allStops.length})
    .map(res => res.json())
    .subscribe(data => {
      this.allStops = data;
    }); 
  }
  fetchMoreStops(driver, count) {
    this.http.post(this.baseUrl + '/fetch-some-stops.php', {driverID: driver.ID, count: count, total: this.allStops.length})
    .map(res => res.json())
    .subscribe(data => {
      this.allStops = this.allStops.concat(data);
      console.log(this.allStops);
    }); 
  }

}
