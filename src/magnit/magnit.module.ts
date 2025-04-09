import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MagnitApiController } from "./api/api.controller";
import { AuthMiddleware } from "src/auth/auth.middleware";
import { GSheetsMiddleware } from "src/gsheets/gsheets.middleware";
import { MagnitApiService } from "./api/api.service";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { RequestService } from "src/request/request.service";
import { JSHelperService } from "src/JSHelper.service";
import { GsheetsService } from "src/gsheets/gsheets.service";
import { GdriveService } from "src/gdrive/gdrive.service";
import { MagnitShipmentController } from "./shipments/shipments.controller";
import { ShipmentsService } from "./shipments/shipments.service";
import { MagnitDischargeModule } from "./discharge/discharge.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { MagnitDischarge } from "./discharge/models/discharge.model";
import { MagnitDischargeLogs } from "./discharge/models/discharge-logs.model";
import { MagnitCategoriesController } from "./categories/categories.controller";
import { MagnitCategoriesService } from "./categories/categories.service";
import { MagnitCategories } from "./categories/models/categories.model";
import { MagnitDischargeService } from "./discharge/discharge.service";
import { HttpService } from "@nestjs/axios";




@Module({
    controllers: [MagnitApiController, MagnitShipmentController, MagnitCategoriesController],
    providers: [
        MagnitApiService,
        RequestService,
        JSHelperService,
        GsheetsService,
        GdriveService,
        ShipmentsService,
        MagnitCategoriesService,
    ],
    imports: [
        SequelizeModule.forFeature([
            MagnitDischarge,
            MagnitDischargeLogs,
            MagnitCategories,
        ]),
        AuthModule,
        UsersModule,
        MagnitDischargeModule
    ]
})
export class MagnitModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(MagnitApiController, MagnitShipmentController, MagnitCategoriesController);
        consumer.apply(GSheetsMiddleware).forRoutes(MagnitApiController, MagnitShipmentController, MagnitCategoriesController);
    }
}