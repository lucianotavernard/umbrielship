import {
  ConflictException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { CustomerController } from '@/package/customer/customer/customer.controller.js';
import { VesselController } from '@/package/customer/vessel/vessel.controller.js';
import { AuthenticationController } from '@/package/identity/auth/authentication.controller.js';
import { WrongCredentialsException } from '@/package/identity/auth/wrong-credentials.exception.js';
import { InvitationController } from '@/package/identity/invitation/invitation.controller.js';
import { OrganizationController } from '@/package/identity/organization/organization.controller.js';
import { UserController } from '@/package/identity/user/user.controller.js';
import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { WorkOrderServiceImageController } from '@/package/work-order/work-order-service-image/work-order-service-image.controller.js';
import { WorkOrderServiceController } from '@/package/work-order/work-order-service/work-order-service.controller.js';
import { WorkOrderController } from '@/package/work-order/work-order/work-order.controller.js';

// An argument that survives destructuring, arithmetic and property reads.
const anything: unknown = new Proxy(function () {} as object, {
  get: (_, key) => (key === Symbol.toPrimitive ? () => 1 : anything),
  apply: () => anything,
});

const user = {
  sub: 'u',
  organizationId: 'o',
  role: 'administrator',
  internal: true,
};

const throwing = (error: Error) => ({
  handle: async () => {
    throw error;
  },
});

type Controller = new (...args: never[]) => object;

const build = (controller: Controller, error: Error) =>
  new (controller as new (...args: unknown[]) => Record<string, unknown>)(
    ...Array.from({ length: controller.length }, () => throwing(error)),
  );

const controllers: Controller[] = [
  CustomerController,
  VesselController,
  WorkOrderController,
  WorkOrderServiceController,
  WorkOrderServiceImageController,
  AuthenticationController,
  OrganizationController,
  UserController,
  InvitationController,
] as unknown as Controller[];

const handlersOf = (controller: Controller) =>
  Object.getOwnPropertyNames(controller.prototype).filter(
    (name) => name !== 'constructor',
  );

const run = async (instance: Record<string, unknown>, name: string) => {
  try {
    await (instance[name] as (...args: unknown[]) => Promise<unknown>)(
      user,
      anything,
      anything,
      anything,
      anything,
    );
  } catch (error) {
    return error;
  }
  return undefined;
};

describe('controller error mapping', () => {
  it('[C33] maps NotFoundDomainException to 404 where the controller maps it, and never to anything else', async () => {
    for (const controller of controllers) {
      for (const name of handlersOf(controller)) {
        const raised = new NotFoundDomainException('x');
        const error = await run(build(controller, raised), name);

        expect(
          error === raised || error instanceof NotFoundException,
          `${controller.name}.${name}`,
        ).toBe(true);
      }
    }
  });

  it('[C33] maps AlreadyExists and Conflict to 409 where the controller maps them, and never to anything else', async () => {
    for (const controller of controllers) {
      for (const name of handlersOf(controller)) {
        for (const raised of [
          new AlreadyExistsDomainException('x'),
          new ConflictDomainException('x'),
        ]) {
          const error = await run(build(controller, raised), name);

          expect(
            error === raised || error instanceof ConflictException,
            `${controller.name}.${name}`,
          ).toBe(true);
        }
      }
    }
  });

  it('[C33] rethrows any other error unchanged, so Nest answers 500', async () => {
    for (const controller of controllers) {
      for (const name of handlersOf(controller)) {
        const raised = new Error('database down');
        const error = await run(build(controller, raised), name);

        expect(error, `${controller.name}.${name}`).toBe(raised);
        expect(error).not.toBeInstanceOf(HttpException);
      }
    }
  });

  it('[C33] answers 404, 409 and 401 on the routes that name them', async () => {
    const customers = build(
      CustomerController,
      new NotFoundDomainException('Customer not found'),
    );
    expect(await run(customers, 'getById')).toBeInstanceOf(NotFoundException);

    const created = build(
      CustomerController,
      new AlreadyExistsDomainException('Customer already exists'),
    );
    expect(await run(created, 'create')).toBeInstanceOf(ConflictException);

    const vessels = build(
      VesselController,
      new AlreadyExistsDomainException('Vessel already exists'),
    );
    expect(await run(vessels, 'create')).toBeInstanceOf(ConflictException);

    const organizations = build(
      OrganizationController,
      new AlreadyExistsDomainException('x'),
    );
    expect(await run(organizations, 'create')).toBeInstanceOf(
      ConflictException,
    );

    const invitations = build(
      InvitationController,
      new ConflictDomainException('Invitation already accepted'),
    );
    expect(await run(invitations, 'accept')).toBeInstanceOf(ConflictException);

    const session = build(
      AuthenticationController,
      new WrongCredentialsException(),
    );
    expect(await run(session, 'create')).toBeInstanceOf(UnauthorizedException);
  });
});
