// @ts-nocheck
import { Directive, ElementRef, AfterViewChecked, Input } from '@angular/core';

@Directive({
  standalone: false,

  selector: '[appScrollToBottom]'
})
export class ScrollToBottomDirective implements AfterViewChecked {

  @Input() appScrollToBottom: boolean = false; // trigger when new messages arrive

  private lastScrollHeight = 0;

  constructor(private el: ElementRef) {}

  ngAfterViewChecked(): void {
    if (this.appScrollToBottom) {
      this.scrollToBottom();
    }
  }

  public scrollToBottom(): void {
    const el: HTMLDivElement = this.el.nativeElement;
    if (el.scrollHeight !== this.lastScrollHeight) {
      el.scrollTop = el.scrollHeight;
      this.lastScrollHeight = el.scrollHeight;
    }
  }
}
