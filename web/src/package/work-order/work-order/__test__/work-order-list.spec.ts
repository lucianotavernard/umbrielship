import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import {
  byLabel,
  buttonByText,
  click,
  code,
  customers,
  fleet,
  generated,
  orderA,
  orderB,
  orderC,
  orderD,
  orderE,
  settle,
  squash,
  vessels,
  WorkOrderListPage,
} from './work-order-list.harness';

@Component({ template: 'detail' })
class DetailStub {}

// The tones of the vessel table's status pills (work-order-list.ts): grey, blue, green, rose.
const TONES = {
  Pendente: ['bg-[#f0f2f4]', 'text-[#778590]'],
  'Em andamento': ['bg-[#edf4fb]', 'text-[#4e84b7]'],
  Concluído: ['bg-[#eaf5ef]', 'text-[#498b68]'],
  Cancelado: ['bg-[#fbefed]', 'text-[#b86b61]'],
};

describe('WorkOrderList', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    // "Hoje" and "Amanhã" are read against 17 November 2026, noon, local time.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12, 0));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'work-orders/:id', component: DetailStub }]),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    // Write controls render only for a Role that may write.
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => {
    controller.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('work-order-ui C1 requests work orders, vessels and customers once with no paging', async () => {
    const page = await WorkOrderListPage.open();

    for (const [url, request] of [
      ['/api/work-orders', page.requests.workOrders],
      ['/api/vessels', page.requests.vessels],
      ['/api/customers', page.requests.customers],
    ] as const) {
      expect(request.request.method).toBe('GET');
      expect(request.request.urlWithParams).toBe(url);
      expect(request.request.params.keys()).toEqual([]);
    }
    // Nothing else was asked: no second page, no per-vessel read.
    expect(controller.match(() => true).map((request) => request.request.urlWithParams)).toEqual([]);
    expect(page.rows().length).toBe(5);
  });

  it('work-order-ui C4 sorts by docagem descending then by code', async () => {
    const page = await WorkOrderListPage.open();

    // A 17 nov, C 15 nov, then E and B on 10 nov by code (#AA… before #CD…), then D in October.
    expect(page.codes()).toEqual(['#AB12CD34', '#EF90AB12', '#AA000001', '#CD56EF78', '#12AB34CD']);
  });

  it('work-order-ui C5 shows the four metrics over every work order whatever the filter', async () => {
    const page = await WorkOrderListPage.open();
    const expected = [
      ['Total de ordens', '05'],
      ['Em andamento', '02'],
      ['Pendentes', '01'],
      ['Concluídas', '01'],
    ];

    expect(page.metrics()).toEqual(expected);
    // No footer line under any metric.
    expect(page.element.querySelectorAll('[data-slot="metric"] small').length).toBe(0);

    await click(page.tab('Concluído'));
    await page.search('aurora');
    expect(page.rows().length).toBe(0);
    expect(page.metrics()).toEqual(expected);
  });

  it('work-order-ui C6 filters by the status tab with its count and returns to page 1', async () => {
    // 1-12 pending, 13-17 in progress, 18-19 completed, 20-21 cancelled.
    const status = (index: number) =>
      index <= 12 ? 'PENDING' : index <= 17 ? 'IN_PROGRESS' : index <= 19 ? 'COMPLETED' : 'CANCELLED';
    const page = await WorkOrderListPage.open(generated(21, status));
    const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, at) => code(from + at));

    expect(page.tabs().map((tab) => squash(tab.textContent))).toEqual([
      'Todas 21',
      'Pendente 12',
      'Em andamento 5',
      'Concluído 2',
      'Cancelado 2',
    ]);
    expect(page.selectedTabs()).toEqual(['Todas']);

    await page.goToPage(2);
    expect(page.codes()).toEqual(range(11, 20));

    await click(page.tab('Pendente'));
    expect(page.selectedTabs()).toEqual(['Pendente']);
    expect(page.tab('Pendente').getAttribute('aria-selected')).toBe('true');
    expect(page.currentPage()).toBe('1');
    expect(page.codes()).toEqual(range(1, 10));
    expect(page.range()).toBe('Exibindo 1–10 de 12 ordens');

    await page.goToPage(2);
    expect(page.codes()).toEqual(range(11, 12));
    await click(page.tab('Em andamento'));
    expect(page.selectedTabs()).toEqual(['Em andamento']);
    expect(page.currentPage()).toBe('1');
    expect(page.codes()).toEqual(range(13, 17));

    await click(page.tab('Concluído'));
    expect(page.selectedTabs()).toEqual(['Concluído']);
    expect(page.codes()).toEqual(range(18, 19));

    await click(page.tab('Cancelado'));
    expect(page.selectedTabs()).toEqual(['Cancelado']);
    expect(page.codes()).toEqual(range(20, 21));

    await click(page.tab('Todas'));
    expect(page.selectedTabs()).toEqual(['Todas']);
    expect(page.codes()).toEqual(range(1, 10));
    // The counts never follow the tab.
    expect(page.tabs().map((tab) => squash(tab.textContent))).toEqual([
      'Todas 21',
      'Pendente 12',
      'Em andamento 5',
      'Concluído 2',
      'Cancelado 2',
    ]);
  });

  it('work-order-ui C7 searches within the tab with no request and Limpar busca empties it', async () => {
    // Eight older WorkOrders put the fleet on two pages of 10.
    const page = await WorkOrderListPage.open([...fleet, ...generated(8)]);

    expect(page.searchField().getAttribute('placeholder')).toBe('Buscar ordem, embarcação ou cliente...');

    await page.goToPage(2);
    await page.search('aurora');
    expect(page.currentPage()).toBe('1');
    expect(page.codes()).toEqual(['#AB12CD34', '#12AB34CD']);

    await page.search('#AB12CD');
    expect(page.codes()).toEqual(['#AB12CD34']);
    await page.search('ab12cd');
    expect(page.codes()).toEqual(['#AB12CD34']);
    await page.search('ATLÂNTICO');
    expect(page.codes()).toEqual(['#AB12CD34', '#EF90AB12', '#12AB34CD']);
    await page.search('pintura');
    expect(page.codes()).toEqual(['#AB12CD34', '#AA000001']);

    // Within the tab.
    await click(page.tab('Em andamento'));
    await page.search('aurora');
    expect(page.codes()).toEqual(['#AB12CD34']);
    await click(page.tab('Cancelado'));
    expect(page.codes()).toEqual(['#12AB34CD']);

    // The search never asks the API.
    expect(controller.match(() => true).map((request) => request.request.urlWithParams)).toEqual([]);

    await click(page.tab('Todas'));
    await click(byLabel('Limpar busca', page.element));
    expect(page.searchField().value).toBe('');
    expect(byLabel('Limpar busca', page.element)).toBeNull();
    expect(page.codes()).toHaveLength(10);
    expect(page.range()).toBe('Exibindo 1–10 de 13 ordens');
  });

  it('work-order-ui C8 shows vessel, code and customer, services, prazo and status in each row', async () => {
    const page = await WorkOrderListPage.open();

    const rows = page.rows().map((row) => ({
      avatars: row.querySelectorAll('span[aria-hidden="true"].bg-\\[\\#e9f3f3\\]').length,
      vessel: squash(row.querySelector('[data-slot="vessel"]')?.textContent),
      // The Vessel name is no longer a link: the row opens the WorkOrder (AD-102).
      links: row.querySelectorAll('a').length,
      code: squash(row.querySelector('[data-slot="code"]')?.textContent),
      service: squash(row.querySelector('[data-slot="service"]')?.textContent),
      more: squash(row.querySelector('[data-slot="more-services"]')?.textContent) ?? null,
      prazo: squash(row.querySelector('[data-slot="prazo"]')?.textContent),
      docagem: squash(row.querySelector('[data-slot="docagem"]')?.textContent),
      status: squash(row.querySelector('[data-slot="status"]')?.textContent),
    }));

    expect(rows).toEqual([
      {
        avatars: 1,
        vessel: 'Aurora',
        links: 0,
        code: '#AB12CD34 · Pescados Atlântico',
        service: 'Motor',
        more: '+1 serviço',
        prazo: '20 nov, 10:00',
        docagem: 'Docagem em 17 nov, 09:12',
        status: 'Em andamento',
      },
      {
        avatars: 1,
        vessel: 'Lula Branca',
        links: 0,
        code: '#EF90AB12 · Pescados Atlântico',
        service: 'Nenhum serviço',
        more: null,
        prazo: 'Amanhã, 09:00',
        docagem: 'Docagem em 15 nov, 07:45',
        status: 'Concluído',
      },
      {
        avatars: 1,
        vessel: 'Vento Leste',
        links: 0,
        code: '#AA000001 · Cooperativa Mar Azul',
        service: 'Pintura do convés',
        more: null,
        prazo: '12 nov, 17:00',
        docagem: 'Docagem em 10 nov, 08:00',
        status: 'Em andamento',
      },
      {
        avatars: 1,
        vessel: 'Vento Leste',
        links: 0,
        code: '#CD56EF78 · Cooperativa Mar Azul',
        service: 'Revisão do motor',
        more: null,
        prazo: 'Hoje, 14:30',
        docagem: 'Docagem em 10 nov, 08:00',
        status: 'Pendente',
      },
      {
        avatars: 1,
        vessel: 'Aurora',
        links: 0,
        code: '#12AB34CD · Pescados Atlântico',
        service: 'Casco',
        more: '+2 serviços',
        prazo: '14 out, 16:00',
        docagem: 'Docagem em 12 out, 10:00',
        status: 'Cancelado',
      },
    ]);

    // "Nenhum serviço" stands alone.
    expect(squash(page.rowOf('#EF90AB12')!.querySelectorAll('td')[2].textContent)).toBe('Nenhum serviço');
    for (const row of page.rows()) {
      const pill = row.querySelector('[data-slot="status"]')!;
      const label = squash(pill.textContent) as keyof typeof TONES;
      for (const tone of TONES[label]) expect([...pill.classList], label).toContain(tone);
    }
  });

  it('work-order-ui C9 pages by 10 with one button per page and the footer range', async () => {
    const page = await WorkOrderListPage.open(generated(23));
    const previous = () => byLabel<HTMLButtonElement>('Página anterior', page.element)!;
    const next = () => byLabel<HTMLButtonElement>('Próxima página', page.element)!;

    expect(page.pageButtons().map((button) => squash(button.textContent))).toEqual(['1', '2', '3']);
    expect(page.rows().length).toBe(10);
    expect(page.range()).toBe('Exibindo 1–10 de 23 ordens');
    expect(previous().disabled).toBe(true);
    expect(next().disabled).toBe(false);

    await page.goToPage(2);
    expect(page.currentPage()).toBe('2');
    expect(page.rows().length).toBe(10);
    expect(page.range()).toBe('Exibindo 11–20 de 23 ordens');
    expect(previous().disabled).toBe(false);
    expect(next().disabled).toBe(false);

    await click(next());
    expect(page.currentPage()).toBe('3');
    expect(page.codes()).toEqual([code(21), code(22), code(23)]);
    expect(page.range()).toBe('Exibindo 21–23 de 23 ordens');
    expect(next().disabled).toBe(true);
    expect(previous().disabled).toBe(false);

    await click(previous());
    expect(page.currentPage()).toBe('2');

    await page.search('nada');
    expect(page.range()).toBe('Exibindo 0–0 de 0 ordens');
    expect(page.pageButtons().length).toBe(0);
    expect(previous().disabled).toBe(true);
    expect(next().disabled).toBe(true);
  });

  it('work-order-ui C10 tells an empty organization from a filter with no match', async () => {
    const empty = await WorkOrderListPage.open([]);
    expect(empty.rows().length).toBe(0);
    expect(empty.empty()).toBe('Ainda não há ordens de serviço cadastradas.');
    await click(empty.tab('Pendente'));
    expect(empty.empty()).toBe('Ainda não há ordens de serviço cadastradas.');
    empty.fixture.destroy();

    const page = await WorkOrderListPage.open();
    expect(page.empty()).toBeUndefined();

    await page.search('nada');
    expect(page.empty()).toBe('Nenhuma ordem corresponde aos filtros aplicados.');

    await page.search('');
    await click(page.tab('Cancelado'));
    expect(page.empty()).toBeUndefined();
    await page.search('motor');
    expect(page.rows().length).toBe(0);
    expect(page.empty()).toBe('Nenhuma ordem corresponde aos filtros aplicados.');
  });

  it('work-order-ui C11 shows skeleton rows while loading and a toast when a request fails', async () => {
    const error = vi.spyOn(toast, 'error');
    const answers = {
      workOrders: { workOrders: fleet, total: fleet.length },
      vessels: { vessels, total: vessels.length },
      customers: { customers, total: customers.length },
    };
    // Each read fails in turn, with a message of its own; the other two answer.
    const failures = [
      ['workOrders', 'Work order not found', 'Ordem de serviço não encontrada.'],
      ['vessels', 'Vessel not found', 'Embarcação não encontrada.'],
      ['customers', 'Customer not found', 'Cliente não encontrado.'],
    ] as const;

    for (const [failing, message, description] of failures) {
      error.mockClear();
      const page = await WorkOrderListPage.pending();

      expect(page.element.querySelectorAll('[data-slot="skeleton-row"]').length, failing).toBeGreaterThan(0);
      expect(page.rows().length, failing).toBe(0);
      expect(page.empty(), failing).toBeUndefined();

      const requests = page.reads();
      const others = (Object.keys(requests) as (keyof typeof requests)[]).filter((read) => read !== failing);
      // Still waiting for the failing read: the rows are not drawn yet and nothing is said.
      for (const read of others) requests[read].flush(answers[read]);
      await settle();
      expect(page.element.querySelectorAll('[data-slot="skeleton-row"]').length, failing).toBeGreaterThan(0);
      expect(error, failing).not.toHaveBeenCalled();

      requests[failing].flush({ statusCode: 404, message }, { status: 404, statusText: 'Not Found' });
      await settle();

      expect(error.mock.calls, failing).toEqual([[expect.any(String), { description }]]);
      expect(page.element.querySelectorAll('[data-slot="skeleton-row"]').length, failing).toBe(0);
      page.fixture.destroy();
    }
  });

  it('work-order-ui C12 selects rows and the page, shows indeterminate and keeps the selection', async () => {
    // Odd ones pending, even ones in progress.
    const page = await WorkOrderListPage.open(generated(21, (index) => (index % 2 ? 'PENDING' : 'IN_PROGRESS')));
    const all = () => byLabel<HTMLInputElement>('Selecionar todas as ordens visíveis', page.element)!;
    const checked = () =>
      page.rows().map((row) => row.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked);
    const box = (index: number) => byLabel<HTMLInputElement>(`Selecionar ordem ${code(index)}`, page.element);
    const only = (...on: number[]) => Array.from({ length: 10 }, (_, at) => on.includes(at));

    expect(page.rows().map((row) => row.querySelector('input[type="checkbox"]')!.getAttribute('aria-label'))).toEqual(
      Array.from({ length: 10 }, (_, at) => `Selecionar ordem ${code(at + 1)}`),
    );

    await click(box(1));
    expect(checked()).toEqual(only(0));
    expect(all().indeterminate).toBe(true);
    expect(all().checked).toBe(false);

    await click(all());
    expect(checked()).toEqual(Array(10).fill(true));
    expect(all().checked).toBe(true);
    expect(all().indeterminate).toBe(false);

    // Page 2: none of its rows is selected yet.
    await page.goToPage(2);
    expect(checked()).toEqual(Array(10).fill(false));
    expect(all().checked).toBe(false);
    expect(all().indeterminate).toBe(false);
    await click(box(11));
    expect(all().indeterminate).toBe(true);

    // A tab keeps the selection: 2, 4, 6, 8 and 10 were selected on page 1.
    await click(page.tab('Em andamento'));
    expect(page.codes()).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(code));
    expect(checked()).toEqual(only(0, 1, 2, 3, 4));
    expect(all().indeterminate).toBe(true);

    // A search keeps it too.
    await click(page.tab('Todas'));
    await page.search('0000000B');
    expect(page.codes()).toEqual([code(11)]);
    expect(checked()).toEqual([true]);
    expect(all().checked).toBe(true);

    await page.search('');
    expect(checked()).toEqual(Array(10).fill(true));
    await page.goToPage(2);
    expect(checked()).toEqual(only(0));
    expect(page.exportButton().textContent?.trim()).toBe('Exportar (11)');

    // With every shown row selected, the header clears them.
    await page.goToPage(1);
    await click(all());
    expect(checked()).toEqual(Array(10).fill(false));
    expect(page.exportButton().textContent?.trim()).toBe('Exportar (1)');
  });

  it('work-order-ui C13 exports the selected work orders, hidden ones included', async () => {
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((value: Blob) => {
      blob = value;
      return 'blob:work-orders';
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    });

    try {
      const page = await WorkOrderListPage.open();

      expect(page.exportButton().disabled).toBe(true);
      expect(page.exportButton().getAttribute('aria-label')).toBe('Selecione ordens para exportar');
      expect(page.exportButton().textContent?.trim()).toBe('Exportar');

      await click(byLabel('Selecionar ordem #CD56EF78', page.element));
      expect(page.exportButton().disabled).toBe(false);
      expect(page.exportButton().textContent?.trim()).toBe('Exportar (1)');
      expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 1 ordem selecionada em CSV');

      await click(byLabel('Selecionar ordem #AB12CD34', page.element));
      expect(page.exportButton().textContent?.trim()).toBe('Exportar (2)');
      expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 2 ordens selecionadas em CSV');

      // #CD56EF78 is hidden by the search and still exported.
      await page.search('aurora');
      expect(page.codes()).not.toContain('#CD56EF78');
      await click(page.exportButton());

      expect(downloads).toEqual(['ordens-de-servico.csv']);
      // text() would drop the BOM; the file keeps it.
      const content = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await blob!.arrayBuffer());
      expect(content.split('\r\n')).toEqual([
        '﻿"OS","Embarcação","Cliente","Serviço","Docagem","Desdocagem","Status"',
        '"#AB12CD34","Aurora","Pescados Atlântico","Motor · Pintura do casco","17/11/2026 09:12","20/11/2026 10:00","Em andamento"',
        '"#CD56EF78","Vento Leste","Cooperativa Mar Azul","Revisão do motor","10/11/2026 08:00","17/11/2026 14:30","Pendente"',
      ]);
    } finally {
      URL.createObjectURL = createObjectURL;
      URL.revokeObjectURL = revokeObjectURL;
    }
  });

  it('work-order-ui C14 the row opens the detail and Excluir deletes after confirmation', async () => {
    const success = vi.spyOn(toast, 'success');
    const page = await WorkOrderListPage.open();
    const router = TestBed.inject(Router);

    // The checkbox selects without opening the WorkOrder.
    await click(byLabel('Selecionar ordem #AB12CD34', page.element));
    await click(byLabel('Selecionar ordem #EF90AB12', page.element));
    expect(router.url).toBe('/');

    // Two icon buttons, hidden until the row's hover or focus; Excluir in the destructive colour.
    const actions = page.actions('#AB12CD34');
    expect([...actions.querySelectorAll('button')].map((button) => button.getAttribute('aria-label'))).toEqual([
      'Editar ordem #AB12CD34',
      'Excluir ordem #AB12CD34',
    ]);
    const reveal = actions.firstElementChild!;
    expect(reveal.classList).toContain('opacity-0');
    expect(reveal.classList).toContain('group-hover:opacity-100');
    expect(page.rowOf('#AB12CD34')!.classList).toContain('group');
    expect(byLabel('Excluir ordem #AB12CD34', page.element)!.classList).toContain('text-destructive');
    expect(page.element.querySelector('[aria-label^="Ações para"]')).toBeNull();
    expect(page.element.textContent).not.toContain('Ver detalhes');

    // A click on the actions cell does not open the WorkOrder either.
    await click(actions);
    expect(router.url).toBe('/');

    await click(byLabel('Excluir ordem #AB12CD34', page.element));
    expect(router.url).toBe('/');
    const confirmation = document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    expect(confirmation.textContent).toContain(
      'Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.',
    );
    controller.expectNone(`/api/work-orders/${orderA.id}`);

    await click(buttonByText('Confirmar', confirmation));
    const deletion = controller.expectOne(`/api/work-orders/${orderA.id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    await page.reload(fleet.filter((order) => order.id !== orderA.id));

    expect(success).toHaveBeenCalledWith('Ordem de serviço excluída com sucesso', expect.anything());
    expect(page.codes()).toEqual(['#EF90AB12', '#AA000001', '#CD56EF78', '#12AB34CD']);
    // Its selection went with it: only #EF90AB12 is left to export.
    expect(page.exportButton().textContent?.trim()).toBe('Exportar (1)');
    expect(page.exportButton().getAttribute('aria-label')).toBe('Exportar 1 ordem selecionada em CSV');
    expect(router.url).toBe('/');

    // A click anywhere else on the row opens its WorkOrder, and so does Enter on the row.
    await click(page.rowOf('#CD56EF78')!.querySelector('[data-slot="vessel"]'));
    expect(router.url).toBe(`/work-orders/${orderB.id}`);
    page.rowOf('#AA000001')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();
    expect(router.url).toBe(`/work-orders/${orderE.id}`);
  });

  it('work-order-ui C14 a 409 on delete keeps the row and shows the API message', async () => {
    const error = vi.spyOn(toast, 'error');
    const success = vi.spyOn(toast, 'success');
    const page = await WorkOrderListPage.open();

    await click(byLabel('Excluir ordem #AB12CD34', page.element));
    await click(buttonByText('Confirmar', document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!));
    const deletion = controller.expectOne(`/api/work-orders/${orderA.id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush({ message: 'Work order has inspections' }, { status: 409, statusText: 'Conflict' });
    await settle();

    expect(error).toHaveBeenCalledWith(expect.any(String), {
      description: 'Esta ordem de serviço tem inspeções e não pode ser excluída.',
    });
    expect(success).not.toHaveBeenCalled();
    expect(page.codes()).toEqual(['#AB12CD34', '#EF90AB12', '#AA000001', '#CD56EF78', '#12AB34CD']);
  });
});
