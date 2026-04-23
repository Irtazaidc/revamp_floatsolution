// @ts-nocheck
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,

  name: 'getValueFromArray'
})
export class GetValueFromArrayPipe implements PipeTransform {

  transform(filterValue: string, key: any, returnKey:any, fullDataSet: object[]): unknown {
    let valueToReturn = '';
    const filteredData = fullDataSet.filter(a => a[key] == filterValue) || [];
    if(filteredData.length) {
      valueToReturn = filteredData[0][returnKey];
    }
    return valueToReturn;
  }

}
