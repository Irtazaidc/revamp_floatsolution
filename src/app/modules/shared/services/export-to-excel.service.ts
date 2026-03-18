// @ts-nocheck
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import * as XLSX from 'xlsx';

const EXCEL_SETTINGS = {
  EXCEL_TYPE: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  EXCEL_EXTENSION: '.xlsx'
}

@Injectable({
  providedIn: 'root'
})
export class ExportToExcelService {

  constructor() { }

  public exportJSONAsExcelFile(json: any[], excelFileName: string = 'ExportedExcelFile_VIMS_'+ moment().format('DD-MMM-YYYY HH:mm:ss')): void {
    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json, {dateNF: 'DD-MMM-YYYY HH:mm:ss'});
    const myworkbook: XLSX.WorkBook = { Sheets: { 'data': myworksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
  public exportTableAsExcelFile(table: any, excelFileName: string = 'ExportedExcelFile_VIMS_'+ moment().format('DD-MMM-YYYY HH:mm:ss')): void {
    // table = document.getElementById('emp_attendance_table');
    const myworkbook: XLSX.WorkBook = XLSX.utils.table_to_book(table, {raw: true});
    const excelBuffer: any = XLSX.write(myworkbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_SETTINGS.EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_exported'+ EXCEL_SETTINGS.EXCEL_EXTENSION);
  }

}
