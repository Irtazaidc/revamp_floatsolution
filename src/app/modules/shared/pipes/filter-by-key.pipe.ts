// @ts-nocheck
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,

  name: 'filterByKey'
})
export class FilterByKeyPipe implements PipeTransform {

  // transform(value: unknown, ...args: unknown[]): unknown {
  //   return null;
  // }
  transform(values: object[], filterValue: string, key: any, fullDataSet: object[] = null): unknown {
    let filteredData: object[] = values;
    filterValue = (filterValue || '').toString();
    if(filterValue != '' && fullDataSet && fullDataSet.length) {
      filteredData = fullDataSet;
    }
    filteredData = filteredData.filter(a => {
      let found = false;
      key.forEach(element => {
        if(!found) {
          found = (a[element]+'').toLowerCase().indexOf(filterValue.toLowerCase()) > -1 || (a[element]+'').replace(/-/g, '').toLowerCase().indexOf(filterValue.toLowerCase()) > -1;
        }
      });
      return found;
    }) || [];
    return filteredData;
  }

}
