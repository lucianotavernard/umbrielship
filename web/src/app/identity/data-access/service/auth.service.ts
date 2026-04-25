import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

type AuthenticateParams = {
  email: string;
  password: string;
};

type WhoamiResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  protected readonly http = inject(HttpClient);

  isAuthenticated = signal(localStorage.getItem('@umbriel:access-token') !== null);

  authenticate(params: AuthenticateParams) {
    const url = '/api/sessions';

    return this.http.post<{ access_token: string }>(url, params).pipe(
      tap((response) => {
        this.isAuthenticated.set(true);
        localStorage.setItem('@umbriel:access-token', response.access_token);
      }),
      map((response) => !!response.access_token),
    );
  }

  whoami() {
    const url = '/api/whoami';

    return this.http.get<WhoamiResponse>(url);
  }

  logout() {
    localStorage.removeItem('@umbriel:access-token');
    this.isAuthenticated.set(false);
  }
}
