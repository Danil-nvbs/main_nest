import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MagnitDischarge } from './models/discharge.model';
import { MagnitDischargeController } from './discharge.controller';
import { MagnitDischargeService } from './discharge.service';
import { GsheetsModule } from 'src/gsheets/gsheets.module';
import { RequestService } from 'src/request/request.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { MicroServiceMiddleware } from 'src/middlewares/microservice.middleware';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { MagnitDischargeLogs } from './models/discharge-logs.model';
import { TelegramBotService } from 'src/bot/bot.service';
import { JSHelperService } from 'src/JSHelper.service';
import { HttpModule } from '@nestjs/axios';
import { GdriveService } from 'src/gdrive/gdrive.service';
import { MagnitApiService } from '../api/api.service';
import { MagnitCategoriesService } from '../categories/categories.service';
import { MagnitCategories } from '../categories/models/categories.model';

@Module({
  controllers: [MagnitDischargeController],
  providers: [
    MagnitDischargeService,
    RequestService,
    GsheetsService,
    RegularTasksService,
    TelegramBotService,
    JSHelperService,
    GdriveService,
    MagnitApiService,
    MagnitCategoriesService
  ],
  imports: [
    SequelizeModule.forFeature([
      MagnitDischarge,
      MagnitCategories,
      MagnitDischargeLogs
    ]),
    GsheetsModule,
    AuthModule,
    UsersModule,
    HttpModule,
  ],
  exports:[
    MagnitDischargeService
  ]
})
export class MagnitDischargeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GSheetsMiddleware).forRoutes(
      'magnit/discharge/sync'
    );
    consumer.apply(AuthMiddleware).forRoutes(
      'magnit/discharge/start',
      'magnit/discharge/list',
    );
    consumer.apply(MicroServiceMiddleware).forRoutes(
      'magnit/discharge/active/set',
      'magnit/discharge/sizes/check',
      'magnit/discharge/set/ignore/barcode',
      'magnit/discharge/task',
      'magnit/discharge/sync',
    );
  }
}
