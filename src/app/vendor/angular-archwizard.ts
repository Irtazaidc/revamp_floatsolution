import { Component, Directive, Input, NgModule } from '@angular/core';

// Minimal Ivy-compatible stub for `angular-archwizard`.
// The real library version installed is not compatible with Angular 21 here.

@Component({
  selector: 'aw-wizard',
  template: '<ng-content></ng-content>',
  standalone: false,
})
export class WizardComponent {
  @Input() navBarLayout?: any;
  @Input() navBarLocation?: any;
  @Input() defaultStepIndex?: any;
}

@Component({
  selector: 'aw-wizard-step',
  template: '<ng-content></ng-content>',
  standalone: false,
})
export class WizardStepComponent {
  @Input() stepTitle?: any;
  @Input() canExit?: any;
}

@Directive({
  selector: '[awNextStep]',
  standalone: false,
})
export class AwNextStepDirective {}

@Directive({
  selector: '[awPreviousStep]',
  standalone: false,
})
export class AwPreviousStepDirective {}

@NgModule({
  declarations: [WizardComponent, WizardStepComponent, AwNextStepDirective, AwPreviousStepDirective],
  exports: [WizardComponent, WizardStepComponent, AwNextStepDirective, AwPreviousStepDirective],
})
export class ArchwizardModule {}

