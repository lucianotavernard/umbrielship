import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe.js';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator.js';
import { Public } from '@/package/shared/module/auth/public.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';

import { SwitchOrganizationUseCase } from './switch-organization.use-case.js';
import { AuthenticateUserUseCase } from './authenticate-user.use-case.js';
import { GetProfileUseCase } from './get-profile.use-case.js';
import { WrongCredentialsException } from './wrong-credentials.exception.js';

const authenticateUserBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type AuthenticateUserBodySchema = z.infer<typeof authenticateUserBodySchema>;

const switchOrganizationBodySchema = z.object({
  organizationId: z.uuid(),
});

type SwitchOrganizationBodySchema = z.infer<
  typeof switchOrganizationBodySchema
>;

@Controller()
export class AuthenticationController {
  constructor(
    private authenticateUser: AuthenticateUserUseCase,
    private getProfile: GetProfileUseCase,
    private switchOrganization: SwitchOrganizationUseCase,
  ) {}

  @Public()
  @Post('/sessions')
  @UsePipes(new ZodValidationPipe(authenticateUserBodySchema))
  async create(@Body() body: AuthenticateUserBodySchema) {
    try {
      const { email, password } = body;

      const result = await this.authenticateUser.handle({ email, password });

      return {
        access_token: result.accessToken,
      };
    } catch (error) {
      if (error instanceof WrongCredentialsException) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }

  @Get('/me')
  async getMe(@CurrentUser() currentUser: UserPayload) {
    try {
      const { user } = await this.getProfile.handle(currentUser.sub);

      return { user };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Post('/organizations/switch')
  @HttpCode(204)
  async switch(
    @CurrentUser() currentUser: UserPayload,
    @Body(new ZodValidationPipe(switchOrganizationBodySchema))
    body: SwitchOrganizationBodySchema,
  ) {
    try {
      await this.switchOrganization.handle({
        userId: currentUser.sub,
        organizationId: body.organizationId,
      });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
