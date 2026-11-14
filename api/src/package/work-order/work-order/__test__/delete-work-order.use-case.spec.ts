import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';

import {
  makeCustomer,
  makeInspectionAssignment,
  makeVessel,
  makeWorkOrder,
} from '@test/factory.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { DeleteWorkOrderUseCase } from '../delete-work-order.use-case.js';

const inspectionOf = (assignmentId: string, discarded = false) => {
  const inspection = Inspection.create({
    organizationId: 'org-1',
    assignmentId,
    result: 'APPROVED',
    inspectorId: 'user-9',
    inspectorName: 'Inês',
    answers: [],
  });
  if (discarded) inspection.discard('user-9');
  return inspection;
};

let workOrders: InMemoryWorkOrdersRepository;
let sut: DeleteWorkOrderUseCase;

describe('DeleteWorkOrderUseCase', () => {
  beforeEach(() => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    workOrders = new InMemoryWorkOrdersRepository();
    sut = new DeleteWorkOrderUseCase(
      workOrders,
      new InMemoryInspectionsRepository(),
    );
    customers.items.push(makeCustomer({}, 'customer-1'));
    vessels.items.push(makeVessel({ customerId: 'customer-1' }, 'vessel-1'));
  });

  it('[C19] throws NotFoundDomainException for an unknown id', async () => {
    const promise = sut.handle({ organizationId: 'org-1', id: 'missing' });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order not found');
  });

  it('[C19] removes exactly that work order', async () => {
    workOrders.items.push(makeWorkOrder({}, 'wo1'), makeWorkOrder({}, 'wo2'));

    await sut.handle({ organizationId: 'org-1', id: 'wo1' });

    expect(workOrders.items.map((item) => item.id)).toEqual(['wo2']);
  });

  it('inspection C34 refuses a WorkOrder with an Inspection under it', async () => {
    const assignments = new InMemoryInspectionAssignmentsRepository();
    const inspections = new InMemoryInspectionsRepository(assignments);
    sut = new DeleteWorkOrderUseCase(workOrders, inspections);
    workOrders.items.push(
      makeWorkOrder({}, 'wo-own'),
      makeWorkOrder({}, 'wo-service'),
      makeWorkOrder({}, 'wo-discarded'),
    );
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-own' }, 'a-own'),
      makeInspectionAssignment(
        { workOrderId: 'wo-service', service: { id: 's1', name: 'Pintura' } },
        'a-service',
      ),
      makeInspectionAssignment({ workOrderId: 'wo-discarded' }, 'a-discarded'),
    );
    inspections.items.push(
      inspectionOf('a-own'),
      inspectionOf('a-service'),
      inspectionOf('a-discarded', true),
    );

    for (const id of ['wo-own', 'wo-service', 'wo-discarded']) {
      await expect(
        sut.handle({ organizationId: 'org-1', id }),
        id,
      ).rejects.toBeInstanceOf(ConflictDomainException);
    }
    expect(workOrders.items).toHaveLength(3);
  });

  it('inspection C36 deletes a WorkOrder whose assignments have no Inspection', async () => {
    const assignments = new InMemoryInspectionAssignmentsRepository();
    const inspections = new InMemoryInspectionsRepository(assignments);
    sut = new DeleteWorkOrderUseCase(workOrders, inspections);
    workOrders.items.push(makeWorkOrder({}, 'wo-assigned'));
    assignments.items.push(
      makeInspectionAssignment({ workOrderId: 'wo-assigned' }, 'a-fresh'),
      makeInspectionAssignment({ workOrderId: 'wo-other' }, 'a-other'),
    );
    inspections.items.push(inspectionOf('a-other'));

    await sut.handle({ organizationId: 'org-1', id: 'wo-assigned' });

    expect(workOrders.items).toEqual([]);
  });
});
