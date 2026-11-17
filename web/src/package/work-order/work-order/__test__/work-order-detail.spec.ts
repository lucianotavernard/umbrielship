import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localePtBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderDetail } from '../work-order-detail/work-order-detail';
import { buttonByText, click, drawer, local, settle, squash, type } from './work-order-list.harness';

registerLocaleData(localePtBr);

const ID = 'ab12cd34-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const BASE = `/api/work-orders/${ID}`;

/** Tuesday 17 to Friday 20 November 2026, in progress, on the cargo vessel Aurora of 32.5 m. */
const workOrder = {
  id: ID,
  startDate: local(2026, 11, 17, 9, 12),
  endDate: local(2026, 11, 20, 10, 0),
  status: 'IN_PROGRESS',
  vessel: { vesselId: 'v-aur', name: 'Aurora', type: 'CARGO', length: 32.5 },
};

const service = (id: string, name: string, description: string, status: string, day: number) => ({
  id,
  workOrderId: ID,
  name,
  description,
  startDate: local(2026, 11, day, 9, 0),
  endDate: local(2026, 11, day + 1, 17, 0),
  status,
});

const services = [
  service('svc-1', 'Motor', 'Revisão geral do motor', 'PENDING', 17),
  service('svc-2', 'Pintura', 'Casco completo', 'IN_PROGRESS', 18),
  service('svc-3', 'Hélice', 'Troca da hélice', 'COMPLETED', 19),
];

// The tones of the status pills (work-order-list.ts): grey, blue, green.
const TONES: Record<string, string[]> = {
  Pendente: ['bg-[#f0f2f4]', 'text-[#778590]'],
  'Em andamento': ['bg-[#edf4fb]', 'text-[#4e84b7]'],
  Concluído: ['bg-[#eaf5ef]', 'text-[#498b68]'],
};

describe('WorkOrderDetail', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // The locale app.config.ts gives the app.
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    // Write controls render only for a Role that may write.
    TestBed.inject(AuthenticationService).role.set('operator');
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  async function render(serviceList: object[] = services) {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services: serviceList, total: serviceList.length });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [] });
    await settle();
    return fixture.nativeElement as HTMLElement;
  }

  const text = (root: ParentNode, selector: string) => squash(root.querySelector(selector)?.textContent);
  const servicesPanel = (element: HTMLElement) =>
    element.querySelector<HTMLElement>('section[aria-labelledby="work-order-services-title"]')!;
  const inspectionsPanel = (element: HTMLElement) =>
    element.querySelector<HTMLElement>('section[aria-labelledby="work-order-inspections-title"]')!;

  it('work-order-ui C27 shows the breadcrumb, header, vessel and period without the empty panel', async () => {
    const element = await render();

    const crumbs = element.querySelector<HTMLElement>('nav[aria-label="Navegação estrutural"]')!;
    expect([...crumbs.children].map((part) => squash(part.textContent))).toEqual([
      'Ordens de serviço',
      '/',
      'OS #AB12CD34',
    ]);
    const back = crumbs.querySelector('a')!;
    expect(squash(back.textContent)).toBe('Ordens de serviço');
    expect(back.getAttribute('href')).toBe('/work-orders');

    expect(element.textContent).toContain('ORDEM DE SERVIÇO');
    expect(text(element, 'h1')).toBe('OS #AB12CD34');
    const badge = element.querySelector('section[aria-labelledby="work-order-title"] [data-slot="status"]')!;
    expect(squash(badge.textContent)).toBe('Em andamento');
    for (const tone of TONES['Em andamento']) expect([...badge.classList]).toContain(tone);

    const vessel = [...element.querySelectorAll('a')].find((link) => squash(link.textContent) === 'Aurora')!;
    expect(vessel.getAttribute('href')).toBe('/vessels/v-aur');
    const vesselPanel = text(element, '[data-slot="vessel"]')!;
    expect(vesselPanel).toContain('Carga');
    expect(vesselPanel).toContain('32,5 m');

    const start = text(element, '[data-slot="start"]')!;
    expect(start).toContain('Docagem');
    expect(start).toContain('17 de novembro de 2026, 09:12');
    expect(start.toLocaleLowerCase('pt-BR')).toContain('terça-feira');
    const end = text(element, '[data-slot="end"]')!;
    expect(end).toContain('Desdocagem');
    expect(end).toContain('20 de novembro de 2026, 10:00');
    expect(end.toLocaleLowerCase('pt-BR')).toContain('sexta-feira');

    expect(element.textContent).not.toContain('Atividade recente');
    expect(element.textContent).not.toContain('Voltar para detalhes da embarcação');
  });

  it('work-order-ui C28 lists the services and creates one from the Novo serviço drawer', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();
    const panel = servicesPanel(element);

    const headers = [...panel.querySelectorAll('thead th')].map((header) => squash(header.textContent));
    expect(headers.slice(0, 4).map((header) => header?.toLocaleUpperCase('pt-BR'))).toEqual([
      'SERVIÇO',
      'INÍCIO',
      'FIM',
      'STATUS',
    ]);
    const rows = [...panel.querySelectorAll<HTMLElement>('[data-slot="service-row"]')].map((row) => ({
      name: text(row, '[data-slot="service-name"]'),
      description: text(row, '[data-slot="service-description"]'),
      start: text(row, '[data-slot="service-start"]'),
      end: text(row, '[data-slot="service-end"]'),
      status: text(row, '[data-slot="service-status"]'),
    }));
    expect(rows).toEqual([
      {
        name: 'Motor',
        description: 'Revisão geral do motor',
        start: '17/11/2026 09:00',
        end: '18/11/2026 17:00',
        status: 'Pendente',
      },
      {
        name: 'Pintura',
        description: 'Casco completo',
        start: '18/11/2026 09:00',
        end: '19/11/2026 17:00',
        status: 'Em andamento',
      },
      {
        name: 'Hélice',
        description: 'Troca da hélice',
        start: '19/11/2026 09:00',
        end: '20/11/2026 17:00',
        status: 'Concluído',
      },
    ]);
    for (const pill of panel.querySelectorAll('[data-slot="service-status"]')) {
      const label = squash(pill.textContent)!;
      for (const tone of TONES[label]) expect([...pill.classList], label).toContain(tone);
    }

    await click(buttonByText('Novo serviço', panel));
    const sheet = drawer()!;
    expect(text(sheet, '[data-slot="sheet-title"]')).toBe('Novo serviço');
    const labels = [...sheet.querySelectorAll('label')].map((label) => squash(label.textContent)?.replace(/ \*$/, ''));
    expect(labels).toEqual(['Nome', 'Descrição', 'Início', 'Fim', 'Status']);

    await type('#svc-name', 'Leme');
    await type('#svc-description', 'Ajuste do leme');
    await type('#svc-start', '2026-11-19T08:00');
    await type('#svc-end', '2026-11-19T12:30');
    await type('#svc-status', 'IN_PROGRESS');
    await click(sheet.querySelector('form > footer button[type="submit"]'));

    const post = controller.expectOne(`${BASE}/services`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({
      name: 'Leme',
      description: 'Ajuste do leme',
      startDate: local(2026, 11, 19, 8, 0),
      endDate: local(2026, 11, 19, 12, 30),
      status: 'IN_PROGRESS',
    });
    post.flush(service('svc-4', 'Leme', 'Ajuste do leme', 'IN_PROGRESS', 19), { status: 201, statusText: 'Created' });
    await settle();
    const created = { ...service('svc-4', 'Leme', 'Ajuste do leme', 'IN_PROGRESS', 19) };
    const reload = controller.expectOne(`${BASE}/services`);
    expect(reload.request.method).toBe('GET');
    reload.flush({ services: [...services, created], total: 4 });
    await settle();

    expect(success).toHaveBeenCalledWith('Serviço criado com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(
      [...servicesPanel(element).querySelectorAll('[data-slot="service-name"]')].map((name) => squash(name.textContent)),
    ).toEqual(['Motor', 'Pintura', 'Hélice', 'Leme']);
  });

  it('work-order-ui C28 uploads a photo to the service images route', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    const input = element.querySelector<HTMLInputElement>('input[type="file"][aria-label="Enviar foto de Motor"]')!;
    expect(input).not.toBeNull();
    const file = new File(['PNG-S4'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change'));
    await settle();

    const uploaded = controller.expectOne(`${BASE}/services/svc-1/images`);
    expect(uploaded.request.method).toBe('POST');
    expect(uploaded.request.body).toBeInstanceOf(FormData);
    expect((uploaded.request.body as FormData).get('file')).toBe(file);
    uploaded.flush({ image: { id: 'img-1', url: '/uploads/work-order-service-images/photo.png' } });
    await settle();

    expect(success).toHaveBeenCalledWith('Foto enviada', expect.anything());
  });

  it('work-order-ui C28 says no service was executed when there is none', async () => {
    const element = await render([]);
    const panel = servicesPanel(element);

    expect(panel.textContent).toContain('Nenhum serviço executado');
    expect(panel.textContent).toContain('Não há serviços registrados para esta ordem.');
    expect(panel.querySelectorAll('[data-slot="service-row"]').length).toBe(0);
    // A writer can still add the first one.
    expect(!!buttonByText('Novo serviço', panel)).toBe(true);
  });

  it('work-order-ui C25 Editar on the detail puts the new values and shows them', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await render();

    await click(buttonByText('Editar', element));
    const sheet = drawer()!;
    expect(text(sheet, '[data-slot="sheet-title"]')).toBe('Editar ordem de serviço');
    const vessel = sheet.querySelector<HTMLSelectElement>('#wo-vessel')!;
    expect(vessel.disabled).toBe(true);
    expect(vessel.value).toBe('v-aur');
    expect(squash(vessel.selectedOptions[0]?.textContent)).toBe('Aurora');
    expect(sheet.textContent).not.toContain('Serviços a realizar');
    expect(sheet.querySelector('[id^="wo-service-"]')).toBeNull();
    expect(sheet.querySelector<HTMLInputElement>('#wo-start')!.value).toBe('2026-11-17T09:12');
    expect(sheet.querySelector<HTMLInputElement>('#wo-end')!.value).toBe('2026-11-20T10:00');
    expect(sheet.querySelector<HTMLSelectElement>('#wo-status')!.value).toBe('IN_PROGRESS');
    expect(!!buttonByText('Salvar alterações', sheet)).toBe(true);

    await type('#wo-end', '2026-11-21T16:00');
    await type('#wo-status', 'COMPLETED');
    await click(buttonByText('Salvar alterações', sheet));

    const put = controller.expectOne(BASE);
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toEqual({
      startDate: local(2026, 11, 17, 9, 12),
      endDate: local(2026, 11, 21, 16, 0),
      status: 'COMPLETED',
    });
    put.flush(null);
    await settle();
    const reload = controller.expectOne(BASE);
    expect(reload.request.method).toBe('GET');
    reload.flush({ workOrder: { ...workOrder, endDate: local(2026, 11, 21, 16, 0), status: 'COMPLETED' } });
    await settle();

    expect(success).toHaveBeenCalledWith('Ordem atualizada com sucesso', expect.anything());
    expect(drawer()).toBeNull();
    expect(text(element, 'section[aria-labelledby="work-order-title"] [data-slot="status"]')).toBe('Concluído');
    expect(text(element, '[data-slot="end"]')).toContain('21 de novembro de 2026, 16:00');
  });

  it('work-order-ui C30 a 404 shows the not found state with the way back', async () => {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    const notFound = { message: 'Work order not found' };
    controller.expectOne(BASE).flush(notFound, { status: 404, statusText: 'Not Found' });
    controller.expectOne(`${BASE}/services`).flush(notFound, { status: 404, statusText: 'Not Found' });
    controller.expectOne(`${BASE}/inspection-assignments`).flush(notFound, { status: 404, statusText: 'Not Found' });
    await settle();

    const element = fixture.nativeElement as HTMLElement;
    expect(text(element, 'h1')).toBe('Ordem de serviço não encontrada');
    expect(element.textContent).toContain('Esse registro não está disponível na sua organização.');
    const back = [...element.querySelectorAll('a')].find(
      (link) => squash(link.textContent) === 'Voltar para ordens de serviço',
    )!;
    expect(back.getAttribute('href')).toBe('/work-orders');
  });

  it('work-order-ui C31 shows skeletons while the work order loads', async () => {
    const fixture = TestBed.createComponent(WorkOrderDetail);
    fixture.componentRef.setInput('id', ID);
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    const header = element.querySelector<HTMLElement>('section[aria-labelledby="work-order-title"]')!;
    expect(header.querySelectorAll('t-skeleton').length).toBeGreaterThan(0);
    expect(element.querySelector('h1')).toBeNull();
    expect(servicesPanel(element).querySelectorAll('t-skeleton').length).toBeGreaterThan(0);
    expect(inspectionsPanel(element).querySelectorAll('t-skeleton').length).toBeGreaterThan(0);

    controller.expectOne(BASE).flush({ workOrder });
    controller.expectOne(`${BASE}/services`).flush({ services, total: services.length });
    controller.expectOne(`${BASE}/inspection-assignments`).flush({ inspectionAssignments: [] });
    await settle();

    expect(element.querySelectorAll('t-skeleton').length).toBe(0);
    expect(text(element, 'h1')).toBe('OS #AB12CD34');
  });
});
