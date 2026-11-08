import {
  Customer,
  CustomerProps,
} from '@/package/customer/customer/customer.entity.js';
import {
  Vessel,
  VesselProps,
} from '@/package/customer/vessel/vessel.entity.js';
import {
  Organization,
  OrganizationProps,
} from '@/package/identity/organization/organization.entity.js';
import { User, UserProps } from '@/package/identity/user/user.entity.js';
import {
  WorkOrderServiceImage,
  WorkOrderServiceImageProps,
} from '@/package/work-order/work-order-service-image/work-order-service-image.entity.js';
import {
  WorkOrderService,
  WorkOrderServiceProps,
} from '@/package/work-order/work-order-service/work-order-service.entity.js';
import {
  WorkOrder,
  WorkOrderProps,
} from '@/package/work-order/work-order/work-order.entity.js';

export const makeCustomer = (
  override: Partial<CustomerProps> = {},
  id?: string,
) =>
  Customer.create(
    {
      organizationId: 'org-1',
      name: 'Atlantic Shipping',
      email: 'ops@atlantic.test',
      phone: '+55 13 99999-0000',
      address: { address: 'Rua do Porto 1', city: 'Santos', state: 'SP' },
      ...override,
    },
    id,
  );

export const makeVessel = (override: Partial<VesselProps> = {}, id?: string) =>
  Vessel.create(
    {
      organizationId: 'org-1',
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
  override: Partial<WorkOrderProps> = {},
  id?: string,
) =>
  WorkOrder.create(
    {
      organizationId: 'org-1',
      vesselId: 'vessel-1',
      startDate: new Date('2026-01-10T00:00:00.000Z'),
      endDate: new Date('2026-01-20T00:00:00.000Z'),
      status: 'PENDING',
      ...override,
    },
    id,
  );

export const makeService = (
  override: Partial<WorkOrderServiceProps> = {},
  id?: string,
) =>
  WorkOrderService.create(
    {
      organizationId: 'org-1',
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
  override: Partial<WorkOrderServiceImageProps> = {},
  id?: string,
) =>
  WorkOrderServiceImage.create(
    {
      organizationId: 'org-1',
      serviceId: 'service-1',
      url: '/uploads/work-order-service-images/photo.png',
      ...override,
    },
    id,
  );

export const makeUser = (
  override: Partial<UserProps> & { id?: string } = {},
) => {
  const { id = 'user-1', ...props } = override;

  return User.create(
    {
      name: 'Maria Souza',
      email: 'maria@umbrielship.test',
      password: 'secret123-hashed',
      activeOrganizationId: 'org-1',
      memberships: [{ organizationId: 'org-1', role: 'operator' }],
      ...props,
    },
    id,
  );
};

export const makeOrganization = (
  override: Partial<OrganizationProps> = {},
  id = 'org-1',
) =>
  Organization.create(
    {
      name: 'Atlantic Marine',
      email: 'contact@atlantic-marine.test',
      isInternal: false,
      ...override,
    },
    id,
  );
