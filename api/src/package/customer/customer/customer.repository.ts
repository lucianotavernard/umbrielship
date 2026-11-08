import { Injectable } from '@nestjs/common';

import {
  Customer as PrismaCustomer,
  CustomerAddress as PrismaCustomerAddress,
} from '@/package/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';
import { Paginate } from '@/package/shared/lib/type/paginate';

import { ICustomersRepository } from './contracts/customer-repository.contract';
import { Customer } from './customer.entity';

@Injectable()
export class PrismaCustomersRepository implements ICustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      include: {
        address: true,
      },
      where: {
        id,
      },
    });

    if (!customer) {
      return null;
    }

    return this.toDomain(customer);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      include: {
        address: true,
      },
      where: {
        email,
      },
    });

    if (!customer) {
      return null;
    }

    return this.toDomain(customer);
  }

  async findMany(take: number, skip: number): Promise<Paginate<Customer>> {
    const total = await this.prisma.customer.count({ take, skip });
    const data = await this.prisma.customer.findMany({
      include: {
        address: true,
      },
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
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
          ? {
              create: {
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
    let address = await this.prisma.customerAddress.findUnique({
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
