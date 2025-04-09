import { MiddlewareConsumer, Module } from '@nestjs/common';
import { WbDischargeModule } from './discharge/discharge.module';
import { WildberriesApiController } from './api/api.controller';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { ReportsApiService } from './api/reports.service';
import { UsersModule } from 'src/users/users.module';
import { RequestService } from 'src/request/request.service';
import { PromotionsApiService } from './api/promotions.service';
import { PromotionsController } from './promotions/promotions.controller';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { PromotionsService } from './promotions/promotions.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { JSHelperService } from 'src/JSHelper.service';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { GdriveService } from 'src/gdrive/gdrive.service';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { BigbaseModule } from 'src/bigbase/bigbase.module';
import { BigBaseDict, BigBaseLogs, Product } from 'src/bigbase/models/product.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { WbDischargeService } from './discharge/discharge.service';
import { WbDischarge } from './discharge/models/discharge.model';
import { WbDischargeLogs } from './discharge/models/discharge-logs.model';
import { WbExpressConnectorService } from './api/expressConnector.service';
import { StocksController } from './stocks/stocks.controller';
import { WbStocks } from './stocks/stocks.model';
import { StocksService } from './stocks/stocks.service';
import { FbsOrdersController } from './fbs-orders/fbs-orders.controller';
import { WbFbsOrdersService } from './fbs-orders/fbs-orders.service';
import { WbFbsOrdersApiService } from './api/fbs-orders.service';
import { WbFbsOrder } from './fbs-orders/models/fbs-orders.model';
import { WbFbsStickers } from './fbs-orders/models/fbs-stickers.model';
import { WbFbsStatuses } from './fbs-orders/models/fbs-statuses.model';
import { WbFbsSuppliesApiService } from './api/fbs-supplies.service';
import { WbFbsSupply } from './fbs-orders/models/fbs-supplies.model';
@Module({
  controllers: [WildberriesApiController, PromotionsController, StocksController, FbsOrdersController],
  providers: [
    ReportsApiService,
    RequestService,
    PromotionsApiService,
    RegularTasksService,
    PromotionsService,
    GsheetsService,
    JSHelperService,
    GdriveService,
    BigbaseService,
    WbDischargeService,
    WbExpressConnectorService,
    StocksService,
    WbFbsOrdersService,
    WbFbsOrdersApiService,
    WbFbsSuppliesApiService,
  ],
  imports: [
    SequelizeModule.forFeature([
      Product,
      BigBaseDict,
      BigBaseLogs,
      WbDischarge,
      WbDischargeLogs,
      WbStocks,
      WbFbsOrder,
      WbFbsStickers,
      WbFbsStatuses,
      WbFbsSupply,
    ]),
    WbDischargeModule,
    UsersModule,
    BigbaseModule,
  ],
  exports: [
    ReportsApiService,
    RequestService,
    PromotionsApiService,
    RegularTasksService,
    PromotionsService,
    WbFbsOrdersService,
    WbExpressConnectorService,
    ReportsApiService,
  ],
})

export class WbModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(WildberriesApiController, PromotionsController, StocksController);
    consumer.apply(GSheetsMiddleware).forRoutes(PromotionsController);
  }
}