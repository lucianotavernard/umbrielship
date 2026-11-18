import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Role } from '../../../identity/user/user.service';
import { buttonByText, byLabel, click, squash, StaffListPage } from './testing';

describe('StaffList as a reader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('workforce C18 shows no write control to an operator or an inspector', async () => {
    for (const role of ['operator', 'inspector'] as Role[]) {
      const page = await StaffListPage.open(role);

      expect(buttonByText('Cadastrar profissional', page.element)).toBeUndefined();
      const menu = await page.openMenu('Rafael Mendes');
      expect([...menu.querySelectorAll('a, button')].map((item) => squash(item.textContent))).toEqual(['Ver perfil']);

      // The filters and the export stay.
      expect(page.element.querySelector('input[placeholder="Buscar profissional..."]')).not.toBeNull();
      expect(page.element.querySelector('#team-filter')).not.toBeNull();
      await click(byLabel('Selecionar profissional Rafael Mendes', page.element));
      expect(page.exportButton().disabled).toBe(false);

      await click(page.tab('Equipes'));
      expect(buttonByText('Nova equipe', page.element)).toBeUndefined();
      expect(page.element.querySelector('[aria-label^="Ações para Equipe"]')).toBeNull();
      expect(page.teamRows()).toHaveLength(3);

      await click(page.tab('Profissionais'));
      page.fixture.destroy();
    }
  });
});
