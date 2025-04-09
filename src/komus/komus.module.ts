import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { RequestService } from 'src/request/request.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersModule } from 'src/users/users.module';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { BigbaseModule } from 'src/bigbase/bigbase.module';
import { JSHelperService } from 'src/JSHelper.service';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { KomusApiController } from './api/api.controller';
import { KomusApiService } from './api/komus.service';
import { GdriveService } from 'src/gdrive/gdrive.service';

@Module({
  controllers: [KomusApiController],
  providers: [
    GsheetsService,
    RequestService,
    KomusApiService,
    JSHelperService,
    RegularTasksService,
    GdriveService,
  ],
  imports: [AuthModule, UsersModule, BigbaseModule],
})
export class KomusModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(KomusApiController);
    consumer.apply(GSheetsMiddleware).forRoutes(KomusApiController);
  }
}
