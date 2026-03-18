// @ts-nocheck
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import KTLayoutExamples from '../../../../../../assets/js/layout/extended/examples';

@Component({
  selector: 'app-code-preview',
  templateUrl: './code-preview.component.html',
  styleUrls: ['./code-preview.component.scss'],
  standalone: false,
})
export class CodePreviewComponent implements OnInit, AfterViewInit {
  // Public properties
  @Input() viewItem: any;
  constructor(private el: ElementRef) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    const elements = this.el.nativeElement.querySelectorAll(
      '.example.example-compact'
    );
    KTLayoutExamples.init(elements);
  }
}
