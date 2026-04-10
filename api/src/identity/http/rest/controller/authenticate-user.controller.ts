import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { Public } from '@/shared/module/auth/public';
import { ZodValidationPipe } from '@/shared/lib/http/pipe/zod-validation.pipe';

import { AuthenticateUserUseCase } from '@/identity/core/use-case/authenticate-user.use-case';
import { WrongCredentialsException } from '@/identity/core/exception/wrong-credentials.exception';

const authenticateUserBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type AuthenticateUserBodySchema = z.infer<typeof authenticateUserBodySchema>;

@Public()
@Controller('/sessions')
export class AuthenticateUserController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateUserBodySchema))
  async handle(@Body() body: AuthenticateUserBodySchema) {
    try {
      const { email, password } = body;

      const result = await this.authenticateUser.handle({
        email,
        password,
      });

      return {
        access_token: result.accessToken,
      };
    } catch (error) {
      if (error instanceof WrongCredentialsException) {
        throw new UnauthorizedException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
