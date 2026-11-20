import { beforeEach, describe, expect, it } from 'vitest';

import { makeInspectionTemplate, makeWorkOrder } from '@test/factory.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';

import { WorkOrderFacade } from '../work-order.facade.js';

describe('WorkOrderFacade', () => {
  let workOrders: InMemoryWorkOrdersRepository;
  let templates: InMemoryInspectionTemplatesRepository;
  let facade: WorkOrderFacade;

  beforeEach(() => {
    workOrders = new InMemoryWorkOrdersRepository();
    templates = new InMemoryInspectionTemplatesRepository();
    facade = new WorkOrderFacade(workOrders, templates);
  });

  it('organization-list C9 has no records for an Organization with no WorkOrder and no template', async () => {
    workOrders.items.push(makeWorkOrder({ organizationId: 'B' }));
    templates.items.push(makeInspectionTemplate({ organizationId: 'B' }));

    expect(await facade.hasRecords('A')).toBe(false);
  });

  it('organization-list C9 has records for a WorkOrder or an inspection template of the Organization', async () => {
    workOrders.items.push(makeWorkOrder({ organizationId: 'A' }));
    expect(await facade.hasRecords('A')).toBe(true);

    workOrders.items = [];
    templates.items.push(makeInspectionTemplate({ organizationId: 'A' }));
    expect(await facade.hasRecords('A')).toBe(true);
  });
});
