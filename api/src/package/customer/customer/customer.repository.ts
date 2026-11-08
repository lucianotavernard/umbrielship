import { Injectable } from '@nestjs/common';

import {
  Customer as PrismaCustomer,
  CustomerAddress as PrismaCustomerAddress,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';
import { Paginate } from '@/package/shared/lib/type/paginate.js';

import { ICustomersRepository } from './contracts/customer-repository.contract.js';
import { Customer } from './customer.entity.js';

@Injectable()
export class PrismaCustomersRepository implements ICustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(organizationId: string, id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findFirst({
      include: {
        address: true,
      },
      where: {
        id,
        organizationId,
      },
    });

    if (!customer) {
      return null;
    }

    return this.toDomain(customer);
  }

  async findByEmail(
    organizationId: string,
    email: string,
  ): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      include: {
        address: true,
      },
      where: {
        organizationId_email: { organizationId, email },
      },
    });

    if (!customer) {
      return null;
    }

    return this.toDomain(customer);
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Customer>> {
    const total = await this.prisma.customer.count({
      where: { organizationId },
    });
    const data = await this.prisma.customer.findMany({
      include: {
        address: true,
      },
      where: { organizationId },
      take,
      skip,
    });

    const customers = data.map((customer) => this.toDomain(customer));

    return {
      data: customers,
      total,
    };
  }

  async create(customer: Customer): Promise<void> {
    await this.prisma.customer.create({
      data: {
        id: customer.id,
        organizationId: customer.organizationId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
          ? {
              create: {
                organizationId: customer.organizationId,
                address: customer.address.address,
                city: customer.address.city,
                state: customer.address.state,
              },
            }
          : undefined,
      },
    });
  }

  async save(customer: Customer): Promise<void> {
    const address = await this.prisma.customerAddress.findUnique({
      where: {
        customerId: customer.id,
      },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    await this.prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          update: {
            address: customer.address.address,
            city: customer.address.city,
            state: customer.address.state,
          },
        },
      },
    });
  }

  private toDomain(
    customer: PrismaCustomer & { address: PrismaCustomerAddress | null },
  ): Customer {
    return Customer.create(
      {
        organizationId: customer.organizationId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          address: customer.address!.address,
          city: customer.address!.city,
          state: customer.address!.state,
        },
      },
      customer.id,
    );
  }
}
