// @ts-nocheck
import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { CONSTANTS } from '../helpers/constants';

@Pipe({
  standalone: false,

  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string, format?: string): unknown {
    const _format: any = format || CONSTANTS.DATE_TIME_FORMAT.DATE_TIME;
    try {
      value = moment(value).format(_format);
    } catch (ex) {}
    return value;
  }


}
