import {
  Body,
  ConflictException,
  Controller,
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

import { CompleteInspectionUseCase } from './complete-inspection.use-case.js';
import { DiscardInspectionUseCase } from './discard-inspection.use-case.js';
import { INSPECTION_RESULTS, Inspection } from './inspection.entity.js';

// The shape of each value is checked against its question in the use case (409), not here.
const completeBodySchema = z.object({
  result: z.enum(INSPECTION_RESULTS),
  answers: z.array(
    z.object({
      itemId: z.uuid(),
      notApplicable: z.boolean().optional(),
      value: z.union([z.string(), z.boolean(), z.number()]).optional(),
      note: z.string().trim().max(500).optional(),
    }),
  ),
});

type CompleteBodySchema = z.infer<typeof completeBodySchema>;

export const presentInspection = ({
  id,
  result,
  inspectorName,
  completedAt,
  answers,
}: Inspection) => ({
  id,
  result,
  inspectorName,
  completedAt,
  answers: answers.map(({ itemId, notApplicable, value, note }) => ({
    itemId,
    notApplicable,
    value,
    note,
  })),
});

@Controller(
  '/work-orders/:workOrderId/inspection-assignments/:assignmentId/inspections',
)
export class InspectionController {
  constructor(
    private completeInspection: CompleteInspectionUseCase,
    private discardInspection: DiscardInspectionUseCase,
  ) {}

  @Roles('inspector')
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(completeBodySchema)) body: CompleteBodySchema,
    @Param('workOrderId') workOrderId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    try {
      const { inspection } = await this.completeInspection.handle({
        organizationId: user.organizationId,
        workOrderId,
        assignmentId,
        result: body.result,
        answers: body.answers,
        inspector: { id: user.sub, name: user.name },
      });

      return { inspection: presentInspection(inspection) };
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

  @Roles('inspector')
  @Post(':id/discard')
  @HttpCode(204)
  async discard(
    @CurrentUser() user: UserPayload,
    @Param('workOrderId') workOrderId: string,
    @Param('assignmentId') assignmentId: string,
    @Param('id') id: string,
  ) {
    try {
      await this.discardInspection.handle({
        organizationId: user.organizationId,
        workOrderId,
        assignmentId,
        id,
        discardedBy: user.sub,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
