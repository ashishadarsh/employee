import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';


import { routes } from './app.routes';
import { ApolloClient} from '@apollo/client/core';
import {apolloClient } from '../app/graphql/queries'

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withComponentInputBinding(), withRouterConfig({
    paramsInheritanceStrategy: 'always',
  })), provideAnimationsAsync(),{
    provide: ApolloClient,
    useValue: apolloClient,
  }, providePrimeNG({
    theme: {
        preset: Aura
    }
})]
};
