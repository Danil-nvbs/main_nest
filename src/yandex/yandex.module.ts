import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { RequestService } from 'src/request/request.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersModule } from 'src/users/users.module';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { BigbaseModule } from 'src/bigbase/bigbase.module';
import { JSHelperService } from 'src/JSHelper.service';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { YandexApiController } from './api/api.controller';
import { GdriveService } from 'src/gdrive/gdrive.service';
import { YandexPricesApiService } from './api/prices.service';
import { YandexOrdersApiService } from './api/orders.serivce';
import { YandexStocksApiService } from './api/stocks.service';
import { YandexExpressConnectorService } from './expressConnector.service';

@Module({
  controllers: [],
  providers: [
    GsheetsService,
    RequestService,
    BigbaseService,
    JSHelperService,
    RegularTasksService,
    GdriveService,
    YandexExpressConnectorService,
    YandexPricesApiService,
    YandexStocksApiService,
    YandexOrdersApiService
  ],
  imports: [AuthModule, UsersModule, BigbaseModule ],
  exports: [YandexExpressConnectorService, YandexPricesApiService, YandexStocksApiService, YandexOrdersApiService]
})
export class YandexModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(YandexApiController);
    consumer.apply(GSheetsMiddleware).forRoutes(YandexApiController);
  }
}
