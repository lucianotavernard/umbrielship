import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import type { Role } from '../../../identity/user/user.service';
import { buttonByText } from '../../../work-order/work-order/__test__/work-order-list.harness';
import { DashboardPage } from './dashboard.harness';

describe('Dashboard as an inspector', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0));
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    vi.useRealTimers();
  });

  /** What a Role reads on the page: the Agenda lines, the Teams, the footer and each row's Responsável. */
  async function readAs(role: Role) {
    TestBed.inject(AuthenticationService).role.set(role);
    const page = await DashboardPage.open();
    const read = {
      agenda: page.agendaItems(),
      teams: page.teamRows(),
      footer: page.footer(),
      responsaveis: page.rows().map((row) => page.text('[data-slot="responsavel"]', row)),
      notes: page.notes(),
    };
    return { page, read };
  }

  it('dashboard C22 shows no write control and the same teams and responsáveis', async () => {
    const operator = await readAs('operator');
    operator.page.fixture.destroy();

    const { page, read } = await readAs('inspector');

    expect(buttonByText('Nova ordem de serviço', page.element)).toBeUndefined();
    const menu = await page.openMenu('#AB12CD34');
    expect(page.texts('a, button', menu)).toEqual(['Ver detalhes']);
    expect(page.element.textContent).not.toContain('Editar');
    expect(page.element.textContent).not.toContain('Excluir');

    // The inspector reads what any other Role reads.
    expect(read).toEqual(operator.read);
    expect(read.responsaveis).toEqual(['Sem responsável', 'B Equipe Bravo', 'RM Rafael Mendes']);
    expect(read.teams.map(([, , status]) => status)).toEqual(['Disponível', 'Em serviço', 'Disponível']);
  });
});
