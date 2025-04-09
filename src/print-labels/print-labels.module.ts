import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrintLabelsController } from './print-labels.controller';
import { PrintLabelsService } from './print-labels.service';
import { RequestService } from 'src/request/request.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'src/bigbase/models/product.model';
import { PrintBaseShipment, PrintBaseShipmentContent } from './models/printbase.model';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { DischargeModule } from 'src/discharge/discharge.module';
import { WbModule } from 'src/wildberries/wildberries.module';
import { WbFbsPrinted } from './models/printed-wb-fbs';

@Module({
  controllers: [PrintLabelsController],
  providers: [PrintLabelsService, RequestService],
  imports: [SequelizeModule.forFeature([PrintBaseShipment, PrintBaseShipmentContent, Product, WbFbsPrinted]),  AuthModule, UsersModule, DischargeModule, WbModule],
})

export class PrintLabelsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(PrintLabelsController);
  }
}
