import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Enables client-side routing and allows binding route parameters directly as component inputs
    provideRouter(routes, withComponentInputBinding()),
    // Enables Angular's HttpClient with modern Fetch API for backend communication (Spring Boot @ http://localhost:8080)
    provideHttpClient(withFetch())
  ]
};

