// @ts-nocheck
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

//   // Do not remove the import statements below
// import * as powerbiClient from 'powerbi-client';
// import * as models from 'powerbi-models';

let loadedResolve: any, reportLoaded = new Promise((res) => { loadedResolve = res; });
let renderedResolve: any, reportRendered = new Promise((res) => { renderedResolve = res; });
// const powerbi: powerbiClient.service.Service = window["powerbi"];

declare let $: any;
@Component({
  standalone: false,

  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  @ViewChild('draggable') private ele: ElementRef;

  constructor(private render: Renderer2) { }

  ngOnInit(): void {
    // document.getElementsByClassName('position-static').remove()
    // this.render.addClass("position-static","position-static1");
    // $('notification-bar').getElementsByClassName('position-static').remove();

  }


}
