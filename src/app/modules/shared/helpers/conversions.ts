// @ts-nocheck
import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";

export class Conversions {
  static mergeDateAndTime = (date, time) => {
    const newDate = new Date(date);
    newDate.setHours(time.hour);
    newDate.setMinutes(time.minute);
    newDate.setSeconds(time.second);
    newDate.setMilliseconds(0);
    return newDate;
  };
  static mergeDateTime = (date: NgbDateStruct, time: NgbTimeStruct) => {
    const { month, day, year } = date;
    const { hour, minute, second } = time;
    const formattedDate = `${month.toString().padStart(2, "0")}/${day
      .toString()
      .padStart(2, "0")}/${year} ${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:${second.toString().padStart(2, "0")}.000`;
    return formattedDate;
  };
  static formatDateObject(date: NgbDateStruct, time?: string): string {
    const _startTime = "00:00:00.000";
    const _endTime = "23:59:59.996";
    let _time = _startTime;
    let _format = "MM/DD/YYYY HH:mm:ss.000";
    if (time == "end") {
      _time = _endTime;
      _format = "MM/DD/YYYY HH:mm:ss.999";
    }
    return moment(
      date.month + "/" + date.day + "/" + date.year + " " + _time,
      _format
    ).format();
  }  

  static formatDateISOObject(date: any, time?: string): string {
  // If already ISO string → return as it is
  if (typeof date === "string" && moment(date, moment.ISO_8601, true).isValid()) {
    return date;
  }

  // If NgbDateStruct → proceed with conversion
  const _startTime = "00:00:00.000";
  const _endTime = "23:59:59.996";
  const _time = time === "end" ? _endTime : _startTime;
  const _format = time === "end" ? "MM/DD/YYYY HH:mm:ss.999" : "MM/DD/YYYY HH:mm:ss.000";

  return moment(
    `${date.month}/${date.day}/${date.year} ${_time}`,
    _format
  ).format(); // default ISO output
}

  static formatTimeObject(time: any): string | null {
    if (!time) return null;
  
    let date: Date;
  
    // If it's already a Date object, use it directly
    if (time instanceof Date) {
      date = time;
    } 
    // If it's a string, parse it correctly
    else if (typeof time === 'string') {
      const parsedTime = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/); // Matches HH:mm or HH:mm:ss
      if (parsedTime) {
        const hours = parseInt(parsedTime[1], 10);
        const minutes = parseInt(parsedTime[2], 10);
        const seconds = parsedTime[3] ? parseInt(parsedTime[3], 10) : 0;
        date = new Date();
        date.setHours(hours, minutes, seconds, 0);
      } else {
        return null; // Invalid string format
      }
    } 
    // If it's an object (e.g., Angular Material time picker format), extract hours/minutes
    else if (typeof time === 'object' && 'hour' in time && 'minute' in time) {
      date = new Date();
      date.setHours(time.hour, time.minute, 0, 0);
    } 
    else {
      return null; // Unsupported format
    }
  
    return date.toLocaleTimeString('en-GB', { hour12: false }); // Ensures HH:mm:ss format
  }
  static formatDateTimeObject(
    date: NgbDateStruct,
    time: NgbTimeStruct | null,
    isEndTime = false
  ): string {
    const _defaultStartTime = "00:00:00";
    const _defaultEndTime = "23:59:59";
  
    // Default time based on whether it's an end or start time
    let _time = isEndTime ? _defaultEndTime : _defaultStartTime;
  
    if (time) {
      // Handle time properly with padding
      const hours = time.hour.toString().padStart(2, "0");
      const minutes = time.minute.toString().padStart(2, "0");
      const seconds = time.second ? time.second.toString().padStart(2, "0") : "00";
      _time = `${hours}:${minutes}:${seconds}`;
    }
  
    // Construct the date-time string
    const dateString = `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day
      .toString()
      .padStart(2, "0")}T${_time}`;
  
    // Format to required API format with local offset
    return moment(dateString).format("YYYY-MM-DDTHH:mm:ssZ");
  }
  static formatDateObjectToString(
    date: NgbDateStruct,
    time?: string | NgbTimeStruct
  ): string {
    const _startTime = "00:00:00.000";
    const _endTime = "23:59:59.996";
    let _time = _startTime;
    let _format = "MM/DD/YYYY HH:mm:ss.000";
    if (time == "end") {
      _time = _endTime;
      _format = "MM/DD/YYYY HH:mm:ss.999";
    }
    if (typeof time == "object") {
      _time = time.hour + ":" + time.minute + ":00.000";
    }
    return date.month + "/" + date.day + "/" + date.year + " " + _time;
  }
  static getEndDateObject(): NgbDateStruct {
    return {
      day: moment().date(),
      month: moment().month() + 2,
      year: moment().year(),
    };
  }
  static getEndDateObjectNew(): NgbDateStruct {
    return {
      day: Number(moment().endOf("month").format("DD")),
      month: moment().month() + 1,
      year: moment().year(),
    };
  }

  static convertToISOFormat(dateString: string): string {
  if (!dateString || dateString.length !== 14) return "";

  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1; // JS months are 0-based
  const day = parseInt(dateString.substring(6, 8));
  const hour = parseInt(dateString.substring(8, 10));
  const minute = parseInt(dateString.substring(10, 12));
  const second = parseInt(dateString.substring(12, 14));

  const dt = new Date(year, month, day, hour, minute, second);

  // Format as ISO string without milliseconds
  return dt.toISOString().split('.')[0];
}

 static getCurrentDateISOFormat(time?: string): string {
  const date = this.getCurrentDateObject();
  const _startTime = "00:00:00";
  const _endTime = "23:59:59";
  let _time = _startTime;

  if (time === "end") {
    _time = _endTime;
  }

  // Build a valid date string for parsing
  const dateString = `${date.year}-${date.month}-${date.day} ${_time}`;

  // Convert to required output format
  return moment(dateString, "YYYY-M-D HH:mm:ss").format("YYYYMMDDHHmmss");
}
  static getCurrentDateObject(): NgbDateStruct {
    return {
      day: moment().date(),
      month: moment().month() + 1,
      year: moment().year(),
    };
  }
  static getPreviousDateObject(): NgbDateStruct {
    const previousDate = moment().subtract(1, "day");

    return {
      day: previousDate.date(),
      month: previousDate.month() + 1,
      year: previousDate.year(),
    };
  }
  static getPreviousWeekDateObject(): NgbDateStruct {
    const previousDate = moment().subtract(1, "week");

    return {
      day: previousDate.date(),
      month: previousDate.month() + 1,
      year: previousDate.year(),
    };
  }
  static getPreviousMonthDateObject(): NgbDateStruct {
    const previousDate = moment().subtract(1, "month");

    return {
      day: previousDate.date(),
      month: previousDate.month() + 1,
      year: previousDate.year(),
    };
  }
  static getCurrentMonthDateObject(): {
    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
  } {
    const currentDate = moment();

    const startOfMonth = currentDate.clone().startOf("month"); // Start of the current month
    const endOfMonth = currentDate.clone().endOf("month"); // End of the current month

    return {
      startDate: {
        day: startOfMonth.date(),
        month: startOfMonth.month() + 1, // Months are 0-indexed in Moment.js
        year: startOfMonth.year(),
      },
      endDate: {
        day: endOfMonth.date(),
        month: endOfMonth.month() + 1, // Months are 0-indexed in Moment.js
        year: endOfMonth.year(),
      },
    };
  }

  static getCurrentMonthDateRange(): {
    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
  } {
    const currentDate = moment();

    const startOfMonth = currentDate.clone().startOf("month");
    const today = currentDate.clone();

    return {
      startDate: {
        day: startOfMonth.date(),
        month: startOfMonth.month() + 1, // Months are 0-indexed in Moment.js
        year: startOfMonth.year(),
      },
      endDate: {
        day: today.date(),
        month: today.month() + 1,
        year: today.year(),
      },
    };
  }

  static getPreviousMonthDateRange(): {
    startDate: NgbDateStruct;
    endDate: NgbDateStruct;
  } {
    const currentDate = moment();

    const startOfPreviousMonth = currentDate
      .clone()
      .subtract(1, "month")
      .startOf("month");
    const endOfPreviousMonth = currentDate
      .clone()
      .subtract(1, "month")
      .endOf("month");

    return {
      startDate: {
        day: startOfPreviousMonth.date(),
        month: startOfPreviousMonth.month() + 1, // Months are 0-indexed in Moment.js
        year: startOfPreviousMonth.year(),
      },
      endDate: {
        day: endOfPreviousMonth.date(),
        month: endOfPreviousMonth.month() + 1,
        year: endOfPreviousMonth.year(),
      },
    };
  }

  static getPreviousYearDateObject(): NgbDateStruct {
    const previousDate = moment().subtract(1, "year");

    return {
      day: previousDate.date(),
      month: previousDate.month() + 1,
      year: previousDate.year(),
    };
  }

  static getCurrentDateObjectNew(): NgbDateStruct {
    return {
      day: Number(moment().startOf("month").format("DD")),
      month: moment().month() + 1,
      year: moment().year(),
    };
  }
  static getCurrentDateObjectStartOfMonth(): NgbDateStruct {
    return {
      day: Number(moment().startOf("month").format("DD")),
      month: moment().month() + 1,
      year: moment().year(),
    };
  }
  static getDateObjectByGivenDate(givenDate): NgbDateStruct {
    return {
      year: moment(givenDate).year(),
      month: moment(givenDate).month() + 1,
      day: moment(givenDate).date(),
    };
  }
  static getTimeObjectByGivenDate(givenDate): NgbTimeStruct {
    return {
      hour: moment(givenDate).hour(),
      minute: moment(givenDate).minute(),
      second: moment(givenDate).second(),
    };
  }

  static getCurrentTime(): NgbTimeStruct {
    const now = moment();
    return {
      hour: now.hour(),
      minute: now.minute(),
      second: now.second(),
    };
  }

  static findValidityDate(givenDate) {
    const CurrentDate = moment().format();
    const NoticeEndDate = moment(givenDate).format();
    if (CurrentDate > NoticeEndDate) return false;
    else return true;
  }
  static getCurrentDateString(time?: string): string {
    const date = this.getCurrentDateObject();
    const _startTime = "00:00:00.000";
    const _endTime = "23:59:59.996";
    let _time = _startTime;
    let _format = "MM/DD/YYYY HH:mm:ss.000";
    if (time == "end") {
      _time = _endTime;
      _format = "MM/DD/YYYY HH:mm:ss.999";
    }
    return moment(
      date.month + "/" + date.day + "/" + date.year + _time,
      _format
    ).format();
  }

  static checkIfValidDateObject(date: NgbDateStruct): boolean {
    let isValied = false;
    if (date.day && date.month && date.year) {
      isValied = true;
    }
    return isValied;
  }

  static capitalizeFirstLetter(str: string) {
    const words = str.split(" ").filter((a) => a);
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(" ");
  }
}
