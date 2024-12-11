import { APP_INITIALIZER, ApplicationConfig, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideToastr } from 'ngx-toastr';
import { KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';

/* function initializeKeycloak(keycloak: KeycloakService) {
  console.log("im hereeeeeeeeeeeeeeee");

  return () => {
    return new Promise(async (resolve, reject) => {
      try {
        await keycloak.init({
          config: {
            url: 'http://localhost:8089',
            realm: 'vidSecure-realm',
            clientId: 'vidSecure-client-id',
          },
          loadUserProfileAtStartUp: false,
          enableBearerInterceptor: true,
          initOptions: {
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri:
              window.location.origin + '/assets/silent-check-sso.html',
            redirectUri: "http://localhost:4200",
            checkLoginIframe: false
          },
          bearerPrefix: 'Bearer'

        }).then(
          authenticated => {
            const keycloakAuth = keycloak.getKeycloakInstance();
            keycloakAuth.onAuthRefreshError = () => {
              keycloak.logout()
            }
            resolve(authenticated);
          }).catch(
            error => {
              console.log(error);
              reject(error);
            }
          );
      } catch (error) {
        reject(error);
      }
    })
  }
}



const KeycloakBearerInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: KeycloakBearerInterceptor,
  multi: true
};


const KeycloakInitializerProvider: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeKeycloak,
  multi: true,
  deps: [KeycloakService]
} */



export const appConfig: ApplicationConfig = {
  providers: [
    //provideHttpClient(withInterceptorsFromDi()), // Provides HttpClient with interceptors
    //KeycloakInitializerProvider, // Initializes Keycloak
    //KeycloakBearerInterceptorProvider, // Provides Keycloak Bearer Interceptor
    KeycloakService, // Service for Keycloak
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideToastr()
  ]
};
