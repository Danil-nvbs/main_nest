import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FeedbacksApiService } from './api/feedbacks.service';
import { GsheetsService } from 'src/gsheets/gsheets.service';
import { RequestService } from 'src/request/request.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UsersModule } from 'src/users/users.module';
import { GSheetsMiddleware } from 'src/gsheets/gsheets.middleware';
import { OzonApiController } from './api/api.controller';
import { AuthModule } from 'src/auth/auth.module';
import { FeedbacksAndQuestionsController } from './feedbacks/feedbacksAndQuestion.controller';
import { OzonDischargeService } from './discharge/discharge.service';
import { BigbaseService } from 'src/bigbase/bigbase.service';
import { BigBaseDict, BigBaseLogs, Product } from 'src/bigbase/models/product.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { OzonFeedbacksAndQuestions } from './feedbacks/models/feedbacksAndQueations.model';
import { BigbaseModule } from 'src/bigbase/bigbase.module';
import { QuestionsApiService } from './api/question.service';
import { FeedbacksAndQuestionService } from './feedbacks/feedbacksAndQuestion.service';
import { JSHelperService } from 'src/JSHelper.service';
import { RegularTasksService } from 'src/regular-tasks/regular-tasks.service';
import { OzonOrdersApiService } from './api/orders.service';
import { GdriveService } from 'src/gdrive/gdrive.service';
import { OzonExpressConnectorService } from './expressConnector.service';
import { StocksApiService } from './api/stocks.service';

@Module({
  controllers: [OzonApiController, FeedbacksAndQuestionsController,],
  providers: [
    GsheetsService,
    RequestService,
    FeedbacksApiService,
    OzonOrdersApiService,
    QuestionsApiService,
    OzonDischargeService,
    BigbaseService,
    FeedbacksAndQuestionService,
    JSHelperService,
    RegularTasksService,
    GdriveService,
    OzonExpressConnectorService,
    StocksApiService,
  ],
  imports: [SequelizeModule.forFeature([Product, OzonFeedbacksAndQuestions, BigBaseDict, BigBaseLogs]), AuthModule, UsersModule, BigbaseModule],
  exports: [OzonDischargeService, OzonExpressConnectorService, OzonOrdersApiService, StocksApiService]
})
export class OzonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(OzonApiController, FeedbacksAndQuestionsController);
    consumer.apply(GSheetsMiddleware).forRoutes(OzonApiController, FeedbacksAndQuestionsController);
  }
}
