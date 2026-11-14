import { Injectable } from '@nestjs/common';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { Paginate } from '@/package/shared/lib/type/paginate.js';
import {
  InspectionTemplate as PrismaInspectionTemplate,
  InspectionTemplateItem as PrismaInspectionTemplateItem,
  Prisma,
} from '@/package/shared/module/prisma/generated/prisma/client.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

import { IInspectionTemplatesRepository } from './contracts/inspection-template-repository.contract.js';
import { InspectionTemplate } from './inspection-template.entity.js';

const withItems = {
  items: { orderBy: { position: 'asc' } },
} satisfies Prisma.InspectionTemplateInclude;

// Two writes of one name at once meet the unique index; the loser answers 409, not 500.
const nameTaken = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

@Injectable()
export class PrismaInspectionTemplatesRepository implements IInspectionTemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    organizationId: string,
    id: string,
  ): Promise<InspectionTemplate | null> {
    const template = await this.prisma.inspectionTemplate.findFirst({
      include: withItems,
      where: { id, organizationId },
    });

    return template ? this.toDomain(template) : null;
  }

  async findByName(
    organizationId: string,
    name: string,
  ): Promise<InspectionTemplate | null> {
    const template = await this.prisma.inspectionTemplate.findUnique({
      include: withItems,
      where: { organizationId_name: { organizationId, name } },
    });

    return template ? this.toDomain(template) : null;
  }

  async findMany(
    organizationId: string,
    take: number,
    skip: number,
  ): Promise<Paginate<InspectionTemplate>> {
    const [total, data] = await this.prisma.$transaction([
      this.prisma.inspectionTemplate.count({ where: { organizationId } }),
      this.prisma.inspectionTemplate.findMany({
        include: withItems,
        where: { organizationId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ]);

    return { data: data.map((template) => this.toDomain(template)), total };
  }

  async create(template: InspectionTemplate): Promise<void> {
    try {
      await this.prisma.inspectionTemplate.create({
        data: {
          id: template.id,
          organizationId: template.organizationId,
          name: template.name,
          createdAt: template.createdAt,
          items: { create: this.itemsOf(template) },
        },
      });
    } catch (error) {
      if (nameTaken(error)) {
        throw new AlreadyExistsDomainException(
          'Inspection template already exists',
        );
      }

      throw error;
    }
  }

  async save(template: InspectionTemplate): Promise<void> {
    const where = {
      organizationId: template.organizationId,
      templateId: template.id,
    };

    try {
      // The update takes the template's row lock first, so a concurrent edit waits and its
      // deleteMany then sees these items instead of colliding on (templateId, position).
      await this.prisma.$transaction([
        this.prisma.inspectionTemplate.update({
          where: { id: template.id, organizationId: template.organizationId },
          data: { name: template.name },
        }),
        this.prisma.inspectionTemplateItem.deleteMany({ where }),
        this.prisma.inspectionTemplateItem.createMany({
          data: this.itemsOf(template).map((item) => ({
            ...item,
            templateId: template.id,
          })),
        }),
      ]);
    } catch (error) {
      if (nameTaken(error)) {
        throw new AlreadyExistsDomainException(
          'Inspection template already exists',
        );
      }

      throw error;
    }
  }

  async delete(organizationId: string, id: string): Promise<void> {
    await this.prisma.inspectionTemplate.deleteMany({
      where: { organizationId, id },
    });
  }

  private itemsOf(template: InspectionTemplate) {
    return template.items.map((item) => ({
      id: item.id,
      organizationId: template.organizationId,
      label: item.label,
      position: item.position,
    }));
  }

  private toDomain(
    template: PrismaInspectionTemplate & {
      items: PrismaInspectionTemplateItem[];
    },
  ): InspectionTemplate {
    return InspectionTemplate.restore(
      {
        organizationId: template.organizationId,
        name: template.name,
        createdAt: template.createdAt,
        items: template.items.map(({ id, label, position }) => ({
          id,
          label,
          position,
        })),
      },
      template.id,
    );
  }
}
