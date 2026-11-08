import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception';
import { ZodValidationPipe } from '@/package/shared/lib/http/zod-validation.pipe';
import { CurrentUser } from '@/package/shared/module/auth/current-user.decorator';
import { Public } from '@/package/shared/module/auth/public';
import type { UserPayload } from '@/package/shared/module/auth/user-payload';

import { GetUserByIdUseCase } from '../user/get-user-by-id.use-case';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { WrongCredentialsException } from './wrong-credentials.exception';

const authenticateUserBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type AuthenticateUserBodySchema = z.infer<typeof authenticateUserBodySchema>;

@Controller()
export class AuthenticationController {
  constructor(
    private authenticateUser: AuthenticateUserUseCase,
    private getUserById: GetUserByIdUseCase,
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

  @Get('/whoami')
  async getUser(@CurrentUser() currentUser: UserPayload) {
    try {
      const { user } = await this.getUserById.handle({ id: currentUser.sub });

      return { user };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
