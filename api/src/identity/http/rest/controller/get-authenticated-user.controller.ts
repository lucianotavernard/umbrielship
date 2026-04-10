import { BadRequestException, Controller, Get, InternalServerErrorException } from '@nestjs/common';

import type { AccessTokenPayload } from '@/shared/module/auth/util/auth.type';
import { CurrentUser } from '@/shared/module/auth/current-user.decorator';

import { GetUserByIdUseCase } from '@/identity/core/use-case/get-user-by-id.use-case';
import { NotFoundDomainException } from '@/shared/lib/core/exception/not-found-domain.exception';

@Controller('/whoami')
export class GetAuthenticatedUserController {
  constructor(private getUserById: GetUserByIdUseCase) {}

  @Get()
  async handle(@CurrentUser() accessTokenPayload: AccessTokenPayload) {
    try {
      const userId = accessTokenPayload.sub;

      const { user } = await this.getUserById.handle({
        id: userId,
      });

      return {
        user,
      };
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(error.message);
    }
  }
}
