// @ts-nocheck
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
// import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject } from 'rxjs';
import { CONSTANTS } from '../helpers/constants';
import { HelperService } from '../helpers/helper.service';
import { UserModel } from 'src/app/modules/auth/_models/user.model';
import { AuthService } from '../../auth';



declare let window: any;
declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class MultiAppService {

  connectionTries = 0;

  loggedInUser: UserModel;

  // toastr = {
  //   success: (a, b = '')  => {},
  //   info: (a, b = '') => {},
  //   warning: (a, b = '') => {},
  //   error: (a, b = '') => {},
  // }

  ws_for_multiWinApp = null;
  // FilesArray = [];
  webSocketUrlForWinMultiApp = CONSTANTS.MULTI_APP.WS_URL;
  resizeImageDimentions = {
    width: 1800,
    height: 1800,
    thumbnail: {
      width: 90,
      height: 90
    },
  }

  private multiAppConnectionStatus$ = new BehaviorSubject(false);
  multiAppConnectionStatus = this.multiAppConnectionStatus$.asObservable();

  private scannedDoc$ = new BehaviorSubject(null);
  scannedDoc = this.scannedDoc$.asObservable();

  private biomatricData$ = new Subject();
  biomatricData = this.biomatricData$.asObservable();
  private biomatricCheckout$ = new Subject();
  biomatricCheckout = this.biomatricCheckout$.asObservable();

  private TData$ = new BehaviorSubject(null);
  TData = this.TData$.asObservable();

  private RData$ = new BehaviorSubject(null);
  RData = this.RData$.asObservable();


  constructor(
    private toastr: ToastrService,
    private helperSrv: HelperService,
    private auth: AuthService
  ) {
    this.loadLoggedInUserInfo();
  }



  loadLoggedInUserInfo() {
    // this.loggedInUser = this.storageService.getLoggedInUserProfile();
    this.loggedInUser = this.auth.currentUserValue;

    // console.log('this.loggedInUser', this.loggedInUser);
  }

  sendCommand(cmd) {
    
    // if(cmd){
    // if(typeof(cmd) === 'object') {
    // cmd = JSON.stringify(cmd);
    // }
    // }
    if (this.checkIfMultiAppConnected()) {
      if (typeof (cmd) === 'object') {
        cmd = JSON.stringify(cmd);
      }
      this.ws_for_multiWinApp.send(cmd);
    } else {
      let somedata: any;
      somedata = this.connectToMultiApp(cmd || '');
      // console.log("we are in:   sendCommand11111111111111111", somedata)
      return;
    }
  }
  sendCommandBiomatric(cmd) {
    // if(cmd){
    // if(typeof(cmd) === 'object') {
    // cmd = JSON.stringify(cmd);
    // }
    // }
    if (this.checkIfMultiAppConnectedBiomatric()) {
      if (typeof (cmd) === 'object') {
        cmd = JSON.stringify(cmd);
      }
      this.ws_for_multiWinApp.send(cmd);
    } else {
      let somedata: any;
      somedata = this.connectToMultiApp(cmd || '');
      // console.log("we are in:   sendCommand", somedata)
      // this.toastr.error("WebDesk App is not connected/not installed","Web App Connection Error")
      return;
    }
  }
  connectToMultiApp(cmd = '') {
    // let _self = this;
    // var i = 0;
    if (this.ws_for_multiWinApp) { // already connected
      return;
    }
    try {
      const wsImpl = window.WebSocket || window.MozWebSocket;
      this.ws_for_multiWinApp = new wsImpl(this.webSocketUrlForWinMultiApp);
      if (this.ws_for_multiWinApp) {
        // this.setMultiAppConnectionStatus(true);
        this.ws_for_multiWinApp.onmessage = (e) => {
          this.setMultiAppConnectionStatus(true);
          console.log('data from Win WebDesk => ', e);
          let data_from_webDesk = e.data;
          try {
            try {
              data_from_webDesk = JSON.parse(data_from_webDesk);
            } catch (e) { }
            /*
            dynamic respObject = new JObject();
            respObject.status = false;
            respObject.type = "_unknown_";
            respObject.message = "no type specified";
            respObject.error = "no type specified";
            respObject.errorDetails = "no type specified";
            respObject.data = "";
            respObject.userIdentity = userIdentity;
            */
            if (!data_from_webDesk.status) {
              this.toastr.error('WebDesk: Message: ' + data_from_webDesk.message + ' | Error: ' + data_from_webDesk.message + ' | ErrorDetails: ' + data_from_webDesk.errorDetails);
              console.log('WebDesk: Message: ' + data_from_webDesk.message + ' | Error: ' + data_from_webDesk.message + ' | ErrorDetails: ' + data_from_webDesk.errorDetails);
              return;
            }
            const identityObj = {
              user: this.loggedInUser,
              timestamp: +new Date(),
              screen: encodeURIComponent(window.location.href)
            }

            switch (data_from_webDesk.type) {
              case 'ScanImage':
                // code block
                this.handleScannedDoc(data_from_webDesk, identityObj);
                break;
              case 'get-mac':
                // code block
                this.handleGetMAC(data_from_webDesk, identityObj);
                break;
              case 'sys-info':
                this.handleGetSysInfo(data_from_webDesk, identityObj);
                break;
              case 'FPVerify':
                // code block
                // TODO: finger print scan
                break;
              case 'fmd':
                // code block
                // TODO: finger print scan
                this.handleBiomatricData(data_from_webDesk, identityObj, cmd);
                break;
              case 'Print':
                // code block
                break;
              default:
              // code block
            }
          } catch (excp) {
            console.log('WebDesk: Error handling WebDesk response ', excp);
            this.toastr.error('WebDesk: Error handling WebDesk response');
          }
        };
        this.ws_for_multiWinApp.onopen = () => {
          this.setMultiAppConnectionStatus(true);
          //Do whatever u want when connected succesfully
          console.log("connection to WebDesk is established");
          this.toastr.success('connection to WebDesk is established', 'Connected');
          if (cmd) {
            this.sendCommand(cmd);
          }
        };
        this.ws_for_multiWinApp.onclose = () => {
          this.setMultiAppConnectionStatus(false);
          console.log("connection to WebDesk is closed");
          if (this.connectionTries > 1) {
            this.toastr.error('connection to WebDesk is closed', 'Disconnected');
          }
          //toastr.success('connection to Win WebDesk is closed', 'Disconnection');
          this.connectionTries++;
        };
        this.ws_for_multiWinApp.onerror = (event) => {
          this.setMultiAppConnectionStatus(false);
          console.log('Failure establishing connection to WebDesk', event.data);
          if (this.connectionTries > 1) {
            this.toastr.error('Failure establishing connection to WebDesk', 'Disconnected');
          }
          //toastr.warning('Failure establishing connection to Win WebDesk', 'Connection Failed');
          this.connectionTries++;
        }
      }
    }
    catch (e) {
      console.log('ERROR implementing WebSocket for WebDesk.', e);
      this.toastr.error('ERROR implementing WebSocket for WebDesk.');
    }
  }
  disconnectToMultiApp() {
    if (this.checkIfMultiAppConnected()) {
      try {
        this.ws_for_multiWinApp.close();
      } catch (ex) { }
      this.setMultiAppConnectionStatus(false);
    }
  }
  checkIfMultiAppConnected(): boolean {
    const connected = false;
    let socketStatus = 3;
    const status = {
      connected: false,
      status: 3
    }
    if (this.ws_for_multiWinApp) {
      if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.CONNECTING) { // (window.WebSocket || window.MozWebSocket).CONNECTING) { // 0
        status.connected = true;
      } else if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.OPEN) { // (window.WebSocket || window.MozWebSocket).OPEN) { // 1
        status.connected = true;
      } else if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.CLOSING) { // (window.WebSocket || window.MozWebSocket).CLOSING) { // 2
        status.connected = false;
      } else if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.CLOSED) { // (window.WebSocket || window.MozWebSocket).CLOSED) { // 3
        status.connected = false;
      } else {
        status.connected = false;
      }

      socketStatus = this.ws_for_multiWinApp.readyState || 3;
    }
    return status.connected; // connected;
  }
  checkIfMultiAppConnectedBiomatric(): boolean {
    const connected = false;
    let socketStatus = 3;
    const status = {
      connected: false,
      status: 3
    }
    if (this.ws_for_multiWinApp) {
      if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.CONNECTING) { // (window.WebSocket || window.MozWebSocket).CONNECTING) { // 0
        status.connected = true;
      } else if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.OPEN) { // (window.WebSocket || window.MozWebSocket).OPEN) { // 1
        status.connected = true;
      } else if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.CLOSING) { // (window.WebSocket || window.MozWebSocket).CLOSING) { // 2
        status.connected = false;
      } else if (this.ws_for_multiWinApp.readyState === WebSocketConnectionState.CLOSED) { // (window.WebSocket || window.MozWebSocket).CLOSED) { // 3
        status.connected = false;
      } else {
        status.connected = false;
      }

      socketStatus = this.ws_for_multiWinApp.readyState || 3;
    }
    return status.connected; // connected;
  }
  handleScannedDoc(response, identityObj) {
    let isIdentitySame = true;
    try {
      isIdentitySame = (identityObj.user.userid == JSON.parse(response.userIdentity).user.userid
        && identityObj.user.locationid == JSON.parse(response.userIdentity).user.locationid
        && identityObj.screen == JSON.parse(response.userIdentity).screen);
    } catch (e) { }
    if (isIdentitySame) {
      if (response.status && response.data) {
        if (response.data.indexOf('data:') == -1) { // check if image prefix is already appended
          response.data = CONSTANTS.IMAGE_PREFIX.PNG + response.data;
        }
        // let base64Img = data_from_fpScanner.data;
        // data_from_fpScanner.data = this.base64toBlob(data_from_fpScanner.data, 'image/png');
        // if (data_from_fpScanner.data instanceof Blob) {

        const fileName = "Scan_" + +new Date(); //"File" + i;
        const _obj: any = {};
        _obj.Doc = (response.data || ''); // (fileObject.FileBase64Data || '');
        _obj.DocId = null;
        _obj.Title = fileName || (+new Date()); // fileObject.FileName || (+new Date());
        _obj.VisitDocType = 'image/png';
        _obj.VisitDocBase64Thumbnail = '';
        _obj.VisitId = null;

        // this.resizeImage('', this.resizeImageDimentions.width, this.resizeImageDimentions.height, 0.8, 'image/png', response.data).then((res) => {
        // _obj.Doc = (res || ''); // (fileObject.FileBase64Data || '');
        _obj.VisitDocBase64Thumbnail = '';

        this.resizeImage('', this.resizeImageDimentions.thumbnail.width, this.resizeImageDimentions.thumbnail.height, 0, 'image/png', response.data).then((thumbnailImg) => {
          _obj.VisitDocBase64Thumbnail = (thumbnailImg || '');
          const imgDataFormatted = this.helperSrv.addPrefixToDocs([_obj]);
          console.log('imgDataFormatted from scanner 1 ', imgDataFormatted);
          this.updateScannedDoc(imgDataFormatted);
        }, (err) => {
          const imgDataFormatted = this.helperSrv.addPrefixToDocs([_obj]);
          console.log('imgDataFormatted from scanner 2 ', imgDataFormatted);
          this.updateScannedDoc(imgDataFormatted);
        });
        // }
        // reader.readAsDataURL(f);
        // }, (err) => {
        //     this.toastr.error('File not found');
        //     let imgDataFormatted = this.helperSrv.addPrefixToDocs([_obj]);
        //     console.log('imgDataFormatted from scanner 3 ',imgDataFormatted);
        //     this.updateScannedDoc(imgDataFormatted);
        // });
        // }
      } else {
        this.toastr.info('WebDesk: No image data');
      }
      this.auth.updateWebDeskVersionInStorage(JSON.stringify((response.versions || {})));
    }

  }
  handleGetMAC(response, identityObj) {
    // console.log('============> ', JSON.parse(data_from_fpScanner.userIdentity), identityObj);
    
    let isIdentitySame = true;
    try {
      isIdentitySame = (identityObj.user.userid == JSON.parse(response.userIdentity).user.userid
        && identityObj.user.locationid == JSON.parse(response.userIdentity).user.locationid
        && identityObj.screen == JSON.parse(response.userIdentity).screen);
    } catch (e) { }
    if (isIdentitySame) {
      if (response.status && response.data) {
        // let user:UserModel = this.auth.getUserFromLocalStorage();
        // user.macAdr = data_from_fpScanner.data;
        if (response.data) {
          this.auth.updateUserMACAddress(response.data);
        } else {
          this.toastr.info('WebDesk: MAC not found');
        }
      }
      this.auth.updateWebDeskVersionInStorage(JSON.stringify((response.versions || {})));
    }
  }
  handleGetSysInfo(response, identityObj) {
    // console.log('============> ', JSON.parse(data_from_fpScanner.userIdentity), identityObj);
    if (response.status && response.data) {
      if (response.data) {
        const aa = console.log("aaaaaaaaaaaaa", response.data);
        setTimeout(() => {
          this.auth.updateSysInfo(response.data);
        }, 2000);
      } else {
        this.toastr.info('WebDesk: MAC not found');
      }
    }
  }
  
  handleBiomatricData(response, identityObj, cmd) {
    if (cmd.useFor === "checkout") {
      this.biomatricCheckout$.next(response || null);
    } else {
      this.biomatricData$.next(response || null);
    }
  }
  base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    let byteCharacters = '';
    try {
      byteCharacters = atob(base64Data);
    }
    catch (ex) {
      byteCharacters = base64Data;
    }
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }
  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: mime
    });
  }
  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    const ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    const blob = new Blob([ab], { type: mimeString });
    return blob;

  }
  resizeImage(file, maxWidth, maxHeight, compressionRatio = 0, imageEncoding = 'image/jpeg', base64Data = '') {
    const self = this;
    const promise = new Promise((resolve, reject) => {
      if (!file && !base64Data) {
        resolve('');
      }
      const fileLoader = new FileReader();
      const canvas = document.createElement('canvas');
      let context = null;
      const imageObj: any = new Image();
      let blob = null;

      // create a hidden canvas object we can use to create the new resized image data
      const canvas_id = 'hiddenCanvas_' + +new Date();
      canvas.id = canvas_id;
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      canvas.style.visibility = 'hidden';
      document.body.appendChild(canvas);

      // console.log('base64Data ', base64Data);
      if (base64Data) {
        if (base64Data.indexOf('data:image') == -1) { // if pdf, icon or any other file then don't resize
          resolve('');
          return promise;
        }
        imageObj.src = base64Data;
      } else if (file && file.size) {
        // check for an image then
        // trigger the file loader to get the data from the image
        // if (file.type.match('image.*')) {
        fileLoader.readAsDataURL(file);
        // } else {
        // alert('File is not an image');
        // }

        // setup the file loader onload function
        // once the file loader has the data it passes it to the
        // image object which, once the image has loaded,
        // triggers the images onload function
        fileLoader.onload = function () {
          const data = this.result;
          imageObj.src = data;
        };

        fileLoader.onabort = () => {
          reject('The upload was aborted.');
          this.toastr.error('The upload was aborted.');
        };

        fileLoader.onerror = () => {
          reject('An error occured while reading the file.');
          this.toastr.error('An error occured while reading the file.');
        };
      }

      // set up the images onload function which clears the hidden canvas context,
      // draws the new image then gets the blob data from it
      imageObj.onload = function () {
        // Check for empty images
        if (this.width === 0 || this.height === 0) {
          this.toastr.error('Image is empty');
        } else {
          // get the context to use
          // context = canvas.getContext('2d');
          // context.clearRect(0, 0, max_width, max_height);
          // context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, max_width, max_height);
          const newSize = self.calculateAspectRatioFit(this.width, this.height, maxWidth, maxHeight);
          canvas.width = newSize.width;
          canvas.height = newSize.height;
          context = canvas.getContext('2d');
          context.clearRect(0, 0, newSize.width, newSize.height);
          context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, newSize.width, newSize.height);
          // dataURItoBlob function available here:
          // http://stackoverflow.com/questions/12168909/blob-from-dataurl
          // add ')' at the end of this function SO dont allow to update it without a 6 character edit
          blob = canvas.toDataURL(); //imageEncoding, compressionRatio);
          document.getElementById(canvas_id).remove();
          // pass this blob to your upload function
          resolve(blob);
        }
      };

      imageObj.onabort = () => {
        reject('Image load was aborted.');
        this.toastr.error('Image load was aborted.');
      };

      imageObj.onerror = () => {
        resolve(imageObj.currentSrc || '');
        // reject('An error occured while loading image.');
        this.toastr.error('An error occured while loading image.');
      };
    })
    return promise;
  }
  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }
  setTData(data) {
    this.TData$.next(data);
  }
  getTDate() {
    return this.TData$;
  }
  setrisdata(data) {
    this.RData$.next(data);
  }
  getrisdata() {
    return this.RData$;
  }



  refreshMultiAppConnectionStatus() {
    this.multiAppConnectionStatus$.next(this.getMultiAppConnectionStatus() || false);
  }
  setMultiAppConnectionStatus(connectionStatus) {
    if (!connectionStatus) {
      this.ws_for_multiWinApp = null;
    }
    this.multiAppConnectionStatus$.next(connectionStatus || false);
  }
  getMultiAppConnectionStatus(): boolean {
    return this.checkIfMultiAppConnected();
  }

  updateScannedDoc(doc) {
    this.scannedDoc$.next(doc || null);
  }

}


enum WebSocketConnectionState {
  CONNECTING, // 0 CONNECTING	Socket has been created. The connection is not yet open.
  OPEN, // 1	OPEN	The connection is open and ready to communicate.
  CLOSING, // 2	CLOSING	The connection is in the process of closing.
  CLOSED, // 3	CLOSED
}