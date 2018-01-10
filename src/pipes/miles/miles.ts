import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the MilesPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'miles',
})
export class MilesPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(miles) {
    if(miles < 1){
      return Math.round(((miles * 5280) * 100) / 100) + ' ft';
    }
    return miles + ' mi';
  }
}
