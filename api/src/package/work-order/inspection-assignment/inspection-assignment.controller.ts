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
} from '@nestjs/common';
import { z } from 'zod';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception.js';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Roles } from '@/package/shared/module/auth/roles.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { AssignInspectionTemplateUseCase } from './assign-inspection-template.use-case.js';
import { FetchInspectionAssignmentsUseCase } from './fetch-inspection-assignments.use-case.js';
import { presentInspection } from '../inspection/inspection.controller.js';
import { InspectionAssignment } from './inspection-assignment.entity.js';
import { RemoveInspectionAssignmentUseCase } from './remove-inspection-assignment.use-case.js';

const assignBodySchema = z.object({
  templateId: z.uuid(),
  serviceId: z.uuid().optional(),
});

type AssignBodySchema = z.infer<typeof assignBodySchema>;

const present = ({
  id,
  templateName,
  service,
  createdAt,
  items,
  removable,
  inspections,
}: InspectionAssignment) => ({
  id,
  templateName,
  service,
  createdAt,
  removable,
  inspections: inspections.map(presentInspection),
  items: items.map(({ id, label, position, type }) => ({
    id,
    label,
    position,
    type,
  })),
});

@Controller('/work-orders/:workOrderId/inspection-assignments')
export class InspectionAssignmentController {
  constructor(
    private assignInspectionTemplate: AssignInspectionTemplateUseCase,
    private fetchInspectionAssignments: FetchInspectionAssignmentsUseCase,
    private removeInspectionAssignment: RemoveInspectionAssignmentUseCase,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: UserPayload,
    @Param('workOrderId') workOrderId: string,
  ) {
    try {
      const { inspectionAssignments } =
        await this.fetchInspectionAssignments.handle({
          organizationId: user.organizationId,
          workOrderId,
        });

      return { inspectionAssignments: inspectionAssignments.map(present) };
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
    @Body(new ZodValidationPipe(assignBodySchema)) body: AssignBodySchema,
    @Param('workOrderId') workOrderId: string,
  ) {
    try {
      const { inspectionAssignment } =
        await this.assignInspectionTemplate.handle({
          organizationId: user.organizationId,
          workOrderId,
          templateId: body.templateId,
          serviceId: body.serviceId,
          assignedBy: user.sub,
        });

      return { inspectionAssignment: present(inspectionAssignment) };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Roles('administrator')
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @CurrentUser() user: UserPayload,
    @Param('workOrderId') workOrderId: string,
    @Param('id') id: string,
  ) {
    try {
      await this.removeInspectionAssignment.handle({
        organizationId: user.organizationId,
        workOrderId,
        id,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof ConflictDomainException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }
}
