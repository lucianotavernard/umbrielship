import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { z } from 'zod';

import { AlreadyExistsDomainException } from '@/package/shared/lib/exception/already-exists-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Roles } from '@/package/shared/module/auth/roles.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { CreateInspectionTemplateUseCase } from './create-inspection-template.use-case.js';
import { DeleteInspectionTemplateUseCase } from './delete-inspection-template.use-case.js';
import { EditInspectionTemplateUseCase } from './edit-inspection-template.use-case.js';
import { FetchInspectionTemplatesUseCase } from './fetch-inspection-templates.use-case.js';
import { GetInspectionTemplateByIdUseCase } from './get-inspection-template-by-id.use-case.js';
import { InspectionTemplate } from './inspection-template.entity.js';

const inspectionTemplateBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  items: z
    .array(z.object({ label: z.string().trim().min(1).max(200) }))
    .min(1)
    .max(100),
});

type InspectionTemplateBodySchema = z.infer<
  typeof inspectionTemplateBodySchema
>;

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;

const present = ({ id, name, createdAt, items }: InspectionTemplate) => ({
  id,
  name,
  createdAt,
  items: items.map(({ id, label, position }) => ({ id, label, position })),
});

@Controller('/inspection-templates')
export class InspectionTemplateController {
  constructor(
    private createInspectionTemplate: CreateInspectionTemplateUseCase,
    private deleteInspectionTemplate: DeleteInspectionTemplateUseCase,
    private editInspectionTemplate: EditInspectionTemplateUseCase,
    private fetchInspectionTemplates: FetchInspectionTemplatesUseCase,
    private getInspectionTemplateById: GetInspectionTemplateByIdUseCase,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: UserPayload,
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParamSchema,
  ) {
    const { inspectionTemplates, total } =
      await this.fetchInspectionTemplates.handle({
        organizationId: user.organizationId,
        page,
      });

    return {
      inspectionTemplates: inspectionTemplates.map(
        ({ id, name, createdAt, items }) => ({
          id,
          name,
          itemCount: items.length,
          createdAt,
        }),
      ),
      total,
    };
  }

  @Get(':id')
  async getById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    try {
      const { inspectionTemplate } =
        await this.getInspectionTemplateById.handle({
          organizationId: user.organizationId,
          id,
        });

      return { inspectionTemplate: present(inspectionTemplate) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(inspectionTemplateBodySchema))
    body: InspectionTemplateBodySchema,
  ) {
    try {
      const { inspectionTemplate } = await this.createInspectionTemplate.handle(
        {
          organizationId: user.organizationId,
          name: body.name,
          labels: body.items.map((item) => item.label),
        },
      );

      return { inspectionTemplate: present(inspectionTemplate) };
    } catch (error) {
      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Put(':id')
  async edit(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(inspectionTemplateBodySchema))
    body: InspectionTemplateBodySchema,
    @Param('id') id: string,
  ) {
    try {
      const { inspectionTemplate } = await this.editInspectionTemplate.handle({
        organizationId: user.organizationId,
        id,
        name: body.name,
        labels: body.items.map((item) => item.label),
      });

      return { inspectionTemplate: present(inspectionTemplate) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof AlreadyExistsDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    try {
      await this.deleteInspectionTemplate.handle({
        organizationId: user.organizationId,
        id,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
