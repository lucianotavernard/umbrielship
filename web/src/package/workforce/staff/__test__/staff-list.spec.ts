import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { toast } from '../../../shared/components/ui/toaster';
import { NO_TEAM_FILTER } from '../staff-filters';
import {
  alfa,
  buttonByText,
  byLabel,
  click,
  dialog,
  drawer,
  rafael,
  squash,
  staff,
  StaffListPage,
  type,
} from './testing';

describe('StaffList', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  const field = <T extends HTMLElement = HTMLInputElement>(selector: string) => drawer()!.querySelector<T>(selector)!;

  it('workforce C9 requests staff, teams, assignments and work orders once', async () => {
    const page = await StaffListPage.pending();

    // expectOne fails on a second request to the same URL.
    await page.answer();

    expect(squash(page.element.querySelector('h1')?.textContent)).toBe('Equipe técnica');
    expect(page.element.textContent).toContain('Conheça os profissionais e organize as equipes da oficina.');
    expect(page.element.textContent).toContain('OPERAÇÃO / PESSOAS');
    expect(page.element.textContent).not.toContain('Equipe técnica MARÉOS');
    expect(controller.match(() => true)).toHaveLength(0);
  });

  it('workforce C10 shows the three metrics whatever the filters', async () => {
    const page = await StaffListPage.open();

    const labels = [...page.element.querySelectorAll('[data-slot="metric"]')].map((metric) => squash(metric.textContent));
    expect(labels[0]).toContain('Profissionais cadastrados');
    expect(labels[1]).toContain('Equipes cadastradas');
    expect(labels[1]).toContain('equipes');
    expect(labels[2]).toContain('Disponíveis agora');
    // Rafael and Camila are in service through Equipe Alfa; João's service is pending.
    expect(page.metrics()).toEqual(['04', '03', '02']);

    await page.search('zzz');
    await click(page.chip('Mecânico naval'));
    expect(page.metrics()).toEqual(['04', '03', '02']);
  });

  it('workforce C11 shows each professional by name with sem equipe for none and the range', async () => {
    const page = await StaffListPage.open();

    expect(page.names()).toEqual(['Camila Rocha', 'João Ferreira', 'Pedro Nascimento', 'Rafael Mendes']);
    expect(page.column('staff-team')).toEqual(['Equipe Alfa', 'Equipe Bravo', 'Sem equipe', 'Equipe Alfa']);
    expect(page.column('staff-status')).toEqual(['Em serviço', 'Disponível', 'Disponível', 'Em serviço']);
    const camilaRow = page.rows()[0];
    expect(camilaRow.textContent).toContain('Técnica elétrica');
    expect(camilaRow.textContent).toContain('camila.rocha@umbriel.test');
    expect(camilaRow.textContent).toContain('(13) 99712-3088');
    expect(squash(camilaRow.textContent)).toContain('CR');
    expect(camilaRow.querySelector('[data-slot="staff-name"]')?.getAttribute('href')).toBe('/staff/camila');
    expect(page.range()).toBe('Exibindo 4 de 4 profissionais');
  });

  it('workforce C12 filters by chip, team and search and shows both empty sentences', async () => {
    const page = await StaffListPage.open();

    expect(page.chipText('Todas')).toBe('Todas · 4');
    expect(page.chipText('Mecânico naval')).toBe('Mecânico naval · 2');
    expect(page.chipText('Técnica elétrica')).toBe('Técnica elétrica · 1');
    await click(page.chip('Mecânico naval'));
    expect(page.chip('Mecânico naval')?.getAttribute('aria-pressed')).toBe('true');
    expect(page.names()).toEqual(['Pedro Nascimento', 'Rafael Mendes']);

    const options = [...page.element.querySelectorAll<HTMLOptionElement>('#team-filter option')].map((option) =>
      squash(option.textContent),
    );
    expect(options).toEqual(['Todas as equipes', 'Equipe Alfa', 'Equipe Bravo', 'Equipe Charlie', 'Sem equipe']);
    await page.filterTeam(NO_TEAM_FILTER);
    expect(page.names()).toEqual(['Pedro Nascimento']);

    await page.filterTeam('');
    await click(page.chip('Todas'));
    await page.search('ALFA');
    expect(page.names()).toEqual(['Camila Rocha', 'Rafael Mendes']);
    expect(page.range()).toBe('Exibindo 2 de 4 profissionais');

    await page.search('zzz');
    expect(page.empty()).toBe('Nenhum profissional encontrado com esses filtros.');
  });

  it('workforce C12 shows ainda não há profissionais with no staff', async () => {
    const page = await StaffListPage.open('administrator', { staff: [] });

    expect(page.empty()).toBe('Ainda não há profissionais cadastrados.');
  });

  it('workforce C13 exports the selected professionals and labels the button by the count', async () => {
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((value: Blob) => {
      blob = value;
      return 'blob:staff';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });

    try {
      const page = await StaffListPage.open();

      expect(page.exportButton().disabled).toBe(true);
      expect(page.exportButton().getAttribute('aria-label')).toBe('Selecione profissionais para exportar');

      await click(byLabel('Selecionar profissional Pedro Nascimento', page.element));
      expect(page.exportButton().textContent?.trim()).toBe('Exportar (1)');
      expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 1 profissional selecionado em CSV');

      await click(byLabel('Selecionar profissional Rafael Mendes', page.element));
      expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 2 profissionais selecionados em CSV');
      await click(page.exportButton());

      expect(downloads).toEqual(['equipe-tecnica.csv']);
      const content = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blob!.arrayBuffer());
      expect(content.split('\r\n')).toEqual([
        '﻿"Nome","Especialidade","Equipe","E-mail","Telefone","Status"',
        // A value a spreadsheet would run as a formula ("+55…") is kept as text.
        `"Pedro Nascimento","Mecânico naval","Sem equipe","pedro.nascimento@umbriel.test","'+55 (13) 99771-2083","Disponível"`,
        '"Rafael Mendes","Mecânico naval","Equipe Alfa","rafael.mendes@umbriel.test","(13) 99821-4401","Em serviço"',
      ]);

      // "Selecionar todos" takes the rows the filters show, then clears them.
      await page.search('alfa');
      const all = byLabel<HTMLInputElement>('Selecionar todos os profissionais visíveis', page.element)!;
      await click(all);
      expect(page.exportButton().textContent?.trim()).toBe('Exportar (3)');
      await click(all);
      expect(page.exportButton().textContent?.trim()).toBe('Exportar (1)');
    } finally {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
    }
  });

  it('workforce C14 creates a professional from the drawer and toasts its name', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await StaffListPage.open();

    await click(buttonByText('Cadastrar profissional', page.element));
    expect(squash(drawer()!.textContent)).toContain('Novo profissional');
    await type(field('#staff-name'), 'Marina Alves');
    await type(field('#staff-specialty'), 'Técnica de manutenção');
    await type(field<HTMLSelectElement>('#staff-team'), 'bravo');
    await type(field('#staff-email'), 'marina.alves@umbriel.test');
    await type(field('#staff-phone'), '(13) 99154-6620');
    await click(buttonByText('Criar profissional', drawer()!));

    const post = controller.expectOne((req) => req.method === 'POST' && req.url === '/api/staff');
    expect(post.request.body).toEqual({
      name: 'Marina Alves',
      specialty: 'Técnica de manutenção',
      email: 'marina.alves@umbriel.test',
      phone: '(13) 99154-6620',
      teamId: 'bravo',
    });
    const marina = { id: 'marina', ...post.request.body };
    post.flush({ staff: marina });
    await page.reload(['/api/staff', '/api/teams'], { staff: [...staff, marina] });

    expect(success).toHaveBeenCalledWith('Marina Alves foi adicionado à equipe técnica.');
    expect(drawer()).toBeNull();
    expect(page.names()).toContain('Marina Alves');
  });

  it('workforce C14 keeps the drawer open on a 409', async () => {
    const error = vi.spyOn(toast, 'error');
    const page = await StaffListPage.open();

    await click(buttonByText('Cadastrar profissional', page.element));
    await type(field('#staff-name'), 'rafael mendes');
    await type(field('#staff-specialty'), 'Mecânico naval');
    await type(field('#staff-email'), 'outro@umbriel.test');
    await type(field('#staff-phone'), '(13) 1');
    await click(buttonByText('Criar profissional', drawer()!));

    controller
      .expectOne((req) => req.method === 'POST' && req.url === '/api/staff')
      .flush({ message: 'Staff name already exists' }, { status: 409, statusText: 'Conflict' });
    await new Promise((resolve) => setTimeout(resolve));

    expect(error).toHaveBeenCalledWith('Erro ao cadastrar profissional', {
      description: 'Já existe um profissional com este nome.',
    });
    expect(drawer()).not.toBeNull();
    expect(field('#staff-name').value).toBe('rafael mendes');
  });

  it('workforce C15 edits a professional from the row menu with its stored values', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await StaffListPage.open();

    const menu = await page.openMenu('Rafael Mendes');
    expect([...menu.querySelectorAll('a, button')].map((item) => squash(item.textContent))).toEqual([
      'Ver perfil',
      'Editar',
      'Excluir',
    ]);
    expect(menu.querySelector('a')?.getAttribute('href')).toBe('/staff/rafael');
    await click(buttonByText('Editar', menu));

    expect(squash(drawer()!.textContent)).toContain('Editar profissional');
    expect(field('#staff-name').value).toBe(rafael.name);
    expect(field('#staff-specialty').value).toBe(rafael.specialty);
    expect(field<HTMLSelectElement>('#staff-team').value).toBe('alfa');
    expect(field('#staff-email').value).toBe(rafael.email);
    expect(field('#staff-phone').value).toBe(rafael.phone);

    await type(field('#staff-specialty'), 'Mecânica naval');
    await type(field<HTMLSelectElement>('#staff-team'), '');
    await click(buttonByText('Salvar alterações', drawer()!));

    const put = controller.expectOne((req) => req.method === 'PUT' && req.url === '/api/staff/rafael');
    expect(put.request.body).toEqual({
      name: rafael.name,
      specialty: 'Mecânica naval',
      email: rafael.email,
      phone: rafael.phone,
      teamId: null,
    });
    put.flush({ staff: { ...rafael, specialty: 'Mecânica naval', teamId: null } });
    await page.reload(['/api/staff', '/api/teams']);

    expect(success).toHaveBeenCalledWith('Profissional atualizado com sucesso');
    expect(drawer()).toBeNull();
  });

  it('workforce C15 deletes after the confirmation and keeps the row on a 409', async () => {
    const success = vi.spyOn(toast, 'success');
    const error = vi.spyOn(toast, 'error');
    const page = await StaffListPage.open();

    await click(buttonByText('Excluir', await page.openMenu('Pedro Nascimento')));
    expect(squash(dialog()!.textContent)).toContain('Excluir profissional');
    expect(controller.match((req) => req.method === 'DELETE')).toHaveLength(0);
    await click(buttonByText('Confirmar', dialog()!));
    controller.expectOne((req) => req.method === 'DELETE' && req.url === '/api/staff/pedro').flush(null);
    await page.reload(['/api/staff', '/api/teams'], { staff: staff.filter((item) => item.id !== 'pedro') });
    expect(success).toHaveBeenCalledWith('Profissional excluído com sucesso');
    expect(page.names()).not.toContain('Pedro Nascimento');

    await click(buttonByText('Excluir', await page.openMenu('Rafael Mendes')));
    await click(buttonByText('Confirmar', dialog()!));
    controller
      .expectOne((req) => req.method === 'DELETE' && req.url === '/api/staff/rafael')
      .flush({ message: 'Staff has Assignment' }, { status: 409, statusText: 'Conflict' });
    await new Promise((resolve) => setTimeout(resolve));
    expect(error).toHaveBeenCalledWith('Erro ao excluir profissional', {
      description: 'Este profissional é responsável por um serviço e não pode ser excluído.',
    });
    expect(page.names()).toContain('Rafael Mendes');
  });

  it('workforce C16 lists the teams in the equipes tab and keeps the tab in the url', async () => {
    const page = await StaffListPage.open();
    const router = TestBed.inject(Router);

    await click(page.tab('Equipes'));
    expect(router.url).toBe('/?tab=equipes');
    expect(page.tab('Equipes')?.getAttribute('aria-selected')).toBe('true');
    expect(page.teamRows()).toEqual([
      ['Equipe Alfa', '2', 'Em serviço'],
      ['Equipe Bravo', '1', 'Disponível'],
      ['Equipe Charlie', '0', 'Disponível'],
    ]);
    expect(page.element.textContent).toContain('NOME');
    expect(page.element.textContent).toContain('PROFISSIONAIS');

    await click(page.tab('Profissionais'));
    expect(router.url).toBe('/');
    expect(page.names()).toHaveLength(4);
  });

  it('workforce C16 opens the equipes tab from the url and shows the empty sentence', async () => {
    await TestBed.inject(Router).navigateByUrl('/?tab=equipes');
    const page = await StaffListPage.open('administrator', { teams: [] });

    expect(page.tab('Equipes')?.getAttribute('aria-selected')).toBe('true');
    expect(page.empty()).toBe('Ainda não há equipes cadastradas.');
  });

  it('workforce C17 creates and edits a team from its drawer', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await StaffListPage.open();
    await click(page.tab('Equipes'));

    await click(buttonByText('Nova equipe', page.element));
    expect(squash(drawer()!.textContent)).toContain('Nova equipe');
    await type(field('#team-name'), 'Equipe Delta');
    await type(field('#team-specialty'), 'Docagem');
    await click(buttonByText('Criar equipe', drawer()!));
    const post = controller.expectOne((req) => req.method === 'POST' && req.url === '/api/teams');
    expect(post.request.body).toEqual({ name: 'Equipe Delta', specialty: 'Docagem' });
    post.flush({ team: { id: 'delta', name: 'Equipe Delta', specialty: 'Docagem' } });
    await page.reload(['/api/teams']);
    expect(success).toHaveBeenCalledWith('Equipe criada com sucesso');

    await click(buttonByText('Editar', await page.openMenu('Equipe Alfa')));
    expect(squash(drawer()!.textContent)).toContain('Editar equipe');
    expect(field('#team-name').value).toBe(alfa.name);
    expect(field('#team-specialty').value).toBe(alfa.specialty);
    await type(field('#team-specialty'), 'Motor e elétrica');
    await click(buttonByText('Salvar alterações', drawer()!));
    const put = controller.expectOne((req) => req.method === 'PUT' && req.url === '/api/teams/alfa');
    expect(put.request.body).toEqual({ name: 'Equipe Alfa', specialty: 'Motor e elétrica' });
    put.flush({ team: { id: 'alfa', name: 'Equipe Alfa', specialty: 'Motor e elétrica' } });
    await page.reload(['/api/teams']);
    expect(success).toHaveBeenCalledWith('Equipe atualizada com sucesso');
  });

  it('workforce C17 warns how many professionals lose the team before deleting it', async () => {
    const success = vi.spyOn(toast, 'success');
    const error = vi.spyOn(toast, 'error');
    const page = await StaffListPage.open();
    await click(page.tab('Equipes'));

    await click(buttonByText('Excluir', await page.openMenu('Equipe Alfa')));
    expect(squash(dialog()!.textContent)).toContain('Excluir equipe');
    expect(squash(dialog()!.textContent)).toContain('Os 2 profissionais desta equipe ficarão sem equipe.');
    await click(buttonByText('Cancelar', dialog()!));

    await click(buttonByText('Excluir', await page.openMenu('Equipe Bravo')));
    expect(squash(dialog()!.textContent)).toContain('O 1 profissional desta equipe ficará sem equipe.');
    await click(buttonByText('Cancelar', dialog()!));

    await click(buttonByText('Excluir', await page.openMenu('Equipe Charlie')));
    expect(squash(dialog()!.textContent)).not.toContain('ficará sem equipe');
    expect(squash(dialog()!.textContent)).not.toContain('ficarão sem equipe');
    await click(buttonByText('Confirmar', dialog()!));
    controller.expectOne((req) => req.method === 'DELETE' && req.url === '/api/teams/charlie').flush(null);
    await page.reload(['/api/teams', '/api/staff']);
    expect(success).toHaveBeenCalledWith('Equipe excluída com sucesso');

    await click(buttonByText('Excluir', await page.openMenu('Equipe Alfa')));
    await click(buttonByText('Confirmar', dialog()!));
    controller
      .expectOne((req) => req.method === 'DELETE' && req.url === '/api/teams/alfa')
      .flush({ message: 'Team has Assignment' }, { status: 409, statusText: 'Conflict' });
    await new Promise((resolve) => setTimeout(resolve));
    expect(error).toHaveBeenCalledWith('Erro ao excluir equipe', {
      description: 'Esta equipe é responsável por um serviço e não pode ser excluída.',
    });
  });

  it('workforce C35 shows skeletons while loading and toasts a failure', async () => {
    const error = vi.spyOn(toast, 'error');
    const page = await StaffListPage.pending();

    expect(page.element.querySelectorAll('[data-slot="metric-skeleton"]')).toHaveLength(3);
    expect(page.element.querySelectorAll('[data-slot="skeleton-row"]').length).toBeGreaterThan(0);
    expect(page.rows()).toHaveLength(0);

    controller.expectOne('/api/staff').flush({ message: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
    controller.expectOne('/api/teams').flush({ teams: [] });
    controller.expectOne('/api/assignments').flush({ assignments: [] });
    controller.expectOne('/api/work-orders').flush({ workOrders: [], total: 0 });
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    // A message the app does not know gives the page's own sentence.
    expect(error).toHaveBeenCalledWith('Erro ao carregar a equipe técnica', {
      description: 'Não foi possível carregar a equipe técnica.',
    });
  });
});
