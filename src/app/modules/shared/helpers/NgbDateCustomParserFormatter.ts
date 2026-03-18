// @ts-nocheck
import { Injectable } from "@angular/core";
import { NgbDateParserFormatter, NgbDateStruct, NgbDateAdapter } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";

// Ref. link: https://stackoverflow.com/questions/55118888/how-to-change-ngbdatepicker-format-from-yyyy-mm-dd-to-mm-dd-yyyy-angular-4/55388300
// Ans. Link: https://stackoverflow.com/a/55388300
/*
@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split("/");
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { day: toInteger(dateParts[0]), month: null, year: null };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return {
          day: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          year: null
        };
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return {
          day: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          year: toInteger(dateParts[2])
        };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    return date ? `${isNumber(date.day) ? padNumber(date.day) : ""} ${isNumber(date.month) ? moment().month(padNumber(date.month-1)).format('MMM') : ""} ${date.year}` : "";
  }
}

*/
function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return "";
  }
}


// https://ng-bootstrap.github.io/#/components/datepicker/examples
// https://ng-bootstrap.github.io/#/components/datepicker/examples#adapter

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
// @Injectable()
// export class CustomAdapter extends NgbDateAdapter<string> {

//   readonly DELIMITER = '-';

//   fromModel(value: string | null): NgbDateStruct | null {
//     console.log('frommodel =>', value);
//     if (value) {
//       let date = value.split(this.DELIMITER);
//       return {
//         day : parseInt(date[0], 10),
//         month : parseInt(date[1], 10),
//         year : parseInt(date[2], 10)
//       };
//     }
//     return null;
//   }

//   toModel(date: NgbDateStruct | null): string | null {
//     console.log('tomodel =>', date);
//     return date ? padNumber(date.day) + this.DELIMITER + padNumber(date.month) + this.DELIMITER + date.year : null;
//     // return date ? `${isNumber(date.day) ? padNumber(date.day) : ""} ${isNumber(date.month) ? moment().month(padNumber(date.month-1)).format('MMM') : ""} ${date.year}` : "";
//   }
// }

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '-';

  parse(value: string): NgbDateStruct | null {
    // console.log('parse =>', value);
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    // console.log('format =>', date);
    return date ? padNumber(date.day) + this.DELIMITER + padNumber(date.month) + this.DELIMITER + date.year : '';
  }
}