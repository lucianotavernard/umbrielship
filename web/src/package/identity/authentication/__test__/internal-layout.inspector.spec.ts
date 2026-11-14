import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PAGE_RELOAD } from '../../../shared/components/lib/page-reload';
import { InternalLayout } from '../../../shared/components/internal-layout';
import { AuthenticationService, MeOrganization } from '../authentication.service';

const organizations: MeOrganization[] = [
  { id: 'org-a', name: 'Atlantic', isInternal: false, role: 'operator' },
  { id: 'org-b', name: 'Costa Branca', isInternal: false, role: 'inspector' },
];

function profile(activeId: string) {
  const active = organizations.find((organization) => organization.id === activeId)!;
  return {
    user: {
      id: 'user-1',
      name: 'Ines',
      email: 'ines@atlantic.test',
      role: active.role,
      organization: { id: active.id, name: active.name, isInternal: active.isInternal },
      organizations,
    },
  };
}

describe('InternalLayout with an inspector Membership', () => {
  let controller: HttpTestingController;
  const reload = vi.fn();

  beforeEach(() => {
    reload.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PAGE_RELOAD, useValue: reload },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('inspector C21 the switcher shows Inspetor under the Organization', async () => {
    const fixture = TestBed.createComponent(InternalLayout);
    await settle();
    controller.expectOne('/api/me').flush(profile('org-a'));
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')?.click();
    await settle();

    const item = [...element.querySelectorAll<HTMLElement>('[role="menuitem"]')].find((button) =>
      button.textContent?.includes('Costa Branca'),
    );
    expect(item?.textContent).toContain('Inspetor');
  });

  it('inspector C29 the session Role follows GET /me after an Organization switch', async () => {
    const session = TestBed.inject(AuthenticationService);

    const fixture = TestBed.createComponent(InternalLayout);
    await settle();
    controller.expectOne('/api/me').flush(profile('org-a'));
    await settle();
    expect(session.role()).toBe('operator');
    expect(session.canWrite()).toBe(true);

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')?.click();
    await settle();
    [...element.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((button) => button.textContent?.includes('Costa Branca'))
      ?.click();
    await settle();
    controller
      .expectOne('/api/organizations/switch')
      .flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    expect(reload).toHaveBeenCalledTimes(1);

    // The reload builds the layout again, which reads GET /me for the new active Organization.
    fixture.destroy();
    TestBed.createComponent(InternalLayout);
    await settle();
    controller.expectOne('/api/me').flush(profile('org-b'));
    await settle();

    expect(session.role()).toBe('inspector');
    expect(session.canWrite()).toBe(false);
  });
});
