import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  buttons,
  configure,
  organizationAssignment,
  renderHub,
  settle,
  tabs,
  templateSummary,
  text,
  WO_AURORA,
  WO_BOREAL,
} from './testing';

const pending = { id: WO_BOREAL, vesselId: 'v2', status: 'PENDING' };
const inProgress = { id: WO_AURORA, vesselId: 'v1', status: 'IN_PROGRESS' };

describe('InspectionsHub as inspector', () => {
  let controller: HttpTestingController;

  beforeEach(() => {
    controller = configure();
  });

  afterEach(() => controller.verify());

  const cards = (element: HTMLElement) => [
    ...element.querySelectorAll<HTMLElement>('[data-slot="assignment-card"]'),
  ];

  it('work-order-ui C42 lists inspectable assignments first with Inspecionar and the reason', async () => {
    // As the API lists them: `createdAt` descending.
    const element = await renderHub(controller, 'inspector', {
      templates: [templateSummary('t1', 'Casco', 1)],
      assignments: [
        organizationAssignment('a1', {
          templateName: 'Ordem pendente',
          workOrder: pending,
          createdAt: '2026-11-18T10:00:00.000Z',
        }),
        organizationAssignment('a2', {
          templateName: 'Serviço pendente',
          workOrder: inProgress,
          service: { id: 'svc-2', name: 'Pintura do casco', status: 'PENDING' },
          createdAt: '2026-11-17T10:00:00.000Z',
        }),
        organizationAssignment('a3', {
          templateName: 'Ordem inteira',
          workOrder: inProgress,
          createdAt: '2026-11-16T10:00:00.000Z',
        }),
        organizationAssignment('a4', {
          templateName: 'Motor',
          workOrder: inProgress,
          service: { id: 'svc-1', name: 'Motor', status: 'IN_PROGRESS' },
          createdAt: '2026-11-15T10:00:00.000Z',
        }),
      ],
    });

    expect(tabs(element)).toEqual([]);
    expect(buttons(element, 'Novo modelo')).toEqual([]);
    expect(buttons(element, 'Gestão')).toEqual([]);
    expect(element.querySelector('[aria-label="Alternar visualização"]')).toBeNull();
    expect(element.textContent).not.toContain('demonstração');
    expect(element.querySelector('[data-slot="template-card"]')).toBeNull();
    expect(text(element.querySelector('#inspection-list-title'))).toBe('Atribuições de inspeção');
    expect(element.textContent).toContain('Abra uma atribuição para preencher o roteiro em campo.');

    expect(
      cards(element).map((card) => [
        text(card.querySelector('[data-slot="template"]')),
        buttons(card, 'Inspecionar')[0]?.disabled,
        text(card.querySelector('[data-slot="blocked"]')) ?? null,
        card.querySelector('a')?.textContent?.trim(),
      ]),
    ).toEqual([
      ['Ordem inteira', false, null, 'Abrir ordem'],
      ['Motor', false, null, 'Abrir ordem'],
      ['Ordem pendente', true, 'Disponível com a ordem em andamento', 'Abrir ordem'],
      ['Serviço pendente', true, 'Disponível com o serviço em andamento', 'Abrir ordem'],
    ]);

    const router = TestBed.inject(Router);
    buttons(cards(element)[0], 'Inspecionar')[0].click();
    await settle();
    expect(router.url).toBe(`/work-orders/${WO_AURORA}/assignments/a3/inspect?from=inspections`);

    // A disabled Inspecionar goes nowhere.
    buttons(cards(element)[2], 'Inspecionar')[0].click();
    await settle();
    expect(router.url).toBe(`/work-orders/${WO_AURORA}/assignments/a3/inspect?from=inspections`);
  });
});
