import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DischargeController } from './discharge.controller';
import { DischargeService } from './discharge.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { OzonModule } from 'src/ozon/ozon.module';
import { AuthModule } from 'src/auth/auth.module';
import { RequestService } from 'src/request/request.service';
import { UsersModule } from 'src/users/users.module';
import { WbDischargeModule } from 'src/wildberries/discharge/discharge.module';

@Module({
  controllers: [DischargeController],
  providers: [DischargeService, RequestService],
  imports: [OzonModule, WbDischargeModule, AuthModule, UsersModule],
  exports: [DischargeService]
})

export class DischargeModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(DischargeController);
  }
}
