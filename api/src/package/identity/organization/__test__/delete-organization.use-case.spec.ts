import { beforeEach, describe, expect, it } from 'vitest';

import { CustomerFacade } from '@/package/customer/customer.facade.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WorkOrderFacade } from '@/package/work-order/work-order.facade.js';
import {
  makeCustomer,
  makeInspectionTemplate,
  makeOrganization,
  makeUser,
  makeWorkOrder,
} from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryInspectionTemplatesRepository } from '@test/repositories/in-memory-inspection-templates-repository.js';
import { InMemoryOrganizationsRepository } from '@test/repositories/in-memory-organizations-repository.js';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { InMemoryWorkOrdersRepository } from '@test/repositories/in-memory-work-orders-repository.js';
import { inMemoryWorkforce, makeStaff, makeTeam } from '@test/workforce.js';

import { DeleteOrganizationUseCase } from '../delete-organization.use-case.js';

describe('DeleteOrganizationUseCase', () => {
  let organizations: InMemoryOrganizationsRepository;
  let users: InMemoryUsersRepository;
  let customers: InMemoryCustomersRepository;
  let workOrders: InMemoryWorkOrdersRepository;
  let templates: InMemoryInspectionTemplatesRepository;
  let workforce: ReturnType<typeof inMemoryWorkforce>;
  let sut: DeleteOrganizationUseCase;

  beforeEach(() => {
    organizations = new InMemoryOrganizationsRepository();
    users = new InMemoryUsersRepository();
    customers = new InMemoryCustomersRepository();
    workOrders = new InMemoryWorkOrdersRepository();
    templates = new InMemoryInspectionTemplatesRepository();
    workforce = inMemoryWorkforce();
    sut = new DeleteOrganizationUseCase(
      organizations,
      users,
      new CustomerFacade(new InMemoryVesselsRepository(customers), customers),
      new WorkOrderFacade(workOrders, templates),
      workforce.facade,
    );

    organizations.items.push(
      makeOrganization({ name: 'Umbrielship', email: 'internal@umbrielship.test', isInternal: true }, 'internal'),
      makeOrganization({ name: 'Estaleiro Vale', email: 'contato@vale.test' }, 'vale'),
      makeOrganization({ name: 'Porto Seguro Naval', email: 'contato@porto.test' }, 'porto'),
    );
  });

  it('organization-list C9 deletes an Organization with no records, records of another one left aside', async () => {
    customers.items.push(makeCustomer({ organizationId: 'porto' }));
    workOrders.items.push(makeWorkOrder({ organizationId: 'porto' }));
    templates.items.push(makeInspectionTemplate({ organizationId: 'porto' }));
    workforce.staff.items.push(makeStaff({ organizationId: 'porto' }));

    await sut.handle({ id: 'vale' });

    expect(organizations.items.map((organization) => organization.id)).toEqual(['internal', 'porto']);
  });

  it('organization-list C10 moves a member it was active for to the next Organization, or to none', async () => {
    const both = makeUser({
      id: 'both',
      email: 'both@x.test',
      activeOrganizationId: 'vale',
      memberships: [
        { organizationId: 'vale', role: 'administrator' },
        { organizationId: 'porto', role: 'operator' },
      ],
    });
    const only = makeUser({
      id: 'only',
      email: 'only@x.test',
      activeOrganizationId: 'vale',
      memberships: [{ organizationId: 'vale', role: 'inspector' }],
    });
    const elsewhere = makeUser({
      id: 'elsewhere',
      email: 'elsewhere@x.test',
      activeOrganizationId: 'porto',
      memberships: [
        { organizationId: 'porto', role: 'operator' },
        { organizationId: 'vale', role: 'operator' },
      ],
    });
    users.items.push(both, only, elsewhere);

    await sut.handle({ id: 'vale' });

    expect(both.activeOrganizationId).toBe('porto');
    expect(both.memberships).toEqual([{ organizationId: 'porto', role: 'operator' }]);
    expect(only.activeOrganizationId).toBeNull();
    expect(only.memberships).toEqual([]);
    expect(elsewhere.activeOrganizationId).toBe('porto');
    expect(elsewhere.memberships).toEqual([{ organizationId: 'porto', role: 'operator' }]);
  });

  it('organization-list C9 keeps an Organization with a Customer, a WorkOrder, a template, a Staff or a Team', async () => {
    const records = [
      () => customers.items.push(makeCustomer({ organizationId: 'vale' })),
      () => workOrders.items.push(makeWorkOrder({ organizationId: 'vale' })),
      () => templates.items.push(makeInspectionTemplate({ organizationId: 'vale' })),
      () => workforce.staff.items.push(makeStaff({ organizationId: 'vale' })),
      () => workforce.teams.items.push(makeTeam({ organizationId: 'vale' })),
    ];

    for (const add of records) {
      customers.items = [];
      workOrders.items = [];
      templates.items = [];
      workforce.staff.items = [];
      workforce.teams.items = [];
      add();

      await expect(sut.handle({ id: 'vale' })).rejects.toBeInstanceOf(ConflictDomainException);
      expect(organizations.items.some((organization) => organization.id === 'vale')).toBe(true);
    }
  });

  it('organization-list C9 never deletes the internal Organization', async () => {
    await expect(sut.handle({ id: 'internal' })).rejects.toBeInstanceOf(ConflictDomainException);
    expect(organizations.items).toHaveLength(3);
  });

  it('organization-list C9 throws NotFoundDomainException for an unknown Organization', async () => {
    await expect(sut.handle({ id: 'missing' })).rejects.toBeInstanceOf(NotFoundDomainException);
  });
});
