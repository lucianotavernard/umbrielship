import { Module } from '@nestjs/common';

import { ConfigModule } from '@/package/shared/module/config/config.module';
import { CryptographyModule } from '@/package/shared/module/cryptography/cryptography.module';
import { PrismaModule } from '@/package/shared/module/prisma/prisma.module';

import { AuthenticateUserUseCase } from './auth/authenticate-user.use-case';
import { AuthenticationController } from './auth/authentication.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { IUsersRepository } from './user/contracts/user-repository.contract';
import { GetUserByIdUseCase } from './user/get-user-by-id.use-case';
import { PrismaUsersRepository } from './user/user.repository';

@Module({
  imports: [ConfigModule, CryptographyModule, PrismaModule],
  controllers: [AuthenticationController],
  providers: [
    JwtStrategy,
    AuthenticateUserUseCase,
    GetUserByIdUseCase,
    { provide: IUsersRepository, useClass: PrismaUsersRepository },
  ],
})
export class IdentityModule {}
