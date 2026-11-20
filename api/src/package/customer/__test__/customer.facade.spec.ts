import { describe, expect, it } from 'vitest';

import { makeCustomer, makeVessel } from '@test/factory.js';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository.js';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository.js';
import { CustomerFacade } from '../customer.facade.js';

describe('CustomerFacade', () => {
  const setup = () => {
    const customers = new InMemoryCustomersRepository();
    const vessels = new InMemoryVesselsRepository(customers);
    customers.items.push(makeCustomer({ organizationId: 'A' }, 'ca'));
    vessels.items.push(
      makeVessel(
        {
          organizationId: 'A',
          customerId: 'ca',
          name: 'Aurora',
          type: 'CARGO',
          length: 120,
        },
        'va',
      ),
    );

    return new CustomerFacade(vessels, customers);
  };

  it('[C40] returns plain vessel data for a Vessel of the Organization', async () => {
    const vessel = await setup().findVesselById('A', 'va');

    expect(vessel).toEqual({
      id: 'va',
      name: 'Aurora',
      type: 'CARGO',
      length: 120,
      customerId: 'ca',
    });
  });

  it('[C40] returns null for an unknown id and for a Vessel of another Organization', async () => {
    const facade = setup();

    expect(await facade.findVesselById('A', 'missing')).toBeNull();
    expect(await facade.findVesselById('B', 'va')).toBeNull();
  });

  it('organization-list C9 tells whether an Organization has a Customer, never counting another', async () => {
    const facade = setup();

    expect(await facade.hasRecords('A')).toBe(true);
    expect(await facade.hasRecords('B')).toBe(false);
  });
});
