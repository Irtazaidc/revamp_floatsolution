// @ts-nocheck
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-questionnaire-main',
  templateUrl: './questionnaire-main.component.html',
  styleUrls: ['./questionnaire-main.component.scss']
})
export class QuestionnaireMainComponent implements OnInit {
  selectedIndex=0;
  questionClassificationID=null;
  constructor() { }

  ngOnInit(): void {
  }
  receiveTabIndexData(data){
    this.selectedIndex=1;
    this.questionClassificationID=null;
    setTimeout(() => {
      this.selectedIndex=data.selectedIndex;
      this.questionClassificationID=data.questionClassificationID;
    }, 100);
  }
}
