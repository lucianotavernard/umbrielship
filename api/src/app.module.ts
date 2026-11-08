import { Module } from '@nestjs/common';

import { CustomerModule } from './package/customer/customer.module';
import { IdentityModule } from './package/identity/identity.module';
import { AuthModule } from './package/shared/module/auth/auth.module';
import { ConfigModule } from './package/shared/module/config/config.module';
import { WorkOrderModule } from './package/work-order/work-order.module';

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
