import { describe, expect, it } from 'vitest';

import { makeCustomer, makeVessel } from '@test/factory';
import { InMemoryCustomersRepository } from '@test/repositories/in-memory-customers-repository';
import { InMemoryVesselsRepository } from '@test/repositories/in-memory-vessels-repository';
import { CustomerFacade } from '../customer.facade';

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

    return new CustomerFacade(vessels);
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
});
