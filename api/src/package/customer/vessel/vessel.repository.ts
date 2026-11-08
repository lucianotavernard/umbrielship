import { Injectable } from '@nestjs/common';

import {
  Vessel as PrismaVessel,
  Customer as PrismaCustomer,
  CustomerAddress as PrismaCustomerAddress,
} from '@/package/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';
import { Paginate } from '@/package/shared/lib/type/paginate';

import { Vessel } from './vessel.entity';
import { VesselDetail } from './vessel-detail.entity';
import { IVesselsRepository } from './contracts/vessel-repository.contract';

@Injectable()
export class PrismaVesselsRepository implements IVesselsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<VesselDetail | null> {
    const vessel = await this.prisma.vessel.findUnique({
      include: {
        customer: {
          include: {
            address: true,
          },
        },
      },
      where: { id },
    });

    if (!vessel) {
      return null;
    }

    return this.toDetailDomain(vessel);
  }

  async findByImoNumber(imoNumber: string): Promise<Vessel | null> {
    const vessel = await this.prisma.vessel.findUnique({
      where: { imoNumber },
    });

    if (!vessel) {
      return null;
    }

    return this.toDomain(vessel);
  }

  async findMany(take: number, skip: number): Promise<Paginate<Vessel>> {
    const total = await this.prisma.vessel.count();
    const data = await this.prisma.vessel.findMany({ take, skip });

    return {
      data: data.map((row) => this.toDomain(row)),
      total,
    };
  }

  async findManyByCustomerId(
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>> {
    const where = { customerId };

    const total = await this.prisma.vessel.count({ where });
    const data = await this.prisma.vessel.findMany({
      where,
      take,
      skip,
    });

    return {
      data: data.map((row) => this.toDomain(row)),
      total,
    };
  }

  async create(vessel: Vessel): Promise<void> {
    await this.prisma.vessel.create({
      data: {
        id: vessel.id,
        imoNumber: vessel.imoNumber,
        name: vessel.name,
        type: vessel.type,
        length: vessel.length,
        customerId: vessel.customerId,
      },
    });
  }

  async save(vessel: Vessel): Promise<void> {
    await this.prisma.vessel.update({
      where: { id: vessel.id },
      data: {
        name: vessel.name,
        type: vessel.type,
        length: vessel.length,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vessel.delete({
      where: { id },
    });
  }

  private toDomain(prismaVessel: PrismaVessel): Vessel {
    return Vessel.create(
      {
        imoNumber: prismaVessel.imoNumber,
        name: prismaVessel.name,
        type: prismaVessel.type,
        length: prismaVessel.length,
        customerId: prismaVessel.customerId,
      },
      prismaVessel.id,
    );
  }

  private toDetailDomain(
    prismaVessel: PrismaVessel & {
      customer: PrismaCustomer & { address: PrismaCustomerAddress | null };
    },
  ): VesselDetail {
    return VesselDetail.create({
      imoNumber: prismaVessel.imoNumber,
      name: prismaVessel.name,
      type: prismaVessel.type,
      length: prismaVessel.length,
      customerId: prismaVessel.customerId,
      customer: {
        id: prismaVessel.customer.id,
        name: prismaVessel.customer.name,
        email: prismaVessel.customer.email,
        phone: prismaVessel.customer.phone,
        address: {
          address: prismaVessel.customer.address!.address,
          city: prismaVessel.customer.address!.city,
          state: prismaVessel.customer.address!.state,
        },
      },
    });
  }
}
