import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

import { internalAdministratorGuard } from '../../../shared/components/lib/internal-administrator.guard';
import { Forbidden } from '../../../shared/components/forbidden';

function me(role: 'administrator' | 'operator', isInternal: boolean) {
  return {
    user: {
      id: 'user-1',
      name: 'Ana',
      email: 'ana@atlantic.test',
      role,
      organization: { id: 'org-1', name: 'Umbrielship', isInternal },
      organizations: [{ id: 'org-1', name: 'Umbrielship', isInternal, role }],
    },
  };
}

describe('internal administrator', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  async function activate(role: 'administrator' | 'operator', isInternal: boolean) {
    const result = TestBed.runInInjectionContext(() =>
      internalAdministratorGuard({} as never, {} as never),
    ) as Observable<boolean | UrlTree>;
    const pending = firstValueFrom(result);
    controller.expectOne('/api/me').flush(me(role, isInternal));
    return pending;
  }

  it('[C86] an internal administrator may open organizations', async () => {
    expect(await activate('administrator', true)).toBe(true);
  });

  it('[C86] an internal operator is sent to the forbidden page', async () => {
    const value = await activate('operator', true);
    const router = TestBed.inject(Router);
    expect(value).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(value as UrlTree)).toBe('/forbidden');
  });

  it('[C86] a non-internal administrator is sent to the forbidden page', async () => {
    const value = await activate('administrator', false);
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(value as UrlTree)).toBe('/forbidden');
  });

  it('[C86] the forbidden page heading is Acesso negado', () => {
    const fixture = TestBed.createComponent(Forbidden);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Acesso negado');
  });
});
