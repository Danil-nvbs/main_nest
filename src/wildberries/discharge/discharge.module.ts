import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WbDischarge } from './models/discharge.model';
import { WbDischargeController } from './discharge.controller';
import { WbDischargeService } from './discharge.service';
import { GsheetsModule } from 'src/gsheets/gsheets.module';
import { RequestService } from 'src/request/request.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { MicroServiceMiddleware } from 'src/middlewares/microservice.middleware';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { WbDischargeLogs } from './models/discharge-logs.model';
import { TelegramBotService } from 'src/bot/bot.service';
import { JSHelperService } from 'src/JSHelper.service';
import { GdriveService } from 'src/gdrive/gdrive.service';

@Module({
    controllers: [WbDischargeController],
    providers: [
      WbDischargeService, 
      RequestService, 
      GsheetsService, 
      RegularTasksService, 
      TelegramBotService, 
      JSHelperService,
      GdriveService,
    ],
    imports: [
      SequelizeModule.forFeature([WbDischarge, WbDischargeLogs]), 
      GsheetsModule, 
      AuthModule, 
      UsersModule,
    ],
    exports: [WbDischargeService]
})
export class WbDischargeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GSheetsMiddleware).forRoutes(
      'wb/discharge/sync'
    );
    consumer.apply(AuthMiddleware).forRoutes(
      'wb/discharge/start',
      'wb/discharge/list',
    );
    consumer.apply(MicroServiceMiddleware).forRoutes(
      'wb/discharge/active/set',
      'wb/discharge/sizes/check',
      'wb/discharge/set/ignore/barcode',
      'wb/discharge/task',
      'wb/discharge/sync',
    );
  }
}
