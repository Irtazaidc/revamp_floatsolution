// @ts-nocheck
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class AppPopupService {

  constructor(
    private modalService: NgbModal,
  ) { }


  openModal(content, settings = {}) {
    const defaultSettings = {size: 'xl'};
    const _settings = {...defaultSettings, ...settings};
    const modalRef = this.modalService.open(content, _settings);
    modalRef.result.then((result) => {
    }, (reason) => {
    });
    return modalRef;
  }

  closeModal(modalRef = null) {
    if(modalRef) {
      try {
        modalRef.close();
      } catch (e) {
        this.modalService.dismissAll();
      }
    } else {
      this.modalService.dismissAll();
    }
  }
}
