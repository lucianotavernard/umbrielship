import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { ConflictDomainException } from '@/package/shared/lib/exception/conflict-domain.exception';
import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe';
import { Public } from '@/package/shared/module/auth/public';

import { InternalAdministratorGuard } from '../organization/internal-administrator.guard';
import { AcceptInvitationUseCase } from './accept-invitation.use-case';
import { ResendInvitationUseCase } from './resend-invitation.use-case';
import { SendInvitationUseCase } from './send-invitation.use-case';

const sendInvitationBodySchema = z.object({
  userId: z.uuid(),
  organizationId: z.uuid(),
  role: z.enum(['administrator', 'operator']),
});

type SendInvitationBodySchema = z.infer<typeof sendInvitationBodySchema>;

const acceptInvitationBodySchema = z.object({
  secret: z.string().min(1),
});

type AcceptInvitationBodySchema = z.infer<typeof acceptInvitationBodySchema>;

@Controller('/invitations')
export class InvitationController {
  constructor(
    private sendInvitation: SendInvitationUseCase,
    private acceptInvitation: AcceptInvitationUseCase,
    private resendInvitation: ResendInvitationUseCase,
  ) {}

  @Post()
  @UseGuards(InternalAdministratorGuard)
  @UsePipes(new ZodValidationPipe(sendInvitationBodySchema))
  async create(@Body() body: SendInvitationBodySchema) {
    try {
      const { userId, organizationId, role } = body;

      const { invitation } = await this.sendInvitation.handle({
        userId,
        organizationId,
        role,
      });

      return invitation;
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

  @Post(':id/resend')
  @HttpCode(200)
  @UseGuards(InternalAdministratorGuard)
  async resend(@Param('id') id: string) {
    try {
      const { invitation } = await this.resendInvitation.handle({
        invitationId: id,
      });

      return invitation;
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

  @Public()
  @Post('/accept')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(acceptInvitationBodySchema))
  async accept(@Body() body: AcceptInvitationBodySchema) {
    try {
      const { secret } = body;

      return await this.acceptInvitation.handle({ secret });
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
