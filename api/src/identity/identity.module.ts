import { Module } from '@nestjs/common';

import { ConfigModule } from '@/shared/module/config/config.module';
import { CryptographyModule } from '@/shared/module/cryptography/cryptography.module';

import { AuthenticateUserUseCase } from './core/use-case/authenticate-user.use-case';
import { GetUserByIdUseCase } from './core/use-case/get-user-by-id.use-case';
import { IdentityPersistenceModule } from './persistence/persistence.module';
import { AuthenticateUserController } from './http/rest/controller/authenticate-user.controller';
import { GetAuthenticatedUserController } from './http/rest/controller/get-authenticated-user.controller';

@Module({
  imports: [ConfigModule, CryptographyModule, IdentityPersistenceModule],
  controllers: [AuthenticateUserController, GetAuthenticatedUserController],
  providers: [AuthenticateUserUseCase, GetUserByIdUseCase],
})
export class IdentityModule {}
