// @ts-nocheck
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSvgDirective } from '../../../../shared/inline-svg/inline-svg.directive';
import { NoticeComponent } from './notice/notice.component';
import { CodePreviewComponent } from './code-preview/code-preview.component';
import { CoreModule } from '../../../core';

@NgModule({
  declarations: [NoticeComponent, CodePreviewComponent],
  imports: [
    CommonModule,
    CoreModule,
    HighlightModule,
    // ngbootstrap
    NgbNavModule,
    NgbTooltipModule,
    InlineSvgDirective,
  ],
  exports: [NoticeComponent, CodePreviewComponent],
})
export class GeneralModule {}
