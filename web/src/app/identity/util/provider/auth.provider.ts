import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider, inject, provideEnvironmentInitializer } from '@angular/core';

import { AuthService } from '../../data-access/service/auth.service';
import { authInterceptor } from '../interceptor/auth.interceptor';

type ProvideAuthFn = () => (Provider | EnvironmentProviders)[];

export const provideAuth: ProvideAuthFn = () => [
  provideHttpClient(withInterceptors([authInterceptor])),
  provideEnvironmentInitializer(() => inject(AuthService)),
];
