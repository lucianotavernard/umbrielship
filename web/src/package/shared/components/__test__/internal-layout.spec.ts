import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { InternalLayout } from '../internal-layout';
import { PAGE_RELOAD } from '../lib/page-reload';

@Component({ template: 'page' })
class Page {}

const squash = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim();

describe('InternalLayout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(['dashboard', 'agenda', 'staff', 'staff/:id'].map((path) => ({ path, component: Page }))),
        { provide: PAGE_RELOAD, useValue: vi.fn() },
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  async function settle() {
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  it('workforce C9 lists Equipe técnica after Agenda and names it in the topbar', async () => {
    const fixture = TestBed.createComponent(InternalLayout);
    await settle();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/me')
      .flush({
        user: {
          id: 'u1',
          name: 'Camila Rocha',
          email: 'camila@x.test',
          role: 'inspector',
          organization: { id: 'org-a', name: 'Pescados Atlântico', isInternal: false },
          organizations: [{ id: 'org-a', name: 'Pescados Atlântico', isInternal: false, role: 'inspector' }],
        },
      });
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    const links = [...element.querySelectorAll<HTMLAnchorElement>('nav a')].map((link) => [
      squash(link.textContent),
      link.getAttribute('href'),
    ]);
    const agenda = links.findIndex(([label]) => label === 'Agenda');
    expect(links[agenda + 1]).toEqual(['Equipe técnica', '/staff']);

    const router = TestBed.inject(Router);
    for (const url of ['/staff', '/staff/rafael', '/staff?tab=equipes']) {
      await router.navigateByUrl(url);
      await settle();
      fixture.detectChanges();

      const crumb = element.querySelector('main[data-slot="sidebar-inset"] > header [data-slot="breadcrumb-section"]')!;
      expect(squash(crumb.parentElement!.textContent), url).toBe('Operação Equipe técnica');
      const current = [...element.querySelectorAll('nav a[aria-current="page"]')].map((link) => squash(link.textContent));
      expect(current, url).toEqual(['Equipe técnica']);
    }
  });
});
