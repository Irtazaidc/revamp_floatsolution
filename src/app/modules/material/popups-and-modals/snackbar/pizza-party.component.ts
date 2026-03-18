// @ts-nocheck
import { Component } from '@angular/core';

@Component({
  standalone: false,

  selector: 'app-snack-bar-component-example-snack',
  template: ` <span class="example-pizza-party">Pizza party!!! 🍕</span> `,
  styles: [
    `
      .example-pizza-party {
        color: hotpink;
      }
    `,
  ],
})
export class PizzaPartyComponent {}
