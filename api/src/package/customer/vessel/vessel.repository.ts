import { Injectable } from '@nestjs/common';

import {
  Vessel as PrismaVessel,
  Customer as PrismaCustomer,
  CustomerAddress as PrismaCustomerAddress,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';
import { Paginate } from '@/package/shared/lib/type/paginate.js';

import { Vessel } from './vessel.entity.js';
import { VesselDetail } from './vessel-detail.entity.js';
import { IVesselsRepository } from './contracts/vessel-repository.contract.js';

@Injectable()
export class PrismaVesselsRepository implements IVesselsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    organizationId: string,
    id: string,
  ): Promise<VesselDetail | null> {
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

    if (!vessel || vessel.organizationId !== organizationId) {
      return null;
    }

    return this.toDetailDomain(vessel);
  }

  async findByImoNumber(
    organizationId: string,
    imoNumber: string,
  ): Promise<Vessel | null> {
    const vessel = await this.prisma.vessel.findUnique({
      where: { organizationId_imoNumber: { organizationId, imoNumber } },
    });

    if (!vessel) {
      return null;
    }

    return this.toDomain(vessel);
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>> {
    const where = { organizationId };
    const total = await this.prisma.vessel.count({ where });
    const data = await this.prisma.vessel.findMany({ where, take, skip });

    return {
      data: data.map((row) => this.toDomain(row)),
      total,
    };
  }

  async findManyByCustomerId(
    organizationId: string,
    customerId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<Vessel>> {
    const where = { organizationId, customerId };

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
        organizationId: vessel.organizationId,
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
        organizationId: prismaVessel.organizationId,
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
      organizationId: prismaVessel.organizationId,
      imoNumber: prismaVessel.imoNumber,
      name: prismaVessel.name,
      type: prismaVessel.type,
      length: prismaVessel.length,
      customerId: prismaVessel.customerId,
      customer: {
        id: prismaVessel.customer.id,
        organizationId: prismaVessel.customer.organizationId,
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
