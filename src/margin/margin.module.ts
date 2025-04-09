import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MarginController } from './margin.controller';
import { MarginService } from './margin.service';
import { RequestService } from 'src/request/request.service';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { BigbaseModule } from 'src/bigbase/bigbase.module';
import { YandexModule } from 'src/yandex/yandex.module';
import { GsheetsModule } from 'src/gsheets/gsheets.module';
import { OzonModule } from 'src/ozon/ozon.module';
import { WbModule } from 'src/wildberries/wildberries.module';

@Module({
  controllers: [MarginController],
  providers: [MarginService, RequestService, RegularTasksService],
  imports: [AuthModule, UsersModule, BigbaseModule, YandexModule, GsheetsModule, OzonModule, WbModule],
})

export class MarginModule {
    configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware).forRoutes(MarginController);
      consumer.apply(GSheetsMiddleware).forRoutes(MarginController);
    }
}
