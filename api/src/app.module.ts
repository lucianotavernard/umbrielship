import { Module } from '@nestjs/common';

import { ConfigModule } from '@/shared/module/config/config.module';
import { AuthModule } from '@/shared/module/auth/auth.module';
import { IdentityModule } from '@/identity/identity.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [ConfigModule, AuthModule, IdentityModule, CustomerModule],
})
export class AppModule {}
