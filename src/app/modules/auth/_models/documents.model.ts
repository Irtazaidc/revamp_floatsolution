// @ts-nocheck


export interface IVisitDocs {
    docId?: number;
    type?: string;
    visitId?: number;
    uniqueIdentifier: number;
    fileName: string;
    fileType: string;
    data: string;
    Remarks : string;
    thumbnail: string;
    sanitizedData: any;
    sanitizedThumbnail: any;
    CreatedOn? : any;
    CreatedName? : any;
    
}

export class VisitDocs implements IVisitDocs {
    docId?: number;
    visitId?: number;
    uniqueIdentifier: number;
    fileName: string;
    fileType: string;
    data: string;
    Remarks:string;
    thumbnail: string;
    sanitizedData: any;
    sanitizedThumbnail: any;
    CreatedOn? : any;
    CreatedName? : any;

    constructor() {
        this.docId = null;
        this.visitId = null;
        this.uniqueIdentifier = 0; // +new Date();
        this.fileName = '';
        this.fileType = '';
        this.data = '';
        this.thumbnail = '';
        this.sanitizedData = '';
        this.sanitizedThumbnail = '';    
    }
}
