import { beforeEach, describe, expect, it } from 'vitest';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';

import { Inspection } from '@/package/work-order/inspection/inspection.entity.js';

import { makeInspectionAssignment, makeService } from '@test/factory.js';
import { InMemoryInspectionAssignmentsRepository } from '@test/repositories/in-memory-inspection-assignments-repository.js';
import { InMemoryWorkOrderServicesRepository } from '@test/repositories/in-memory-work-order-services-repository.js';
import { InMemoryInspectionsRepository } from '@test/repositories/in-memory-inspections-repository.js';
import { DeleteWorkOrderServiceUseCase } from '../delete-work-order-service.use-case.js';
import {
  inMemoryWorkforce,
  makeAssignment,
  makeTeam,
} from '@test/workforce.js';

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

let services: InMemoryWorkOrderServicesRepository;
let sut: DeleteWorkOrderServiceUseCase;

describe('DeleteWorkOrderServiceUseCase', () => {
  beforeEach(() => {
    services = new InMemoryWorkOrderServicesRepository();
    sut = new DeleteWorkOrderServiceUseCase(
      services,
      new InMemoryInspectionsRepository(),
      inMemoryWorkforce().facade,
    );
    services.items.push(
      makeService({ workOrderId: 'wo1' }, 's1'),
      makeService({ workOrderId: 'wo1' }, 's2'),
    );
  });

  it('[C20] throws NotFoundDomainException for an unknown service', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo1',
      serviceId: 'missing',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
  });

  it('[C20] throws NotFoundDomainException for a service of another work order and removes nothing', async () => {
    const promise = sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo2',
      serviceId: 's1',
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundDomainException);
    await expect(promise).rejects.toThrow('Work order service not found');
    expect(services.items).toHaveLength(2);
  });

  it('[C20] removes exactly that service', async () => {
    await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo1',
      serviceId: 's1',
    });

    expect(services.items.map((item) => item.id)).toEqual(['s2']);
  });

  it('inspection C35 refuses a service targeted by an inspected assignment', async () => {
    const assignments = new InMemoryInspectionAssignmentsRepository();
    const inspections = new InMemoryInspectionsRepository(assignments);
    sut = new DeleteWorkOrderServiceUseCase(
      services,
      inspections,
      inMemoryWorkforce().facade,
    );
    assignments.items.push(
      makeInspectionAssignment(
        { workOrderId: 'wo1', service: { id: 's1', name: 'Pintura' } },
        'a-s1',
      ),
      makeInspectionAssignment(
        { workOrderId: 'wo1', service: { id: 's2', name: 'Solda' } },
        'a-s2',
      ),
    );
    inspections.items.push(inspectionOf('a-s1'), inspectionOf('a-s2', true));

    for (const serviceId of ['s1', 's2']) {
      await expect(
        sut.handle({ organizationId: 'org-1', workOrderId: 'wo1', serviceId }),
        serviceId,
      ).rejects.toBeInstanceOf(ConflictDomainException);
    }
    expect(services.items.map((item) => item.id)).toEqual(['s1', 's2']);
  });

  it('inspection C36 deletes a service whose assignments have no Inspection', async () => {
    const assignments = new InMemoryInspectionAssignmentsRepository();
    const inspections = new InMemoryInspectionsRepository(assignments);
    sut = new DeleteWorkOrderServiceUseCase(
      services,
      inspections,
      inMemoryWorkforce().facade,
    );
    assignments.items.push(
      makeInspectionAssignment(
        { workOrderId: 'wo1', service: { id: 's1', name: 'Pintura' } },
        'a-s1',
      ),
      makeInspectionAssignment({ workOrderId: 'wo1' }, 'a-whole'),
    );
    inspections.items.push(inspectionOf('a-whole'));

    await sut.handle({
      organizationId: 'org-1',
      workOrderId: 'wo1',
      serviceId: 's1',
    });

    expect(services.items.map((item) => item.id)).toEqual(['s2']);
  });
});

describe('DeleteWorkOrderServiceUseCase', () => {
  it('workforce C24 removes the assignment of the service', async () => {
    const services = new InMemoryWorkOrderServicesRepository();
    const workforce = inMemoryWorkforce();
    services.items.push(
      makeService({ organizationId: 'A', workOrderId: 'wo1' }, 's1'),
      makeService({ organizationId: 'A', workOrderId: 'wo1' }, 's2'),
    );
    workforce.teams.items.push(makeTeam({ organizationId: 'A' }, 'alfa'));
    workforce.assignments.items.push(
      makeAssignment({
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: 's1',
        staffId: null,
        teamId: 'alfa',
      }),
      makeAssignment({
        organizationId: 'A',
        workOrderId: 'wo1',
        workOrderServiceId: 's2',
        staffId: null,
        teamId: 'alfa',
      }),
    );
    const sut = new DeleteWorkOrderServiceUseCase(
      services,
      new InMemoryInspectionsRepository(),
      workforce.facade,
    );

    await sut.handle({
      organizationId: 'A',
      workOrderId: 'wo1',
      serviceId: 's1',
    });

    expect(services.items.map((item) => item.id)).toEqual(['s2']);
    expect(
      workforce.assignments.items.map((item) => item.workOrderServiceId),
    ).toEqual(['s2']);
  });
});

describe('DeleteWorkOrderServiceUseCase', () => {
  it('workforce C24 keeps the assignment when an inspection refuses the service delete', async () => {
    const services = new InMemoryWorkOrderServicesRepository();
    const workforce = inMemoryWorkforce();
    const inspectionAssignments = new InMemoryInspectionAssignmentsRepository();
    const inspections = new InMemoryInspectionsRepository(
      inspectionAssignments,
    );
    services.items.push(
      makeService({ organizationId: 'org-1', workOrderId: 'wo1' }, 's1'),
    );
    inspectionAssignments.items.push(
      makeInspectionAssignment(
        { workOrderId: 'wo1', service: { id: 's1', name: 'Pintura' } },
        'ia-s1',
      ),
    );
    inspections.items.push(inspectionOf('ia-s1'));
    workforce.assignments.items.push(
      makeAssignment({
        organizationId: 'org-1',
        workOrderId: 'wo1',
        workOrderServiceId: 's1',
        staffId: 'rafael',
      }),
    );
    const sut = new DeleteWorkOrderServiceUseCase(
      services,
      inspections,
      workforce.facade,
    );

    await expect(
      sut.handle({
        organizationId: 'org-1',
        workOrderId: 'wo1',
        serviceId: 's1',
      }),
    ).rejects.toBeInstanceOf(ConflictDomainException);
    expect(services.items).toHaveLength(1);
    expect(workforce.assignments.items).toHaveLength(1);
  });
});
