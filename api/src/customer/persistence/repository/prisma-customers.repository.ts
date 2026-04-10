import { Injectable } from '@nestjs/common';

import {
  Customer as PrismaCustomer,
  CustomerAddress as PrismaCustomerAddress,
} from '@/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/shared/module/prisma/service/prisma.service';
import { Paginate } from '@/shared/lib/core/type/paginate';

import { CustomerRepository } from '@/customer/core/interface/customer.repository';
import { CustomerEntity } from '@/customer/core/entity/customer.entity';

@Injectable()
export class PrismaCustomersRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CustomerEntity | null> {
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

  async findByEmail(email: string): Promise<CustomerEntity | null> {
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

  async findMany(
    take: number,
    skip: number,
  ): Promise<Paginate<CustomerEntity>> {
    const total = await this.prisma.customer.count({ take, skip });
    const data = await this.prisma.customer.findMany({
      include: {
        address: true,
      },
      take,
      skip,
    });

    const customers = data.map(customer => this.toDomain(customer));

    return {
      data: customers,
      total,
    };
  }

  async create(customer: CustomerEntity): Promise<void> {
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

  async save(customer: CustomerEntity): Promise<void> {
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
  ): CustomerEntity {
    return new CustomerEntity(
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
