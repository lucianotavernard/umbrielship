import { Module } from '@nestjs/common';

import { CustomerModule } from './package/customer/customer.module.js';
import { IdentityModule } from './package/identity/identity.module.js';
import { AuthModule } from './package/shared/module/auth/auth.module.js';
import { ConfigModule } from './package/shared/module/config/config.module.js';
import { WorkOrderModule } from './package/work-order/work-order.module.js';

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
