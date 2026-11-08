import { Injectable } from '@nestjs/common';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception';
import { Prisma } from '@/package/shared/module/prisma/generated/prisma/client';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';
import { Invitation, InvitationDeliveryStatus } from './invitation.entity';

import {
  IInvitationsRepository,
  InvitationDeliveryRecord,
} from './contracts/invitation-repository.contract';

@Injectable()
export class PrismaInvitationsRepository implements IInvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByOrganization(
    organizationId: string,
    page: number,
    perPage: number,
  ): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.prisma.invitation.count({
      where: {
        organizationId,
      },
    });
  }

  async findById(id: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: {
        id,
      },
    });
  }

  async findManyByDeliveryStatus(
    deliveryStatus: InvitationDeliveryStatus,
  ): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: {
        deliveryStatus,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findBySecret(secret: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: {
        secret,
      },
    });
  }

  async findPending(
    userId: string,
    organizationId: string,
  ): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: {
        userId,
        organizationId,
        status: 'pending',
      },
    });
  }

  async save(invitation: Invitation): Promise<void> {
    await this.prisma.invitation.create({
      data: {
        id: invitation.id,
        userId: invitation.userId,
        organizationId: invitation.organizationId,
        secret: invitation.secret,
        status: invitation.status,
        role: invitation.role,
        createdAt: invitation.createdAt,
        deliveryStatus: invitation.deliveryStatus,
        deliveryAttempts: invitation.deliveryAttempts,
        lastDeliveryFailureAt: invitation.lastDeliveryFailureAt,
      },
    });
  }

  async recordDelivery(
    id: string,
    record: InvitationDeliveryRecord,
  ): Promise<void> {
    await this.prisma.invitation.update({
      where: {
        id,
      },
      data: record,
    });
  }

  async requeueDelivery(id: string): Promise<boolean> {
    // One conditional write, so two resends at once cannot both see the delivery outside the queue.
    const { count } = await this.prisma.invitation.updateMany({
      where: {
        id,
        status: 'pending',
        deliveryStatus: { in: ['delivered', 'failed'] },
      },
      data: {
        deliveryStatus: 'queued',
        deliveryAttempts: 0,
        lastDeliveryFailureAt: null,
      },
    });

    return count === 1;
  }

  async accept(invitation: Invitation): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Only a pending Invitation turns accepted, so a second accept of the same secret writes nothing.
        const { count } = await tx.invitation.updateMany({
          where: {
            id: invitation.id,
            status: 'pending',
          },
          data: {
            status: 'accepted',
          },
        });
        if (count === 0)
          throw new ConflictDomainException('Invitation already accepted');

        await tx.membership.create({
          data: {
            userId: invitation.userId,
            organizationId: invitation.organizationId,
            role: invitation.role,
          },
        });
      });
    } catch (error) {
      // The unique (userId, organizationId) settles two accepts racing for the same Membership.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictDomainException(
          'User already belongs to this organization',
        );

      throw error;
    }
  }
}
