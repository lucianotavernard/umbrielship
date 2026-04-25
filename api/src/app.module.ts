import { Module } from '@nestjs/common';

import { ConfigModule } from '@/shared/module/config/config.module';
import { AuthModule } from '@/shared/module/auth/auth.module';
import { IdentityModule } from '@/identity/identity.module';
import { CustomerModule } from './customer/customer.module';
import { WorkOrderModule } from './work-order/work-order.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    IdentityModule,
    CustomerModule,
    WorkOrderModule,
  ],
})
export class AppModule {}
