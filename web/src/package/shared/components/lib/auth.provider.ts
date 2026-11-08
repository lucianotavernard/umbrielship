import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, inject, provideEnvironmentInitializer, Provider } from '@angular/core';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { authInterceptor } from './auth.interceptor';

export const provideAuth = (): (Provider | EnvironmentProviders)[] => [
  provideHttpClient(withInterceptors([authInterceptor])),
  provideEnvironmentInitializer(() => inject(AuthenticationService)),
];
