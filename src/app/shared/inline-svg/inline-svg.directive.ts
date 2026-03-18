// @ts-nocheck
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Minimal replacement for `ng-inline-svg` used by Metronic templates.
 * Supports: `<span [inlineSVG]="'assets/.../icon.svg'"></span>`
 */
@Directive({
  selector: '[inlineSVG]',
  standalone: true,
})
export class InlineSvgDirective implements OnChanges {
  @Input('inlineSVG') src?: string;

  private readonly isBrowser: boolean;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!('src' in changes) && !('inlineSVG' in changes)) return;
    if (!this.isBrowser) return;

    const url = (this.src ?? '').trim();
    if (!url) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
      return;
    }

    try {
      const resp = await fetch(url, { credentials: 'same-origin' });
      if (!resp.ok) throw new Error(`Failed to fetch SVG (${resp.status})`);
      const svgText = await resp.text();
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', svgText);
    } catch {
      // Fail silently: icons are non-critical for app boot.
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
    }
  }
}

