import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PAGE_RELOAD } from '../../../shared/components/lib/page-reload';
import { InternalLayout } from '../../../shared/components/internal-layout';
import { MeOrganization } from '../authentication.service';

function profile(organizations: MeOrganization[], activeId: string) {
  const active = organizations.find((organization) => organization.id === activeId)!;
  return {
    user: {
      id: 'user-1',
      name: 'Ana',
      email: 'ana@atlantic.test',
      role: active.role,
      organization: { id: active.id, name: active.name, isInternal: active.isInternal },
      organizations,
    },
  };
}

describe('InternalLayout', () => {
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

  it('[C85] posts the picked organization and reloads', async () => {
    const fixture = TestBed.createComponent(InternalLayout);
    await settle();
    const organizations: MeOrganization[] = [
      { id: 'org-a', name: 'Umbrielship', isInternal: true, role: 'administrator' },
      { id: 'org-b', name: 'Atlantic', isInternal: false, role: 'operator' },
    ];
    controller.expectOne('/api/me').flush(profile(organizations, 'org-a'));
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')?.click();
    await settle();
    [...element.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]
      .find((button) => button.textContent?.includes('Atlantic'))
      ?.click();
    await settle();

    const request = controller.expectOne('/api/organizations/switch');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ organizationId: 'org-b' });
    expect(reload).not.toHaveBeenCalled();
    request.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('[C85] one membership renders the name and posts nothing', async () => {
    TestBed.createComponent(InternalLayout);
    await settle();
    controller.expectOne('/api/me').flush(
      profile([{ id: 'org-a', name: 'Umbrielship', isInternal: true, role: 'administrator' }], 'org-a'),
    );
    await settle();
    const element = document.body;
    expect(element.textContent).toContain('Umbrielship');
    controller.expectNone('/api/organizations/switch');
  });
});
