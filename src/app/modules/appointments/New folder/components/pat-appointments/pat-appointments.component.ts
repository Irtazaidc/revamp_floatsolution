// @ts-nocheck
import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  standalone: false,

  selector: 'app-pat-appointments',
  templateUrl: './pat-appointments.component.html',
  styleUrls: ['./pat-appointments.component.scss']
})
export class PatAppointmentsComponent implements OnInit {

  constructor(private modal: NgbModal) { }
 
  ngOnInit(): void {
  }

}
