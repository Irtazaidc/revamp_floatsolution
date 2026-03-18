import { bootstrapApplication } from '@angular/platform-browser';
import { BootstrapContext } from '@angular/platform-browser';
import { platformServer, renderApplication } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const bootstrap = (context: BootstrapContext) => {
  // Ensure the server platform exists for this request.
  platformServer();
  return bootstrapApplication(AppComponent, appConfig, context);
};

export default (context: BootstrapContext) => renderApplication(bootstrap, {});
