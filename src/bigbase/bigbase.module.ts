import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BigbaseController } from './bigbase.controller';
import { BigbaseService } from './bigbase.service';
import { BigBaseDict, BigBaseLogs, Product } from './models/product.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { AuthModule } from 'src/auth/auth.module';
import { RequestService } from 'src/request/request.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersModule } from 'src/users/users.module';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { GdriveService } from 'src/gdrive/gdrive.service';

@Module({
  controllers: [BigbaseController],
  providers: [BigbaseService, GsheetsService, RequestService, GdriveService],
  imports: [SequelizeModule.forFeature([Product, BigBaseDict, BigBaseLogs]), AuthModule, UsersModule],
  exports: [BigbaseService, SequelizeModule.forFeature([Product, BigBaseDict, BigBaseLogs])]
})

export class BigbaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(BigbaseController);
    consumer.apply(GSheetsMiddleware).forRoutes(BigbaseController);
  }
}
