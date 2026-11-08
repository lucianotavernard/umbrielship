import { CustomerEntity } from '@/customer/core/entity/customer.entity';
import { VesselEntity } from '@/customer/core/entity/vessel.entity';
import { User } from '@/shared/module/prisma/generated/prisma/client';
import { WorkOrderServiceImageEntity } from '@/work-order/core/entity/work-order-service-image.entity';
import { WorkOrderServiceEntity } from '@/work-order/core/entity/work-order-service.entity';
import { WorkOrderEntity } from '@/work-order/core/entity/work-order.entity';

export const makeCustomer = (
  override: Partial<ConstructorParameters<typeof CustomerEntity>[0]> = {},
  id?: string,
) =>
  new CustomerEntity(
    {
      name: 'Atlantic Shipping',
      email: 'ops@atlantic.test',
      phone: '+55 13 99999-0000',
      address: { address: 'Rua do Porto 1', city: 'Santos', state: 'SP' },
      ...override,
    },
    id,
  );

export const makeVessel = (
  override: Partial<ConstructorParameters<typeof VesselEntity>[0]> = {},
  id?: string,
) =>
  new VesselEntity(
    {
      name: 'Aurora',
      type: 'CARGO',
      length: 120,
      imoNumber: '9074729',
      customerId: 'customer-1',
      ...override,
    },
    id,
  );

export const makeWorkOrder = (
  override: Partial<ConstructorParameters<typeof WorkOrderEntity>[0]> = {},
  id?: string,
) =>
  new WorkOrderEntity(
    {
      vesselId: 'vessel-1',
      startDate: new Date('2026-01-10T00:00:00.000Z'),
      endDate: new Date('2026-01-20T00:00:00.000Z'),
      status: 'PENDING',
      ...override,
    },
    id,
  );

export const makeService = (
  override: Partial<
    ConstructorParameters<typeof WorkOrderServiceEntity>[0]
  > = {},
  id?: string,
) =>
  new WorkOrderServiceEntity(
    {
      workOrderId: 'work-order-1',
      name: 'Hull cleaning',
      description: 'Pressure wash of the hull',
      startDate: new Date('2026-01-11T00:00:00.000Z'),
      endDate: new Date('2026-01-12T00:00:00.000Z'),
      status: 'PENDING',
      ...override,
    },
    id,
  );

export const makeImage = (
  override: Partial<
    ConstructorParameters<typeof WorkOrderServiceImageEntity>[0]
  > = {},
  id?: string,
) =>
  new WorkOrderServiceImageEntity(
    {
      serviceId: 'service-1',
      url: '/uploads/work-order-service-images/photo.png',
      ...override,
    },
    id,
  );

export const makeUser = (override: Partial<User> = {}): User => ({
  id: 'user-1',
  name: 'Maria Souza',
  email: 'maria@umbrielship.test',
  password: 'secret123-hashed',
  role: 'USER',
  ...override,
});
