import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { WarehouseEfficiencyController } from './efficiency/warehouse-efficiency.controller';
import { WarehouseEfficiencyService } from './efficiency/warehouse-efficiency.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { WarehouseEfficiency } from './efficiency/models/warehouse-efficiency.model';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { RequestService } from 'src/request/request.service';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { BigBaseDict, BigBaseLogs, Product } from 'src/bigbase/models/product.model';
import { GdriveService } from 'src/gdrive/gdrive.service';

@Module({
  controllers: [WarehouseEfficiencyController],
  providers: [WarehouseEfficiencyService, GsheetsService, RequestService, BigbaseService, GdriveService],
  imports: [SequelizeModule.forFeature([WarehouseEfficiency, BigBaseLogs, BigBaseDict, Product]), AuthModule, UsersModule],
})

export class WarehouseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware).exclude('/warehouse/efficiency/desktop').forRoutes(WarehouseEfficiencyController);
      consumer.apply(GSheetsMiddleware).exclude('/warehouse/efficiency/desktop').forRoutes(WarehouseEfficiencyController);
  }
}
