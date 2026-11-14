import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Role } from '../../../identity/user/user.service';
import { PAGE_RELOAD } from '../../../shared/components/lib/page-reload';
import { InternalLayout } from '../../../shared/components/internal-layout';
import { settle } from './testing';

const profile = (role: Role) => ({
  user: {
    id: 'user-1',
    name: 'Ana',
    email: 'ana@atlantic.test',
    role,
    organization: { id: 'org-a', name: 'Atlantic', isInternal: false },
    organizations: [{ id: 'org-a', name: 'Atlantic', isInternal: false, role }],
  },
});

describe('Layout menu', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PAGE_RELOAD, useValue: vi.fn() },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('template C14 the menu links Modelos de inspeção for every Role', async () => {
    for (const role of ['administrator', 'operator', 'inspector'] as const) {
      const fixture = TestBed.createComponent(InternalLayout);
      await settle();
      controller.expectOne('/api/me').flush(profile(role));
      await settle();

      const link = [...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a')].find(
        (anchor) => anchor.textContent?.trim() === 'Modelos de inspeção',
      );

      expect(link?.getAttribute('href'), role).toBe('/inspection-templates');
      fixture.destroy();
    }
  });
});
