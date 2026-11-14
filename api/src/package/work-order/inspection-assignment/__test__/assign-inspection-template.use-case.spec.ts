import { beforeEach, describe, expect, it } from 'vitest';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WORK_ORDER_STATUSES } from '@/package/work-order/work-order/work-order.entity.js';

import {
  makeInspectionTemplate,
  makeService,
  makeWorkOrder,
} from '@test/factory.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { AssignInspectionTemplateUseCase } from '../assign-inspection-template.use-case.js';
import { EditInspectionTemplateUseCase } from '../../inspection-template/edit-inspection-template.use-case.js';
import { DeleteInspectionTemplateUseCase } from '../../inspection-template/delete-inspection-template.use-case.js';

let workOrders: InMemoryWorkOrdersRepository;
let services: InMemoryWorkOrderServicesRepository;
let templates: InMemoryInspectionTemplatesRepository;
let assignments: InMemoryInspectionAssignmentsRepository;
let sut: AssignInspectionTemplateUseCase;

const questions = (labels: { label: string; position: number }[]) =>
  labels.map(({ label, position }) => ({ label, position }));

describe('AssignInspectionTemplateUseCase', () => {
  beforeEach(() => {
    workOrders = new InMemoryWorkOrdersRepository();
    services = new InMemoryWorkOrderServicesRepository();
    templates = new InMemoryInspectionTemplatesRepository();
    assignments = new InMemoryInspectionAssignmentsRepository();
    sut = new AssignInspectionTemplateUseCase(
      workOrders,
      services,
      templates,
      assignments,
    );

    workOrders.items.push(
      makeWorkOrder({}, 'wo-1'),
      makeWorkOrder({}, 'wo-2'),
      makeWorkOrder({ organizationId: 'org-2' }, 'wo-foreign'),
    );
    services.items.push(
      makeService({ workOrderId: 'wo-1', name: 'Pintura' }, 'svc-1'),
      makeService({ workOrderId: 'wo-2', name: 'Solda' }, 'svc-2'),
      makeService(
        { organizationId: 'org-2', workOrderId: 'wo-foreign' },
        'svc-foreign',
      ),
    );
    templates.items.push(
      makeInspectionTemplate(
        { name: 'Pintura do casco', labels: ['Casco limpo', 'Sem bolhas'] },
        'tpl-1',
      ),
      makeInspectionTemplate(
        { organizationId: 'org-2', name: 'Alheio' },
        'tpl-foreign',
      ),
    );
  });

  it("assignment C1 copies the template's name and questions and records who assigned it", async () => {
    const before = Date.now();

    const { inspectionAssignment } = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      templateId: 'tpl-1',
      assignedBy: 'user-9',
    });

    expect(assignments.items).toEqual([inspectionAssignment]);
    expect(inspectionAssignment).toMatchObject({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      service: null,
      templateName: 'Pintura do casco',
      assignedBy: 'user-9',
    });
    expect(inspectionAssignment.createdAt.getTime()).toBeGreaterThanOrEqual(
      before,
    );
    expect(questions(inspectionAssignment.items)).toEqual([
      { label: 'Casco limpo', position: 0 },
      { label: 'Sem bolhas', position: 1 },
    ]);
    const templateItemIds = templates.items[0].items.map((item) => item.id);
    for (const item of inspectionAssignment.items) {
      expect(templateItemIds).not.toContain(item.id);
    }
  });

  it('assignment C2 targets a service of the WorkOrder', async () => {
    const { inspectionAssignment } = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      templateId: 'tpl-1',
      serviceId: 'svc-1',
      assignedBy: 'user-9',
    });

    expect(inspectionAssignment.service).toEqual({
      id: 'svc-1',
      name: 'Pintura',
    });
  });

  it('assignment C3 accepts a WorkOrder and a WorkOrderService in every status', async () => {
    const serviceStatuses = [
      'PENDING',
      'IN_PROGRESS',
      'COMPLETED',
      'COMPLETED',
    ] as const;

    for (const [index, status] of WORK_ORDER_STATUSES.entries()) {
      workOrders.items.push(makeWorkOrder({ status }, `wo-${status}`));
      services.items.push(
        makeService(
          { workOrderId: `wo-${status}`, status: serviceStatuses[index] },
          `svc-${status}`,
        ),
      );

      await sut.handle({
        organizationId: 'org-1',
        workOrderId: `wo-${status}`,
        templateId: 'tpl-1',
        serviceId: `svc-${status}`,
        assignedBy: 'user-9',
      });
    }

    expect(WORK_ORDER_STATUSES).toEqual([
      'PENDING',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ]);
    expect(assignments.items).toHaveLength(4);
    expect(
      new Set(services.items.slice(3).map((service) => service.status)),
    ).toEqual(new Set(['PENDING', 'IN_PROGRESS', 'COMPLETED']));
  });

  it('assignment C4 stores two assignments of the same template and target', async () => {
    const request = {
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      templateId: 'tpl-1',
      serviceId: 'svc-1',
      assignedBy: 'user-9',
    };

    const first = await sut.handle(request);
    const second = await sut.handle(request);

    expect(assignments.items).toHaveLength(2);
    expect(first.inspectionAssignment.id).not.toBe(
      second.inspectionAssignment.id,
    );
  });

  it('assignment C5 keeps its copy after the template is edited or deleted', async () => {
    const { inspectionAssignment } = await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      templateId: 'tpl-1',
      assignedBy: 'user-9',
    });

    await new EditInspectionTemplateUseCase(templates).handle({
      organizationId: 'org-1',
      id: 'tpl-1',
      name: 'Outro nome',
      labels: ['C'],
    });
    const stored = () => assignments.items[0];
    expect(stored().templateName).toBe('Pintura do casco');
    expect(questions(stored().items)).toEqual([
      { label: 'Casco limpo', position: 0 },
      { label: 'Sem bolhas', position: 1 },
    ]);

    await new DeleteInspectionTemplateUseCase(templates).handle({
      organizationId: 'org-1',
      id: 'tpl-1',
    });
    expect(stored()).toBe(inspectionAssignment);
    expect(questions(stored().items)).toHaveLength(2);
  });

  it('assignment C6 throws NotFoundDomainException for a foreign WorkOrder, template or service and stores nothing', async () => {
    const cases = [
      { workOrderId: 'wo-foreign', templateId: 'tpl-1' },
      { workOrderId: 'unknown', templateId: 'tpl-1' },
      { workOrderId: 'wo-1', templateId: 'tpl-foreign' },
      { workOrderId: 'wo-1', templateId: 'unknown' },
      { workOrderId: 'wo-1', templateId: 'tpl-1', serviceId: 'svc-foreign' },
      { workOrderId: 'wo-1', templateId: 'tpl-1', serviceId: 'svc-2' },
      { workOrderId: 'wo-1', templateId: 'tpl-1', serviceId: 'unknown' },
    ];

    for (const request of cases) {
      await expect(
        sut.handle({
          organizationId: 'org-1',
          assignedBy: 'user-9',
          ...request,
        }),
        JSON.stringify(request),
      ).rejects.toBeInstanceOf(NotFoundDomainException);
    }

    expect(assignments.items).toEqual([]);
  });

  it("assignment C30 a stored assignment reads back with the template's questions in order", async () => {
    templates.items.push(
      makeInspectionTemplate(
        { name: 'Longo', labels: ['Q1', 'Q2', 'Q3', 'Q1'] },
        'tpl-long',
      ),
    );

    await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo-1',
      templateId: 'tpl-long',
      assignedBy: 'user-9',
    });

    const [read] = await assignments.findManyByWorkOrderId('org-1', 'wo-1');
    expect(read.items.map((item) => item.label)).toEqual([
      'Q1',
      'Q2',
      'Q3',
      'Q1',
    ]);
  });
});
