// @ts-nocheck
import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';  
// import * as XLSX from 'xlsx'; 
import { Workbook } from 'exceljs';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';  
const EXCEL_EXTENSION = '.xlsx';
@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  // public exportAsExcelFile(json: any[], excelFileName: string): void {  
  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);  
  //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };  
  //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });  
  //   this.saveAsExcelFile(excelBuffer, excelFileName);  
  // }  

  async exportAsExcelFile(data: any[], reportTitle: string, fileName: string): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Report', {
      properties: { defaultRowHeight: 20 }
  });
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,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',
      extension: 'png',
    });
    
    worksheet.addImage(imageId, {
      tl: { col: 0.10, row: 0.25 }, // Top-left position
      ext: { width: 60, height: 60 }, // Logo dimensions
    });
    worksheet.mergeCells('A1:A3'); // Logo area
  
    // Organization Name
    worksheet.mergeCells('B1:E1');
    const orgCell = worksheet.getCell('B1');
    orgCell.value = 'Islamabad Diagnostic Centre (Pvt) Ltd';
    orgCell.font = { bold: true, size: 14, color: { argb: 'FFB22222' } }; // FireBrick
    orgCell.alignment = { vertical: 'middle', horizontal: 'left' };
  
    // Report Title
    worksheet.mergeCells('D2:E2');
    const titleCell = worksheet.getCell('D2');
    titleCell.value = reportTitle;
    titleCell.font = { bold: true, size: 12, color: { argb: 'FF1E90FF' } }; // DodgerBlue
    titleCell.alignment = { vertical: 'middle', horizontal: 'right' };
  
    // Export Date (matches your document format)
    worksheet.mergeCells('D3:E3');
    const dateCell = worksheet.getCell('D3');
    dateCell.value = `Date: ${new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      // second: 'numeric',
      hour12: true,
    })}`;
    dateCell.font = { size: 10, italic: true };
    dateCell.alignment = { vertical: 'middle', horizontal: 'right' };
  
    // Spacer Row
    worksheet.addRow([]);
  
    // Add Column Headers
    const headers = Object.keys(data[0]);
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }, // Light gray
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Changed to left-aligned
    });
  
    // Add Data Rows
    data.forEach(rowData => {
      const row = worksheet.addRow(Object.values(rowData));
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' }; // Left-aligned data
      });
    });
  
    // Auto-fit Columns Based on Data
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index]?.length || 10; // Start with header length
      column.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, value.length);
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50); // Min 10, max 50 width
    });
  
    // Export File
    const buffer = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(new Blob([buffer]), `${fileName}_export_${new Date().getTime()}.xlsx`);
  }
  
  private saveAsExcelFile(buffer: any, fileName: string): void {  
     const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});  
     FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);  
  } 
}
