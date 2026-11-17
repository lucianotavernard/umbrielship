import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { toast } from '../../../shared/components/ui/toaster';
import { InspectionsHub } from '../inspections-hub/inspections-hub';
import {
  button,
  buttons,
  choose,
  completed,
  configure,
  dialog,
  dialogs,
  fill,
  metrics,
  options,
  organizationAssignment,
  renderHub,
  settle,
  tabs,
  templateSummary,
  text,
  WO_AURORA,
  WO_BOREAL,
} from './testing';

const casco = templateSummary('t1', 'Casco', 1);
const pintura = templateSummary('t2', 'Pintura', 3, '2026-11-12T15:00:00.000Z');

describe('InspectionsHub', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    controller = configure();
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  const cards = (element: HTMLElement) => [
    ...element.querySelectorAll<HTMLElement>('[data-slot="template-card"]'),
  ];
  const assignmentCards = (element: HTMLElement) => [
    ...element.querySelectorAll<HTMLElement>('[data-slot="assignment-card"]'),
  ];
  const sheet = (element: HTMLElement) => dialogs(element)[0];

  it('work-order-ui C33 requests templates, assignments, work orders and vessels once with no switch', async () => {
    TestBed.inject(AuthenticationService).role.set('administrator');
    const fixture = TestBed.createComponent(InspectionsHub);
    await settle();

    // Each read once, a GET with no query: no `page`, `per_page`, `take` or `skip`.
    for (const url of [
      '/api/inspection-templates',
      '/api/inspection-assignments',
      '/api/work-orders',
      '/api/vessels',
    ]) {
      const requests = controller.match((request) => request.url.split('?')[0] === url);
      expect(
        requests.map((request) => [request.request.method, request.request.urlWithParams]),
        url,
      ).toEqual([['GET', url]]);
      expect(requests[0].request.params.keys(), url).toEqual([]);
      const body: Record<string, object> = {
        '/api/inspection-templates': { inspectionTemplates: [casco], total: 1 },
        '/api/inspection-assignments': { inspectionAssignments: [] },
        '/api/work-orders': { workOrders: [], total: 0 },
        '/api/vessels': { vessels: [], total: 0 },
      };
      requests[0].flush(body[url]);
    }
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(text(element.querySelector('h1'))).toBe('Inspeções');
    expect(buttons(element, 'Novo modelo')).toHaveLength(1);
    expect(element.querySelector('[aria-label="Alternar visualização"]')).toBeNull();
    expect(buttons(element, 'Gestão')).toEqual([]);
    expect(buttons(element, 'Inspetor')).toEqual([]);
    expect(element.textContent).not.toContain('demonstração');
    controller.expectNone(() => true);
  });

  it('work-order-ui C37 counts templates, waiting assignments and visible inspections', async () => {
    const element = await renderHub(controller, 'administrator', {
      templates: [casco],
      assignments: [
        organizationAssignment('a1'),
        organizationAssignment('a2', {
          inspections: [completed('i1', 'APPROVED'), completed('i2', 'REPROVED')],
        }),
        organizationAssignment('a3', {
          inspections: [
            completed('i3', 'APPROVED'),
            completed('i4', 'APPROVED'),
            completed('i5', 'REPROVED'),
          ],
        }),
        organizationAssignment('a4'),
        organizationAssignment('a5'),
      ],
    });

    expect(metrics(element)).toEqual([
      ['Modelos ativos', '01', 'roteiros'],
      ['Aguardando conclusão', '03', 'atribuições'],
      ['Concluídas', '05', 'inspeções'],
    ]);
  });

  it('work-order-ui C38 shows the template cards with their counts, dates and links', async () => {
    const element = await renderHub(controller, 'administrator', {
      templates: [casco, pintura],
      assignments: [
        organizationAssignment('a1'),
        organizationAssignment('a2'),
        organizationAssignment('a3'),
      ],
    });

    expect(text(element.querySelector('#inspection-list-title'))).toBe('Central de inspeções');
    expect(tabs(element).map((tab) => [text(tab), tab.getAttribute('aria-selected')])).toEqual([
      ['Modelos 2', 'true'],
      ['Atribuições 3', 'false'],
    ]);
    expect(
      cards(element).map((card) => [
        text(card.querySelector('[data-slot="template-name"]')),
        card.querySelector('[data-slot="template-name"]')?.getAttribute('href'),
        text(card.querySelector('[data-slot="template-count"]')),
        text(card.querySelector('[data-slot="template-date"]')),
        buttons(card, 'Atribuir à OS').length,
      ]),
    ).toEqual([
      ['Casco', '/inspection-templates/t1', '1 pergunta', 'Criado em 18 nov, 2026', 1],
      ['Pintura', '/inspection-templates/t2', '3 perguntas', 'Criado em 12 nov, 2026', 1],
    ]);
    expect(cards(element).every((card) => card.textContent?.includes('MODELO'))).toBe(true);

    // "Novo modelo" in the heading and "Criar outro modelo" as the last card.
    expect(
      buttons(element.querySelector('h1')!.parentElement!.parentElement!, 'Novo modelo'),
    ).toHaveLength(1);
    const grid = cards(element)[0].parentElement!;
    const last = grid.lastElementChild as HTMLElement;
    expect(text(last.querySelector('strong'))).toBe('Criar outro modelo');
    expect(text(last.querySelector('small'))).toBe(
      'Monte um roteiro para uma nova rotina de inspeção',
    );
  });

  it('work-order-ui C38 an operator reads the tabs with no write control', async () => {
    const element = await renderHub(controller, 'operator', {
      templates: [casco, pintura],
      assignments: [organizationAssignment('a1')],
    });

    expect(tabs(element).map((tab) => text(tab))).toEqual(['Modelos 2', 'Atribuições 1']);
    expect(cards(element)).toHaveLength(2);
    expect(buttons(element, 'Novo modelo')).toEqual([]);
    expect(buttons(element, 'Atribuir à OS')).toEqual([]);
    expect(element.textContent).not.toContain('Criar outro modelo');
  });

  it('work-order-ui C38 says there is no template', async () => {
    const element = await renderHub(controller, 'administrator', { templates: [] });

    expect(tabs(element).map((tab) => text(tab))).toEqual(['Modelos 0', 'Atribuições 0']);
    expect(cards(element)).toEqual([]);
    expect(text(element.querySelector('[data-slot="templates-empty"]'))).toBe(
      'Nenhum modelo de inspeção cadastrado',
    );
  });

  it('work-order-ui C39 creates a template from the drawer and shows its card first', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await renderHub(controller, 'administrator', { templates: [casco, pintura] });

    // "Criar outro modelo" opens the same drawer as "Novo modelo".
    const createCard = [...element.querySelectorAll<HTMLButtonElement>('button')].find(
      (control) => text(control.querySelector('strong')) === 'Criar outro modelo',
    )!;
    createCard.click();
    await settle();
    expect(text(sheet(element).querySelector('h2'))).toBe('Novo modelo');
    button(sheet(element), 'Cancelar').click();
    await settle();
    expect(dialogs(element)).toEqual([]);

    button(element, 'Novo modelo').click();
    await settle();
    const drawer = sheet(element);
    expect(text(drawer.querySelector('[data-slot="sheet-kicker"]'))).toBe(
      'BIBLIOTECA DE INSPEÇÕES',
    );
    expect(text(drawer.querySelector('h2'))).toBe('Novo modelo');
    expect(text(drawer.querySelector('[data-slot="sheet-description"]'))).toBe(
      'Defina as perguntas que o inspetor deverá responder em campo.',
    );
    expect(text(drawer.querySelector('label[for="template-name"]'))).toBe('Nome do modelo');
    expect(text(drawer.querySelector('h3'))).toBe('Perguntas');
    expect(drawer.textContent).toContain(
      'Todas as perguntas precisam ser respondidas; “Não se aplica” vale como resposta.',
    );
    const editors = () => [
      ...drawer.querySelectorAll<HTMLElement>('[data-slot="question-editor"]'),
    ];
    expect(text(editors()[0].querySelector('strong'))).toBe('Pergunta 01');
    expect(text(editors()[0].querySelector('label[for="question-0"]'))).toBe('Enunciado');
    expect(text(editors()[0].querySelector('label[for="question-type-0"]'))).toBe(
      'Tipo de resposta',
    );
    expect(options(drawer.querySelector<HTMLSelectElement>('#question-type-0')!)).toEqual([
      'Texto livre',
      'Sim ou não',
      'Conforme / não conforme',
      'Nota de 0 a 10',
    ]);
    expect(buttons(drawer, 'Subir')).toHaveLength(1);
    expect(buttons(drawer, 'Descer')).toHaveLength(1);
    expect(buttons(drawer, 'Remover pergunta 1')).toEqual([]);

    button(drawer, 'Adicionar').click();
    await settle();
    expect(editors().map((editor) => text(editor.querySelector('strong')))).toEqual([
      'Pergunta 01',
      'Pergunta 02',
    ]);
    expect(buttons(drawer, 'Remover pergunta 1')).toHaveLength(1);
    expect(buttons(drawer, 'Remover pergunta 2')).toHaveLength(1);

    fill(drawer.querySelector<HTMLInputElement>('#template-name')!, 'Inspeção do casco');
    fill(drawer.querySelector<HTMLInputElement>('#question-0')!, 'Casco limpo?');
    choose(drawer.querySelector<HTMLSelectElement>('#question-type-0')!, 'YES_NO');
    fill(drawer.querySelector<HTMLInputElement>('#question-1')!, 'Observações');
    choose(drawer.querySelector<HTMLSelectElement>('#question-type-1')!, 'TEXT');
    await settle();
    button(drawer, 'Criar modelo').click();
    await settle();

    const created = controller.expectOne('/api/inspection-templates');
    expect(created.request.method).toBe('POST');
    expect(created.request.body).toEqual({
      name: 'Inspeção do casco',
      items: [
        { label: 'Casco limpo?', type: 'YES_NO' },
        { label: 'Observações', type: 'TEXT' },
      ],
    });
    created.flush(
      {
        inspectionTemplate: {
          id: 't3',
          name: 'Inspeção do casco',
          createdAt: '2026-11-18T16:00:00.000Z',
          items: [],
        },
      },
      { status: 201, statusText: 'Created' },
    );
    await settle();

    expect(success).toHaveBeenCalledWith(
      'Modelo de inspeção criado com sucesso',
      expect.anything(),
    );
    expect(dialogs(element)).toEqual([]);
    controller.expectOne({ method: 'GET', url: '/api/inspection-templates' }).flush({
      inspectionTemplates: [templateSummary('t3', 'Inspeção do casco', 2), casco, pintura],
      total: 3,
    });
    await settle();

    expect(tabs(element)[0].getAttribute('aria-selected')).toBe('true');
    expect(
      cards(element).map((card) => text(card.querySelector('[data-slot="template-name"]'))),
    ).toEqual(['Inspeção do casco', 'Casco', 'Pintura']);
  });

  it('work-order-ui C39 a taken name keeps the drawer open', async () => {
    const error = vi.spyOn(toast, 'error');
    const element = await renderHub(controller, 'administrator', { templates: [casco] });

    button(element, 'Novo modelo').click();
    await settle();
    fill(sheet(element).querySelector<HTMLInputElement>('#template-name')!, 'Casco');
    fill(sheet(element).querySelector<HTMLInputElement>('#question-0')!, 'Casco limpo?');
    await settle();
    button(sheet(element), 'Criar modelo').click();
    await settle();
    const created = controller.expectOne('/api/inspection-templates');
    expect(created.request.method).toBe('POST');
    created.flush(
      { statusCode: 409, message: 'Inspection template already exists' },
      { status: 409, statusText: 'Conflict' },
    );
    await settle();

    expect(error).toHaveBeenCalledWith('Já existe um modelo de inspeção com este nome');
    expect(dialogs(element)).toHaveLength(1);
    expect(sheet(element).querySelector<HTMLInputElement>('#template-name')!.value).toBe('Casco');
    controller.expectNone({ method: 'GET', url: '/api/inspection-templates' });
  });

  it('work-order-ui C40 assigns a template to a work order service from its card', async () => {
    const success = vi.spyOn(toast, 'success');
    const element = await renderHub(controller, 'administrator', {
      templates: [casco, pintura],
      assignments: [organizationAssignment('a1', { templateName: 'Casco' })],
    });

    buttons(cards(element)[1], 'Atribuir à OS')[0].click();
    await settle();
    const drawer = sheet(element);
    expect(text(drawer.querySelector('[data-slot="sheet-kicker"]'))).toBe('ATRIBUIR INSPEÇÃO');
    expect(text(drawer.querySelector('h2'))).toBe('Escolha a OS e o alvo');
    expect(text(drawer.querySelector('[data-slot="sheet-description"]'))).toBe(
      'A inspeção usará o modelo Pintura.',
    );
    expect(text(drawer.querySelector('label[for="assign-work-order"]'))).toBe('Ordem de serviço');
    expect(text(drawer.querySelector('label[for="assign-target"]'))).toBe('Alvo');
    const workOrder = drawer.querySelector<HTMLSelectElement>('#assign-work-order')!;
    const target = drawer.querySelector<HTMLSelectElement>('#assign-target')!;
    expect(options(workOrder)).toEqual([
      'Selecione uma ordem',
      '#AB12CD34 · Aurora — Motor',
      '#EF56AB78 · Boreal — Nenhum serviço',
    ]);
    expect(workOrder.value).toBe('');
    expect(options(target)).toEqual(['Ordem de serviço inteira']);
    expect(text(drawer.querySelector('[data-slot="summary"]'))).toBe('3 perguntas');

    choose(workOrder, WO_AURORA);
    await settle();
    expect(options(target)).toEqual(['Ordem de serviço inteira', 'Motor', 'Pintura do casco']);
    choose(target, 'svc-2');
    await settle();
    button(drawer, 'Atribuir inspeção').click();
    await settle();

    const assigned = controller.expectOne(`/api/work-orders/${WO_AURORA}/inspection-assignments`);
    expect(assigned.request.method).toBe('POST');
    expect(assigned.request.body).toEqual({ templateId: 't2', serviceId: 'svc-2' });
    assigned.flush({ inspectionAssignment: { id: 'a2' } }, { status: 201, statusText: 'Created' });
    await settle();

    expect(success).toHaveBeenCalledWith('Modelo atribuído com sucesso', expect.anything());
    expect(dialogs(element)).toEqual([]);
    controller.expectOne({ method: 'GET', url: '/api/inspection-assignments' }).flush({
      inspectionAssignments: [
        organizationAssignment('a2', {
          templateName: 'Pintura',
          questions: 3,
          service: { id: 'svc-2', name: 'Pintura do casco', status: 'PENDING' },
          createdAt: '2026-11-18T16:00:00.000Z',
        }),
        organizationAssignment('a1', { templateName: 'Casco' }),
      ],
    });
    await settle();

    expect(tabs(element).map((tab) => tab.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
    ]);
    expect(
      assignmentCards(element).map((card) => text(card.querySelector('[data-slot="template"]'))),
    ).toEqual(['Pintura', 'Casco']);
  });

  it('work-order-ui C40 assigns to the whole work order without a serviceId', async () => {
    const element = await renderHub(controller, 'administrator', { templates: [casco] });

    button(element, 'Atribuir à OS').click();
    await settle();
    choose(sheet(element).querySelector<HTMLSelectElement>('#assign-work-order')!, WO_BOREAL);
    await settle();
    button(sheet(element), 'Atribuir inspeção').click();
    await settle();

    const assigned = controller.expectOne(`/api/work-orders/${WO_BOREAL}/inspection-assignments`);
    expect(assigned.request.method).toBe('POST');
    expect(assigned.request.body).toEqual({ templateId: 't1' });
    assigned.flush({ inspectionAssignment: { id: 'a9' } }, { status: 201, statusText: 'Created' });
    await settle();
    controller
      .expectOne({ method: 'GET', url: '/api/inspection-assignments' })
      .flush({ inspectionAssignments: [] });
  });

  it('work-order-ui C41 lists the assignments with target, pill and Abrir ordem', async () => {
    const element = await renderHub(controller, 'operator', {
      templates: [casco],
      assignments: [
        organizationAssignment('a1', {
          templateName: 'Pintura',
          questions: 1,
          service: { id: 'svc-2', name: 'Pintura do casco', status: 'PENDING' },
        }),
        organizationAssignment('a2', {
          templateName: 'Casco',
          questions: 3,
          // Newest first: the latest result is the first one.
          inspections: [completed('i2', 'APPROVED'), completed('i1', 'REPROVED')],
        }),
        organizationAssignment('a3', {
          templateName: 'Leme',
          questions: 2,
          workOrder: { id: WO_BOREAL, vesselId: 'v2', status: 'PENDING' },
          inspections: [completed('i3', 'REPROVED')],
        }),
      ],
    });

    button(element, 'Atribuições 3').click();
    await settle();

    expect(
      assignmentCards(element).map((card) => [
        text(card.querySelector('[data-slot="eyebrow"]')),
        text(card.querySelector('[data-slot="template"]')),
        text(card.querySelector('[data-slot="target"]')),
        text(card.querySelector('[data-slot="pill"]')),
        card.querySelector('a')?.textContent?.trim(),
        card.querySelector('a')?.getAttribute('href'),
      ]),
    ).toEqual([
      [
        '#AB12CD34 · Aurora',
        'Pintura',
        'Pintura do casco · 1 pergunta',
        'Sem inspeção',
        'Abrir ordem',
        `/work-orders/${WO_AURORA}`,
      ],
      [
        '#AB12CD34 · Aurora',
        'Casco',
        'Ordem de serviço inteira · 3 perguntas',
        'Aprovada',
        'Abrir ordem',
        `/work-orders/${WO_AURORA}`,
      ],
      [
        '#EF56AB78 · Boreal',
        'Leme',
        'Ordem de serviço inteira · 2 perguntas',
        'Reprovada',
        'Abrir ordem',
        `/work-orders/${WO_BOREAL}`,
      ],
    ]);
    // Amber, green and rose, as the mareos pills.
    expect(
      assignmentCards(element).map(
        (card) => card.querySelector('[data-slot="pill"]')!.className.match(/bg-\[#\w+\]/)?.[0],
      ),
    ).toEqual(['bg-[#fbf4e7]', 'bg-[#eaf5ef]', 'bg-[#fbefed]']);
    expect(buttons(element, 'Inspecionar')).toEqual([]);
  });

  it('work-order-ui C41 says no inspection is assigned', async () => {
    const element = await renderHub(controller, 'administrator', {
      templates: [casco],
      assignments: [],
    });

    button(element, 'Atribuições 0').click();
    await settle();

    expect(assignmentCards(element)).toEqual([]);
    const empty = element.querySelector('[data-slot="assignments-empty"]');
    expect(text(empty?.querySelector('strong'))).toBe('Nenhuma inspeção atribuída');
    expect(text(empty?.querySelector('span:last-child'))).toBe(
      'Quando um modelo for atribuído a uma ordem de serviço, ele aparecerá aqui.',
    );
  });

  it('work-order-ui C46 shows skeletons while loading and a toast when a request fails', async () => {
    const error = vi.spyOn(toast, 'error');
    TestBed.inject(AuthenticationService).role.set('administrator');
    const fixture = TestBed.createComponent(InspectionsHub);
    await settle();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('[data-slot="metric-skeleton"]')).toHaveLength(3);
    expect(element.querySelectorAll('[data-slot="metric"]')).toHaveLength(0);
    expect(element.querySelectorAll('[data-slot="card-skeleton"]')).toHaveLength(3);
    expect(cards(element)).toEqual([]);

    controller
      .expectOne({ method: 'GET', url: '/api/inspection-templates' })
      .flush({ inspectionTemplates: [casco], total: 1 });
    controller
      .expectOne({ method: 'GET', url: '/api/inspection-assignments' })
      .flush(
        { statusCode: 400, message: 'Validation failed' },
        { status: 400, statusText: 'Bad Request' },
      );
    controller
      .expectOne({ method: 'GET', url: '/api/work-orders' })
      .flush({ workOrders: [], total: 0 });
    controller.expectOne({ method: 'GET', url: '/api/vessels' }).flush({ vessels: [], total: 0 });
    await settle();

    expect(error).toHaveBeenCalledWith('Erro ao carregar inspeções', {
      description: 'Verifique os campos preenchidos.',
    });
    expect(element.querySelectorAll('[data-slot="metric-skeleton"]')).toHaveLength(0);
  });
});
